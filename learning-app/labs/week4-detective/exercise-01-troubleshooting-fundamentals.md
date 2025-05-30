# Exercise 1: Kafka Troubleshooting Fundamentals

**Objective:** Master the essential tools and techniques for troubleshooting Kafka issues, from basic health checks to deep diagnostic analysis.

**Time:** 45 minutes

**Prerequisites:** 
- Week 4 lab environment running (`docker-compose up -d`)
- Basic understanding of Kafka architecture
- Familiarity with log analysis

## Background

Effective Kafka troubleshooting requires:
- **Systematic approach**: Following a structured diagnostic process
- **Right tools**: Using appropriate commands and utilities
- **Log correlation**: Connecting events across components
- **Metric analysis**: Understanding what metrics indicate
- **Root cause focus**: Looking beyond symptoms

## Steps

### 1. Start the Lab Environment and Verify Health

```bash
cd ~/qsLab/learning-app/labs/week4-detective
docker-compose up -d

# Wait for services to start
sleep 30

# Comprehensive health check
echo "=== Kafka Cluster Health Check ==="
```

Create a comprehensive health check script:

```bash
cat > scripts/health-check.sh << 'EOF'
#!/bin/bash
# Comprehensive Kafka health check

echo "Kafka Troubleshooting Health Check"
echo "================================="
echo

# Check Zookeeper
echo "1. Zookeeper Status:"
docker exec week4-zookeeper bash -c 'echo stat | nc localhost 2181' 2>/dev/null || echo "❌ Zookeeper not responding"

# Check Kafka brokers
echo -e "\n2. Kafka Broker Status:"
for broker in 1 2; do
  echo -n "   Broker $broker: "
  if docker exec week4-broker-$broker kafka-broker-api-versions --bootstrap-server localhost:909$((1+broker)) >/dev/null 2>&1; then
    echo "✅ Running"
  else
    echo "❌ Not responding"
  fi
done

# Check cluster metadata
echo -e "\n3. Cluster Metadata:"
docker exec week4-broker-1 kafka-metadata --snapshot /var/kafka-logs/__cluster_metadata-0/00000000000000000000.log 2>/dev/null | head -20 || \
docker exec week4-broker-1 kafka-broker-api-versions --bootstrap-server broker-1:9092 2>&1 | grep -E "brokers|version"

# Check topics
echo -e "\n4. Topics:"
docker exec week4-broker-1 kafka-topics --list --bootstrap-server broker-1:9092 2>/dev/null | wc -l | awk '{print "   Total topics: " $1}'

# Check consumer groups
echo -e "\n5. Consumer Groups:"
docker exec week4-broker-1 kafka-consumer-groups --list --bootstrap-server broker-1:9092 2>/dev/null | wc -l | awk '{print "   Total groups: " $1}'

# Check under-replicated partitions
echo -e "\n6. Replication Health:"
URP=$(docker exec week4-broker-1 kafka-topics --describe --under-replicated-partitions --bootstrap-server broker-1:9092 2>/dev/null | wc -l)
if [ $URP -gt 1 ]; then
  echo "   ⚠️  Under-replicated partitions: $(($URP-1))"
else
  echo "   ✅ All partitions fully replicated"
fi

# Check log errors
echo -e "\n7. Recent Errors (last 10):"
for broker in 1 2; do
  echo "   Broker $broker errors:"
  docker logs week4-broker-$broker 2>&1 | grep -iE "ERROR|FATAL" | tail -5 | sed 's/^/     /'
done

echo -e "\n✅ Health check complete"
EOF

chmod +x scripts/health-check.sh
./scripts/health-check.sh
```

### 2. Create Diagnostic Information Collector

