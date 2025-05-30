# Exercise 3: Building a Production-Grade Custom Integration

**Objective:** Develop a Go-based New Relic OHI (On-Host Integration) that provides comprehensive tombstone monitoring with performance optimization and error handling.

**Time:** 60 minutes

**Prerequisites:** 
- Completed Exercises 1 & 2
- Go development environment
- Understanding of the New Relic Infrastructure SDK

## Background

While Flex is great for quick integrations, production environments need:
- Better performance and resource efficiency
- Robust error handling
- Advanced data processing capabilities
- Native Kafka client libraries
- Comprehensive testing

## Steps

### 1. Set Up the Development Environment

```bash
# Create project structure
mkdir -p ~/qsLab/learning-app/labs/week2-builder/custom-integrations/tombstone-monitor
cd ~/qsLab/learning-app/labs/week2-builder/custom-integrations/tombstone-monitor

# Initialize Go module
docker exec -it week2-dev-env sh -c "cd /workspace/tombstone-monitor && go mod init tombstone-monitor"

# Add dependencies
docker exec -it week2-dev-env sh -c "cd /workspace/tombstone-monitor && \
  go get github.com/newrelic/infra-integrations-sdk/integration && \
  go get github.com/Shopify/sarama && \
  go get github.com/spf13/viper"
```

### 2. Create the Main Integration Code

