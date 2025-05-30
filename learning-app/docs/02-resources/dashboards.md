# Dashboard Templates

Pre-built dashboard templates for different Kafka monitoring scenarios.

## Quick Start Dashboard

Essential metrics for getting started with Kafka monitoring.

### Widgets

#### 1. Cluster Health Overview
```sql
-- Overall cluster health score (0-100)
SELECT 100 - (
    (SELECT uniqueCount(broker_id) FROM KafkaBrokerSample 
     WHERE broker.underReplicatedPartitions > 0) * 20 +
    (SELECT uniqueCount(broker_id) FROM KafkaBrokerSample 
     WHERE broker.offlinePartitionsCount > 0) * 50
) AS 'Health Score'
FROM KafkaBrokerSample
SINCE 5 minutes ago
```

#### 2. Message Flow
```sql
-- Messages in/out per second
SELECT 
    sum(broker.messagesInPerSec) AS 'Messages In/sec',
    sum(broker.messagesOutPerSec) AS 'Messages Out/sec'
FROM KafkaBrokerSample
TIMESERIES SINCE 1 hour
```

#### 3. Top Topics by Activity
```sql
-- Most active topics
SELECT sum(topic.messagesInPerSec) AS 'Messages/sec'
FROM KafkaTopicSample
FACET topic
LIMIT 10
SINCE 30 minutes ago
```

#### 4. Consumer Lag Summary
```sql
-- Consumer groups with highest lag
SELECT max(consumer.lag) AS 'Max Lag'
FROM KafkaConsumerSample
FACET consumer.group
WHERE consumer.lag > 0
LIMIT 10
SINCE 30 minutes ago
```

## Performance Dashboard

Detailed performance metrics for optimization.

### Widgets

#### 1. Request Latencies
```sql
-- Percentile latencies by request type
SELECT 
    percentile(broker.produceRequestLatencyMs, 50) AS 'p50',
    percentile(broker.produceRequestLatencyMs, 95) AS 'p95',
    percentile(broker.produceRequestLatencyMs, 99) AS 'p99'
FROM KafkaBrokerSample
FACET request.type
TIMESERIES SINCE 2 hours
```

#### 2. Throughput Analysis
```sql
-- Bytes in/out with rate calculation
SELECT 
    rate(sum(broker.bytesInPerSec), 1 minute) / 1024 / 1024 AS 'MB/s In',
    rate(sum(broker.bytesOutPerSec), 1 minute) / 1024 / 1024 AS 'MB/s Out',
    rate(sum(broker.bytesInPerSec), 1 minute) / rate(sum(broker.bytesOutPerSec), 1 minute) AS 'In/Out Ratio'
FROM KafkaBrokerSample
TIMESERIES SINCE 6 hours
```

#### 3. Partition Distribution
```sql
-- Partition leadership distribution
SELECT 
    count(*) AS 'Partitions Led',
    average(broker.logSize) / 1024 / 1024 AS 'Avg Log Size (MB)'
FROM KafkaBrokerSample
FACET broker_id
SINCE 1 hour
```

#### 4. JVM Performance
```sql
-- JVM metrics for brokers
SELECT 
    average(jvm.heapUsed) / 1024 / 1024 AS 'Heap Used (MB)',
    average(jvm.gcTime) AS 'GC Time (ms)',
    average(jvm.gcCount) AS 'GC Count'
FROM JVMSample
WHERE hostname IN (SELECT hostname FROM KafkaBrokerSample)
TIMESERIES SINCE 2 hours
```

## Consumer Analytics Dashboard

Deep dive into consumer behavior and performance.

### Widgets

#### 1. Consumer Lag Trends
```sql
-- Lag trends with prediction
SELECT 
    max(consumer.lag) AS 'Current Lag',
    derivative(max(consumer.lag), 1 minute) AS 'Lag Change Rate'
FROM KafkaConsumerSample
FACET consumer.group, topic
TIMESERIES SINCE 3 hours
```

#### 2. Consumer Processing Rate
```sql
-- Messages processed per consumer group
SELECT 
    rate(sum(consumer.recordsConsumedRate), 1 minute) AS 'Records/min',
    average(consumer.fetchLatencyAvg) AS 'Avg Fetch Latency (ms)'
FROM KafkaConsumerSample
FACET consumer.group
TIMESERIES SINCE 1 hour
```

#### 3. Rebalance Activity
```sql
-- Consumer group rebalances
SELECT 
    sum(consumer.rebalanceCount) AS 'Rebalances',
    average(consumer.lastRebalanceSeconds) AS 'Avg Rebalance Time (s)'
FROM KafkaConsumerSample
FACET consumer.group
SINCE 24 hours
```

#### 4. Consumer Efficiency
```sql
-- Consumption efficiency metrics
SELECT 
    average(consumer.recordsPerRequestAvg) AS 'Records per Request',
    average(consumer.bytesPerRequestAvg) / 1024 AS 'KB per Request',
    average(consumer.fetchLatencyAvg) / average(consumer.recordsPerRequestAvg) AS 'Latency per Record (ms)'
FROM KafkaConsumerSample
FACET consumer.group
SINCE 1 hour
```

## Infrastructure Correlation Dashboard

Correlate Kafka metrics with infrastructure.

### Widgets

#### 1. CPU vs Message Rate
```sql
-- CPU usage correlated with message rate
SELECT 
    average(cpuPercent) AS 'CPU %',
    average(broker.messagesInPerSec) AS 'Messages/sec'
FROM SystemSample, KafkaBrokerSample
WHERE SystemSample.hostname = KafkaBrokerSample.hostname
TIMESERIES SINCE 2 hours
```

