# Week 2: Metric Builder - Create What Doesn't Exist

> **Mission**: Master the art of creating custom metrics and integrations when standard monitoring falls short.

## Learning Objectives

By the end of this week, you will:
- ✅ Build production-grade custom integrations
- ✅ Create metrics from Kafka Admin API
- ✅ Develop composite and calculated metrics
- ✅ Package and deploy OHI extensions
- ✅ Handle edge cases and error scenarios

## Prerequisites

- Complete Week 1: X-Ray Vision
- Go development environment set up
- Understanding of Kafka consumer groups

## Day 1-2: OHI Extension Development

### Your First Custom Metric: Tombstone Ratio

Tombstones (delete markers) are crucial for Kafka operations but aren't monitored by default. Let's build this metric from scratch.

### Understanding the Problem

```bash
# See tombstones in action
docker exec -it kafka-builder kafka-console-producer \
  --broker-list localhost:9092 \
  --topic test-tombstones \
  --property "key.separator=:" \
  --property "parse.key=true" << EOF
key1:value1
key2:value2
key1:
key3:value3
key2:
EOF

# The empty values after key1: and key2: are tombstones
```

### Build the Tombstone Monitor

Create `~/qsLab/custom-integrations/tombstone-monitor/main.go`:

```go
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "os"
    "time"
    
    "github.com/Shopify/sarama"
    "github.com/newrelic/infra-integrations-sdk/integration"
)

type TombstoneMonitor struct {
    client   sarama.Consumer
    topics   []string
    interval time.Duration
}

type TopicStats struct {
    TotalMessages     int64
    TombstoneMessages int64
    TombstoneRatio    float64
}

func main() {
    // Create integration
    i, err := integration.New("com.custom.kafka.tombstone", "1.0.0")
    if err != nil {
        log.Fatal(err)
    }

    // Parse arguments
    bootstrapServers := os.Getenv("BOOTSTRAP_SERVERS")
    if bootstrapServers == "" {
        bootstrapServers = "localhost:9092"
    }

    // Configure Kafka client
    config := sarama.NewConfig()
    config.Version = sarama.V2_6_0_0
    config.Consumer.Return.Errors = true
    
    client, err := sarama.NewConsumer([]string{bootstrapServers}, config)
    if err != nil {
        log.Fatal("Failed to create consumer:", err)
    }
    defer client.Close()

    // Get all topics
    topics, err := client.Topics()
    if err != nil {
        log.Fatal("Failed to get topics:", err)
    }

    monitor := &TombstoneMonitor{
        client:   client,
        topics:   topics,
        interval: 60 * time.Second,
    }

    // Collect metrics
    stats, err := monitor.CollectTombstoneStats()
    if err != nil {
        log.Fatal("Failed to collect stats:", err)
    }

    // Create entity and metrics
    entity, err := i.Entity("kafka-tombstone-monitor", "tombstone-monitor")
    if err != nil {
        log.Fatal(err)
    }

    for topic, stat := range stats {
        ms := entity.NewMetricSet("KafkaTopicTombstoneSample")
        ms.SetMetric("topic.name", topic, integration.ATTRIBUTE)
        ms.SetMetric("topic.totalMessages", stat.TotalMessages, integration.GAUGE)
        ms.SetMetric("topic.tombstoneMessages", stat.TombstoneMessages, integration.GAUGE)
        ms.SetMetric("topic.tombstoneRatio", stat.TombstoneRatio, integration.GAUGE)
        ms.SetMetric("topic.tombstoneCheckTime", time.Now().Unix(), integration.ATTRIBUTE)
    }

    if err := i.Publish(); err != nil {
        log.Fatal(err)
    }
}

func (tm *TombstoneMonitor) CollectTombstoneStats() (map[string]*TopicStats, error) {
    stats := make(map[string]*TopicStats)
    
    for _, topic := range tm.topics {
        partitions, err := tm.client.Partitions(topic)
        if err != nil {
            log.Printf("Error getting partitions for topic %s: %v", topic, err)
            continue
        }
        
        topicStats := &TopicStats{}
        
        for _, partition := range partitions {
            pc, err := tm.client.ConsumePartition(topic, partition, sarama.OffsetOldest)
            if err != nil {
                log.Printf("Error consuming partition %d of topic %s: %v", partition, topic, err)
                continue
            }
            
            // Sample first 1000 messages
            messageCount := 0
            timeout := time.After(5 * time.Second)
            
            ConsumerLoop:
            for {
                select {
                case msg := <-pc.Messages():
                    topicStats.TotalMessages++
                    if msg.Value == nil || len(msg.Value) == 0 {
                        topicStats.TombstoneMessages++
                    }
                    messageCount++
                    if messageCount >= 1000 {
                        break ConsumerLoop
                    }
                case <-timeout:
                    break ConsumerLoop
                }
            }
            
            pc.Close()
        }
        
        if topicStats.TotalMessages > 0 {
            topicStats.TombstoneRatio = float64(topicStats.TombstoneMessages) / float64(topicStats.TotalMessages) * 100
        }
        
        stats[topic] = topicStats
    }
    
    return stats, nil
}
```

