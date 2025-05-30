# Week 1: X-Ray Vision Lab

## 🎯 Objective
Develop complete transparency into how Kafka metrics flow from JMX MBeans through nri-kafka to New Relic.

## 📚 What You'll Learn
- How Kafka exposes metrics via JMX
- How nri-kafka discovers and queries JMX endpoints
- Metric transformation (counters → rates)
- Configuration and filtering
- The complete data flow pipeline

## 🛠️ Lab Environment

### Quick Start
```bash
# Ensure you're in the week1-xray directory
cd ~/qsLab/labs/week1-xray

# Start the complete lab environment
docker-compose up -d

# Verify everything is running
docker-compose ps

# Generate test data
./scripts/generate-traffic.sh
```

### Architecture
```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│  Zookeeper  │────▶│    Kafka    │────▶│   JMX Port   │
│  Port 2181  │     │  Port 9092  │     │  Port 9999   │
└─────────────┘     └─────────────┘     └──────────────┘
                            │
                            ▼
                    ┌──────────────┐     ┌──────────────┐
                    │  nri-kafka   │────▶│  Your Tools  │
                    │              │     │              │
                    └──────────────┘     └──────────────┘
```

## 🔬 Lab Exercises

### Exercise 1: Metric X-Ray (45 minutes) ⭐ START HERE
Trace `broker.messagesInPerSec` from origin to output.
- **File**: [exercise-01-metric-xray.md](exercise-01-metric-xray.md)
- **Goal**: Understand the complete metric journey
- **Skills**: JMX queries, metric transformation, rate calculation
### Exercise 2: JMX Deep Dive (60 minutes)
Explore Kafka's complete JMX MBean hierarchy.
- **File**: [exercise-02-jmx-exploration.md](exercise-02-jmx-exploration.md)
- **Goal**: Master JMX metric discovery
- **Skills**: MBean patterns, metric types, performance analysis

### Exercise 3: Configuration Mastery (45 minutes)
Master nri-kafka configuration options.
- **Status**: Coming soon - see [Enhanced Journey](../../docs/02-advanced/enhanced-learning-journey.md)
- **Goal**: Optimize collection for your needs
- **Skills**: Filtering, performance tuning, security config

### Exercise 4: Build a Metric Tracer (90 minutes)
Create your own tool to trace any metric.
- **Tool**: [metric-tracer.go](../../debugging-toolkit/metric-tracer.go)
- **Goal**: Build deep understanding through creation
- **Skills**: Go programming, JMX interaction, metric calculations

## 📝 Learning Resources

### Foundation Documents
- [Mental Models](../../docs/00-foundation/mental-models.md) - Connect to what you know
- [Core Concepts](../../docs/00-foundation/core-concepts.md) - Kafka observability basics

### Deep Dives
- [NRI-Kafka Architecture](../../docs/01-architecture/nri-kafka-architecture.md)
- [Enhanced Learning Journey](../../docs/02-advanced/enhanced-learning-journey.md)

### Visual References
- [Architecture Diagrams](../../reference-diagrams/README.md)
- Kafka UI: http://localhost:8080 (when environment is running)

## ✅ Week 1 Completion Checklist
- [ ] Environment setup successful
- [ ] Exercise 1: Traced MessagesInPerSec metric
- [ ] Exercise 2: Explored JMX MBean hierarchy
- [ ] Built and tested metric-tracer tool
- [ ] Documented 5+ insights in [LEARNING_LOG.md](../../LEARNING_LOG.md)
- [ ] Updated progress in [PROGRESS.md](../../PROGRESS.md)

## 🚀 Next Week Preview
**Week 2: The Builder** - Create custom metrics and your first OHI extension!
- Build the tombstone monitor
- Create custom dashboards
- Integrate with nri-kafka

## 💡 Tips for Success

1. **Take Notes**: Use [LEARNING_LOG.md](../../LEARNING_LOG.md) actively
2. **Experiment**: Try changing configurations and observe results
3. **Break Things**: Understanding failures deepens knowledge
4. **Ask Questions**: Document uncertainties for research

---

Ready to start? Begin with [Exercise 1: Metric X-Ray](exercise-01-metric-xray.md) →