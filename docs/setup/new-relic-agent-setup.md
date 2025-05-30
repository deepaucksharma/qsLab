# Setting Up New Relic Infrastructure Agent for Kafka Monitoring

## Prerequisites

- New Relic account with a valid license key
- Docker environment running
- Kafka cluster from Week 1 labs

## Quick Setup

### 1. Create Agent Configuration

Create `configs/newrelic-infra.yml`:
```yaml
license_key: YOUR_LICENSE_KEY_HERE
display_name: kafka-observability-lab
log:
  level: info
  forward: true
  stdout: false
custom_attributes:
  environment: development
  lab: kafka-observability
  cluster: xray-lab
```

### 2. Run Infrastructure Agent with Kafka Integration

```bash
# Create a Docker network if not exists
docker network create kafka-monitoring || true

# Run the Infrastructure agent
docker run -d \
  --name newrelic-infra \
  --network week1-xray_default \
  --cap-add SYS_PTRACE \
  --pid host \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -v ${PWD}/configs:/etc/newrelic-infra/integrations.d \
  -v ${PWD}/custom-integrations:/var/db/newrelic-infra/custom-integrations \
  -e NRIA_LICENSE_KEY=YOUR_LICENSE_KEY_HERE \
  -e NRIA_DISPLAY_NAME=kafka-lab-host \
  newrelic/infrastructure:latest
```

### 3. Verify Data in New Relic

After a few minutes, check your New Relic account:

1. Go to **Infrastructure** > **Hosts**
2. Find your host named "kafka-lab-host"
3. Navigate to **Infrastructure** > **Third-party services** > **Kafka**4. You should see:
   - KafkaBrokerSample events
   - KafkaTopicSample events (if topics exist)
   - KafkaConsumerSample events (if consumers are running)

## Testing the Integration

### 1. Generate Some Traffic

```bash
# From the week1-xray directory
./scripts/generate-traffic.sh
```

### 2. Query Data with NRQL

In New Relic, go to **Query your data** and try:

```sql
-- Broker metrics
FROM KafkaBrokerSample 
SELECT average(broker.messagesInPerSec) 
TIMESERIES SINCE 30 minutes ago

-- Topic metrics
FROM KafkaTopicSample 
SELECT average(topic.messagesInPerSec) 
FACET topic 
SINCE 30 minutes ago

-- Consumer lag
FROM KafkaConsumerSample 
SELECT max(consumer.lag) 
FACET topic, consumer_group 
TIMESERIES SINCE 1 hour ago
```

## Adding Custom Integration

To add the tombstone monitor:

1. Build the integration:
```bash
cd custom-integrations/tombstone-monitor
go build -o tombstone-monitor main.go
```

2. Copy to the container:
```bash
docker cp tombstone-monitor newrelic-infra:/var/db/newrelic-infra/custom-integrations/
docker cp ../../configs/tombstone-config.yml newrelic-infra:/etc/newrelic-infra/integrations.d/
```

3. Restart the agent:
```bash
docker restart newrelic-infra
```

## Troubleshooting

### Check Agent Logs
```bash
docker logs newrelic-infra
```

### Verify Integration is Running
```bash
docker exec newrelic-infra cat /var/log/newrelic-infra/newrelic-infra.log | grep kafka
```

### Common Issues

1. **No data appearing**: Check license key and network connectivity
2. **Missing metrics**: Ensure Kafka JMX is properly configured
3. **Custom integration not running**: Check file permissions and paths
4. **Network errors**: Verify Docker network configuration

## Docker Compose Integration

For a complete setup, add this to your `docker-compose.yml`:

```yaml
  newrelic-infra:
    image: newrelic/infrastructure:latest
    container_name: newrelic-infra
    cap_add:
      - SYS_PTRACE
    network_mode: host
    pid: host
    privileged: true
    volumes:
      - /:/host:ro
      - /var/run/docker.sock:/var/run/docker.sock
      - ./configs:/etc/newrelic-infra/integrations.d
      - ./custom-integrations:/var/db/newrelic-infra/custom-integrations
    environment:
      NRIA_LICENSE_KEY: ${NEW_RELIC_LICENSE_KEY}
      NRIA_DISPLAY_NAME: kafka-lab
      NRIA_LOG_LEVEL: info
    restart: unless-stopped
```

## Next Steps

1. Create custom dashboards for your Kafka metrics
2. Set up alerts for critical conditions
3. Explore the tombstone monitor data
4. Try creating your own Flex configuration
5. Build additional custom integrations
