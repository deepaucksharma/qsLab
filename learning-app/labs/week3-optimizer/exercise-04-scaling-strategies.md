# Exercise 4: Scaling Strategies and Capacity Planning

**Objective:** Learn how to scale Kafka clusters effectively and plan capacity for future growth based on performance metrics and business requirements.

**Time:** 45 minutes

**Prerequisites:** 
- Completed Exercises 1-3
- Understanding of Kafka architecture
- Applied optimization techniques

## Background

Scaling Kafka involves multiple dimensions:
- **Horizontal scaling**: Adding brokers, increasing partitions
- **Vertical scaling**: Upgrading hardware resources
- **Consumer scaling**: Parallel processing strategies
- **Cross-DC scaling**: Multi-region deployments

## Steps

### 1. Partition Scaling Analysis

```bash
# Create partition scaling test script
cat > scripts/partition-scaling-test.sh << 'EOF'
#!/bin/bash
# Test impact of partition scaling

TOPIC_BASE="scaling-test"
TEST_DURATION=60

echo "Partition Scaling Analysis"
echo "========================="

# Function to test throughput with different partition counts
test_partition_throughput() {
  local partitions=$1
  local topic="${TOPIC_BASE}-${partitions}p"
  
  # Create topic
  docker exec week3-broker-1 kafka-topics --create \
    --bootstrap-server broker-1:9092 \
    --topic $topic \
    --partitions $partitions \
    --replication-factor 3 \
    --config min.insync.replicas=2 \
    2>/dev/null
  
  echo -e "\nTesting $partitions partitions:"
  
  # Producer test
  echo -n "Producer throughput: "
  docker exec week3-load-generator timeout ${TEST_DURATION}s kafka-producer-perf-test \
    --topic $topic \
    --num-records 10000000 \
    --record-size 1024 \
    --throughput -1 \
    --producer-props \
      bootstrap.servers=broker-1:9092,broker-2:9093,broker-3:9094 \
      acks=1 \
      batch.size=131072 \
      linger.ms=10 \
    2>&1 | grep "records/sec" | tail -1 | awk '{print $4, $5}'
  
  # Consumer test with parallel consumers
  echo -n "Consumer throughput (${partitions} threads): "
  docker exec week3-load-generator timeout 30s kafka-consumer-perf-test \
    --bootstrap-server broker-1:9092,broker-2:9093,broker-3:9094 \
    --topic $topic \
    --messages 1000000 \
    --threads $partitions \
    --consumer.config /dev/stdin << CONF
group.id=scaling-test-$partitions
fetch.min.bytes=1048576
max.poll.records=5000
CONF
  
  # Check partition distribution
  echo "Partition distribution:"
  docker exec week3-broker-1 kafka-log-dirs \
    --bootstrap-server broker-1:9092 \
    --topic-list $topic \
    --describe 2>/dev/null | \
    grep -A1 "broker" | grep size | \
    awk '{sum+=$2; count++} END {printf "  Avg partition size: %.2f MB\n", sum/count/1048576}'
}

# Test scaling from 3 to 36 partitions
for p in 3 6 12 18 24 36; do
  test_partition_throughput $p
done

echo -e "\n✅ Partition scaling analysis complete"
EOF

chmod +x scripts/partition-scaling-test.sh

# Run partition scaling test
./scripts/partition-scaling-test.sh
```

### 2. Broker Scaling Simulation

