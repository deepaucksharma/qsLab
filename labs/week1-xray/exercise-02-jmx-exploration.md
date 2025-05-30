# Exercise 2: JMX Deep Dive

## 🎯 Objective
Explore Kafka's JMX MBean hierarchy and understand the wealth of metrics available.

## 🔍 What You'll Learn
- JMX MBean naming conventions
- How to discover available metrics
- The relationship between MBeans and Kafka components
- How to query specific metrics programmatically

## 📋 Prerequisites
- Completed Exercise 1
- Lab environment running
- Basic understanding of JMX concepts

## 🚀 Investigation Steps

### Step 1: Explore MBean Domains
```bash
# Connect to JMX
docker exec -it kafka-xray-jmxterm java -jar /jmxterm.jar

# List all domains
domains

# You should see:
# - kafka.server
# - kafka.network
# - kafka.log
# - kafka.controller
# - java.lang
```

### Step 2: Discover Broker MBeans
```bash
# In JMXTerm:
domain kafka.server
beans

# Look for patterns:
# - type=BrokerTopicMetrics
# - type=ReplicaManager
# - type=KafkaRequestHandlerPool
# - type=DelayedOperationPurgatory
```

### Step 3: Create MBean Inventory Script
Create `scripts/inventory-mbeans.sh`:
```bash
#!/bin/bash
echo "=== Kafka MBean Inventory ==="
docker exec kafka-xray-jmxterm java -jar /jmxterm.jar -n -v silent <<EOF | grep "kafka"
open localhost:9999
beans
EOF
```

### Step 4: Query Multiple Metrics
Create `scripts/multi-metric-query.sh`:
```bash
#!/bin/bash
METRICS=(
    "kafka.server:name=MessagesInPerSec,type=BrokerTopicMetrics"
    "kafka.server:name=BytesInPerSec,type=BrokerTopicMetrics"
    "kafka.server:name=BytesOutPerSec,type=BrokerTopicMetrics"
    "kafka.network:name=RequestsPerSec,request=Produce,type=RequestMetrics"
    "kafka.network:name=RequestsPerSec,request=FetchConsumer,type=RequestMetrics"
)

for metric in "${METRICS[@]}"; do
    echo "=== $metric ==="
    docker exec kafka-xray-jmxterm java -jar /jmxterm.jar -n -v silent <<EOF
open localhost:9999
get -b $metric Count
get -b $metric OneMinuteRate
EOF
done
```

## 🧪 Experiments

### Experiment 1: Topic-Specific Metrics
```bash
# Create multiple topics
for i in {1..5}; do
    docker exec kafka-xray-broker kafka-topics --create \
        --topic experiment-topic-$i \
        --bootstrap-server localhost:9092 \
        --partitions $i
done

# Generate topic-specific traffic
for i in {1..5}; do
    docker exec kafka-xray-broker kafka-producer-perf-test \
        --topic experiment-topic-$i \
        --num-records 1000 \
        --record-size 100 \
        --throughput 50 \
        --producer-props bootstrap.servers=localhost:9092 &
done

# Query topic-specific metrics
docker exec -it kafka-xray-jmxterm java -jar /jmxterm.jar
# domain kafka.server
# beans | grep topic=experiment
```

### Experiment 2: Network Request Metrics
Monitor different request types:
```bash
# In one terminal - watch metrics
watch -n 2 './scripts/multi-metric-query.sh | grep -A1 "Request"'

# In another - generate different request types
# Produce requests
docker exec kafka-xray-broker kafka-producer-perf-test \
    --topic test-topic --num-records 10000 --throughput 1000 \
    --record-size 100 --producer-props bootstrap.servers=localhost:9092

# Consume requests
docker exec kafka-xray-broker kafka-consumer-perf-test \
    --topic test-topic --messages 10000 \
    --broker-list localhost:9092
```

## 🤔 Analysis Questions

1. **MBean Organization**
   - How are MBeans organized hierarchically?
   - What's the pattern for topic-specific vs global metrics?
   - Which MBeans would you monitor for a production cluster?

2. **Metric Types**
   - Which metrics are counters vs gauges?
   - How do composite metrics work (e.g., percentiles)?
   - What's the difference between Count and Rate attributes?

3. **Performance Impact**
   - How many MBeans are exposed by a single broker?
   - What's the cost of querying all metrics?
   - How would you optimize metric collection?

## 🎯 Challenge: Build a JMX Dashboard

Create a simple terminal dashboard that shows:
1. Message rates (in/out)
2. Request latencies
3. Active connections
4. Error rates

Update every 5 seconds with color coding for thresholds.

## 📚 Reference

### Key MBean Patterns
```
kafka.server:type=BrokerTopicMetrics,name=*
kafka.server:type=BrokerTopicMetrics,name=*,topic=*
kafka.network:type=RequestMetrics,name=*,request=*
kafka.log:type=LogFlushStats,name=*
kafka.controller:type=KafkaController,name=*
```

### Useful JMXTerm Commands
```
# Get all attributes of an MBean
info -b <mbean_name>

# Get specific attribute
get -b <mbean_name> <attribute>

# Set attribute (if writable)
set -b <mbean_name> <attribute> <value>

# Invoke operation
run -b <mbean_name> <operation>
```

## ✅ Completion Checklist
- [ ] Listed all Kafka domains
- [ ] Created MBean inventory
- [ ] Queried 5+ different metrics
- [ ] Understood counter vs gauge metrics
- [ ] Built multi-metric query script
- [ ] Completed topic-specific experiment
- [ ] Analyzed network request patterns
- [ ] (Bonus) Built terminal dashboard

## 🚀 Next Exercise
[Exercise 3: Configuration Mastery →](exercise-03-configuration.md)
