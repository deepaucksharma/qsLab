# Week 3: Performance Optimizer - Tune for Efficiency

> **Mission**: Master the art of optimizing Kafka monitoring for large-scale deployments while minimizing overhead.

## Learning Objectives

By the end of this week, you will:
- ✅ Optimize metric collection for 100+ topic clusters
- ✅ Implement intelligent sampling strategies
- ✅ Reduce monitoring overhead to <1% CPU
- ✅ Handle high-cardinality metrics efficiently
- ✅ Build adaptive collection algorithms

## Prerequisites

- Complete Week 1 & 2
- Access to a multi-broker Kafka cluster
- Understanding of performance profiling

## Day 1-2: Performance Baselines

### Set Up Performance Lab

Create a realistic high-load environment:

```yaml
# docker-compose-performance.yml
version: '3.9'
services:
  kafka-1:
    image: confluentinc/cp-kafka:7.5.0
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_JMX_PORT: 9999
      # Performance tuning
      KAFKA_NUM_NETWORK_THREADS: 8
      KAFKA_NUM_IO_THREADS: 8
      KAFKA_SOCKET_SEND_BUFFER_BYTES: 102400
      KAFKA_SOCKET_RECEIVE_BUFFER_BYTES: 102400
      KAFKA_SOCKET_REQUEST_MAX_BYTES: 104857600

  # Create 100 topics
  topic-creator:
    image: confluentinc/cp-kafka:7.5.0
    depends_on: [kafka-1, kafka-2, kafka-3]
    command: |
      bash -c "
        for i in {1..100}; do
          kafka-topics --create \
            --topic perf-test-$$i \
            --partitions 10 \
            --replication-factor 3 \
            --bootstrap-server kafka-1:9092
        done
      "
```

### Measure Collection Impact

Create a benchmarking framework:

```go
// performance-benchmarker.go
package main

import (
    "context"
    "fmt"
    "os"
    "runtime"
    "time"
    
    "github.com/shirou/gopsutil/v3/cpu"
    "github.com/shirou/gopsutil/v3/mem"
    "github.com/shirou/gopsutil/v3/process"
)

type PerformanceMonitor struct {
    pid         int32
    interval    time.Duration
    samples     []Sample
}

type Sample struct {
    Timestamp   time.Time
    CPUPercent  float64
    MemoryMB    float64
    Goroutines  int
    Collections int
}

func (pm *PerformanceMonitor) Start(ctx context.Context) {
    ticker := time.NewTicker(pm.interval)
    defer ticker.Stop()
    
    proc, _ := process.NewProcess(pm.pid)
    
    for {
        select {
        case <-ctx.Done():
            pm.generateReport()
            return
        case <-ticker.C:
            sample := Sample{
                Timestamp: time.Now(),
            }
            
            // CPU usage
            cpuPercent, _ := proc.CPUPercent()
            sample.CPUPercent = cpuPercent
            
            // Memory usage
            memInfo, _ := proc.MemoryInfo()
            sample.MemoryMB = float64(memInfo.RSS) / 1024 / 1024
            
            // Goroutines
            sample.Goroutines = runtime.NumGoroutine()
            
            pm.samples = append(pm.samples, sample)
        }
    }
}

func (pm *PerformanceMonitor) generateReport() {
    fmt.Println("=== Performance Report ===")
    
    var avgCPU, maxCPU, avgMem, maxMem float64
    
    for _, s := range pm.samples {
        avgCPU += s.CPUPercent
        avgMem += s.MemoryMB
        
        if s.CPUPercent > maxCPU {
            maxCPU = s.CPUPercent
        }
        if s.MemoryMB > maxMem {
            maxMem = s.MemoryMB
        }
    }
    
    n := float64(len(pm.samples))
    avgCPU /= n
    avgMem /= n
    
    fmt.Printf("CPU: Avg=%.2f%% Max=%.2f%%\n", avgCPU, maxCPU)
    fmt.Printf("Memory: Avg=%.2fMB Max=%.2fMB\n", avgMem, maxMem)
    fmt.Printf("Samples: %d over %v\n", len(pm.samples), 
        pm.samples[len(pm.samples)-1].Timestamp.Sub(pm.samples[0].Timestamp))
}
```

## Day 3-4: Optimization Techniques

### 1. Intelligent Sampling

Implement adaptive sampling based on topic activity:

