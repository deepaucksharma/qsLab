# Exercise 5: Week 2 Capstone Project - Kafka Health Score System

**Objective:** Build a comprehensive "Kafka Health Score" integration that combines multiple metrics into a single, actionable score with historical trending and intelligent alerting.

**Time:** 90 minutes

**Prerequisites:** 
- Completed Exercises 1-4
- Understanding of composite metrics
- Familiarity with statistical analysis

## Project Overview

You'll create a production-ready system that:
1. Collects multiple Kafka health indicators
2. Weights them based on importance
3. Calculates a composite health score (0-100)
4. Tracks historical trends
5. Provides actionable insights
6. Alerts on score degradation

## Steps

### 1. Design the Health Score Algorithm

```bash
cd ~/qsLab/learning-app/labs/week2-builder

# Create project structure
mkdir -p custom-integrations/kafka-health-score/{pkg,cmd,configs}
cd custom-integrations/kafka-health-score

# Initialize module
docker exec -it week2-dev-env sh -c "cd /workspace/kafka-health-score && go mod init kafka-health-score"
```

Create the health score calculator:

```bash
cat > pkg/health/calculator.go << 'EOF'
package health

import (
    "math"
    "time"
)

// HealthMetrics represents all metrics used for health calculation
type HealthMetrics struct {
    TombstoneRatio      float64
    ConsumerLag         int64
    ErrorRate           float64
    PartitionBalance    float64
    BrokerAvailability  float64
    MessageThroughput   float64
    TopicCount          int
    ReplicationHealth   float64
    DiskUsage           float64
    NetworkLatency      float64
    Timestamp           time.Time
}

// HealthScore represents the calculated health score with breakdown
type HealthScore struct {
    Overall        float64            `json:"overall"`
    Components     map[string]float64 `json:"components"`
    Trend          string            `json:"trend"` // improving, stable, degrading
    Recommendations []string          `json:"recommendations"`
    Timestamp      time.Time         `json:"timestamp"`
}

// ScoreWeights defines the importance of each metric
type ScoreWeights struct {
    TombstoneRatio     float64
    ConsumerLag        float64
    ErrorRate          float64
    PartitionBalance   float64
    BrokerAvailability float64
    MessageThroughput  float64
    ReplicationHealth  float64
    DiskUsage          float64
    NetworkLatency     float64
}

// DefaultWeights returns production-tested weights
func DefaultWeights() ScoreWeights {
    return ScoreWeights{
        TombstoneRatio:     0.10, // 10%
        ConsumerLag:        0.20, // 20% - critical for real-time systems
        ErrorRate:          0.15, // 15%
        PartitionBalance:   0.10, // 10%
        BrokerAvailability: 0.20, // 20% - critical for availability
        MessageThroughput:  0.10, // 10%
        ReplicationHealth:  0.10, // 10%
        DiskUsage:          0.03, // 3%
        NetworkLatency:     0.02, // 2%
    }
}

// Calculator calculates health scores
type Calculator struct {
    weights   ScoreWeights
    history   []HealthScore
    maxHistory int
}

// NewCalculator creates a new health calculator
func NewCalculator(weights ScoreWeights) *Calculator {
    return &Calculator{
        weights:    weights,
        history:    make([]HealthScore, 0),
        maxHistory: 100,
    }
}

// Calculate computes the health score from metrics
func (c *Calculator) Calculate(metrics HealthMetrics) HealthScore {
    components := make(map[string]float64)
    
    // Calculate individual component scores (0-100)
    components["tombstone"] = c.scoreTombstoneRatio(metrics.TombstoneRatio)
    components["lag"] = c.scoreConsumerLag(metrics.ConsumerLag)
    components["errors"] = c.scoreErrorRate(metrics.ErrorRate)
    components["balance"] = metrics.PartitionBalance // Already 0-100
    components["availability"] = metrics.BrokerAvailability * 100
    components["throughput"] = c.scoreThroughput(metrics.MessageThroughput)
    components["replication"] = metrics.ReplicationHealth * 100
    components["disk"] = c.scoreDiskUsage(metrics.DiskUsage)
    components["latency"] = c.scoreNetworkLatency(metrics.NetworkLatency)
    
    // Calculate weighted overall score
    overall := c.calculateWeightedScore(components)
    
    // Determine trend
    trend := c.calculateTrend(overall)
    
    // Generate recommendations
    recommendations := c.generateRecommendations(components, metrics)
    
    score := HealthScore{
        Overall:         overall,
        Components:      components,
        Trend:           trend,
        Recommendations: recommendations,
        Timestamp:       metrics.Timestamp,
    }
    
    // Update history
    c.updateHistory(score)
    
    return score
}

// Component scoring functions
func (c *Calculator) scoreTombstoneRatio(ratio float64) float64 {
    // Lower is better: 0% = 100 score, 100% = 0 score
    if ratio <= 5 {
        return 100
    } else if ratio <= 20 {
        return 100 - (ratio-5)*2 // Linear decrease
    } else if ratio <= 50 {
        return 70 - (ratio-20)*1.5
    }
    return math.Max(0, 25-ratio*0.5)
}

func (c *Calculator) scoreConsumerLag(lag int64) float64 {
    // Exponential decay based on lag
    if lag == 0 {
        return 100
    } else if lag < 1000 {
        return 95
    } else if lag < 10000 {
        return 80 - math.Log10(float64(lag))*5
    }
    return math.Max(0, 50-math.Log10(float64(lag))*10)
}

func (c *Calculator) scoreErrorRate(rate float64) float64 {
    // Lower is better
    if rate == 0 {
        return 100
    } else if rate < 0.01 { // < 1%
        return 95
    } else if rate < 0.05 { // < 5%
        return 80 - rate*200
    }
    return math.Max(0, 50-rate*500)
}

func (c *Calculator) scoreThroughput(throughput float64) float64 {
    // Normalized throughput (assumes baseline of 1000 msg/s)
    baseline := 1000.0
    if throughput >= baseline {
        return math.Min(100, 80+math.Log10(throughput/baseline)*20)
    }
    return math.Max(0, throughput/baseline*80)
}

func (c *Calculator) scoreDiskUsage(usage float64) float64 {
    // Lower is better
    if usage < 0.5 { // < 50%
        return 100
    } else if usage < 0.7 { // < 70%
        return 90
    } else if usage < 0.85 { // < 85%
        return 70 - (usage-0.7)*100
    }
    return math.Max(0, 40-usage*40)
}

func (c *Calculator) scoreNetworkLatency(latency float64) float64 {
    // Lower is better (ms)
    if latency < 1 {
        return 100
    } else if latency < 10 {
        return 95 - latency*0.5
    } else if latency < 50 {
        return 90 - latency*0.8
    }
    return math.Max(0, 50-latency*0.5)
}

func (c *Calculator) calculateWeightedScore(components map[string]float64) float64 {
    weighted := 0.0
    
    weighted += components["tombstone"] * c.weights.TombstoneRatio
    weighted += components["lag"] * c.weights.ConsumerLag
    weighted += components["errors"] * c.weights.ErrorRate
    weighted += components["balance"] * c.weights.PartitionBalance
    weighted += components["availability"] * c.weights.BrokerAvailability
    weighted += components["throughput"] * c.weights.MessageThroughput
    weighted += components["replication"] * c.weights.ReplicationHealth
    weighted += components["disk"] * c.weights.DiskUsage
    weighted += components["latency"] * c.weights.NetworkLatency
    
    return math.Round(weighted*100) / 100 // Round to 2 decimal places
}

func (c *Calculator) calculateTrend(currentScore float64) string {
    if len(c.history) < 3 {
        return "stable"
    }
    
    // Get average of last 3 scores
    sum := 0.0
    for i := len(c.history) - 3; i < len(c.history); i++ {
        sum += c.history[i].Overall
    }
    avgPrevious := sum / 3
    
    diff := currentScore - avgPrevious
    if diff > 2 {
        return "improving"
    } else if diff < -2 {
        return "degrading"
    }
    return "stable"
}

func (c *Calculator) generateRecommendations(components map[string]float64, metrics HealthMetrics) []string {
    recommendations := []string{}
    
    // Check each component and add recommendations
    if components["tombstone"] < 70 {
        recommendations = append(recommendations, 
            "High tombstone ratio detected. Consider log compaction tuning.")
    }
    
    if components["lag"] < 70 {
        recommendations = append(recommendations,
            "Consumer lag is high. Scale consumers or optimize processing.")
    }
    
    if components["errors"] < 80 {
        recommendations = append(recommendations,
            "Error rate exceeds threshold. Investigate recent failures.")
    }
    
    if components["balance"] < 80 {
        recommendations = append(recommendations,
            "Partition imbalance detected. Run partition reassignment.")
    }
    
    if components["availability"] < 90 {
        recommendations = append(recommendations,
            "Broker availability issue. Check broker health and network.")
    }
    
    if components["disk"] < 70 {
        recommendations = append(recommendations,
            "Disk usage critical. Add storage or adjust retention policies.")
    }
    
    return recommendations
}

func (c *Calculator) updateHistory(score HealthScore) {
    c.history = append(c.history, score)
    if len(c.history) > c.maxHistory {
        c.history = c.history[1:]
    }
}

// GetHistory returns historical scores
func (c *Calculator) GetHistory() []HealthScore {
    return c.history
}

// GetTrendAnalysis provides detailed trend analysis
func (c *Calculator) GetTrendAnalysis() map[string]interface{} {
    if len(c.history) < 2 {
        return map[string]interface{}{
            "status": "insufficient_data",
        }
    }
    
    // Calculate various statistics
    scores := make([]float64, len(c.history))
    for i, h := range c.history {
        scores[i] = h.Overall
    }
    
    return map[string]interface{}{
        "current":     scores[len(scores)-1],
        "average":     average(scores),
        "min":         min(scores),
        "max":         max(scores),
        "stddev":      stddev(scores),
        "trend_slope": trendSlope(scores),
        "volatility":  volatility(scores),
    }
}

// Statistical helper functions
func average(values []float64) float64 {
    sum := 0.0
    for _, v := range values {
        sum += v
    }
    return sum / float64(len(values))
}

func min(values []float64) float64 {
    minVal := values[0]
    for _, v := range values {
        if v < minVal {
            minVal = v
        }
    }
    return minVal
}

func max(values []float64) float64 {
    maxVal := values[0]
    for _, v := range values {
        if v > maxVal {
            maxVal = v
        }
    }
    return maxVal
}

func stddev(values []float64) float64 {
    avg := average(values)
    sum := 0.0
    for _, v := range values {
        sum += math.Pow(v-avg, 2)
    }
    return math.Sqrt(sum / float64(len(values)))
}

func trendSlope(values []float64) float64 {
    // Simple linear regression slope
    n := float64(len(values))
    sumX, sumY, sumXY, sumX2 := 0.0, 0.0, 0.0, 0.0
    
    for i, y := range values {
        x := float64(i)
        sumX += x
        sumY += y
        sumXY += x * y
        sumX2 += x * x
    }
    
    return (n*sumXY - sumX*sumY) / (n*sumX2 - sumX*sumX)
}

func volatility(values []float64) float64 {
    if len(values) < 2 {
        return 0
    }
    
    // Calculate standard deviation of changes
    changes := make([]float64, len(values)-1)
    for i := 1; i < len(values); i++ {
        changes[i-1] = values[i] - values[i-1]
    }
    
    return stddev(changes)
}
EOF
```

