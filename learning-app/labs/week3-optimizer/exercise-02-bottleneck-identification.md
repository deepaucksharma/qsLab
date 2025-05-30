# Exercise 2: Bottleneck Identification and Analysis

**Objective:** Learn systematic approaches to identify performance bottlenecks in Kafka clusters using metrics, logs, and profiling tools.

**Time:** 60 minutes

**Prerequisites:** 
- Completed Exercise 1 (Performance Baselines)
- Baseline metrics documented
- Understanding of Kafka internals

## Background

Performance bottlenecks in Kafka can occur at multiple levels:
- **Producer bottlenecks**: Network, batching, compression
- **Broker bottlenecks**: CPU, memory, disk I/O, replication
- **Consumer bottlenecks**: Processing speed, deserialization, coordination
- **Infrastructure bottlenecks**: Network bandwidth, disk throughput

## Steps

### 1. Create Bottleneck Simulation Scenarios

```bash
# Create script to simulate various bottlenecks
cat > scripts/create-bottlenecks.sh << 'EOF'
#!/bin/bash
# Script to create different bottleneck scenarios

SCENARIO=$1

case $SCENARIO in
  "high-partition-count")
    echo "Creating topic with excessive partitions..."
    docker exec week3-broker-1 kafka-topics --create \
      --bootstrap-server broker-1:9092 \
      --topic bottleneck-partitions \
      --partitions 100 \
      --replication-factor 3
    ;;
    
  "small-batches")
    echo "Producing with inefficient batching..."
    docker exec week3-load-generator kafka-producer-perf-test \
      --topic balanced \
      --num-records 100000 \
      --record-size 100 \
      --throughput -1 \
      --producer-props \
        bootstrap.servers=broker-1:9092 \
        batch.size=1 \
        linger.ms=0
    ;;
    
  "aggressive-flushing")
    echo "Creating topic with aggressive flushing..."
    docker exec week3-broker-1 kafka-topics --create \
      --bootstrap-server broker-1:9092 \
      --topic bottleneck-flush \
      --partitions 12 \
      --replication-factor 3 \
      --config flush.messages=1 \
      --config flush.ms=1
    ;;
    
  "slow-consumers")
    echo "Simulating slow consumer processing..."
    docker exec week3-load-generator bash -c '
      kafka-console-consumer \
        --bootstrap-server broker-1:9092 \
        --topic high-throughput \
        --from-beginning \
        --consumer-property group.id=slow-consumer-group | \
      while read message; do
        sleep 0.01  # Simulate processing delay
        echo "Processed: $message"
      done
    ' &
    ;;
    
  "replication-lag")
    echo "Creating replication lag by limiting follower fetch..."
    docker exec week3-broker-2 kafka-configs --bootstrap-server broker-1:9092 \
      --entity-type brokers --entity-name 2 \
      --alter --add-config replica.fetch.max.bytes=1024
    ;;
    
  *)
    echo "Usage: $0 {high-partition-count|small-batches|aggressive-flushing|slow-consumers|replication-lag}"
    exit 1
    ;;
esac
EOF

chmod +x scripts/create-bottlenecks.sh
```

### 2. Monitor Consumer Lag Patterns

```bash
# Create consumer lag monitoring script
cat > scripts/monitor-consumer-lag.sh << 'EOF'
#!/bin/bash
# Real-time consumer lag monitoring

INTERVAL=${1:-5}

echo "Monitoring consumer lag every ${INTERVAL} seconds..."
echo "Press Ctrl+C to stop"
echo "============================================"

while true; do
  echo -e "\n$(date '+%Y-%m-%d %H:%M:%S')"
  
  docker exec week3-broker-1 kafka-consumer-groups \
    --bootstrap-server broker-1:9092 \
    --all-groups \
    --describe 2>/dev/null | \
  awk 'NR>1 && $1 != "" {
    group=$1; topic=$2; partition=$3; lag=$5; 
    if (lag > 0) {
      printf "%-30s %-20s %10s %10s\n", group, topic, partition, lag
    }
  }' | column -t
  
  sleep $INTERVAL
done
EOF

chmod +x scripts/monitor-consumer-lag.sh

# Start monitoring in background
./scripts/monitor-consumer-lag.sh 5 > lag-monitor.log &
LAG_MONITOR_PID=$!
```