```bash
# Create comprehensive diagnostic script
cat > scripts/collect-diagnostics.sh << 'EOF'
#!/bin/bash
# Kafka diagnostic information collector

DIAG_DIR="diagnostics-$(date +%Y%m%d-%H%M%S)"
mkdir -p $DIAG_DIR

echo "Collecting Kafka diagnostics to $DIAG_DIR..."

# 1. Cluster state
echo "1. Collecting cluster state..."
docker exec week4-broker-1 kafka-metadata --snapshot /var/kafka-logs/__cluster_metadata-0/00000000000000000000.log > $DIAG_DIR/cluster-metadata.txt 2>&1 || \
docker exec week4-broker-1 kafka-topics --describe --bootstrap-server broker-1:9092 > $DIAG_DIR/topics.txt 2>&1

# 2. Consumer group details
echo "2. Collecting consumer group information..."
docker exec week4-broker-1 kafka-consumer-groups --all-groups --describe --bootstrap-server broker-1:9092 > $DIAG_DIR/consumer-groups.txt 2>&1

# 3. Broker configurations
echo "3. Collecting broker configurations..."
for broker in 1 2; do
  docker exec week4-broker-$broker kafka-configs --bootstrap-server broker-$broker:909$((1+broker)) \
    --entity-type brokers --entity-name $broker --describe > $DIAG_DIR/broker-$broker-config.txt 2>&1
done

# 4. JMX metrics
echo "4. Collecting JMX metrics..."
for broker in 1 2; do
  docker exec week4-broker-$broker kafka-run-class kafka.tools.JmxTool \
    --jmx-url service:jmx:rmi:///jndi/rmi://localhost:910$broker/jmxrmi \
    --object-name 'kafka.server:type=*,name=*' \
    --one-time true > $DIAG_DIR/broker-$broker-jmx.txt 2>&1 &
done
sleep 5

# 5. Log files (last 1000 lines)
echo "5. Collecting recent logs..."
for broker in 1 2; do
  docker logs week4-broker-$broker --tail 1000 > $DIAG_DIR/broker-$broker-logs.txt 2>&1
done
docker logs week4-zookeeper --tail 500 > $DIAG_DIR/zookeeper-logs.txt 2>&1

# 6. System resources
echo "6. Collecting system resource usage..."
docker stats --no-stream > $DIAG_DIR/docker-stats.txt
docker ps -a > $DIAG_DIR/docker-ps.txt

# 7. Network connectivity
echo "7. Testing network connectivity..."
docker exec week4-debug-tools bash -c '
  echo "=== Network Tests ===" 
  echo "Broker 1 -> Broker 2:"
  nc -zv broker-2 9093
  echo -e "\nBroker 2 -> Broker 1:"
  nc -zv broker-1 9092
  echo -e "\nBrokers -> Zookeeper:"
  nc -zv zookeeper 2181
' > $DIAG_DIR/network-tests.txt 2>&1

# Create summary
echo "8. Creating diagnostic summary..."
cat > $DIAG_DIR/SUMMARY.md << 'SUMMARY'
# Kafka Diagnostic Summary

**Generated:** $(date)

## Quick Status
- Brokers: $(docker ps --filter "name=week4-broker" -q | wc -l) running
- Topics: $(docker exec week4-broker-1 kafka-topics --list --bootstrap-server broker-1:9092 2>/dev/null | wc -l)
- Consumer Groups: $(docker exec week4-broker-1 kafka-consumer-groups --list --bootstrap-server broker-1:9092 2>/dev/null | wc -l)

## Files Collected
- cluster-metadata.txt: Cluster metadata snapshot
- topics.txt: Topic configurations and status
- consumer-groups.txt: Consumer group states
- broker-*-config.txt: Broker configurations
- broker-*-jmx.txt: JMX metrics snapshot
- broker-*-logs.txt: Recent broker logs
- zookeeper-logs.txt: Recent Zookeeper logs
- docker-stats.txt: Container resource usage
- network-tests.txt: Network connectivity tests

## Next Steps
1. Review logs for ERROR/WARN messages
2. Check consumer group lag
3. Verify topic replication
4. Analyze JMX metrics for anomalies
SUMMARY

echo "✅ Diagnostics collected to $DIAG_DIR/"
echo "   Review $DIAG_DIR/SUMMARY.md for overview"
EOF

chmod +x scripts/collect-diagnostics.sh
```

### 3. Build Troubleshooting Decision Tree

