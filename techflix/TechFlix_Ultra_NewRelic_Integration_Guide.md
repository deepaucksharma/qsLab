# TechFlix Ultra: New Relic Integration Implementation Guide
## Seasons 2 & 3: Monitoring Kafka Share Groups with New Relic

---

## Season 2: Extracting Share Group Metrics

### Episode 2.1: JMX Deep Dive (kafka-jmx-exploration)

#### Episode Structure
```javascript
// index.js
import { EpisodePlugin } from '../../core/EpisodePlugin';
import JMXExplorerScene from './scenes/JMXExplorerScene';
import MBeanNavigatorScene from './scenes/MBeanNavigatorScene';
import MetricsVisualizerScene from './scenes/MetricsVisualizerScene';

export default class KafkaJMXExplorationEpisode extends EpisodePlugin {
  getMetadata() {
    return {
      id: 'kafka-jmx-exploration',
      title: 'Peeking Inside Kafka: JMX Metrics',
      description: 'Master JMX to extract critical Share Group metrics from Kafka',
      seasonNumber: 2,
      episodeNumber: 1,
      duration: 225, // 3:45
      level: 'Advanced',
      tags: ['kafka', 'jmx', 'monitoring', 'metrics'],
      prerequisites: ['Understanding of Kafka Share Groups', 'Basic JMX knowledge'],
      learningOutcomes: [
        'Navigate Kafka\'s JMX MBean structure',
        'Identify Share Group specific MBeans',
        'Extract RecordsUnacked and OldestUnackedMs metrics'
      ]
    };
  }

  getScenes() {
    return [
      {
        id: 'jmx-intro',
        type: 'content',
        component: JMXExplorerScene,
        title: 'JMX: Kafka\'s Internal Telemetry',
        duration: 75,
        mood: 'technical-deep-dive',
        narration: 'Kafka reveals its vital signs via JMX...'
      },
      {
        id: 'mbean-navigation',
        type: 'interactive',
        component: MBeanNavigatorScene,
        title: 'Navigating Share Group MBeans',
        duration: 90,
        mood: 'technical-deep-dive',
        interactiveElements: [{
          type: 'tree-navigation',
          allowExpand: true,
          highlightPaths: [
            'kafka.server:type=share-group-metrics'
          ]
        }]
      },
      {
        id: 'metrics-extraction',
        type: 'demo',
        component: MetricsVisualizerScene,
        title: 'Extracting Key Metrics',
        duration: 60,
        mood: 'technical-deep-dive'
      }
    ];
  }
}
```

#### JMX Explorer Scene Implementation
```javascript
// scenes/JMXExplorerScene.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import JMXTreeVisualization from '../components/JMXTreeVisualization';
import CodeHighlight from '../components/CodeHighlight';

const JMXExplorerScene = ({ time, duration }) => {
  const [expandedNodes, setExpandedNodes] = useState([]);
  const [highlightedMetric, setHighlightedMetric] = useState(null);

  // JMX tree structure for Share Groups
  const jmxTree = {
    'kafka.server': {
      'type=share-group-metrics': {
        attributes: [
          'RecordsUnacked',
          'OldestUnackedMessageAgeMs',
          'ShareGroupState',
          'ActiveConsumerCount'
        ],
        children: {
          'group=share-order-processor': {
            'topic=orders': {
              'partition=0': {
                RecordsUnacked: 245,
                OldestUnackedMessageAgeMs: 15234
              }
            }
          }
        }
      }
    }
  };

  // Time-based reveals
  useEffect(() => {
    if (time > 10) setExpandedNodes(['kafka.server']);
    if (time > 20) setExpandedNodes(prev => [...prev, 'type=share-group-metrics']);
    if (time > 30) setHighlightedMetric('RecordsUnacked');
    if (time > 45) setHighlightedMetric('OldestUnackedMessageAgeMs');
  }, [time]);

  const jmxCommand = `