```bash
# Create broker scaling simulation
cat > scripts/simulate-broker-scaling.sh << 'EOF'
#!/bin/bash
# Simulate adding brokers to cluster

echo "Broker Scaling Simulation"
echo "========================"

# Current state with 3 brokers
echo "Current cluster state (3 brokers):"
docker exec week3-broker-1 kafka-broker-api-versions \
  --bootstrap-server broker-1:9092 | grep brokers

# Calculate current load
echo -e "\nCurrent load distribution:"
for broker in 1 2 3; do
  partitions=$(docker exec week3-broker-$broker kafka-log-dirs \
    --bootstrap-server broker-$broker:909$((1+$broker)) \
    --describe 2>/dev/null | grep -c "partition:")
  echo "Broker $broker: $partitions partitions"
done

# Simulate adding a 4th broker
echo -e "\nSimulating addition of Broker 4..."
echo "Recommended partition reassignment plan:"

# Generate reassignment plan
cat > configs/reassignment-plan.json << 'JSON'
{
  "version": 1,
  "partitions": [
    {
      "topic": "high-throughput",
      "partition": 0,
      "replicas": [1, 2, 4],
      "log_dirs": ["any", "any", "any"]
    },
    {
      "topic": "high-throughput",
      "partition": 3,
      "replicas": [2, 3, 4],
      "log_dirs": ["any", "any", "any"]
    },
    {
      "topic": "high-throughput",
      "partition": 6,
      "replicas": [3, 4, 1],
      "log_dirs": ["any", "any", "any"]
    },
    {
      "topic": "high-throughput",
      "partition": 9,
      "replicas": [4, 1, 2],
      "log_dirs": ["any", "any", "any"]
    }
  ]
}
JSON

echo "Reassignment plan created: configs/reassignment-plan.json"

# Calculate expected improvement
echo -e "\nExpected improvements with 4 brokers:"
echo "- Throughput increase: ~25-30%"
echo "- Load per broker: -25%"
echo "- Fault tolerance: +33%"

# Scaling recommendations
echo -e "\nScaling Recommendations:"
echo "1. Add broker when:"
echo "   - CPU usage > 70% sustained"
echo "   - Network utilization > 70%"
echo "   - Disk I/O wait > 20%"
echo "2. Rebalance partitions after adding broker"
echo "3. Monitor for 24 hours before next scaling"
EOF

chmod +x scripts/simulate-broker-scaling.sh

# Run broker scaling simulation
./scripts/simulate-broker-scaling.sh
```

### 3. Consumer Scaling Strategies

