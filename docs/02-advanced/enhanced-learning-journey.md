# 🗺️ From Map-Reader to Map-Maker: Enhanced Learning Journey

> **Your Mission**: Not just understand Kafka observability, but master it so deeply you can extend, debug, and architect solutions from first principles.

## 🎯 Enhanced Learning Philosophy

### The Three Pillars of Mastery
1. **See It** - Observe the system in action
2. **Break It** - Understand failure modes
3. **Build It** - Create your own solutions

### Your Learning Stack
```
Level 4: Architect  ← Design complete platforms
Level 3: Detective  ← Debug any issue
Level 2: Builder    ← Create custom solutions
Level 1: Observer   ← Understand the flow
Level 0: Foundation ← Mental models (YOU ARE HERE)
```

---

## 📚 Stage 0: Foundation Calibration (Enhanced)

### Mental Model Bridges
Before diving into code, let's solidify your mental models:

```bash
# Navigate to your foundation docs
cd ~/qsLab/docs/00-foundation
cat mental-models.md
```

### Key Insight Exercise
**Time**: 30 minutes
**Goal**: Map your existing knowledge to Kafka

1. Draw your current understanding:
   ```
   API Server Monitoring          →    Kafka Monitoring
   /metrics endpoint             →    ???
   Prometheus scrape             →    ???
   Request rate                  →    ???
   Error rate                    →    ???
   Latency P99                   →    ???
   ```

2. Fill in the Kafka equivalents:
   ```
   API Server Monitoring          →    Kafka Monitoring
   /metrics endpoint             →    JMX Port 9999
   Prometheus scrape             →    nri-kafka polls
   Request rate                  →    MessagesInPerSec
   Error rate                    →    FailedFetchRequestsPerSec
   Latency P99                   →    RequestLatencyMs (99thPercentile)
   ```

### Validation Checkpoint
Can you explain why Kafka uses JMX instead of HTTP endpoints? 
(Hint: Java heritage, rich metrics, standard in JVM world)

---

## 🔬 Stage 1: Anatomy Tour (Deeply Enhanced)

### 1.1 Metric Journey Map
**Time**: 90 minutes
**Location**: `~/qsLab/labs/week1-xray`

Instead of just tracing one metric, we'll build a complete understanding:

```bash
# Start your environment
cd ~/qsLab/labs/week1-xray
docker-compose up -d

# Create a metric investigation notebook
mkdir -p investigations
cat > investigations/metric-journey.md << 'EOF'
# Metric: broker.messagesInPerSec

## Journey Stages
1. Origin: Kafka Broker Internal Counter
2. Exposure: JMX MBean
3. Discovery: nri-kafka finds MBean
4. Collection: JMX query via nrjmx
5. Transformation: Counter → Rate
6. Output: JSON to stdout
7. Ingestion: NR Infrastructure Agent
8. Storage: NRDB
9. Visualization: Dashboard

## Evidence Collection
EOF
```

### 1.2 The Tracer-Bullet Approach (Enhanced)

#### Step 1: Origin Investigation
```bash
# See the raw counter value
docker exec -it kafka-xray-jmxterm java -jar /jmxterm.jar << 'EOF'
open localhost:9999
get -b kafka.server:type=BrokerTopicMetrics,name=MessagesInPerSec Count
EOF

# Record value: ______
sleep 10

# Check again
# Record value: ______
# Calculate: (Value2 - Value1) / 10 = _____ msgs/sec
```
#### Step 2: Code Archaeology
```bash
# Clone nri-kafka source
git clone https://github.com/newrelic/nri-kafka.git ~/kafka-code-study
cd ~/kafka-code-study

# Find our metric definition
grep -r "messagesInPerSec" src/

# Study the transformation
cat src/metrics/broker_definitions.go | grep -A5 -B5 "MessagesInPerSec"
```

