#!/bin/bash
# Advanced Monitoring Dashboard for Kafka Learning Lab
# Provides comprehensive real-time monitoring without external dependencies

set -euo pipefail

# Terminal colors and formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'
BOLD='\033[1m'

# Configuration
REFRESH_INTERVAL=${REFRESH_INTERVAL:-5}
HISTORY_SIZE=60  # Keep 60 data points (5 minutes at 5s intervals)
DATA_DIR="/tmp/kafka-monitor-data"

# Initialize data directory
mkdir -p "$DATA_DIR"

# Trap Ctrl+C to exit cleanly
trap cleanup INT TERM

cleanup() {
    echo -e "\n${GREEN}Exiting monitoring dashboard...${NC}"
    rm -rf "$DATA_DIR"
    exit 0
}

# Get container stats
get_container_stats() {
    docker stats --no-stream --format "{{.Container}}|{{.CPUPerc}}|{{.MemUsage}}|{{.MemPerc}}|{{.NetIO}}|{{.BlockIO}}" 2>/dev/null | grep -E "(kafka|zookeeper|newrelic)" || true
}

# Get Kafka metrics
get_kafka_metrics() {
    local broker="${1:-kafka-xray-broker}"
    
    # Topic count
    TOPIC_COUNT=$(docker exec "$broker" kafka-topics --list --bootstrap-server localhost:9092 2>/dev/null | wc -l || echo "0")
    
    # Consumer groups
    CONSUMER_GROUPS=$(docker exec "$broker" kafka-consumer-groups --list --bootstrap-server localhost:9092 2>/dev/null | wc -l || echo "0")
    
    # Broker status
    if docker exec "$broker" kafka-broker-api-versions --bootstrap-server localhost:9092 &>/dev/null; then
        BROKER_STATUS="${GREEN}ONLINE${NC}"
    else
        BROKER_STATUS="${RED}OFFLINE${NC}"
    fi
    
    echo "$TOPIC_COUNT|$CONSUMER_GROUPS|$BROKER_STATUS"
}

# Get log statistics
get_log_stats() {
    local container="${1:-kafka-xray-broker}"
    local error_count=0
    local warn_count=0
    
    if docker ps --format "{{.Names}}" | grep -q "^${container}$"; then
        local logs=$(docker logs "$container" --since "5m" 2>&1 || true)
        error_count=$(echo "$logs" | grep -c -i "error" || true)
        warn_count=$(echo "$logs" | grep -c -i "warn" || true)
    fi
    
    echo "$error_count|$warn_count"
}

# Calculate trend (up, down, stable)
calculate_trend() {
    local current=$1
    local previous=$2
    
    if [ -z "$previous" ] || [ "$previous" = "0" ]; then
        echo "→"
    elif (( $(echo "$current > $previous * 1.1" | bc -l) )); then
        echo "↑"
    elif (( $(echo "$current < $previous * 0.9" | bc -l) )); then
        echo "↓"
    else
        echo "→"
    fi
}

# Draw progress bar
draw_progress_bar() {
    local percent=$1
    local width=${2:-20}
    local filled=$(echo "scale=0; $percent * $width / 100" | bc)
    local empty=$((width - filled))
    
    printf "["
    [ $filled -gt 0 ] && printf "%${filled}s" | tr ' ' '█'
    [ $empty -gt 0 ] && printf "%${empty}s" | tr ' ' '░'
    printf "]"
}

# Format bytes
format_bytes() {
    local bytes=$1
    if [ $bytes -lt 1024 ]; then
        echo "${bytes}B"
    elif [ $bytes -lt 1048576 ]; then
        echo "$(echo "scale=1; $bytes/1024" | bc)KB"
    elif [ $bytes -lt 1073741824 ]; then
        echo "$(echo "scale=1; $bytes/1048576" | bc)MB"
    else
        echo "$(echo "scale=1; $bytes/1073741824" | bc)GB"
    fi
}

