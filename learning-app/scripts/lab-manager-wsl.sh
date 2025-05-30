#!/bin/bash
# Lab Management Script - WSL Compatible Version

COMPOSE_FILE="docker-compose.enhanced.yml"
LAB_NAME=${LAB_NAME:-"week1-xray"}

# Use docker.exe and docker-compose.exe for WSL
DOCKER="${DOCKER_CMD:-docker.exe}"
DOCKER_COMPOSE="${DOCKER_COMPOSE_CMD:-docker-compose.exe}"

case "$1" in
  start)
    echo "🚀 Starting Kafka lab environment..."
    cd labs/${LAB_NAME}
    $DOCKER_COMPOSE -f ${COMPOSE_FILE} up -d
    
    echo "⏳ Waiting for services to be healthy..."
    sleep 10
    
    # Check health
    if $DOCKER exec kafka-xray-broker kafka-broker-api-versions --bootstrap-server localhost:9092 &>/dev/null; then
      echo "✅ Kafka lab is ready!"
    else
      echo "❌ Kafka failed to start. Check logs with: $0 logs"
      exit 1
    fi
    ;;
  
  stop)
    echo "🛑 Stopping Kafka lab environment..."
    cd labs/${LAB_NAME}
    $DOCKER_COMPOSE -f ${COMPOSE_FILE} down
    ;;
  
  restart)
    $0 stop
    sleep 2
    $0 start
    ;;
  
  status)
    cd labs/${LAB_NAME}
    $DOCKER_COMPOSE -f ${COMPOSE_FILE} ps
    echo
    ./../../scripts/health-check-wsl.sh
    ;;
  
  logs)
    cd labs/${LAB_NAME}
    $DOCKER_COMPOSE -f ${COMPOSE_FILE} logs -f ${2}
    ;;
  
  clean)
    echo "🧹 Cleaning up Kafka lab environment..."
    cd labs/${LAB_NAME}
    $DOCKER_COMPOSE -f ${COMPOSE_FILE} down -v
    echo "✅ Cleanup complete"
    ;;
    
  shell)
    container=${2:-kafka-xray-broker}
    echo "🔧 Opening shell in ${container}..."
    $DOCKER exec -it ${container} /bin/bash
    ;;
    
  *)
    echo "Usage: $0 {start|stop|restart|status|logs|clean|shell} [container]"
    echo
    echo "Examples:"
    echo "  $0 start              # Start the lab"
    echo "  $0 logs kafka-broker  # View specific container logs"
    echo "  $0 shell              # Open shell in Kafka broker"
    exit 1
    ;;
esac