```bash
# Create interactive troubleshooting guide
cat > scripts/troubleshooting-guide.sh << 'EOF'
#!/bin/bash
# Interactive Kafka troubleshooting guide

echo "Kafka Troubleshooting Guide"
echo "=========================="
echo

PS3="Select the issue you're experiencing: "
options=(
  "Producer cannot send messages"
  "Consumer not receiving messages"
  "High consumer lag"
  "Broker is down"
  "Under-replicated partitions"
  "Connection timeouts"
  "Authentication failures"
  "Performance degradation"
  "Exit"
)

select opt in "${options[@]}"
do
  case $opt in
    "Producer cannot send messages")
      echo -e "\n📝 Producer Troubleshooting Steps:\n"
      echo "1. Check broker connectivity:"
      echo "   docker exec week4-broker-1 kafka-broker-api-versions --bootstrap-server broker-1:9092"
      echo
      echo "2. Verify topic exists:"
      echo "   docker exec week4-broker-1 kafka-topics --list --bootstrap-server broker-1:9092 | grep your-topic"
      echo
      echo "3. Check producer logs for errors:"
      echo "   - Look for: TimeoutException, NotLeaderForPartitionException"
      echo
      echo "4. Test with console producer:"
      echo "   docker exec -it week4-broker-1 kafka-console-producer --broker-list broker-1:9092 --topic test-topic"
      echo
      echo "5. Check broker logs:"
      echo "   docker logs week4-broker-1 | grep ERROR | tail -20"
      break
      ;;
      
    "Consumer not receiving messages")
      echo -e "\n📥 Consumer Troubleshooting Steps:\n"
      echo "1. Check consumer group status:"
      echo "   docker exec week4-broker-1 kafka-consumer-groups --bootstrap-server broker-1:9092 --group your-group --describe"
      echo
      echo "2. Verify topic has messages:"
      echo "   docker exec week4-broker-1 kafka-run-class kafka.tools.GetOffsetShell --broker-list broker-1:9092 --topic your-topic"
      echo
      echo "3. Check consumer position:"
      echo "   - Look at CURRENT-OFFSET vs LOG-END-OFFSET"
      echo
      echo "4. Test with console consumer:"
      echo "   docker exec -it week4-broker-1 kafka-console-consumer --bootstrap-server broker-1:9092 --topic your-topic --from-beginning"
      echo
      echo "5. Check for rebalancing issues:"
      echo "   - Look for continuous rebalancing in logs"
      break
      ;;
      
    "High consumer lag")
      echo -e "\n⏱️  Consumer Lag Troubleshooting:\n"
      echo "1. Measure current lag:"
      echo "   docker exec week4-broker-1 kafka-consumer-groups --bootstrap-server broker-1:9092 --all-groups --describe | grep LAG"
      echo
      echo "2. Check consumer performance:"
      echo "   - Processing time per message"
      echo "   - Number of consumer instances"
      echo
      echo "3. Analyze partition distribution:"
      echo "   docker exec week4-broker-1 kafka-consumer-groups --bootstrap-server broker-1:9092 --group your-group --describe --members"
      echo
      echo "4. Solutions:"
      echo "   - Add more consumer instances"
      echo "   - Increase max.poll.records"
      echo "   - Optimize message processing"
      break
      ;;
      
    "Broker is down")
      echo -e "\n🔴 Broker Down Troubleshooting:\n"
      echo "1. Check container status:"
      echo "   docker ps -a | grep week4-broker"
      echo
      echo "2. Review broker logs:"
      echo "   docker logs week4-broker-1 --tail 100"
      echo
      echo "3. Check Zookeeper connectivity:"
      echo "   docker exec week4-broker-1 nc -zv zookeeper 2181"
      echo
      echo "4. Verify disk space:"
      echo "   docker exec week4-broker-1 df -h /var/lib/kafka"
      echo
      echo "5. Restart broker:"
      echo "   docker restart week4-broker-1"
      break
      ;;
      
    "Exit")
      break
      ;;
      
    *) echo "Invalid option";;
  esac
done
EOF

chmod +x scripts/troubleshooting-guide.sh
```

### 4. Log Analysis Techniques