```bash
# Create consumer scaling test
cat > scripts/consumer-scaling-strategies.sh << 'EOF'
#!/bin/bash
# Test different consumer scaling strategies

TOPIC="high-throughput"
BASE_GROUP="consumer-scaling"

echo "Consumer Scaling Strategies"
echo "=========================="

# Prepare test data
echo "Preparing test data..."
docker exec week3-load-generator kafka-producer-perf-test \
  --topic $TOPIC \
  --num-records 2000000 \
  --record-size 1024 \
  --throughput -1 \
  --producer-props bootstrap.servers=broker-1:9092 acks=1 \
  >/dev/null 2>&1

# Strategy 1: Vertical scaling (single powerful consumer)
echo -e "\n1. VERTICAL SCALING (1 consumer, high resources):"
docker exec week3-load-generator timeout 30s kafka-consumer-perf-test \
  --bootstrap-server broker-1:9092 \
  --topic $TOPIC \
  --messages 500000 \
  --threads 1 \
  --consumer.config /dev/stdin << CONF
group.id=${BASE_GROUP}-vertical
fetch.min.bytes=2097152
fetch.max.wait.ms=500
max.poll.records=10000
receive.buffer.bytes=2097152
CONF

# Strategy 2: Horizontal scaling (multiple consumers)
echo -e "\n2. HORIZONTAL SCALING (6 consumers, standard resources):"
for i in {1..6}; do
  docker exec week3-load-generator kafka-consumer-perf-test \
    --bootstrap-server broker-1:9092 \
    --topic $TOPIC \
    --messages 100000 \
    --threads 1 \
    --consumer.config /dev/stdin << CONF &
group.id=${BASE_GROUP}-horizontal
fetch.min.bytes=524288
max.poll.records=2000
CONF
done
wait

# Strategy 3: Consumer groups with partition assignment
echo -e "\n3. PARTITION-AWARE SCALING:"
# Get partition count
PARTITION_COUNT=$(docker exec week3-broker-1 kafka-topics \
  --describe --topic $TOPIC \
  --bootstrap-server broker-1:9092 | \
  grep "PartitionCount" | awk '{print $2}')

echo "Topic has $PARTITION_COUNT partitions"
echo "Optimal consumer count: $PARTITION_COUNT"

# Strategy 4: Over-provisioned consumers
echo -e "\n4. OVER-PROVISIONED CONSUMERS (standby capacity):"
CONSUMER_COUNT=$((PARTITION_COUNT + 3))
echo "Running $CONSUMER_COUNT consumers for $PARTITION_COUNT partitions"
echo "Extra consumers provide instant failover capacity"

# Scaling decision matrix
cat > reports/consumer-scaling-matrix.md << 'MATRIX'
# Consumer Scaling Decision Matrix

| Scenario | Strategy | Consumer Count | Benefits | Drawbacks |
|----------|----------|----------------|----------|-----------|
| Steady load | Match partitions | = partitions | Optimal resource use | No failover capacity |
| Variable load | Over-provision | partitions + 20% | Quick scale response | Some idle resources |
| Bursty load | Auto-scaling | Dynamic | Elastic capacity | Complexity |
| High throughput | Vertical first | Fewer, powerful | Simple management | SPOF risk |
| Complex processing | Horizontal | Many, simple | Fault tolerant | Coordination overhead |

## Scaling Triggers

1. **Scale UP when:**
   - Consumer lag > 100k messages for > 5 min
   - Processing latency > SLA threshold
   - CPU usage > 80% on consumers

2. **Scale DOWN when:**
   - Consumer lag < 1k messages for > 15 min
   - CPU usage < 30% on consumers
   - No processing backlogs

3. **Scale OUT when:**
   - Single consumer can't handle partition
   - Need geographic distribution
   - Require processing isolation
MATRIX

echo -e "\n✅ Consumer scaling analysis complete"
echo "See reports/consumer-scaling-matrix.md for decision guide"
EOF

chmod +x scripts/consumer-scaling-strategies.sh
mkdir -p reports

# Run consumer scaling tests
./scripts/consumer-scaling-strategies.sh
```

### 4. Capacity Planning Calculator