### Integration Configuration

Create `configs/tombstone-config.yml`:

```yaml
integrations:
  - name: tombstone-monitor
    exec: /var/db/newrelic-infra/custom-integrations/tombstone-monitor
    env:
      BOOTSTRAP_SERVERS: "localhost:9092"
      SAMPLE_SIZE: "1000"
    interval: 300s
```

## Day 3-4: Advanced Metrics

### Consumer Lag Predictor

Build a metric that predicts when a consumer will catch up:

```go
// ~/qsLab/custom-integrations/lag-predictor/main.go
package main

import (
    "math"
    "time"
    
    "github.com/Shopify/sarama"
    "github.com/newrelic/infra-integrations-sdk/integration"
)

type LagPredictor struct {
    admin           sarama.ClusterAdmin
    historyWindow   time.Duration
    lagHistory      map[string][]LagPoint
}

type LagPoint struct {
    Timestamp time.Time
    Lag       int64
}

func (lp *LagPredictor) PredictCatchUpTime(consumerGroup, topic string) (time.Duration, error) {
    // Get current lag
    currentLag := lp.getCurrentLag(consumerGroup, topic)
    
    // Get historical lag points
    history := lp.lagHistory[consumerGroup+":"+topic]
    if len(history) < 2 {
        return 0, fmt.Errorf("insufficient history")
    }
    
    // Calculate lag reduction rate (messages/second)
    lagReductionRate := lp.calculateLagReductionRate(history)
    
    if lagReductionRate <= 0 {
        return time.Duration(math.MaxInt64), nil // Never catching up
    }
    
    // Predict time to zero lag
    secondsToZero := float64(currentLag) / lagReductionRate
    return time.Duration(secondsToZero) * time.Second, nil
}

func (lp *LagPredictor) calculateLagReductionRate(history []LagPoint) float64 {
    if len(history) < 2 {
        return 0
    }
    
    // Simple linear regression
    var sumX, sumY, sumXY, sumX2 float64
    n := float64(len(history))
    
    for i, point := range history {
        x := float64(i)
        y := float64(point.Lag)
        sumX += x
        sumY += y
        sumXY += x * y
        sumX2 += x * x
    }
    
    // Calculate slope (lag change per measurement)
    slope := (n*sumXY - sumX*sumY) / (n*sumX2 - sumX*sumX)
    
    // Convert to rate per second
    measurementInterval := history[1].Timestamp.Sub(history[0].Timestamp).Seconds()
    return -slope / measurementInterval
}
```

### Partition Balance Scorer

Create a metric that scores how well-balanced partitions are:

```go
// partition-balance-scorer.go
func CalculateBalanceScore(partitionSizes map[int32]int64) float64 {
    if len(partitionSizes) == 0 {
        return 100.0
    }
    
    var total int64
    sizes := make([]float64, 0, len(partitionSizes))
    
    for _, size := range partitionSizes {
        total += size
        sizes = append(sizes, float64(size))
    }
    
    avg := float64(total) / float64(len(partitionSizes))
    
    // Calculate standard deviation
    var variance float64
    for _, size := range sizes {
        variance += math.Pow(size-avg, 2)
    }
    variance /= float64(len(sizes))
    stdDev := math.Sqrt(variance)
    
    // Calculate coefficient of variation
    cv := stdDev / avg
    
    // Convert to 0-100 score (lower CV = higher score)
    score := math.Max(0, 100*(1-cv))
    
    return score
}
```

## Day 5: Production Deployment

### Package Your Integration

Create a production-ready package:

