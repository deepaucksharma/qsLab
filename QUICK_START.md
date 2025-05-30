# 🚀 Quick Start Guide

## Start Your Journey in 5 Minutes

### 1. Prerequisites Check
```bash
# Check Docker is installed
docker --version

# Check Git is configured  
git config --list

# Clone this repo (if not already)
git clone https://github.com/deepaucksharma/qsLab.git
cd qsLab
```

### 2. Launch Your First Lab
```bash
# Navigate to Week 1
cd labs/week1-xray

# Start the environment
docker-compose up -d

# Wait for Kafka to be ready (30 seconds)
sleep 30

# Generate test data
./scripts/generate-traffic.sh
```

### 3. Your First Metric Trace
```bash
# See raw JMX metrics
docker exec -it kafka-xray-jmxterm java -jar /jmxterm.jar -n <<EOF
open localhost:9999
get -b kafka.server:name=MessagesInPerSec,type=BrokerTopicMetrics Count
EOF

# Run nri-kafka
docker run --rm --network host \
  -v ${PWD}/configs/kafka-config.yml:/etc/newrelic-infra/integrations.d/kafka-config.yml \
  newrelic/nri-kafka:latest \
  --metrics --pretty
```

### 4. What You Should See
- JMX returns a counter value (e.g., `Count = 10523`)
- nri-kafka outputs JSON with calculated rates
- The metric `broker.messagesInPerSec` shows messages per second

## 🎯 Your First Goal
Complete [Exercise 1: Metric X-Ray](labs/week1-xray/exercise-01-metric-xray.md) and understand:
1. Where metrics originate (JMX MBeans)
2. How they're collected (nri-kafka)
3. How they're transformed (counter → rate)

## 📚 Next Steps
- Read [Mental Models](docs/00-foundation/mental-models.md) to connect to what you know
- Review [Core Concepts](docs/00-foundation/core-concepts.md) for Kafka specifics
- Track progress in [PROGRESS.md](PROGRESS.md)

**Time to first insight: 15 minutes** ⏱️