#### Step 3: Live Observation
```bash
# Run nri-kafka with debug logging
docker run --rm --network host \
  -v ${PWD}/configs/kafka-config.yml:/etc/newrelic-infra/integrations.d/kafka-config.yml \
  -e NRIA_LOG_LEVEL=trace \
  newrelic/nri-kafka:latest \
  --verbose --metrics 2>&1 | tee investigations/nri-kafka-trace.log

# Find the JMX query
grep -i "jmx" investigations/nri-kafka-trace.log
grep -i "MessagesInPerSec" investigations/nri-kafka-trace.log
```

### 1.3 Build Your Own Tracer
**Time**: 60 minutes
**Goal**: Create a tool that traces ANY metric

Create `~/qsLab/debugging-toolkit/metric-tracer.go`:
See `~/qsLab/debugging-toolkit/metric-tracer.go` for the complete implementation.

### 1.4 Validation Exercises

1. **Trace 3 Different Metrics**:
   ```bash
   # Build the tracer
   cd ~/qsLab/debugging-toolkit
   go build metric-tracer.go
   
   # Bytes In
   ./metric-tracer "kafka.server:type=BrokerTopicMetrics,name=BytesInPerSec"
   
   # Bytes Out  
   ./metric-tracer "kafka.server:type=BrokerTopicMetrics,name=BytesOutPerSec"
   
   # Failed Fetches
   ./metric-tracer "kafka.server:type=BrokerTopicMetrics,name=FailedFetchRequestsPerSec"
   ```

2. **Compare with nri-kafka output**:
   ```bash
   # Run nri-kafka
   docker run --rm --network host \
     -v ${PWD}/configs/kafka-config.yml:/etc/newrelic-infra/integrations.d/kafka-config.yml \
     newrelic/nri-kafka:latest \
     --metrics --pretty > investigations/nri-output.json
   
   # Compare your calculations
   jq '.[] | .metrics[] | select(.event_type=="KafkaBrokerSample") | {
     messagesIn: .["broker.messagesInPerSec"],
     bytesIn: .["broker.bytesInPerSec"],
     bytesOut: .["broker.bytesOutPerSec"]
   }' investigations/nri-output.json
   ```

---

## 🧪 Stage 2: Local Lab (Production-Realistic)
### 2.1 Enhanced Docker Environment

Create `~/qsLab/labs/week2-builder/docker-compose-full.yml`:
```yaml
version: '3.9'
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_JMX_PORT: 9998

  kafka-1:
    image: confluentinc/cp-kafka:7.5.0
    depends_on: [zookeeper]
    ports:
      - "9092:9092"
      - "9999:9999"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_JMX_PORT: 9999
      KAFKA_JMX_HOSTNAME: localhost

  kafka-2:
    image: confluentinc/cp-kafka:7.5.0
    depends_on: [zookeeper]
    ports:
      - "9093:9093"
      - "10000:10000"
    environment:
      KAFKA_BROKER_ID: 2
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9093
      KAFKA_JMX_PORT: 10000
      KAFKA_JMX_HOSTNAME: localhost

  kafka-3:
    image: confluentinc/cp-kafka:7.5.0
    depends_on: [zookeeper]
    ports:
      - "9094:9094"
      - "10001:10001"
    environment:
      KAFKA_BROKER_ID: 3
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9094
      KAFKA_JMX_PORT: 10001
      KAFKA_JMX_HOSTNAME: localhost

  # Producer simulator
  producer:
    build: ./producer
    depends_on: [kafka-1, kafka-2, kafka-3]
    environment:
      BOOTSTRAP_SERVERS: kafka-1:9092,kafka-2:9093,kafka-3:9094
      TOPICS: "orders,payments,inventory"
      RATE: 100

  # Consumer simulator
  consumer:
    build: ./consumer
    depends_on: [kafka-1, kafka-2, kafka-3]
    environment:
      BOOTSTRAP_SERVERS: kafka-1:9092,kafka-2:9093,kafka-3:9094
      TOPICS: "orders,payments,inventory"
      GROUP_ID: "analytics-consumer"

  # nri-kafka collector
  nri-kafka:
    image: newrelic/nri-kafka:latest
    depends_on: [kafka-1, kafka-2, kafka-3]
    volumes:
      - ./kafka-config-multi.yml:/etc/newrelic-infra/integrations.d/kafka-config.yml
    environment:
      NRIA_LOG_LEVEL: debug
```

