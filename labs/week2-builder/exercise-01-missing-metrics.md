# Exercise 1: Identifying Missing Metrics

## 🎯 Objective
Analyze your Kafka cluster to identify important metrics not covered by the standard nri-kafka integration.

## 📋 Prerequisites
- Week 1 environment running
- Basic understanding of Kafka operations
- Access to New Relic (to see what's already collected)

## 🔍 Investigation Steps

### Step 1: Review Available Metrics

First, let's see what nri-kafka already collects:

```bash
# Run nri-kafka and output all metrics
docker run --rm --network week1-xray_default \
  -v ${PWD}/../../labs/week1-xray/configs/kafka-config.yml:/etc/newrelic-infra/integrations.d/kafka-config.yml \
  newrelic/nri-kafka:latest \
  --metrics --pretty > available-metrics.json

# List all unique metric names
cat available-metrics.json | jq -r '.[] | .metrics[]? | keys[]' | sort | uniq > metric-list.txt
```

### Step 2: Explore JMX for Hidden Metrics

```bash
# Connect to JMX and explore available MBeans
docker exec -it kafka-xray-jmxterm java -jar /jmxterm.jar

# In JMXTerm:
open kafka:9999
domains
# Look for domains: kafka.*, java.*, com.sun.management.*

# Explore each domain
domain kafka.server
beans

# Check some interesting beans not in nri-kafka
bean kafka.server:type=ReplicaManager,name=PartitionCount
info
get Value

bean kafka.server:type=BrokerTopicMetrics,name=BytesRejectedPerSec
info
get Count
```

### Step 3: Analyze Application-Specific Needs

Consider these scenarios and identify missing metrics:

1. **Data Quality**
   - Tombstone message rates
   - Compression ratios
   - Message size distributions

2. **Performance**
   - Request queue depths
   - Network thread utilization
   - Disk I/O patterns

3. **Business Metrics**
   - Messages per customer/tenant
   - Topic-specific SLAs
   - Data freshness metrics

### Step 4: Document Your Findings

Create a table of missing metrics:

| Metric | Source | Business Value | Implementation Approach |
|--------|--------|----------------|------------------------|
| Tombstone Rate | Consumer | Data quality monitoring | Custom Integration |
| Compression Ratio | JMX | Cost optimization | Flex |
| Request Queue Depth | JMX | Performance tuning | Flex |
| Message Age | Consumer | Freshness SLA | Custom Integration |

## 🎯 Hands-On: Discovering Tombstone Metrics

Let's validate that tombstone tracking is indeed missing:

```bash
# 1. Create a topic with tombstones
docker exec -it kafka-xray-broker kafka-topics --create \
  --topic tombstone-test \
  --bootstrap-server localhost:9092 \
  --partitions 1

# 2. Produce some regular messages
docker exec -it kafka-xray-broker bash -c 'echo "key1:value1
key2:value2
key3:value3" | kafka-console-producer \
  --topic tombstone-test \
  --bootstrap-server localhost:9092 \
  --property parse.key=true \
  --property key.separator=:'

# 3. Produce tombstone messages (null values)
docker exec -it kafka-xray-broker bash -c 'echo "key1:
key2:" | kafka-console-producer \
  --topic tombstone-test \
  --bootstrap-server localhost:9092 \  
  --property parse.key=true \
  --property key.separator=:'

# 4. Verify tombstones exist
docker exec -it kafka-xray-broker kafka-console-consumer \
  --topic tombstone-test \
  --bootstrap-server localhost:9092 \
  --from-beginning \
  --property print.key=true \
  --property print.value=true \
  --max-messages 5
```

Now search the nri-kafka output for any tombstone-related metrics:
```bash
cat available-metrics.json | jq . | grep -i tombstone
# Result: Nothing! This validates our need for custom monitoring
```

## 📝 Exercise Output

Create `missing-metrics-analysis.md` with:

1. **Top 5 Missing Metrics** for your use case
2. **Implementation Plan** for each metric
3. **Priority Ranking** based on business value
4. **Effort Estimation** (Flex vs Custom)

## 🎯 Bonus Challenge

Write a script that:
1. Queries all JMX MBeans
2. Compares with nri-kafka output  
3. Generates a report of uncovered metrics

## ✅ Success Criteria

- [ ] Identified at least 5 missing metrics
- [ ] Validated tombstone metrics are not collected
- [ ] Created implementation plan
- [ ] Understood the gaps in standard monitoring

## 🚀 Next Step
[Exercise 2: Build Tombstone Monitor →](exercise-02-tombstone-monitor.md)
