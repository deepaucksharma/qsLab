# Enhanced Learning Journey - Part 2

## 🛠️ Stage 4: OHI Extension Development (From Zero to Hero)

### 4.1 Your First Custom Metric: Tombstone Ratio

Understanding tombstones (delete markers) is crucial for Kafka operations. Let's build a metric that doesn't exist in standard monitoring.

Create `~/qsLab/custom-integrations/tombstone-monitor/main.go`:
```go
package main

import (
    "fmt"
    "log"
    "time"
    
    "github.com/Shopify/sarama"
    "github.com/newrelic/infra-integrations-sdk/integration"
)

type TombstoneMonitor struct {
    client   sarama.Consumer
    topics   []string
    interval time.Duration
}

func main() {
    // Create integration
    i, err := integration.New("com.custom.kafka.tombstone", "1.0.0")
    if err != nil {
        log.Fatal(err)
    }

    // Configure Kafka client
    config := sarama.NewConfig()
    config.Version = sarama.V2_6_0_0
    
    client, err := sarama.NewConsumer([]string{"localhost:9092"}, config)
    if err != nil {
        log.Fatal(err)
    }
    defer client.Close()

    // Monitor topics
    topics := []string{"orders", "payments", "inventory"}
    monitor := &TombstoneMonitor{
        client:   client,
        topics:   topics,
        interval: 10 * time.Second,
    }
```
    // Collect metrics
    metrics, err := monitor.CollectTombstoneRatios()
    if err != nil {
        log.Fatal(err)
    }

    // Create entity and metrics
    entity, err := i.Entity("kafka-tombstone-monitor", "custom")
    if err != nil {
        log.Fatal(err)
    }

    for topic, ratio := range metrics {
        ms := entity.NewMetricSet("KafkaTopicTombstoneSample")
        ms.SetMetric("topic.name", topic, integration.ATTRIBUTE)
        ms.SetMetric("topic.tombstoneRatio", ratio, integration.GAUGE)
        ms.SetMetric("topic.tombstoneCheckTime", time.Now().Unix(), integration.ATTRIBUTE)
    }

    if err := i.Publish(); err != nil {
        log.Fatal(err)
    }
}
```

See the complete implementation at `~/qsLab/custom-integrations/tombstone-monitor/main.go`

### 4.2 Integration with nri-kafka

Create configuration to run both integrations:
```yaml
# ~/qsLab/custom-integrations/tombstone-monitor/tombstone-config.yml
integrations:
  - name: nri-kafka
    env:
      CLUSTER_NAME: "production"
      # ... standard config ...
    interval: 30s

  - name: tombstone-monitor
    exec: /var/db/newrelic-infra/custom-integrations/tombstone-monitor
    env:
      BOOTSTRAP_SERVERS: "localhost:9092"
      TOPICS: "orders,payments,inventory"
    interval: 60s
```
### 4.3 Testing Your Extension

1. **Build and Deploy**:
   ```bash
   cd ~/qsLab/custom-integrations/tombstone-monitor
   go build -o tombstone-monitor
   
   # Test locally
   ./tombstone-monitor | jq .
   ```

2. **Generate Test Data with Tombstones**:
   ```python
   # generate_tombstones.py
   from kafka import KafkaProducer
   import random
   import time
   
   producer = KafkaProducer(bootstrap_servers='localhost:9092')
   
   for i in range(1000):
       topic = random.choice(['orders', 'payments', 'inventory'])
       
       # 10% chance of tombstone
       if random.random() < 0.1:
           producer.send(topic, key=f'key-{i}'.encode(), value=None)
       else:
           producer.send(topic, key=f'key-{i}'.encode(), 
                        value=f'data-{i}'.encode())
       
       if i % 100 == 0:
           print(f"Sent {i} messages...")
           time.sleep(1)
   ```

3. **Verify in New Relic**:
   ```nrql
   SELECT average(topic.tombstoneRatio) 
   FROM KafkaTopicTombstoneSample 
   FACET topic.name 
   SINCE 1 hour
   ```

---

## 📊 Stage 5: Dashboard Engineering
### 5.1 Multi-Layer Dashboard

Create a comprehensive dashboard that combines standard and custom metrics:

```nrql
# Dashboard: Kafka Health Score
# Widget 1: Overall Health Score (0-100)
SELECT 100 - (
    (average(broker.underReplicatedPartitions) * 10) +
    (average(consumer.lag) / 1000) +
    (average(topic.tombstoneRatio) * 2)
) AS 'Health Score'
FROM KafkaBrokerSample, KafkaConsumerSample, KafkaTopicTombstoneSample
SINCE 1 hour

# Widget 2: Traffic Patterns
SELECT 
    rate(sum(broker.messagesInPerSec), 1 minute) AS 'Incoming',
    rate(sum(broker.bytesInPerSec), 1 minute) / 1024 AS 'KB/s In',
    rate(sum(broker.bytesOutPerSec), 1 minute) / 1024 AS 'KB/s Out'
FROM KafkaBrokerSample
TIMESERIES SINCE 1 hour

# Widget 3: Consumer Lag Heatmap
SELECT average(consumer.lag)
FROM KafkaConsumerSample
FACET consumer.group, topic
SINCE 1 hour

# Widget 4: Tombstone Alert Status
SELECT latest(topic.tombstoneRatio)
FROM KafkaTopicTombstoneSample
WHERE topic.tombstoneRatio > 5
FACET topic.name
SINCE 10 minutes
```

### 5.2 Correlation Analysis Dashboard

Build a dashboard that shows relationships:
```nrql
# Correlation: Lag vs Throughput
SELECT 
    average(consumer.lag) AS 'Avg Lag',
    rate(sum(broker.messagesInPerSec), 1 minute) AS 'Message Rate'
FROM KafkaConsumerSample, KafkaBrokerSample
TIMESERIES SINCE 2 hours

# Correlation: Tombstones vs Disk Usage
SELECT 
    average(topic.tombstoneRatio) AS 'Tombstone %',
    average(broker.logSize) / 1024 / 1024 AS 'Log Size MB'
FROM KafkaTopicTombstoneSample, KafkaBrokerSample
FACET topic
SINCE 6 hours
```