```go
// adaptive-sampler.go
type AdaptiveSampler struct {
    baseInterval    time.Duration
    minInterval     time.Duration
    maxInterval     time.Duration
    activityHistory map[string][]float64
}

func (as *AdaptiveSampler) GetSamplingInterval(topic string) time.Duration {
    history := as.activityHistory[topic]
    if len(history) < 2 {
        return as.baseInterval
    }
    
    // Calculate rate of change
    variance := as.calculateVariance(history)
    
    // High variance = more frequent sampling
    // Low variance = less frequent sampling
    if variance > 1000 {
        return as.minInterval
    } else if variance < 10 {
        return as.maxInterval
    }
    
    // Linear interpolation
    ratio := (variance - 10) / (1000 - 10)
    intervalRange := as.maxInterval - as.minInterval
    return as.maxInterval - time.Duration(float64(intervalRange)*ratio)
}

func (as *AdaptiveSampler) calculateVariance(values []float64) float64 {
    if len(values) == 0 {
        return 0
    }
    
    var sum, mean float64
    for _, v := range values {
        sum += v
    }
    mean = sum / float64(len(values))
    
    var variance float64
    for _, v := range values {
        variance += (v - mean) * (v - mean)
    }
    
    return variance / float64(len(values))
}
```

### 2. Batch Collection Optimization

Reduce JMX query overhead:

```go
// batch-collector.go
type BatchCollector struct {
    jmxClient     *JMXClient
    batchSize     int
    maxConcurrent int
}

func (bc *BatchCollector) CollectMetrics(mbeans []string) ([]Metric, error) {
    // Group MBeans by domain for efficient querying
    grouped := bc.groupByDomain(mbeans)
    
    // Use worker pool for concurrent collection
    jobs := make(chan []string, len(grouped))
    results := make(chan []Metric, len(mbeans))
    
    // Start workers
    var wg sync.WaitGroup
    for i := 0; i < bc.maxConcurrent; i++ {
        wg.Add(1)
        go bc.worker(jobs, results, &wg)
    }
    
    // Send jobs
    for _, group := range grouped {
        jobs <- group
    }
    close(jobs)
    
    // Wait and collect results
    go func() {
        wg.Wait()
        close(results)
    }()
    
    var metrics []Metric
    for metric := range results {
        metrics = append(metrics, metric)
    }
    
    return metrics, nil
}

func (bc *BatchCollector) worker(jobs <-chan []string, results chan<- []Metric, wg *sync.WaitGroup) {
    defer wg.Done()
    
    for mbeans := range jobs {
        // Batch query to JMX
        batchResults, err := bc.jmxClient.QueryBatch(mbeans)
        if err != nil {
            log.Printf("Batch query error: %v", err)
            continue
        }
        
        for _, result := range batchResults {
            results <- result
        }
    }
}
```

### 3. Metric Filtering

Implement smart filtering to reduce data volume:

```yaml
# optimized-kafka-config.yml
integrations:
  - name: nri-kafka
    env:
      # Topic filtering - only monitor active topics
      TOPIC_MODE: "regex"
      TOPIC_REGEX: "^(orders|payments|inventory|user-events).*"
      
      # Skip low-value metrics
      COLLECT_BROKER_TOPIC_DATA: "false"
      
      # Consumer group filtering
      CONSUMER_GROUP_REGEX: "^(production|staging).*"
      
      # Sampling configuration
      TOPIC_SAMPLE_SIZE: "10"  # Only sample 10 partitions per topic
    
    # Dynamic interval based on cluster size
    interval: 60s  # Increase for large clusters
```

### 4. Caching Strategy

Implement intelligent caching:

```go
// metric-cache.go
type MetricCache struct {
    cache      map[string]CachedMetric
    mu         sync.RWMutex
    ttl        time.Duration
    hitRate    float64
    missRate   float64
}

type CachedMetric struct {
    Value      interface{}
    Timestamp  time.Time
    HitCount   int
    Volatility float64  // How often this metric changes
}

func (mc *MetricCache) Get(key string) (interface{}, bool) {
    mc.mu.RLock()
    defer mc.mu.RUnlock()
    
    cached, exists := mc.cache[key]
    if !exists {
        mc.missRate++
        return nil, false
    }
    
    // Check if expired
    if time.Since(cached.Timestamp) > mc.ttl {
        mc.missRate++
        return nil, false
    }
    
    // Adaptive TTL based on volatility
    adaptiveTTL := mc.ttl * time.Duration(1/cached.Volatility)
    if time.Since(cached.Timestamp) > adaptiveTTL {
        mc.missRate++
        return nil, false
    }
    
    mc.hitRate++
    cached.HitCount++
    return cached.Value, true
}

func (mc *MetricCache) Set(key string, value interface{}, volatility float64) {
    mc.mu.Lock()
    defer mc.mu.Unlock()
    
    mc.cache[key] = CachedMetric{
        Value:      value,
        Timestamp:  time.Now(),
        Volatility: volatility,
    }
}

func (mc *MetricCache) GetEfficiency() float64 {
    total := mc.hitRate + mc.missRate
    if total == 0 {
        return 0
    }
    return mc.hitRate / total * 100
}
```

