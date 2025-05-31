# Understanding the Feature-Flagged Metrics Collection PR by dsankaraganti

## Table of Contents
1. [Introduction for Beginners](#introduction-for-beginners)
2. [What is nri-kafka?](#what-is-nri-kafka)
3. [Understanding the Problem](#understanding-the-problem)
4. [The Solution: Feature Flags](#the-solution-feature-flags)
5. [Detailed Changes Walkthrough](#detailed-changes-walkthrough)
6. [How Everything Works Together](#how-everything-works-together)
7. [Testing and Validation](#testing-and-validation)
8. [How to Use These Changes](#how-to-use-these-changes)
9. [Impact and Benefits](#impact-and-benefits)

## Introduction for Beginners

If you're new to this repository, this document will help you understand a significant change made by dsankaraganti to improve how the New Relic Kafka integration collects metrics. We'll start with the basics and gradually dive into the technical details.

## What is nri-kafka?

### Repository Overview
- **Name**: nri-kafka (New Relic Infrastructure - Kafka)
- **Purpose**: A monitoring integration that collects performance metrics from Apache Kafka clusters
- **Language**: Written in Go (Golang)
- **What it does**: 
  - Connects to Kafka brokers (servers)
  - Collects metrics via JMX (Java Management Extensions)
  - Sends these metrics to New Relic for monitoring and alerting

### Key Concepts You Need to Know

#### Apache Kafka
- A distributed streaming platform used for building real-time data pipelines
- **Brokers**: Servers that store and serve data
- **Topics**: Categories where messages are published (like channels)
- **Partitions**: Topics are split into partitions for scalability
- **Controller**: One broker that manages the cluster state

#### JMX (Java Management Extensions)
- A Java technology that provides tools for managing and monitoring applications
- Kafka exposes metrics through JMX that tools like nri-kafka can collect

#### Metrics
- Measurements of system performance (e.g., messages per second, bytes transferred)
- Used to monitor health, detect issues, and optimize performance

## Understanding the Problem

### The Challenge
Before this PR, the nri-kafka integration had a fixed set of metrics it collected. This created several issues:

1. **All or Nothing**: You couldn't choose which metrics to collect
2. **Performance Impact**: Adding new metrics affected all users, even those who didn't need them
3. **Deployment Risk**: New metrics could potentially break existing installations
4. **Limited Flexibility**: No way to gradually roll out new monitoring capabilities

### Real-World Example
Imagine you're monitoring a Kafka cluster with 1000 topics. If the integration suddenly starts collecting 2 new metrics per topic, that's 2000 additional data points being collected and sent every interval. This could:
- Increase network traffic
- Use more CPU/memory
- Cost more (cloud monitoring charges by data volume)
- Potentially timeout or fail if the system can't handle the load

## The Solution: Feature Flags

### What is a Feature Flag?
A feature flag is like a switch that can turn features on or off without changing code. Think of it like a light switch - the wiring (code) is always there, but you control whether the light (feature) is on or off.

### How This PR Implements Feature Flags

The PR introduces a new command-line option: `--enable_broker_topic_metrics_v2`

- **Default (OFF)**: The integration works exactly as before
- **When ON**: Additional metrics are collected

This gives users control over what metrics they want to collect.

## Detailed Changes Walkthrough

### The Three-Commit Journey

This PR was developed in three stages, each building on the previous:

#### Stage 1: Adding New Metrics (Commit 7f04d35)
**Date**: April 3, 2025  
**What happened**: Initial implementation of controller metrics

**New Metrics Added**:
1. **ActiveControllerCount**: 
   - What it measures: Is this broker the controller?
   - Values: 1 (yes) or 0 (no)
   - Why it matters: Only one broker should be the controller at a time

2. **GlobalPartitionCount**:
   - What it measures: Total number of partitions in the entire cluster
   - Why it matters: Helps track cluster growth and partition distribution

**Code Changes Explained**:
```go
// Before: No controller metrics

// After: Added to broker_definitions.go
{
    MBean: "kafka.controller:type=KafkaController,name=*",
    MetricDefs: []*MetricDefinition{
        {
            Name: "broker.ActiveControllerCount",
            SourceType: metric.GAUGE,  // GAUGE means current value
            JMXAttr: "name=ActiveControllerCount,attr=Value",
        },
    },
}
```

The code tells the system:
- Where to find the metric in JMX (`MBean`)
- What to call it in New Relic (`Name`)
- How to collect it (`SourceType`)

#### Stage 2: Expanding Topic Metrics (Commit a75028d)
**Date**: April 28, 2025  
**What happened**: Added per-topic traffic metrics and fixed naming issues

**New Metrics Added**:
1. **bytesReadFromTopicPerSecond**:
   - What it measures: How fast consumers are reading data from each topic
   - Use case: Identify popular topics or detect consumer lag

2. **messagesProducedToTopicPerSecond**:
   - What it measures: How many messages are being written to each topic
   - Use case: Track producer activity and topic usage patterns

**Why These Matter**:
- If you have a topic receiving 1 million messages/second but only 100,000 are being read, you might have a consumer problem
- You can identify which topics are most active and need more resources

#### Stage 3: Making it Configurable (Commit f5fa90a)
**Date**: May 7, 2025  
**What happened**: Implemented the feature flag system

**Key Components**:

1. **Command Line Argument** (`args.go`):
```go
EnableBrokerTopicMetricsV2 bool `default:"false" help:"Enable the new BrokerTopicMetrics metrics..."`
```
This adds a new option users can specify when running the integration.

2. **Conditional Logic** (`metrics.go`):
```go
func GetFinalMetricSets(metricSets []*JMXMetricSet, v2MetricSets []*JMXMetricSet) []*JMXMetricSet {
    // Always include base metrics
    finalMetricSets := append(finalMetricSets, metricSets...)
    
    // Only add v2 metrics if flag is enabled
    if args.GlobalArgs.EnableBrokerTopicMetricsV2 {
        finalMetricSets = append(finalMetricSets, v2MetricSets...)
    }
    
    return finalMetricSets
}
```

3. **Metric Organization**:
- **V1 Metrics** (`brokerMetricDefs`): Original metrics, always collected
- **V2 Metrics** (`BrokerV2MetricDefs`): New metrics, only collected if flag is on

## How Everything Works Together

### The Flow of Metric Collection

1. **Startup**:
   ```
   User runs: ./nri-kafka --enable_broker_topic_metrics_v2
   ↓
   ParseArgs() reads the flag
   ↓
   Sets EnableBrokerTopicMetricsV2 = true
   ```

2. **Metric Collection**:
   ```
   GetBrokerMetrics() is called
   ↓
   Calls GetFinalMetricSets(v1_metrics, v2_metrics)
   ↓
   If flag is true: Returns v1 + v2 metrics
   If flag is false: Returns only v1 metrics
   ↓
   CollectMetricDefinitions() gathers the selected metrics
   ```

3. **Data Flow**:
   ```
   JMX (Kafka) → nri-kafka → New Relic Platform
   ```

### File Structure and Responsibilities

```
src/
├── args/
│   ├── args.go              # Defines command-line arguments
│   └── parsed_args.go       # Processes and validates arguments
├── metrics/
│   ├── broker_definitions.go # Defines which metrics to collect
│   └── metrics.go           # Logic for collecting metrics
├── broker/
│   └── broker_collection.go # Broker-specific collection logic
└── topic/
    └── topic_collection.go  # Topic-specific collection logic
```

## Testing and Validation

### Integration Tests
The PR includes tests that verify:
1. Metrics are NOT collected when flag is false
2. Metrics ARE collected when flag is true
3. Existing functionality isn't broken

### Test Files Modified
- `kafka_test.go`: Added tests for the new flag
- `kafka-schema-metrics-v2.json`: Defines expected structure of v2 metrics
- Ensures backward compatibility

### How to Verify It's Working
1. Check logs for: `"Processing new BrokerTopic metrics flag is : true"`
2. Look for new metrics in New Relic:
   - `broker.ActiveControllerCount`
   - `broker.GlobalPartitionCount`
   - `broker.bytesReadFromTopicPerSecond`
   - `broker.messagesProducedToTopicPerSecond`

## How to Use These Changes

### For System Administrators

#### Basic Usage
```bash
# Old way (still works, no v2 metrics)
./nri-kafka

# New way (with v2 metrics)
./nri-kafka --enable_broker_topic_metrics_v2
```

#### In Configuration Files
```yaml
# kafka-config.yml
integration_name: com.newrelic.kafka

instances:
  - name: kafka-broker-metrics
    command: metrics
    arguments:
      enable_broker_topic_metrics_v2: true  # Add this line
      # ... other settings
```

### For Developers

#### Adding New Metrics in the Future
1. Decide if it should be v1 (always on) or v2 (optional)
2. Add to appropriate definition array
3. Test with flag on and off
4. Document the new metric

#### Example of Adding a New V2 Metric
```go
// In broker_definitions.go
var BrokerV2MetricDefs = []*JMXMetricSet{
    // ... existing metrics
    {
        MBean: "kafka.server:type=YourNewMetric",
        MetricDefs: []*MetricDefinition{
            {
                Name: "broker.yourNewMetric",
                SourceType: metric.GAUGE,
                JMXAttr: "attr=Value",
            },
        },
    },
}
```

## Impact and Benefits

### For Operations Teams
1. **Gradual Rollout**: Test new metrics in dev before production
2. **Performance Control**: Only enable expensive metrics where needed
3. **Cost Management**: Control monitoring data volume and costs

### For the Kafka Ecosystem
1. **Better Visibility**: More detailed metrics when you need them
2. **Flexibility**: Different teams can choose different metric sets
3. **Future-Proof**: Easy to add new metrics without breaking changes

### Best Practices
1. **Start Small**: Enable v2 metrics on one broker first
2. **Monitor Impact**: Watch CPU, memory, and network usage
3. **Document Decisions**: Record why you enabled/disabled v2 metrics
4. **Regular Review**: Periodically assess if you need all metrics

## Common Questions

### Q: Will this break my existing setup?
A: No. Without the flag, everything works exactly as before.

### Q: How much overhead do v2 metrics add?
A: Depends on your cluster size. With 100 topics, expect ~200 additional metrics per broker.

### Q: Can I enable this for specific brokers only?
A: Yes. The flag is per-instance, so you can run different brokers with different settings.

### Q: What happens if I enable it then disable it?
A: Metric collection stops, but historical data remains in New Relic.

## Conclusion

This PR represents a thoughtful approach to evolving monitoring capabilities. By introducing feature flags, it:
- Maintains backward compatibility
- Gives users control
- Allows safe testing of new features
- Sets a pattern for future enhancements

The implementation demonstrates good software engineering practices:
- Clear separation of concerns
- Comprehensive testing
- Detailed logging
- User-friendly configuration

For someone new to the repository, this serves as an excellent example of how to add new features while respecting existing users and maintaining system stability.