# Connect to Kafka JMX port
jconsole localhost:9999

# Or use JMX command line
java -jar jmxterm.jar --url localhost:9999
> domain kafka.server
> bean kafka.server:type=share-group-metrics,group=*,topic=*,partition=*
> get RecordsUnacked
  `;

  return (
    <div className="jmx-explorer-scene">
      <div className="scene-header">
        <h2>Kafka JMX Metrics Explorer</h2>
        <div className="connection-status">
          <span className="status-indicator active" />
          Connected to localhost:9999
        </div>
      </div>

      <div className="content-grid">
        <div className="jmx-tree-panel">
          <JMXTreeVisualization
            tree={jmxTree}
            expandedNodes={expandedNodes}
            highlightedMetric={highlightedMetric}
            onNodeClick={(node) => setExpandedNodes([...expandedNodes, node])}
          />
        </div>

        <div className="details-panel">
          {highlightedMetric && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="metric-details"
            >
              <h3>{highlightedMetric}</h3>
              <MetricDescription metric={highlightedMetric} />
              <LiveMetricValue 
                metric={highlightedMetric}
                value={getMetricValue(jmxTree, highlightedMetric)}
              />
            </motion.div>
          )}
        </div>
      </div>

      {time > 50 && (
        <div className="command-example">
          <h3>Accessing JMX Metrics</h3>
          <CodeHighlight code={jmxCommand} language="bash" />
        </div>
      )}
    </div>
  );
};

const MetricDescription = ({ metric }) => {
  const descriptions = {
    RecordsUnacked: 'Number of messages awaiting acknowledgment in the Share Group',
    OldestUnackedMessageAgeMs: 'Age of the oldest unacknowledged message in milliseconds',
    ShareGroupState: 'Current state of the Share Group (ACTIVE, REBALANCING, etc.)',
    ActiveConsumerCount: 'Number of active consumers in the Share Group'
  };

  return (
    <div className="metric-description">
      <p>{descriptions[metric]}</p>
      <div className="metric-importance">
        <span className="importance-icon">⚠️</span>
        Critical for monitoring Share Group health
      </div>
    </div>
  );
};
```

---

### Episode 2.2: Prometheus JMX Exporter Setup

#### Configuration Scene Component
```javascript
// scenes/PrometheusConfigScene.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import YAMLEditor from '../components/YAMLEditor';
import ArchitectureDiagram from '../components/ArchitectureDiagram';

const PrometheusConfigScene = ({ time, duration }) => {
  const [configStep, setConfigStep] = useState('architecture');
  
  useEffect(() => {
    if (time < 20) setConfigStep('architecture');
    else if (time < 50) setConfigStep('yaml-config');
    else setConfigStep('verification');
  }, [time]);

  const jmxExporterConfig = `
# Share Groups JMX Exporter Configuration
hostPort: localhost:9999
lowercaseOutputName: true
lowercaseOutputLabelNames: true

rules:
  # Share Group Core Metrics
  - pattern: 'kafka.server<type=share-group-metrics, group=(.+), topic=(.+), partition=(.+)><>RecordsUnacked'
    name: kafka_sharegroup_records_unacked
    type: GAUGE
    labels:
      group: "$1"
      topic: "$2"
      partition: "$3"
    help: "Number of unacknowledged records in share group"

  - pattern: 'kafka.server<type=share-group-metrics, group=(.+), topic=(.+), partition=(.+)><>OldestUnackedMessageAgeMs'
    name: kafka_sharegroup_oldest_unacked_ms
    type: GAUGE
    labels:
      group: "$1"
      topic: "$2"
      partition: "$3"
    help: "Age of oldest unacknowledged message"

  # Share Group State Metrics
  - pattern: 'kafka.server<type=share-group-coordinator-metrics, group=(.+)><>group-state'
    name: kafka_sharegroup_state
    type: GAUGE
    labels:
      group: "$1"
    valueFactor: 1
    help: "Share group state (1=Active, 2=Rebalancing, 3=Dead)"

  # Consumer Count Metrics
  - pattern: 'kafka.server<type=share-group-metrics, group=(.+)><>active-consumer-count'
    name: kafka_sharegroup_active_consumers
    type: GAUGE
    labels:
      group: "$1"
    help: "Number of active consumers in share group"
