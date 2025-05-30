# Exercise 1: Understanding Kafka Tombstones

**Objective:** Learn what tombstones are, why they matter, and how to detect them in your Kafka topics.

**Time:** 30 minutes

**Prerequisites:** 
- Week 2 lab environment running (`docker-compose up -d`)
- Basic understanding of Kafka topics and messages

## Background

Tombstones are special Kafka messages with a non-null key but a null value. They're used to mark records for deletion in compacted topics. Understanding tombstones is crucial for:
- Managing data retention
- Debugging missing data
- Optimizing storage
- Compliance with data deletion requirements

## Steps

### 1. Start the Lab Environment

```bash
cd ~/qsLab/learning-app/labs/week2-builder
docker-compose up -d

# Verify all services are running
docker-compose ps
```

**Expected Output:**
```
NAME                    STATUS    PORTS
week2-broker            running   0.0.0.0:9092->9092/tcp, 0.0.0.0:29092->29092/tcp
week2-zookeeper         running   0.0.0.0:22181->2181/tcp
week2-kafka-ui          running   0.0.0.0:8080->8080/tcp
week2-newrelic-infra    running   
```

### 2. Create a Topic with Compaction

```bash
# Create a compacted topic where tombstones matter
docker exec week2-broker kafka-topics --create \
  --bootstrap-server localhost:9092 \
  --topic user-profiles \
  --partitions 3 \
  --replication-factor 1 \
  --config cleanup.policy=compact \
  --config segment.ms=60000 \
  --config min.cleanable.dirty.ratio=0.01
```

### 3. Produce Regular Messages

```bash
# Create some user profiles
docker exec -it week2-broker kafka-console-producer \
  --broker-list localhost:9092 \
  --topic user-profiles \
  --property "key.separator=:" \
  --property "parse.key=true" << EOF
user001:{"name":"Alice","email":"alice@example.com","status":"active"}
user002:{"name":"Bob","email":"bob@example.com","status":"active"}
user003:{"name":"Charlie","email":"charlie@example.com","status":"active"}
user004:{"name":"David","email":"david@example.com","status":"active"}
user005:{"name":"Eve","email":"eve@example.com","status":"inactive"}
EOF
```

### 4. Create Tombstone Messages

```bash
# Delete users by sending tombstones (null values)
docker exec -it week2-broker kafka-console-producer \
  --broker-list localhost:9092 \
  --topic user-profiles \
  --property "key.separator=:" \
  --property "parse.key=true" << EOF
user002:
user005:
EOF
```

### 5. Examine Messages Including Tombstones

```bash
# Read all messages including tombstones
docker exec week2-broker kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic user-profiles \
  --from-beginning \
  --property print.key=true \
  --property print.value=true \
  --property key.separator=" -> " \
  --timeout-ms 5000
```

**Expected Output:**
```
user001 -> {"name":"Alice","email":"alice@example.com","status":"active"}
user002 -> {"name":"Bob","email":"bob@example.com","status":"active"}
user003 -> {"name":"Charlie","email":"charlie@example.com","status":"active"}
user004 -> {"name":"David","email":"david@example.com","status":"active"}
user005 -> {"name":"Eve","email":"eve@example.com","status":"inactive"}
user002 -> 
user005 -> 
```

### 6. Count Tombstones Programmatically

Create a simple script to count tombstones:

```bash
# Create the script
cat > count-tombstones.sh << 'EOF'
#!/bin/bash
TOPIC=$1
TOTAL=0
TOMBSTONES=0

echo "Analyzing topic: $TOPIC"

docker exec week2-broker kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic $TOPIC \
  --from-beginning \
  --property print.key=true \
  --property print.value=true \
  --property key.separator="|" \
  --timeout-ms 5000 | while IFS='|' read -r key value; do
  
  TOTAL=$((TOTAL + 1))
  
  if [ -z "$value" ] || [ "$value" = "" ]; then
    TOMBSTONES=$((TOMBSTONES + 1))
    echo "Found tombstone: key=$key"
  fi
done

echo "Total messages: $TOTAL"
echo "Tombstones: $TOMBSTONES"
if [ $TOTAL -gt 0 ]; then
  RATIO=$(awk "BEGIN {printf \"%.2f\", ($TOMBSTONES/$TOTAL)*100}")
  echo "Tombstone ratio: ${RATIO}%"
fi
EOF

chmod +x count-tombstones.sh

# Run the script
./count-tombstones.sh user-profiles
```

### 7. Observe Compaction in Action

```bash
# Force log compaction
docker exec week2-broker kafka-log-dirs \
  --bootstrap-server localhost:9092 \
  --describe \
  --topic-list user-profiles

# Wait a moment for compaction
sleep 10

# Read messages again after compaction
docker exec week2-broker kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic user-profiles \
  --from-beginning \
  --property print.key=true \
  --property print.value=true \
  --property key.separator=" -> " \
  --timeout-ms 5000
```

### 8. Check Kafka UI

Open http://localhost:8080 in your browser and:
1. Navigate to Topics → user-profiles
2. Click on "Messages" tab
3. Observe how tombstones appear in the UI
4. Check the topic configuration for compaction settings

## Validation

Complete these checks to ensure you understand tombstones:

- [ ] Created a compacted topic successfully
- [ ] Produced both regular messages and tombstones
- [ ] Identified tombstones in consumer output
- [ ] Calculated tombstone ratio for the topic
- [ ] Observed the difference before and after compaction
- [ ] Located tombstones in Kafka UI

## Troubleshooting

### Issue: Cannot see tombstones in consumer output
**Solution:** Make sure you're not using `--skip-message-on-error` flag and that you're printing both keys and values.

### Issue: Compaction doesn't seem to work
**Solution:** Compaction runs periodically. You can force it by producing more messages to trigger segment roll.

### Issue: Docker containers not starting
**Solution:** Check if ports 9092, 8080, or 22181 are already in use. Stop conflicting services or modify the docker-compose.yml ports.

## Key Takeaways

1. **Tombstones are null-valued messages** with non-null keys
2. **They mark records for deletion** in compacted topics
3. **Compaction removes old values** but keeps the latest (including tombstones)
4. **Monitoring tombstone ratio** helps track data deletion patterns
5. **They're essential for GDPR compliance** and data lifecycle management

## Next Steps

In the next exercise, you'll build a custom New Relic integration to automatically monitor tombstone ratios across all your Kafka topics.