# NRI-Kafka Architecture Deep Dive

Understanding how nri-kafka collects and processes metrics from your Kafka clusters.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    New Relic Platform                       │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │    NRDB     │  │  Dashboards  │  │     Alerts      │  │
│  └──────▲──────┘  └──────────────┘  └─────────────────┘  │
└─────────┼───────────────────────────────────────────────────┘
          │ HTTPS/JSON
┌─────────┼───────────────────────────────────────────────────┐
│         │           Infrastructure Agent                     │
│  ┌──────┴──────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Ingest    │  │   Process    │  │    Schedule     │  │
│  │   Handler   │  │   Manager    │  │    Runner       │  │
│  └──────▲──────┘  └──────────────┘  └────────┬────────┘  │
└─────────┼──────────────────────────────────────┼───────────┘
          │ stdout (JSON)                        │ exec
┌─────────┼──────────────────────────────────────┼───────────┐
│         │              nri-kafka                │           │
│  ┌──────┴──────┐  ┌──────────────┐  ┌─────────▼────────┐  │
│  │   Output    │◄─┤  Transformer │◄─┤    Collector    │  │
│  │  Generator  │  │   & Filter   │  │     Engine      │  │
│  └─────────────┘  └──────────────┘  └────────┬─────────┘  │
└────────────────────────────────────────────────┼───────────┘
                                                 │
         ┌───────────────┬───────────────┬───────┼────────┐
         │ JMX (9999)    │ Kafka API     │ CloudWatch    │
┌────────▼────────┐ ┌────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
│     Broker 1    │ │  Broker 2 │ │   Broker 3  │ │  AWS MSK    │
│  ┌───────────┐  │ │           │ │             │ │             │
│  │ JMX MBeans│  │ │           │ │             │ │             │
│  └───────────┘  │ │           │ │             │ │             │
└─────────────────┘ └───────────┘ └─────────────┘ └─────────────┘
```

## Component Details

### 1. Infrastructure Agent

The New Relic Infrastructure agent is the host for nri-kafka:

**Responsibilities:**
- Process lifecycle management
- Scheduling integration runs
- Collecting integration output
- Sending data to New Relic
- Error handling and retry logic

**Configuration:**
```yaml
# /etc/newrelic-infra/newrelic-infra.yml
license_key: YOUR_LICENSE_KEY
display_name: kafka-host-1
log:
  level: info
custom_attributes:
  environment: production
  service: kafka
```

### 2. NRI-Kafka Integration

The Kafka-specific integration that knows how to collect Kafka metrics:

**Core Components:**

#### Discovery Engine
- Auto-discovers brokers via bootstrap broker
- Identifies all cluster members
- Maps broker IDs to hosts/ports
- Handles dynamic cluster changes

#### Collection Engine
- Manages concurrent metric collection
- Implements retry logic
- Handles timeouts gracefully
- Batches requests efficiently

#### Transformer
- Converts JMX counters to rates
- Normalizes metric names
- Adds metadata and dimensions
- Filters based on configuration

### 3. Data Sources

#### JMX (Java Management Extensions)
Primary source for broker and some client metrics:

```java
// Example JMX MBean
kafka.server:type=BrokerTopicMetrics,name=MessagesInPerSec
├── Count: 1234567          // Total messages (counter)
├── OneMinuteRate: 1024.5   // Rate over 1 minute
├── FiveMinuteRate: 1019.3  // Rate over 5 minutes
└── MeanRate: 987.6         // Average rate since start
```

**Access Pattern:**
1. Connect to JMX port (default: 9999)
2. Query MBean server
3. Retrieve attribute values
4. Close connection (or reuse from pool)

#### Kafka Admin API
For consumer group and offset information:

```go
// Pseudo-code for consumer lag calculation
offsets := adminClient.FetchOffsets(consumerGroup, topics)
for partition in topic.partitions {
    highWaterMark := partition.HighWaterMark
    consumerOffset := offsets[partition]
    lag := highWaterMark - consumerOffset
}
```

#### CloudWatch (MSK only)
For AWS Managed Streaming for Kafka:

```go
// CloudWatch metric query
metrics := cloudwatch.GetMetricStatistics({
    Namespace: "AWS/Kafka",
    MetricName: "BytesInPerSec",
    Dimensions: [{Name: "Cluster Name", Value: clusterName}],
    StartTime: time.Now().Add(-5 * time.Minute),
    EndTime: time.Now(),
    Period: 60,
    Statistics: ["Average"],
})
```

## Data Flow

### 1. Collection Phase

```
nri-kafka start
    ├── Parse configuration
    ├── Initialize clients (JMX, Kafka, CloudWatch)
    ├── Discover cluster topology
    ├── For each broker:
    │   ├── Connect to JMX
    │   ├── Query configured MBeans
    │   ├── Collect raw values
    │   └── Store with timestamp
    ├── Query Kafka Admin API:
    │   ├── List consumer groups
    │   ├── Fetch offsets
    │   ├── Calculate lag
    │   └── Get topic metadata
    └── If MSK:
        └── Query CloudWatch metrics