### 3. Analyze Broker Performance Metrics

```bash
# Create comprehensive metrics analysis script
cat > scripts/analyze-broker-metrics.sh << 'EOF'
#!/bin/bash
# Comprehensive broker metrics analysis

echo "Kafka Broker Performance Analysis"
echo "================================="
echo

for broker_id in 1 2 3; do
  echo "BROKER $broker_id ANALYSIS:"
  echo "------------------------"
  
  # CPU and Memory from Docker stats
  echo "Resource Usage:"
  docker stats week3-broker-$broker_id --no-stream --format \
    "CPU: {{.CPUPerc}} | Memory: {{.MemUsage}} ({{.MemPerc}})"
  
  # Network metrics
  echo -e "\nNetwork Metrics:"
  docker exec week3-broker-$broker_id kafka-run-class kafka.tools.JmxTool \
    --jmx-url service:jmx:rmi:///jndi/rmi://localhost:910$broker_id/jmxrmi \
    --object-name 'kafka.server:type=BrokerTopicMetrics,name=BytesInPerSec' \
    --one-time true 2>/dev/null | grep OneMinuteRate | \
    awk '{printf "  Bytes In/sec: %.2f MB/s\n", $2/1048576}'
  
  docker exec week3-broker-$broker_id kafka-run-class kafka.tools.JmxTool \
    --jmx-url service:jmx:rmi:///jndi/rmi://localhost:910$broker_id/jmxrmi \
    --object-name 'kafka.server:type=BrokerTopicMetrics,name=BytesOutPerSec' \
    --one-time true 2>/dev/null | grep OneMinuteRate | \
    awk '{printf "  Bytes Out/sec: %.2f MB/s\n", $2/1048576}'
  
  # Request handler metrics
  echo -e "\nRequest Handler Pool:"
  docker exec week3-broker-$broker_id kafka-run-class kafka.tools.JmxTool \
    --jmx-url service:jmx:rmi:///jndi/rmi://localhost:910$broker_id/jmxrmi \
    --object-name 'kafka.server:type=KafkaRequestHandlerPool,name=RequestHandlerAvgIdlePercent' \
    --one-time true 2>/dev/null | grep OneMinuteRate | \
    awk '{printf "  Handler Idle %%: %.1f%%\n", $2}'
  
  # Disk usage
  echo -e "\nDisk Usage:"
  docker exec week3-broker-$broker_id df -h /var/lib/kafka/data | \
    awk 'NR==2 {printf "  Used: %s of %s (%s)\n", $3, $2, $5}'
  
  # Log flush metrics
  echo -e "\nLog Flush Metrics:"
  docker exec week3-broker-$broker_id kafka-run-class kafka.tools.JmxTool \
    --jmx-url service:jmx:rmi:///jndi/rmi://localhost:910$broker_id/jmxrmi \
    --object-name 'kafka.log:type=LogFlushStats,name=LogFlushRateAndTimeMs' \
    --one-time true 2>/dev/null | grep -E "Count|Mean" | \
    awk '{if(NR==1) printf "  Flush Count: %d\n", $2; else printf "  Avg Flush Time: %.2f ms\n", $2}'
  
  echo
done

# Check for under-replicated partitions
echo "CLUSTER HEALTH:"
echo "---------------"
docker exec week3-broker-1 kafka-topics --bootstrap-server broker-1:9092 \
  --describe --under-replicated-partitions 2>/dev/null | \
  wc -l | awk '{printf "Under-replicated partitions: %d\n", $1-1}'

# Check ISR shrinks
echo -e "\nISR Shrink Rate:"
for broker_id in 1 2 3; do
  docker exec week3-broker-$broker_id kafka-run-class kafka.tools.JmxTool \
    --jmx-url service:jmx:rmi:///jndi/rmi://localhost:910$broker_id/jmxrmi \
    --object-name 'kafka.server:type=ReplicaManager,name=IsrShrinksPerSec' \
    --one-time true 2>/dev/null | grep OneMinuteRate | \
    awk -v broker=$broker_id '{printf "  Broker %d: %.2f/sec\n", broker, $2}'
done
EOF

chmod +x scripts/analyze-broker-metrics.sh

# Run analysis
./scripts/analyze-broker-metrics.sh
```

