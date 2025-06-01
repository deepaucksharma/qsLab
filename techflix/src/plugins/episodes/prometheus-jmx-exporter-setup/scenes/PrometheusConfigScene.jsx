import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import YAMLEditor from '../components/YAMLEditor';
import ArchitectureDiagram from '../components/ArchitectureDiagram';
import CodeHighlight from '../components/CodeHighlight';

const PrometheusConfigScene = ({ time, duration }) => {
  const [configStep, setConfigStep] = useState('architecture');

  useEffect(() => {
    if (time < 20) setConfigStep('architecture');
    else if (time < 50) setConfigStep('yaml-config');
    else setConfigStep('verification');
  }, [time]);

  const jmxExporterConfig = `# Share Groups JMX Exporter Configuration
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
    help: "Number of active consumers in share group"`;

  const dockerRunCommand = `# Run JMX Exporter as sidecar
docker run -d \
  --name kafka-jmx-exporter \
  -p 9404:9404 \
  -v $(pwd)/jmx-exporter.yml:/config.yml \
  prom/jmx-exporter:latest \
  -javaagent:/jmx_prometheus_javaagent.jar=9404:/config.yml`;

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
              <pre className="metrics-output">{`# HELP kafka_sharegroup_records_unacked Number of unacknowledged records
# TYPE kafka_sharegroup_records_unacked gauge
kafka_sharegroup_records_unacked{group="share-orders",topic="orders",partition="0"} 245
kafka_sharegroup_records_unacked{group="share-orders",topic="orders",partition="1"} 189
kafka_sharegroup_records_unacked{group="share-orders",topic="orders",partition="2"} 512`}</pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PrometheusConfigScene;
