# New Relic Flex: Alternative to Custom Integrations

## Overview

New Relic Flex is a general-purpose integration that allows you to collect custom metrics without writing Go code. It's perfect for:

- Quick prototyping of custom metrics
- Simple command executions and parsing
- Situations where a full OHI integration is overkill

## When to Use Flex vs Custom Integration

### Use Flex When:
- You need to run simple commands and parse output
- You're collecting metrics from scripts or CLI tools
- You want quick iteration without compilation
- The logic is straightforward (no complex calculations)

### Use Custom Integration When:
- You need complex business logic
- You're connecting to APIs or databases
- You need stateful processing
- Performance is critical
- You need advanced error handling

## Example: Collecting Kafka Metrics with Flex

See `configs/kafka-flex-config.yml` for a complete example that demonstrates:

1. **JMX Queries**: Extract custom JMX metrics not covered by nri-kafka
2. **Log Analysis**: Count errors and warnings in Kafka logs
3. **Command Execution**: Run Kafka CLI tools and parse output

## Quick Start with Flex

1. Install the New Relic Infrastructure agent with Flex:
```bash
docker run -d --name newrelic-infra \
  --network week1-xray_default \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -v ${PWD}/configs:/etc/newrelic-infra/integrations.d \
  -e NRIA_LICENSE_KEY=YOUR_LICENSE_KEY \
  newrelic/infrastructure:latest
```

2. Place your Flex config in the integrations directory
3. The agent will automatically load and execute it

## Flex Configuration Structure

```yaml
integrations:
  - name: nri-flex
    config:
      name: YourIntegrationName
      apis:
        - event_type: YourEventType
          commands:
            - run: "your command here"
              split_by: "delimiter"
              set_header: [field1, field2]
```

## Best Practices

1. **Test Commands First**: Run commands manually to ensure they work
2. **Handle Errors**: Use `|| echo 0` to provide defaults for failed commands
3. **Use Containers**: When working with Docker, use `docker exec` to run commands
4. **Parse Carefully**: Test your parsing logic with sample output
5. **Monitor Performance**: Complex commands can impact system performance

## Advanced Flex Features

- **Multiple APIs**: Collect different metrics in one config
- **Variable Substitution**: Use environment variables in configs
- **Regex Parsing**: Extract complex patterns from output
- **JSON/XML Parsing**: Native support for structured data
- **File Monitoring**: Watch files for changes

## Comparison with Tombstone Monitor

Our custom tombstone monitor (Go integration) provides:
- Efficient Kafka consumer implementation
- Stateful processing across partitions
- Complex ratio calculations
- Better error handling

The Flex equivalent would be simpler but less efficient:
```yaml
- event_type: KafkaTombstoneSample
  commands:
    - run: |
        kafka-console-consumer \
          --bootstrap-server localhost:9092 \
          --topic orders \
          --from-beginning \
          --max-messages 1000 \
          --property print.value=false \
          --property print.key=false \
          --property print.partition=true \
          | grep -c "null" || echo 0
      set_header: [tombstone_count]
```

## Resources

- [New Relic Flex Documentation](https://docs.newrelic.com/docs/infrastructure/host-integrations/host-integrations-list/flex-integration-tool-build-your-own-integration/)
- [Flex Examples Repository](https://github.com/newrelic/nri-flex/tree/master/examples)
- [Flex Configuration Reference](https://github.com/newrelic/nri-flex/blob/master/docs/basics/configure.md)
