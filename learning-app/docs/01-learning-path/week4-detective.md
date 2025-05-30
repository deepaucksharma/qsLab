# Week 4: Issue Detective - Solve Production Mysteries

> **Mission**: Master the art of using Kafka metrics to diagnose and resolve production issues before they impact users.

## Learning Objectives

By the end of this week, you will:
- ✅ Build systematic debugging workflows
- ✅ Create correlation analysis tools
- ✅ Develop pattern recognition skills
- ✅ Implement predictive alerting
- ✅ Generate automated runbooks

## Prerequisites

- Complete Weeks 1-3
- Access to historical metric data
- Understanding of Kafka failure modes

## Day 1-2: The Lag Spike Investigation

### Scenario Setup

Your checkout service is experiencing intermittent lag spikes at 3 AM. Let's investigate systematically.

### Investigation Playbook

Create a structured investigation framework:

```bash
# Create investigation toolkit
mkdir -p ~/qsLab/detective-toolkit
cd ~/qsLab/detective-toolkit

cat > lag-spike-investigator.sh << 'EOF'
#!/bin/bash

echo "🔍 Lag Spike Investigation Tool"
echo "================================"

TOPIC=$1
CONSUMER_GROUP=$2
TIME_RANGE=${3:-"6 hours"}

# Step 1: Confirm the lag spike
echo -e "\n📊 Step 1: Confirming lag spike..."
cat > queries/lag-spike-confirmation.nrql << SQL
SELECT max(consumer.lag) AS 'Peak Lag',
       average(consumer.lag) AS 'Avg Lag',
       latest(consumer.lag) AS 'Current Lag'
FROM KafkaConsumerSample 
WHERE topic = '$TOPIC' AND consumer.group = '$CONSUMER_GROUP'
SINCE $TIME_RANGE
SQL

# Step 2: Check producer rate during spike
echo -e "\n📈 Step 2: Analyzing producer rate..."
cat > queries/producer-rate-analysis.nrql << SQL
SELECT rate(sum(broker.messagesInPerSec), 1 minute) AS 'Message Rate',
       average(broker.bytesInPerSec) / 1024 / 1024 AS 'MB/sec'
FROM KafkaBrokerSample
WHERE topic = '$TOPIC'
TIMESERIES SINCE $TIME_RANGE
SQL

# Step 3: Consumer performance analysis
echo -e "\n🔄 Step 3: Checking consumer performance..."
cat > queries/consumer-performance.nrql << SQL
SELECT rate(sum(consumer.recordsConsumedRate), 1 minute) AS 'Consume Rate',
       average(consumer.fetchLatencyAvg) AS 'Fetch Latency',
       sum(consumer.recordsPerRequestAvg) AS 'Records/Request'
FROM KafkaConsumerSample
WHERE topic = '$TOPIC' AND consumer.group = '$CONSUMER_GROUP'
TIMESERIES SINCE $TIME_RANGE
SQL

# Step 4: Infrastructure correlation
echo -e "\n🖥️ Step 4: Correlating infrastructure metrics..."
cat > queries/infrastructure-correlation.nrql << SQL
SELECT average(cpuPercent) AS 'CPU %',
       average(memoryUsedPercent) AS 'Memory %',
       average(diskUsedPercent) AS 'Disk %',
       max(consumer.lag) AS 'Consumer Lag'
FROM SystemSample, KafkaConsumerSample
WHERE hostname IN (
    SELECT hostname 
    FROM KafkaConsumerSample 
    WHERE consumer.group = '$CONSUMER_GROUP'
)
TIMESERIES SINCE $TIME_RANGE
SQL

echo -e "\n✅ Investigation queries generated in ./queries/"
echo "Run these in New Relic to analyze the lag spike."
EOF

chmod +x lag-spike-investigator.sh
```

### Root Cause Analysis Tree

Build an automated root cause analyzer:

