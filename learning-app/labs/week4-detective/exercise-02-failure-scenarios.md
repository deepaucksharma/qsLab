# Exercise 2: Common Failure Scenarios and Resolution

**Objective:** Practice diagnosing and resolving common Kafka failure scenarios using systematic troubleshooting approaches.

**Time:** 60 minutes

**Prerequisites:** 
- Completed Exercise 1
- Lab environment running
- Troubleshooting scripts ready

## Background

This exercise simulates real-world Kafka failures you'll encounter in production:
- Connection and network issues
- Replication problems
- Consumer failures
- Data corruption
- Performance degradation

## Steps

### 1. Scenario 1: Broker Connection Failure

#### Simulate the Issue

```bash
# Create a topic for testing
docker exec week4-broker-1 kafka-topics --create \
  --bootstrap-server broker-1:9092 \
  --topic connection-test \
  --partitions 4 \
  --replication-factor 2

# Simulate network issue
echo "Simulating broker network failure..."
docker exec week4-chaos-mesh bash -c '
  # Block traffic to broker-2
  iptables -A INPUT -p tcp --dport 9093 -j DROP
  iptables -A OUTPUT -p tcp --sport 9093 -j DROP
'

# Try to produce messages
docker exec -it week4-broker-1 kafka-console-producer \
  --broker-list broker-1:9092,broker-2:9093 \
  --topic connection-test << EOF
message1
message2
message3
EOF
```

#### Diagnose the Issue

```bash
# Check broker connectivity
echo "1. Testing broker connectivity..."
docker exec week4-debug-tools bash -c '
  echo "Broker 1 -> Broker 2:"
  timeout 5 nc -zv broker-2 9093 || echo "Connection failed"
  echo -e "\nBroker 2 status:"
  timeout 5 nc -zv broker-2 9093 || echo "Not reachable"
'

# Check cluster state
echo -e "\n2. Checking cluster state..."
docker exec week4-broker-1 kafka-metadata shell --snapshot /var/kafka-logs/__cluster_metadata-0/00000000000000000000.log << 'CMDS'
brokers
exit
CMDS

# Check under-replicated partitions
echo -e "\n3. Checking replication status..."
docker exec week4-broker-1 kafka-topics --describe \
  --under-replicated-partitions \
  --bootstrap-server broker-1:9092

# Review logs
echo -e "\n4. Recent error logs:"
docker logs week4-broker-1 2>&1 | grep -E "Connection.*broker-2|failed.*9093" | tail -5
```

#### Resolve the Issue

```bash
# Fix network connectivity
echo "Resolving network issue..."
docker exec week4-chaos-mesh iptables -F

# Verify fix
docker exec week4-debug-tools nc -zv broker-2 9093

# Check replication recovery
echo "Waiting for replication to recover..."
sleep 10

docker exec week4-broker-1 kafka-topics --describe \
  --topic connection-test \
  --bootstrap-server broker-1:9092

# Verify message delivery
docker exec week4-broker-1 kafka-console-consumer \
  --bootstrap-server broker-1:9092 \
  --topic connection-test \
  --from-beginning \
  --max-messages 3
```

### 2. Scenario 2: Consumer Group Rebalancing Storm

#### Simulate the Issue

```bash
# Create consumer group issue script
cat > scripts/simulate-rebalance-storm.sh << 'EOF'
#!/bin/bash
# Simulate consumer rebalancing storm

TOPIC="rebalance-test"
GROUP="unstable-group"

# Create topic
docker exec week4-broker-1 kafka-topics --create \
  --bootstrap-server broker-1:9092 \
  --topic $TOPIC \
  --partitions 12 \
  --replication-factor 2 \
  2>/dev/null || true

# Produce test data
echo "Producing test data..."
docker exec week4-broker-1 kafka-producer-perf-test \
  --topic $TOPIC \
  --num-records 10000 \
  --record-size 1024 \
  --throughput -1 \
  --producer-props bootstrap.servers=broker-1:9092

# Start unstable consumers
echo "Starting unstable consumers..."
for i in {1..4}; do
  docker exec week4-broker-1 bash -c "
    kafka-console-consumer \
      --bootstrap-server broker-1:9092 \
      --topic $TOPIC \
      --group $GROUP \
      --consumer-property session.timeout.ms=6000 \
      --consumer-property heartbeat.interval.ms=1000 \
      --consumer-property max.poll.interval.ms=10000 \
      > /dev/null 2>&1 &
    
    # Simulate processing delays randomly
    sleep $((RANDOM % 15 + 5))
    
    # Kill consumer to trigger rebalance
    pkill -f 'console-consumer.*$GROUP' || true
  " &
done

echo "Rebalancing storm in progress..."
echo "Monitor with: docker exec week4-broker-1 kafka-consumer-groups --describe --group $GROUP --bootstrap-server broker-1:9092"
EOF

chmod +x scripts/simulate-rebalance-storm.sh
./scripts/simulate-rebalance-storm.sh
```

