#!/bin/bash
# Integration testing script for Week 2 custom integrations

set -e

# Configuration
CONTAINER=${NR_CONTAINER:-"week2-newrelic-infra"}
LOG_FILE="integration-test-$(date +%Y%m%d-%H%M%S).log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging function
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# Test function
test_integration() {
    local name=$1
    local config=$2
    local expected_metric=$3
    
    log "${BLUE}Testing integration: $name${NC}"
    
    # Deploy config
    docker cp "$config" "$CONTAINER:/etc/newrelic-infra/integrations.d/"
    
    # Wait for integration to run
    log "Waiting for integration to execute..."
    sleep 10
    
    # Check logs for errors
    if docker logs "$CONTAINER" 2>&1 | tail -50 | grep -i "error.*$name"; then
        log "${RED}✗ Integration $name has errors${NC}"
        return 1
    fi
    
    # Check for expected output
    if docker exec "$CONTAINER" cat /var/log/newrelic-infra/newrelic-infra.log | grep "$expected_metric"; then
        log "${GREEN}✓ Integration $name is working${NC}"
        return 0
    else
        log "${YELLOW}⚠ Integration $name may not be producing metrics${NC}"
        return 2
    fi
}

# Performance test
performance_test() {
    local integration=$1
    
    log "${BLUE}Performance testing: $integration${NC}"
    
    # Get baseline metrics
    baseline_cpu=$(docker stats --no-stream --format "{{.CPUPerc}}" "$CONTAINER" | sed 's/%//')
    baseline_mem=$(docker stats --no-stream --format "{{.MemUsage}}" "$CONTAINER" | awk '{print $1}' | sed 's/MiB//')
    
    log "Baseline - CPU: ${baseline_cpu}%, Memory: ${baseline_mem}MB"
    
    # Run integration multiple times
    for i in {1..5}; do
        docker exec "$CONTAINER" /var/db/newrelic-infra/custom-integrations/"$integration" > /dev/null 2>&1 || true
        sleep 2
    done
    
    # Get metrics under load
    load_cpu=$(docker stats --no-stream --format "{{.CPUPerc}}" "$CONTAINER" | sed 's/%//')
    load_mem=$(docker stats --no-stream --format "{{.MemUsage}}" "$CONTAINER" | awk '{print $1}' | sed 's/MiB//')
    
    log "Under load - CPU: ${load_cpu}%, Memory: ${load_mem}MB"
    
    # Calculate increase
    cpu_increase=$(awk "BEGIN {print $load_cpu - $baseline_cpu}")
    mem_increase=$(awk "BEGIN {print $load_mem - $baseline_mem}")
    
    log "Increase - CPU: ${cpu_increase}%, Memory: ${mem_increase}MB"
    
    # Check if within acceptable limits
    if (( $(echo "$cpu_increase > 20" | bc -l) )); then
        log "${RED}⚠ High CPU usage increase${NC}"
    else
        log "${GREEN}✓ CPU usage acceptable${NC}"
    fi
    
    if (( $(echo "$mem_increase > 50" | bc -l) )); then
        log "${RED}⚠ High memory usage increase${NC}"
    else
        log "${GREEN}✓ Memory usage acceptable${NC}"
    fi
}

# Integration validation
validate_integration() {
    local integration=$1
    
    log "${BLUE}Validating integration: $integration${NC}"
    
    # Check if binary exists
    if docker exec "$CONTAINER" test -f "/var/db/newrelic-infra/custom-integrations/$integration"; then
        log "${GREEN}✓ Binary exists${NC}"
    else
        log "${RED}✗ Binary not found${NC}"
        return 1
    fi
    
    # Check if executable
    if docker exec "$CONTAINER" test -x "/var/db/newrelic-infra/custom-integrations/$integration"; then
        log "${GREEN}✓ Binary is executable${NC}"
    else
        log "${RED}✗ Binary not executable${NC}"
        return 1
    fi
    
    # Try to run with --help
    if docker exec "$CONTAINER" /var/db/newrelic-infra/custom-integrations/"$integration" --help 2>&1 | grep -E "(help|usage|version)"; then
        log "${GREEN}✓ Binary responds to --help${NC}"
    else
        log "${YELLOW}⚠ Binary may not support --help${NC}"
    fi
    
    # Check output format
    output=$(docker exec "$CONTAINER" /var/db/newrelic-infra/custom-integrations/"$integration" 2>/dev/null || true)
    if echo "$output" | jq . > /dev/null 2>&1; then
        log "${GREEN}✓ Output is valid JSON${NC}"
    else
        log "${RED}✗ Output is not valid JSON${NC}"
        echo "$output" >> "$LOG_FILE"
    fi
}

# Main test suite
main() {
    log "${GREEN}Week 2 Integration Test Suite${NC}"
    log "============================="
    log "Log file: $LOG_FILE"
    log ""
    
    # Test 1: Flex integration
    if [ -f "configs/flex-tombstone-monitor.yml" ]; then
        test_integration "flex-tombstone" "configs/flex-tombstone-monitor.yml" "TombstoneStats"
    fi
    
    # Test 2: Custom tombstone monitor
    if docker exec "$CONTAINER" test -f "/var/db/newrelic-infra/custom-integrations/tombstone-monitor"; then
        validate_integration "tombstone-monitor"
        performance_test "tombstone-monitor"
    fi
    
    # Test 3: Health score integration
    if docker exec "$CONTAINER" test -f "/var/db/newrelic-infra/custom-integrations/kafka-health-score"; then
        validate_integration "kafka-health-score"
        performance_test "kafka-health-score"
    fi
    
    # Test 4: Check New Relic connectivity
    log "${BLUE}Testing New Relic connectivity${NC}"
    if docker exec "$CONTAINER" grep -q "license_key" /etc/newrelic-infra.yml; then
        if docker logs "$CONTAINER" 2>&1 | tail -20 | grep -q "Metrics were sent"; then
            log "${GREEN}✓ Metrics being sent to New Relic${NC}"
        else
            log "${YELLOW}⚠ Cannot confirm metrics delivery${NC}"
        fi
    else
        log "${RED}✗ No license key configured${NC}"
    fi
    
    # Summary
    log ""
    log "${GREEN}Test Summary${NC}"
    log "============"
    
    # Count results
    passes=$(grep -c "✓" "$LOG_FILE" || true)
    failures=$(grep -c "✗" "$LOG_FILE" || true)
    warnings=$(grep -c "⚠" "$LOG_FILE" || true)
    
    log "Passed: $passes"
    log "Failed: $failures"
    log "Warnings: $warnings"
    
    if [ "$failures" -gt 0 ]; then
        log "${RED}Some tests failed. Check $LOG_FILE for details.${NC}"
        exit 1
    else
        log "${GREEN}All tests passed!${NC}"
    fi
}

# Run main function
main "$@"