### 4. Profile Producer Performance

```bash
# Create producer profiling script
cat > scripts/profile-producer.sh << 'EOF'
#!/bin/bash
# Producer performance profiling

TOPIC=${1:-"balanced"}
ITERATIONS=5

echo "Producer Performance Profile for topic: $TOPIC"
echo "============================================="

# Test different batch sizes
echo -e "\n1. BATCH SIZE IMPACT:"
for batch_size in 1 1024 16384 65536 131072; do
  echo -n "Batch size $batch_size bytes: "
  
  docker exec week3-load-generator kafka-producer-perf-test \
    --topic $TOPIC \
    --num-records 50000 \
    --record-size 1024 \
    --throughput -1 \
    --producer-props \
      bootstrap.servers=broker-1:9092 \
      batch.size=$batch_size \
      linger.ms=0 \
      compression.type=none 2>&1 | \
  grep "records/sec" | awk '{print $4, $5}'
done

# Test different linger.ms values
echo -e "\n2. LINGER.MS IMPACT:"
for linger_ms in 0 10 50 100 200; do
  echo -n "Linger.ms ${linger_ms}ms: "
  
  docker exec week3-load-generator kafka-producer-perf-test \
    --topic $TOPIC \
    --num-records 50000 \
    --record-size 1024 \
    --throughput -1 \
    --producer-props \
      bootstrap.servers=broker-1:9092 \
      batch.size=16384 \
      linger.ms=$linger_ms \
      compression.type=none 2>&1 | \
  grep "records/sec" | awk '{print $4, $5}'
done

# Test compression types
echo -e "\n3. COMPRESSION IMPACT:"
for compression in none gzip snappy lz4 zstd; do
  echo -n "Compression $compression: "
  
  docker exec week3-load-generator kafka-producer-perf-test \
    --topic $TOPIC \
    --num-records 50000 \
    --record-size 1024 \
    --throughput -1 \
    --producer-props \
      bootstrap.servers=broker-1:9092 \
      batch.size=16384 \
      linger.ms=10 \
      compression.type=$compression 2>&1 | \
  grep "records/sec" | awk '{print $4, $5}'
done

# Test different acks settings
echo -e "\n4. ACKS SETTING IMPACT:"
for acks in 0 1 all; do
  echo -n "Acks=$acks: "
  
  docker exec week3-load-generator kafka-producer-perf-test \
    --topic $TOPIC \
    --num-records 50000 \
    --record-size 1024 \
    --throughput -1 \
    --producer-props \
      bootstrap.servers=broker-1:9092 \
      batch.size=16384 \
      linger.ms=10 \
      compression.type=lz4 \
      acks=$acks 2>&1 | \
  grep "records/sec" | awk '{print $4, $5}'
done
EOF

chmod +x scripts/profile-producer.sh

# Run profiling
./scripts/profile-producer.sh high-throughput
```

### 5. Identify Disk I/O Bottlenecks