```bash
# Create capacity planning script
cat > scripts/capacity-planner.sh << 'EOF'
#!/bin/bash
# Kafka capacity planning calculator

echo "Kafka Capacity Planning Calculator"
echo "================================="

# Input parameters
read -p "Expected messages/second: " MSG_PER_SEC
read -p "Average message size (bytes): " MSG_SIZE
read -p "Replication factor: " REPLICATION
read -p "Retention period (hours): " RETENTION_HOURS
read -p "Peak load multiplier: " PEAK_MULTIPLIER
read -p "Growth rate (% per month): " GROWTH_RATE

# Calculations
BYTES_PER_SEC=$((MSG_PER_SEC * MSG_SIZE))
MB_PER_SEC=$(echo "scale=2; $BYTES_PER_SEC / 1048576" | bc)
GB_PER_DAY=$(echo "scale=2; $MB_PER_SEC * 86400 / 1024" | bc)
REPLICATED_GB_PER_DAY=$(echo "scale=2; $GB_PER_DAY * $REPLICATION" | bc)
STORAGE_NEEDED_GB=$(echo "scale=2; $REPLICATED_GB_PER_DAY * $RETENTION_HOURS / 24" | bc)

# Peak capacity
PEAK_MB_PER_SEC=$(echo "scale=2; $MB_PER_SEC * $PEAK_MULTIPLIER" | bc)

# Network requirements (in + out + replication)
NETWORK_MB_PER_SEC=$(echo "scale=2; $MB_PER_SEC * ($REPLICATION + 1)" | bc)

# Future capacity (12 months)
FUTURE_MULTIPLIER=$(echo "scale=2; (1 + $GROWTH_RATE/100)^12" | bc -l)
FUTURE_MSG_PER_SEC=$(echo "scale=0; $MSG_PER_SEC * $FUTURE_MULTIPLIER" | bc)
FUTURE_STORAGE_GB=$(echo "scale=2; $STORAGE_NEEDED_GB * $FUTURE_MULTIPLIER" | bc)

# Broker calculations (assuming 80% target utilization)
BROKER_THROUGHPUT_MB=100  # Conservative estimate per broker
BROKERS_NEEDED_THROUGHPUT=$(echo "scale=0; $PEAK_MB_PER_SEC / $BROKER_THROUGHPUT_MB / 0.8 + 1" | bc)

BROKER_STORAGE_TB=2  # Typical broker storage
BROKERS_NEEDED_STORAGE=$(echo "scale=0; $FUTURE_STORAGE_GB / 1024 / $BROKER_STORAGE_TB / 0.8 + 1" | bc)

BROKERS_RECOMMENDED=$(( BROKERS_NEEDED_THROUGHPUT > BROKERS_NEEDED_STORAGE ? BROKERS_NEEDED_THROUGHPUT : BROKERS_NEEDED_STORAGE ))
# Minimum 3 for fault tolerance
BROKERS_RECOMMENDED=$(( BROKERS_RECOMMENDED < 3 ? 3 : BROKERS_RECOMMENDED ))

# Generate report
cat > reports/capacity-plan-$(date +%Y%m%d).md << REPORT
# Kafka Capacity Planning Report

Generated: $(date)

## Input Parameters
- Messages/second: $MSG_PER_SEC
- Message size: $MSG_SIZE bytes
- Replication factor: $REPLICATION
- Retention: $RETENTION_HOURS hours
- Peak multiplier: ${PEAK_MULTIPLIER}x
- Growth rate: $GROWTH_RATE% per month

## Current Requirements

### Throughput
- Average: $MB_PER_SEC MB/s
- Peak: $PEAK_MB_PER_SEC MB/s
- Daily volume: $GB_PER_DAY GB/day

### Storage
- Raw data: $(echo "scale=2; $STORAGE_NEEDED_GB / $REPLICATION" | bc) GB
- With replication: $STORAGE_NEEDED_GB GB
- With 20% overhead: $(echo "scale=2; $STORAGE_NEEDED_GB * 1.2" | bc) GB

### Network
- Total bandwidth: $NETWORK_MB_PER_SEC MB/s
- Per broker (${BROKERS_RECOMMENDED} brokers): $(echo "scale=2; $NETWORK_MB_PER_SEC / $BROKERS_RECOMMENDED" | bc) MB/s

## 12-Month Projection

### Growth
- Messages/second: $FUTURE_MSG_PER_SEC
- Storage needed: $FUTURE_STORAGE_GB GB
- Growth multiplier: ${FUTURE_MULTIPLIER}x

## Recommendations

### Broker Count
- For throughput: $BROKERS_NEEDED_THROUGHPUT brokers
- For storage: $BROKERS_NEEDED_STORAGE brokers
- **Recommended: $BROKERS_RECOMMENDED brokers**

### Hardware Specs (per broker)
- CPU: 8-16 cores
- Memory: 32-64 GB
- Storage: $(echo "scale=2; $FUTURE_STORAGE_GB / $BROKERS_RECOMMENDED * 1.5 / 1024" | bc) TB
- Network: 10 Gbps

### Partition Strategy
- Partitions per topic: $(echo "scale=0; $BROKERS_RECOMMENDED * 3" | bc)
- Max partitions per broker: 2000
- Target partitions per broker: 1000

### Consumer Requirements
- Min consumers: Equal to partition count
- Recommended: Partition count + 20%
- Processing capacity: $(echo "scale=2; $MSG_PER_SEC * $MSG_SIZE / 1048576" | bc) MB/s

## Scaling Triggers

1. **Add Broker When:**
   - Throughput > $(echo "scale=2; $BROKER_THROUGHPUT_MB * 0.8 * $BROKERS_RECOMMENDED" | bc) MB/s
   - Storage > 80% on any broker
   - CPU > 70% sustained

2. **Add Partitions When:**
   - Consumer lag grows consistently
   - Producer batching efficiency < 80%
   - Partition size > 100 GB

3. **Review Capacity When:**
   - Actual growth deviates > 20% from projection
   - Business requirements change
   - New use cases added

## Cost Estimation

### Infrastructure (Monthly)
- Compute: \$$(echo "$BROKERS_RECOMMENDED * 500" | bc) (estimated)
- Storage: \$$(echo "scale=0; $FUTURE_STORAGE_GB * 0.1" | bc) (estimated)
- Network: \$$(echo "scale=0; $NETWORK_MB_PER_SEC * 86400 * 30 / 1024 * 0.02" | bc) (estimated)
- **Total: \$$(echo "$BROKERS_RECOMMENDED * 500 + $FUTURE_STORAGE_GB * 0.1 + $NETWORK_MB_PER_SEC * 86400 * 30 / 1024 * 0.02" | bc)**

## Action Items

1. [ ] Review hardware specifications
2. [ ] Plan network capacity
3. [ ] Set up monitoring for scaling triggers
4. [ ] Create runbooks for scaling procedures
5. [ ] Schedule quarterly capacity reviews
REPORT

echo -e "\n✅ Capacity plan generated: reports/capacity-plan-$(date +%Y%m%d).md"
EOF

chmod +x scripts/capacity-planner.sh

# Run capacity planning
./scripts/capacity-planner.sh
```

