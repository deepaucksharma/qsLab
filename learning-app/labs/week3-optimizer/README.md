# Week 3: The Optimizer - Lab Environment

This directory contains all the lab materials for Week 3 of the Kafka Observability course, focused on performance optimization and scaling strategies.

## Quick Start

```bash
# Start the 3-broker cluster
docker-compose up -d

# Wait for services to be ready
docker-compose ps

# Run baseline performance tests
./scripts/producer-perf-test.sh

# Monitor performance metrics
./scripts/analyze-broker-metrics.sh
```

## Directory Structure

```
week3-optimizer/
├── docker-compose.yml          # Multi-broker cluster setup
├── README.md                   # This file
├── configs/                    # Configuration files
│   ├── prometheus.yml         # Prometheus configuration
│   ├── jmx-exporter-config.yml
│   └── grafana/               # Grafana dashboards
├── scripts/                    # Performance testing scripts
│   ├── producer-perf-test.sh  # Producer benchmarks
│   ├── consumer-perf-test.sh  # Consumer benchmarks
│   ├── analyze-broker-metrics.sh
│   └── optimize-*.sh          # Various optimization scripts
├── performance-suite/          # Week project output
│   ├── analyzers/            # Performance analysis tools
│   ├── optimizers/           # Optimization scripts
│   └── monitors/             # Monitoring tools
└── exercises/                  # Exercise markdown files
    ├── exercise-01-performance-baselines.md
    ├── exercise-02-bottleneck-identification.md
    ├── exercise-03-optimization-techniques.md
    ├── exercise-04-scaling-strategies.md
    └── exercise-05-week-project.md
```

## Lab Components

### Services

1. **Kafka Brokers (3)** 
   - broker-1 (ports 9092, 39092, 9101)
   - broker-2 (ports 9093, 39093, 9102)
   - broker-3 (ports 9094, 39094, 9103)
   - Configured for performance testing
   - Resource limits applied

2. **Zookeeper** (port 32181)
   - Manages 3-broker cluster
   - Optimized for high connection count

3. **Schema Registry** (port 8081)
   - For Avro performance testing
   - Connected to all brokers

4. **Kafka UI** (port 8080)
   - Visual cluster monitoring
   - Performance metrics display

5. **Prometheus** (port 9090)
   - Metrics collection
   - Performance data storage

6. **Grafana** (port 3000)
   - Performance dashboards
   - Real-time visualization

7. **Load Generator**
   - Performance testing tools
   - Configurable workloads

## Exercises Overview

### Exercise 1: Performance Baselines
- Establish baseline metrics
- Run standardized tests
- Document normal performance

### Exercise 2: Bottleneck Identification
- Systematic bottleneck analysis
- Use multiple monitoring tools
- Create bottleneck reports

### Exercise 3: Optimization Techniques
- Producer optimizations
- Broker tuning
- Consumer improvements
- JVM and network tuning

### Exercise 4: Scaling Strategies
- Partition scaling analysis
- Broker addition simulation
- Consumer scaling patterns
- Capacity planning

### Exercise 5: Performance Optimization Suite
- Build automated analysis tools
- Create optimization scripts
- Develop monitoring dashboard
- Implement continuous optimization

## Common Performance Tests

### Producer Performance Test
```bash
# Basic throughput test
./scripts/producer-perf-test.sh high-throughput 1000000 1024

# Latency-focused test
./scripts/producer-perf-test.sh low-latency 100000 512 10000
```

### Consumer Performance Test
```bash
# Single consumer test
./scripts/consumer-perf-test.sh high-throughput 100000

# Parallel consumer test
./scripts/consumer-perf-test.sh high-throughput 100000 4
```

### Optimization Application
```bash
# Apply broker optimizations
./scripts/optimize-brokers.sh apply

# Test producer configurations
./scripts/optimize-producer.sh

# Scale consumers based on lag
./scripts/consumer-scaling-strategies.sh
```

## Performance Monitoring

### Grafana Dashboards
1. Open http://localhost:3000 (admin/admin)
2. Import provided dashboards
3. Monitor real-time metrics

### Prometheus Queries
Access http://localhost:9090 for raw metrics:
```promql
# Messages per second
rate(kafka_server_BrokerTopicMetrics_MessagesInPerSec_Count[5m])

# Consumer lag
kafka_consumer_lag_sum

# JVM heap usage
java_lang_Memory_HeapMemoryUsage_used
```

### Custom Analysis
```bash
# Comprehensive broker analysis
./scripts/analyze-broker-metrics.sh

# Bottleneck identification
./scripts/generate-bottleneck-report.sh

# Capacity planning
./scripts/capacity-planner.sh
```

## Troubleshooting

### Brokers Not Starting
```bash
# Check logs
docker logs week3-broker-1

# Verify Zookeeper is healthy
docker exec week3-zookeeper zkServer.sh status

# Check resource limits
docker stats
```

### Poor Performance
1. Verify no resource constraints
2. Check network connectivity between brokers
3. Review JVM heap settings
4. Ensure proper topic configuration

### Prometheus/Grafana Issues
```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Verify JMX metrics
docker exec week3-broker-1 jconsole
```

## Best Practices

1. **Baseline First**: Always establish baselines before optimizing
2. **Change One Thing**: Make one optimization at a time
3. **Monitor Impact**: Watch metrics during changes
4. **Document Settings**: Keep track of all configurations
5. **Test Thoroughly**: Validate optimizations under various loads

## Resource Requirements

- **Memory**: 8GB minimum (16GB recommended)
- **CPU**: 4 cores minimum (8 cores recommended)
- **Disk**: 20GB free space
- **Network**: Low latency between containers

## Clean Up

```bash
# Stop all services
docker-compose down

# Remove volumes (warning: deletes all data)
docker-compose down -v

# Clean up test topics
docker exec week3-broker-1 kafka-topics --delete --topic 'test-.*' --bootstrap-server broker-1:9092
```

## Additional Resources

- [Kafka Performance Tuning](https://kafka.apache.org/documentation/#performance)
- [JVM Tuning for Kafka](https://docs.confluent.io/platform/current/kafka/deployment.html#jvm)
- [Monitoring Best Practices](https://www.confluent.io/blog/kafka-monitoring-and-metrics-using-jmx/)
- [Capacity Planning Guide](https://www.confluent.io/blog/kafka-capacity-planning-guide/)