#!/bin/bash
# Automated Deployment Script for Kafka Learning Lab
# Supports different environments and rollback capabilities

set -euo pipefail

# Default values
VERSION=${1:-latest}
ENVIRONMENT=${2:-production}
ACTION=${3:-deploy}  # deploy, rollback, status

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BACKUP_DIR="backups"
LOG_FILE="deployment-$(date +%Y%m%d_%H%M%S).log"
ROLLBACK_VERSIONS=3  # Keep last 3 versions for rollback

# Logging function
log() {
    echo -e "${1}" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    log "${RED}❌ Error: $1${NC}"
    exit 1
}

# Pre-deployment checks
pre_deployment_checks() {
    log "${YELLOW}📋 Running pre-deployment checks...${NC}"
    
    # Check Docker is running
    if ! docker ps > /dev/null 2>&1; then
        error_exit "Docker is not running"
    fi
    
    # Check disk space
    AVAILABLE_SPACE=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
    if [ "$AVAILABLE_SPACE" -lt 5 ]; then
        error_exit "Insufficient disk space (${AVAILABLE_SPACE}GB available, need at least 5GB)"
    fi
    
    # Check if services are healthy
    if [ -f "scripts/health-check.sh" ]; then
        if ! ./scripts/health-check.sh > /dev/null 2>&1; then
            log "${YELLOW}⚠️  Warning: Current services not fully healthy${NC}"
        fi
    fi
    
    log "${GREEN}✅ Pre-deployment checks passed${NC}"
}