### 5. Auto-scaling Simulation

```bash
# Create auto-scaling simulation
cat > scripts/simulate-autoscaling.sh << 'EOF'
#!/bin/bash
# Simulate auto-scaling behavior

echo "Auto-scaling Simulation"
echo "======================"

# Monitoring thresholds
CPU_SCALE_UP=70
CPU_SCALE_DOWN=30
LAG_SCALE_UP=100000
LAG_SCALE_DOWN=1000

# Current state
CURRENT_BROKERS=3
CURRENT_CONSUMERS=6

echo "Initial state:"
echo "- Brokers: $CURRENT_BROKERS"
echo "- Consumers: $CURRENT_CONSUMERS"
echo -e "\nSimulating 24-hour load pattern...\n"

# Simulate hourly metrics
for hour in {0..23}; do
  # Simulate load pattern (peak at business hours)
  if [ $hour -ge 9 ] && [ $hour -le 17 ]; then
    LOAD_MULTIPLIER=2.5
  elif [ $hour -ge 6 ] && [ $hour -le 20 ]; then
    LOAD_MULTIPLIER=1.5
  else
    LOAD_MULTIPLIER=0.5
  fi
  
  # Calculate metrics
  CPU_USAGE=$(echo "scale=0; 30 * $LOAD_MULTIPLIER" | bc)
  CONSUMER_LAG=$(echo "scale=0; 50000 * $LOAD_MULTIPLIER" | bc)
  
  echo "Hour $hour:00 - Load multiplier: $LOAD_MULTIPLIER"
  echo "  CPU Usage: ${CPU_USAGE}%"
  echo "  Consumer Lag: $CONSUMER_LAG messages"
  
  # Auto-scaling decisions
  SCALING_ACTION="none"
  
  if [ $CPU_USAGE -gt $CPU_SCALE_UP ]; then
    SCALING_ACTION="scale-up-brokers"
    CURRENT_BROKERS=$((CURRENT_BROKERS + 1))
  elif [ $CPU_USAGE -lt $CPU_SCALE_DOWN ] && [ $CURRENT_BROKERS -gt 3 ]; then
    SCALING_ACTION="scale-down-brokers"
    CURRENT_BROKERS=$((CURRENT_BROKERS - 1))
  fi
  
  if [ $CONSUMER_LAG -gt $LAG_SCALE_UP ]; then
    SCALING_ACTION="scale-up-consumers"
    CURRENT_CONSUMERS=$((CURRENT_CONSUMERS + 2))
  elif [ $CONSUMER_LAG -lt $LAG_SCALE_DOWN ] && [ $CURRENT_CONSUMERS -gt 6 ]; then
    SCALING_ACTION="scale-down-consumers"
    CURRENT_CONSUMERS=$((CURRENT_CONSUMERS - 1))
  fi
  
  if [ "$SCALING_ACTION" != "none" ]; then
    echo "  🔄 Auto-scaling action: $SCALING_ACTION"
    echo "  New state - Brokers: $CURRENT_BROKERS, Consumers: $CURRENT_CONSUMERS"
  fi
  
  echo
done

echo "Simulation complete!"
echo "Final state:"
echo "- Brokers: $CURRENT_BROKERS"
echo "- Consumers: $CURRENT_CONSUMERS"

# Generate auto-scaling policy
cat > configs/autoscaling-policy.yaml << 'POLICY'
# Kafka Auto-scaling Policy

broker_scaling:
  metrics:
    - name: cpu_usage
      target: 60
      scale_up_threshold: 70
      scale_down_threshold: 30
    - name: network_in_bytes
      target: 100000000  # 100 MB/s
      scale_up_threshold: 120000000
      scale_down_threshold: 50000000
  
  scale_up:
    increment: 1
    cooldown: 1800  # 30 minutes
    max_brokers: 10
  
  scale_down:
    decrement: 1
    cooldown: 3600  # 1 hour
    min_brokers: 3

consumer_scaling:
  metrics:
    - name: consumer_lag
      target: 10000
      scale_up_threshold: 100000
      scale_down_threshold: 1000
    - name: processing_time_ms
      target: 100
      scale_up_threshold: 200
      scale_down_threshold: 50
  
  scale_up:
    increment: 2
    cooldown: 300  # 5 minutes
    max_consumers_per_partition: 1
  
  scale_down:
    decrement: 1
    cooldown: 900  # 15 minutes
    min_consumers: 3

alerts:
  - name: scaling_failure
    condition: failed_scaling_actions > 3
    action: notify_ops_team
  
  - name: rapid_scaling
    condition: scaling_actions_per_hour > 5
    action: review_thresholds
POLICY

echo -e "\n✅ Auto-scaling policy created: configs/autoscaling-policy.yaml"
EOF

chmod +x scripts/simulate-autoscaling.sh

# Run auto-scaling simulation
./scripts/simulate-autoscaling.sh
```

