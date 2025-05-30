# 📚 Learning Progress Tracker

## 🎯 Overall Progress: [█░░░░░░░░░] 10%

---

## 📖 Foundation
**Status**: 🟡 In Progress

### Documents Read
- [ ] [README.md](README.md) - Repository overview
- [ ] [QUICK_START.md](QUICK_START.md) - Quick start guide
- [ ] [Mental Models](docs/00-foundation/mental-models.md) - API server → Kafka mapping
- [ ] [Core Concepts](docs/00-foundation/core-concepts.md) - Kafka observability basics
- [ ] [NRI-Kafka Architecture](docs/01-architecture/nri-kafka-architecture.md)

### Key Insights
1. ________________________________
2. ________________________________

---

## 📅 Week 1: X-Ray Vision
**Status**: 🟡 In Progress  
**Started**: _____  
**Target Completion**: _____

### Setup
- [ ] Docker environment running
- [ ] Generated test traffic
- [ ] Accessed Kafka UI (http://localhost:8080)

### Exercises
- [ ] [Exercise 1: Metric X-Ray](labs/week1-xray/exercise-01-metric-xray.md) (45 min)
  - [ ] Traced MessagesInPerSec
  - [ ] Understood counter → rate transformation
  - [ ] Completed bonus challenges
- [ ] [Exercise 2: JMX Deep Dive](labs/week1-xray/exercise-02-jmx-exploration.md) (60 min)
  - [ ] Explored MBean domains
  - [ ] Created MBean inventory
  - [ ] Built multi-metric query script
- [ ] Exercise 3: Configuration Mastery (45 min) - Coming soon
- [ ] Exercise 4: Built [metric-tracer](debugging-toolkit/metric-tracer.go) (90 min)

### Skills Acquired
- [ ] Can query JMX MBeans directly
- [ ] Understand metric transformation logic
- [ ] Can trace any metric end-to-end
- [ ] Built custom tooling
---

## 📅 Week 2: The Builder
**Status**: ⏸️ Not Started  
**Target Start**: _____

### Goals
- [ ] Review [Tombstone Monitor](custom-integrations/tombstone-monitor/main.go) code
- [ ] Build and test tombstone monitor
- [ ] Create first OHI extension
- [ ] Deploy alongside nri-kafka
- [ ] Create custom dashboard

### Preparation
- [ ] Go development environment ready
- [ ] Reviewed [Enhanced Journey Part 2](docs/02-advanced/enhanced-learning-journey-part2.md)

---

## 📅 Week 3: The Optimizer
**Status**: ⏸️ Not Started

### Goals
- [ ] Run 1000-topic stress test
- [ ] Measure performance impact of flags
- [ ] Implement 2+ optimizations
- [ ] Document findings in [performance-reports/](performance-reports/)

---

## 📅 Week 4: The Detective
**Status**: ⏸️ Not Started

### Goals
- [ ] Complete lag spike investigation
- [ ] Debug missing metrics scenario
- [ ] Build performance analyzer
- [ ] Create troubleshooting runbook

---

## 📅 Week 5: The Architect
**Status**: ⏸️ Not Started

### Goals
- [ ] Design complete observability platform
- [ ] Create architecture diagrams
- [ ] Implement one production pattern
- [ ] Present final project

---

## 🎓 Enhanced Deep-Dive Progress

### Part 1: Foundation to Investigation
- [ ] Read [Enhanced Journey Part 1](docs/02-advanced/enhanced-learning-journey.md)
- [ ] Completed mental model exercises
- [ ] Built metric journey map
- [ ] Created investigation notebook

### Part 2: OHI Development
- [ ] Read [Enhanced Journey Part 2](docs/02-advanced/enhanced-learning-journey-part2.md)
- [ ] Studied tombstone monitor code
- [ ] Built custom extension
- [ ] Created correlation dashboards

### Part 3: Production Scenarios
- [ ] Read [Enhanced Journey Part 3](docs/02-advanced/enhanced-learning-journey-part3.md)
- [ ] Completed debugging scenarios
- [ ] Built performance analyzer
- [ ] Designed security hardening

---

## 🏆 Milestones Achieved
- [ ] First metric traced end-to-end
- [ ] First JMX query executed
- [ ] First custom tool built
- [ ] First OHI extension created
- [ ] First production issue debugged
- [ ] Complete platform designed

---

## 📊 Skills Matrix

| Skill | Beginner | Intermediate | Advanced | Expert |
|-------|----------|--------------|----------|---------|
| JMX Queries | [ ] | [ ] | [ ] | [ ] |
| Metric Transformation | [ ] | [ ] | [ ] | [ ] |
| nri-kafka Configuration | [ ] | [ ] | [ ] | [ ] |
| OHI Development | [ ] | [ ] | [ ] | [ ] |
| Performance Tuning | [ ] | [ ] | [ ] | [ ] |
| Debugging | [ ] | [ ] | [ ] | [ ] |
| Architecture Design | [ ] | [ ] | [ ] | [ ] |

---

## 📝 Notes & Reflections
_Use this space for key learnings, questions, and insights_

---

**Last Updated**: _____