```bash
# Create log analysis script
cat > scripts/analyze-logs.sh << 'EOF'
#!/bin/bash
# Kafka log analysis tool

LOG_FILE=${1:-""}
if [ -z "$LOG_FILE" ]; then
  echo "Usage: $0 <log-file> or docker-logs <container>"
  echo "Example: $0 broker-1-logs.txt"
  echo "Example: $0 docker-logs week4-broker-1"
  exit 1
fi

if [ "$LOG_FILE" = "docker-logs" ]; then
  CONTAINER=$2
  echo "Analyzing logs from container: $CONTAINER"
  LOGS=$(docker logs $CONTAINER 2>&1)
else
  echo "Analyzing log file: $LOG_FILE"
  LOGS=$(cat $LOG_FILE)
fi

echo "Log Analysis Report"
echo "=================="
echo

# Error summary
echo "1. Error Summary:"
echo "$LOGS" | grep -iE "ERROR|FATAL" | awk '{print $NF}' | sort | uniq -c | sort -rn | head -10

# Warning summary
echo -e "\n2. Warning Summary:"
echo "$LOGS" | grep -i "WARN" | awk '{print $NF}' | sort | uniq -c | sort -rn | head -10

# Exception types
echo -e "\n3. Exception Types:"
echo "$LOGS" | grep -oE "[a-zA-Z]+Exception" | sort | uniq -c | sort -rn

# Time-based error distribution
echo -e "\n4. Errors by Hour:"
echo "$LOGS" | grep -iE "ERROR|FATAL" | awk '{print substr($2,1,2)}' | sort | uniq -c

# Connection issues
echo -e "\n5. Connection Issues:"
echo "$LOGS" | grep -iE "connection.*failed|connection.*refused|connection.*timeout" | wc -l | awk '{print "   Total connection errors: " $1}'

# Replication issues
echo -e "\n6. Replication Issues:"
echo "$LOGS" | grep -iE "ISR.*shrink|under.*replicated|replica.*lag" | wc -l | awk '{print "   Total replication issues: " $1}'

# Recent critical events
echo -e "\n7. Recent Critical Events (last 5):"
echo "$LOGS" | grep -iE "FATAL|ERROR.*failed|ERROR.*exception" | tail -5

# Performance indicators
echo -e "\n8. Performance Indicators:"
echo "$LOGS" | grep -iE "request.*took.*ms|latency|slow" | tail -5
EOF

chmod +x scripts/analyze-logs.sh

# Test log analysis
./scripts/analyze-logs.sh docker-logs week4-broker-1
```

### 5. Create Common Issues Simulator

```bash
# Create script to simulate common issues
cat > scripts/simulate-issues.sh << 'EOF'
#!/bin/bash
# Simulate common Kafka issues for troubleshooting practice

echo "Kafka Issue Simulator"
echo "===================="
echo

PS3="Select an issue to simulate: "
options=(
  "Network partition"
  "Disk full"
  "High CPU usage"
  "Memory pressure"
  "Slow consumer"
  "Authentication failure"
  "Topic deletion in progress"
  "Corrupted log segment"
  "Exit"
)

select opt in "${options[@]}"
do
  case $opt in
    "Network partition")
      echo "Simulating network partition between brokers..."
      docker exec week4-debug-tools iptables -A INPUT -s broker-2 -j DROP
      docker exec week4-debug-tools iptables -A OUTPUT -d broker-2 -j DROP
      echo "✅ Network partition created. Brokers cannot communicate."
      echo "To fix: docker exec week4-debug-tools iptables -F"
      break
      ;;
      
    "Disk full")
      echo "Simulating disk full condition..."
      docker exec week4-broker-1 dd if=/dev/zero of=/var/lib/kafka/disk-filler bs=1M count=1000
      echo "✅ Large file created. Check disk usage."
      echo "To fix: docker exec week4-broker-1 rm /var/lib/kafka/disk-filler"
      break
      ;;
      
    "High CPU usage")
      echo "Simulating high CPU usage..."
      docker exec week4-broker-1 bash -c 'while true; do echo "scale=1000; 4*a(1)" | bc -l > /dev/null; done' &
      echo "✅ CPU stress test started."
      echo "To fix: docker exec week4-broker-1 pkill -f bc"
      break
      ;;
      
    "Exit")
      break
      ;;
      
    *) echo "Invalid option";;
  esac
done
EOF

chmod +x scripts/simulate-issues.sh
```

### 6. Build Log Correlation Dashboard

