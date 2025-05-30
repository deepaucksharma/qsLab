#!/bin/bash
# Health Check Script - WSL Compatible

DOCKER="${DOCKER_CMD:-docker.exe}"

echo "=== Kafka Lab Health Check ==="
echo "Time: $(date)"
echo

# Check containers
echo "📦 Container Status:"
RUNNING=$($DOCKER ps --filter "name=kafka-xray" --format "{{.Names}}" | wc -l)
EXPECTED=3  # zookeeper, kafka, newrelic
echo "Containers running: $RUNNING/$EXPECTED"

# Individual health checks
echo
echo "🔍 Service Health:"

# Zookeeper
if $DOCKER exec kafka-xray-zookeeper bash -c "echo srvr | nc localhost 2181" 2>/dev/null | grep -q Mode; then
  echo "✅ Zookeeper: Healthy"
else
  echo "❌ Zookeeper: Unhealthy"
fi

# Kafka
if $DOCKER exec kafka-xray-broker kafka-broker-api-versions --bootstrap-server localhost:9092 &>/dev/null; then
  echo "✅ Kafka Broker: Healthy"
  
  # Show topic count
  TOPIC_COUNT=$($DOCKER exec kafka-xray-broker kafka-topics --list --bootstrap-server localhost:9092 2>/dev/null | wc -l)
  echo "   Topics: $TOPIC_COUNT"
else
  echo "❌ Kafka Broker: Unhealthy"
fi

# Resource usage
echo
echo "📊 Resource Usage:"
$DOCKER stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" \
  $($DOCKER ps --filter "name=kafka-xray" -q)