```go
// root-cause-analyzer.go
package main

import (
    "fmt"
    "time"
)

type RootCauseAnalyzer struct {
    metrics MetricStore
}

type Issue struct {
    Type        string
    Severity    string
    Evidence    []Evidence
    RootCause   string
    Remediation string
}

type Evidence struct {
    Metric    string
    Value     float64
    Threshold float64
    Timestamp time.Time
}

func (rca *RootCauseAnalyzer) AnalyzeLagSpike(topic, consumerGroup string, spikeTime time.Time) (*Issue, error) {
    issue := &Issue{
        Type:     "Consumer Lag Spike",
        Severity: "High",
    }
    
    // Check producer spike
    producerRate := rca.metrics.GetRate("broker.messagesInPerSec", topic, spikeTime)
    normalRate := rca.metrics.GetAverage("broker.messagesInPerSec", topic, spikeTime.Add(-24*time.Hour), spikeTime)
    
    if producerRate > normalRate*2 {
        issue.Evidence = append(issue.Evidence, Evidence{
            Metric:    "producer.rate",
            Value:     producerRate,
            Threshold: normalRate * 2,
            Timestamp: spikeTime,
        })
        issue.RootCause = "Producer traffic spike"
        issue.Remediation = "Scale consumer instances or increase consumption rate"
        return issue, nil
    }
    
    // Check consumer slowdown
    consumerRate := rca.metrics.GetRate("consumer.recordsConsumedRate", consumerGroup, spikeTime)
    normalConsumerRate := rca.metrics.GetAverage("consumer.recordsConsumedRate", consumerGroup, spikeTime.Add(-24*time.Hour), spikeTime)
    
    if consumerRate < normalConsumerRate*0.5 {
        // Check for rebalancing
        rebalances := rca.metrics.Count("consumer.rebalance", consumerGroup, spikeTime.Add(-10*time.Minute), spikeTime)
        if rebalances > 0 {
            issue.RootCause = "Consumer group rebalancing"
            issue.Remediation = "Investigate consumer stability, check for crashing instances"
        } else {
            // Check infrastructure
            cpu := rca.metrics.GetMax("system.cpuPercent", consumerGroup, spikeTime)
            if cpu > 80 {
                issue.RootCause = "Consumer CPU saturation"
                issue.Remediation = "Scale consumer instances horizontally"
            } else {
                issue.RootCause = "Consumer processing slowdown"
                issue.Remediation = "Check application logs for errors or slow operations"
            }
        }
        return issue, nil
    }
    
    // Check for partition leadership changes
    leaderChanges := rca.metrics.Count("broker.leaderElection", topic, spikeTime.Add(-10*time.Minute), spikeTime)
    if leaderChanges > 0 {
        issue.RootCause = "Partition leader election caused temporary unavailability"
        issue.Remediation = "Check broker health and network stability"
        return issue, nil
    }
    
    issue.RootCause = "Unknown - requires manual investigation"
    issue.Remediation = "Check application logs and perform detailed analysis"
    return issue, nil
}
```

## Day 3-4: Pattern Recognition

### Build a Pattern Library

Create reusable detection patterns:

```go
// pattern-detector.go
package main

type PatternDetector struct {
    patterns []Pattern
}

type Pattern struct {
    Name        string
    Description string
    Detect      func(metrics MetricStore) bool
    Severity    string
    Actions     []string
}

func NewPatternDetector() *PatternDetector {
    return &PatternDetector{
        patterns: []Pattern{
            {
                Name:        "Death Spiral",
                Description: "Consumer lag increasing exponentially",
                Detect: func(m MetricStore) bool {
                    lag := m.GetTimeSeries("consumer.lag", time.Now().Add(-1*time.Hour), time.Now())
                    return isExponentialGrowth(lag) && lag[len(lag)-1].Value > 10000
                },
                Severity: "Critical",
                Actions: []string{
                    "Immediately scale consumers",
                    "Check for poison messages",
                    "Consider emergency consumer reset",
                },
            },
            {
                Name:        "Rebalance Storm",
                Description: "Frequent consumer rebalancing",
                Detect: func(m MetricStore) bool {
                    rebalances := m.Count("consumer.rebalance", "", time.Now().Add(-10*time.Minute), time.Now())
                    return rebalances > 5
                },
                Severity: "High",
                Actions: []string{
                    "Check consumer health",
                    "Review session timeout settings",
                    "Look for OOM or crash loops",
                },
            },
            {
                Name:        "Broker Degradation",
                Description: "Single broker handling disproportionate load",
                Detect: func(m MetricStore) bool {
                    brokerLoads := m.GetByBroker("broker.messagesInPerSec")
                    avg := calculateAverage(brokerLoads)
                    for _, load := range brokerLoads {
                        if load > avg*2 {
                            return true
                        }
                    }
                    return false
                },
                Severity: "Medium",
                Actions: []string{
                    "Check partition leadership distribution",
                    "Run partition reassignment",
                    "Verify preferred replica election",
                },
            },
            {
                Name:        "Disk Pressure",
                Description: "Broker approaching disk capacity",
                Detect: func(m MetricStore) bool {
                    diskUsage := m.GetMax("system.diskUsedPercent", "", time.Now())
                    return diskUsage > 85
                },
                Severity: "High",
                Actions: []string{
                    "Reduce retention time",
                    "Add disk capacity",
                    "Delete unused topics",
                    "Enable compression",
                },
            },
        },
    }
}

func isExponentialGrowth(series []TimePoint) bool {
    if len(series) < 3 {
        return false
    }
    
    // Simple exponential detection: each point > 1.5x previous
    for i := 2; i < len(series); i++ {
        if series[i].Value < series[i-1].Value*1.5 {
            return false
        }
    }
    return true
}
```

### Correlation Analysis

Build tools to find metric relationships:

```python
# correlation-analyzer.py
import pandas as pd
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt

class CorrelationAnalyzer:
    def __init__(self, nrql_client):
        self.client = nrql_client
        
    def analyze_lag_correlations(self, consumer_group, time_range="1 week"):
        """Find what metrics correlate with consumer lag"""
        
        # Fetch metrics
        metrics = {
            'lag': self._fetch_metric('consumer.lag', consumer_group, time_range),
            'producer_rate': self._fetch_metric('broker.messagesInPerSec', time_range=time_range),
            'consumer_rate': self._fetch_metric('consumer.recordsConsumedRate', consumer_group, time_range),
            'cpu': self._fetch_metric('system.cpuPercent', time_range=time_range),
            'memory': self._fetch_metric('system.memoryUsedPercent', time_range=time_range),
            'fetch_latency': self._fetch_metric('consumer.fetchLatencyAvg', consumer_group, time_range),
            'rebalances': self._fetch_metric('consumer.rebalanceCount', consumer_group, time_range),
        }
        
        # Create DataFrame
        df = pd.DataFrame(metrics)
        
        # Calculate correlations
        correlations = df.corr()['lag'].sort_values(ascending=False)
        
        # Find significant correlations
        significant = []
        for metric, corr in correlations.items():
            if metric != 'lag' and abs(corr) > 0.7:
                p_value = stats.pearsonr(df['lag'], df[metric])[1]
                if p_value < 0.05:
                    significant.append({
                        'metric': metric,
                        'correlation': corr,
                        'p_value': p_value,
                        'interpretation': self._interpret_correlation(metric, corr)
                    })
        
        return significant
    
    def _interpret_correlation(self, metric, correlation):
        interpretations = {
            'producer_rate': {
                'positive': "Higher producer rate leads to increased lag",
                'negative': "Inverse relationship (unusual, investigate)"
            },
            'consumer_rate': {
                'positive': "Consumer keeping up with lag (catching up)",
                'negative': "Lower consumer rate associated with higher lag"
            },
            'cpu': {
                'positive': "CPU saturation contributing to lag",
                'negative': "CPU usage drops when lag increases (possible throttling)"
            },
            'fetch_latency': {
                'positive': "Network/broker latency contributing to lag",
                'negative': "Unusual inverse relationship"
            }
        }
        
        direction = 'positive' if correlation > 0 else 'negative'
        return interpretations.get(metric, {}).get(direction, f"{direction} correlation")
    
    def generate_correlation_report(self, consumer_group):
        """Generate comprehensive correlation report"""
        correlations = self.analyze_lag_correlations(consumer_group)
        
        report = f"""
# Lag Correlation Analysis Report
Consumer Group: {consumer_group}
Generated: {datetime.now()}

## Significant Correlations Found:

"""
        for corr in correlations:
            report += f"""
### {corr['metric']}
- Correlation: {corr['correlation']:.3f}
- P-value: {corr['p_value']:.4f}
- Interpretation: {corr['interpretation']}

"""
        
        # Add visualization
        self._plot_correlations(correlations)
        
        return report
```