### 2. Create the Main Integration

```bash
cat > cmd/main.go << 'EOF'
package main

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "os"
    "time"

    "github.com/Shopify/sarama"
    "github.com/newrelic/infra-integrations-sdk/integration"
    "kafka-health-score/pkg/health"
)

const (
    integrationName    = "com.custom.kafka.health-score"
    integrationVersion = "1.0.0"
)

type KafkaHealthMonitor struct {
    client      sarama.Client
    admin       sarama.ClusterAdmin
    integration *integration.Integration
    calculator  *health.Calculator
}

func main() {
    i, err := integration.New(integrationName, integrationVersion)
    if err != nil {
        log.Fatal(err)
    }

    // Initialize health calculator with default weights
    calculator := health.NewCalculator(health.DefaultWeights())

    monitor := &KafkaHealthMonitor{
        integration: i,
        calculator:  calculator,
    }

    if err := monitor.connect(); err != nil {
        log.Fatal("Failed to connect:", err)
    }
    defer monitor.close()

    // Collect all metrics
    metrics, err := monitor.collectMetrics()
    if err != nil {
        log.Fatal("Failed to collect metrics:", err)
    }

    // Calculate health score
    score := calculator.Calculate(metrics)

    // Create metrics in New Relic
    if err := monitor.reportMetrics(score, metrics); err != nil {
        log.Fatal("Failed to report metrics:", err)
    }

    // Get trend analysis
    trendAnalysis := calculator.GetTrendAnalysis()
    
    // Create event with detailed information
    if err := monitor.createHealthEvent(score, trendAnalysis); err != nil {
        log.Fatal("Failed to create event:", err)
    }

    if err := i.Publish(); err != nil {
        log.Fatal("Failed to publish:", err)
    }
}

func (m *KafkaHealthMonitor) connect() error {
    config := sarama.NewConfig()
    config.Version = sarama.V2_6_0_0
    config.Admin.Timeout = 10 * time.Second

    brokers := []string{os.Getenv("KAFKA_BROKERS")}
    if brokers[0] == "" {
        brokers = []string{"localhost:9092"}
    }

    client, err := sarama.NewClient(brokers, config)
    if err != nil {
        return fmt.Errorf("failed to create client: %w", err)
    }
    m.client = client

    admin, err := sarama.NewClusterAdminFromClient(client)
    if err != nil {
        return fmt.Errorf("failed to create admin: %w", err)
    }
    m.admin = admin

    return nil
}

func (m *KafkaHealthMonitor) close() {
    if m.admin != nil {
        m.admin.Close()
    }
    if m.client != nil {
        m.client.Close()
    }
}

func (m *KafkaHealthMonitor) collectMetrics() (health.HealthMetrics, error) {
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    metrics := health.HealthMetrics{
        Timestamp: time.Now(),
    }

    // Collect tombstone ratio (simplified - in production, aggregate across topics)
    tombstoneRatio, err := m.calculateAverageTombstoneRatio(ctx)
    if err != nil {
        log.Printf("Warning: failed to calculate tombstone ratio: %v", err)
    }
    metrics.TombstoneRatio = tombstoneRatio

    // Collect consumer lag
    totalLag, err := m.calculateTotalConsumerLag(ctx)
    if err != nil {
        log.Printf("Warning: failed to calculate consumer lag: %v", err)
    }
    metrics.ConsumerLag = totalLag

    // Collect broker availability
    brokerCount, availableBrokers, err := m.checkBrokerAvailability()
    if err != nil {
        log.Printf("Warning: failed to check broker availability: %v", err)
    }
    if brokerCount > 0 {
        metrics.BrokerAvailability = float64(availableBrokers) / float64(brokerCount)
    }

    // Collect partition balance score
    balanceScore, err := m.calculatePartitionBalance(ctx)
    if err != nil {
        log.Printf("Warning: failed to calculate partition balance: %v", err)
    }
    metrics.PartitionBalance = balanceScore

    // Collect topic count
    topics, err := m.client.Topics()
    if err != nil {
        log.Printf("Warning: failed to get topics: %v", err)
    }
    metrics.TopicCount = len(topics)

    // TODO: Implement remaining metrics collection
    // For now, use mock values
    metrics.ErrorRate = 0.02          // 2% error rate
    metrics.MessageThroughput = 1500  // msgs/sec
    metrics.ReplicationHealth = 0.95  // 95% healthy
    metrics.DiskUsage = 0.65         // 65% used
    metrics.NetworkLatency = 5.5     // 5.5ms

    return metrics, nil
}

func (m *KafkaHealthMonitor) calculateAverageTombstoneRatio(ctx context.Context) (float64, error) {
    // Simplified implementation - in production, sample multiple topics
    return 15.5, nil // Mock 15.5% average
}

func (m *KafkaHealthMonitor) calculateTotalConsumerLag(ctx context.Context) (int64, error) {
    // Get all consumer groups
    groups, err := m.admin.ListConsumerGroups()
    if err != nil {
        return 0, err
    }

    totalLag := int64(0)
    for groupID := range groups {
        // Skip internal groups
        if groupID == "__consumer_offsets" {
            continue
        }

        // Get group description
        descriptions, err := m.admin.DescribeConsumerGroups([]string{groupID})
        if err != nil {
            log.Printf("Failed to describe group %s: %v", groupID, err)
            continue
        }

        // Calculate lag for this group
        // Simplified - in production, calculate actual lag
        totalLag += 5000 // Mock lag
    }

    return totalLag, nil
}

func (m *KafkaHealthMonitor) checkBrokerAvailability() (total, available int, err error) {
    brokers := m.client.Brokers()
    total = len(brokers)
    
    for _, broker := range brokers {
        if broker.Connected() {
            available++
        }
    }
    
    return total, available, nil
}

func (m *KafkaHealthMonitor) calculatePartitionBalance(ctx context.Context) (float64, error) {
    // Get metadata for all topics
    topics, err := m.client.Topics()
    if err != nil {
        return 0, err
    }

    partitionCounts := make(map[int32]int)
    
    for _, topic := range topics {
        partitions, err := m.client.Partitions(topic)
        if err != nil {
            continue
        }
        
        for _, partition := range partitions {
            leader, err := m.client.Leader(topic, partition)
            if err != nil {
                continue
            }
            partitionCounts[leader.ID()]++
        }
    }

    // Calculate balance score based on standard deviation
    if len(partitionCounts) == 0 {
        return 100, nil
    }

    // Convert to slice for calculation
    counts := make([]float64, 0, len(partitionCounts))
    total := 0
    for _, count := range partitionCounts {
        counts = append(counts, float64(count))
        total += count
    }

    avg := float64(total) / float64(len(partitionCounts))
    
    // Calculate coefficient of variation
    var variance float64
    for _, count := range counts {
        variance += (count - avg) * (count - avg)
    }
    variance /= float64(len(counts))
    stdDev := math.Sqrt(variance)
    
    cv := stdDev / avg
    
    // Convert to 0-100 score
    score := math.Max(0, 100*(1-cv))
    return score, nil
}

func (m *KafkaHealthMonitor) reportMetrics(score health.HealthScore, metrics health.HealthMetrics) error {
    entity, err := m.integration.Entity("kafka-health", "health-monitor")
    if err != nil {
        return err
    }

    // Overall health metrics
    ms := entity.NewMetricSet("KafkaHealthScoreSample")
    ms.SetMetric("health.score.overall", score.Overall, integration.GAUGE)
    ms.SetMetric("health.trend", score.Trend, integration.ATTRIBUTE)
    
    // Component scores
    for component, value := range score.Components {
        ms.SetMetric(fmt.Sprintf("health.component.%s", component), value, integration.GAUGE)
    }
    
    // Raw metrics
    ms.SetMetric("metrics.tombstoneRatio", metrics.TombstoneRatio, integration.GAUGE)
    ms.SetMetric("metrics.consumerLag", metrics.ConsumerLag, integration.GAUGE)
    ms.SetMetric("metrics.errorRate", metrics.ErrorRate, integration.GAUGE)
    ms.SetMetric("metrics.brokerAvailability", metrics.BrokerAvailability*100, integration.GAUGE)
    ms.SetMetric("metrics.partitionBalance", metrics.PartitionBalance, integration.GAUGE)
    ms.SetMetric("metrics.topicCount", metrics.TopicCount, integration.GAUGE)
    ms.SetMetric("metrics.throughput", metrics.MessageThroughput, integration.GAUGE)
    
    // Recommendations count
    ms.SetMetric("health.recommendations.count", len(score.Recommendations), integration.GAUGE)
    
    return nil
}

func (m *KafkaHealthMonitor) createHealthEvent(score health.HealthScore, trend map[string]interface{}) error {
    entity, err := m.integration.Entity("kafka-health", "health-monitor")
    if err != nil {
        return err
    }

    event := entity.NewEvent("KafkaHealthUpdate")
    event.Summary = fmt.Sprintf("Kafka Health Score: %.1f (%s)", score.Overall, score.Trend)
    
    // Add event attributes
    eventData := map[string]interface{}{
        "score":           score.Overall,
        "trend":           score.Trend,
        "components":      score.Components,
        "recommendations": score.Recommendations,
        "trendAnalysis":   trend,
    }
    
    eventJSON, _ := json.Marshal(eventData)
    event.Attributes["details"] = string(eventJSON)
    event.Attributes["severity"] = m.getSeverity(score.Overall)
    
    return nil
}

func (m *KafkaHealthMonitor) getSeverity(score float64) string {
    if score >= 90 {
        return "INFO"
    } else if score >= 70 {
        return "WARNING"
    } else if score >= 50 {
        return "ERROR"
    }
    return "CRITICAL"
}
EOF
```

