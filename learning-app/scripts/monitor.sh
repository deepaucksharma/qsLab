#!/bin/bash
# Simple Monitoring Dashboard

# Trap Ctrl+C to exit cleanly
trap 'echo -e "\nExiting..."; exit 0' INT

while true; do
  clear
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║           Kafka Learning Lab Monitor - $(date +%H:%M:%S)           ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo
  
  # Container status with health
  echo "📦 Containers:"
  docker ps --filter "name=kafka-xray" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
  echo
  
  # Resource usage
  echo "📊 Resources:"
  docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" \
    $(docker ps --filter "name=kafka-xray" -q) 2>/dev/null || echo "No containers running"
  echo
  
  # Kafka metrics
  echo "📈 Kafka Metrics:"
  if docker exec kafka-xray-broker kafka-topics --list --bootstrap-server localhost:9092 &>/dev/null; then
    TOPICS=$(docker exec kafka-xray-broker kafka-topics --list --bootstrap-server localhost:9092 2>/dev/null | wc -l)
    echo "Active Topics: $TOPICS"
    
    # Show last 3 topics
    echo "Recent Topics:"
    docker exec kafka-xray-broker kafka-topics --list --bootstrap-server localhost:9092 2>/dev/null | tail -3 | sed 's/^/  - /'
  else
    echo "Kafka not available"
  fi
  echo
  
  # Recent errors
  echo "⚠️  Recent Issues (last 5):"
  docker-compose -f labs/week1-xray/docker-compose.enhanced.yml logs --tail=200 2>/dev/null | \
    grep -iE "(error|warn|exception)" | tail -5 | cut -c1-80 || echo "No recent issues"
  
  echo
  echo "Press Ctrl+C to exit. Refreshing in 10s..."
  sleep 10
done