#### Diagnose the Issue

```bash
# Monitor consumer group state
watch -n 2 "docker exec week4-broker-1 kafka-consumer-groups \
  --describe \
  --group unstable-group \
  --bootstrap-server broker-1:9092 | grep -E 'STATE|CONSUMER-ID|LAG'"

# In another terminal, check rebalancing metrics
docker exec week4-broker-1 kafka-run-class kafka.tools.JmxTool \
  --jmx-url service:jmx:rmi:///jndi/rmi://localhost:9101/jmxrmi \
  --object-name 'kafka.consumer:type=consumer-coordinator-metrics,client-id=*' \
  --attributes rebalance-total,rebalance-rate-per-hour \
  --one-time true

# Analyze consumer logs
docker logs week4-broker-1 2>&1 | grep -i "rebalance" | tail -20
```

#### Resolve the Issue

```bash
# Stop problematic consumers
docker exec week4-broker-1 pkill -f "console-consumer.*unstable-group"

# Reset consumer group
docker exec week4-broker-1 kafka-consumer-groups \
  --bootstrap-server broker-1:9092 \
  --group unstable-group \
  --reset-offsets \
  --to-earliest \
  --topic rebalance-test \
  --execute

# Start stable consumers with proper configuration
cat > scripts/stable-consumer.sh << 'EOF'
#!/bin/bash
# Start stable consumer with optimized settings

docker exec -d week4-broker-1 kafka-console-consumer \
  --bootstrap-server broker-1:9092 \
  --topic rebalance-test \
  --group stable-group \
  --consumer-property session.timeout.ms=30000 \
  --consumer-property heartbeat.interval.ms=3000 \
  --consumer-property max.poll.interval.ms=300000 \
  --consumer-property max.poll.records=500 \
  > /tmp/stable-consumer.log 2>&1
EOF

chmod +x scripts/stable-consumer.sh

# Start multiple stable consumers
for i in {1..3}; do
  ./scripts/stable-consumer.sh
  sleep 2
done

# Verify stability
sleep 10
docker exec week4-broker-1 kafka-consumer-groups \
  --describe \
  --group stable-group \
  --bootstrap-server broker-1:9092
```

### 3. Scenario 3: Disk Space Exhaustion

#### Simulate the Issue

```bash
# Fill up disk space on broker
echo "Simulating disk space issue..."
docker exec week4-broker-1 bash -c '
  # Create large file to consume space
  dd if=/dev/zero of=/var/lib/kafka/large-file bs=1M count=500
  
  # Check disk usage
  df -h /var/lib/kafka
'

# Try to create new topic
docker exec week4-broker-1 kafka-topics --create \
  --bootstrap-server broker-1:9092 \
  --topic disk-test \
  --partitions 3 \
  --replication-factor 2
```

#### Diagnose the Issue

```bash
# Check disk usage across brokers
echo "Checking disk usage..."
for broker in 1 2; do
  echo "Broker $broker:"
  docker exec week4-broker-$broker df -h /var/lib/kafka
done

# Check logs for disk-related errors
echo -e "\nChecking for disk errors..."
docker logs week4-broker-1 2>&1 | grep -iE "IOException|No space left|Disk full" | tail -10

# Check topic creation status
docker exec week4-broker-1 kafka-topics --describe \
  --topic disk-test \
  --bootstrap-server broker-1:9092 2>&1
```

#### Resolve the Issue