```bash
# Monitor disk I/O
cat > scripts/monitor-disk-io.sh << 'EOF'
#!/bin/bash
# Disk I/O monitoring for Kafka brokers

echo "Monitoring Disk I/O (using iostat in containers)"
echo "==============================================="

# Install iostat in broker containers if needed
for broker in 1 2 3; do
  docker exec week3-broker-$broker apt-get update -qq && \
  docker exec week3-broker-$broker apt-get install -y sysstat -qq
done

# Monitor disk I/O
while true; do
  echo -e "\n$(date '+%Y-%m-%d %H:%M:%S')"
  
  for broker in 1 2 3; do
    echo -e "\nBroker $broker Disk I/O:"
    docker exec week3-broker-$broker iostat -x 1 2 | \
      awk '/^[[:alpha:]]/ && NR>6 {
        if ($1 != "Device:") {
          printf "  Device: %-10s Read: %6.1f MB/s  Write: %6.1f MB/s  Util: %5.1f%%\n", 
            $1, $6/1024, $7/1024, $14
        }
      }'
  done
  
  sleep 5
done
EOF

chmod +x scripts/monitor-disk-io.sh
```

### 6. Network Bottleneck Detection

```bash
# Create network analysis script
cat > scripts/analyze-network.sh << 'EOF'
#!/bin/bash
# Network bottleneck analysis

echo "Network Performance Analysis"
echo "==========================="

# Check network latency between brokers
echo -e "\nInter-broker latency:"
for source in 1 2 3; do
  for dest in 1 2 3; do
    if [ $source -ne $dest ]; then
      latency=$(docker exec week3-broker-$source ping -c 3 -q broker-$dest | \
        grep "rtt" | awk -F'/' '{print $5}')
      echo "Broker $source -> Broker $dest: ${latency}ms"
    fi
  done
done

# Check network throughput capacity
echo -e "\nNetwork throughput test:"
docker exec week3-broker-1 bash -c '
  # Create test file
  dd if=/dev/zero of=/tmp/test-file bs=1M count=100 2>/dev/null
  
  # Test network copy to broker-2
  start=$(date +%s.%N)
  nc -l 9999 > /tmp/received-file &
  nc broker-2 9999 < /tmp/test-file
  end=$(date +%s.%N)
  
  duration=$(echo "$end - $start" | bc)
  throughput=$(echo "scale=2; 100 / $duration" | bc)
  echo "Throughput to broker-2: ${throughput} MB/s"
'

# Check for network errors
echo -e "\nNetwork error rates:"
for broker in 1 2 3; do
  docker exec week3-broker-$broker netstat -i | \
    awk -v broker=$broker 'NR>2 && $1 != "lo" {
      printf "Broker %d - Interface %s: RX-ERR=%d TX-ERR=%d\n", 
        broker, $1, $5, $9
    }'
done
EOF

chmod +x scripts/analyze-network.sh
```

### 7. Create Bottleneck Report

```bash
# Generate comprehensive bottleneck analysis
cat > scripts/generate-bottleneck-report.sh << 'EOF'
#!/bin/bash
# Generate bottleneck analysis report

REPORT_FILE="bottleneck-report-$(date +%Y%m%d-%H%M%S).md"

cat > $REPORT_FILE << 'REPORT'
# Kafka Performance Bottleneck Analysis Report

**Generated:** $(date)
**Cluster:** Week 3 Optimizer Lab

## Executive Summary

### Identified Bottlenecks
REPORT

# Run all analysis scripts and append results
echo "Generating comprehensive bottleneck report..."

echo -e "\n### 1. Broker Resource Analysis" >> $REPORT_FILE
./scripts/analyze-broker-metrics.sh >> $REPORT_FILE 2>&1

echo -e "\n### 2. Consumer Lag Analysis" >> $REPORT_FILE
tail -n 50 lag-monitor.log >> $REPORT_FILE

echo -e "\n### 3. Producer Performance Profile" >> $REPORT_FILE
./scripts/profile-producer.sh balanced >> $REPORT_FILE 2>&1

echo -e "\n### 4. Network Analysis" >> $REPORT_FILE
./scripts/analyze-network.sh >> $REPORT_FILE 2>&1

echo -e "\n## Bottleneck Identification Matrix" >> $REPORT_FILE
cat >> $REPORT_FILE << 'MATRIX'

| Component | Symptom | Severity | Root Cause |
|-----------|---------|----------|------------|
| Producer | Low throughput | High/Medium/Low | [Cause] |
| Broker | High CPU | High/Medium/Low | [Cause] |
| Consumer | Growing lag | High/Medium/Low | [Cause] |
| Network | High latency | High/Medium/Low | [Cause] |
| Disk | I/O wait | High/Medium/Low | [Cause] |

## Recommendations

### Immediate Actions
1. [Action 1]
2. [Action 2]
3. [Action 3]

### Long-term Optimizations
1. [Optimization 1]
2. [Optimization 2]
3. [Optimization 3]
MATRIX

echo "Report generated: $REPORT_FILE"
EOF

chmod +x scripts/generate-bottleneck-report.sh

# Generate report
./scripts/generate-bottleneck-report.sh
```

