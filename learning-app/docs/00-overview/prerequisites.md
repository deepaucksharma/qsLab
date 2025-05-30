# Prerequisites

Before starting your Kafka observability learning journey, ensure you have the following prerequisites in place.

## Technical Requirements

### Software Requirements

1. **Docker Desktop** (latest version)
   - Docker Engine 20.10+
   - Docker Compose 2.0+
   - At least 8GB RAM allocated to Docker
   - 20GB free disk space

2. **Development Tools**
   - Git (for cloning repositories)
   - Text editor or IDE (VS Code recommended)
   - Terminal/Command line access
   - Web browser (Chrome/Firefox/Safari)

3. **Programming Languages** (optional but helpful)
   - Go 1.19+ (for custom integrations)
   - Python 3.8+ (for data analysis scripts)
   - Basic shell scripting knowledge

### New Relic Requirements

1. **New Relic Account**
   - Active New Relic account (free tier is sufficient)
   - Valid license key
   - Access to Infrastructure monitoring
   - Ability to create dashboards and run NRQL queries

2. **Permissions Needed**
   - Infrastructure agent installation
   - Integration configuration
   - Custom dashboard creation
   - NRQL query execution

### System Requirements

- **Operating System**: 
  - macOS 10.14+
  - Ubuntu 20.04+
  - Windows 10/11 with WSL2
  
- **Hardware**:
  - CPU: 4+ cores recommended
  - RAM: 16GB (8GB minimum)
  - Storage: 50GB free space
  - Network: Stable internet connection

## Knowledge Prerequisites

### Required Knowledge

1. **Basic Kafka Concepts**
   - Topics and partitions
   - Producers and consumers
   - Brokers and clusters
   - Basic understanding of distributed systems

2. **Container Basics**
   - Docker container concepts
   - Docker Compose usage
   - Basic container networking

3. **Monitoring Fundamentals**
   - Metrics vs logs vs traces
   - Time-series data concepts
   - Basic dashboard creation

### Helpful but Not Required

1. **JMX Understanding**
   - Java Management Extensions basics
   - MBean concept

2. **Query Languages**
   - SQL basics (for NRQL)
   - JSON structure understanding

3. **Networking**
   - TCP/IP basics
   - Port concepts
   - DNS fundamentals

## Environment Setup Checklist

Before starting Week 1, verify:

- [ ] Docker is installed and running
- [ ] Docker Compose is available
- [ ] Git is installed
- [ ] New Relic account is active
- [ ] License key is obtained
- [ ] 8GB+ RAM is available
- [ ] Internet connection is stable
- [ ] Terminal/command line is accessible

## Quick Verification Commands

Run these commands to verify your environment:

```bash
# Check Docker
docker --version
docker-compose --version
docker run hello-world

# Check Git
git --version

# Check available resources
docker system df
docker info | grep -E 'CPUs|Total Memory'

# Check network connectivity
curl -I https://api.newrelic.com
```

## Getting Your New Relic License Key

1. Log in to [New Relic](https://one.newrelic.com)
2. Click on your account name (bottom left)
3. Select "API keys"
4. Find your "License key" (INGEST - LICENSE type)
5. Copy the key for use in configurations

## Troubleshooting Common Issues

### Docker Memory Issues
If Docker doesn't have enough memory:
- **macOS/Windows**: Docker Desktop → Preferences → Resources → Memory → Set to 8GB+
- **Linux**: Docker uses system memory directly

### Port Conflicts
Common ports used by the labs:
- 9092-9094: Kafka brokers
- 2181: Zookeeper
- 9999-10001: JMX ports

Check for conflicts:
```bash
# macOS/Linux
lsof -i :9092

# Windows
netstat -an | findstr :9092
```

### Network Issues
If containers can't communicate:
```bash
# List Docker networks
docker network ls

# Create required network
docker network create kafka-monitoring
```

## Learning Resources

Before starting, you might want to review:

1. [Kafka Documentation](https://kafka.apache.org/documentation/)
2. [New Relic Fundamentals](https://learn.newrelic.com)
3. [Docker Getting Started](https://docs.docker.com/get-started/)
4. [NRQL Tutorial](https://docs.newrelic.com/docs/query-your-data/nrql-new-relic-query-language/get-started/introduction-nrql-tutorial/)

## Ready to Start?

Once you've verified all prerequisites:

1. Proceed to the [Quick Start Guide](quick-start.md)
2. Set up your environment
3. Begin with [Week 1: X-Ray Vision](../01-learning-path/week1-xray.md)

Remember: The goal is learning, not perfection. If you encounter issues, use them as learning opportunities to understand the system better!