#!/bin/bash
# Setup initial topics for Week 3 exercises

set -e

BROKER="broker-1:9092"

echo "Creating topics for Week 3 exercises..."

# High-throughput topic
docker exec week3-broker-1 kafka-topics --create \
  --bootstrap-server $BROKER \
  --topic high-throughput \
  --partitions 12 \
  --replication-factor 3 \
  --config min.insync.replicas=2 \
  --config compression.type=lz4 \
  --config segment.bytes=1073741824 \
  2>/dev/null || echo "Topic high-throughput already exists"

# Low-latency topic
docker exec week3-broker-1 kafka-topics --create \
  --bootstrap-server $BROKER \
  --topic low-latency \
  --partitions 6 \
  --replication-factor 3 \
  --config min.insync.replicas=1 \
  --config compression.type=none \
  --config flush.messages=1 \
  2>/dev/null || echo "Topic low-latency already exists"

# Balanced topic
docker exec week3-broker-1 kafka-topics --create \
  --bootstrap-server $BROKER \
  --topic balanced \
  --partitions 9 \
  --replication-factor 3 \
  2>/dev/null || echo "Topic balanced already exists"

# List created topics
echo -e "\nCreated topics:"
docker exec week3-broker-1 kafka-topics --list --bootstrap-server $BROKER | grep -E "high-throughput|low-latency|balanced"

echo -e "\n✅ Topic setup complete!"