```bash
# Clean up disk space
echo "Cleaning up disk space..."

# Remove test file
docker exec week4-broker-1 rm -f /var/lib/kafka/large-file

# Clean old log segments
docker exec week4-broker-1 kafka-log-dirs \
  --describe \
  --bootstrap-server broker-1:9092 \
  --topic-list rebalance-test

# Delete unnecessary topics
docker exec week4-broker-1 kafka-topics --delete \
  --topic rebalance-test \
  --bootstrap-server broker-1:9092

# Force log cleanup
docker exec week4-broker-1 kafka-configs \
  --bootstrap-server broker-1:9092 \
  --entity-type brokers \
  --entity-name 1 \
  --alter \
  --add-config log.retention.ms=60000

# Wait for cleanup
sleep 70

# Verify disk space recovered
docker exec week4-broker-1 df -h /var/lib/kafka
```

### 4. Scenario 4: Authentication/Authorization Failure

#### Simulate the Issue

```bash
# Create a topic with ACLs (simulated)
cat > scripts/simulate-auth-failure.sh << 'EOF'
#!/bin/bash
# Simulate authentication failure

# Create restricted topic
docker exec week4-broker-1 kafka-topics --create \
  --bootstrap-server broker-1:9092 \
  --topic secure-topic \
  --partitions 2 \
  --replication-factor 2

# Simulate auth failure by blocking specific client
docker exec week4-broker-1 bash -c '
  # Add to server.properties (simulation)
  echo "# Simulated auth failure for client" >> /tmp/auth-block.txt
  echo "blocked.client.id=unauthorized-client" >> /tmp/auth-block.txt
'

# Try to produce with "unauthorized" client
docker exec week4-broker-1 kafka-console-producer \
  --broker-list broker-1:9092 \
  --topic secure-topic \
  --producer-property client.id=unauthorized-client \
  2>&1 | tee /tmp/auth-error.log &

sleep 5
echo "test message" > /tmp/test-msg.txt
docker exec -i week4-broker-1 bash -c 'cat > /tmp/test-msg.txt'

echo "Check /tmp/auth-error.log for authentication errors"
EOF

chmod +x scripts/simulate-auth-failure.sh
```

#### Diagnose the Issue

```bash
# Check for authentication errors
echo "Checking authentication logs..."
docker logs week4-broker-1 2>&1 | grep -iE "authentication|authorization|denied|forbidden" | tail -10

# Verify topic accessibility
docker exec week4-broker-1 kafka-acls --list \
  --bootstrap-server broker-1:9092 2>/dev/null || echo "No ACLs configured"

# Test with different client
docker exec week4-broker-1 kafka-console-producer \
  --broker-list broker-1:9092 \
  --topic secure-topic \
  --producer-property client.id=authorized-client \
  --timeout 5000 << EOF
authorized message
EOF
```

### 5. Scenario 5: Data Corruption

#### Simulate the Issue

```bash
# Create corruption detection script
cat > scripts/detect-corruption.sh << 'EOF'
#!/bin/bash
# Detect and handle data corruption

TOPIC="corruption-test"

# Create topic and produce data
docker exec week4-broker-1 kafka-topics --create \
  --bootstrap-server broker-1:9092 \
  --topic $TOPIC \
  --partitions 2 \
  --replication-factor 2

# Produce valid data
echo "Producing valid data..."
for i in {1..100}; do
  echo "message-$i"
done | docker exec -i week4-broker-1 kafka-console-producer \
  --broker-list broker-1:9092 \
  --topic $TOPIC

# Simulate corruption by modifying log file (DO NOT DO IN PRODUCTION!)
echo "Simulating log corruption..."
docker exec week4-broker-1 bash -c '
  # Find a log file
  LOG_FILE=$(find /var/lib/kafka -name "*.log" -size +0 | grep "'$TOPIC'" | head -1)
  if [ -n "$LOG_FILE" ]; then
    echo "Corrupting file: $LOG_FILE"
    # Corrupt a few bytes in the middle
    dd if=/dev/urandom of="$LOG_FILE" bs=1 count=10 seek=1000 conv=notrunc
  fi
'

# Try to consume (will likely fail)
echo "Attempting to consume..."
docker exec week4-broker-1 kafka-console-consumer \
  --bootstrap-server broker-1:9092 \
  --topic $TOPIC \
  --from-beginning \
  --max-messages 10 2>&1 | tee /tmp/corruption-error.log
EOF

chmod +x scripts/detect-corruption.sh
```

#### Diagnose Corruption

