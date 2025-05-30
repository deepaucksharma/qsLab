# 🚀 Quick Start Guide

## Start Your Journey in 5 Minutes

### 1. Prerequisites Check
```bash
# Check Docker is installed and running
docker --version
docker ps

# Check Git is configured  
git config --global user.name
git config --global user.email

# Ensure you're in the right directory
cd ~/qsLab
pwd
```

### 2. Launch Your First Lab
```bash
# Navigate to Week 1 X-Ray lab
cd labs/week1-xray

# Start the Docker environment
docker-compose up -d

# Verify containers are running
docker-compose ps

# Expected output:
# NAME                    STATUS    PORTS
# kafka-xray-broker       running   0.0.0.0:9092->9092/tcp, 0.0.0.0:9999->9999/tcp
# kafka-xray-zookeeper    running   0.0.0.0:2181->2181/tcp
# kafka-xray-jmxterm      running   
# kafka-xray-ui           running   0.0.0.0:8080->8080/tcp
```

### 3. Generate Test Data
```bash
# Make the script executable (first time only)
chmod +x scripts/generate-traffic.sh

# Generate test traffic
./scripts/generate-traffic.sh

# You should see:
# 🚀 Kafka Traffic Generator
# Topic already exists
# 🔄 Generating traffic...# ✅ Traffic generation complete!
```

### 4. Your First Metric Trace
```bash
# See raw JMX metrics
docker exec -it kafka-xray-jmxterm java -jar /jmxterm.jar -n <<EOF
open localhost:9999
get -b kafka.server:name=MessagesInPerSec,type=BrokerTopicMetrics Count
EOF

# Run nri-kafka to see processed metrics
docker run --rm --network host \
  -v ${PWD}/configs/kafka-config.yml:/etc/newrelic-infra/integrations.d/kafka-config.yml \
  newrelic/nri-kafka:latest \
  --metrics --pretty | jq '.[0].metrics[0]'
```

### 5. What You Should See
- JMX returns a counter value (e.g., `Count = 10523`)
- nri-kafka outputs JSON with calculated rates
- The metric `broker.messagesInPerSec` shows messages per second

## 🎯 Your First Goal
Complete [Exercise 1: Metric X-Ray](labs/week1-xray/exercise-01-metric-xray.md) to understand:
1. Where metrics originate (JMX MBeans)
2. How they're collected (nri-kafka)
3. How they're transformed (counter → rate)

## 📚 Next Steps
- Review [Mental Models](docs/00-foundation/mental-models.md) to connect to your existing knowledge
- Study [Core Concepts](docs/00-foundation/core-concepts.md) for Kafka-specific understanding
- Start tracking progress in [PROGRESS.md](PROGRESS.md)

## 🔍 Explore More
- **Kafka UI**: Open http://localhost:8080 to see your cluster visually
- **Architecture**: Review [NRI-Kafka Architecture](docs/01-architecture/nri-kafka-architecture.md)
- **Enhanced Path**: Try the [Enhanced Learning Journey](docs/02-advanced/enhanced-learning-journey.md)

## ⚡ Troubleshooting

### Docker Issues
```bash
# If containers fail to start
docker-compose down
docker-compose up -d --force-recreate

# Check logs
docker-compose logs kafka-xray-broker
```

### Port Conflicts
If ports are already in use, edit `docker-compose.yml` to change:
- Kafka: 9092 → 19092
- JMX: 9999 → 19999
- UI: 8080 → 18080

**Time to first insight: 15 minutes** ⏱️

---

Ready for the full journey? Return to [README.md](README.md) for complete learning paths.