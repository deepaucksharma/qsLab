# Enhanced Learning Journey - Part 3

## 🔍 Stage 6: Production Debugging Scenarios

### 6.1 The Lag Spike Investigation

**Scenario**: Consumer lag suddenly spikes on the `checkout-events` topic at 3 AM.

**Your Investigation Playbook**:

```bash
# Step 1: Confirm the lag spike
cat > investigations/lag-spike-query.nrql << 'EOF'
SELECT max(consumer.lag) 
FROM KafkaConsumerSample 
WHERE topic = 'checkout-events'
TIMESERIES SINCE 6 hours
EOF

# Step 2: Check producer rate during spike
cat > investigations/producer-rate-query.nrql << 'EOF'
SELECT rate(sum(broker.messagesInPerSec), 1 minute)
FROM KafkaBrokerSample
WHERE topic = 'checkout-events'
TIMESERIES SINCE 6 hours
EOF

# Step 3: Check consumer processing rate
cat > investigations/consumer-rate-query.nrql << 'EOF'
SELECT rate(sum(consumer.recordsConsumedRate), 1 minute)
FROM KafkaConsumerSample
WHERE topic = 'checkout-events'
TIMESERIES SINCE 6 hours
EOF

# Step 4: Infrastructure correlation
cat > investigations/infra-correlation-query.nrql << 'EOF'
SELECT 
    average(host.cpuPercent) AS 'CPU %',
    average(host.memoryUsedPercent) AS 'Memory %',
    max(consumer.lag) AS 'Consumer Lag'
FROM SystemSample, KafkaConsumerSample
WHERE hostname IN (
    SELECT hostname 
    FROM KafkaConsumerSample 
    WHERE consumer.group = 'checkout-processor'
)
TIMESERIES SINCE 6 hours
EOF
```

**Root Cause Analysis Tree**:
```
Lag Spike Detected
├── Producer Side Issues?
│   ├── Message rate spike? → Check producer metrics
│   ├── Large message batch? → Check message size metrics
│   └── Producer errors? → Check failed send rate
├── Consumer Side Issues?
│   ├── Processing slowdown? → Check consumer rate
│   ├── Rebalancing? → Check consumer group events
│   └── Application errors? → Check logs/APM
└── Infrastructure Issues?
    ├── CPU throttling? → Check host metrics
    ├── Memory pressure? → Check GC metrics
    └── Network issues? → Check network metrics
```

### 6.2 The Missing Metrics Mystery

**Scenario**: Metrics for broker-2 stop appearing in dashboards.

**Debugging Checklist**:

```bash
# Create comprehensive debugging script
cat > debugging-toolkit/missing-metrics-investigator.sh << 'EOF'
#!/bin/bash

BROKER_ID=$1
JMX_PORT=$2

echo "🔍 Investigating missing metrics for broker-${BROKER_ID}"

# Test 1: JMX Port Connectivity
echo "Test 1: JMX Connectivity"
timeout 5 telnet localhost ${JMX_PORT} && echo "✅ JMX port accessible" || echo "❌ JMX port not accessible"

# Test 2: JMX MBean Query
echo -e "\nTest 2: JMX MBean Query"
docker exec kafka-xray-jmxterm java -jar /jmxterm.jar -n -v silent << JMXEOF
open localhost:${JMX_PORT}
get -b kafka.server:type=BrokerTopicMetrics,name=MessagesInPerSec Count
JMXEOF

# Test 3: nri-kafka Discovery
echo -e "\nTest 3: nri-kafka Discovery"
docker run --rm --network host \
    -v ${PWD}/configs/kafka-config.yml:/etc/newrelic-infra/integrations.d/kafka-config.yml \
    newrelic/nri-kafka:latest \
    --discovery_only --pretty | jq '.[] | select(.broker_id == '${BROKER_ID}')'

# Test 4: Check nri-kafka Logs
echo -e "\nTest 4: nri-kafka Error Logs"
docker run --rm --network host \
    -v ${PWD}/configs/kafka-config.yml:/etc/newrelic-infra/integrations.d/kafka-config.yml \
    -e NRIA_LOG_LEVEL=debug \
    newrelic/nri-kafka:latest \
    --metrics 2>&1 | grep -i "error\|fail\|broker-${BROKER_ID}"

# Test 5: Manual Metric Collection
echo -e "\nTest 5: Manual Collection Test"
docker run --rm --network host \
    -e BOOTSTRAP_BROKER_HOST=localhost \
    -e BOOTSTRAP_BROKER_KAFKA_PORT=909${BROKER_ID} \
    -e BOOTSTRAP_BROKER_JMX_PORT=${JMX_PORT} \
    newrelic/nri-kafka:latest \
    --metrics --pretty | jq '.[] | select(.entity_name | contains("broker-'${BROKER_ID}'"))'
EOF

chmod +x debugging-toolkit/missing-metrics-investigator.sh

# Run investigation
./debugging-toolkit/missing-metrics-investigator.sh 2 10000
```

### 6.3 Performance Degradation Pattern

**Scenario**: Overall Kafka performance degrades during peak hours.

Create a performance analysis toolkit:

```python
# ~/qsLab/debugging-toolkit/performance-analyzer.py
import json
import requests
from datetime import datetime, timedelta
import pandas as pd
import matplotlib.pyplot as plt

class KafkaPerformanceAnalyzer:
    def __init__(self, nr_account_id, nr_api_key):
        self.account_id = nr_account_id
        self.api_key = nr_api_key
        self.nrql_endpoint = f"https://api.newrelic.com/v2/accounts/{account_id}/query"
        
    def analyze_peak_hours(self, topic=None):
        """Analyze performance during peak vs off-peak hours"""
        
        queries = {
            'message_rate': """
                SELECT rate(sum(broker.messagesInPerSec), 1 minute) 
                FROM KafkaBrokerSample 
                FACET hourOf(timestamp)
                SINCE 1 week
            """,
            'latency': """
                SELECT average(broker.requestLatencyMs) 
                FROM KafkaBrokerSample 
                FACET hourOf(timestamp)
                SINCE 1 week
            """,
            'consumer_lag': """
                SELECT average(consumer.lag) 
                FROM KafkaConsumerSample 
                FACET hourOf(timestamp)
                SINCE 1 week
            """
        }
        
        results = {}
        for metric, query in queries.items():
            if topic:
                query = query.replace("FROM", f"WHERE topic = '{topic}' FROM")
            
            response = self._execute_nrql(query)
            results[metric] = self._parse_faceted_results(response)
        
        return self._identify_peak_patterns(results)
    
    def _identify_peak_patterns(self, results):
        """Identify patterns in peak hour performance"""
        patterns = {
            'peak_hours': [],
            'degradation_metrics': [],
            'recommendations': []
        }
        
        # Find hours with highest message rate
        message_rates = results['message_rate']
        sorted_hours = sorted(message_rates.items(), key=lambda x: x[1], reverse=True)
        patterns['peak_hours'] = [hour for hour, _ in sorted_hours[:3]]
        
        # Check if latency increases during peak hours
        for hour in patterns['peak_hours']:
            if results['latency'].get(hour, 0) > average(results['latency'].values()) * 1.5:
                patterns['degradation_metrics'].append('latency')
                patterns['recommendations'].append(
                    f"Consider scaling brokers - latency spike at hour {hour}"
                )
        
        return patterns
```

---

## 🚀 Advanced Topics for Future Exploration

### 7.1 Security Hardening
```yaml
# Secure nri-kafka configuration
integrations:
  - name: nri-kafka
    env:
      # SASL/SCRAM Authentication
      SASL_MECHANISM: "SCRAM-SHA-512"
      SASL_USERNAME: "${KAFKA_USERNAME}"
      SASL_PASSWORD: "${KAFKA_PASSWORD}"
      
      # SSL/TLS for Kafka
      TLS_CA_FILE: "/etc/ssl/certs/kafka-ca.pem"
      TLS_CERT_FILE: "/etc/ssl/certs/kafka-client.pem"
      TLS_KEY_FILE: "/etc/ssl/private/kafka-client.key"
      TLS_INSECURE_SKIP_VERIFY: "false"
      
      # JMX over SSL
      JMX_SSL: "true"
      JMX_KEYSTORE: "/etc/jmx/keystore.jks"
      JMX_KEYSTORE_PASSWORD: "${JMX_KEYSTORE_PASS}"
      JMX_TRUSTSTORE: "/etc/jmx/truststore.jks"
      JMX_TRUSTSTORE_PASSWORD: "${JMX_TRUSTSTORE_PASS}"
```

### 7.2 Kubernetes Integration
```yaml
# DaemonSet for large clusters
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: nri-kafka-sharded
spec:
  template:
    spec:
      containers:
      - name: nri-kafka
        env:
        - name: SHARD_ID
          valueFrom:
            fieldRef:
              fieldPath: spec.nodeName
        - name: BROKER_FILTER
          value: "broker-$(SHARD_ID)-*"
```

### 7.3 Advanced Metric Calculations
```go
// EWMA (Exponentially Weighted Moving Average) for smoothing
type EWMACalculator struct {
    alpha float64
    value float64
    initialized bool
}

func (e *EWMACalculator) Update(newValue float64) float64 {
    if !e.initialized {
        e.value = newValue
        e.initialized = true
    } else {
        e.value = e.alpha * newValue + (1 - e.alpha) * e.value
    }
    return e.value
}
```

---

## 📈 Your Learning Metrics

Track your progress with these milestones:

- [ ] Can trace any metric from JMX to dashboard
- [ ] Built and deployed a custom OHI extension  
- [ ] Debugged a production issue using two-way navigation
- [ ] Optimized collection for 100+ topics
- [ ] Designed a multi-layer observability dashboard
- [ ] Implemented security hardening
- [ ] Created automation for common issues

## 🎓 Graduation Project

Design and implement a complete Kafka observability platform for a hypothetical e-commerce company with:
- 5 Kafka clusters
- 200+ topics
- 50+ consumer groups
- Multi-region deployment
- Strict security requirements
- SLA monitoring needs

Your design should include:
1. Architecture diagram
2. Metric collection strategy
3. Custom extensions needed
4. Dashboard hierarchy
5. Alert strategy
6. Troubleshooting runbooks

---

## 🚦 Next Steps

You've now got a comprehensive learning path that takes you from understanding basics to architecting solutions. Remember:

1. **Practice daily** - Even 30 minutes of hands-on work compounds quickly
2. **Document everything** - Your future self will thank you
3. **Share your learnings** - Teaching others solidifies your knowledge
4. **Stay curious** - Every production issue is a learning opportunity

Ready to begin? Start with Stage 0 and work your way up. You're not just learning to monitor Kafka - you're learning to think like a systems architect.

**Your journey from map-reader to map-maker starts now!** 🗺️➡️🏗️
