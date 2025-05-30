# Week 1: X-Ray Vision - See Through Kafka's Complexity

> **Mission**: Develop the ability to trace any metric from its origin in Kafka through collection, transformation, and visualization in New Relic.

## Learning Objectives

By the end of this week, you will:
- ✅ Understand the complete metric journey from JMX to dashboard
- ✅ Master JMX exploration and metric discovery
- ✅ Build custom metric tracers
- ✅ Create comprehensive visibility dashboards
- ✅ Debug common collection issues

## Prerequisites

- Complete [Prerequisites Check](../00-overview/prerequisites.md)
- Finish [Quick Start Setup](../00-overview/quick-start.md)
- Have New Relic account ready

## Day 1-2: Anatomy Tour

### The Metric Journey Map

Let's trace how a single metric travels through the system:

```bash
# Navigate to Week 1 lab
cd ~/qsLab/labs/week1-xray
docker-compose up -d

# Create investigation notebook
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

### Hands-On: Origin Investigation

**Exercise 1: See the Raw Counter**

```bash
# Access JMX directly
docker exec -it kafka-xray-jmxterm java -jar /jmxterm.jar << 'EOF'
open localhost:9999
get -b kafka.server:type=BrokerTopicMetrics,name=MessagesInPerSec Count
EOF

# Record value: ______
sleep 10

# Check again and calculate rate
# Record value: ______
# Calculate: (Value2 - Value1) / 10 = _____ msgs/sec
```

**Exercise 2: Code Archaeology**

```bash
# Clone nri-kafka source
git clone https://github.com/newrelic/nri-kafka.git ~/kafka-code-study
cd ~/kafka-code-study

# Find metric definition
grep -r "messagesInPerSec" src/

# Study the transformation
cat src/metrics/broker_definitions.go | grep -A5 -B5 "MessagesInPerSec"
```

### Build Your Own Tracer

Create a custom tool to trace any metric:

```go
// ~/qsLab/debugging-toolkit/metric-tracer.go
package main

import (
    "fmt"
    "log"
    "os"
    "os/exec"
    "strings"
    "time"
)

func main() {
    if len(os.Args) < 2 {
        log.Fatal("Usage: metric-tracer <mbean-name>")
    }
    
    mbean := os.Args[1]
    interval := 10 * time.Second
    
    fmt.Printf("Tracing metric: %s\n", mbean)
    fmt.Println("Press Ctrl+C to stop")
    
    var previousValue float64
    firstRun := true
    
    for {
        value := queryJMX(mbean)
        if value == -1 {
            log.Println("Failed to query JMX")
            continue
        }
        
        if !firstRun {
            rate := (value - previousValue) / interval.Seconds()
            fmt.Printf("[%s] Value: %.2f | Rate: %.2f/sec\n", 
                time.Now().Format("15:04:05"), value, rate)
        } else {
            fmt.Printf("[%s] Initial Value: %.2f\n", 
                time.Now().Format("15:04:05"), value)
            firstRun = false
        }
        
        previousValue = value
        time.Sleep(interval)
    }
}

func queryJMX(mbean string) float64 {
    cmd := exec.Command("docker", "exec", "kafka-xray", 
        "java", "-jar", "/jmxterm.jar", "-n", "-v", "silent")
    
    input := fmt.Sprintf("open localhost:9999\nget -b %s Count\n", mbean)
    cmd.Stdin = strings.NewReader(input)
    
    output, err := cmd.Output()
    if err != nil {
        return -1
    }
    
    var value float64
    fmt.Sscanf(string(output), "%f", &value)
    return value
}
```

## Day 3-4: Deep Exploration

### JMX Safari

**Exercise 3: Discover All Available Metrics**

```bash
# List all Kafka MBeans
docker exec -it kafka-xray java -jar /jmxterm.jar << 'EOF'
open localhost:9999
domains
domain kafka.server
beans
EOF > investigations/all-mbeans.txt

# Find interesting metrics
grep -E "RequestsPerSec|MessagesInPerSec|BytesInPerSec|UnderReplicated" investigations/all-mbeans.txt
```

**Exercise 4: Consumer Group Investigation**

```bash
# Create a test consumer
docker exec -it kafka-xray kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic test-topic \
  --group test-consumer-group \
  --from-beginning &

# Check consumer metrics via Admin API
docker exec -it kafka-xray kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --group test-consumer-group \
  --describe