`;

  const dockerRunCommand = `
# Run JMX Exporter as sidecar
docker run -d \\
  --name kafka-jmx-exporter \\
  -p 9404:9404 \\
  -v $(pwd)/jmx-exporter.yml:/config.yml \\
  prom/jmx-exporter:latest \\
  -javaagent:/jmx_prometheus_javaagent.jar=9404:/config.yml
`;

  return (
    <div className="prometheus-config-scene">
      <AnimatePresence mode="wait">
        {configStep === 'architecture' && (
          <motion.div key="arch" className="architecture-view">
            <h2>Prometheus JMX Exporter Architecture</h2>
            <ArchitectureDiagram 
              components={[
                { id: 'kafka', label: 'Kafka Broker', icon: '⚙️', color: '#5E35B1' },
                { id: 'jmx', label: 'JMX Port 9999', icon: '📊', color: '#FFD600' },
                { id: 'exporter', label: 'JMX Exporter', icon: '🔄', color: '#43A047' },
                { id: 'prometheus', label: 'Prometheus', icon: '📈', color: '#039BE5' }
              ]}
              connections={[
                { from: 'kafka', to: 'jmx', label: 'Exposes' },
                { from: 'jmx', to: 'exporter', label: 'Scrapes' },
                { from: 'exporter', to: 'prometheus', label: '/metrics' }
              ]}
              animated={true}
            />
          </motion.div>
        )}

        {configStep === 'yaml-config' && (
          <motion.div key="yaml" className="yaml-config-view">
            <h2>JMX Exporter Configuration</h2>
            <YAMLEditor
              content={jmxExporterConfig}
              highlights={[
                { line: 8, label: 'Share Group pattern' },
                { line: 9, label: 'Prometheus metric name' },
                { line: 12, label: 'Dynamic labels' }
              ]}
              editable={false}
            />
            <div className="config-explanation">
              <p>Key patterns extract Share Group metrics with proper labels</p>
            </div>
          </motion.div>
        )}

        {configStep === 'verification' && (
          <motion.div key="verify" className="verification-view">
            <h2>Verify Metrics Export</h2>
            <CodeHighlight code={dockerRunCommand} language="bash" />
            
            <div className="metrics-preview">
              <h3>Sample /metrics output:</h3>
              <pre className="metrics-output">
{`# HELP kafka_sharegroup_records_unacked Number of unacknowledged records
# TYPE kafka_sharegroup_records_unacked gauge
kafka_sharegroup_records_unacked{group="share-orders",topic="orders",partition="0"} 245
kafka_sharegroup_records_unacked{group="share-orders",topic="orders",partition="1"} 189
kafka_sharegroup_records_unacked{group="share-orders",topic="orders",partition="2"} 512`}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
```

---

## Season 3: New Relic Integration

### Episode 3.1: Custom OHI Development

#### OHI Builder Scene
```javascript
// scenes/OHIBuilderScene.jsx
import React, { useState } from 'react';
import CodeEditor from '../components/CodeEditor';
import FileTree from '../components/FileTree';
import TerminalOutput from '../components/TerminalOutput';

const OHIBuilderScene = ({ time, duration }) => {
  const [activeFile, setActiveFile] = useState('main.go');
  const [buildStatus, setBuildStatus] = useState('ready');

  const ohiFiles = {
    'kafka-sharegroups-ohi/': {
      'main.go': ohiMainGo,
      'config.yml': ohiConfigYml,
      'Dockerfile': dockerfile,
      'Makefile': makefile
    }
  };

  const ohiMainGo = `
