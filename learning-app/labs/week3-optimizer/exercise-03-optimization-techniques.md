# Exercise 3: Performance Optimization Techniques

**Objective:** Apply specific optimization techniques to improve Kafka performance based on bottlenecks identified in Exercise 2.

**Time:** 60 minutes

**Prerequisites:** 
- Completed Exercises 1 & 2
- Identified performance bottlenecks
- Understanding of Kafka configuration parameters

## Background

Kafka optimization involves tuning multiple layers:
- **Producer optimizations**: Batching, compression, async operations
- **Broker optimizations**: Thread pools, I/O configurations, JVM tuning
- **Consumer optimizations**: Parallel processing, batch fetching
- **Topic optimizations**: Partition count, replication settings

## Steps

### 1. Producer Optimization Techniques

#### Create Producer Optimization Test Suite

```bash
cat > scripts/optimize-producer.sh << 'EOF'
#!/bin/bash
# Producer optimization test suite

TOPIC=${1:-"optimization-test"}
BASELINE_RECORDS=100000

echo "Producer Optimization Test Suite"
echo "================================"

# Create test topic
docker exec week3-broker-1 kafka-topics --create \
  --bootstrap-server broker-1:9092 \
  --topic $TOPIC \
  --partitions 12 \
  --replication-factor 3 \
  --config min.insync.replicas=2 \
  2>/dev/null || echo "Topic already exists"

# Test 1: Baseline (unoptimized)
echo -e "\n1. BASELINE TEST (Unoptimized):"
docker exec week3-load-generator kafka-producer-perf-test \
  --topic $TOPIC \
  --num-records $BASELINE_RECORDS \
  --record-size 1024 \
  --throughput -1 \
  --producer-props \
    bootstrap.servers=broker-1:9092 \
    acks=all \
    batch.size=16384 \
    linger.ms=0 \
    compression.type=none \
    buffer.memory=33554432 \
  2>&1 | grep -E "records/sec|MB/sec|ms avg latency" | tail -1

# Test 2: Optimized batching
echo -e "\n2. OPTIMIZED BATCHING:"
docker exec week3-load-generator kafka-producer-perf-test \
  --topic $TOPIC \
  --num-records $BASELINE_RECORDS \
  --record-size 1024 \
  --throughput -1 \
  --producer-props \
    bootstrap.servers=broker-1:9092 \
    acks=all \
    batch.size=131072 \
    linger.ms=50 \
    compression.type=none \
    buffer.memory=67108864 \
  2>&1 | grep -E "records/sec|MB/sec|ms avg latency" | tail -1

# Test 3: Compression optimization
echo -e "\n3. COMPRESSION OPTIMIZATION (LZ4):"
docker exec week3-load-generator kafka-producer-perf-test \
  --topic $TOPIC \
  --num-records $BASELINE_RECORDS \
  --record-size 1024 \
  --throughput -1 \
  --producer-props \
    bootstrap.servers=broker-1:9092 \
    acks=all \
    batch.size=131072 \
    linger.ms=50 \
    compression.type=lz4 \
    buffer.memory=67108864 \
  2>&1 | grep -E "records/sec|MB/sec|ms avg latency" | tail -1

# Test 4: Reduced durability for speed
echo -e "\n4. REDUCED DURABILITY (acks=1):"
docker exec week3-load-generator kafka-producer-perf-test \
  --topic $TOPIC \
  --num-records $BASELINE_RECORDS \
  --record-size 1024 \
  --throughput -1 \
  --producer-props \
    bootstrap.servers=broker-1:9092 \
    acks=1 \
    batch.size=131072 \
    linger.ms=50 \
    compression.type=lz4 \
    buffer.memory=67108864 \
  2>&1 | grep -E "records/sec|MB/sec|ms avg latency" | tail -1

# Test 5: Fully optimized
echo -e "\n5. FULLY OPTIMIZED:"
docker exec week3-load-generator kafka-producer-perf-test \
  --topic $TOPIC \
  --num-records $BASELINE_RECORDS \
  --record-size 1024 \
  --throughput -1 \
  --producer-props \
    bootstrap.servers=broker-1:9092 \
    acks=1 \
    batch.size=262144 \
    linger.ms=100 \
    compression.type=lz4 \
    buffer.memory=134217728 \
    max.in.flight.requests.per.connection=5 \
    send.buffer.bytes=131072 \
  2>&1 | grep -E "records/sec|MB/sec|ms avg latency" | tail -1

echo -e "\n✅ Producer optimization tests complete"
EOF

chmod +x scripts/optimize-producer.sh

# Run producer optimization tests
./scripts/optimize-producer.sh
```

