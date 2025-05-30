# Kafka Learning Lab Maintenance Procedures

## Daily Maintenance Checklist

### Morning (Start of Day)
- [ ] **Health Check** - Run `./scripts/health-check.sh`
- [ ] **Container Status** - Verify all containers are running
- [ ] **Disk Space** - Check available space > 20%
- [ ] **Log Review** - Check for overnight errors/warnings
- [ ] **Network Connectivity** - Test Kafka broker accessibility

### Throughout the Day
- [ ] **Monitor Resources** - Check CPU/Memory usage hourly
- [ ] **User Reports** - Address any reported issues
- [ ] **Performance** - Note any degradation in response times

### End of Day
- [ ] **Backup Logs** - Run `./scripts/collect-logs.sh`
- [ ] **Clean Temp Files** - Remove any temporary data
- [ ] **Document Issues** - Log any problems encountered

---

## Weekly Maintenance Tasks

### Monday - System Review
```bash
# 1. Review system metrics
./scripts/monitoring-dashboard.sh

# 2. Check Docker system health
docker system df
docker system events --since 168h --until 1h

# 3. Review resource trends
# Look for patterns in CPU/Memory usage
```

### Tuesday - Updates and Patches
```bash
# 1. Check for Docker updates
docker version

# 2. Update base images (if needed)
docker pull confluentinc/cp-kafka:7.5.0
docker pull confluentinc/cp-zookeeper:7.5.0
docker pull newrelic/infrastructure:latest

# 3. Update git repository
git pull origin main
```

### Wednesday - Performance Optimization
```bash
# 1. Clean up unused resources
docker system prune -f
docker volume prune -f

# 2. Optimize container logs
find /var/lib/docker/containers -name "*.log" -size +100M -exec truncate -s 0 {} \;

# 3. Defragment volumes (if needed)
# Check volume fragmentation and optimize
```

### Thursday - Backup and Recovery Test
```bash
# 1. Create weekly backup
mkdir -p backups/weekly
tar -czf backups/weekly/lab-backup-$(date +%Y%m%d).tar.gz \
    learning-app/labs/*/docker-compose*.yml \
    learning-app/configs/

# 2. Test recovery procedure (on staging)
# Document any issues found

# 3. Verify backup integrity
tar -tzf backups/weekly/lab-backup-$(date +%Y%m%d).tar.gz > /dev/null
```

### Friday - Documentation and Planning
- [ ] Update runbooks with any new procedures
- [ ] Review and close resolved issues
- [ ] Plan next week's maintenance windows
- [ ] Update team on system status

---

## Monthly Maintenance Tasks

### First Monday - Deep System Analysis
```bash
# 1. Full system audit
docker system df -v
docker image ls -a
docker volume ls
docker network ls

# 2. Performance baseline
# Run load tests and compare with previous month
./scripts/generate-traffic.sh all
# Record metrics

# 3. Security audit
# Check for vulnerable images
docker scan confluentinc/cp-kafka:7.5.0
```

### Second Monday - Infrastructure Updates
```bash
# 1. Update all Docker images
docker-compose pull

# 2. Update Node.js dependencies
cd learning-app/server
npm audit
npm update

# 3. Update system packages
sudo apt update && sudo apt upgrade -y
```

### Third Monday - Capacity Planning
- [ ] Review growth trends
- [ ] Analyze resource utilization
- [ ] Plan for scaling needs
- [ ] Update resource limits if needed

### Fourth Monday - Disaster Recovery Drill
```bash
# 1. Simulate failure
./scripts/lab-manager.sh stop

# 2. Execute recovery procedure
./scripts/automated-deployment.sh latest production rollback

# 3. Validate recovery
./scripts/health-check.sh

# 4. Document recovery time and issues
```

---

## Quarterly Maintenance Tasks

### Q1 - Annual Planning
- [ ] Review previous year's metrics
- [ ] Plan major upgrades
- [ ] Budget for infrastructure needs
- [ ] Update documentation standards

### Q2 - Security Review
- [ ] Penetration testing
- [ ] Update security policies
- [ ] Review access controls
- [ ] Update SSL certificates

### Q3 - Performance Optimization
- [ ] Comprehensive performance audit
- [ ] Implement optimizations
- [ ] Update baseline metrics
- [ ] Review SLAs

### Q4 - Year-End Cleanup
- [ ] Archive old logs
- [ ] Clean up unused resources
- [ ] Document lessons learned
- [ ] Prepare for next year

---

## Emergency Maintenance Procedures

