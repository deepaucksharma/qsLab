# Troubleshooting Guide

## Common Issues and Solutions

### 1. Docker Network Issues

#### Problem: "network host" not working on Mac/Windows
**Symptom**: Containers can't connect to each other with `--network host`

**Solution**: 
- Use the updated docker-compose.yml files
- Connect to services using container names (e.g., `kafka:9092`)
- Use `--network week1-xray_default` instead of `--network host`

### 2. JMX Connection Issues

#### Problem: Can't connect to JMX on localhost:9999
**Symptom**: `Connection refused` when using jmxterm

**Solution**:
```bash
# Use kafka:9999 instead of localhost:9999
docker exec -it kafka-xray-jmxterm java -jar /jmxterm.jar
> open kafka:9999
```

### 3. Kafka UI Not Showing Data

#### Problem: Kafka UI can't connect to broker
**Symptom**: No topics or brokers visible in UI

**Solution**:
- Ensure using internal listener: `kafka:9093`
- Check docker-compose.yml has correct KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS
- Verify Kafka is fully started before accessing UI

### 4. Missing Output Directory

#### Problem: Scripts fail with "No such file or directory"
**Symptom**: Error when running exercises that write to output/

**Solution**:
```bash
mkdir -p labs/week1-xray/output
```

### 5. NRI-Kafka No Data

#### Problem: No Kafka metrics in New Relic
**Symptom**: Infrastructure agent running but no KafkaBrokerSample events

**Solution**:
1. Check license key is correct
2. Verify network connectivity between agent and Kafka
3. Check logs: `docker logs newrelic-infra | grep kafka`
4. Ensure JMX is enabled on Kafka broker

### 6. Custom Integration Not Running

#### Problem: Tombstone monitor not producing metrics
**Symptom**: No tombstone metrics in New Relic

**Solution**:
1. Check integration binary is executable
2. Verify environment variables in config
3. Check Infrastructure agent logs for errors
4. Test integration manually first

### 7. Platform-Specific Issues

#### Mac/Windows Docker Desktop
**Issue**: Different networking behavior than Linux

**Solutions**:
- Always use container names, not localhost
- Avoid --network host in commands
- Use Docker Desktop's built-in networking

#### Windows Path Issues
**Issue**: Volume mounts failing

**Solution**:
```powershell
# Use full Windows paths
docker run -v C:\Users\YourName\qsLab\configs:/configs ...

# Or use ${PWD} in PowerShell
docker run -v ${PWD}/configs:/configs ...
```

### 8. Performance Issues

#### Problem: Kafka producer performance test slow
**Symptom**: Messages taking too long to produce

**Solution**:
- Reduce batch size for testing
- Check Docker Desktop resource limits
- Use smaller message sizes for initial tests

### 9. Version Compatibility

#### Problem: "Unsupported Kafka version"
**Symptom**: NRI-Kafka errors about version

**Solution**:
- Update KAFKA_VERSION to "3.x" in kafka-config.yml
- Use latest nri-kafka image
- Check compatibility matrix in New Relic docs

## Debug Commands

### Check Container Status
```bash
docker-compose ps
docker logs kafka-xray-broker
docker logs newrelic-infra
```

### Verify Kafka is Healthy
```bash
docker exec kafka-xray-broker kafka-broker-api-versions \
  --bootstrap-server localhost:9092
```

### Test JMX Connectivity
```bash
docker exec kafka-xray-jmxterm java -jar /jmxterm.jar -n <<EOF
open kafka:9999
domains
close
bye
EOF
```

### Check Topic Creation
```bash
docker exec kafka-xray-broker kafka-topics \
  --list --bootstrap-server localhost:9092
```

## Getting Help

1. Check container logs first
2. Verify network connectivity
3. Review configuration files
4. Search existing issues
5. Create detailed issue with:
   - OS and Docker version
   - Error messages
   - Steps to reproduce
   - What you've tried

## Useful Links

- [Docker Networking Guide](https://docs.docker.com/network/)
- [Kafka Troubleshooting](https://kafka.apache.org/documentation/#basic_ops_consumer_lag)
- [New Relic Support](https://support.newrelic.com)
- [qsLab Issues](https://github.com/deepaucksharma/qsLab/issues)