#### 2. Disk Usage Trends
```sql
-- Disk usage and growth rate
SELECT 
    average(diskUsedPercent) AS 'Disk Used %',
    derivative(average(diskUsedPercent), 1 hour) AS 'Growth Rate %/hour'
FROM SystemSample
WHERE hostname IN (SELECT hostname FROM KafkaBrokerSample)
FACET hostname
TIMESERIES SINCE 24 hours
```

#### 3. Network Utilization
```sql
-- Network bandwidth usage
SELECT 
    average(networkReceiveBytesPerSecond) / 1024 / 1024 AS 'Network In (MB/s)',
    average(networkTransmitBytesPerSecond) / 1024 / 1024 AS 'Network Out (MB/s)',
    average(broker.messagesInPerSec) AS 'Messages/sec'
FROM SystemSample, KafkaBrokerSample
WHERE SystemSample.hostname = KafkaBrokerSample.hostname
TIMESERIES SINCE 1 hour
```

#### 4. Memory Pressure
```sql
-- Memory usage and GC impact
SELECT 
    average(memoryUsedPercent) AS 'Memory %',
    average(jvm.gcTimePercent) AS 'GC Time %',
    average(broker.requestQueueSize) AS 'Request Queue Size'
FROM SystemSample, JVMSample, KafkaBrokerSample
WHERE SystemSample.hostname = KafkaBrokerSample.hostname
  AND JVMSample.hostname = KafkaBrokerSample.hostname
TIMESERIES SINCE 2 hours
```

## SLO Dashboard

Track Service Level Objectives for Kafka.

### Widgets

#### 1. Message Delivery SLO
```sql
-- 99.9% of messages delivered < 100ms
SELECT 
    percentage(count(*), WHERE broker.produceRequestLatencyMs < 100) AS 'Within SLO',
    100 - percentage(count(*), WHERE broker.produceRequestLatencyMs < 100) AS 'Error Budget Used'
FROM KafkaBrokerSample
SINCE 30 days
```

#### 2. Consumer Lag SLO
```sql
-- 99% of time lag < 10000 messages
SELECT 
    percentage(count(*), WHERE consumer.lag < 10000) AS 'Within SLO',
    100 - percentage(count(*), WHERE consumer.lag < 10000) AS 'Error Budget Used'
FROM KafkaConsumerSample
FACET consumer.group
SINCE 30 days
```

#### 3. Availability SLO
```sql
-- 99.99% broker availability
SELECT 
    percentage(count(*), WHERE broker.underReplicatedPartitions = 0 
               AND broker.offlinePartitionsCount = 0) AS 'Availability %'
FROM KafkaBrokerSample
SINCE 30 days
```

#### 4. Error Budget Burn Rate
```sql
-- How fast we're consuming error budget
WITH 
    daily_errors AS (
        SELECT count(*) AS errors 
        FROM KafkaBrokerSample 
        WHERE broker.failedFetchRequestsPerSec > 0 
           OR broker.failedProduceRequestsPerSec > 0
        SINCE 1 day ago
    ),
    monthly_budget AS (
        SELECT 0.001 * count(*) AS budget 
        FROM KafkaBrokerSample 
        SINCE 30 days ago
    )
SELECT 
    (daily_errors.errors * 30) / monthly_budget.budget AS 'Burn Rate'
FROM daily_errors, monthly_budget
```

## Alert Conditions

### Critical Alerts

```sql
-- Under-replicated partitions
SELECT count(*)
FROM KafkaBrokerSample
WHERE broker.underReplicatedPartitions > 0
```
**Threshold**: > 0 for 5 minutes

```sql
-- Consumer lag critical
SELECT max(consumer.lag)
FROM KafkaConsumerSample
FACET consumer.group
```
**Threshold**: > 100000 for 10 minutes

```sql
-- Disk space critical
SELECT average(diskUsedPercent)
FROM SystemSample
WHERE hostname IN (SELECT hostname FROM KafkaBrokerSample)
```
**Threshold**: > 90 for 5 minutes

### Warning Alerts

```sql
-- High produce latency
SELECT percentile(broker.produceRequestLatencyMs, 95)
FROM KafkaBrokerSample
```
**Threshold**: > 200 for 15 minutes

```sql
-- Consumer lag growing
SELECT derivative(max(consumer.lag), 5 minute)
FROM KafkaConsumerSample
FACET consumer.group
```
**Threshold**: > 1000 for 10 minutes

## Dashboard Best Practices

### Layout Guidelines
1. **Overview First**: Start with high-level health metrics
2. **Group Related Metrics**: Keep related widgets together
3. **Use Time Ranges Wisely**: Shorter for real-time, longer for trends
4. **Add Context**: Include thresholds and targets on charts

### Performance Tips
1. **Limit Cardinality**: Use LIMIT for high-cardinality facets
2. **Optimize Queries**: Use WHERE clauses to filter early
3. **Cache When Possible**: Use longer time ranges for stable metrics
4. **Avoid Complex Joins**: Keep queries simple and focused

### Visual Design
1. **Color Coding**: Green = good, yellow = warning, red = critical
2. **Chart Types**: 
   - Line charts for trends
   - Bar charts for comparisons
   - Billboard for key metrics
   - Heatmaps for distributions
3. **Annotations**: Mark deployments and incidents
4. **Mobile Friendly**: Test on different screen sizes

Ready to build your perfect Kafka dashboard? Start with these templates and customize for your needs!