## Day 5: Advanced Optimization

### Connection Pooling

Optimize JMX connections:

```go
// jmx-pool.go
type JMXConnectionPool struct {
    pools    map[string]*ConnectionPool
    maxConns int
    mu       sync.RWMutex
}

type ConnectionPool struct {
    host        string
    port        int
    connections chan *JMXConnection
    factory     *JMXConnectionFactory
}

func (jcp *JMXConnectionPool) GetConnection(host string, port int) (*JMXConnection, error) {
    key := fmt.Sprintf("%s:%d", host, port)
    
    jcp.mu.RLock()
    pool, exists := jcp.pools[key]
    jcp.mu.RUnlock()
    
    if !exists {
        pool = jcp.createPool(host, port)
    }
    
    select {
    case conn := <-pool.connections:
        if conn.IsHealthy() {
            return conn, nil
        }
        // Connection unhealthy, create new one
        return pool.factory.Create()
    case <-time.After(5 * time.Second):
        return nil, fmt.Errorf("connection pool timeout")
    }
}

func (jcp *JMXConnectionPool) ReturnConnection(conn *JMXConnection) {
    key := fmt.Sprintf("%s:%d", conn.host, conn.port)
    
    jcp.mu.RLock()
    pool, exists := jcp.pools[key]
    jcp.mu.RUnlock()
    
    if exists && conn.IsHealthy() {
        select {
        case pool.connections <- conn:
            // Returned to pool
        default:
            // Pool full, close connection
            conn.Close()
        }
    } else {
        conn.Close()
    }
}
```

### Performance Testing Results

Create comprehensive performance tests:

```bash
# performance-test.sh
#!/bin/bash

echo "=== Kafka Monitoring Performance Test ==="

# Baseline - no monitoring
echo "1. Baseline (no monitoring)"
docker-compose down
docker-compose up -d kafka-1 kafka-2 kafka-3
sleep 30
./measure-baseline.sh

# Standard collection
echo "2. Standard collection"
docker-compose up -d nri-kafka-standard
sleep 60
./measure-with-monitoring.sh standard

# Optimized collection
echo "3. Optimized collection"
docker-compose down nri-kafka-standard
docker-compose up -d nri-kafka-optimized
sleep 60
./measure-with-monitoring.sh optimized

# Generate report
./generate-performance-report.sh
```

## Week 3 Assessment

### Performance Metrics
Achieve these optimization targets:
- [ ] CPU overhead < 1% for 100+ topics
- [ ] Memory usage < 100MB
- [ ] Collection latency < 5 seconds
- [ ] Cache hit rate > 80%
- [ ] Zero dropped metrics

### Implementation Checklist
Complete these optimizations:
- [ ] Implement adaptive sampling
- [ ] Create metric cache
- [ ] Build connection pool
- [ ] Add batch collection
- [ ] Configure smart filtering

## Week 3 Project

Build an "Auto-Optimizer" that:
1. Profiles current collection performance
2. Identifies bottlenecks automatically
3. Suggests optimization strategies
4. Implements changes dynamically
5. Measures improvement

## Resources

- [Go Performance Profiling](https://blog.golang.org/pprof)
- [JMX Best Practices](https://docs.oracle.com/javase/8/docs/technotes/guides/management/jmx.html)
- [Kafka Performance Tuning](https://kafka.apache.org/documentation/#performance)

## Next Week Preview

In [Week 4: Issue Detective](week4-detective.md), you'll learn to:
- Debug production issues using metrics
- Build correlation analysis tools
- Create runbooks from metric patterns
- Implement predictive alerting

Ready to optimize for scale? You're a Performance Optimizer now! ⚡