### 3. Create Configuration Files

```bash
# Development config
cat > configs/development.yaml << 'EOF'
integration:
  name: kafka-health-score
  interval: 60s
  
kafka:
  brokers:
    - localhost:9092
  timeout: 30s
  
weights:
  tombstone_ratio: 0.10
  consumer_lag: 0.20
  error_rate: 0.15
  partition_balance: 0.10
  broker_availability: 0.20
  message_throughput: 0.10
  replication_health: 0.10
  disk_usage: 0.03
  network_latency: 0.02

thresholds:
  critical: 50
  warning: 70
  healthy: 90
EOF

# Production config
cat > configs/production.yaml << 'EOF'
integration:
  name: kafka-health-score
  interval: 300s
  
kafka:
  brokers:
    - kafka-0.kafka:9092
    - kafka-1.kafka:9092
    - kafka-2.kafka:9092
  timeout: 45s
  
weights:
  tombstone_ratio: 0.08
  consumer_lag: 0.25      # More critical in production
  error_rate: 0.20        # More critical in production
  partition_balance: 0.08
  broker_availability: 0.25 # More critical in production
  message_throughput: 0.08
  replication_health: 0.12
  disk_usage: 0.02
  network_latency: 0.02

thresholds:
  critical: 60
  warning: 80
  healthy: 95

alerting:
  enabled: true
  channels:
    - slack
    - pagerduty
  
  rules:
    - name: "Critical Health Score"
      condition: "score < 60"
      severity: "critical"
      
    - name: "Degrading Trend"
      condition: "trend == 'degrading' && duration > 15m"
      severity: "warning"
      
    - name: "Component Failure"
      condition: "any_component < 50"
      severity: "error"
EOF
```