```

### 2. Processing Phase

```
Raw Metrics
    ├── Counter to Rate conversion
    │   └── (current_value - previous_value) / time_delta
    ├── Unit conversions
    │   └── bytes → MB, microseconds → milliseconds
    ├── Aggregations
    │   └── Sum across partitions, average across brokers
    ├── Filtering
    │   └── Apply include/exclude rules
    └── Enrichment
        └── Add cluster name, environment, broker ID
```

### 3. Output Phase

```json
{
  "name": "com.newrelic.kafka",
  "protocol_version": "3",
  "integration_version": "2.3.0",
  "data": [
    {
      "entity": {
        "name": "broker-1",
        "type": "kafka-broker",
        "id_attributes": [
          {"key": "cluster", "value": "production"},
          {"key": "broker_id", "value": "1"}
        ]
      },
      "metrics": [
        {
          "event_type": "KafkaBrokerSample",
          "broker.messagesInPerSec": 1024.5,
          "broker.bytesInPerSec": 104857.6,
          "broker.underReplicatedPartitions": 0,
          "timestamp": 1634567890
        }
      ],
      "inventory": {
        "broker": {
          "version": "2.8.0",
          "startup_time": "2021-10-18T10:00:00Z"
        }
      },
      "events": []
    }
  ]
}
```

## Configuration Deep Dive

### Essential Configuration

```yaml
integrations:
  - name: nri-kafka
    env:
      # Cluster identification
      CLUSTER_NAME: production-kafka
      
      # Discovery method
      AUTODISCOVER_STRATEGY: bootstrap
      BOOTSTRAP_BROKER_HOST: broker1.example.com
      BOOTSTRAP_BROKER_KAFKA_PORT: 9092
      BOOTSTRAP_BROKER_JMX_PORT: 9999
      
      # Authentication (if needed)
      SASL_MECHANISM: SCRAM-SHA-512
      SASL_USERNAME: ${KAFKA_USERNAME}
      SASL_PASSWORD: ${KAFKA_PASSWORD}
      
      # TLS Configuration
      TLS_INSECURE_SKIP_VERIFY: false
      TLS_CA_FILE: /etc/kafka/ca-cert.pem
```

### Performance Tuning

```yaml
      # Collection optimization
      TIMEOUT: 30000                    # 30 second timeout
      COLLECT_BROKER_TOPIC_DATA: false  # Disable per-topic broker metrics
      TOPIC_MODE: regex                 # Filter topics
      TOPIC_REGEX: "^(important-).*"    # Only important topics
      
      # Consumer configuration
      CONSUMER_OFFSET: true
      CONSUMER_GROUPS_REGEX: "^(prod-).*"  # Only production consumers
      
      # JMX optimization
      JMX_USER: monitor
      JMX_PASSWORD: ${JMX_PASSWORD}
      CONNECTION_TIMEOUT: 10000
      REQUEST_TIMEOUT: 30000
