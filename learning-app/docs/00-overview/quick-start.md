# Quick Start Guide

Get your Kafka observability environment running in minutes.

## Prerequisites

Before starting, ensure you have:
- Docker and Docker Compose installed
- New Relic account with a valid license key
- Basic understanding of command line operations
- 8GB+ RAM available for the lab environment

## Step 1: Clone the Repository

```bash
git clone https://github.com/dipankarqlik/qsLab.git
cd qsLab
```

## Step 2: Set Up New Relic Infrastructure Agent

### Create Agent Configuration

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
  cluster: learning-lab
```

### Run Infrastructure Agent with Kafka Integration

```bash
# Create a Docker network if not exists
docker network create kafka-monitoring || true

# Run the Infrastructure agent
docker run -d \
  --name newrelic-infra \
  --network kafka-monitoring \
  --cap-add SYS_PTRACE \
  --pid host \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -v ${PWD}/configs:/etc/newrelic-infra/integrations.d \
  -v ${PWD}/custom-integrations:/var/db/newrelic-infra/custom-integrations \
  -e NRIA_LICENSE_KEY=YOUR_LICENSE_KEY_HERE \
  -e NRIA_DISPLAY_NAME=kafka-lab-host \
  newrelic/infrastructure:latest
```

## Step 3: Start Your First Lab

Navigate to Week 1 and start the Kafka environment:

```bash
cd labs/week1-xray
docker-compose up -d
```

Wait for all services to be healthy:

```bash
docker-compose ps
```

## Step 4: Generate Test Traffic

Run the traffic generator to create some activity:

```bash
./scripts/generate-traffic.sh
```

## Step 5: Verify Data in New Relic

After a few minutes, check your New Relic account:

1. Go to **Infrastructure** > **Hosts**
2. Find your host named "kafka-lab-host"
3. Navigate to **Infrastructure** > **Third-party services** > **Kafka**
4. You should see:
   - KafkaBrokerSample events
   - KafkaTopicSample events
   - KafkaConsumerSample events

## Step 6: Run Your First Query

In New Relic, go to **Query your data** and try:

```sql
-- Check broker health
FROM KafkaBrokerSample 
SELECT latest(broker.underReplicatedPartitions) AS 'Under Replicated',
       latest(broker.offlinePartitionsCount) AS 'Offline',
       latest(broker.activeControllerCount) AS 'Controllers'
SINCE 5 minutes ago

-- View message flow
FROM KafkaBrokerSample 
SELECT average(broker.messagesInPerSec) 
TIMESERIES SINCE 30 minutes ago

-- Check consumer lag
FROM KafkaConsumerSample 
SELECT max(consumer.lag) 
FACET topic, consumer_group 
TIMESERIES SINCE 1 hour ago
```

## Troubleshooting

### No Data Appearing?

Check agent logs:
```bash
docker logs newrelic-infra
```

Verify Kafka JMX is accessible:
```bash
docker exec -it week1-xray_kafka-1_1 bash
echo "get -b kafka.server:type=BrokerTopicMetrics,name=MessagesInPerSec Count" | java -jar /opt/kafka/jmxterm.jar -l localhost:9999
```

### Connection Issues?

Ensure Docker networks are properly configured:
```bash
docker network ls
docker network inspect week1-xray_default
```

### License Key Issues?

Verify your license key is correctly set:
```bash
docker exec newrelic-infra env | grep LICENSE
```

## Next Steps

Now that you have data flowing:

1. Explore the [Learning Path](../01-learning-path/week1-xray.md) starting with Week 1
2. Try the interactive [Playground](../02-resources/playground.md)
3. Build your first [Dashboard](../02-resources/dashboards.md)
4. Review the [Architecture](../02-resources/architecture.md) documentation

## Docker Compose Alternative

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

Then run with:
```bash
export NEW_RELIC_LICENSE_KEY=your_key_here
docker-compose up -d
```

Ready to dive deeper? Head to [Week 1: X-Ray Vision](../01-learning-path/week1-xray.md)!