### 2.2 Traffic Patterns Lab

Create realistic traffic patterns to observe different metrics:

```python
# ~/qsLab/labs/week2-builder/producer/traffic_simulator.py
import time
import random
from kafka import KafkaProducer
import json

class TrafficSimulator:
    def __init__(self, bootstrap_servers):
        self.producer = KafkaProducer(
            bootstrap_servers=bootstrap_servers,
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            compression_type='gzip'
        )
        
    def generate_normal_traffic(self, topic, rate=100):
        """Steady state traffic"""
        interval = 1.0 / rate
        while True:
            self.producer.send(topic, {
                'timestamp': time.time(),
                'type': 'normal',
                'value': random.randint(1, 100)
            })
            time.sleep(interval)
    
    def generate_spike_traffic(self, topic, normal_rate=100, spike_rate=1000, spike_duration=30):
        """Traffic spike pattern"""
        normal_interval = 1.0 / normal_rate
        spike_interval = 1.0 / spike_rate
        spike_end = time.time() + spike_duration
        
        while time.time() < spike_end:
            self.producer.send(topic, {
                'timestamp': time.time(),
                'type': 'spike',
                'value': random.randint(100, 1000)
            })
            time.sleep(spike_interval)
            
    def generate_error_traffic(self, topic, error_rate=0.1):
        """Messages that will fail processing"""
        while True:
            if random.random() < error_rate:
                # Send malformed message
                self.producer.send(topic, b'INVALID_JSON{{}')
            else:
                self.producer.send(topic, {
                    'timestamp': time.time(),
                    'type': 'normal',
                    'value': random.randint(1, 100)
                })
            time.sleep(0.1)
```

---

## 🔧 Stage 3: Flag Experiments (Scientific Approach)
### 3.1 Measurement Framework

Create `~/qsLab/labs/week3-optimizer/flag-experiments.sh`:
```bash
#!/bin/bash
# Flag impact measurement framework

measure_impact() {
    local flag_name=$1
    local flag_value=$2
    local description=$3
    
    echo "=== Testing: $description ==="
    echo "Flag: $flag_name=$flag_value"
    
    # Baseline metrics
    echo "Collecting baseline..."
    docker stats --no-stream > baseline.txt
    
    # Run with flag
    docker run --rm --network host \
        -v ${PWD}/configs/kafka-config.yml:/etc/newrelic-infra/integrations.d/kafka-config.yml \
        -e "$flag_name=$flag_value" \
        newrelic/nri-kafka:latest \
        --metrics --pretty > output_${flag_name}.json &
    
    NRI_PID=$!
    sleep 30
    
    # Collect metrics during run
    docker stats --no-stream > during_run.txt
    
    # Stop collection
    kill $NRI_PID
    
    # Analysis
    echo "Results:"
    echo "- Output size: $(wc -c < output_${flag_name}.json) bytes"
    echo "- Metrics collected: $(jq '[.[] | .metrics[]] | length' output_${flag_name}.json)"
    echo "- Unique metric names: $(jq -r '[.[] | .metrics[] | keys[]] | unique | length' output_${flag_name}.json)"
    echo ""
}

# Run experiments
measure_impact "COLLECT_BROKER_TOPIC_DATA" "false" "Minimal collection"
measure_impact "COLLECT_BROKER_TOPIC_DATA" "true" "Standard collection"
measure_impact "ENABLE_BROKER_TOPIC_METRICS_V2" "true" "V2 metrics enabled"
measure_impact "COLLECT_TOPIC_SIZE" "true" "Topic size collection"
measure_impact "CONSUMER_OFFSET" "true" "Consumer offset collection"
```

### 3.2 Performance Impact Analysis

Create a comprehensive test suite: