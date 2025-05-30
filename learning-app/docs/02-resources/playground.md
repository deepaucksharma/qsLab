# Interactive Playground

Practice and experiment with Kafka monitoring commands in a safe environment.

## Available Environments

### 1. Docker Terminal
Access a fully-featured terminal for running Docker and Kafka commands:
- Container management
- Log inspection
- Resource monitoring
- Network diagnostics

### 2. JMX Explorer
Interactive JMX exploration with simulated responses:
```bash
# Connect to JMX
open localhost:9999

# List domains
domains

# Explore Kafka metrics
domain kafka.server

# Get specific metric
bean kafka.server:name=MessagesInPerSec,type=BrokerTopicMetrics
get Count
```

### 3. NRQL Query Builder
Practice building New Relic queries:
```sql
-- Basic broker health
FROM KafkaBrokerSample 
SELECT latest(broker.messagesInPerSec) 
SINCE 30 minutes ago

-- Consumer lag analysis
FROM KafkaConsumerSample 
SELECT max(consumer.lag) 
FACET consumer.group, topic 
TIMESERIES
```

## Command Templates

### Kafka Operations

#### Topic Management
```bash
# List all topics
docker exec -it kafka-broker kafka-topics \
  --list \
  --bootstrap-server localhost:9092

# Create a topic
docker exec -it kafka-broker kafka-topics \
  --create \
  --topic test-events \
  --partitions 3 \
  --replication-factor 1 \
  --bootstrap-server localhost:9092

# Describe topic
docker exec -it kafka-broker kafka-topics \
  --describe \
  --topic test-events \
  --bootstrap-server localhost:9092

# Delete topic
docker exec -it kafka-broker kafka-topics \
  --delete \
  --topic test-events \
  --bootstrap-server localhost:9092
```

#### Producer Operations
```bash
# Console producer
docker exec -it kafka-broker kafka-console-producer \
  --topic test-events \
  --bootstrap-server localhost:9092

# Performance test producer
docker exec -it kafka-broker kafka-producer-perf-test \
  --topic test-events \
  --num-records 10000 \
  --record-size 100 \
  --throughput 100 \
  --producer-props bootstrap.servers=localhost:9092
```

#### Consumer Operations
```bash
# Console consumer (from beginning)
docker exec -it kafka-broker kafka-console-consumer \
  --topic test-events \
  --from-beginning \
  --bootstrap-server localhost:9092

# Consumer with group
docker exec -it kafka-broker kafka-console-consumer \
  --topic test-events \
  --group test-consumer-group \
  --bootstrap-server localhost:9092

# List consumer groups
docker exec -it kafka-broker kafka-consumer-groups \
  --list \
  --bootstrap-server localhost:9092

# Describe consumer group
docker exec -it kafka-broker kafka-consumer-groups \
  --describe \
  --group test-consumer-group \
  --bootstrap-server localhost:9092
```

### JMX Exploration

#### Basic JMX Commands
```bash
# Connect to JMX
echo "open localhost:9999" | docker exec -i kafka-broker java -jar /jmxterm.jar

# List all MBeans
echo -e "open localhost:9999\nbeans" | docker exec -i kafka-broker java -jar /jmxterm.jar

# Get specific metric
echo -e "open localhost:9999\nget -b kafka.server:type=BrokerTopicMetrics,name=MessagesInPerSec Count" | docker exec -i kafka-broker java -jar /jmxterm.jar
```

#### Common JMX Queries
```bash
# Messages per second
kafka.server:type=BrokerTopicMetrics,name=MessagesInPerSec

# Bytes in/out per second
kafka.server:type=BrokerTopicMetrics,name=BytesInPerSec
kafka.server:type=BrokerTopicMetrics,name=BytesOutPerSec

# Under-replicated partitions
kafka.server:type=ReplicaManager,name=UnderReplicatedPartitions

# Active controller count
kafka.controller:type=KafkaController,name=ActiveControllerCount

# Request latencies
kafka.network:type=RequestMetrics,name=TotalTimeMs,request=Produce
kafka.network:type=RequestMetrics,name=TotalTimeMs,request=FetchConsumer
```

