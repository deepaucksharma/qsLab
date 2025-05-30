# Week 2: The Builder - Custom Metrics & OHI Extensions

## 🎯 This Week's Mission

Transform from metric consumer to metric creator by building custom observability solutions for Kafka.

## 📚 Learning Objectives

By the end of this week, you will:
- ✅ Create custom metrics not available in standard integrations
- ✅ Build your first On-Host Integration (OHI)
- ✅ Understand the OHI SDK architecture
- ✅ Deploy custom integrations with New Relic Infrastructure
- ✅ Compare Flex vs custom integration approaches

## 🗓️ Week Structure

### Day 1-2: Understanding Custom Metrics
- Why custom metrics matter
- Identifying monitoring gaps
- Planning your integration

### Day 3-4: Building the Tombstone Monitor
- Understanding tombstones in Kafka
- Implementing the monitor
- Testing and debugging

### Day 5: Deployment and Alternatives
- Deploying with Infrastructure agent
- Exploring New Relic Flex
- Comparing approaches

## 🛠️ Hands-On Labs

### Lab 1: Identify Missing Metrics
**Duration**: 1 hour  
**Goal**: Analyze your Kafka cluster and identify metrics not covered by nri-kafka

[Start Lab 1 →](exercise-01-missing-metrics.md)

### Lab 2: Build Tombstone Monitor
**Duration**: 2 hours  
**Goal**: Implement a custom integration to track tombstone messages

[Start Lab 2 →](exercise-02-tombstone-monitor.md)

### Lab 3: Flex Alternative
**Duration**: 1 hour  
**Goal**: Implement the same metrics using New Relic Flex

[Start Lab 3 →](exercise-03-flex-alternative.md)

## 📖 Required Reading

1. [OHI SDK Documentation](https://github.com/newrelic/infra-integrations-sdk)
2. [New Relic Flex Guide](../../docs/02-advanced/new-relic-flex-guide.md)
3. [Enhanced Journey Part 2](../../docs/02-advanced/enhanced-learning-journey-part2.md)

## 🎯 Week 2 Deliverables

By the end of this week, you should have:
1. ✅ A working custom integration (tombstone monitor)
2. ✅ The same metrics collected via Flex
3. ✅ Comparison document of both approaches
4. ✅ Your integration running in New Relic

## 🚀 Getting Started

```bash
# Ensure Week 1 environment is running
cd ../week1-xray
docker-compose up -d

# Navigate to Week 2
cd ../week2-builder

# Review the tombstone monitor code
cat ../../custom-integrations/tombstone-monitor/main.go
```

## 💡 Pro Tips

- Start simple - get one metric working first
- Use debug logging liberally
- Test locally before deploying
- Document your custom metrics

## 🤔 This Week's Challenge

Can you create a custom integration that tracks:
- Message compression ratios
- Partition skew metrics
- Producer connection counts
- Consumer rebalance frequency

Choose one and implement it!

## 📊 Success Criteria

You know you've mastered this week when you can:
- Explain when to build custom vs use Flex
- Debug integration issues independently
- Design metrics for specific use cases
- Deploy and monitor custom integrations

Ready to become a builder? Let's start! 🚀
