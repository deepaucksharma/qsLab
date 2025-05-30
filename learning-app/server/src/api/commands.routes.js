const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const SecurityManager = require('../../SecurityManager');
const RedisService = require('../services/RedisService');

const router = express.Router();
const securityManager = new SecurityManager();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validate a command
router.post('/validate', authenticate, [
  body('command').notEmpty().trim(),
  validate
], async (req, res) => {
  try {
    const { command } = req.body;
    
    const validation = await securityManager.validateCommand(command, {
      role: req.user.role,
      permissions: req.user.permissions || []
    });

    // Log validation attempt
    await RedisService.addCommandHistory(req.user.id, command, {
      validated: validation.allowed,
      reason: validation.reason
    });

    res.json(validation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get command templates
router.get('/templates/:category', authenticate, async (req, res) => {
  try {
    const { category } = req.params;
    
    const templates = getCommandTemplates(category, req.user.role);
    
    res.json({ templates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get command history
router.get('/history', authenticate, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const history = await RedisService.getCommandHistory(
      req.user.id, 
      parseInt(limit)
    );
    
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get command suggestions (autocomplete)
router.get('/suggestions', authenticate, async (req, res) => {
  try {
    const { prefix = '' } = req.query;
    
    const suggestions = getCommandSuggestions(prefix, req.user.role);
    
    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
function getCommandTemplates(category, userRole) {
  const templates = {
    kafka: {
      basic: [
        {
          name: 'List Topics',
          command: 'kafka-topics --list --bootstrap-server localhost:9092',
          description: 'List all topics in the Kafka cluster'
        },
        {
          name: 'Create Topic',
          command: 'kafka-topics --create --topic $TOPIC_NAME --partitions 3 --replication-factor 1 --bootstrap-server localhost:9092',
          description: 'Create a new topic with 3 partitions'
        },
        {
          name: 'Describe Topic',
          command: 'kafka-topics --describe --topic $TOPIC_NAME --bootstrap-server localhost:9092',
          description: 'Get detailed information about a topic'
        },
        {
          name: 'Console Producer',
          command: 'kafka-console-producer --topic $TOPIC_NAME --bootstrap-server localhost:9092',
          description: 'Start producing messages to a topic'
        },
        {
          name: 'Console Consumer',
          command: 'kafka-console-consumer --topic $TOPIC_NAME --from-beginning --bootstrap-server localhost:9092',
          description: 'Start consuming messages from a topic'
        }
      ],
      advanced: [
        {
          name: 'Consumer Groups',
          command: 'kafka-consumer-groups --list --bootstrap-server localhost:9092',
          description: 'List all consumer groups'
        },
        {
          name: 'Reset Consumer Offset',
          command: 'kafka-consumer-groups --reset-offsets --group $GROUP_ID --topic $TOPIC_NAME --to-earliest --execute --bootstrap-server localhost:9092',
          description: 'Reset consumer group offset to earliest'
        },
        {
          name: 'Check Log Segments',
          command: 'kafka-log-dirs --describe --bootstrap-server localhost:9092',
          description: 'Check log directory usage'
        }
      ]
    },
    monitoring: {
      basic: [
        {
          name: 'JMX Metrics',
          command: 'echo "beans" | java -jar jmxterm.jar -l localhost:9999',
          description: 'List available JMX beans'
        },
        {
          name: 'Topic Metrics',
          command: 'kafka-run-class kafka.tools.JmxTool --object-name kafka.server:type=BrokerTopicMetrics,name=MessagesInPerSec',
          description: 'Get messages in per second metric'
        }
      ]
    },
    docker: {
      basic: [
        {
          name: 'Container List',
          command: 'docker ps',
          description: 'List running containers'
        },
        {
          name: 'Container Logs',
          command: 'docker logs --tail 50 $CONTAINER_NAME',
          description: 'View container logs'
        },
        {
          name: 'Container Stats',
          command: 'docker stats --no-stream $CONTAINER_NAME',
          description: 'View container resource usage'
        }
      ]
    }
  };

  const userTemplates = templates[category] || {};
  
  // Filter based on role
  if (userRole === 'student') {
    return userTemplates.basic || [];
  }
  
  return [
    ...(userTemplates.basic || []),
    ...(userTemplates.advanced || [])
  ];
}

function getCommandSuggestions(prefix, userRole) {
  const allCommands = [
    // Kafka commands
    'kafka-topics',
    'kafka-console-producer',
    'kafka-console-consumer',
    'kafka-consumer-groups',
    'kafka-configs',
    'kafka-log-dirs',
    'kafka-broker-api-versions',
    
    // Docker commands
    'docker ps',
    'docker logs',
    'docker stats',
    'docker exec',
    
    // Common shell commands
    'ls',
    'cd',
    'pwd',
    'echo',
    'cat',
    'grep',
    'tail',
    'head',
    'wc',
    'sort',
    'uniq'
  ];

  // Filter commands based on prefix
  const filtered = allCommands.filter(cmd => 
    cmd.toLowerCase().startsWith(prefix.toLowerCase())
  );

  // Add common flags based on the command
  const suggestions = [];
  filtered.forEach(cmd => {
    suggestions.push(cmd);
    
    if (cmd === 'kafka-topics' && prefix.includes('kafka-topics')) {
      suggestions.push(
        `${cmd} --list`,
        `${cmd} --create --topic`,
        `${cmd} --describe --topic`,
        `${cmd} --delete --topic`
      );
    } else if (cmd === 'docker' && prefix.includes('docker')) {
      suggestions.push(
        `${cmd} ps`,
        `${cmd} ps -a`,
        `${cmd} logs`,
        `${cmd} stats`
      );
    }
  });

  return suggestions.slice(0, 10); // Limit to 10 suggestions
}

module.exports = router;