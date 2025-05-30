#!/bin/bash
# Health Check Script

echo "=== Kafka Lab Health Check ==="
echo "Time: $(date)"
echo

# Check containers
echo "📦 Container Status:"
RUNNING=$(docker ps --filter "name=kafka-xray" --format "{{.Names}}" | wc -l)
EXPECTED=3  # zookeeper, kafka, newrelic
echo "Containers running: $RUNNING/$EXPECTED"

# Individual health checks
echo
echo "🔍 Service Health:"

# Zookeeper
if docker exec kafka-xray-zookeeper bash -c "echo ruok | nc localhost 2181" 2>/dev/null | grep -q imok; then
  echo "✅ Zookeeper: Healthy"
else
  echo "❌ Zookeeper: Unhealthy"
fi

# Kafka
if docker exec kafka-xray-broker kafka-broker-api-versions --bootstrap-server localhost:9092 &>/dev/null; then
  echo "✅ Kafka Broker: Healthy"
  
  # Show topic count
  TOPIC_COUNT=$(docker exec kafka-xray-broker kafka-topics --list --bootstrap-server localhost:9092 2>/dev/null | wc -l)
  echo "   Topics: $TOPIC_COUNT"
else
  echo "❌ Kafka Broker: Unhealthy"
fi

# Resource usage
echo
echo "📊 Resource Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" \
  $(docker ps --filter "name=kafka-xray" -q)