```bash
# Create log shipping configuration for Logstash
mkdir -p configs
cat > configs/logstash.conf << 'EOF'
input {
  tcp {
    port => 5000
    codec => json
  }
  
  # Collect Docker logs
  exec {
    command => "docker logs week4-broker-1 --tail 100 2>&1"
    interval => 30
    type => "kafka-broker-1"
  }
  
  exec {
    command => "docker logs week4-broker-2 --tail 100 2>&1"
    interval => 30
    type => "kafka-broker-2"
  }
}

filter {
  # Parse Kafka log format
  grok {
    match => { 
      "message" => "\[%{TIMESTAMP_ISO8601:timestamp}\] %{LOGLEVEL:level} %{GREEDYDATA:log_message}"
    }
  }
  
  # Extract error details
  if [level] == "ERROR" {
    grok {
      match => {
        "log_message" => "%{WORD:error_type}Exception: %{GREEDYDATA:error_detail}"
      }
      tag_on_failure => []
    }
  }
  
  # Add metadata
  mutate {
    add_field => {
      "cluster" => "week4-detective"
      "environment" => "lab"
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "kafka-logs-%{+YYYY.MM.dd}"
  }
  
  # Also output errors to stdout
  if [level] == "ERROR" {
    stdout {
      codec => rubydebug
    }
  }
}
EOF

# Restart Logstash with new config
docker restart week4-logstash
```

### 7. Create Troubleshooting Checklist

```bash
cat > troubleshooting-checklist.md << 'CHECKLIST'
# Kafka Troubleshooting Checklist

## Initial Assessment
- [ ] Run health check script
- [ ] Collect diagnostic information
- [ ] Check all container statuses
- [ ] Review recent error logs

## Connection Issues
- [ ] Verify network connectivity between components
- [ ] Check firewall rules
- [ ] Validate bootstrap servers configuration
- [ ] Test with telnet/nc to ports

## Producer Issues
- [ ] Verify topic exists and is writable
- [ ] Check broker availability
- [ ] Review producer configuration
- [ ] Test with console producer
- [ ] Check for quota violations

## Consumer Issues
- [ ] Check consumer group status
- [ ] Verify topic has messages
- [ ] Review consumer configuration
- [ ] Check for rebalancing loops
- [ ] Validate offset positions

## Performance Issues
- [ ] Monitor CPU and memory usage
- [ ] Check disk I/O patterns
- [ ] Review JVM heap usage
- [ ] Analyze GC logs
- [ ] Check network utilization

## Replication Issues
- [ ] Identify under-replicated partitions
- [ ] Check ISR status
- [ ] Verify inter-broker connectivity
- [ ] Review replica lag metrics
- [ ] Check disk space on all brokers

## Data Issues
- [ ] Verify message format
- [ ] Check serialization/deserialization
- [ ] Review schema registry (if used)
- [ ] Validate data pipeline

## Recovery Actions
- [ ] Document issue and timeline
- [ ] Implement fix
- [ ] Verify resolution
- [ ] Update runbooks
- [ ] Post-mortem analysis
CHECKLIST
```

## Validation

Complete these troubleshooting fundamentals:

- [ ] Successfully ran health check script
- [ ] Collected comprehensive diagnostics
- [ ] Used troubleshooting guide for different scenarios
- [ ] Analyzed logs for patterns and errors
- [ ] Simulated and resolved an issue
- [ ] Set up log aggregation with ELK
- [ ] Created correlation queries
- [ ] Completed troubleshooting checklist

## Common Troubleshooting Patterns

### Pattern 1: Connection Refused
```bash
# Symptoms: Connection refused errors
# Check: Port accessibility
docker exec week4-debug-tools nc -zv broker-1 9092

# Check: Broker status
docker ps | grep broker

# Check: Listener configuration
docker exec week4-broker-1 kafka-configs --describe
```

### Pattern 2: Leader Not Available
```bash
# Symptoms: Leader not available for partition
# Check: Topic details
docker exec week4-broker-1 kafka-topics --describe --topic affected-topic

# Check: Broker availability
docker exec week4-broker-1 kafka-metadata shell --snapshot

# Fix: Trigger leader election
docker exec week4-broker-1 kafka-leader-election --all-topic-partitions
```

### Pattern 3: Consumer Lag Growing
```bash
# Symptoms: Increasing consumer lag
# Check: Consumer group details
docker exec week4-broker-1 kafka-consumer-groups --describe --group affected-group

# Check: Consumer logs
docker logs consumer-container | grep ERROR

# Fix: Scale consumers or optimize processing
```

## Troubleshooting Tips

1. **Start with basics** - Check connectivity and health first
2. **Collect before fixing** - Gather diagnostics before making changes
3. **One change at a time** - Isolate variables when troubleshooting
4. **Document everything** - Keep notes for future reference
5. **Use the right tool** - Different issues need different approaches

## Next Steps

In the next exercise, you'll learn to troubleshoot specific failure scenarios and practice root cause analysis.