```bash
cat > custom-integrations/tombstone-monitor/main.go << 'EOF'
package main

import (
    "context"
    "fmt"
    "log"
    "os"
    "sync"
    "time"

    "github.com/Shopify/sarama"
    "github.com/newrelic/infra-integrations-sdk/integration"
    "github.com/spf13/viper"
)

const (
    integrationName    = "com.custom.kafka.tombstone-monitor"
    integrationVersion = "1.0.0"
)

type Config struct {
    BootstrapServers []string
    SampleSize       int
    Timeout          time.Duration
    Workers          int
}

type TombstoneMonitor struct {
    config   Config
    client   sarama.Consumer
    integration *integration.Integration
}

type TopicStats struct {
    Topic             string
    TotalMessages     int64
    TombstoneMessages int64
    TombstoneRatio    float64
    AvgMessageSize    int64
    LastUpdated       time.Time
    Errors            []string
}

func main() {
    i, err := integration.New(integrationName, integrationVersion)
    if err != nil {
        log.Fatal("Failed to create integration:", err)
    }

    config := loadConfig()
    monitor := &TombstoneMonitor{
        config:      config,
        integration: i,
    }

    if err := monitor.connect(); err != nil {
        log.Fatal("Failed to connect to Kafka:", err)
    }
    defer monitor.close()

    if err := monitor.collect(); err != nil {
        log.Fatal("Failed to collect metrics:", err)
    }

    if err := i.Publish(); err != nil {
        log.Fatal("Failed to publish metrics:", err)
    }
}

func loadConfig() Config {
    viper.SetDefault("bootstrap_servers", []string{"localhost:9092"})
    viper.SetDefault("sample_size", 1000)
    viper.SetDefault("timeout", "30s")
    viper.SetDefault("workers", 3)

    viper.SetEnvPrefix("TOMBSTONE")
    viper.AutomaticEnv()

    timeout, _ := time.ParseDuration(viper.GetString("timeout"))

    return Config{
        BootstrapServers: viper.GetStringSlice("bootstrap_servers"),
        SampleSize:       viper.GetInt("sample_size"),
        Timeout:          timeout,
        Workers:          viper.GetInt("workers"),
    }
}

func (tm *TombstoneMonitor) connect() error {
    config := sarama.NewConfig()
    config.Version = sarama.V2_6_0_0
    config.Consumer.Return.Errors = true
    config.Consumer.Offsets.Initial = sarama.OffsetOldest

    client, err := sarama.NewConsumer(tm.config.BootstrapServers, config)
    if err != nil {
        return fmt.Errorf("failed to create consumer: %w", err)
    }

    tm.client = client
    return nil
}

func (tm *TombstoneMonitor) close() {
    if tm.client != nil {
        tm.client.Close()
    }
}

func (tm *TombstoneMonitor) collect() error {
    topics, err := tm.client.Topics()
    if err != nil {
        return fmt.Errorf("failed to list topics: %w", err)
    }

    // Filter internal topics
    var userTopics []string
    for _, topic := range topics {
        if len(topic) > 0 && topic[0] != '_' {
            userTopics = append(userTopics, topic)
        }
    }

    // Process topics concurrently
    statsChan := make(chan *TopicStats, len(userTopics))
    var wg sync.WaitGroup
    semaphore := make(chan struct{}, tm.config.Workers)

    for _, topic := range userTopics {
        wg.Add(1)
        go func(t string) {
            defer wg.Done()
            semaphore <- struct{}{}
            defer func() { <-semaphore }()

            stats := tm.analyzeTopicWithTimeout(t)
            statsChan <- stats
        }(topic)
    }

    go func() {
        wg.Wait()
        close(statsChan)
    }()

    // Collect results and create metrics
    entity, err := tm.integration.Entity("kafka-cluster", "cluster")
    if err != nil {
        return fmt.Errorf("failed to create entity: %w", err)
    }

    for stats := range statsChan {
        if stats != nil {
            tm.createMetrics(entity, stats)
        }
    }

    return nil
}

func (tm *TombstoneMonitor) analyzeTopicWithTimeout(topic string) *TopicStats {
    ctx, cancel := context.WithTimeout(context.Background(), tm.config.Timeout)
    defer cancel()

    statsChan := make(chan *TopicStats, 1)
    go func() {
        stats := tm.analyzeTopic(ctx, topic)
        statsChan <- stats
    }()

    select {
    case stats := <-statsChan:
        return stats
    case <-ctx.Done():
        return &TopicStats{
            Topic:      topic,
            Errors:     []string{"Analysis timeout"},
            LastUpdated: time.Now(),
        }
    }
}

func (tm *TombstoneMonitor) analyzeTopic(ctx context.Context, topic string) *TopicStats {
    stats := &TopicStats{
        Topic:       topic,
        LastUpdated: time.Now(),
        Errors:      []string{},
    }

    partitions, err := tm.client.Partitions(topic)
    if err != nil {
        stats.Errors = append(stats.Errors, fmt.Sprintf("Failed to get partitions: %v", err))
        return stats
    }

    var mu sync.Mutex
    var wg sync.WaitGroup

    for _, partition := range partitions {
        wg.Add(1)
        go func(p int32) {
            defer wg.Done()

            pc, err := tm.client.ConsumePartition(topic, p, sarama.OffsetOldest)
            if err != nil {
                mu.Lock()
                stats.Errors = append(stats.Errors, fmt.Sprintf("Partition %d: %v", p, err))
                mu.Unlock()
                return
            }
            defer pc.Close()

            consumed := 0
            timeout := time.After(5 * time.Second)

            for consumed < tm.config.SampleSize {
                select {
                case msg := <-pc.Messages():
                    mu.Lock()
                    stats.TotalMessages++
                    stats.AvgMessageSize += int64(len(msg.Value))
                    if msg.Value == nil || len(msg.Value) == 0 {
                        stats.TombstoneMessages++
                    }
                    mu.Unlock()
                    consumed++

                case <-timeout:
                    return

                case <-ctx.Done():
                    return

                case err := <-pc.Errors():
                    mu.Lock()
                    stats.Errors = append(stats.Errors, fmt.Sprintf("Consumer error: %v", err))
                    mu.Unlock()
                    return
                }
            }
        }(partition)
    }

    wg.Wait()

    // Calculate final statistics
    if stats.TotalMessages > 0 {
        stats.TombstoneRatio = float64(stats.TombstoneMessages) / float64(stats.TotalMessages) * 100
        stats.AvgMessageSize = stats.AvgMessageSize / stats.TotalMessages
    }

    return stats
}

func (tm *TombstoneMonitor) createMetrics(entity *integration.Entity, stats *TopicStats) {
    ms := entity.NewMetricSet("TombstoneStatsSample")
    
    ms.SetMetric("topic", stats.Topic, integration.ATTRIBUTE)
    ms.SetMetric("totalMessages", stats.TotalMessages, integration.GAUGE)
    ms.SetMetric("tombstoneMessages", stats.TombstoneMessages, integration.GAUGE)
    ms.SetMetric("tombstoneRatio", stats.TombstoneRatio, integration.GAUGE)
    ms.SetMetric("avgMessageSize", stats.AvgMessageSize, integration.GAUGE)
    ms.SetMetric("lastUpdated", stats.LastUpdated.Unix(), integration.ATTRIBUTE)
    
    if len(stats.Errors) > 0 {
        ms.SetMetric("errors", len(stats.Errors), integration.GAUGE)
        ms.SetMetric("lastError", stats.Errors[len(stats.Errors)-1], integration.ATTRIBUTE)
    }

    // Add computed health score
    healthScore := tm.calculateHealthScore(stats)
    ms.SetMetric("healthScore", healthScore, integration.GAUGE)
}

func (tm *TombstoneMonitor) calculateHealthScore(stats *TopicStats) float64 {
    score := 100.0

    // Deduct points for high tombstone ratio
    if stats.TombstoneRatio > 50 {
        score -= 30
    } else if stats.TombstoneRatio > 20 {
        score -= 15
    } else if stats.TombstoneRatio > 10 {
        score -= 5
    }

    // Deduct points for errors
    score -= float64(len(stats.Errors)) * 10

    // Ensure score doesn't go negative
    if score < 0 {
        score = 0
    }

    return score
}
EOF
```