```bash
# Check for corruption errors
docker logs week4-broker-1 2>&1 | grep -iE "corrupt|CRC|checksum" | tail -10

# Verify topic health
docker exec week4-broker-1 kafka-log-dirs \
  --describe \
  --bootstrap-server broker-1:9092 \
  --topic-list corruption-test

# Run log verification
docker exec week4-broker-1 kafka-run-class kafka.tools.DumpLogSegments \
  --files /var/lib/kafka/corruption-test-0/00000000000000000000.log \
  --print-data-log 2>&1 | head -20
```

### 6. Create Failure Resolution Runbook

```bash
cat > failure-resolution-runbook.md << 'RUNBOOK'
# Kafka Failure Resolution Runbook

## Connection Failures

### Symptoms
- TimeoutException in producer/consumer
- "Connection refused" errors
- Broker not reachable

### Resolution Steps
1. Verify network connectivity: `nc -zv broker-host port`
2. Check broker status: `docker ps | grep broker`
3. Review broker logs: `docker logs broker-container`
4. Verify listener configuration
5. Check firewall rules
6. Restart affected broker if necessary

## Rebalancing Issues

### Symptoms
- Continuous rebalancing
- High consumer lag
- "Attempt to heartbeat failed" errors

### Resolution Steps
1. Check consumer group status
2. Review consumer configuration:
   - session.timeout.ms (increase to 30000)
   - max.poll.interval.ms (increase to 300000)
   - max.poll.records (decrease to manageable size)
3. Stop problematic consumers
4. Reset consumer group if needed
5. Restart with optimized configuration

## Disk Space Issues

### Symptoms
- "No space left on device" errors
- IOException in logs
- Failed topic creation

### Resolution Steps
1. Check disk usage: `df -h`
2. Identify large topics: `kafka-log-dirs --describe`
3. Delete unnecessary topics
4. Adjust retention policies
5. Clean up old log segments
6. Add disk space if needed

## Authentication Failures

### Symptoms
- "Authentication failed" errors
- "Not authorized" messages
- Connection immediately closed

### Resolution Steps
1. Verify credentials
2. Check ACLs: `kafka-acls --list`
3. Review security configuration
4. Test with different credentials
5. Check certificate validity (if using SSL)

## Data Corruption

### Symptoms
- CRC checksum failures
- "Corrupt index found" errors
- Consumer unable to read messages

### Resolution Steps
1. Identify corrupted partitions
2. Stop affected consumers
3. Check replica health
4. Reassign partition leadership
5. If necessary, delete corrupted segments
6. Restore from replicas

## Emergency Procedures

### Complete Broker Failure
1. Isolate failed broker
2. Check hardware/disk
3. Attempt restart
4. If unsuccessful, decommission broker
5. Add replacement broker
6. Rebalance partitions

### Cluster-wide Outage
1. Check Zookeeper health first
2. Start brokers one by one
3. Verify quorum establishment
4. Check topic availability
5. Validate data integrity
6. Resume client operations gradually
RUNBOOK
```

## Validation

Practice resolving each failure scenario:

- [ ] Successfully diagnosed and fixed connection failure
- [ ] Resolved consumer rebalancing storm
- [ ] Handled disk space exhaustion
- [ ] Troubleshot authentication issues
- [ ] Detected and managed data corruption
- [ ] Created failure resolution documentation
- [ ] Tested recovery procedures
- [ ] Documented lessons learned

## Key Troubleshooting Patterns

### Pattern Recognition

1. **Network Issues**
   - Symptoms: Timeouts, connection refused
   - Tools: nc, telnet, tcpdump
   - Fix: Network configuration, firewall rules

2. **Resource Exhaustion**
   - Symptoms: Slow performance, failures
   - Tools: df, top, iostat
   - Fix: Clean up, scale resources

3. **Configuration Problems**
   - Symptoms: Unexpected behavior
   - Tools: kafka-configs, log analysis
   - Fix: Adjust settings, restart

4. **Data Issues**
   - Symptoms: CRC errors, read failures
   - Tools: DumpLogSegments, replica verification
   - Fix: Restore from replicas, reassign

## Troubleshooting Best Practices

1. **Preserve Evidence** - Collect logs before fixing
2. **Isolate Problems** - Test one component at a time
3. **Use Least Invasive Fix** - Try simple solutions first
4. **Verify Resolution** - Confirm fix worked
5. **Document Everything** - Update runbooks

## Next Steps

In the next exercise, you'll learn advanced debugging techniques including distributed tracing and performance profiling.