### 4. Create Visualization Dashboard

```bash
cat > dashboards/health-score-dashboard.json << 'EOF'
{
  "name": "Kafka Health Score Dashboard",
  "description": "Comprehensive Kafka cluster health monitoring",
  "permissions": "PUBLIC_READ_WRITE",
  "pages": [
    {
      "name": "Overview",
      "description": "Health score overview and trends",
      "widgets": [
        {
          "title": "Current Health Score",
          "visualization": "billboard",
          "nrql": "SELECT latest(health.score.overall) as 'Health Score' FROM KafkaHealthScoreSample SINCE 5 minutes ago"
        },
        {
          "title": "Health Trend",
          "visualization": "line",
          "nrql": "SELECT average(health.score.overall) FROM KafkaHealthScoreSample TIMESERIES 5 minutes SINCE 6 hours ago"
        },
        {
          "title": "Component Breakdown",
          "visualization": "bar",
          "nrql": "SELECT latest(health.component.tombstone) as 'Tombstone', latest(health.component.lag) as 'Lag', latest(health.component.errors) as 'Errors', latest(health.component.balance) as 'Balance', latest(health.component.availability) as 'Availability' FROM KafkaHealthScoreSample SINCE 5 minutes ago"
        },
        {
          "title": "Recommendations",
          "visualization": "table",
          "nrql": "SELECT latest(health.recommendations.count) as 'Active Recommendations' FROM KafkaHealthScoreSample FACET health.trend SINCE 30 minutes ago"
        }
      ]
    },
    {
      "name": "Detailed Metrics",
      "description": "Individual metric analysis",
      "widgets": [
        {
          "title": "Consumer Lag Trend",
          "visualization": "line",
          "nrql": "SELECT average(metrics.consumerLag) FROM KafkaHealthScoreSample TIMESERIES 5 minutes SINCE 1 hour ago"
        },
        {
          "title": "Broker Availability",
          "visualization": "billboard",
          "nrql": "SELECT latest(metrics.brokerAvailability) as 'Availability %' FROM KafkaHealthScoreSample"
        },
        {
          "title": "Error Rate",
          "visualization": "line",
          "nrql": "SELECT average(metrics.errorRate) * 100 as 'Error %' FROM KafkaHealthScoreSample TIMESERIES 5 minutes SINCE 1 hour ago"
        },
        {
          "title": "Partition Balance Score",
          "visualization": "gauge",
          "nrql": "SELECT latest(metrics.partitionBalance) FROM KafkaHealthScoreSample"
        }
      ]
    },
    {
      "name": "Alerts",
      "description": "Alert conditions and history",
      "widgets": [
        {
          "title": "Alert Conditions",
          "visualization": "table",
          "nrql": "SELECT count(*) FROM KafkaHealthUpdate WHERE severity != 'INFO' FACET severity SINCE 24 hours ago"
        },
        {
          "title": "Score Distribution",
          "visualization": "histogram",
          "nrql": "SELECT histogram(health.score.overall, 10, 10) FROM KafkaHealthScoreSample SINCE 24 hours ago"
        }
      ]
    }
  ]
}
EOF
```

