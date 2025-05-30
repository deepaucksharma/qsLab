# NRI-Kafka Architecture Deep Dive

[← Back to Core Concepts](../00-foundation/core-concepts.md) | [See Visual Diagrams →](../../reference-diagrams/README.md)

## Overview
The New Relic Kafka Integration (nri-kafka) is a sophisticated monitoring solution that collects metrics from Kafka clusters and sends them to New Relic. This document provides a comprehensive understanding of its architecture.

## Architecture Layers

### 1. Configuration Layer
```yaml
# How configuration flows through the system
Configuration Sources:
├── kafka-config.yml (primary)
├── Environment Variables (override)
└── Command Line Arguments (highest priority)
```

**Key Components:**
- **ArgumentParser**: Parses and validates configuration
- **Config Validator**: Ensures required fields and valid values
- **Environment Override**: Allows env vars to override file config

**Example Configuration**: See [kafka-config.yml](../../labs/week1-xray/configs/kafka-config.yml)

### 2. Discovery Layer
The integration supports two discovery strategies:

#### Bootstrap Discovery
```go
// Connects to one broker to discover entire cluster
bootstrapBroker → Metadata Request → Full Broker List
```
- **Advantage**: Simple configuration (one broker needed)
- **Use case**: Most deployments

#### Zookeeper Discovery
```go
// Reads broker info from Zookeeper
Zookeeper /brokers/ids → Parse JSON → Broker List
```
- **Advantage**: Direct cluster state access
- **Use case**: Legacy deployments, complex topologies

### 3. Collection Modes

#### Core Collection Mode (Inventory)
- **Purpose**: Collect broker, topic, and client metrics via JMX
- **Worker Pools**:  - Broker Workers: 3 concurrent
  - Topic Workers: 5 concurrent  
  - Producer Workers: 3 concurrent
  - Consumer Workers: 3 concurrent

#### Consumer Offset Mode
- **Purpose**: Collect consumer lag metrics via Kafka API
- **Method**: Uses Sarama client to fetch consumer group offsets
- **Calculation**: `lag = logEndOffset - committedOffset`

### 4. Data Flow

```
Kafka Cluster
    ↓
[JMX Port 9999] [Kafka API Port 9092]
    ↓               ↓
JMX Queries    Offset Queries
    ↓               ↓
nri-kafka Worker Pools
    ↓
Metric Transformation
    ↓
New Relic Samples
    ↓
JSON Output (stdout)
    ↓
NR Infrastructure Agent
    ↓
New Relic Platform
```

### 5. Key Components

#### JMX Integration
- Uses `nrjmx` helper tool
- Handles Java RMI protocol
- Supports SSL/TLS and authentication
- Connection pooling for efficiency
- See implementation: [metric-tracer.go](../../debugging-toolkit/metric-tracer.go)

#### Metric Definitions
- Located in `src/metrics/*_definitions.go`
- Define MBean → Metric mappings
- Include transformation rules (counter → rate)

#### Worker Pool Architecture
- Channel-based work distribution
- Prevents connection exhaustion
- Handles errors gracefully
- Supports concurrent collection

## Security Features
- SASL support (PLAIN, SCRAM, GSSAPI)
- SSL/TLS for Kafka connections
- JMX authentication
- Secure credential management

## Performance Optimizations
- Connection pooling
- Parallel collection
- Configurable worker counts
- Metric filtering
- Batch processing

## Visual Architecture

For detailed visual representations:
- [Functional Architecture](../../reference-diagrams/functional-architecture.mmd)
- [Domain Model](../../reference-diagrams/domain-model.mmd)
- [Data Flow Sequence](../../reference-diagrams/data-flow-sequence.mmd)
- [Technical Architecture](../../reference-diagrams/technical-architecture.mmd)

## Practical Understanding

To see this architecture in action:
1. Complete [Week 1 Labs](../../labs/week1-xray/README.md)
2. Build the [metric tracer](../../debugging-toolkit/metric-tracer.go)
3. Study the [tombstone monitor](../../custom-integrations/tombstone-monitor/)

## Next Steps

- For hands-on experience: [Week 1 X-Ray Labs](../../labs/week1-xray/README.md)
- For advanced topics: [Enhanced Learning Journey](../02-advanced/enhanced-learning-journey.md)
- For visual learning: [Reference Diagrams](../../reference-diagrams/README.md)

---

[← Back to Core Concepts](../00-foundation/core-concepts.md) | [Next: Week 1 Labs →](../../labs/week1-xray/README.md)