```

### Advanced Features

```yaml
      # Local entity mode (each broker reports independently)
      LOCAL_ONLY_COLLECTION: true
      
      # Custom metrics
      CUSTOM_METRICS_FILE: /etc/kafka/custom-metrics.json
      
      # Debugging
      VERBOSE: true
      METRICS_VERBOSE: true
      
      # Sharding for large clusters
      BROKER_SHARD_COUNT: 3
      BROKER_SHARD_ID: 1
```

## Metric Collection Patterns

### 1. Bootstrap Discovery

```
1. Connect to bootstrap broker
2. Request cluster metadata
3. Discover all brokers:
   {
     "brokers": [
       {"id": 1, "host": "broker1", "port": 9092, "jmx_port": 9999},
       {"id": 2, "host": "broker2", "port": 9093, "jmx_port": 10000},
       {"id": 3, "host": "broker3", "port": 9094, "jmx_port": 10001}
     ]
   }
4. Connect to each broker's JMX port
```

### 2. Zookeeper Discovery (deprecated)

```
1. Connect to Zookeeper
2. Read /brokers/ids
3. Parse broker registration
4. Extract JMX ports from broker info
```

### 3. Static Configuration

```yaml
# When auto-discovery isn't possible
BROKERS: '[
  {"host": "broker1", "port": 9092, "jmx_port": 9999},
  {"host": "broker2", "port": 9093, "jmx_port": 10000}
]'
```

## Troubleshooting Architecture Issues

### Connection Flow Debugging

```bash
# 1. Test JMX connectivity
telnet broker1 9999

# 2. Check JMX with jmxterm
echo "open broker1:9999" | java -jar jmxterm.jar

# 3. Verify Kafka connectivity
kafka-broker-api-versions --bootstrap-server broker1:9092

# 4. Test from container
docker exec -it newrelic-infra bash
cd /var/db/newrelic-infra/nri-kafka
./nri-kafka --discovery_only
```

### Common Architecture Problems

1. **Network Segmentation**
   - JMX ports not accessible
   - Firewall blocking RMI callbacks
   - Docker network isolation

2. **Authentication Layers**
   - JMX authentication required
   - Kafka SASL/SCRAM configured
   - Certificate validation issues

3. **Resource Constraints**
   - Too many metrics overwhelming agent
   - JMX connection pool exhaustion
   - Memory pressure from large clusters

## Best Practices

### 1. Deployment Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Kafka Broker  │     │   Kafka Broker  │     │   Kafka Broker  │
│   + JMX         │     │   + JMX         │     │   + JMX         │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┴───────────────────────┘
                                 │
                     ┌───────────┴───────────┐
                     │   Monitoring Host     │
                     │  ┌─────────────────┐  │
                     │  │ Infrastructure  │  │
                     │  │     Agent       │  │
                     │  │       +         │  │
                     │  │   nri-kafka    │  │
                     │  └─────────────────┘  │
                     └───────────────────────┘
```

### 2. High Availability

- Deploy multiple monitoring hosts
- Use different bootstrap brokers
- Implement collection sharding
- Enable local-only mode for resilience

### 3. Security Architecture

- Use dedicated monitoring credentials
- Implement JMX SSL/TLS
- Restrict JMX access via firewall
- Audit monitoring access

### 4. Scaling Considerations

- For 10+ brokers: Increase timeout values
- For 100+ topics: Use topic filtering
- For 1000+ partitions: Enable sampling
- For multi-region: Deploy regional collectors

## Integration with New Relic Platform

### Entity Synthesis

nri-kafka creates these entity types:
- `KAFKA_BROKER` - Individual broker instances
- `KAFKA_TOPIC` - Topics (when enabled)
- `KAFKA_CONSUMER` - Consumer groups

### Relationships

```
KAFKA_BROKER --produces--> KAFKA_TOPIC
KAFKA_TOPIC <--consumes-- KAFKA_CONSUMER
KAFKA_BROKER --member-of--> Cluster
```

### Golden Metrics

Automatically calculated:
- **Throughput**: Messages and bytes per second
- **Latency**: Request processing times
- **Errors**: Failed requests and offline partitions
- **Saturation**: Disk usage and network utilization

Ready to dive deeper? Check out the [source code](https://github.com/newrelic/nri-kafka) for implementation details!