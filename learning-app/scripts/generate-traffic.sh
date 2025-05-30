#!/bin/bash

# Traffic Generation Script for Kafka Observability Lab
# This script generates various types of Kafka traffic for learning exercises

set -e

# Configuration
KAFKA_BROKER="${KAFKA_BROKER:-localhost:9092}"
KAFKA_CONTAINER="${KAFKA_CONTAINER:-kafka-xray-broker}"
RECORD_SIZE="${RECORD_SIZE:-100}"
THROUGHPUT="${THROUGHPUT:-1000}"
NUM_RECORDS="${NUM_RECORDS:-100000}"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

check_kafka() {
    print_header "Checking Kafka Connectivity"
    
    if docker exec $KAFKA_CONTAINER kafka-broker-api-versions --bootstrap-server $KAFKA_BROKER > /dev/null 2>&1; then
        print_success "Kafka broker is accessible"
        return 0
    else
        print_error "Cannot connect to Kafka broker at $KAFKA_BROKER"
        return 1
    fi
}

create_topics() {
    print_header "Creating Test Topics"
    
    local topics=("test-events" "orders" "payments" "inventory" "user-activity" "system-logs")
    
    for topic in "${topics[@]}"; do
        if docker exec $KAFKA_CONTAINER kafka-topics --create \
            --topic $topic \
            --bootstrap-server $KAFKA_BROKER \
            --partitions 3 \
            --replication-factor 1 \
            --if-not-exists 2>/dev/null; then
            print_success "Created topic: $topic"
        else
            print_info "Topic $topic already exists"
        fi
    done
}

generate_steady_traffic() {
    print_header "Generating Steady Traffic"
    
    print_info "Generating $NUM_RECORDS records at $THROUGHPUT msg/sec to test-events topic"
    
    docker exec -d $KAFKA_CONTAINER kafka-producer-perf-test \
        --topic test-events \
        --num-records $NUM_RECORDS \
        --record-size $RECORD_SIZE \
        --throughput $THROUGHPUT \
        --producer-props bootstrap.servers=$KAFKA_BROKER \
        acks=1 \
        compression.type=snappy
    
    print_success "Steady traffic generation started in background"
}

generate_burst_traffic() {
    print_header "Generating Burst Traffic"
    
    print_info "Generating burst of 50,000 records to orders topic"
    
    docker exec $KAFKA_CONTAINER kafka-producer-perf-test \
        --topic orders \
        --num-records 50000 \
        --record-size 500 \
        --throughput -1 \
        --producer-props bootstrap.servers=$KAFKA_BROKER \
        acks=all \
        compression.type=lz4 &
    
    print_success "Burst traffic generation started"
}

generate_varied_traffic() {
    print_header "Generating Varied Traffic Patterns"
    
    # Small messages at high rate
    docker exec -d $KAFKA_CONTAINER kafka-producer-perf-test \
        --topic user-activity \
        --num-records 200000 \
        --record-size 50 \
        --throughput 5000 \
        --producer-props bootstrap.servers=$KAFKA_BROKER &
    
    print_info "Started high-rate small messages to user-activity"
    
    # Large messages at low rate
    docker exec -d $KAFKA_CONTAINER kafka-producer-perf-test \
        --topic system-logs \
        --num-records 10000 \
        --record-size 5000 \
        --throughput 100 \
        --producer-props bootstrap.servers=$KAFKA_BROKER &
    
    print_info "Started low-rate large messages to system-logs"
    
    print_success "Varied traffic patterns started"
}

simulate_consumer_lag() {
    print_header "Simulating Consumer Lag"
    
    # Start a slow consumer
    docker exec -d $KAFKA_CONTAINER kafka-console-consumer \
        --bootstrap-server $KAFKA_BROKER \
        --topic test-events \
        --group slow-consumer \
        --from-beginning \
        --max-messages 10
    
    print_info "Started slow consumer (processing only 10 messages)"
    
    # Generate more traffic to create lag
    docker exec -d $KAFKA_CONTAINER kafka-producer-perf-test \
        --topic test-events \
        --num-records 100000 \
        --record-size 200 \
        --throughput 10000 \
        --producer-props bootstrap.servers=$KAFKA_BROKER
    
    print_success "Consumer lag simulation started"
}

show_metrics_preview() {
    print_header "Metrics Preview"
    
    echo "Waiting for traffic to generate metrics..."
    sleep 5
    
    # Show topic list
    print_info "Active topics:"
    docker exec $KAFKA_CONTAINER kafka-topics --list --bootstrap-server $KAFKA_BROKER
    
    # Show consumer groups
    print_info "Consumer groups:"
    docker exec $KAFKA_CONTAINER kafka-consumer-groups --list --bootstrap-server $KAFKA_BROKER
    
    # Show sample lag for slow-consumer
    if docker exec $KAFKA_CONTAINER kafka-consumer-groups --bootstrap-server $KAFKA_BROKER --list | grep -q "slow-consumer"; then
        print_info "Consumer lag for slow-consumer:"
        docker exec $KAFKA_CONTAINER kafka-consumer-groups \
            --bootstrap-server $KAFKA_BROKER \
            --describe \
            --group slow-consumer || true
    fi
}

# Main execution
main() {
    print_header "Kafka Traffic Generator"
    echo "Container: $KAFKA_CONTAINER"
    echo "Broker: $KAFKA_BROKER"
    echo ""
    
    # Check if Kafka is available
    if ! check_kafka; then
        print_error "Please ensure Kafka is running with: docker-compose up -d"
        exit 1
    fi
    
    # Execute based on argument
    case "${1:-all}" in
        topics)
            create_topics
            ;;
        steady)
            generate_steady_traffic
            ;;
        burst)
            generate_burst_traffic
            ;;
        varied)
            generate_varied_traffic
            ;;
        lag)
            simulate_consumer_lag
            ;;
        preview)
            show_metrics_preview
            ;;
        all)
            create_topics
            generate_steady_traffic
            sleep 2
            generate_burst_traffic
            sleep 2
            generate_varied_traffic
            sleep 2
            simulate_consumer_lag
            sleep 5
            show_metrics_preview
            ;;
        *)
            echo "Usage: $0 [topics|steady|burst|varied|lag|preview|all]"
            echo ""
            echo "Commands:"
            echo "  topics  - Create test topics"
            echo "  steady  - Generate steady traffic"
            echo "  burst   - Generate burst traffic"
            echo "  varied  - Generate varied traffic patterns"
            echo "  lag     - Simulate consumer lag"
            echo "  preview - Show metrics preview"
            echo "  all     - Run all traffic patterns (default)"
            exit 1
            ;;
    esac
    
    print_success "Traffic generation script completed!"
}

# Run main function
main "$@"