## Day 5: Predictive Alerting

### Build Anomaly Detection

Implement smart alerting that predicts issues:

```go
// anomaly-detector.go
package main

import (
    "math"
    "sort"
)

type AnomalyDetector struct {
    sensitivity float64
    history     map[string][]float64
}

func (ad *AnomalyDetector) DetectAnomaly(metric string, value float64) (bool, float64) {
    history := ad.history[metric]
    if len(history) < 20 {
        // Not enough history
        ad.history[metric] = append(history, value)
        return false, 0
    }
    
    // Calculate z-score
    mean, stdDev := ad.calculateStats(history)
    zScore := (value - mean) / stdDev
    
    // Update history (sliding window)
    ad.history[metric] = append(history[1:], value)
    
    // Detect anomaly
    isAnomaly := math.Abs(zScore) > ad.sensitivity
    
    return isAnomaly, zScore
}

func (ad *AnomalyDetector) PredictIssue(metric string, horizon int) (*Prediction, error) {
    history := ad.history[metric]
    if len(history) < 10 {
        return nil, fmt.Errorf("insufficient history")
    }
    
    // Simple linear regression for prediction
    slope, intercept := ad.linearRegression(history)
    
    // Predict future value
    futureValue := slope*float64(len(history)+horizon) + intercept
    
    // Calculate confidence based on R-squared
    rSquared := ad.calculateRSquared(history, slope, intercept)
    confidence := rSquared * 100
    
    prediction := &Prediction{
        Metric:     metric,
        Horizon:    horizon,
        Value:      futureValue,
        Confidence: confidence,
    }
    
    // Check if predicted value crosses threshold
    if metric == "consumer.lag" && futureValue > 10000 {
        prediction.Alert = true
        prediction.Message = fmt.Sprintf("Consumer lag predicted to reach %.0f in %d minutes", futureValue, horizon)
    }
    
    return prediction, nil
}
```

### Automated Runbook Generation

Create runbooks from detected patterns:

