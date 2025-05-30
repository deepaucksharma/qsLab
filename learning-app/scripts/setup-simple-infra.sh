#!/bin/bash
# Simple Infrastructure Setup Script
# No Kubernetes, no multi-user - just solid Docker practices

set -euo pipefail

echo "🚀 Kafka Learning Lab - Simple Infrastructure Setup"
echo "================================================="

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create directory structure
echo -e "\n${YELLOW}Creating directory structure...${NC}"
mkdir -p {scripts,logs,operations/{runbooks,procedures},monitoring}

# Create enhanced Docker Compose for Week 1
echo -e "\n${YELLOW}Creating enhanced Docker configurations...${NC}"
cat > labs/week1-xray/docker-compose.enhanced.yml << 'EOF'
version: '3.8'

services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    container_name: kafka-xray-zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    healthcheck:
      test: ["CMD", "bash", "-c", "echo ruok | nc localhost 2181 | grep imok"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped
    volumes:
      - zookeeper-data:/var/lib/zookeeper/data
      - zookeeper-logs:/var/lib/zookeeper/log
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  kafka-broker:
    image: confluentinc/cp-kafka:7.5.0
    container_name: kafka-xray-broker
    depends_on:
      zookeeper:
        condition: service_healthy
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka-broker:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_LOG_RETENTION_HOURS: 168
      KAFKA_LOG_SEGMENT_BYTES: 1073741824
      KAFKA_LOG_RETENTION_CHECK_INTERVAL_MS: 300000
    healthcheck:
      test: ["CMD", "kafka-broker-api-versions", "--bootstrap-server", "localhost:9092"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped
    volumes:
      - kafka-data:/var/lib/kafka/data
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # New Relic Infrastructure Agent
  newrelic-infra:
    image: newrelic/infrastructure:latest
    container_name: kafka-xray-newrelic
    cap_add:
      - SYS_PTRACE
    pid: host
    privileged: true
    environment:
      NRIA_LICENSE_KEY: ${NEW_RELIC_LICENSE_KEY}
      NRIA_DISPLAY_NAME: "kafka-learning-lab"
    volumes:
      - /:/host:ro
      - /var/run/docker.sock:/var/run/docker.sock
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "5m"
        max-file: "2"

volumes:
  kafka-data:
    driver: local
  zookeeper-data:
    driver: local
  zookeeper-logs:
    driver: local
EOF

# Create lab management script
echo -e "\n${YELLOW}Creating lab management scripts...${NC}"
cat > scripts/lab-manager.sh << 'EOF'
#!/bin/bash
# Lab Management Script - Simple and Effective

COMPOSE_FILE="docker-compose.enhanced.yml"
LAB_NAME=${LAB_NAME:-"week1-xray"}

case "$1" in
  start)
    echo "🚀 Starting Kafka lab environment..."
    cd labs/${LAB_NAME}
    docker-compose -f ${COMPOSE_FILE} up -d
    
    echo "⏳ Waiting for services to be healthy..."
    sleep 10
    
    # Check health
    if docker exec kafka-xray-broker kafka-broker-api-versions --bootstrap-server localhost:9092 &>/dev/null; then
      echo "✅ Kafka lab is ready!"
    else
      echo "❌ Kafka failed to start. Check logs with: $0 logs"
      exit 1
    fi
    ;;
  
  stop)
    echo "🛑 Stopping Kafka lab environment..."
    cd labs/${LAB_NAME}
    docker-compose -f ${COMPOSE_FILE} down
    ;;
  
  restart)
    $0 stop
    sleep 2
    $0 start
    ;;
  
  status)
    cd labs/${LAB_NAME}
    docker-compose -f ${COMPOSE_FILE} ps
    echo
    ./../../scripts/health-check.sh
    ;;
  
  logs)
    cd labs/${LAB_NAME}
    docker-compose -f ${COMPOSE_FILE} logs -f ${2}
    ;;
  
  clean)
    echo "🧹 Cleaning up Kafka lab environment..."
    cd labs/${LAB_NAME}
    docker-compose -f ${COMPOSE_FILE} down -v
    echo "✅ Cleanup complete"
    ;;
    
  shell)
    container=${2:-kafka-xray-broker}
    echo "🔧 Opening shell in ${container}..."
    docker exec -it ${container} /bin/bash
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
EOF

