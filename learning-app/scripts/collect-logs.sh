#!/bin/bash
# Log Collection Script

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR="logs/collection_${TIMESTAMP}"

echo "📝 Collecting logs..."

mkdir -p "$LOG_DIR"

# Collect container logs
for container in kafka-xray-broker kafka-xray-zookeeper kafka-xray-newrelic; do
  if docker ps -a --format "{{.Names}}" | grep -q "^${container}$"; then
    echo "  - ${container}"
    docker logs $container --since 1h > "$LOG_DIR/${container}.log" 2>&1
  fi
done

# Collect system info
echo "  - System info"
{
  echo "=== Docker PS ==="
  docker ps -a --filter "name=kafka-xray"
  echo
  echo "=== Docker Stats ==="
  docker stats --no-stream
  echo
  echo "=== Docker Version ==="
  docker version
  echo
  echo "=== Disk Usage ==="
  df -h
} > "$LOG_DIR/system-info.log"

# Create archive
cd logs
tar -czf "kafka-lab-logs-${TIMESTAMP}.tar.gz" "collection_${TIMESTAMP}"
rm -rf "collection_${TIMESTAMP}"
cd ..

echo "✅ Logs collected: logs/kafka-lab-logs-${TIMESTAMP}.tar.gz"