package main

import (
    "context"
    "fmt"
    "log"
    "time"
    
    "github.com/newrelic/infra-integrations-sdk/v4/integration"
    "github.com/prometheus/client_golang/api"
    v1 "github.com/prometheus/client_golang/api/prometheus/v1"
    "github.com/prometheus/common/model"
)

const (
    integrationName    = "com.newrelic.kafka.sharegroups"
    integrationVersion = "1.0.0"
)

type ShareGroupMetrics struct {
    Group                string
    Topic                string
    Partition            string
    RecordsUnacked       float64
    OldestUnackedAgeMs   float64
    ActiveConsumerCount  int
}

func main() {
    // Create New Relic integration
    i, err := integration.New(integrationName, integrationVersion)
    if err != nil {
        log.Fatal(err)
    }

    // Connect to Prometheus endpoint
    client, err := api.NewClient(api.Config{
        Address: "http://localhost:9404",
    })
    if err != nil {
        log.Fatal(err)
    }

    v1api := v1.NewAPI(client)
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    // Query Share Group metrics
    metrics, err := queryShareGroupMetrics(ctx, v1api)
    if err != nil {
        log.Fatal(err)
    }

    // Create QueueSample events
    for _, metric := range metrics {
        entity, err := i.Entity("kafka-sharegroup", 
            fmt.Sprintf("%s:%s", metric.Topic, metric.Group))
        if err != nil {
            log.Printf("Error creating entity: %v", err)
            continue
        }

        // Create QueueSample event
        event := entity.NewEvent("QueueSample")
        
        // Required attributes for Queues & Streams UI
        event.SetAttribute("provider", "kafka-sharegroup")
        event.SetAttribute("queue.name", 
            fmt.Sprintf("%s:%s", metric.Topic, metric.Group))
        event.SetAttribute("share.group.name", metric.Group)
        event.SetAttribute("topic.name", metric.Topic)
        event.SetAttribute("partition", metric.Partition)
        
        // Core metrics
        event.SetAttribute("queue.depth", metric.RecordsUnacked)
        event.SetAttribute("queue.oldestMessageAgeSeconds", 
            metric.OldestUnackedAgeMs/1000)
        
        // Additional attributes
        event.SetAttribute("consumers.active", metric.ActiveConsumerCount)
        event.SetAttribute("kafka.version", "4.0")
        
        // Performance metrics
        event.SetAttribute("messages.unacked", metric.RecordsUnacked)
        event.SetAttribute("processing.latencyMs", 
            calculateProcessingLatency(metric))
    }

    // Publish to New Relic
    if err := i.Publish(); err != nil {
        log.Fatal(err)
    }
}