# Store historical data
store_data() {
    local key=$1
    local value=$2
    local file="$DATA_DIR/$key.dat"
    
    echo "$value" >> "$file"
    
    # Keep only last N entries
    if [ $(wc -l < "$file") -gt $HISTORY_SIZE ]; then
        tail -n $HISTORY_SIZE "$file" > "$file.tmp"
        mv "$file.tmp" "$file"
    fi
}

# Get historical data
get_history() {
    local key=$1
    local file="$DATA_DIR/$key.dat"
    
    if [ -f "$file" ]; then
        tail -n 2 "$file" | head -n 1
    else
        echo ""
    fi
}

# Main monitoring loop
main() {
    local iteration=0
    
    while true; do
        clear
        
        # Header
        echo -e "${BOLD}${CYAN}╔════════════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${BOLD}${CYAN}║            Kafka Learning Lab Monitoring Dashboard                     ║${NC}"
        echo -e "${BOLD}${CYAN}║                    $(date '+%Y-%m-%d %H:%M:%S')                        ║${NC}"
        echo -e "${BOLD}${CYAN}╚════════════════════════════════════════════════════════════════════════╝${NC}"
        echo
        
        # Container Status
        echo -e "${BOLD}${WHITE}📦 Container Status${NC}"
        echo -e "${BLUE}─────────────────────────────────────────────────────────────────────────${NC}"
        
        # Get container stats
        local stats=$(get_container_stats)
        if [ -n "$stats" ]; then
            echo -e "${BOLD}Container               Status    CPU      Memory         Network I/O${NC}"
            while IFS='|' read -r name cpu mem mempct netio blockio; do
                # Remove % from CPU for comparison
                cpu_val=${cpu%\%}
                
                # Get previous CPU value
                prev_cpu=$(get_history "cpu_${name}")
                store_data "cpu_${name}" "$cpu_val"
                
                # Calculate trend
                trend=$(calculate_trend "$cpu_val" "$prev_cpu")
                
                # Status indicator
                if docker ps --format "{{.Names}}" | grep -q "^${name}$"; then
                    status="${GREEN}●${NC} UP   "
                else
                    status="${RED}●${NC} DOWN "
                fi
                
                # Color code CPU usage
                if (( $(echo "$cpu_val > 80" | bc -l) )); then
                    cpu_color=$RED
                elif (( $(echo "$cpu_val > 50" | bc -l) )); then
                    cpu_color=$YELLOW
                else
                    cpu_color=$GREEN
                fi
                
                printf "%-23s %s  ${cpu_color}%6s${NC} %s  %-14s %s\n" \
                    "$name" "$status" "$cpu" "$trend" "$mem" "$netio"
            done <<< "$stats"
        else
            echo -e "${YELLOW}No containers running${NC}"
        fi
        echo
        
        # Kafka Metrics
        echo -e "${BOLD}${WHITE}📊 Kafka Metrics${NC}"
        echo -e "${BLUE}─────────────────────────────────────────────────────────────────────────${NC}"
        
        kafka_metrics=$(get_kafka_metrics)
        IFS='|' read -r topics groups broker_status <<< "$kafka_metrics"
        
        # Store historical data
        prev_topics=$(get_history "topics")
        store_data "topics" "$topics"
        topic_trend=$(calculate_trend "$topics" "$prev_topics")
        
        echo -e "Broker Status:     $broker_status"
        echo -e "Topics:            ${BOLD}$topics${NC} $topic_trend"
        echo -e "Consumer Groups:   ${BOLD}$groups${NC}"
        
        # Show top topics by size (if available)
        if [ "$broker_status" = "${GREEN}ONLINE${NC}" ]; then
            echo -e "\n${BOLD}Top Topics:${NC}"
            docker exec kafka-xray-broker kafka-log-dirs \
                --describe \
                --bootstrap-server localhost:9092 2>/dev/null | \
                grep -E "topic:|size:" | \
                paste - - | \
                sort -k4 -nr | \
                head -3 | \
                while read line; do
                    topic=$(echo "$line" | grep -oP 'topic: \K[^ ]+' || true)
                    size=$(echo "$line" | grep -oP 'size: \K[0-9]+' || true)
                    if [ -n "$topic" ] && [ -n "$size" ]; then
                        echo -e "  - $topic: $(format_bytes $size)"
                    fi
                done || echo -e "  ${YELLOW}Unable to fetch topic sizes${NC}"
        fi
        echo
        
        # System Resources
        echo -e "${BOLD}${WHITE}💻 System Resources${NC}"
        echo -e "${BLUE}─────────────────────────────────────────────────────────────────────────${NC}"
        
        # CPU usage
        cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
        echo -n "CPU Usage:  "
        draw_progress_bar "${cpu_usage%.*}" 30
        echo " ${cpu_usage}%"
        
        # Memory usage
        mem_info=$(free -m | grep Mem)
        mem_total=$(echo $mem_info | awk '{print $2}')
        mem_used=$(echo $mem_info | awk '{print $3}')
        mem_percent=$((mem_used * 100 / mem_total))
        echo -n "Memory:     "
        draw_progress_bar "$mem_percent" 30
        echo " ${mem_used}MB/${mem_total}MB (${mem_percent}%)"
        
        # Disk usage
        disk_info=$(df -h . | tail -1)
        disk_percent=$(echo $disk_info | awk '{print $5}' | sed 's/%//')
        disk_used=$(echo $disk_info | awk '{print $3}')
        disk_total=$(echo $disk_info | awk '{print $2}')
        echo -n "Disk:       "
        draw_progress_bar "$disk_percent" 30
        echo " ${disk_used}/${disk_total} (${disk_percent}%)"
        echo
        
        # Log Analysis
        echo -e "${BOLD}${WHITE}📝 Log Analysis (Last 5 minutes)${NC}"
        echo -e "${BLUE}─────────────────────────────────────────────────────────────────────────${NC}"
        
        total_errors=0
        total_warns=0
        
        for container in kafka-xray-broker kafka-xray-zookeeper; do
            if docker ps --format "{{.Names}}" | grep -q "^${container}$"; then
                log_stats=$(get_log_stats "$container")
                IFS='|' read -r errors warns <<< "$log_stats"
                total_errors=$((total_errors + errors))
                total_warns=$((total_warns + warns))
                
                if [ $errors -gt 0 ] || [ $warns -gt 0 ]; then
                    printf "%-25s " "$container:"
                    [ $errors -gt 0 ] && printf "${RED}Errors: $errors${NC}  "
                    [ $warns -gt 0 ] && printf "${YELLOW}Warnings: $warns${NC}"
                    echo
                fi
            fi
        done
        
        if [ $total_errors -eq 0 ] && [ $total_warns -eq 0 ]; then
            echo -e "${GREEN}✅ No errors or warnings detected${NC}"
        fi
        echo
        
        # Recent Events
        echo -e "${BOLD}${WHITE}🔔 Recent Events${NC}"
        echo -e "${BLUE}─────────────────────────────────────────────────────────────────────────${NC}"
        
        # Check for recent container restarts
        docker ps --format "{{.Names}}|{{.Status}}" | grep -E "(kafka|zookeeper)" | while IFS='|' read -r name status; do
            if echo "$status" | grep -q "Restarting"; then
                echo -e "${RED}⚠️  $name is restarting${NC}"
            elif echo "$status" | grep -E -q "Up [0-9]+ seconds|Up [0-9]+ minutes" && ! echo "$status" | grep -q "Up [0-9]+ minutes"; then
                echo -e "${YELLOW}↻  $name recently started${NC}"
            fi
        done
        
        # Footer
        echo -e "${BLUE}─────────────────────────────────────────────────────────────────────────${NC}"
        echo -e "${CYAN}Refresh: ${REFRESH_INTERVAL}s | Press Ctrl+C to exit | Iteration: $((++iteration))${NC}"
        
        sleep $REFRESH_INTERVAL
    done
}

# Run main function
main