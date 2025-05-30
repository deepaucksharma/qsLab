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
