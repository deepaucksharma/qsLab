const express = require('express');
const { authenticate } = require('../middleware/auth');
const ContainerService = require('../services/ContainerService');
const { Progress } = require('../db/models');

const router = express.Router();

// Lab definitions (in production, store in database)
const LABS = {
  week1: {
    id: 'week1',
    title: 'The X-Ray Technician',
    description: 'Learn Kafka fundamentals and monitoring basics',
    exercises: [
      {
        id: 'exercise1',
        title: 'Metric X-Ray Vision',
        description: 'Explore Kafka JMX metrics',
        duration: 30,
        difficulty: 'beginner'
      },
      {
        id: 'exercise2',
        title: 'JMX Exploration',
        description: 'Deep dive into JMX metrics',
        duration: 45,
        difficulty: 'intermediate'
      }
    ]
  },
  week2: {
    id: 'week2',
    title: 'The Builder',
    description: 'Create custom monitoring integrations',
    exercises: [
      {
        id: 'exercise1',
        title: 'Missing Metrics Hunt',
        description: 'Identify and collect missing metrics',
        duration: 40,
        difficulty: 'intermediate'
      }
    ]
  },
  week3: {
    id: 'week3',
    title: 'The Optimizer',
    description: 'Performance tuning and optimization',
    exercises: []
  },
  week4: {
    id: 'week4',
    title: 'The Detective',
    description: 'Troubleshooting and root cause analysis',
    exercises: []
  },
  week5: {
    id: 'week5',
    title: 'The Architect',
    description: 'Design monitoring solutions',
    exercises: []
  }
};

// Get all labs
router.get('/', authenticate, async (req, res) => {
  try {
    // Get user progress for each lab
    const userProgress = await Progress.findAll({
      where: { userId: req.user.id },
      attributes: ['weekId', 'exerciseId', 'status', 'score']
    });

    // Build progress map
    const progressMap = {};
    userProgress.forEach(p => {
      if (!progressMap[p.weekId]) {
        progressMap[p.weekId] = {};
      }
      progressMap[p.weekId][p.exerciseId] = {
        status: p.status,
        score: p.score
      };
    });

    // Add progress to labs
    const labsWithProgress = Object.values(LABS).map(lab => {
      const labProgress = progressMap[lab.id] || {};
      const exercises = lab.exercises.map(ex => ({
        ...ex,
        progress: labProgress[ex.id] || { status: 'not_started', score: null }
      }));

      // Calculate completion percentage
      const completedCount = exercises.filter(ex => 
        ex.progress.status === 'completed'
      ).length;
      const completionPercentage = exercises.length > 0 
        ? Math.round((completedCount / exercises.length) * 100)
        : 0;

      return {
        ...lab,
        exercises,
        progress: {
          completionPercentage,
          completedExercises: completedCount,
          totalExercises: exercises.length
        }
      };
    });

    res.json({ labs: labsWithProgress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific lab
router.get('/:weekId', authenticate, async (req, res) => {
  try {
    const { weekId } = req.params;
    const lab = LABS[weekId];

    if (!lab) {
      return res.status(404).json({ error: 'Lab not found' });
    }

    // Get user progress
    const userProgress = await Progress.findAll({
      where: { 
        userId: req.user.id,
        weekId 
      }
    });

    const progressMap = {};
    userProgress.forEach(p => {
      progressMap[p.exerciseId] = {
        status: p.status,
        score: p.score,
        timeSpent: p.timeSpent,
        attempts: p.attempts,
        completedAt: p.completedAt
      };
    });

    // Add progress to exercises
    const exercisesWithProgress = lab.exercises.map(ex => ({
      ...ex,
      progress: progressMap[ex.id] || { 
        status: 'not_started', 
        score: null,
        timeSpent: 0,
        attempts: 0
      }
    }));

    res.json({
      lab: {
        ...lab,
        exercises: exercisesWithProgress
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start a lab (creates Kafka environment)
router.post('/:weekId/start', authenticate, async (req, res) => {
  try {
    const { weekId } = req.params;
    const lab = LABS[weekId];

    if (!lab) {
      return res.status(404).json({ error: 'Lab not found' });
    }

    // Check if environment already exists
    const existingEnv = await ContainerService.getEnvironmentStatus(req.user.id, weekId);
    
    if (existingEnv.status === 'running') {
      return res.json({ 
        message: 'Lab environment already running',
        environment: existingEnv.environment
      });
    }

    // Create Kafka environment
    const environment = await ContainerService.createKafkaEnvironment(req.user.id, weekId);

    // Create initial topics based on week
    const topics = getTopicsForWeek(weekId);
    if (topics.length > 0) {
      await ContainerService.createTopics(req.user.id, weekId, topics);
    }

    res.json({
      message: 'Lab environment created successfully',
      environment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stop a lab
router.post('/:weekId/stop', authenticate, async (req, res) => {
  try {
    const { weekId } = req.params;

    await ContainerService.stopEnvironment(req.user.id, weekId);

    res.json({
      message: 'Lab environment stopped successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get lab environment status
router.get('/:weekId/status', authenticate, async (req, res) => {
  try {
    const { weekId } = req.params;

    const status = await ContainerService.getEnvironmentStatus(req.user.id, weekId);

    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Execute command in lab environment
router.post('/:weekId/execute', authenticate, async (req, res) => {
  try {
    const { weekId } = req.params;
    const { command } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }

    const result = await ContainerService.executeKafkaCommand(req.user.id, weekId, command);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get lab metrics
router.get('/:weekId/metrics', authenticate, async (req, res) => {
  try {
    const { weekId } = req.params;

    const metrics = await ContainerService.getEnvironmentMetrics(req.user.id, weekId);

    res.json({ metrics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to get topics for each week
function getTopicsForWeek(weekId) {
  const topicsByWeek = {
    week1: [
      { name: 'events', partitions: 3 },
      { name: 'metrics', partitions: 1 },
      { name: 'test-topic', partitions: 3 }
    ],
    week2: [
      { name: 'user-events', partitions: 6 },
      { name: 'system-metrics', partitions: 3 },
      { name: 'dead-letter-queue', partitions: 1 }
    ],
    week3: [
      { name: 'high-throughput', partitions: 12 },
      { name: 'compact-topic', partitions: 3 },
      { name: 'retention-test', partitions: 3 }
    ]
  };

  return topicsByWeek[weekId] || [];
}

module.exports = router;