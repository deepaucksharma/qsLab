# Exercise 2: Building Your First Flex Integration

**Objective:** Create a custom New Relic Flex integration to monitor Kafka tombstone ratios automatically.

**Time:** 45 minutes

**Prerequisites:** 
- Completed Exercise 1
- New Relic Infrastructure agent running
- Basic understanding of YAML configuration

## Background

New Relic Flex allows you to create custom integrations without writing code. You'll use it to:
- Execute scripts and collect their output
- Transform data into metrics
- Send custom events to New Relic
- Monitor anything that can produce structured output

## Steps

### 1. Create the Flex Configuration Directory

```bash
# Create directory structure for Flex configs
mkdir -p ~/qsLab/learning-app/labs/week2-builder/configs
cd ~/qsLab/learning-app/labs/week2-builder
```

### 2. Build a Tombstone Detection Script

First, create an improved script that outputs JSON:

```bash
cat > scripts/tombstone-monitor.sh << 'EOF'
#!/bin/bash
# Tombstone monitoring script for Flex integration

BOOTSTRAP_SERVER="${KAFKA_BOOTSTRAP_SERVER:-broker:9092}"
TOPICS="${KAFKA_TOPICS:-all}"

# Function to analyze a single topic
analyze_topic() {
    local topic=$1
    local total=0
    local tombstones=0
    local temp_file="/tmp/kafka_messages_$$.txt"
    
    # Consume messages and save to temp file
    timeout 5s docker exec week2-broker kafka-console-consumer \
        --bootstrap-server $BOOTSTRAP_SERVER \
        --topic $topic \
        --from-beginning \
        --property print.key=true \
        --property print.value=true \
        --property key.separator="|" \
        --max-messages 1000 2>/dev/null > $temp_file
    
    # Count messages and tombstones
    while IFS='|' read -r key value; do
        total=$((total + 1))
        if [ -z "$value" ] || [ "$value" = "" ]; then
            tombstones=$((tombstones + 1))
        fi
    done < $temp_file
    
    rm -f $temp_file
    
    # Calculate ratio
    local ratio=0
    if [ $total -gt 0 ]; then
        ratio=$(awk "BEGIN {printf \"%.2f\", ($tombstones/$total)*100}")
    fi
    
    # Output JSON
    echo "{\"topic\":\"$topic\",\"total_messages\":$total,\"tombstone_messages\":$tombstones,\"tombstone_ratio\":$ratio,\"timestamp\":$(date +%s)}"
}

# Main logic
if [ "$TOPICS" = "all" ]; then
    # Get all topics
    topics=$(docker exec week2-broker kafka-topics --list --bootstrap-server $BOOTSTRAP_SERVER 2>/dev/null | grep -v '^__')
else
    topics="$TOPICS"
fi

# Output JSON array
echo "["
first=true
for topic in $topics; do
    if [ "$first" = true ]; then
        first=false
    else
        echo ","
    fi
    analyze_topic $topic
done
echo "]"
EOF

chmod +x scripts/tombstone-monitor.sh

# Test the script
mkdir -p scripts
./scripts/tombstone-monitor.sh
```

### 3. Create Flex Configuration

```bash
cat > configs/flex-tombstone-monitor.yml << 'EOF'
integrations:
  - name: nri-flex
    interval: 300s
    config:
      name: KafkaTombstoneMonitor
      apis:
        - name: TombstoneStats
          commands:
            - run: /etc/newrelic-infra/integrations.d/scripts/tombstone-monitor.sh
              split_by: ":"
          remove_keys:
            - timestamp
          custom_attributes:
            environment: "learning-lab"
            week: "2"
            integration: "tombstone-monitor"
EOF
```

### 4. Deploy the Flex Configuration

```bash
# Copy configuration to the container
docker cp configs/flex-tombstone-monitor.yml week2-newrelic-infra:/etc/newrelic-infra/integrations.d/

# Copy the script
docker cp scripts/tombstone-monitor.sh week2-newrelic-infra:/etc/newrelic-infra/integrations.d/scripts/

# Make script executable in container
docker exec week2-newrelic-infra chmod +x /etc/newrelic-infra/integrations.d/scripts/tombstone-monitor.sh

# Restart the infrastructure agent
docker restart week2-newrelic-infra
```

### 5. Create a More Advanced Flex Configuration

Let's create a Flex config that monitors multiple aspects:

```bash
cat > configs/flex-kafka-advanced.yml << 'EOF'
integrations:
  - name: nri-flex
    interval: 60s
    config:
      name: KafkaAdvancedMetrics
      apis:
        # Tombstone monitoring
        - name: TombstoneRatio
          commands:
            - run: |
                docker exec week2-broker bash -c '
                for topic in $(kafka-topics --list --bootstrap-server localhost:9092 | grep -v "^__"); do
                  total=$(kafka-console-consumer --bootstrap-server localhost:9092 --topic $topic --from-beginning --timeout-ms 3000 --property print.value=false 2>/dev/null | wc -l)
                  tombstones=$(kafka-console-consumer --bootstrap-server localhost:9092 --topic $topic --from-beginning --timeout-ms 3000 --property print.key=true --property print.value=true 2>/dev/null | grep -E "^[^|]+\|$" | wc -l)
                  ratio=0
                  if [ $total -gt 0 ]; then
                    ratio=$(echo "scale=2; $tombstones * 100 / $total" | bc)
                  fi
                  echo "topic=$topic total=$total tombstones=$tombstones ratio=$ratio"
                done
                '
          custom_attributes:
            metric_type: "tombstone"
            
        # Topic size monitoring
        - name: TopicSize
          commands:
            - run: |
                docker exec week2-broker kafka-log-dirs \
                  --bootstrap-server localhost:9092 \
                  --describe \
                  --topic-list user-profiles 2>/dev/null | \
                  grep -E "topic|size" | \
                  awk '{if($1=="topic:"){topic=$2} if($1=="size:"){print "topic="topic" size="$2}}'
          custom_attributes:
            metric_type: "storage"
            
        # Consumer lag monitoring
        - name: ConsumerLag
          commands:
            - run: |
                docker exec week2-broker kafka-consumer-groups \
                  --bootstrap-server localhost:9092 \
                  --all-groups \
                  --describe 2>/dev/null | \
                  grep -v "TOPIC" | \
                  awk 'NF{print "group="$1" topic="$2" partition="$3" lag="$5}'
          custom_attributes:
            metric_type: "performance"
EOF
```

### 6. Create a Composite Metric Dashboard Query

Once data starts flowing to New Relic, you can query it:

```sql
-- NRQL query for tombstone monitoring dashboard
SELECT 
  latest(tombstone_ratio) as 'Tombstone %',
  latest(total_messages) as 'Total Messages',
  latest(tombstone_messages) as 'Tombstones'
FROM TombstoneStatsSample 
FACET topic 
SINCE 1 hour ago
```

### 7. Test Different Scenarios

Create topics with varying tombstone ratios:

```bash
# High tombstone ratio topic
docker exec -it week2-broker kafka-console-producer \
  --broker-list localhost:9092 \
  --topic high-tombstone-topic \
  --property "key.separator=:" \
  --property "parse.key=true" << EOF
key1:value1
key2:value2
key3:value3
key1:
key2:
key3:
EOF

# Low tombstone ratio topic  
docker exec -it week2-broker kafka-console-producer \
  --broker-list localhost:9092 \
  --topic low-tombstone-topic \
  --property "key.separator=:" \
  --property "parse.key=true" << EOF
key1:value1
key2:value2
key3:value3
key4:value4
key5:value5
key6:value6
key7:value7
key8:value8
key9:value9
key1:
EOF

# Run the monitoring script
./scripts/tombstone-monitor.sh
```

### 8. Create an Alert Condition

Build a NRQL alert for high tombstone ratios:

```sql
-- Alert when tombstone ratio exceeds 50%
SELECT latest(tombstone_ratio) 
FROM TombstoneStatsSample 
WHERE topic != '__consumer_offsets'
FACET topic
```

## Validation

Complete these checks:

- [ ] Created and tested the tombstone monitoring script
- [ ] Deployed Flex configuration successfully
- [ ] Script produces valid JSON output
- [ ] Configuration copied to Infrastructure agent
- [ ] Data appears in New Relic Insights
- [ ] Can query tombstone metrics with NRQL

## Troubleshooting

### Issue: No data in New Relic
**Solution:** 
1. Check Infrastructure agent logs: `docker logs week2-newrelic-infra`
2. Verify script permissions: `docker exec week2-newrelic-infra ls -la /etc/newrelic-infra/integrations.d/scripts/`
3. Test script manually: `docker exec week2-newrelic-infra /etc/newrelic-infra/integrations.d/scripts/tombstone-monitor.sh`

### Issue: Script timeout errors
**Solution:** Reduce the number of messages sampled or increase timeout in the script

### Issue: Invalid JSON output
**Solution:** Check for special characters in topic names or values that might break JSON formatting

## Advanced Challenges

1. **Multi-cluster Support**: Modify the script to monitor multiple Kafka clusters
2. **Historical Tracking**: Store tombstone ratios over time and calculate trends
3. **Automated Remediation**: Create a script that triggers compaction when tombstone ratio is too high
4. **Performance Optimization**: Implement sampling for large topics to reduce monitoring overhead

## Key Takeaways

1. **Flex enables agentless monitoring** through script execution
2. **JSON output is preferred** for structured data collection
3. **Custom attributes add context** to your metrics
4. **Interval configuration** balances freshness vs. performance
5. **Multiple APIs** can be combined in one Flex config

## Next Steps

In Exercise 3, you'll build a production-grade Go-based integration that's more efficient and feature-rich than shell scripts.