### 5. Build and Test the Complete System

```bash
# Update go.mod with math import
docker exec -it week2-dev-env sh -c "cd /workspace/kafka-health-score && go mod tidy"

# Build the integration
docker exec -it week2-dev-env sh -c "cd /workspace/kafka-health-score && go build -o kafka-health-score cmd/main.go"

# Create test script
cat > test-health-score.sh << 'EOF'
#!/bin/bash
set -e

echo "Testing Kafka Health Score Integration..."

# 1. Generate various scenarios
echo "Generating test scenarios..."

# High tombstone scenario
docker exec -it week2-broker kafka-console-producer \
  --broker-list localhost:9092 \
  --topic high-tombstone-test \
  --property "key.separator=:" \
  --property "parse.key=true" << TOMB
key1:value1
key2:value2
key1:
key2:
key3:
TOMB

# Create consumer lag
docker exec week2-broker kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --group test-lag-group \
  --topic high-tombstone-test \
  --reset-offsets --to-earliest --execute

# 2. Run the integration
echo "Running health score calculation..."
docker exec -it week2-dev-env sh -c "cd /workspace/kafka-health-score && ./kafka-health-score"

echo "Test complete!"
EOF

chmod +x test-health-score.sh
./test-health-score.sh
```

### 6. Deploy the Complete Solution

```bash
# Create deployment package
cat > deploy-health-score.sh << 'EOF'
#!/bin/bash
set -e

VERSION=${1:-1.0.0}

echo "Deploying Kafka Health Score v$VERSION..."

# 1. Build Docker image
cd custom-integrations/kafka-health-score
docker build -t kafka-health-score:$VERSION .

# 2. Deploy to New Relic Infrastructure
docker cp kafka-health-score week2-newrelic-infra:/var/db/newrelic-infra/custom-integrations/
docker cp configs/production.yaml week2-newrelic-infra:/etc/newrelic-infra/integrations.d/health-score-config.yml

# 3. Restart agent
docker restart week2-newrelic-infra

# 4. Import dashboard
echo "Import the dashboard JSON to New Relic UI"

echo "Deployment complete!"
EOF

chmod +x deploy-health-score.sh
```

## Validation

Verify your complete health score system:

- [ ] Health calculator produces accurate scores
- [ ] All component metrics are collected
- [ ] Weighted scoring works correctly
- [ ] Trend analysis shows proper patterns
- [ ] Recommendations are actionable
- [ ] Integration runs without errors
- [ ] Data appears in New Relic
- [ ] Dashboard visualizes all metrics
- [ ] Alerts trigger appropriately

## Testing Different Scenarios

Test various health conditions:

```bash
# Scenario 1: Healthy cluster
# All metrics in good range, expect score > 90

# Scenario 2: High consumer lag
# Create lag, expect score 70-80 with lag recommendations

# Scenario 3: Broker failure
# Stop a broker, expect availability impact

# Scenario 4: High error rate
# Generate errors, expect score < 70
```

## Production Considerations

1. **Performance**: Sample metrics efficiently
2. **Accuracy**: Balance sampling with precision
3. **Alerting**: Set appropriate thresholds
4. **Historical Data**: Store trends for analysis
5. **Customization**: Allow weight adjustments per environment

## Key Takeaways

1. **Composite metrics provide holistic view** of system health
2. **Weighted scoring reflects business priorities**
3. **Trend analysis enables proactive response**
4. **Actionable recommendations guide remediation**
5. **Historical tracking supports capacity planning**

## Week 2 Summary

Congratulations! You've completed Week 2 and can now:
- ✅ Build custom metrics for any scenario
- ✅ Create Flex integrations quickly
- ✅ Develop production-grade OHI integrations
- ✅ Package and deploy monitoring solutions
- ✅ Calculate composite health scores
- ✅ Generate actionable insights from metrics

## Next Week Preview

In Week 3: Performance Optimizer, you'll learn to:
- Optimize metric collection at scale
- Reduce monitoring overhead
- Handle high-cardinality data
- Implement intelligent sampling
- Build performance dashboards

You're now a certified Metric Builder! 🎓