# Core Kafka Observability Concepts

## The Three Pillars of Kafka Metrics

### 1. Infrastructure Metrics (The Foundation)
**What**: Server health - CPU, memory, disk, network
**Why**: Kafka is I/O intensive
**Key Metrics**:
- `system.cpu.percent` - High CPU → possible GC issues
- `system.disk.used.percent` - Critical for Kafka's log storage
- `system.network.bytes.in/out` - Bandwidth saturation indicator

### 2. Broker Metrics (The Engine)
**What**: Kafka-specific broker performance
**Why**: Understand message flow and broker health
**Key Metrics**:
- `broker.messagesInPerSec` - Incoming message rate
- `broker.bytesInPerSec` - Incoming data volume
- `broker.underReplicatedPartitions` - Replication health
- `broker.activeControllerCount` - Should be 1 per cluster

### 3. Application Metrics (The Experience)
**What**: Producer and consumer performance
**Why**: End-to-end latency and throughput
**Key Metrics**:
- `consumer.lag` - THE golden metric for consumers
- `producer.requestLatencyAvg` - Write performance
- `consumer.fetchLatencyAvg` - Read performance
- `consumer.commitLatencyAvg` - Offset commit health

## Data Collection Methods

### JMX (Java Management Extensions)
- **What**: Java's built-in monitoring interface
- **Used for**: Broker and client metrics
- **Access**: Port 9999 (configurable)
- **Protocol**: RMI (Remote Method Invocation)

### Kafka Admin API
- **What**: Native Kafka protocol operations
- **Used for**: Consumer offsets, topic metadata
- **Access**: Kafka broker port (9092)
- **Protocol**: Kafka wire protocol

### CloudWatch (AWS MSK)
- **What**: AWS's monitoring service
- **Used for**: MSK-specific metrics
- **Access**: AWS API
- **Protocol**: HTTPS REST API

## The Metric Journey
```
Source → Collection → Transformation → Storage → Visualization
Kafka  → nri-kafka → Rate Calc     → NRDB    → Dashboards
```