### 6. Create Scaling Runbook

```bash
cat > reports/scaling-runbook.md << 'RUNBOOK'
# Kafka Scaling Runbook

## Pre-scaling Checklist

- [ ] Current metrics documented
- [ ] Scaling reason identified
- [ ] Capacity plan reviewed
- [ ] Rollback plan prepared
- [ ] Maintenance window scheduled
- [ ] Stakeholders notified

## Broker Scaling Procedure

### Adding a Broker

1. **Prepare new broker**
   ```bash
   # Update docker-compose.yml with new broker
   # Ensure unique broker ID and ports
   ```

2. **Start new broker**
   ```bash
   docker-compose up -d broker-4
   # Verify it joins the cluster
   docker logs week3-broker-4 | grep "started (kafka.server.KafkaServer)"
   ```

3. **Generate reassignment plan**
   ```bash
   # List topics to rebalance
   docker exec week3-broker-1 kafka-topics --list --bootstrap-server broker-1:9092
   
   # Create reassignment JSON
   # Use kafka-reassign-partitions tool
   ```

4. **Execute reassignment**
   ```bash
   docker exec week3-broker-1 kafka-reassign-partitions \
     --bootstrap-server broker-1:9092 \
     --reassignment-json-file /path/to/reassignment.json \
     --execute
   ```

5. **Monitor progress**
   ```bash
   # Check reassignment status
   docker exec week3-broker-1 kafka-reassign-partitions \
     --bootstrap-server broker-1:9092 \
     --reassignment-json-file /path/to/reassignment.json \
     --verify
   ```

### Removing a Broker

1. **Move partitions off broker**
2. **Verify no leader partitions**
3. **Shut down broker gracefully**
4. **Remove from cluster metadata**

## Partition Scaling

### Adding Partitions

```bash
# Increase partition count
docker exec week3-broker-1 kafka-topics \
  --alter \
  --topic <topic-name> \
  --partitions <new-count> \
  --bootstrap-server broker-1:9092
