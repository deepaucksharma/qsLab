# Kafka Observability Overview

## Your Foundation: From API Servers to Kafka

You already understand API server monitoring - let's build on that knowledge to master Kafka observability.

### Mental Model Bridge

Think of Kafka monitoring like monitoring a distributed database that also acts as a message queue:

| API Server Model | Kafka Model |
|-----------------|-------------|
| HTTP requests → Load Balancer → API Servers → Database | Producers → Kafka Brokers → Consumers |
| Request/Response pattern | Async publish/subscribe pattern |
| Stateless servers | Stateful brokers (own partition data) |
| /metrics endpoint | JMX port (9999) |
| Request rate metrics | Messages In/Out per second |
| Error rate | Failed fetch/produce requests |
| Latency P99 | Request latency percentiles |

### The Three Pillars of Kafka Metrics

#### 1. Infrastructure Metrics (The Foundation)
**What**: Server health - CPU, memory, disk, network  
**Why**: Kafka is I/O intensive  
**Key Metrics**:
- `system.cpu.percent` - High CPU → possible GC issues
- `system.disk.used.percent` - Critical for Kafka's log storage
- `system.network.bytes.in/out` - Bandwidth saturation indicator

**In New Relic**: SystemSample events from Infrastructure agent

#### 2. Broker Metrics (The Engine)
**What**: Kafka-specific broker performance  
**Why**: Understand message flow and broker health  
**Key Metrics**:
- `broker.messagesInPerSec` - Incoming message rate
- `broker.bytesInPerSec` - Incoming data volume
- `broker.underReplicatedPartitions` - Replication health (should be 0)
- `broker.activeControllerCount` - Should be 1 per cluster

**In New Relic**: KafkaBrokerSample events from nri-kafka

#### 3. Application Metrics (The Experience)
**What**: Producer and consumer performance  
**Why**: End-to-end latency and throughput  
**Key Metrics**:
- `consumer.lag` - THE golden metric for consumers
- `producer.requestLatencyAvg` - Write performance
- `consumer.fetchLatencyAvg` - Read performance
- `consumer.commitLatencyAvg` - Offset commit health

**In New Relic**: KafkaProducerSample, KafkaConsumerSample events

## Data Collection Methods

### JMX (Java Management Extensions)
- **What**: Java's built-in monitoring interface
- **Used for**: Broker and client metrics
- **Access**: Port 9999 (configurable)
- **Protocol**: RMI (Remote Method Invocation)
- **Tool**: nrjmx helper process
- **Example MBean**: `kafka.server:type=BrokerTopicMetrics,name=MessagesInPerSec`

### Kafka Admin API
- **What**: Native Kafka protocol operations
- **Used for**: Consumer offsets, topic metadata
- **Access**: Kafka broker port (9092)
- **Protocol**: Kafka wire protocol
- **Library**: Shopify Sarama (Go)
- **Example**: Fetching consumer group lag

### CloudWatch (AWS MSK)
- **What**: AWS's monitoring service
- **Used for**: MSK-specific metrics
- **Access**: AWS API
- **Protocol**: HTTPS REST API
- **Note**: Only for AWS Managed Streaming for Kafka

## The Metric Journey

```
1. Source     → Kafka internal counters/gauges
2. Exposure   → JMX MBeans or Kafka API
3. Collection → nri-kafka polls every 30s
4. Transform  → Counter to rate conversion
5. Output     → JSON to stdout
6. Agent      → Infrastructure agent reads
7. Platform   → New Relic ingests and stores
8. Query      → NRQL for dashboards/alerts
```

## Key Differences to Internalize

1. **Pull vs Push**: 
   - API metrics: Usually pulled (Prometheus scrapes /metrics)
   - Kafka metrics: Pulled via JMX (nri-kafka queries MBeans)

2. **Stateless vs Stateful**:
   - API servers: Any server can handle any request
   - Kafka brokers: Specific broker owns specific partitions

3. **Sync vs Async**:
   - API: Request waits for response
   - Kafka: Producer fire-and-forget, Consumer polls

4. **Metrics Collection**:
   - API: HTTP GET to /metrics
   - Kafka: JMX RMI protocol to port 9999

## Understanding Consumer Lag

Consumer lag is the most important application metric:

```
Lag = Latest Offset in Topic - Consumer's Current Offset
```

- **Lag = 0**: Consumer is caught up
- **Lag increasing**: Consumer slower than producer
- **Lag decreasing**: Consumer catching up
- **Lag spike**: Possible consumer restart or issue

## Critical Metrics to Monitor

### For Kafka Health
1. **Under-replicated partitions** - Should always be 0
2. **Offline partitions** - Should always be 0
3. **Active controller** - Should be exactly 1
4. **ISR shrink/expand rate** - Indicates replication issues

### For Performance
1. **Request latency** - Producer/Fetch request times
2. **Request rate** - Messages and bytes in/out
3. **Log flush latency** - Disk I/O performance
4. **Network thread idle** - Capacity indicator

### For Applications
1. **Consumer lag** - How far behind consumers are
2. **Producer errors** - Failed sends
3. **Consumer errors** - Failed fetches
4. **Rebalance rate** - Consumer group stability

## Your Learning Path

This course follows a structured approach:

1. **Week 1: X-Ray Vision** - See through Kafka's complexity
2. **Week 2: Metric Builder** - Create what doesn't exist
3. **Week 3: Performance Optimizer** - Tune for efficiency
4. **Week 4: Issue Detective** - Solve production mysteries
5. **Week 5: Platform Architect** - Design complete solutions

Ready to begin? Let's start with the [Quick Start Guide](quick-start.md) to get your environment set up.