### 2. Broker-Level Optimizations

#### Apply Broker Configuration Changes

```bash
# Create broker optimization script
cat > scripts/optimize-brokers.sh << 'EOF'
#!/bin/bash
# Broker optimization script

ACTION=$1

case $ACTION in
  "apply")
    echo "Applying broker optimizations..."
    
    # Optimize network threads
    for broker in 1 2 3; do
      docker exec week3-broker-$broker kafka-configs \
        --bootstrap-server broker-$broker:909$((1+$broker)) \
        --entity-type brokers \
        --entity-name $broker \
        --alter \
        --add-config num.network.threads=16,num.io.threads=16
    done
    
    # Optimize socket buffer sizes
    for broker in 1 2 3; do
      docker exec week3-broker-$broker kafka-configs \
        --bootstrap-server broker-$broker:909$((1+$broker)) \
        --entity-type brokers \
        --entity-name $broker \
        --alter \
        --add-config socket.send.buffer.bytes=1048576,socket.receive.buffer.bytes=1048576
    done
    
    # Optimize log segment settings
    for broker in 1 2 3; do
      docker exec week3-broker-$broker kafka-configs \
        --bootstrap-server broker-$broker:909$((1+$broker)) \
        --entity-type brokers \
        --entity-name $broker \
        --alter \
        --add-config log.segment.bytes=1073741824
    done
    
    echo "✅ Broker optimizations applied"
    ;;
    
  "revert")
    echo "Reverting broker optimizations..."
    
    for broker in 1 2 3; do
      docker exec week3-broker-$broker kafka-configs \
        --bootstrap-server broker-$broker:909$((1+$broker)) \
        --entity-type brokers \
        --entity-name $broker \
        --alter \
        --delete-config num.network.threads,num.io.threads,socket.send.buffer.bytes,socket.receive.buffer.bytes,log.segment.bytes
    done
    
    echo "✅ Broker optimizations reverted"
    ;;
    
  "show")
    echo "Current broker configurations:"
    
    for broker in 1 2 3; do
      echo -e "\nBroker $broker:"
      docker exec week3-broker-$broker kafka-configs \
        --bootstrap-server broker-$broker:909$((1+$broker)) \
        --entity-type brokers \
        --entity-name $broker \
        --describe | grep -E "num.network.threads|num.io.threads|socket.send.buffer.bytes|socket.receive.buffer.bytes"
    done
    ;;
    
  *)
    echo "Usage: $0 {apply|revert|show}"
    exit 1
    ;;
esac
EOF

chmod +x scripts/optimize-brokers.sh

# Apply broker optimizations
./scripts/optimize-brokers.sh apply
```

### 3. Consumer Optimization Strategies

```bash
# Create consumer optimization test
cat > scripts/optimize-consumer.sh << 'EOF'
#!/bin/bash
# Consumer optimization tests

TOPIC="high-throughput"
GROUP_PREFIX="consumer-opt-test"

echo "Consumer Optimization Tests"
echo "==========================="

# Ensure topic has data
echo "Preparing test data..."
docker exec week3-load-generator kafka-producer-perf-test \
  --topic $TOPIC \
  --num-records 1000000 \
  --record-size 1024 \
  --throughput -1 \
  --producer-props bootstrap.servers=broker-1:9092 acks=1 \
  >/dev/null 2>&1

# Test 1: Baseline single consumer
echo -e "\n1. BASELINE (Single Consumer):"
docker exec week3-load-generator timeout 30s kafka-consumer-perf-test \
  --bootstrap-server broker-1:9092 \
  --topic $TOPIC \
  --messages 100000 \
  --threads 1 \
  --consumer.config /dev/stdin << CONF
group.id=${GROUP_PREFIX}-baseline
fetch.min.bytes=1
max.poll.records=500
CONF

# Test 2: Increased fetch size
echo -e "\n2. INCREASED FETCH SIZE:"
docker exec week3-load-generator timeout 30s kafka-consumer-perf-test \
  --bootstrap-server broker-1:9092 \
  --topic $TOPIC \
  --messages 100000 \
  --threads 1 \
  --consumer.config /dev/stdin << CONF
group.id=${GROUP_PREFIX}-fetch-optimized
fetch.min.bytes=1048576
fetch.max.wait.ms=500
max.poll.records=5000
CONF

# Test 3: Multiple consumer threads
echo -e "\n3. PARALLEL CONSUMERS (4 threads):"
docker exec week3-load-generator timeout 30s kafka-consumer-perf-test \
  --bootstrap-server broker-1:9092 \
  --topic $TOPIC \
  --messages 100000 \
  --threads 4 \
  --consumer.config /dev/stdin << CONF
group.id=${GROUP_PREFIX}-parallel
fetch.min.bytes=1048576
max.poll.records=5000
session.timeout.ms=30000
CONF

# Test 4: Optimized partition assignment
echo -e "\n4. PARTITION ASSIGNMENT OPTIMIZATION:"
docker exec week3-load-generator timeout 30s kafka-consumer-perf-test \
  --bootstrap-server broker-1:9092 \
  --topic $TOPIC \
  --messages 100000 \
  --threads 3 \
  --consumer.config /dev/stdin << CONF
group.id=${GROUP_PREFIX}-partition-aware
partition.assignment.strategy=org.apache.kafka.clients.consumer.RoundRobinAssignor
fetch.min.bytes=1048576
max.poll.records=5000
CONF

echo -e "\n✅ Consumer optimization tests complete"
EOF

chmod +x scripts/optimize-consumer.sh

# Run consumer optimizations
./scripts/optimize-consumer.sh
```

### 4. Topic-Level Optimizations

```bash
# Create topic optimization script
cat > scripts/optimize-topics.sh << 'EOF'
#!/bin/bash
# Topic-level optimization

echo "Topic Optimization Analysis"
echo "=========================="

# Function to test partition count impact
test_partition_count() {
  local partitions=$1
  local topic="perf-test-${partitions}p"
  
  # Create topic
  docker exec week3-broker-1 kafka-topics --create \
    --bootstrap-server broker-1:9092 \
    --topic $topic \
    --partitions $partitions \
    --replication-factor 3 \
    2>/dev/null || true
  
  # Run producer test
  echo -n "Partitions: $partitions - "
  docker exec week3-load-generator kafka-producer-perf-test \
    --topic $topic \
    --num-records 100000 \
    --record-size 1024 \
    --throughput -1 \
    --producer-props bootstrap.servers=broker-1:9092 acks=1 \
    2>&1 | grep "records/sec" | tail -1 | awk '{print $4, $5}'
  
  # Cleanup
  docker exec week3-broker-1 kafka-topics --delete \
    --bootstrap-server broker-1:9092 \
    --topic $topic 2>/dev/null || true
}

echo "1. PARTITION COUNT OPTIMIZATION:"
for p in 3 6 9 12 18 24; do
  test_partition_count $p
done

echo -e "\n2. SEGMENT SIZE OPTIMIZATION:"
# Create topics with different segment sizes
for segment_mb in 64 256 512 1024; do
  topic="segment-test-${segment_mb}mb"
  segment_bytes=$((segment_mb * 1048576))
  
  docker exec week3-broker-1 kafka-topics --create \
    --bootstrap-server broker-1:9092 \
    --topic $topic \
    --partitions 6 \
    --replication-factor 3 \
    --config segment.bytes=$segment_bytes \
    2>/dev/null || true
  
  echo "Segment size: ${segment_mb}MB"
done

echo -e "\n3. COMPRESSION COMPARISON:"
for compression in none gzip snappy lz4 zstd; do
  topic="compression-${compression}"
  
  docker exec week3-broker-1 kafka-topics --create \
    --bootstrap-server broker-1:9092 \
    --topic $topic \
    --partitions 6 \
    --replication-factor 3 \
    --config compression.type=$compression \
    2>/dev/null || true
  
  echo -n "Compression: $compression - "
  
  # Test with compressible data
  docker exec week3-load-generator kafka-producer-perf-test \
    --topic $topic \
    --num-records 50000 \
    --record-size 1024 \
    --throughput -1 \
    --producer-props bootstrap.servers=broker-1:9092 \
    2>&1 | grep "records/sec" | tail -1 | awk '{print $6, $7}'
done

echo -e "\n✅ Topic optimization analysis complete"
EOF

chmod +x scripts/optimize-topics.sh

# Run topic optimizations
./scripts/optimize-topics.sh
```

### 5. JVM Tuning for Brokers

```bash
# Create JVM tuning script
cat > scripts/tune-jvm.sh << 'EOF'
#!/bin/bash
# JVM tuning recommendations

echo "JVM Tuning Analysis"
echo "=================="

# Check current JVM settings
echo "Current JVM Settings:"
for broker in 1 2 3; do
  echo -e "\nBroker $broker:"
  docker exec week3-broker-$broker bash -c 'ps aux | grep java' | \
    grep -oE "\-Xmx[0-9]+[mMgG]|\-Xms[0-9]+[mMgG]" | tr '\n' ' '
  echo
done

# Create optimized JVM settings
cat > configs/jvm-tuning.env << 'JVM_CONFIG'
# Optimized JVM settings for Kafka brokers

# Heap settings (50% of available memory)
KAFKA_HEAP_OPTS="-Xmx2G -Xms2G"

# G1GC for predictable latency
KAFKA_JVM_PERFORMANCE_OPTS="-server \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=20 \
  -XX:InitiatingHeapOccupancyPercent=35 \
  -XX:+ExplicitGCInvokesConcurrent \
  -XX:+AlwaysPreTouch \
  -XX:+UseStringDeduplication \
  -Djava.awt.headless=true"

# GC logging
KAFKA_GC_LOG_OPTS="-Xloggc:/var/log/kafka/gc.log \
  -XX:+PrintGCDetails \
  -XX:+PrintGCDateStamps \
  -XX:+PrintGCTimeStamps \
  -XX:+UseGCLogFileRotation \
  -XX:NumberOfGCLogFiles=10 \
  -XX:GCLogFileSize=100M"

# JMX settings
KAFKA_JMX_OPTS="-Dcom.sun.management.jmxremote \
  -Dcom.sun.management.jmxremote.authenticate=false \
  -Dcom.sun.management.jmxremote.ssl=false"
JVM_CONFIG

echo -e "\n✅ Recommended JVM settings saved to configs/jvm-tuning.env"

# Test GC impact
echo -e "\nTesting GC impact on latency..."
docker exec week3-broker-1 bash -c '
  # Force GC and measure impact
  start=$(date +%s%N)
  jcmd 1 GC.run
  end=$(date +%s%N)
  duration=$((($end - $start) / 1000000))
  echo "GC pause time: ${duration}ms"
'
EOF

chmod +x scripts/tune-jvm.sh

# Run JVM tuning analysis
./scripts/tune-jvm.sh
```

### 6. Network Optimization

```bash
# Create network optimization script
cat > scripts/optimize-network.sh << 'EOF'
#!/bin/bash
# Network optimization for Kafka

echo "Network Optimization"
echo "==================="

# Test network buffer sizes
echo "1. Testing network buffer impact..."

# Apply OS-level network optimizations
for broker_num in 1 2 3; do
  docker exec week3-broker-$broker_num bash -c '
    # Increase network buffers (if permitted)
    echo "net.core.rmem_max = 134217728" >> /etc/sysctl.conf
    echo "net.core.wmem_max = 134217728" >> /etc/sysctl.conf
    echo "net.ipv4.tcp_rmem = 4096 87380 134217728" >> /etc/sysctl.conf
    echo "net.ipv4.tcp_wmem = 4096 65536 134217728" >> /etc/sysctl.conf
    sysctl -p 2>/dev/null || echo "Note: sysctl requires privileged mode"
  '
done

# Test batch network requests
echo -e "\n2. Testing request batching..."
docker exec week3-load-generator bash -c '
  # Create test producer with different connection counts
  for connections in 1 2 5 10; do
    echo -n "Connections: $connections - "
    kafka-producer-perf-test \
      --topic high-throughput \
      --num-records 50000 \
      --record-size 1024 \
      --throughput -1 \
      --producer-props \
        bootstrap.servers=broker-1:9092,broker-2:9093,broker-3:9094 \
        connections.max.idle.ms=60000 \
        max.in.flight.requests.per.connection=$connections \
        acks=1 2>&1 | grep "records/sec" | tail -1
  done
'

echo -e "\n✅ Network optimization analysis complete"
EOF

chmod +x scripts/optimize-network.sh

# Run network optimizations
./scripts/optimize-network.sh
```

### 7. Create Optimization Comparison Report

```bash
# Generate optimization report
cat > scripts/generate-optimization-report.sh << 'EOF'
#!/bin/bash
# Generate comprehensive optimization report

REPORT_FILE="optimization-report-$(date +%Y%m%d-%H%M%S).md"

cat > $REPORT_FILE << 'REPORT'
# Kafka Performance Optimization Report

**Generated:** $(date)
**Cluster:** Week 3 Optimizer Lab

## Optimization Results Summary

### Producer Optimizations

| Configuration | Throughput | Latency | Improvement |
|--------------|------------|---------|-------------|
| Baseline | X rec/s | Y ms | - |
| Optimized Batching | X rec/s | Y ms | +Z% |
| With Compression | X rec/s | Y ms | +Z% |
| Reduced Durability | X rec/s | Y ms | +Z% |
| Fully Optimized | X rec/s | Y ms | +Z% |

### Broker Optimizations

| Setting | Before | After | Impact |
|---------|---------|--------|---------|
| Network Threads | 8 | 16 | Reduced request queue time |
| I/O Threads | 8 | 16 | Better disk utilization |
| Socket Buffers | 102KB | 1MB | Higher network throughput |

### Consumer Optimizations

| Strategy | Throughput | CPU Usage | Efficiency |
|----------|------------|-----------|------------|
| Single Thread | X MB/s | Y% | Baseline |
| Increased Fetch | X MB/s | Y% | +Z% |
| Parallel (4 threads) | X MB/s | Y% | +Z% |

### Topic-Level Optimizations

| Partitions | Throughput | Distribution |
|------------|------------|--------------|
| 3 | X rec/s | Uneven |
| 12 | X rec/s | Balanced |
| 24 | X rec/s | Over-partitioned |

## Key Findings

1. **Most Impactful Optimizations:**
   - [Finding 1]
   - [Finding 2]
   - [Finding 3]

2. **Trade-offs Observed:**
   - Durability vs. Throughput
   - Latency vs. Batch Efficiency
   - Resource Usage vs. Performance

3. **Recommended Configuration:**
   ```properties
   # Producer
   batch.size=262144
   linger.ms=50
   compression.type=lz4
   
   # Broker
   num.network.threads=16
   num.io.threads=16
   
   # Consumer  
   fetch.min.bytes=1048576
   max.poll.records=5000
   ```

## Before/After Metrics

### Throughput Improvement
- Before: X records/sec
- After: Y records/sec
- **Improvement: Z%**

### Latency Reduction
- Before: X ms average
- After: Y ms average
- **Improvement: Z%**

### Resource Efficiency
- CPU Usage: -X%
- Network I/O: +Y% (but more efficient)
- Disk I/O: More sequential, less random

## Implementation Checklist

- [ ] Apply producer batching optimizations
- [ ] Enable LZ4 compression
- [ ] Increase broker thread pools
- [ ] Optimize consumer fetch sizes
- [ ] Review partition counts
- [ ] Apply JVM tuning
- [ ] Monitor for 24 hours
- [ ] Adjust based on production patterns
REPORT

echo "Report generated: $REPORT_FILE"
EOF

chmod +x scripts/generate-optimization-report.sh

# Generate report
./scripts/generate-optimization-report.sh
```