```

### Validation Exercises

1. **Trace 3 Different Metrics**:
```bash
# Build the tracer
cd ~/qsLab/debugging-toolkit
go build metric-tracer.go

# Trace different metrics
./metric-tracer "kafka.server:type=BrokerTopicMetrics,name=BytesInPerSec"
./metric-tracer "kafka.server:type=BrokerTopicMetrics,name=BytesOutPerSec"
./metric-tracer "kafka.server:type=BrokerTopicMetrics,name=FailedFetchRequestsPerSec"
```

2. **Compare with nri-kafka**:
```bash
# Run nri-kafka manually
docker run --rm --network host \
  -v ${PWD}/configs/kafka-config.yml:/etc/newrelic-infra/integrations.d/kafka-config.yml \
  newrelic/nri-kafka:latest \
  --metrics --pretty > investigations/nri-output.json

# Extract specific metrics
jq '.[] | .metrics[] | select(.event_type=="KafkaBrokerSample") | {
  messagesIn: .["broker.messagesInPerSec"],
  bytesIn: .["broker.bytesInPerSec"],
  bytesOut: .["broker.bytesOutPerSec"]
}' investigations/nri-output.json
```

## Day 5: Production Patterns

### Create Your X-Ray Dashboard

Build a comprehensive dashboard that shows the metric journey:

```sql
-- Widget 1: Metric Collection Health
SELECT count(*) AS 'Metrics Collected',
       uniqueCount(metricName) AS 'Unique Metrics',
       latest(timestamp) AS 'Last Collection'
FROM KafkaBrokerSample
SINCE 5 minutes ago

-- Widget 2: JMX → Rate Transformation
SELECT average(broker.messagesInPerSec) AS 'Calculated Rate',
       sum(broker.messagesInTotal) AS 'Total Messages'
FROM KafkaBrokerSample
TIMESERIES SINCE 1 hour

-- Widget 3: Collection Latency
SELECT average(duration.ms) AS 'Collection Duration'
FROM IntegrationSample
WHERE integration.name = 'com.newrelic.kafka'
TIMESERIES SINCE 1 hour

-- Widget 4: End-to-End Visibility
SELECT rate(sum(broker.messagesInPerSec), 1 minute) AS 'Incoming Rate',
       average(consumer.lag) AS 'Consumer Lag',
       count(*) AS 'Active Brokers'
FROM KafkaBrokerSample, KafkaConsumerSample
TIMESERIES SINCE 2 hours
```

### Debug Common Issues

**Issue 1: Missing Metrics**
```bash
# Debug checklist
./debugging-toolkit/missing-metrics-investigator.sh 1 9999
```

**Issue 2: Stale Data**
```sql
-- Check data freshness
SELECT latest(timestamp) AS 'Last Update',
       now() - latest(timestamp) AS 'Age (seconds)'
FROM KafkaBrokerSample
FACET entityName
```

## Week 1 Assessment

### Knowledge Check
Can you answer these questions?
- [ ] What's the difference between a counter and a gauge in JMX?
- [ ] How does nri-kafka convert counters to rates?
- [ ] What port does JMX typically use for Kafka?
- [ ] How often does nri-kafka collect metrics by default?
- [ ] What's the data flow from Kafka to New Relic dashboard?

### Practical Skills
Complete these tasks:
- [ ] Trace a metric from JMX to NRQL query
- [ ] Build a custom metric collection script
- [ ] Create a dashboard showing metric journey
- [ ] Debug a missing metric issue
- [ ] Explain the transformation of MessagesInPerSec

## Week 1 Project

Build a "Metric X-Ray" tool that:
1. Takes any Kafka metric name as input
2. Shows its current JMX value
3. Demonstrates how nri-kafka transforms it
4. Provides the NRQL query to visualize it
5. Creates a mini-dashboard for that specific metric

## Resources

- [JMX Documentation](https://docs.oracle.com/javase/tutorial/jmx/)
- [nri-kafka Source Code](https://github.com/newrelic/nri-kafka)
- [NRQL Reference](https://docs.newrelic.com/docs/query-your-data/nrql-new-relic-query-language/)

## Next Week Preview

In [Week 2: Metric Builder](week2-builder.md), you'll learn to:
- Create custom metrics that don't exist
- Build production-grade OHI extensions
- Integrate with the Kafka Admin API
- Design composite metrics

Ready to see through Kafka's complexity? You've got X-Ray vision now! 🔍