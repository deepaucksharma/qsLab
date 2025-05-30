# Mental Models: From API Servers to Kafka

## Your Foundation: API Server Model

You already understand:
```
Client → Load Balancer → API Servers → Database
         ↓                ↓             ↓
      Metrics         Metrics       Metrics
```

## Mapping to Kafka

### API Server → Kafka Broker
```
API Server                  | Kafka Broker
---------------------------|---------------------------
Handles HTTP requests      | Handles produce/consume requests
Stateless                  | Stateful (owns partition data)
Load balanced              | Leader election per partition
Request/Response           | Async publish/subscribe
In-memory processing       | Disk-based log storage
```

### Load Balancer → Partition Leadership
```
Load Balancer              | Partition Leadership
---------------------------|---------------------------
Routes to healthy servers  | Routes to partition leaders
Round-robin/least-conn     | Partition → Leader mapping
Health checks              | In-Sync Replica (ISR) checks
Failover to backup         | Leader election on failure
```

### Database → Kafka Log
```
Traditional Database       | Kafka Log
---------------------------|---------------------------
Tables with rows           | Topics with messages
UPDATE/DELETE              | Append-only log
Query by index             | Sequential read by offset
ACID transactions          | Eventual consistency*
Schema enforced            | Schema optional
```

## The Metrics Parallel

### API Server Metrics
```
/metrics endpoint (Prometheus style)
├── request_rate
├── error_rate
├── latency_p99
└── active_connections
```

### Kafka Broker Metrics (via JMX)
```
JMX Port 9999 (Java style)
├── MessagesInPerSec (≈ request_rate)
├── FailedFetchRequestsPerSec (≈ error_rate)
├── TotalTimeMs (≈ latency)
└── NetworkProcessorAvgIdlePercent (≈ capacity)
```

## Key Differences to Internalize

1. **Pull vs Push**: 
   - API metrics: Usually pulled (Prometheus scrapes /metrics)
   - Kafka metrics: Pulled via JMX (nri-kafka queries MBeans)

2. **Stateless vs Stateful**:
   - API servers: Any server can handle any request
   - Kafka brokers: Specific broker owns specific partitions

3. **Sync vs Async**:
   - API: Request waits for response
   - Kafka: Producer fire-and-forget, Consumer polls

## Your "Aha!" Bridge

Think of Kafka monitoring like monitoring a distributed database that also acts as a message queue:
- **Broker metrics** = Database server health
- **Topic metrics** = Table/collection statistics  
- **Consumer lag** = Replication lag in DB terms
- **Producer metrics** = Write client performance
- **Consumer metrics** = Read client performance

The key insight: Unlike API servers where metrics are about request flow, Kafka metrics are about data flow AND storage state.
