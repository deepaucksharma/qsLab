#!/bin/bash
# Script to generate various tombstone scenarios for testing

set -e

BROKER=${KAFKA_BROKER:-"localhost:9092"}
CONTAINER=${KAFKA_CONTAINER:-"week2-broker"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Tombstone Scenario Generator${NC}"
echo "=============================="

# Function to create topic with specific config
create_topic() {
    local topic=$1
    local config=$2
    
    echo -e "${YELLOW}Creating topic: $topic${NC}"
    docker exec $CONTAINER kafka-topics --create \
        --bootstrap-server $BROKER \
        --topic $topic \
        --partitions 3 \
        --replication-factor 1 \
        --config cleanup.policy=compact \
        --config segment.ms=60000 \
        --config min.cleanable.dirty.ratio=0.01 \
        $config 2>/dev/null || echo "Topic $topic already exists"
}

# Function to generate messages with tombstones
generate_scenario() {
    local topic=$1
    local scenario=$2
    
    echo -e "${YELLOW}Generating $scenario scenario for topic: $topic${NC}"
    
    case $scenario in
        "low")
            # 10% tombstones
            docker exec -it $CONTAINER kafka-console-producer \
                --broker-list $BROKER \
                --topic $topic \
                --property "key.separator=:" \
                --property "parse.key=true" << EOF
user001:{"name":"Alice","status":"active"}
user002:{"name":"Bob","status":"active"}
user003:{"name":"Charlie","status":"active"}
user004:{"name":"David","status":"active"}
user005:{"name":"Eve","status":"active"}
user006:{"name":"Frank","status":"active"}
user007:{"name":"Grace","status":"active"}
user008:{"name":"Henry","status":"active"}
user009:{"name":"Iris","status":"active"}
user010:{"name":"Jack","status":"active"}
user005:
EOF
            ;;
            
        "medium")
            # 30% tombstones
            docker exec -it $CONTAINER kafka-console-producer \
                --broker-list $BROKER \
                --topic $topic \
                --property "key.separator=:" \
                --property "parse.key=true" << EOF
item001:{"product":"laptop","price":999}
item002:{"product":"mouse","price":29}
item003:{"product":"keyboard","price":79}
item004:{"product":"monitor","price":299}
item005:{"product":"cable","price":19}
item006:{"product":"adapter","price":39}
item007:{"product":"speaker","price":149}
item008:{"product":"webcam","price":89}
item009:{"product":"microphone","price":129}
item010:{"product":"hub","price":49}
item002:
item005:
item008:
EOF
            ;;
            
        "high")
            # 60% tombstones
            docker exec -it $CONTAINER kafka-console-producer \
                --broker-list $BROKER \
                --topic $topic \
                --property "key.separator=:" \
                --property "parse.key=true" << EOF
session001:{"user":"alice","login":"2024-01-01"}
session002:{"user":"bob","login":"2024-01-01"}
session003:{"user":"charlie","login":"2024-01-01"}
session004:{"user":"david","login":"2024-01-01"}
session005:{"user":"eve","login":"2024-01-01"}
session001:
session002:
session003:
session004:
session005:
EOF
            ;;
            
        "progressive")
            # Simulates increasing tombstone ratio over time
            echo "Stage 1: Normal messages"
            for i in {1..20}; do
                key="record$(printf "%03d" $i)"
                value='{"data":"value'$i'","timestamp":"'$(date -Iseconds)'"}'
                echo "$key:$value" | docker exec -i $CONTAINER kafka-console-producer \
                    --broker-list $BROKER \
                    --topic $topic \
                    --property "key.separator=:" \
                    --property "parse.key=true"
            done
            
            echo "Stage 2: Adding some tombstones (25%)"
            for i in {1..5}; do
                key="record$(printf "%03d" $i)"
                echo "$key:" | docker exec -i $CONTAINER kafka-console-producer \
                    --broker-list $BROKER \
                    --topic $topic \
                    --property "key.separator=:" \
                    --property "parse.key=true"
            done
            
            echo "Stage 3: More tombstones (50% total)"
            for i in {6..10}; do
                key="record$(printf "%03d" $i)"
                echo "$key:" | docker exec -i $CONTAINER kafka-console-producer \
                    --broker-list $BROKER \
                    --topic $topic \
                    --property "key.separator=:" \
                    --property "parse.key=true"
            done
            ;;
    esac
    
    echo -e "${GREEN}✓ Scenario generated${NC}"
}

# Function to analyze tombstone ratio
analyze_topic() {
    local topic=$1
    
    echo -e "\n${YELLOW}Analyzing topic: $topic${NC}"
    
    # Count total and tombstone messages
    total=0
    tombstones=0
    
    while IFS='|' read -r key value; do
        total=$((total + 1))
        if [ -z "$value" ] || [ "$value" = "" ]; then
            tombstones=$((tombstones + 1))
        fi
    done < <(docker exec $CONTAINER kafka-console-consumer \
        --bootstrap-server $BROKER \
        --topic $topic \
        --from-beginning \
        --property print.key=true \
        --property print.value=true \
        --property key.separator="|" \
        --timeout-ms 3000 2>/dev/null)
    
    if [ $total -gt 0 ]; then
        ratio=$(awk "BEGIN {printf \"%.1f\", ($tombstones/$total)*100}")
        echo "Total messages: $total"
        echo "Tombstones: $tombstones"
        echo -e "Tombstone ratio: ${RED}${ratio}%${NC}"
    else
        echo "No messages found in topic"
    fi
}

# Main script logic
case ${1:-"all"} in
    "setup")
        create_topic "tombstone-low" ""
        create_topic "tombstone-medium" ""
        create_topic "tombstone-high" ""
        create_topic "tombstone-progressive" "--config segment.bytes=1048576"
        ;;
        
    "generate")
        generate_scenario "tombstone-low" "low"
        generate_scenario "tombstone-medium" "medium"
        generate_scenario "tombstone-high" "high"
        generate_scenario "tombstone-progressive" "progressive"
        ;;
        
    "analyze")
        analyze_topic "tombstone-low"
        analyze_topic "tombstone-medium"
        analyze_topic "tombstone-high"
        analyze_topic "tombstone-progressive"
        ;;
        
    "all")
        $0 setup
        echo
        $0 generate
        echo
        $0 analyze
        ;;
        
    *)
        echo "Usage: $0 {setup|generate|analyze|all}"
        echo "  setup    - Create test topics"
        echo "  generate - Generate tombstone scenarios"
        echo "  analyze  - Analyze tombstone ratios"
        echo "  all      - Run all steps"
        exit 1
        ;;
esac

echo -e "\n${GREEN}Done!${NC}"