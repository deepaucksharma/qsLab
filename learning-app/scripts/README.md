# Infrastructure Scripts Documentation

This directory contains operational scripts for managing the Kafka Learning Lab infrastructure.

## 🚀 Quick Start Scripts

### setup-simple-infra.sh
Initial setup script that creates all necessary directories and base configurations.
```bash
./setup-simple-infra.sh
```

### lab-manager.sh
Main script for managing lab environments. Supports all lab operations.
```bash
./lab-manager.sh start              # Start the lab environment
./lab-manager.sh stop               # Stop the lab environment
./lab-manager.sh restart            # Restart all services
./lab-manager.sh status             # Check service status
./lab-manager.sh logs [service]     # View logs (optional: specific service)
./lab-manager.sh clean              # Remove all data and volumes
./lab-manager.sh shell [container]  # Open shell in container
```

## 📊 Monitoring Scripts

### health-check.sh
Performs comprehensive health checks on all services.
```bash
./health-check.sh
```
Returns:
- Container status
- Service health (Zookeeper, Kafka, New Relic)
- Resource usage statistics
- Topic count

### monitor.sh
Real-time monitoring dashboard that refreshes every 10 seconds.
```bash
./monitor.sh  # Press Ctrl+C to exit
```
Displays:
- Container status and ports
- CPU and memory usage
- Kafka metrics and topics
- Recent errors and warnings

### collect-logs.sh
Collects and archives logs for troubleshooting.
```bash
./collect-logs.sh
```
Creates timestamped archive in `logs/` directory containing:
- Container logs (last hour)
- System information
- Docker statistics
- Disk usage

## 🔧 Operational Scripts

### deploy.sh
Simple deployment script for updating the environment.
```bash
./deploy.sh [version] [environment]
# Examples:
./deploy.sh latest production
./deploy.sh v1.2.3 staging
```

### generate-traffic.sh
Generates sample Kafka traffic for testing and exercises.
```bash
./generate-traffic.sh all     # All traffic patterns
./generate-traffic.sh steady  # Steady traffic only
./generate-traffic.sh burst   # Burst traffic only
./generate-traffic.sh chaos   # Chaotic patterns
```

## 📁 Directory Structure

```
scripts/
├── README.md               # This file
├── setup-simple-infra.sh   # Initial setup
├── lab-manager.sh          # Lab lifecycle management
├── health-check.sh         # Health validation
├── monitor.sh              # Real-time monitoring
├── collect-logs.sh         # Log collection
├── deploy.sh               # Deployment automation
└── generate-traffic.sh     # Traffic generation
```

## 🔍 Common Use Cases

### Daily Operations
```bash
# Morning startup
./lab-manager.sh start
./health-check.sh

# Check status throughout the day
./monitor.sh

# Evening shutdown
./lab-manager.sh stop
```

### Troubleshooting
```bash
# Collect diagnostic information
./collect-logs.sh
./lab-manager.sh logs kafka-broker --tail 100

# Access container directly
./lab-manager.sh shell kafka-broker
```

### Maintenance
```bash
# Full cleanup and restart
./lab-manager.sh clean
./lab-manager.sh start

# Update and deploy
git pull
./deploy.sh latest production
```

## ⚠️ Important Notes

1. **Resource Requirements**: Ensure at least 4GB RAM available for Docker
2. **Port Conflicts**: Default ports are 9092 (Kafka), 2181 (Zookeeper)
3. **Data Persistence**: Use `clean` command carefully - it removes all data
4. **Logs**: Archived logs are kept in the `logs/` directory

## 🆘 Troubleshooting

If services fail to start:
1. Check Docker daemon is running: `docker ps`
2. Verify ports are available: `netstat -tlnp | grep -E '9092|2181'`
3. Review logs: `./lab-manager.sh logs`
4. Clean and restart: `./lab-manager.sh clean && ./lab-manager.sh start`

For more detailed troubleshooting, see `operations/runbooks/common-operations.md`