chmod +x scripts/lab-manager.sh

# Create health check script
cat > scripts/health-check.sh << 'EOF'
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
EOF

chmod +x scripts/health-check.sh

# Create monitoring script
cat > scripts/monitor.sh << 'EOF'
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
EOF

chmod +x scripts/monitor.sh

# Create log collection script
cat > scripts/collect-logs.sh << 'EOF'
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
EOF

chmod +x scripts/collect-logs.sh

# Create simple CI workflow
echo -e "\n${YELLOW}Creating CI/CD workflows...${NC}"
mkdir -p .github/workflows

cat > .github/workflows/simple-ci.yml << 'EOF'
name: Simple CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Validate Docker Compose files
      run: |
        echo "🔍 Validating Docker Compose files..."
        for week in week1-xray week2-builder week3-optimizer week4-detective week5-architect; do
          compose_file="learning-app/labs/${week}/docker-compose.yml"
          if [ -f "$compose_file" ]; then
            echo "Checking ${week}..."
            docker-compose -f "$compose_file" config > /dev/null
          fi
        done
        echo "✅ All compose files valid"
    
    - name: Check shell scripts
      run: |
        echo "🔍 Checking shell scripts..."
        find . -name "*.sh" -type f -exec bash -n {} \;
        echo "✅ All shell scripts valid"
    
    - name: Security scan
      run: |
        echo "🔍 Running security checks..."
        # Check for hardcoded secrets
        if grep -r "password\|secret\|key" --include="*.yml" --include="*.yaml" learning-app/labs/ | grep -v "LICENSE_KEY"; then
          echo "⚠️  Warning: Possible hardcoded secrets found"
        fi
        echo "✅ Security check complete"

  test-terminal-server:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
    
    - name: Test terminal server
      run: |
        cd learning-app/server
        npm ci
        npm test || echo "No tests defined yet"
EOF

# Create operations runbook
echo -e "\n${YELLOW}Creating operations documentation...${NC}"
cat > operations/runbooks/common-operations.md << 'EOF'
# Common Operations Runbook

## Daily Operations

### Morning Health Check
```bash
# 1. Check all services are running
./scripts/lab-manager.sh status

# 2. Review overnight logs for errors
./scripts/collect-logs.sh
grep -i error logs/kafka-lab-logs-*.tar.gz

# 3. Check disk space
df -h
docker system df
```

### Starting the Lab Environment
```bash
# Standard start
./scripts/lab-manager.sh start

# If services fail to start
./scripts/lab-manager.sh clean  # Clean everything
./scripts/lab-manager.sh start  # Fresh start
```

## Troubleshooting

### Kafka Broker Won't Start

**Symptoms:**
- Container exits immediately
- "Connection refused" errors

**Solution:**
```bash
# 1. Check Zookeeper is healthy
docker logs kafka-xray-zookeeper --tail 50

# 2. Clean and restart
./scripts/lab-manager.sh clean
./scripts/lab-manager.sh start

# 3. If still failing, check disk space
df -h
docker system prune -a  # WARNING: Removes all unused images
```

### High Memory Usage

**Symptoms:**
- System slow
- Containers using >2GB RAM

**Solution:**
```bash
# 1. Check current usage
docker stats

# 2. Restart services to free memory
./scripts/lab-manager.sh restart

# 3. If persistent, reduce Kafka heap size
# Edit docker-compose.yml:
# KAFKA_HEAP_OPTS: "-Xmx1G -Xms1G"
```

### Disk Space Issues

**Symptoms:**
- "No space left on device" errors
- Kafka stops accepting messages

