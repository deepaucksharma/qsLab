# Kafka Observability Checklist

A comprehensive checklist to ensure your Kafka monitoring is production-ready.

## 🚀 Pre-Deployment Checklist

### Infrastructure Setup
- [ ] **New Relic Account**
  - [ ] License key obtained
  - [ ] Appropriate subscription level
  - [ ] User permissions configured
  
- [ ] **Infrastructure Agent**
  - [ ] Latest version installed
  - [ ] Running on all Kafka hosts
  - [ ] Logs forwarding enabled
  - [ ] Custom attributes configured

- [ ] **nri-kafka Integration**
  - [ ] Latest version deployed
  - [ ] Configuration validated
  - [ ] JMX connectivity verified
  - [ ] Consumer groups configured

### Kafka Configuration
- [ ] **JMX Enabled**
  - [ ] JMX port configured (9999)
  - [ ] JMX authentication (if required)
  - [ ] Firewall rules updated
  - [ ] SSL/TLS configured (if needed)

- [ ] **Broker Settings**
  - [ ] Monitoring-friendly retention
  - [ ] Appropriate log levels
  - [ ] Metrics reporters configured
  - [ ] Resource limits set

## 📊 Metrics Collection Checklist

### Essential Metrics
- [ ] **Broker Metrics**
  - [ ] `broker.messagesInPerSec` - Message rate
  - [ ] `broker.bytesInPerSec` - Data rate
  - [ ] `broker.underReplicatedPartitions` - Replication health
  - [ ] `broker.activeControllerCount` - Controller status
  - [ ] `broker.offlinePartitionsCount` - Partition availability

- [ ] **Topic Metrics**
  - [ ] `topic.messagesInPerSec` - Per-topic rate
  - [ ] `topic.bytesInPerSec` - Per-topic throughput
  - [ ] `topic.logSize` - Storage usage
  - [ ] `topic.logEndOffset` - Latest offset

- [ ] **Consumer Metrics**
  - [ ] `consumer.lag` - Consumer lag
  - [ ] `consumer.fetchLatencyAvg` - Fetch performance
  - [ ] `consumer.recordsConsumedRate` - Consumption rate
  - [ ] `consumer.committedOffset` - Progress tracking

- [ ] **Infrastructure Metrics**
  - [ ] CPU utilization
  - [ ] Memory usage
  - [ ] Disk I/O and usage
  - [ ] Network throughput
  - [ ] JVM heap and GC

### Advanced Metrics
- [ ] **Request Metrics**
  - [ ] Produce request latency
  - [ ] Fetch request latency
  - [ ] Request queue size
  - [ ] Network thread utilization

- [ ] **Replication Metrics**
  - [ ] ISR shrink/expand rate
  - [ ] Leader election rate
  - [ ] Fetch lag metrics
  - [ ] Log replication latency

- [ ] **Client Metrics**
  - [ ] Connection count
  - [ ] Request rate by client
  - [ ] Error rates by client
  - [ ] Client version distribution

## 🎯 Dashboard Checklist

### Essential Dashboards
- [ ] **Cluster Overview**
  - [ ] Health score widget
  - [ ] Broker status table
  - [ ] Message flow chart
  - [ ] Critical alerts summary

- [ ] **Performance Dashboard**
  - [ ] Throughput trends
  - [ ] Latency percentiles
  - [ ] Resource utilization
  - [ ] Top topics by activity

- [ ] **Consumer Dashboard**
  - [ ] Lag by consumer group
  - [ ] Consumption rates
  - [ ] Rebalance activity
  - [ ] Consumer errors

- [ ] **Infrastructure Dashboard**
  - [ ] CPU/Memory/Disk usage
  - [ ] Network utilization
  - [ ] JVM performance
  - [ ] Correlation charts

### Dashboard Best Practices
- [ ] Clear naming conventions
- [ ] Appropriate time ranges
- [ ] Threshold indicators
- [ ] Mobile-responsive design
- [ ] Export/sharing configured

## 🚨 Alerting Checklist

### Critical Alerts
- [ ] **Availability**
  - [ ] Broker down
  - [ ] Controller missing
  - [ ] Offline partitions > 0
  - [ ] Under-replicated partitions > 0

- [ ] **Performance**
  - [ ] Consumer lag > threshold
  - [ ] Request latency > SLO
  - [ ] Disk usage > 85%
  - [ ] Producer/Fetch errors spike