func queryShareGroupMetrics(ctx context.Context, api v1.API) ([]ShareGroupMetrics, error) {
    var metrics []ShareGroupMetrics
    
    // Query RecordsUnacked
    query := \`kafka_sharegroup_records_unacked\`
    result, _, err := api.Query(ctx, query, time.Now())
    if err != nil {
        return nil, err
    }
    
    // Process results
    if vector, ok := result.(model.Vector); ok {
        for _, sample := range vector {
            metric := ShareGroupMetrics{
                Group:          string(sample.Metric["group"]),
                Topic:          string(sample.Metric["topic"]),
                Partition:      string(sample.Metric["partition"]),
                RecordsUnacked: float64(sample.Value),
            }
            
            // Query corresponding OldestUnackedAgeMs
            ageQuery := fmt.Sprintf(
                \`kafka_sharegroup_oldest_unacked_ms{group="%s",topic="%s",partition="%s"}\`,
                metric.Group, metric.Topic, metric.Partition)
            
            if ageResult, _, err := api.Query(ctx, ageQuery, time.Now()); err == nil {
                if ageVector, ok := ageResult.(model.Vector); ok && len(ageVector) > 0 {
                    metric.OldestUnackedAgeMs = float64(ageVector[0].Value)
                }
            }
            
            metrics = append(metrics, metric)
        }
    }
    
    return metrics, nil
}
`;

  const ohiConfigYml = `
integrations:
  - name: nri-kafka-sharegroups
    interval: 30s
    env:
      PROMETHEUS_ENDPOINT: http://localhost:9404/metrics
      
      # Share Group specific configuration
      SHARE_GROUP_PREFIX: "share-"
      INCLUDE_TRADITIONAL_GROUPS: false
      
      # Performance tuning
      MAX_CONCURRENT_QUERIES: 5
      QUERY_TIMEOUT: 10s
      
      # New Relic entity naming
      ENTITY_NAME_FORMAT: "{{.Topic}}:{{.Group}}"
      
    labels:
      environment: production
      kafka_version: "4.0"
      integration_version: "1.0.0"
`;

  const terminalCommands = [
    { cmd: 'make build', output: 'Building OHI binary...\n✓ Binary built: kafka-sharegroups-ohi' },
    { cmd: 'make test', output: 'Running tests...\n✓ All tests passed (15/15)' },
    { cmd: 'sudo make install', output: 'Installing to /var/db/newrelic-infra/...\n✓ Installation complete' },
    { cmd: 'sudo systemctl restart newrelic-infra', output: 'Restarting New Relic Infrastructure agent...\n✓ Agent restarted' }
  ];

  return (
    <div className="ohi-builder-scene">
      <div className="ide-layout">
        <div className="file-tree-panel">
          <FileTree 
            files={ohiFiles}
            activeFile={activeFile}
            onFileSelect={setActiveFile}
          />
        </div>

        <div className="editor-panel">
          <div className="editor-tabs">
            <div className="tab active">{activeFile}</div>
          </div>
          <CodeEditor
            code={ohiFiles['kafka-sharegroups-ohi/'][activeFile]}
            language={getLanguageFromFile(activeFile)}
            theme="ultra-dark"
            showLineNumbers={true}
          />
        </div>

        <div className="terminal-panel">
          <TerminalOutput
            commands={terminalCommands.slice(0, Math.floor(time / 20))}
            prompt="$ "
          />
        </div>
      </div>

      {time > 70 && (
        <div className="success-overlay">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="success-badge"
          >
            ✅ OHI Successfully Deployed!
          </motion.div>
        </div>
      )}
    </div>
  );
};
```

---

### Episode 3.2: Queues & Streams UI Integration

#### UI Integration Visualization
```javascript
// scenes/QueuesStreamsUIScene.jsx
import React, { useState, useEffect } from 'react';
import NewRelicUISimulator from '../components/NewRelicUISimulator';
import QueueSampleViewer from '../components/QueueSampleViewer';

