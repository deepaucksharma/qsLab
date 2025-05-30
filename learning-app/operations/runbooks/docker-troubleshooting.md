# Docker Troubleshooting Runbook

## Overview
This runbook provides step-by-step troubleshooting procedures for common Docker-related issues in the Kafka Learning Lab environment.

## Table of Contents
1. [Container Won't Start](#container-wont-start)
2. [High Resource Usage](#high-resource-usage)
3. [Network Connectivity Issues](#network-connectivity-issues)
4. [Volume and Storage Problems](#volume-and-storage-problems)
5. [Performance Issues](#performance-issues)
6. [Recovery Procedures](#recovery-procedures)

---

## Container Won't Start

### Symptoms
- Container exits immediately after starting
- Docker Compose shows containers as "Exit" status
- Error messages about ports already in use

### Diagnostic Steps

1. **Check container logs**
```bash
# View logs for specific container
docker logs kafka-xray-broker --tail 50

# View all compose logs
cd learning-app/labs/week1-xray
docker-compose logs --tail 100
```

2. **Check port availability**
```bash
# Check if ports are in use
sudo netstat -tlnp | grep -E '(9092|2181|9000)'

# Alternative using ss
ss -tlnp | grep -E '(9092|2181|9000)'
```

3. **Verify Docker daemon status**
```bash
# Check Docker service
systemctl status docker

# Check Docker info
docker info
```

### Solutions

#### Port Conflict
```bash
# Find and stop conflicting process
sudo lsof -i :9092
kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "9093:9092"  # Use different external port
```

#### Container Dependencies
```bash
# Ensure proper startup order
docker-compose up -d zookeeper
sleep 10
docker-compose up -d kafka-broker
```

#### Clean Start
```bash
# Full cleanup and restart
./scripts/lab-manager.sh clean
./scripts/lab-manager.sh start
```

---

## High Resource Usage

### Symptoms
- System becomes unresponsive
- Docker stats shows >80% CPU or memory
- Out of memory errors

### Diagnostic Steps

1. **Check current usage**
```bash
# Real-time stats
docker stats

# Specific container
docker stats kafka-xray-broker --no-stream
```

2. **Check container limits**
```bash
# Inspect current limits
docker inspect kafka-xray-broker | grep -A 5 -B 5 "Memory\|Cpu"
```

3. **System resources**
```bash
# Check available memory
free -h

# Check CPU usage
top -bn1 | head -5
```

### Solutions

#### Apply Resource Limits
```yaml
# In docker-compose.yml
services:
  kafka-broker:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

#### Reduce Kafka Memory
```bash
# Set KAFKA_HEAP_OPTS in docker-compose.yml
environment:
  KAFKA_HEAP_OPTS: "-Xmx512M -Xms512M"
```

#### Clean Up Resources
```bash
# Remove unused containers
docker container prune -f

# Remove unused images
docker image prune -a -f

# Remove unused volumes
docker volume prune -f

# Full system cleanup
docker system prune -a --volumes -f
```

---

## Network Connectivity Issues

### Symptoms
- Cannot connect to Kafka broker
- Terminal commands timeout
- Services can't communicate

### Diagnostic Steps

1. **Check network configuration**
```bash
# List Docker networks
docker network ls

# Inspect network
docker network inspect kafka-xray_default
```

2. **Test connectivity**
```bash
# Test from host to container
docker exec kafka-xray-broker nc -zv localhost 9092

# Test between containers
docker exec kafka-xray-broker ping kafka-xray-zookeeper
```

3. **Check firewall rules**
```bash
# Check iptables
sudo iptables -L -n | grep -E '(9092|2181)'

# Check if Docker's iptables rules exist
sudo iptables -L DOCKER
```

### Solutions

#### Recreate Network
```bash
# Stop services
docker-compose down

# Remove network
docker network rm kafka-xray_default

# Restart services (network will be recreated)
docker-compose up -d
```

#### Fix DNS Resolution
```bash
# Add explicit links in docker-compose.yml
services:
  kafka-broker:
    links:
      - zookeeper
    environment:
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
```

#### Bridge Network Issues
```bash
# Use host network mode (development only)
services:
  kafka-broker:
    network_mode: host
    environment:
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
```

---

## Volume and Storage Problems

### Symptoms
- "No space left on device" errors
- Container can't write to volumes
- Data not persisting between restarts

### Diagnostic Steps

1. **Check disk space**
```bash
# Overall disk usage
df -h

# Docker specific usage
docker system df

# Find large files
du -h /var/lib/docker | sort -rh | head -20
```

2. **Check volume permissions**
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect kafka-xray_kafka-data

# Check permissions
docker run --rm -v kafka-xray_kafka-data:/data alpine ls -la /data
```

### Solutions

#### Free Up Space
```bash
# Clean up logs
find /var/lib/docker/containers -name "*.log" -size +100M -delete

# Truncate large logs
truncate -s 0 /var/lib/docker/containers/*/*-json.log

# Remove old volumes
docker volume prune -f
```

#### Fix Volume Permissions
```bash
# Reset volume permissions
docker run --rm -v kafka-xray_kafka-data:/data alpine chown -R 1000:1000 /data
```

#### Move Docker Root
```bash
# Stop Docker
sudo systemctl stop docker

# Move Docker root to larger partition
sudo mv /var/lib/docker /new/path/docker
sudo ln -s /new/path/docker /var/lib/docker

# Start Docker
sudo systemctl start docker
```

---

## Performance Issues

### Symptoms
- Slow container startup
- Commands take long to execute
- High latency in operations

### Diagnostic Steps

1. **Check I/O performance**
```bash
# Monitor I/O
iotop -o

# Check disk performance
docker run --rm alpine dd if=/dev/zero of=/test bs=1M count=100
```

2. **Check Docker daemon logs**
```bash
# View daemon logs
journalctl -u docker -f

# Check for errors
journalctl -u docker | grep -i error | tail -20
```

### Solutions

#### Optimize Logging
```yaml
# Limit log size in docker-compose.yml
services:
  kafka-broker:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        compress: "true"
```

#### Enable BuildKit
```bash
# Enable BuildKit for faster builds
export DOCKER_BUILDKIT=1
```

#### Optimize Storage Driver
```bash
# Check current storage driver
docker info | grep "Storage Driver"

# Use overlay2 (if not already)
# Edit /etc/docker/daemon.json
{
  "storage-driver": "overlay2"
}

# Restart Docker
sudo systemctl restart docker
```

---

## Recovery Procedures

### Emergency Recovery

1. **Stop all containers**
```bash
docker stop $(docker ps -aq)
```

2. **Clean up system**
```bash
# Remove all containers
docker rm $(docker ps -aq)

# Clean networks
docker network prune -f

# Clean volumes (WARNING: data loss)
docker volume prune -f
```

3. **Restart Docker daemon**
```bash
sudo systemctl restart docker
```

4. **Fresh start**
```bash
cd learning-app
./scripts/setup-simple-infra.sh
./scripts/lab-manager.sh start
```

### Data Recovery

1. **Backup volumes**
```bash
# Create backup
docker run --rm \
  -v kafka-xray_kafka-data:/source \
  -v $(pwd):/backup \
  alpine tar czf /backup/kafka-data-backup.tar.gz -C /source .
```

2. **Restore volumes**
```bash
# Restore from backup
docker run --rm \
  -v kafka-xray_kafka-data:/target \
  -v $(pwd):/backup \
  alpine tar xzf /backup/kafka-data-backup.tar.gz -C /target
```

### Health Validation

After any recovery procedure:

```bash
# Run health check
./scripts/health-check.sh

# Monitor for 5 minutes
./scripts/monitoring-dashboard.sh

# Test basic functionality
docker exec kafka-xray-broker \
  kafka-topics --create --topic test-recovery \
  --bootstrap-server localhost:9092 \
  --partitions 1 --replication-factor 1
```

---

## Prevention Best Practices

1. **Regular Maintenance**
   - Run `docker system prune` weekly
   - Monitor disk space daily
   - Keep Docker and images updated

2. **Resource Management**
   - Always set resource limits
   - Monitor usage trends
   - Plan for peak usage

3. **Backup Strategy**
   - Backup critical data daily
   - Test restore procedures monthly
   - Document custom configurations

4. **Monitoring**
   - Use monitoring dashboard regularly
   - Set up alerts for critical thresholds
   - Review logs for early warning signs

---

## Contact Information

For issues not covered in this runbook:

- **Slack Channel**: #kafka-learning-support
- **Emergency Contact**: DevOps On-Call
- **Documentation**: /learning-app/operations/
- **Issue Tracker**: GitHub Issues with 'docker' label