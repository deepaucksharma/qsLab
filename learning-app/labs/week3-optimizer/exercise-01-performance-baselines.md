# Exercise 1: Establishing Performance Baselines

**Objective:** Learn how to establish and measure Kafka performance baselines to identify optimization opportunities.

**Time:** 45 minutes

**Prerequisites:** 
- Week 3 lab environment running (`docker-compose up -d`)
- Understanding of Kafka architecture
- Basic knowledge of performance metrics

## Background

Before optimizing performance, you need to understand your current state. Performance baselines help you:
- Identify bottlenecks systematically
- Measure the impact of optimizations
- Set realistic performance goals
- Detect performance regressions

## Steps

### 1. Start the Multi-Broker Cluster

```bash
cd ~/qsLab/learning-app/labs/week3-optimizer
docker-compose up -d

# Verify all brokers are running
docker-compose ps

# Check broker logs for startup completion
docker logs week3-broker-1 --tail 20
docker logs week3-broker-2 --tail 20
docker logs week3-broker-3 --tail 20
```

**Expected Output:**
```
NAME                 STATUS    PORTS
week3-broker-1       running   0.0.0.0:39092->39092/tcp, 0.0.0.0:9101->9101/tcp
week3-broker-2       running   0.0.0.0:39093->39093/tcp, 0.0.0.0:9102->9102/tcp
week3-broker-3       running   0.0.0.0:39094->39094/tcp, 0.0.0.0:9103->9103/tcp
week3-prometheus     running   0.0.0.0:9090->9090/tcp
week3-grafana        running   0.0.0.0:3000->3000/tcp
```

### 2. Create Test Topics with Different Configurations

```bash
# High-throughput topic (optimized for speed)
docker exec week3-broker-1 kafka-topics --create \
  --bootstrap-server broker-1:9092 \
  --topic high-throughput \
  --partitions 12 \
  --replication-factor 3 \
  --config min.insync.replicas=2 \
  --config compression.type=lz4 \
  --config segment.bytes=1073741824

# Low-latency topic (optimized for latency)
docker exec week3-broker-1 kafka-topics --create \
  --bootstrap-server broker-1:9092 \
  --topic low-latency \
  --partitions 6 \
  --replication-factor 3 \
  --config min.insync.replicas=1 \
  --config compression.type=none \
  --config flush.messages=1

# Balanced topic (default settings)
docker exec week3-broker-1 kafka-topics --create \
  --bootstrap-server broker-1:9092 \
  --topic balanced \
  --partitions 9 \
  --replication-factor 3
```

### 3. Run Producer Performance Test

Create a producer performance testing script:

```bash
cat > scripts/producer-perf-test.sh << 'EOF'
#!/bin/bash
# Producer performance testing script

TOPIC=${1:-"high-throughput"}
NUM_RECORDS=${2:-1000000}
RECORD_SIZE=${3:-1024}
THROUGHPUT=${4:-"-1"}  # -1 means no throttling

echo "Testing producer performance for topic: $TOPIC"
echo "Records: $NUM_RECORDS, Size: $RECORD_SIZE bytes, Throughput limit: $THROUGHPUT"
echo "================================================"

docker exec week3-load-generator kafka-producer-perf-test \
  --topic $TOPIC \
  --num-records $NUM_RECORDS \
  --record-size $RECORD_SIZE \
  --throughput $THROUGHPUT \
  --producer-props \
    bootstrap.servers=broker-1:9092,broker-2:9093,broker-3:9094 \
    acks=1 \
    compression.type=lz4 \
    batch.size=16384 \
    linger.ms=0 \
    buffer.memory=33554432
EOF

chmod +x scripts/producer-perf-test.sh

# Run baseline test
./scripts/producer-perf-test.sh high-throughput 100000 1024
```

### 4. Run Consumer Performance Test

```bash
cat > scripts/consumer-perf-test.sh << 'EOF'
#!/bin/bash
# Consumer performance testing script

TOPIC=${1:-"high-throughput"}
NUM_MESSAGES=${2:-100000}

echo "Testing consumer performance for topic: $TOPIC"
echo "Messages to consume: $NUM_MESSAGES"
echo "========================================="

docker exec week3-load-generator kafka-consumer-perf-test \
  --bootstrap-server broker-1:9092,broker-2:9093,broker-3:9094 \
  --topic $TOPIC \
  --messages $NUM_MESSAGES \
  --threads 1 \
  --consumer.config /dev/stdin << CONF
group.id=perf-test-consumer
auto.offset.reset=earliest
enable.auto.commit=false
max.poll.records=500
CONF
EOF

chmod +x scripts/consumer-perf-test.sh

# Run baseline test
./scripts/consumer-perf-test.sh high-throughput 100000
```

### 5. Measure End-to-End Latency

```bash
cat > scripts/latency-test.sh << 'EOF'
#!/bin/bash
# End-to-end latency measurement

TOPIC=${1:-"low-latency"}
NUM_SAMPLES=${2:-1000}

echo "Measuring end-to-end latency for topic: $TOPIC"
echo "Number of samples: $NUM_SAMPLES"
echo "============================================"

# Create a simple latency test using timestamps
docker exec week3-load-generator bash -c "
for i in \$(seq 1 $NUM_SAMPLES); do
  # Send message with timestamp
  SEND_TIME=\$(date +%s%N)
  echo \"test-\$i|\$SEND_TIME\" | kafka-console-producer \
    --broker-list broker-1:9092 \
    --topic $TOPIC \
    --property parse.key=true \
    --property key.separator='|' &
  
  # Consume and calculate latency
  kafka-console-consumer \
    --bootstrap-server broker-1:9092 \
    --topic $TOPIC \
    --from-beginning \
    --max-messages 1 \
    --property print.key=true \
    --property key.separator='|' | while IFS='|' read key value; do
    RECV_TIME=\$(date +%s%N)
    LATENCY=\$(((\$RECV_TIME - \$value) / 1000000))
    echo \"Message \$key latency: \${LATENCY}ms\"
  done
  
  sleep 0.1
done | awk '{sum+=\$4; count++} END {print \"Average latency: \" sum/count \"ms\"}'
"
EOF

chmod +x scripts/latency-test.sh

# Run latency test
./scripts/latency-test.sh low-latency 100
```