### 3. Create Integration Definition

```bash
cat > custom-integrations/tombstone-monitor/definition.yml << 'EOF'
name: com.custom.kafka.tombstone-monitor
description: Monitors Kafka tombstone messages and calculates health metrics
protocol_version: 3
os: linux

commands:
  metrics:
    command:
      - ./tombstone-monitor
    interval: 300
    prefix: config/tombstone
    
config:
  bootstrap_servers:
    description: Kafka bootstrap servers
    type: string
    default: "localhost:9092"
  sample_size:
    description: Number of messages to sample per partition
    type: integer
    default: 1000
  timeout:
    description: Timeout for topic analysis
    type: string
    default: "30s"
  workers:
    description: Number of concurrent workers
    type: integer
    default: 3
EOF
```

### 4. Add Comprehensive Tests

```bash
cat > custom-integrations/tombstone-monitor/main_test.go << 'EOF'
package main

import (
    "testing"
    "time"
)

func TestCalculateHealthScore(t *testing.T) {
    tm := &TombstoneMonitor{}
    
    tests := []struct {
        name     string
        stats    *TopicStats
        expected float64
    }{
        {
            name: "Perfect health",
            stats: &TopicStats{
                TombstoneRatio: 0,
                Errors:        []string{},
            },
            expected: 100.0,
        },
        {
            name: "High tombstone ratio",
            stats: &TopicStats{
                TombstoneRatio: 60,
                Errors:        []string{},
            },
            expected: 70.0,
        },
        {
            name: "Multiple errors",
            stats: &TopicStats{
                TombstoneRatio: 15,
                Errors:        []string{"error1", "error2"},
            },
            expected: 75.0,
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            score := tm.calculateHealthScore(tt.stats)
            if score != tt.expected {
                t.Errorf("Expected score %f, got %f", tt.expected, score)
            }
        })
    }
}

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
        {"One third tombstones", 300, 100, 33.33},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            var ratio float64
            if tt.totalMessages > 0 {
                ratio = float64(tt.tombstoneMessages) / float64(tt.totalMessages) * 100
            }
            
            // Round to 2 decimal places for comparison
            ratio = float64(int(ratio*100)) / 100
            expected := float64(int(tt.expectedRatio*100)) / 100
            
            if ratio != expected {
                t.Errorf("Expected ratio %f, got %f", expected, ratio)
            }
        })
    }
}

func BenchmarkAnalyzeTopic(b *testing.B) {
    // Benchmark performance of topic analysis
    tm := &TombstoneMonitor{
        config: Config{
            SampleSize: 1000,
            Workers:    3,
            Timeout:    30 * time.Second,
        },
    }
    
    stats := &TopicStats{
        Topic: "benchmark-topic",
    }
    
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        tm.calculateHealthScore(stats)
    }
}
EOF
```

### 5. Build and Package the Integration

```bash
# Create build script
cat > custom-integrations/tombstone-monitor/build.sh << 'EOF'
#!/bin/bash
set -e

echo "Building tombstone-monitor..."

# Build for Linux
GOOS=linux GOARCH=amd64 go build -o tombstone-monitor-linux-amd64 .

# Run tests
go test -v ./...

# Create package directory
mkdir -p dist
cp tombstone-monitor-linux-amd64 dist/tombstone-monitor
cp definition.yml dist/

echo "Build complete! Files in dist/"
EOF

chmod +x custom-integrations/tombstone-monitor/build.sh

# Build inside the dev container
docker exec -it week2-dev-env sh -c "cd /workspace/tombstone-monitor && ./build.sh"
```