const QueuesStreamsUIScene = ({ time, duration }) => {
  const [uiState, setUiState] = useState('loading');
  const [selectedQueue, setSelectedQueue] = useState(null);

  const queueSamples = [
    {
      provider: 'kafka-sharegroup',
      'queue.name': 'orders:share-processor',
      'share.group.name': 'share-processor',
      'topic.name': 'orders',
      'queue.depth': 245,
      'queue.oldestMessageAgeSeconds': 15.2,
      'consumers.active': 5,
      'processing.rate': 1250
    },
    {
      provider: 'kafka-sharegroup',
      'queue.name': 'payments:share-validator',
      'share.group.name': 'share-validator',
      'topic.name': 'payments',
      'queue.depth': 89,
      'queue.oldestMessageAgeSeconds': 3.7,
      'consumers.active': 3,
      'processing.rate': 890
    }
  ];

  useEffect(() => {
    if (time < 10) setUiState('loading');
    else if (time < 30) setUiState('dashboard');
    else if (time < 60) setUiState('detail');
    else setUiState('success');
  }, [time]);

  return (
    <div className="queues-streams-ui-scene">
      <NewRelicUISimulator 
        view="queues-streams"
        theme="dark"
      >
        {uiState === 'loading' && (
          <div className="ui-loading">
            <div className="spinner" />
            <p>Loading Kafka Share Groups...</p>
          </div>
        )}

        {uiState === 'dashboard' && (
          <div className="queues-dashboard">
            <h1>Queues & Streams</h1>
            
            <div className="queue-filters">
              <select className="provider-filter">
                <option value="all">All Providers</option>
                <option value="kafka-sharegroup">Kafka Share Groups</option>
                <option value="kafka">Traditional Kafka</option>
              </select>
            </div>

            <div className="queue-list">
              {queueSamples.map((queue, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  className="queue-card"
                  onClick={() => setSelectedQueue(queue)}
                >
                  <div className="queue-header">
                    <h3>{queue['queue.name']}</h3>
                    <span className="provider-badge">
                      {queue.provider}
                    </span>
                  </div>
                  
                  <div className="queue-metrics">
                    <div className="metric">
                      <span className="label">Depth</span>
                      <span className="value">{queue['queue.depth']}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Oldest Message</span>
                      <span className="value">{queue['queue.oldestMessageAgeSeconds']}s</span>
                    </div>
                    <div className="metric">
                      <span className="label">Consumers</span>
                      <span className="value">{queue['consumers.active']}</span>
                    </div>
                  </div>

                  <div className="queue-health">
                    <HealthIndicator queue={queue} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {uiState === 'detail' && selectedQueue && (
          <div className="queue-detail-view">
            <h2>{selectedQueue['queue.name']}</h2>
            
            <div className="detail-grid">
              <div className="metrics-panel">
                <MetricsChart 
                  metric="queue.depth"
                  data={generateTimeSeriesData(selectedQueue)}
                />
                <MetricsChart 
                  metric="processing.rate"
                  data={generateTimeSeriesData(selectedQueue)}
                />
              </div>

              <div className="attributes-panel">
                <h3>Queue Attributes</h3>
                <QueueSampleViewer sample={selectedQueue} />
              </div>

              <div className="alerts-panel">
                <h3>Alert Conditions</h3>
                <AlertConditions queue={selectedQueue} />
              </div>
            </div>
          </div>
        )}

        {uiState === 'success' && (
          <div className="success-view">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="success-content"
            >
              <h1>🎉 Share Groups Fully Integrated!</h1>
              <p>Your Kafka Share Groups are now visible in the Queues & Streams UI</p>
              
              <div className="benefits-list">
                <div className="benefit">
                  <span className="icon">✅</span>
                  <span>Real-time queue depth monitoring</span>
                </div>
                <div className="benefit">
                  <span className="icon">✅</span>
                  <span>Message age tracking</span>
                </div>
                <div className="benefit">
                  <span className="icon">✅</span>
                  <span>Consumer health visibility</span>
                </div>
                <div className="benefit">
                  <span className="icon">✅</span>
                  <span>Integrated alerting</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </NewRelicUISimulator>
    </div>
  );
};
```

---

## NRQL Query Examples

### Dashboard Queries
```sql
-- Share Group Overview
SELECT 
  latest(queue.depth) as 'Queue Depth',
  latest(queue.oldestMessageAgeSeconds) as 'Oldest Message Age',
  latest(consumers.active) as 'Active Consumers'
FROM QueueSample
WHERE provider = 'kafka-sharegroup'
FACET queue.name
SINCE 30 minutes ago

-- Share Group Performance Trends
SELECT 
  average(queue.depth) as 'Avg Depth',
  max(queue.depth) as 'Max Depth',
  average(processing.rate) as 'Avg Processing Rate'
FROM QueueSample
WHERE provider = 'kafka-sharegroup'
FACET share.group.name
TIMESERIES 1 minute
SINCE 1 hour ago

-- Zero Lag Fallacy Detection
SELECT 
  latest(queue.depth) as 'Actual Queue Depth',
  latest(traditional.lag) as 'Traditional Lag',
  latest(queue.depth) - latest(traditional.lag) as 'Hidden Backlog'
FROM QueueSample, KafkaSample
WHERE provider = 'kafka-sharegroup'
  AND QueueSample.topic.name = KafkaSample.topic
FACET queue.name
WHERE latest(traditional.lag) < 10 
  AND latest(queue.depth) > 100
```

### Alert Conditions
```javascript
// alertConditions.js
export const shareGroupAlerts = [
  {
    name: 'High Queue Depth',
    nrql: `
      SELECT average(queue.depth) 
      FROM QueueSample 
      WHERE provider = 'kafka-sharegroup' 
      FACET queue.name
    `,
    threshold: {
      critical: 1000,
      warning: 500
    }
  },
  {
    name: 'Message Age Alert',
    nrql: `
      SELECT max(queue.oldestMessageAgeSeconds) 
      FROM QueueSample 
      WHERE provider = 'kafka-sharegroup' 
      FACET share.group.name
    `,
    threshold: {
      critical: 300, // 5 minutes
      warning: 120  // 2 minutes
    }
  },
  {
    name: 'Consumer Health',
    nrql: `
      SELECT latest(consumers.active) 
      FROM QueueSample 
      WHERE provider = 'kafka-sharegroup' 
      FACET queue.name
    `,
    threshold: {
      critical: 1, // Less than 1 consumer
      operator: 'below'
    }
  }
];
```

---

## Testing & Validation

### Integration Tests
```javascript
// tests/integration/shareGroupOHI.test.js
describe('Share Group OHI Integration', () => {
  let prometheusServer;
  let ohiProcess;

  beforeAll(async () => {
    // Start mock Prometheus server
    prometheusServer = await startMockPrometheus({
      metrics: mockShareGroupMetrics
    });

    // Start OHI
    ohiProcess = await startOHI({
      config: testConfig,
      prometheusEndpoint: prometheusServer.url
    });
  });

  test('generates valid QueueSample events', async () => {
    const events = await captureOHIOutput(ohiProcess, 5000);
    
    expect(events).toContainEqual(
      expect.objectContaining({
        eventType: 'QueueSample',
        provider: 'kafka-sharegroup',
        'queue.name': expect.stringMatching(/.*:.*/),
        'queue.depth': expect.any(Number),
        'queue.oldestMessageAgeSeconds': expect.any(Number)
      })
    );
  });

  test('handles missing metrics gracefully', async () => {
    // Simulate Prometheus endpoint failure
    await prometheusServer.stop();
    
    const events = await captureOHIOutput(ohiProcess, 5000);
    expect(events).toHaveLength(0);
    expect(ohiProcess.stderr).toContain('Error querying metrics');
  });
});
```

---

## Deployment Checklist

### Pre-Production
- [ ] Kafka 4.0 with Share Groups enabled
- [ ] JMX port exposed (default: 9999)
- [ ] Prometheus JMX Exporter configured
- [ ] New Relic Infrastructure agent installed
- [ ] Custom OHI built and tested

### Production Deployment
- [ ] Deploy JMX Exporter configuration
- [ ] Verify Prometheus metrics endpoint
- [ ] Install custom OHI on all Kafka hosts
- [ ] Configure New Relic Infrastructure agent
- [ ] Create Queues & Streams dashboards
- [ ] Set up alert conditions
- [ ] Document runbook procedures

### Post-Deployment Validation
- [ ] Verify QueueSample events in NRDB
- [ ] Check Queues & Streams UI population
- [ ] Test alert conditions
- [ ] Validate metric accuracy
- [ ] Performance impact assessment

---

This implementation guide provides the complete technical foundation for Seasons 2 & 3 of the TechFlix Ultra series, focusing on the practical aspects of monitoring Kafka Share Groups with New Relic's observability platform.