- [ ] **Capacity**
  - [ ] Disk space < 10% free
  - [ ] Network saturation
  - [ ] File descriptor exhaustion
  - [ ] Connection limit approaching

### Alert Configuration
- [ ] Severity levels defined
- [ ] Notification channels configured
- [ ] Escalation policies set
- [ ] Runbooks linked
- [ ] Alert fatigue prevention

## 🔧 Operational Checklist

### Monitoring Processes
- [ ] **Regular Reviews**
  - [ ] Weekly metric review
  - [ ] Monthly capacity planning
  - [ ] Quarterly optimization
  - [ ] Annual architecture review

- [ ] **Documentation**
  - [ ] Monitoring architecture documented
  - [ ] Runbooks up to date
  - [ ] Dashboard guide created
  - [ ] Alert response procedures

- [ ] **Testing**
  - [ ] Failover scenarios tested
  - [ ] Alert testing scheduled
  - [ ] Load testing metrics validated
  - [ ] Disaster recovery verified

### Team Readiness
- [ ] On-call rotation established
- [ ] Team trained on dashboards
- [ ] Runbooks accessible
- [ ] Escalation paths clear
- [ ] Regular drills conducted

## 🔍 Troubleshooting Checklist

### Common Issues
- [ ] **No Data Appearing**
  - [ ] License key valid
  - [ ] Network connectivity verified
  - [ ] JMX port accessible
  - [ ] Integration logs checked

- [ ] **Incomplete Metrics**
  - [ ] All brokers discovered
  - [ ] Consumer groups specified
  - [ ] Topic filtering correct
  - [ ] Permissions adequate

- [ ] **Performance Impact**
  - [ ] Collection interval appropriate
  - [ ] Metric filtering optimized
  - [ ] Resource limits set
  - [ ] Batch size tuned

### Debug Tools Ready
- [ ] JMX console access
- [ ] Log aggregation configured
- [ ] Network diagnostic tools
- [ ] Performance profilers
- [ ] Debug scripts prepared

## 📈 Optimization Checklist

### Collection Optimization
- [ ] **Sampling Strategy**
  - [ ] High-cardinality metrics filtered
  - [ ] Appropriate sampling rates
  - [ ] Smart topic selection
  - [ ] Consumer group filtering

- [ ] **Performance Tuning**
  - [ ] Collection intervals optimized
  - [ ] Batch processing enabled
  - [ ] Connection pooling configured
  - [ ] Caching implemented

### Cost Optimization
- [ ] Data retention policies set
- [ ] Metric cardinality controlled
- [ ] Sampling rates balanced
- [ ] Archive strategy defined
- [ ] Cost monitoring enabled

## 🎓 Knowledge Checklist

### Team Capabilities
- [ ] **Understanding Metrics**
  - [ ] Can interpret key metrics
  - [ ] Understand metric relationships
  - [ ] Know normal baselines
  - [ ] Can spot anomalies

- [ ] **Using Tools**
  - [ ] NRQL query skills
  - [ ] Dashboard creation
  - [ ] Alert configuration
  - [ ] Integration management

- [ ] **Response Skills**
  - [ ] Can diagnose lag issues
  - [ ] Understand replication problems
  - [ ] Can analyze performance
  - [ ] Know escalation procedures

## 🚀 Production Readiness

### Final Validation
- [ ] All critical metrics collecting
- [ ] Dashboards load quickly
- [ ] Alerts tested and working
- [ ] Team trained and ready
- [ ] Documentation complete
- [ ] Runbooks accessible
- [ ] Backup monitoring in place
- [ ] Success criteria defined

### Sign-off
- [ ] Technical lead approval
- [ ] Operations team ready
- [ ] Management informed
- [ ] Go-live date set

## 📅 Maintenance Schedule

### Daily
- [ ] Check critical alerts
- [ ] Verify data collection
- [ ] Review error logs
- [ ] Monitor lag trends

### Weekly
- [ ] Review performance metrics
- [ ] Check capacity trends
- [ ] Update documentation
- [ ] Team sync meeting

### Monthly
- [ ] Optimize queries
- [ ] Review alert thresholds
- [ ] Update runbooks
- [ ] Capacity planning

### Quarterly
- [ ] Architecture review
- [ ] Tool updates
- [ ] Training refresh
- [ ] Strategy alignment

---

Use this checklist to ensure nothing is missed in your Kafka observability journey. Customize it based on your specific requirements and keep it updated as your monitoring evolves!