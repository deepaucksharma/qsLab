# Exercise 1: Kafka Metric X-Ray

## 🎯 Objective
Trace one metric (`broker.messagesInPerSec`) from its origin in Kafka through JMX to its final form in New Relic.

## 📋 Prerequisites
- Docker Desktop running
- Terminal/PowerShell access
- 45 minutes of focused time

## 🚀 Setup (15 minutes)

### 1. Start the Lab Environment
```bash
# From the week1-xray directory
docker-compose up -d

# Verify all containers are running
docker-compose ps
```

### 2. Create a Test Topic
```bash
docker exec -it kafka-xray-broker \
  kafka-topics --create --topic test-topic \
  --bootstrap-server localhost:9092 \
  --partitions 3 --replication-factor 1
```

### 3. Generate Test Messages
```bash
# Generate 10,000 messages at 100 msgs/sec
docker exec -it kafka-xray-broker \
  kafka-producer-perf-test \
  --topic test-topic \
  --num-records 10000 \
  --record-size 100 \
  --throughput 100 \
  --producer-props bootstrap.servers=localhost:9092
```

## 🔬 Investigation Steps (30 minutes)

### Step 1: Explore Raw JMX MBean
```bash
# Connect to JMX using jmxterm
docker exec -it kafka-xray-jmxterm java -jar /jmxterm.jar

# In the JMXTerm prompt:
open kafka:9999
domain kafka.server
bean kafka.server:name=MessagesInPerSec,type=BrokerTopicMetrics
info
get Count
get OneMinuteRate
get FiveMinuteRate
```

**📝 Record:**
- Raw Count value: _____________
- OneMinuteRate: _____________
- MBean full name: _____________

### Step 2: Query JMX Programmatically
Create `scripts/query-jmx.sh`:
```bash
#!/bin/bash
docker exec kafka-xray-jmxterm java -jar /jmxterm.jar -n -v silent <<EOF
open kafka:9999
get -b kafka.server:name=MessagesInPerSec,type=BrokerTopicMetrics Count
EOF
```

Run it twice with 10 seconds interval:
```bash
chmod +x scripts/query-jmx.sh
COUNT1=$(./scripts/query-jmx.sh | grep -oE '[0-9]+$')
echo "Count at T1: $COUNT1"
sleep 10
COUNT2=$(./scripts/query-jmx.sh | grep -oE '[0-9]+$')
echo "Count at T2: $COUNT2"
echo "Difference: $((COUNT2 - COUNT1))"
echo "Rate: $((($COUNT2 - $COUNT1) / 10)) msgs/sec"
```

### Step 3: Run nri-kafka Manually

First, ensure the output directory exists:
```bash
mkdir -p output
```

Create `configs/kafka-config.yml`:
```yaml
integrations:
  - name: nri-kafka
    env:
      CLUSTER_NAME: "kafka-xray-lab"
      KAFKA_VERSION: "3.x"  # Updated for modern Kafka
      AUTODISCOVER_STRATEGY: "bootstrap"
      BOOTSTRAP_BROKER_HOST: "kafka"
      BOOTSTRAP_BROKER_KAFKA_PORT: 9093
      BOOTSTRAP_BROKER_JMX_PORT: 9999
      COLLECT_BROKER_TOPIC_DATA: "true"
      LOG_LEVEL: "debug"
    interval: 30s
```

Run nri-kafka:
```bash
# For Linux:
docker run --rm --network week1-xray_default \
  -v ${PWD}/configs/kafka-config.yml:/etc/newrelic-infra/integrations.d/kafka-config.yml \
  newrelic/nri-kafka:latest \
  --verbose --pretty | tee output/nri-kafka-debug.log

# For Windows/Mac (adjust the volume path as needed):
docker run --rm --network week1-xray_default \
  -v ${PWD}/configs/kafka-config.yml:/etc/newrelic-infra/integrations.d/kafka-config.yml \
  newrelic/nri-kafka:latest \
  --verbose --pretty > output/nri-kafka-debug.log
```

### Step 4: Analyze the Output
```bash
# Extract just the metrics
docker run --rm --network week1-xray_default \
  -v ${PWD}/configs/kafka-config.yml:/etc/newrelic-infra/integrations.d/kafka-config.yml \
  newrelic/nri-kafka:latest \
  --metrics --pretty > output/metrics.json

# Find our metric
cat output/metrics.json | jq '.[] | select(.metrics) | .metrics[] | select(.event_type == "KafkaBrokerSample") | {event_type, "broker.messagesInPerSec"}'
```

## 🤔 Analysis Questions

1. **JMX MBean Structure**
   - What's the complete object name pattern for broker metrics?
   - What other metrics are available on the same MBean?
   - How does Kafka organize its MBeans hierarchically?

2. **Rate Calculation**
   - Why is the Count value always increasing?
   - How does nri-kafka convert Count to rate?
   - What happens if nri-kafka restarts?

3. **Mental Model Connection**
   - How is this similar to Prometheus counter metrics?
   - What's the equivalent in your API server monitoring?
   - Why use JMX instead of HTTP endpoints?

## 🎯 Bonus Challenges

### Challenge 1: Metric Filtering
Modify `kafka-config.yml` to:
1. Exclude MessagesInPerSec
2. Include only BytesInPerSec and BytesOutPerSec
3. Verify the change in output

### Challenge 2: Custom JMX Query
Write a script that:
1. Queries all broker metrics
2. Calculates rates for all counters
3. Outputs in Prometheus format

### Challenge 3: Trace Another Metric
Pick `consumer.lag` and trace:
1. Where does it come from? (Hint: Not JMX!)
2. How is it calculated?
3. Why is it special?

## 📊 What You've Learned

✅ Kafka exposes metrics via JMX MBeans with hierarchical naming  
✅ JMX metrics are often counters that need rate calculation  
✅ nri-kafka queries JMX and transforms metrics for New Relic  
✅ The complete path: Kafka → JMX → nri-kafka → JSON → New Relic  

## 🚀 Next Exercise
[Exercise 2: JMX Deep Dive →](exercise-02-jmx-exploration.md)
