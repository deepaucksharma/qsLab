#!/bin/bash
# generate-traffic.sh - Generate test traffic for Kafka exercises

echo "🚀 Kafka Traffic Generator"
echo "========================="

# Configuration
BROKER="${KAFKA_BROKER:-localhost:9092}"
TOPIC="${TOPIC:-test-topic}"
RECORDS="${RECORDS:-10000}"
THROUGHPUT="${THROUGHPUT:-100}"
RECORD_SIZE="${RECORD_SIZE:-100}"

echo "Configuration:"
echo "- Broker: $BROKER"
echo "- Topic: $TOPIC"
echo "- Records: $RECORDS"
echo "- Throughput: $THROUGHPUT msgs/sec"
echo "- Record Size: $RECORD_SIZE bytes"
echo ""

# Create topic if it doesn't exist
echo "📝 Creating topic (if needed)..."
docker exec -it kafka-xray-broker \
  kafka-topics --create --if-not-exists \
  --topic $TOPIC \
  --bootstrap-server $BROKER \
  --partitions 3 \
  --replication-factor 1 2>/dev/null || echo "Topic already exists"

# Generate traffic
echo "🔄 Generating traffic..."
docker exec -it kafka-xray-broker \
  kafka-producer-perf-test \
  --topic $TOPIC \
  --num-records $RECORDS \
  --record-size $RECORD_SIZE \
  --throughput $THROUGHPUT \
  --producer-props bootstrap.servers=$BROKER

echo "✅ Traffic generation complete!"
echo ""
echo "📊 Check metrics with:"
echo "docker exec -it kafka-xray-jmxterm java -jar /jmxterm.jar"