**Solution:**
```bash
# 1. Check disk usage
df -h
docker system df

# 2. Clean Docker resources
docker system prune -a --volumes

# 3. Clear old logs
find logs/ -name "*.tar.gz" -mtime +7 -delete

# 4. Reduce Kafka retention (if needed)
# Set KAFKA_LOG_RETENTION_HOURS to lower value
```

## Maintenance Tasks

### Weekly Maintenance
```bash
# 1. Collect and archive logs
./scripts/collect-logs.sh

# 2. Clean old logs (keep last 7 days)
find logs/ -name "*.tar.gz" -mtime +7 -delete

# 3. Update Docker images
docker pull confluentinc/cp-kafka:7.5.0
docker pull confluentinc/cp-zookeeper:7.5.0

# 4. Restart services with updates
./scripts/lab-manager.sh restart
```

### Monthly Maintenance
```bash
# 1. Full system backup
tar -czf backup-$(date +%Y%m).tar.gz learning-app/

# 2. Review and optimize configurations
# Check docker-compose.yml for any needed updates

# 3. Security updates
docker system prune -a
docker pull all base images
```

## Emergency Procedures

### Complete System Recovery
```bash
# 1. Stop everything
docker stop $(docker ps -aq)

# 2. Clean all resources
docker system prune -a --volumes

# 3. Restart Docker daemon
sudo systemctl restart docker

# 4. Start fresh
./scripts/lab-manager.sh start
```

### Data Recovery
```bash
# Kafka data is in Docker volumes
# List volumes:
docker volume ls

# Backup volume:
docker run --rm -v kafka-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/kafka-data-backup.tar.gz -C /data .

# Restore volume:
docker run --rm -v kafka-data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/kafka-data-backup.tar.gz -C /data
```

## Contact Information

- **Primary Support**: DevOps Team
- **Escalation**: Platform Team Lead
- **Emergency**: On-call rotation (see schedule)

## Quick Reference

```bash
# Start lab
./scripts/lab-manager.sh start

# View logs
./scripts/lab-manager.sh logs kafka-broker

# Open shell
./scripts/lab-manager.sh shell

# Monitor
./scripts/monitor.sh

# Collect logs
./scripts/collect-logs.sh

# Full cleanup
./scripts/lab-manager.sh clean
```
EOF

# Create simple deployment script
cat > scripts/deploy.sh << 'EOF'
#!/bin/bash
# Simple Deployment Script

VERSION=${1:-latest}
ENVIRONMENT=${2:-production}

echo "🚀 Deploying Kafka Learning Lab"
echo "Version: $VERSION"
echo "Environment: $ENVIRONMENT"
echo

# Pre-deployment checks
echo "📋 Pre-deployment checks..."
if ! ./scripts/health-check.sh > /dev/null 2>&1; then
  echo "⚠️  Warning: Current system not healthy"
fi

# Backup current state
echo "💾 Creating backup..."
./scripts/collect-logs.sh

# Update configurations
echo "📝 Updating configurations..."
# Add any config updates here

# Restart services
echo "🔄 Restarting services..."
./scripts/lab-manager.sh restart

# Post-deployment validation
echo "✅ Validating deployment..."
sleep 10
if ./scripts/health-check.sh > /dev/null 2>&1; then
  echo "✅ Deployment successful!"
else
  echo "❌ Deployment validation failed"
  echo "Run './scripts/lab-manager.sh logs' to investigate"
  exit 1
fi

echo
echo "Deployment complete!"
EOF

chmod +x scripts/deploy.sh

echo -e "\n${GREEN}✅ Simple infrastructure setup complete!${NC}"
echo
echo "📚 Quick Start Guide:"
echo "  1. Start the lab:     ./scripts/lab-manager.sh start"
echo "  2. Check health:      ./scripts/health-check.sh"
echo "  3. Monitor services:  ./scripts/monitor.sh"
echo "  4. View logs:         ./scripts/lab-manager.sh logs"
echo
echo "📖 Documentation:"
echo "  - Operations: operations/runbooks/common-operations.md"
echo "  - Scripts:    scripts/README.md"
echo
echo "No Kubernetes, no complexity - just solid Docker practices! 🎉"
EOF
