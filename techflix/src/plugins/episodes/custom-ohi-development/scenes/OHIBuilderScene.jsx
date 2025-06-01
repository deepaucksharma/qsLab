import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CodeEditor from '../components/CodeEditor';
import FileTree from '../components/FileTree';
import TerminalOutput from '../components/TerminalOutput';

const getLanguageFromFile = (file) => {
  if (file.endsWith('.go')) return 'go';
  if (file.endsWith('.yml')) return 'yaml';
  if (file.endsWith('Dockerfile')) return 'docker';
  if (file.endsWith('Makefile')) return 'make';
  return 'text';
};

const OHIBuilderScene = ({ time, duration }) => {
  const [activeFile, setActiveFile] = useState('main.go');
  const [buildStatus, setBuildStatus] = useState('ready');

  const ohiMainGo = `package main

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
    query := `kafka_sharegroup_records_unacked`
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
                `kafka_sharegroup_oldest_unacked_ms{group="%s",topic="%s",partition="%s"}`,
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
}`;

  const ohiConfigYml = `integrations:
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
      integration_version: "1.0.0"`;

  const dockerfile = 'FROM golang:1.21-alpine';
  const makefile = 'build:\n\tgo build -o kafka-sharegroups-ohi';

  const ohiFiles = {
    'kafka-sharegroups-ohi/': {
      'main.go': ohiMainGo,
      'config.yml': ohiConfigYml,
      'Dockerfile': dockerfile,
      'Makefile': makefile
    }
  };

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

export default OHIBuilderScene;