### 8. Apply and Validate Optimizations

```bash
# Create validation script
cat > scripts/validate-optimizations.sh << 'EOF'
#!/bin/bash
# Validate optimization impact

echo "Validating Optimization Impact"
echo "============================="

# Run comprehensive performance test with optimizations
echo "Running optimized configuration test..."

# Start monitoring
./scripts/monitor-disk-io.sh > disk-io-optimized.log 2>&1 &
DISK_MONITOR_PID=$!

./scripts/analyze-broker-metrics.sh > broker-metrics-optimized.log

# Run load test
echo -e "\nRunning 5-minute load test..."
docker exec week3-load-generator kafka-producer-perf-test \
  --topic optimization-validation \
  --num-records 5000000 \
  --record-size 1024 \
  --throughput -1 \
  --producer-props \
    bootstrap.servers=broker-1:9092,broker-2:9093,broker-3:9094 \
    acks=1 \
    batch.size=262144 \
    linger.ms=50 \
    compression.type=lz4 \
    buffer.memory=134217728 &

# Monitor during test
sleep 300
kill $DISK_MONITOR_PID

# Collect final metrics
echo -e "\nFinal metrics:"
./scripts/analyze-broker-metrics.sh

echo -e "\n✅ Validation complete"
EOF

chmod +x scripts/validate-optimizations.sh
```

## Validation

Ensure you've successfully applied optimizations:

- [ ] Tested producer optimization variations
- [ ] Applied broker configuration changes
- [ ] Optimized consumer settings
- [ ] Analyzed topic configuration impact
- [ ] Tuned JVM settings
- [ ] Optimized network configuration
- [ ] Generated optimization report
- [ ] Validated improvements with load test

## Common Optimization Patterns

### High Throughput Pattern
```properties
# Producer
batch.size=524288
linger.ms=100
compression.type=lz4
acks=1

# Broker
num.network.threads=16
num.io.threads=16
```

### Low Latency Pattern
```properties
# Producer
batch.size=16384
linger.ms=0
compression.type=none
acks=1

# Broker
num.replica.fetchers=4
replica.lag.time.max.ms=10000
```

### Balanced Pattern
```properties
# Producer
batch.size=131072
linger.ms=20
compression.type=snappy
acks=all

# Broker
num.network.threads=12
num.io.threads=12
```

## Troubleshooting

### Issue: Optimizations don't show improvement
**Solution:** Check if you're hitting a different bottleneck. Use monitoring to identify the new constraint.

### Issue: Increased latency after batching
**Solution:** Reduce `linger.ms` or use adaptive batching based on load.

### Issue: Consumer can't keep up after producer optimization
**Solution:** Scale consumers horizontally or optimize consumer fetch parameters.

## Key Takeaways

1. **No single optimization fits all** - Profile your specific workload
2. **Optimizations have trade-offs** - Balance throughput, latency, and durability
3. **Monitor after changes** - Optimizations can have unexpected effects
4. **Iterative approach works best** - Apply changes gradually
5. **Document your settings** - Future you will thank present you

## Next Steps

In Exercise 4, you'll learn about scaling strategies to handle increased load beyond single-cluster optimizations.