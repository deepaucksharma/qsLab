# Week 1: X-Ray Vision Lab

## 🎯 Objective
Develop complete transparency into how Kafka metrics flow from JMX MBeans through nri-kafka to New Relic.

## 📚 What You'll Learn
- How Kafka exposes metrics via JMX
- How nri-kafka discovers and queries JMX endpoints
- Metric transformation (counters → rates)
- Configuration and filtering
- The complete data flow pipeline

## 🛠️ Lab Exercises

### Exercise 1: Metric X-Ray (45 minutes)
Trace `broker.messagesInPerSec` from origin to output.
- [Start Here →](exercise-01-metric-xray.md)

### Exercise 2: JMX Deep Dive (60 minutes)
Explore Kafka's JMX MBean hierarchy.
- [Exercise Guide](exercise-02-jmx-exploration.md)

### Exercise 3: Configuration Mastery (45 minutes)
Master nri-kafka configuration options.
- [Exercise Guide](exercise-03-configuration.md)

### Exercise 4: Build a Metric Tracer (90 minutes)
Create your own tool to trace any metric.
- [Exercise Guide](exercise-04-metric-tracer.md)

## 🏗️ Lab Environment

### Quick Start
```bash
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
                    ┌──────────────┐
                    │  nri-kafka   │
                    │              │
                    └──────────────┘
```

## 📝 Learning Log Template

After each exercise, record:
```markdown
## Exercise: [Name]
Date: ___

### Key Discovery:
- 

### Surprise:
- 

### Question for Next Time:
- 

### Code/Command That Clicked:
```
```

## ✅ Week 1 Checklist
- [ ] Set up Docker environment
- [ ] Complete Exercise 1: Metric X-Ray
- [ ] Complete Exercise 2: JMX Deep Dive
- [ ] Complete Exercise 3: Configuration Mastery
- [ ] Complete Exercise 4: Build Metric Tracer
- [ ] Document 5+ insights in learning log
- [ ] Prepare questions for Week 2

## 🚀 Next Week Preview
Week 2: The Builder - Create custom metrics and your first OHI extension!