### Docker Operations

#### Container Management
```bash
# List running containers
docker ps

# List all containers
docker ps -a

# View container logs
docker logs --tail 50 -f kafka-broker

# Execute command in container
docker exec -it kafka-broker bash

# View resource usage
docker stats --no-stream

# Inspect container
docker inspect kafka-broker
```

#### Network Diagnostics
```bash
# List networks
docker network ls

# Inspect network
docker network inspect bridge

# Test connectivity
docker exec -it kafka-broker ping kafka-zookeeper
```

## NRQL Practice Queries

### Basic Queries
```sql
-- Broker overview
FROM KafkaBrokerSample 
SELECT average(broker.messagesInPerSec) AS 'Avg Messages/sec',
       average(broker.bytesInPerSec) AS 'Avg Bytes/sec',
       uniqueCount(broker_id) AS 'Active Brokers'
SINCE 1 hour ago

-- Topic activity
FROM KafkaTopicSample 
SELECT sum(topic.messagesInPerSec) 
FACET topic 
SINCE 30 minutes ago

-- Consumer lag tracking
FROM KafkaConsumerSample 
SELECT max(consumer.lag) 
FACET consumer.group, topic 
TIMESERIES SINCE 1 hour
```

### Advanced Queries
```sql
-- Broker performance percentiles
FROM KafkaBrokerSample 
SELECT percentile(broker.requestLatencyAvg, 50, 95, 99) 
FACET broker_id 
SINCE 1 hour

-- Consumer lag alerts
FROM KafkaConsumerSample 
SELECT max(consumer.lag) AS 'Max Lag',
       average(consumer.lag) AS 'Avg Lag',
       rate(max(consumer.lag), 1 minute) AS 'Lag Growth Rate'
WHERE consumer.lag > 1000
FACET consumer.group
SINCE 30 minutes

-- Multi-metric correlation
FROM KafkaBrokerSample, SystemSample 
SELECT average(broker.messagesInPerSec) AS 'Messages/sec',
       average(cpuPercent) AS 'CPU %',
       average(memoryUsedPercent) AS 'Memory %'
WHERE hostname IN (SELECT hostname FROM KafkaBrokerSample)
TIMESERIES SINCE 2 hours
```

## Configuration Examples

### nri-kafka Configuration
```yaml
integrations:
  - name: nri-kafka
    env:
      CLUSTER_NAME: kafka-playground
      AUTODISCOVER_STRATEGY: bootstrap
      BOOTSTRAP_BROKER_HOST: localhost
      BOOTSTRAP_BROKER_KAFKA_PORT: 9092
      BOOTSTRAP_BROKER_JMX_PORT: 9999
      
      # Topic configuration
      COLLECT_TOPIC_DATA: true
      TOPIC_MODE: all
      
      # Consumer configuration  
      CONSUMER_OFFSET: true
      CONSUMER_GROUPS: '{"test-consumer-group": ["test-events"]}'
      
      # Collection settings
      TIMEOUT: 30
    interval: 30s
```

### Docker Compose Example
```yaml
version: '3.9'
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
      - "9999:9999"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: 'zookeeper:2181'
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_JMX_PORT: 9999
      KAFKA_JMX_HOSTNAME: localhost
```

## Tips and Tricks

### Performance Testing
1. Start small - test with 100 messages before scaling up
2. Monitor resource usage during tests
3. Use compression for large messages
4. Test different partition counts

### Debugging
1. Always check broker logs first
2. Verify JMX connectivity before assuming metrics issues
3. Use `kafka-log-dirs` to check disk usage
4. Consumer group describe shows lag details

### Best Practices
1. Name topics and consumer groups descriptively
2. Set retention policies appropriately
3. Monitor under-replicated partitions
4. Keep consumer lag under control

Ready to experiment? Open the playground terminal and start exploring!