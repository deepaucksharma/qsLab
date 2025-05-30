# Kafka Observability Mastery Course
## From Map-Reader to Map-Maker with New Relic

### Course Overview
A comprehensive 5-week journey that transforms you from a consumer of Kafka dashboards to an architect of observability solutions. This course combines theoretical foundations with hands-on labs, real-world scenarios, and production-grade patterns.

### Target Audience
- Platform engineers responsible for Kafka infrastructure
- SREs managing Kafka in production
- DevOps engineers implementing Kafka observability
- Solution architects designing monitoring strategies

### Prerequisites
- Basic understanding of distributed systems
- Familiarity with Docker and containers
- Experience with any APM tool (New Relic preferred)
- Basic programming knowledge (Go helpful but not required)

### Pre-Course Setup
Before starting Week 1, complete the [New Relic Infrastructure Agent Setup Guide](docs/setup/new-relic-agent-setup.md) to ensure your monitoring environment is ready for the hands-on labs.

### Course Structure

## Week 1: X-Ray Vision - Metric Anatomy & Tracing
**Theme**: Understanding the internals of Kafka monitoring

### Day 1: Foundation & Mental Models
- **Module 1.1**: From API Monitoring to Kafka Monitoring
  - Mapping familiar concepts to Kafka equivalents
  - Understanding the three pillars: Infrastructure, Broker, Application
  - Mental model exercises and calibration
  
### Day 2: Metric Collection Deep Dive
- **Module 1.2**: JMX and the 3000 Metrics
  - JMX protocol fundamentals
  - Navigating MBean hierarchies
  - Key metric categories and their significance
  
### Day 3: NRI-Kafka Architecture
- **Module 1.3**: How New Relic Collects Kafka Metrics
  - Discovery mechanisms
  - Collection modes and data flow
  - Security and performance considerations

### Day 4-5: Hands-On Lab
- **Lab 1**: Metric X-Ray Exercise
  - Trace a metric from JMX to dashboard
  - Use JMXTerm for exploration
  - Build mental map of metric flow
  
### Week 1 Deliverable
- Complete metric trace documentation
- JMX exploration findings report

## Week 2: The Builder - Custom Metrics & Extensions
**Theme**: Creating custom monitoring solutions

### Day 1: Beyond Standard Metrics
- **Module 2.1**: Identifying Monitoring Gaps
  - Common missing metrics scenarios
  - Business-specific monitoring needs
  - Custom metric design patterns

### Day 2: OHI Development
- **Module 2.2**: Building Custom Integrations
  - New Relic OHI framework
  - Go development basics for monitoring
  - Integration with Infrastructure agent

### Day 3: Advanced Collection Methods
- **Module 2.3**: Alternative Data Sources
  - Kafka Admin API usage
  - Consumer group monitoring
  - Log-based metric extraction

### Day 4-5: Hands-On Lab
- **Lab 2**: Tombstone Monitor Implementation
  - Build custom tombstone detector
  - Package as OHI
  - Deploy and test in lab environment

### Week 2 Deliverable
- Working custom integration
- Integration deployment guide

## Week 3: The Optimizer - Performance & Efficiency
**Theme**: Optimizing monitoring performance and costs

### Day 1: Performance Architecture
- **Module 3.1**: Monitoring at Scale
  - Worker pools and connection management
  - Circuit breakers and backpressure
  - Resource optimization strategies

### Day 2: Configuration Tuning
- **Module 3.2**: Flag Experiments
  - Scientific approach to configuration
  - A/B testing monitoring changes
  - Performance impact analysis

### Day 3: Cost Optimization
- **Module 3.3**: Efficient Monitoring
  - Metric cardinality management
  - Sampling strategies
  - Data retention optimization

### Day 4-5: Hands-On Lab
- **Lab 3**: Performance Optimization Challenge
  - Optimize high-volume cluster monitoring
  - Implement sampling strategies
  - Measure performance improvements

### Week 3 Deliverable
- Performance optimization report
- Configuration recommendations

## Week 4: The Detective - Production Debugging
**Theme**: Solving real-world problems

### Day 1: Debugging Methodology
- **Module 4.1**: Systematic Problem Solving
  - The observer effect in monitoring
  - Correlation vs causation
  - Building debugging runbooks

### Day 2: Common Production Issues
- **Module 4.2**: Pattern Recognition
  - Consumer lag scenarios
  - Partition imbalance detection
  - Network partition impacts

### Day 3: Advanced Troubleshooting
- **Module 4.3**: Deep Dive Techniques
  - Thread dump analysis
  - GC impact on metrics
  - Cross-correlation techniques

### Day 4-5: Hands-On Lab
- **Lab 4**: Production Mystery Scenarios
  - Solve 5 real-world debugging challenges
  - Use custom tools and standard metrics
  - Document investigation process

### Week 4 Deliverable
- Debugging playbook
- Tool usage documentation

## Week 5: The Architect - Platform Design
**Theme**: Designing comprehensive observability solutions

### Day 1: Architecture Patterns
- **Module 5.1**: Enterprise Monitoring Design
  - Multi-cluster strategies
  - Federated monitoring
  - Disaster recovery considerations

### Day 2: Integration Ecosystem
- **Module 5.2**: Full Stack Observability
  - APM integration patterns
  - Log correlation strategies
  - Distributed tracing with Kafka

### Day 3: Automation & Operations
- **Module 5.3**: Operational Excellence
  - Automated remediation patterns
  - Capacity planning models
  - SLO/SLI implementation

### Day 4-5: Graduation Project
- **Lab 5**: Design Complete Solution
  - Architecture design document
  - Implementation prototype
  - Presentation preparation

### Week 5 Deliverable
- Complete architecture design
- Implementation showcase

## Course Resources

### Technical Prerequisites
- Docker Desktop or Linux with Docker
- New Relic account (trial acceptable)
- Git and basic CLI tools
- 8GB RAM minimum for labs

### Provided Materials
- All lab environments via Docker Compose
- Custom integration source code
- Configuration templates
- Reference architecture diagrams
- Troubleshooting decision trees

### Assessment Approach
- Weekly practical deliverables
- Peer review of solutions
- Final architecture presentation
- Knowledge validation quizzes

### Certification Path
Upon completion, participants will:
- Receive completion certificate
- Portfolio of production-ready solutions
- Access to alumni community
- Ongoing pattern library updates

### Support Resources
- Slack community channel
- Weekly office hours
- Recorded solution walkthroughs
- Production pattern library access

## Learning Outcomes
By course completion, you will be able to:
1. Design comprehensive Kafka monitoring solutions
2. Build custom monitoring integrations
3. Optimize monitoring performance and costs
4. Debug complex production issues systematically
5. Architect enterprise-scale observability platforms
6. Implement production-grade monitoring patterns

## Next Steps
1. Complete pre-course assessment
2. Set up development environment
3. Join course Slack channel
4. Review Week 1 pre-reading materials