### 6. Deploy the Integration

```bash
# Create integration config
cat > configs/tombstone-monitor-config.yml << 'EOF'
integrations:
  - name: com.custom.kafka.tombstone-monitor
    exec: /var/db/newrelic-infra/custom-integrations/tombstone-monitor
    env:
      TOMBSTONE_BOOTSTRAP_SERVERS: "broker:9092"
      TOMBSTONE_SAMPLE_SIZE: "500"
      TOMBSTONE_TIMEOUT: "20s"
      TOMBSTONE_WORKERS: "2"
    interval: 300s
    prefix: tombstone
    custom_attributes:
      environment: "production"
      service: "kafka-monitoring"
EOF

# Deploy to infrastructure agent
docker cp custom-integrations/tombstone-monitor/dist/tombstone-monitor \
  week2-newrelic-infra:/var/db/newrelic-infra/custom-integrations/

docker cp configs/tombstone-monitor-config.yml \
  week2-newrelic-infra:/etc/newrelic-infra/integrations.d/

# Restart agent
docker restart week2-newrelic-infra
```

### 7. Create Production Monitoring Dashboard

Once deployed, create a comprehensive dashboard:

```sql
-- Main tombstone overview
SELECT 
  latest(tombstoneRatio) as 'Tombstone %',
  latest(healthScore) as 'Health Score',
  latest(totalMessages) as 'Messages Analyzed',
  latest(avgMessageSize) as 'Avg Message Size'
FROM TombstoneStatsSample 
FACET topic 
SINCE 1 hour ago

-- Topics with concerning tombstone ratios
SELECT 
  latest(tombstoneRatio) as 'Tombstone %',
  latest(errors) as 'Error Count'
FROM TombstoneStatsSample 
WHERE tombstoneRatio > 20
FACET topic
SINCE 1 hour ago

-- Health score trends
SELECT 
  average(healthScore) as 'Avg Health Score'
FROM TombstoneStatsSample
FACET topic
TIMESERIES 5 minutes
SINCE 1 hour ago
```

### 8. Set Up Alerting

Create alert conditions for production:

```sql
-- Alert on high tombstone ratio
SELECT latest(tombstoneRatio) 
FROM TombstoneStatsSample 
WHERE tombstoneRatio > 50
FACET topic

-- Alert on declining health score
SELECT average(healthScore)
FROM TombstoneStatsSample
WHERE healthScore < 70
FACET topic

-- Alert on integration errors
SELECT latest(errors)
FROM TombstoneStatsSample
WHERE errors > 0
FACET topic
```

## Validation

Ensure your integration is production-ready:

- [ ] Integration builds without errors
- [ ] All tests pass successfully
- [ ] Handles Kafka connection failures gracefully
- [ ] Respects timeout configurations
- [ ] Concurrent processing works correctly
- [ ] Metrics appear in New Relic with correct values
- [ ] Health score calculation is accurate
- [ ] Memory usage is reasonable under load

## Performance Testing

Test the integration performance:

```bash
# Create a high-volume test topic
docker exec week2-broker kafka-topics --create \
  --bootstrap-server localhost:9092 \
  --topic perf-test \
  --partitions 10 \
  --replication-factor 1

# Generate test data
for i in {1..10}; do
  docker exec -it week2-broker kafka-console-producer \
    --broker-list localhost:9092 \
    --topic perf-test \
    --property "key.separator=:" \
    --property "parse.key=true" << EOF
key$i:value$i
EOF
done

# Monitor integration performance
docker stats week2-newrelic-infra
```

## Troubleshooting

### Issue: Integration not starting
**Solution:** Check logs: `docker logs week2-newrelic-infra | grep tombstone`

### Issue: High memory usage
**Solution:** Reduce `TOMBSTONE_SAMPLE_SIZE` or `TOMBSTONE_WORKERS`

### Issue: Timeouts on large topics
**Solution:** Increase `TOMBSTONE_TIMEOUT` or implement partition-level timeouts

## Key Takeaways

1. **Production integrations need robust error handling** and timeouts
2. **Concurrent processing improves performance** for multi-partition topics
3. **Health scores provide quick visibility** into overall system state
4. **Sampling strategies balance accuracy** with performance
5. **Comprehensive testing ensures reliability** in production

## Next Steps

In Exercise 4, you'll learn to package and deploy your integration using modern CI/CD practices and container orchestration.