```

**Note**: Partitions can only be increased, never decreased!

### Partition Reassignment Strategy

1. **Even distribution**: Spread evenly across all brokers
2. **Rack-aware**: Ensure replicas span failure domains
3. **Leader balance**: Distribute leadership evenly

## Consumer Scaling

### Scale Up

1. **Verify partition availability**
   ```bash
   # Check partition count
   docker exec week3-broker-1 kafka-topics --describe --topic <topic>
   ```

2. **Add consumers**
   ```bash
   # Start additional consumer instances
   # Ensure they join the same consumer group
   ```

3. **Monitor rebalancing**
   ```bash
   # Watch for rebalance events
   docker logs <consumer-container> | grep "Rebalance"
   ```

### Scale Down

1. **Graceful shutdown**
   ```bash
   # Send SIGTERM to allow cleanup
   docker stop --time=30 <consumer-container>
   ```

2. **Verify partition reassignment**
3. **Monitor lag on remaining consumers**

## Monitoring During Scaling

### Key Metrics to Watch

1. **During broker scaling:**
   - Under-replicated partitions
   - ISR shrink/expansion rate
   - Network utilization
   - Disk I/O

2. **During consumer scaling:**
   - Consumer lag
   - Rebalance duration
   - Processing rate
   - Error rate

### Rollback Procedures

1. **Broker scaling rollback:**
   - Stop reassignment if in progress
   - Revert configuration changes
   - Remove added broker

2. **Consumer scaling rollback:**
   - Stop new consumers
   - Allow rebalance to complete
   - Verify original state restored

## Post-Scaling Validation

- [ ] All partitions have full ISR
- [ ] No under-replicated partitions
- [ ] Consumer lag normal
- [ ] Performance metrics improved
- [ ] No errors in logs
- [ ] Alerts cleared

## Common Issues and Solutions

| Issue | Symptoms | Solution |
|-------|----------|----------|
| Stuck reassignment | Progress at 0% | Check disk space, network |
| Rebalance storm | Continuous rebalancing | Increase session timeout |
| Uneven distribution | Some brokers overloaded | Run leader election |
| Performance degradation | Higher latency | Check replication throttling |
RUNBOOK
```

## Validation

Confirm your scaling analysis is complete:

- [ ] Tested partition scaling impact
- [ ] Simulated broker addition
- [ ] Analyzed consumer scaling strategies
- [ ] Created capacity planning report
- [ ] Simulated auto-scaling behavior
- [ ] Generated scaling runbook
- [ ] Documented scaling procedures
- [ ] Created monitoring dashboards

## Scaling Best Practices

### Do's
1. **Scale gradually** - Add resources incrementally
2. **Monitor everything** - Watch metrics during scaling
3. **Plan ahead** - Scale before hitting limits
4. **Test procedures** - Practice in non-production
5. **Document changes** - Keep configuration history

### Don'ts
1. **Don't scale blindly** - Understand the bottleneck first
2. **Don't over-provision** - Waste resources and money
3. **Don't ignore rebalancing** - It affects performance
4. **Don't scale during peak** - Risk service disruption
5. **Don't forget consumers** - They need scaling too

## Key Takeaways

1. **Scaling is multidimensional** - Brokers, partitions, consumers
2. **Capacity planning prevents emergencies** - Plan for growth
3. **Auto-scaling needs careful tuning** - Avoid flapping
4. **Monitoring enables proactive scaling** - Set proper alerts
5. **Practice makes perfect** - Test scaling procedures

## Next Steps

In Exercise 5, you'll create a comprehensive performance optimization project combining all the techniques learned this week.