# Backup current state
backup_current_state() {
    log "${YELLOW}💾 Creating backup...${NC}"
    
    mkdir -p "$BACKUP_DIR"
    BACKUP_NAME="backup-${ENVIRONMENT}-$(date +%Y%m%d_%H%M%S)"
    
    # Backup configurations
    tar -czf "$BACKUP_DIR/${BACKUP_NAME}-configs.tar.gz" \
        learning-app/labs/*/docker-compose*.yml \
        learning-app/configs/ \
        2>/dev/null || true
    
    # Backup volumes (metadata only)
    docker volume ls --format "{{.Name}}" | grep -E "(kafka|zookeeper)" > "$BACKUP_DIR/${BACKUP_NAME}-volumes.list" || true
    
    # Save current container states
    docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" > "$BACKUP_DIR/${BACKUP_NAME}-containers.state"
    
    # Cleanup old backups
    find "$BACKUP_DIR" -name "backup-${ENVIRONMENT}-*" -type f -mtime +7 -delete
    
    log "${GREEN}✅ Backup created: ${BACKUP_NAME}${NC}"
}

# Deploy new version
deploy() {
    log "${BLUE}🚀 Deploying version: $VERSION to $ENVIRONMENT${NC}"
    
    # Stop current services gracefully
    log "${YELLOW}🛑 Stopping current services...${NC}"
    for week in week1-xray week2-builder week3-optimizer week4-detective week5-architect; do
        if [ -d "learning-app/labs/$week" ]; then
            cd "learning-app/labs/$week"
            if [ -f "docker-compose.enhanced.yml" ]; then
                docker-compose -f docker-compose.enhanced.yml down --timeout 30 || true
            elif [ -f "docker-compose.yml" ]; then
                docker-compose -f docker-compose.yml down --timeout 30 || true
            fi
            cd - > /dev/null
        fi
    done
    
    # Pull latest images
    log "${YELLOW}📥 Pulling latest images...${NC}"
    docker pull confluentinc/cp-kafka:7.5.0
    docker pull confluentinc/cp-zookeeper:7.5.0
    docker pull confluentinc/cp-schema-registry:7.5.0
    docker pull newrelic/infrastructure:latest
    
    # Deploy based on environment
    case $ENVIRONMENT in
        production)
            deploy_production
            ;;
        staging)
            deploy_staging
            ;;
        development)
            deploy_development
            ;;
        *)
            error_exit "Unknown environment: $ENVIRONMENT"
            ;;
    esac
    
    # Post-deployment validation
    post_deployment_validation
}

# Production deployment
deploy_production() {
    log "${YELLOW}🏭 Deploying to production...${NC}"
    
    # Use enhanced configurations for production
    cd learning-app/labs/week1-xray
    docker-compose -f docker-compose.enhanced.yml up -d
    cd - > /dev/null
    
    # Apply production-specific settings
    docker exec kafka-xray-broker kafka-configs \
        --bootstrap-server localhost:9092 \
        --alter \
        --entity-type brokers \
        --entity-default \
        --add-config log.retention.hours=168,log.segment.bytes=1073741824 || true
}

# Staging deployment
deploy_staging() {
    log "${YELLOW}🧪 Deploying to staging...${NC}"
    
    cd learning-app/labs/week1-xray
    if [ -f "docker-compose.enhanced.yml" ]; then
        docker-compose -f docker-compose.enhanced.yml up -d
    else
        docker-compose up -d
    fi
    cd - > /dev/null
}

# Development deployment
deploy_development() {
    log "${YELLOW}💻 Deploying to development...${NC}"
    
    cd learning-app/labs/week1-xray
    docker-compose up -d
    cd - > /dev/null
}

# Post-deployment validation
post_deployment_validation() {
    log "${YELLOW}✅ Validating deployment...${NC}"
    
    # Wait for services to start
    sleep 30
    
    # Check health
    if [ -f "scripts/health-check.sh" ]; then
        if ./scripts/health-check.sh > /dev/null 2>&1; then
            log "${GREEN}✅ Health check passed${NC}"
        else
            log "${RED}❌ Health check failed${NC}"
            log "${YELLOW}Rolling back...${NC}"
            rollback
            error_exit "Deployment failed health check"
        fi
    fi
    
    # Run smoke tests
    smoke_tests
}

# Smoke tests
smoke_tests() {
    log "${YELLOW}🔥 Running smoke tests...${NC}"
    
    # Test Kafka connectivity
    if docker exec kafka-xray-broker kafka-broker-api-versions --bootstrap-server localhost:9092 > /dev/null 2>&1; then
        log "${GREEN}✅ Kafka connectivity test passed${NC}"
    else
        error_exit "Kafka connectivity test failed"
    fi
    
    # Test topic creation
    TEST_TOPIC="deployment-test-$(date +%s)"
    if docker exec kafka-xray-broker kafka-topics \
        --create \
        --topic "$TEST_TOPIC" \
        --bootstrap-server localhost:9092 \
        --partitions 1 \
        --replication-factor 1 > /dev/null 2>&1; then
        log "${GREEN}✅ Topic creation test passed${NC}"
        
        # Clean up test topic
        docker exec kafka-xray-broker kafka-topics \
            --delete \
            --topic "$TEST_TOPIC" \
            --bootstrap-server localhost:9092 > /dev/null 2>&1
    else
        error_exit "Topic creation test failed"
    fi
}

# Rollback to previous version
rollback() {
    log "${YELLOW}⏮️  Rolling back deployment...${NC}"
    
    # Find latest backup
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/backup-${ENVIRONMENT}-*.tar.gz 2>/dev/null | head -1)
    
    if [ -z "$LATEST_BACKUP" ]; then
        error_exit "No backup found for rollback"
    fi
    
    # Stop current services
    ./scripts/lab-manager.sh stop || true
    
    # Restore configurations
    tar -xzf "$LATEST_BACKUP" -C . || error_exit "Failed to restore backup"
    
    # Restart services
    ./scripts/lab-manager.sh start || error_exit "Failed to restart services after rollback"
    
    log "${GREEN}✅ Rollback completed${NC}"
}

# Show deployment status
show_status() {
    log "${BLUE}📊 Deployment Status${NC}"
    log "===================="
    log "Environment: $ENVIRONMENT"
    log "Current Version: $VERSION"
    log "Deployment Time: $(date)"
    echo
    
    # Show running services
    log "${YELLOW}Running Services:${NC}"
    docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" | grep -E "(kafka|zookeeper|newrelic)" || echo "No services running"
    echo
    
    # Show recent deployments
    log "${YELLOW}Recent Deployments:${NC}"
    ls -lt logs/deployment-*.log 2>/dev/null | head -5 || echo "No deployment logs found"
    echo
    
    # Show backups
    log "${YELLOW}Available Backups:${NC}"
    ls -lt "$BACKUP_DIR"/backup-${ENVIRONMENT}-*.tar.gz 2>/dev/null | head -5 || echo "No backups found"
}

# Main execution
main() {
    log "${BLUE}=== Kafka Learning Lab Deployment ===${NC}"
    log "Version: $VERSION"
    log "Environment: $ENVIRONMENT"
    log "Action: $ACTION"
    log "Time: $(date)"
    echo
    
    case $ACTION in
        deploy)
            pre_deployment_checks
            backup_current_state
            deploy
            log "${GREEN}✅ Deployment completed successfully!${NC}"
            ;;
        rollback)
            rollback
            ;;
        status)
            show_status
            ;;
        *)
            error_exit "Unknown action: $ACTION. Use: deploy, rollback, or status"
            ;;
    esac
}

# Create necessary directories
mkdir -p logs "$BACKUP_DIR"

# Execute main function
main 2>&1 | tee -a "logs/$LOG_FILE"