```go
// runbook-generator.go
type RunbookGenerator struct {
    patterns map[string]*Issue
    actions  map[string][]Action
}

type Runbook struct {
    Title       string
    Issue       *Issue
    Steps       []Step
    Validation  []Check
    Escalation  string
}

type Step struct {
    Order       int
    Description string
    Command     string
    Expected    string
}

func (rg *RunbookGenerator) GenerateRunbook(issue *Issue) *Runbook {
    runbook := &Runbook{
        Title: fmt.Sprintf("Runbook: %s", issue.Type),
        Issue: issue,
    }
    
    switch issue.RootCause {
    case "Producer traffic spike":
        runbook.Steps = []Step{
            {1, "Verify producer spike", 
             `nrql "SELECT rate(sum(broker.messagesInPerSec), 1 minute) FROM KafkaBrokerSample TIMESERIES"`,
             "Spike visible in graph"},
            {2, "Check consumer capacity",
             `kubectl get hpa consumer-deployment`,
             "Current replicas < Max replicas"},
            {3, "Scale consumers",
             `kubectl scale deployment consumer-deployment --replicas=10`,
             "Deployment scaled successfully"},
            {4, "Monitor lag reduction",
             `watch 'nrql "SELECT latest(consumer.lag) FROM KafkaConsumerSample"'`,
             "Lag decreasing"},
        }
        
    case "Consumer group rebalancing":
        runbook.Steps = []Step{
            {1, "Check consumer logs",
             `kubectl logs -l app=consumer --tail=100 | grep -i rebalance`,
             "Rebalance events visible"},
            {2, "Check for OOM kills",
             `kubectl get events --field-selector reason=OOMKilled`,
             "Identify if OOM is cause"},
            {3, "Review consumer health",
             `kubectl describe pods -l app=consumer`,
             "Check restart counts"},
            {4, "Adjust session timeout",
             `kubectl set env deployment/consumer SESSION_TIMEOUT_MS=30000`,
             "Environment updated"},
        }
    }
    
    // Add validation checks
    runbook.Validation = []Check{
        {"Lag decreasing", `consumer.lag < previous_lag`},
        {"No new rebalances", `rebalance_count == 0`},
        {"Consumer rate normal", `consumer_rate > threshold`},
    }
    
    runbook.Escalation = "If issue persists after 30 minutes, escalate to platform team"
    
    return runbook
}

func (rg *RunbookGenerator) ExportMarkdown(runbook *Runbook) string {
    md := fmt.Sprintf(`# %s

## Issue Details
- **Type**: %s
- **Root Cause**: %s
- **Severity**: %s

## Evidence
`, runbook.Title, runbook.Issue.Type, runbook.Issue.RootCause, runbook.Issue.Severity)
    
    for _, evidence := range runbook.Issue.Evidence {
        md += fmt.Sprintf("- %s: %.2f (threshold: %.2f)\n", 
            evidence.Metric, evidence.Value, evidence.Threshold)
    }
    
    md += "\n## Resolution Steps\n"
    for _, step := range runbook.Steps {
        md += fmt.Sprintf(`
### Step %d: %s
\`\`\`bash
%s
\`\`\`
**Expected Result**: %s

`, step.Order, step.Description, step.Command, step.Expected)
    }
    
    md += "\n## Validation\n"
    for _, check := range runbook.Validation {
        md += fmt.Sprintf("- [ ] %s\n", check.Description)
    }
    
    md += fmt.Sprintf("\n## Escalation\n%s\n", runbook.Escalation)
    
    return md
}
```

## Week 4 Assessment

### Detective Skills
Demonstrate these abilities:
- [ ] Diagnose lag spike root cause in <10 minutes
- [ ] Identify correlated metrics for any issue
- [ ] Predict issues 30 minutes in advance
- [ ] Generate runbook from detected pattern
- [ ] Build custom anomaly detection

### Case Studies
Solve these production scenarios:
- [ ] "The 3 AM Mystery" - Recurring lag spikes
- [ ] "The Vanishing Messages" - Data loss investigation
- [ ] "The Slowdown" - Gradual performance degradation
- [ ] "The Storm" - Cascading failures
- [ ] "The Ghost" - Intermittent issues

## Week 4 Project

Build a "Kafka Detective Platform" that:
1. Continuously monitors for known patterns
2. Learns new patterns from incidents
3. Generates predictive alerts
4. Creates runbooks automatically
5. Provides investigation UI

## Resources

- [Time Series Analysis](https://otexts.com/fpp2/)
- [Anomaly Detection Techniques](https://github.com/yzhao062/anomaly-detection-resources)
- [SRE Workbook](https://sre.google/workbook/table-of-contents/)

## Next Week Preview

In [Week 5: Platform Architect](week5-architect.md), you'll learn to:
- Design complete observability platforms
- Build multi-cluster monitoring
- Implement SLO-based alerting
- Create self-healing systems

Ready to solve any mystery? You're an Issue Detective now! 🕵️