### 6. Collect JMX Metrics

```bash
# Create JMX metrics collection script
cat > scripts/collect-jmx-metrics.sh << 'EOF'
#!/bin/bash
# Collect key JMX metrics for baseline

echo "Collecting JMX metrics from all brokers..."
echo "========================================="

for broker in 1 2 3; do
  echo -e "\nBroker $broker metrics:"
  
  # Messages in per second
  docker exec week3-broker-$broker kafka-run-class kafka.tools.JmxTool \
    --jmx-url service:jmx:rmi:///jndi/rmi://localhost:910$broker/jmxrmi \
    --object-name 'kafka.server:type=BrokerTopicMetrics,name=MessagesInPerSec' \
    --one-time true 2>/dev/null | grep -E "Count|OneMinuteRate"
  
  # Bytes in per second
  docker exec week3-broker-$broker kafka-run-class kafka.tools.JmxTool \
    --jmx-url service:jmx:rmi:///jndi/rmi://localhost:910$broker/jmxrmi \
    --object-name 'kafka.server:type=BrokerTopicMetrics,name=BytesInPerSec' \
    --one-time true 2>/dev/null | grep -E "Count|OneMinuteRate"
  
  # Request latency
  docker exec week3-broker-$broker kafka-run-class kafka.tools.JmxTool \
    --jmx-url service:jmx:rmi:///jndi/rmi://localhost:910$broker/jmxrmi \
    --object-name 'kafka.network:type=RequestMetrics,name=TotalTimeMs,request=Produce' \
    --one-time true 2>/dev/null | grep -E "Mean|99thPercentile"
done
EOF

chmod +x scripts/collect-jmx-metrics.sh

# Collect baseline metrics
./scripts/collect-jmx-metrics.sh
```

### 7. Create Performance Dashboard

Access Grafana and import a performance dashboard:

1. Open http://localhost:3000 (admin/admin)
2. Create a new dashboard
3. Add panels for:
   - Messages/sec per broker
   - Bytes/sec in and out
   - Request latency percentiles
   - Consumer lag by group
   - Partition distribution

### 8. Document Your Baselines

Create a baseline report:

```bash
cat > baselines/performance-baseline-$(date +%Y%m%d).md << 'EOF'
# Kafka Performance Baseline Report

**Date:** $(date)
**Cluster:** Week 3 Optimizer Lab (3 brokers)

## Producer Performance
- **Topic:** high-throughput
- **Throughput:** X records/sec
- **Average Latency:** X ms
- **99th Percentile:** X ms

## Consumer Performance
- **Topic:** high-throughput
- **Throughput:** X MB/sec
- **Lag:** X messages

## Resource Utilization
- **CPU Usage:** Broker 1: X%, Broker 2: X%, Broker 3: X%
- **Memory Usage:** Broker 1: X MB, Broker 2: X MB, Broker 3: X MB
- **Network I/O:** In: X MB/s, Out: X MB/s
- **Disk I/O:** Read: X MB/s, Write: X MB/s

## Key Observations
1. [Observation 1]
2. [Observation 2]
3. [Observation 3]

## Optimization Opportunities
1. [Opportunity 1]
2. [Opportunity 2]
3. [Opportunity 3]
EOF
```

### 9. Run Stress Test

Test cluster limits:

```bash
# High load test
./scripts/producer-perf-test.sh high-throughput 10000000 1024 -1

# Monitor during test
watch -n 2 "./scripts/collect-jmx-metrics.sh"
```

## Validation

Confirm you've established comprehensive baselines:

- [ ] Created test topics with different configurations
- [ ] Measured producer throughput and latency
- [ ] Measured consumer throughput and lag
- [ ] Collected JMX metrics from all brokers
- [ ] Created performance dashboard in Grafana
- [ ] Documented baseline measurements
- [ ] Identified potential bottlenecks
- [ ] Ran stress test to find limits

## Troubleshooting

### Issue: Poor producer performance
**Solution:** Check network connectivity between load generator and brokers. Verify `batch.size` and `linger.ms` settings.

### Issue: High consumer lag
**Solution:** Increase consumer threads or `max.poll.records`. Check if topic partitions are balanced.

### Issue: Cannot access JMX metrics
**Solution:** Verify JMX ports are exposed in docker-compose.yml and containers are running.

## Key Performance Metrics

Understanding these metrics is crucial:

1. **Throughput Metrics**
   - Messages/sec (in and out)
   - Bytes/sec (in and out)
   - Records/sec per partition

2. **Latency Metrics**
   - Producer request latency
   - Consumer fetch latency
   - End-to-end latency

3. **Resource Metrics**
   - CPU utilization
   - Memory usage (heap and off-heap)
   - Network utilization
   - Disk I/O and usage

4. **Kafka-Specific Metrics**
   - ISR (In-Sync Replicas) count
   - Under-replicated partitions
   - Leader election rate
   - Log flush latency

## Next Steps

In the next exercise, you'll learn to identify specific bottlenecks in your Kafka cluster and understand their root causes.