### System Down - Immediate Response
```bash
# 1. Assess the situation
docker ps -a
./scripts/health-check.sh

# 2. Collect diagnostic data
./scripts/collect-logs.sh

# 3. Attempt quick recovery
./scripts/lab-manager.sh restart

# 4. If still down, escalate
# See escalation procedures below
```

### Performance Degradation
```bash
# 1. Identify bottleneck
docker stats
./scripts/monitoring-dashboard.sh

# 2. Quick fixes
# Restart heavy containers
docker restart kafka-xray-broker

# 3. Clear caches if needed
docker exec kafka-xray-broker \
    kafka-configs --bootstrap-server localhost:9092 \
    --entity-type brokers --entity-default \
    --alter --delete-config log.cleaner.threads
```

### Data Corruption
```bash
# 1. Stop affected services
docker stop kafka-xray-broker

# 2. Backup current state
docker run --rm -v kafka-xray_kafka-data:/source \
    -v $(pwd)/emergency-backup:/backup \
    alpine tar czf /backup/corrupted-data-$(date +%s).tar.gz -C /source .

# 3. Restore from last good backup
# See backup restoration procedures

# 4. Validate data integrity
docker exec kafka-xray-broker \
    kafka-log-dirs --describe --bootstrap-server localhost:9092
```

---

## Maintenance Windows

### Scheduled Maintenance
- **Weekly**: Tuesdays 2-4 AM (automated updates)
- **Monthly**: First Sunday 6-10 AM (manual maintenance)
- **Quarterly**: Scheduled 2 weeks in advance

### Communication Plan
1. **1 Week Before**: Email notification to all users
2. **1 Day Before**: Slack reminder in #general
3. **1 Hour Before**: Update status page
4. **During**: Live updates in #maintenance
5. **After**: Summary report and next steps

---

## Automation Scripts

### Auto-Maintenance Script
```bash
#!/bin/bash
# /scripts/auto-maintenance.sh
# Run via cron: 0 2 * * 2 /path/to/auto-maintenance.sh

LOG_FILE="/var/log/kafka-lab-maintenance.log"

{
    echo "=== Maintenance Started: $(date) ==="
    
    # Update images
    docker-compose pull
    
    # Clean resources
    docker system prune -f
    
    # Restart services
    ./scripts/lab-manager.sh restart
    
    # Verify health
    ./scripts/health-check.sh
    
    echo "=== Maintenance Completed: $(date) ==="
} >> "$LOG_FILE" 2>&1
```

### Health Monitor Script
```bash
#!/bin/bash
# /scripts/health-monitor.sh
# Run via cron: */5 * * * * /path/to/health-monitor.sh

if ! ./scripts/health-check.sh > /dev/null 2>&1; then
    # Send alert
    echo "Kafka Lab Health Check Failed at $(date)" | \
        mail -s "ALERT: Kafka Lab Unhealthy" ops-team@company.com
    
    # Attempt auto-recovery
    ./scripts/lab-manager.sh restart
fi
```

---

## Metrics to Track

### System Metrics
- CPU Usage (threshold: 80%)
- Memory Usage (threshold: 85%)
- Disk Usage (threshold: 90%)
- Network I/O (baseline: establish normal)

### Application Metrics
- Container restart count
- Error rate in logs
- Response time for commands
- Topic creation/deletion success rate

### Business Metrics
- User sessions per day
- Exercise completion rate
- System availability (target: 99.9%)
- Mean time to recovery (target: < 15 min)

---

## Escalation Procedures

### Level 1 - Self Service (0-15 min)
- Check runbooks
- Run standard recovery scripts
- Review recent changes

### Level 2 - Team Lead (15-30 min)
- Contact: team-lead@company.com
- Slack: @teamlead
- Phone: +1-555-0123

### Level 3 - On-Call Engineer (30+ min)
- PagerDuty: kafka-lab-critical
- Escalation: Follow on-call schedule
- Include: Error logs, actions taken, current status

### Level 4 - Management (1+ hour)
- Major outage affecting business
- Data loss scenarios
- Security breaches

---

## Documentation Requirements

After each maintenance activity:

1. **Update Logs**
   - Date and time
   - Actions performed
   - Issues encountered
   - Resolution steps

2. **Update Runbooks**
   - New procedures discovered
   - Improved commands
   - Lessons learned

3. **Update Metrics**
   - Performance baselines
   - Resource usage trends
   - Incident statistics

4. **Team Communication**
   - Slack summary
   - Email for major changes
   - Wiki updates for procedures