```bash
# Build script
cat > custom-integrations/build.sh << 'EOF'
#!/bin/bash
set -e

INTEGRATION_NAME=$1
VERSION=${2:-1.0.0}

echo "Building $INTEGRATION_NAME v$VERSION..."

# Build binary
cd $INTEGRATION_NAME
GOOS=linux GOARCH=amd64 go build -o ${INTEGRATION_NAME}-linux-amd64
GOOS=darwin GOARCH=amd64 go build -o ${INTEGRATION_NAME}-darwin-amd64

# Create package
mkdir -p ../dist/$INTEGRATION_NAME-$VERSION
cp ${INTEGRATION_NAME}-linux-amd64 ../dist/$INTEGRATION_NAME-$VERSION/
cp definition.yml ../dist/$INTEGRATION_NAME-$VERSION/
cp config.yml.sample ../dist/$INTEGRATION_NAME-$VERSION/

# Create tarball
cd ../dist
tar czf ${INTEGRATION_NAME}-${VERSION}.tar.gz ${INTEGRATION_NAME}-${VERSION}

echo "Package created: dist/${INTEGRATION_NAME}-${VERSION}.tar.gz"
EOF

chmod +x custom-integrations/build.sh
```

### Test Your Integration

Create comprehensive tests:

```go
// tombstone-monitor/main_test.go
package main

import (
    "testing"
    "github.com/stretchr/testify/assert"
)

func TestTombstoneRatioCalculation(t *testing.T) {
    tests := []struct {
        name              string
        totalMessages     int64
        tombstoneMessages int64
        expectedRatio     float64
    }{
        {"No messages", 0, 0, 0.0},
        {"No tombstones", 100, 0, 0.0},
        {"All tombstones", 100, 100, 100.0},
        {"Half tombstones", 100, 50, 50.0},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            stats := &TopicStats{
                TotalMessages:     tt.totalMessages,
                TombstoneMessages: tt.tombstoneMessages,
            }
            
            if stats.TotalMessages > 0 {
                stats.TombstoneRatio = float64(stats.TombstoneMessages) / float64(stats.TotalMessages) * 100
            }
            
            assert.Equal(t, tt.expectedRatio, stats.TombstoneRatio)
        })
    }
}
```

### Deploy to Production

```yaml
# kubernetes/tombstone-monitor-deployment.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: tombstone-monitor-config
data:
  config.yml: |
    integrations:
      - name: tombstone-monitor
        exec: /var/db/newrelic-infra/custom-integrations/tombstone-monitor
        env:
          BOOTSTRAP_SERVERS: "kafka-0.kafka-headless:9092,kafka-1.kafka-headless:9092,kafka-2.kafka-headless:9092"
        interval: 300s
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tombstone-monitor
spec:
  replicas: 1
  selector:
    matchLabels:
      app: tombstone-monitor
  template:
    metadata:
      labels:
        app: tombstone-monitor
    spec:
      containers:
      - name: newrelic-infra
        image: newrelic/infrastructure:latest
        env:
        - name: NRIA_LICENSE_KEY
          valueFrom:
            secretKeyRef:
              name: newrelic-license
              key: license-key
        volumeMounts:
        - name: config
          mountPath: /etc/newrelic-infra/integrations.d
        - name: custom-integrations
          mountPath: /var/db/newrelic-infra/custom-integrations
      volumes:
      - name: config
        configMap:
          name: tombstone-monitor-config
      - name: custom-integrations
        emptyDir: {}
```

## Week 2 Assessment

### Knowledge Check
Can you answer these questions?
- [ ] What's the difference between OHI and nri-kafka?
- [ ] How do you handle errors in custom integrations?
- [ ] What are the performance implications of custom metrics?
- [ ] How do you version and deploy integrations?
- [ ] What's the SDK's role in metric collection?

### Practical Skills
Complete these tasks:
- [ ] Build a working tombstone monitor
- [ ] Create a lag prediction metric
- [ ] Package an integration for deployment
- [ ] Write tests for your metrics
- [ ] Deploy to a production environment

## Week 2 Project

Build a "Kafka Health Score" integration that:
1. Combines multiple metrics into a single 0-100 score
2. Weights different factors (lag, errors, balance)
3. Provides breakdown of score components
4. Alerts when score drops below threshold
5. Includes historical trending

## Resources

- [New Relic Infrastructure SDK](https://github.com/newrelic/infra-integrations-sdk)
- [Sarama Kafka Library](https://github.com/Shopify/sarama)
- [Go Testing Best Practices](https://golang.org/doc/tutorial/add-a-test)

## Next Week Preview

In [Week 3: Performance Optimizer](week3-optimizer.md), you'll learn to:
- Optimize metric collection for scale
- Reduce collection overhead
- Handle high-cardinality metrics
- Implement intelligent sampling

Ready to build what doesn't exist? You're a Metric Builder now! 🛠️