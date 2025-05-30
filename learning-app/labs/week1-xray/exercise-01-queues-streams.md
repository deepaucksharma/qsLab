# Exercise 1: New Relic Queues & Streams (2025 Feature)

## 🆕 What's New in 2025

New Relic's Queues & Streams provides bi-directional visibility into your Kafka infrastructure:
- **Honeycomb Visualization**: See cluster health at a glance
- **Topic-to-Service Mapping**: Connect topics to both producers AND consumers
- **APM 360 Integration**: Seamless flow from application to infrastructure metrics

## Learning Objectives

- [ ] Enable Queues & Streams for your Kafka cluster
- [ ] Understand the honeycomb visualization
- [ ] Connect producers and consumers to topics
- [ ] Navigate from application traces to Kafka metrics

## Part 1: Enable Queues & Streams

### Step 1: Access the Feature

```bash
# First, ensure your New Relic agents are running
docker exec kafka-xray-newrelic newrelic-infra --version

# Check that Java agents are configured for producers/consumers
docker exec kafka-xray-producer java -version
```

In New Relic UI:
1. Navigate to: **All capabilities** > **Queues & Streams**
2. Click **Get Started** if this is your first time
3. Select **Apache Kafka** from the list

### Step 2: Configure Java Agents

For your producer applications, add:

```yaml
# newrelic.yml for producer app
common: &default_settings
  app_name: 'Kafka Producer - Orders Service'
  distributed_tracing:
    enabled: true
  span_events:
    enabled: true
  # Enable Kafka instrumentation
  class_transformer:
    com.newrelic.instrumentation.kafka-clients-spans-2.0.0:
      enabled: true
```

### Step 3: Verify Honeycomb View

After configuration, you should see:
- Cluster health visualization
- Topic throughput rates
- Consumer lag indicators

## Part 2: Explore Bi-Directional Visibility

### Interactive Exercise

1. **Generate Traffic with Context**:
```bash
# Start producer with trace context
docker exec -it kafka-xray-producer \
  java -javaagent:/newrelic.jar \
  -Dnewrelic.config.distributed_tracing.enabled=true \
  -jar producer-app.jar \
  --topic orders \
  --messages 1000
```

2. **View in Queues & Streams**:
   - Click on the "orders" topic in honeycomb view
   - See both producer and consumer connections
   - Note the trace IDs linking services

3. **Drill Down to APM**:
   - Click on a producer service
   - Navigate to distributed traces
   - See the complete flow through Kafka

## Part 3: Hands-On Lab

### Create a Multi-Service Flow

```bash
# Terminal 1: Start order service (producer)
./scripts/start-order-service.sh

# Terminal 2: Start payment service (consumer/producer)
./scripts/start-payment-service.sh

# Terminal 3: Start notification service (consumer)
./scripts/start-notification-service.sh
```

### Observe in New Relic

1. Go to Queues & Streams dashboard
2. Look for the service flow:
   ```
   Orders Service → [orders topic] → Payment Service → [payments topic] → Notification Service
   ```

3. Click on any connection to see:
   - Message rates
   - Error rates
   - Latency percentiles
   - Consumer lag

## Part 4: Advanced Features

### Custom Attributes

Add business context to your Kafka messages:

```java
// In your producer code
Properties props = new Properties();
props.put("client.id", "order-service-prod-1");
props.put("newrelic.message_properties.order_type", orderType);
props.put("newrelic.message_properties.region", region);
```

These appear in:
- Distributed traces
- Queues & Streams filters
- NRQL queries

### NRQL Queries for Queues & Streams

```sql
-- Message flow analysis
FROM MessageTrace 
SELECT count(*) 
FACET topic, producer.service.name, consumer.service.name 
SINCE 30 minutes ago

-- Consumer lag by service
FROM MessageTrace 
SELECT max(consumer.lag) 
FACET consumer.service.name, topic 
WHERE consumer.lag > 100

-- Error rate by topic
FROM MessageTrace 
SELECT percentage(count(*), WHERE error = true) as 'Error Rate' 
FACET topic 
TIMESERIES
```

## Validation Checklist

- [ ] Honeycomb view shows your Kafka cluster
- [ ] Topics display with health indicators
- [ ] Producer services are connected to topics
- [ ] Consumer services show lag metrics
- [ ] Distributed traces include Kafka spans
- [ ] Custom attributes appear in traces

## Troubleshooting

### No Data in Queues & Streams?

1. Verify Java agent version (must be 7.11.0+)
2. Check `newrelic_agent.log` for Kafka instrumentation
3. Ensure distributed tracing is enabled
4. Confirm topics have traffic

### Missing Service Connections?

```bash
# Check if agents are reporting
curl -X GET "https://api.newrelic.com/v2/applications.json" \
  -H "X-Api-Key: YOUR_API_KEY" | jq '.applications[] | select(.name | contains("Kafka"))'
```

## Key Takeaways

1. **Bi-Directional Visibility**: See both sides of every topic
2. **APM Integration**: Seamless navigation between layers
3. **Business Context**: Custom attributes for better insights
4. **Proactive Monitoring**: Spot issues before they impact users

## Next Steps

Continue to [Exercise 2: JMX Deep Dive](exercise-02-jmx-exploration.md) to understand the metrics behind the visualizations.