### 8. Test Specific Bottleneck Scenarios

```bash
# Test each bottleneck scenario
echo "Testing bottleneck scenarios..."

# Scenario 1: High partition count
./scripts/create-bottlenecks.sh high-partition-count
sleep 10
./scripts/analyze-broker-metrics.sh | grep -A5 "Handler Idle"

# Scenario 2: Small batches
./scripts/create-bottlenecks.sh small-batches &
SMALL_BATCH_PID=$!
sleep 30
./scripts/analyze-broker-metrics.sh | grep -A2 "Network Metrics"
kill $SMALL_BATCH_PID

# Scenario 3: Slow consumers
./scripts/create-bottlenecks.sh slow-consumers
sleep 30
docker exec week3-broker-1 kafka-consumer-groups \
  --bootstrap-server broker-1:9092 \
  --group slow-consumer-group \
  --describe
```

## Validation

Ensure you can identify and analyze bottlenecks:

- [ ] Created bottleneck simulation scripts
- [ ] Monitored consumer lag patterns
- [ ] Analyzed broker resource usage
- [ ] Profiled producer performance variations
- [ ] Detected disk I/O constraints
- [ ] Measured network performance
- [ ] Generated comprehensive bottleneck report
- [ ] Tested specific bottleneck scenarios

## Common Bottleneck Patterns

### Producer Bottlenecks
1. **Small batch sizes**: Low throughput, high network overhead
2. **Synchronous sends**: Thread blocking, poor CPU utilization
3. **Excessive compression**: High CPU usage, modest throughput gains

### Broker Bottlenecks
1. **Insufficient network threads**: Request handler idle % very low
2. **Disk I/O saturation**: High flush times, replication lag
3. **Memory pressure**: Frequent GC, page cache misses

### Consumer Bottlenecks
1. **Processing slower than consumption**: Lag grows continuously
2. **Rebalancing storms**: Frequent consumer group rebalances
3. **Deserialization overhead**: High CPU in consumer process

## Troubleshooting

### Issue: Cannot determine bottleneck source
**Solution:** Start with end-to-end latency measurement, then trace backwards through the data flow.

### Issue: Metrics show contradictory information
**Solution:** Ensure all metrics are from the same time period. Check for clock skew between containers.

### Issue: Bottleneck moves when fixed
**Solution:** This is common - fixing one bottleneck often reveals the next. Continue iterative optimization.

## Key Takeaways

1. **Bottlenecks are often hidden** - systematic analysis reveals them
2. **Multiple tools are needed** - JMX, OS metrics, application logs
3. **Bottlenecks shift** - fixing one often exposes another
4. **Baseline comparison is crucial** - know your normal to spot abnormal
5. **Production differs from test** - real workloads have different patterns

## Next Steps

In Exercise 3, you'll learn specific optimization techniques to address the bottlenecks you've identified.