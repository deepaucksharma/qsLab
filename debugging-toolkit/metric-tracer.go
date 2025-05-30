package main

import (
    "fmt"
    "os"
    "os/exec"
    "strings"
    "time"
    "strconv"
)

type MetricTrace struct {
    MetricName   string
    MBeanName    string
    JMXValue     float64
    Timestamp    time.Time
    Rate         float64
}

func main() {
    if len(os.Args) < 2 {
        fmt.Println("Usage: metric-tracer <mbean_name>")
        fmt.Println("Example: metric-tracer 'kafka.server:type=BrokerTopicMetrics,name=MessagesInPerSec'")
        os.Exit(1)
    }

    mbean := os.Args[1]
    
    // Step 1: Query JMX
    fmt.Printf("🔍 Tracing metric from MBean: %s\n", mbean)
    
    value1 := queryJMX(mbean, "Count")
    time1 := time.Now()
    
    fmt.Printf("📊 Initial value: %.0f at %s\n", value1, time1.Format("15:04:05"))
    
    // Wait 10 seconds
    fmt.Println("⏳ Waiting 10 seconds...")
    time.Sleep(10 * time.Second)
    
    value2 := queryJMX(mbean, "Count")
    time2 := time.Now()
    
    // Calculate rate
    rate := (value2 - value1) / time2.Sub(time1).Seconds()
    
    fmt.Printf("📊 Final value: %.0f at %s\n", value2, time2.Format("15:04:05"))
    fmt.Printf("📈 Calculated rate: %.2f/sec\n", rate)
    
    // Show how nri-kafka would present this
    fmt.Printf("\n🎯 In New Relic, this would appear as:\n")
    fmt.Printf("   Metric: %s\n", extractMetricName(mbean))
    fmt.Printf("   Value: %.2f\n", rate)
    fmt.Printf("   Type: gauge\n")
}

func queryJMX(mbean, attribute string) float64 {
    cmd := exec.Command("docker", "exec", "kafka-xray-jmxterm", 
        "java", "-jar", "/jmxterm.jar", "-n", "-v", "silent")
    
    stdin, _ := cmd.StdinPipe()
    stdin.Write([]byte(fmt.Sprintf("open localhost:9999\nget -b %s %s\n", mbean, attribute)))
    stdin.Close()
    
    output, _ := cmd.Output()
    
    // Parse output: "Count = 12345"
    lines := strings.Split(string(output), "\n")
    for _, line := range lines {
        if strings.Contains(line, "=") {
            parts := strings.Split(line, "=")
            if len(parts) == 2 {
                valueStr := strings.TrimSpace(parts[1])
                value, _ := strconv.ParseFloat(valueStr, 64)
                return value
            }
        }
    }
    return 0
}

func extractMetricName(mbean string) string {
    // Extract metric name from MBean
    if strings.Contains(mbean, "MessagesInPerSec") {
        return "broker.messagesInPerSec"
    } else if strings.Contains(mbean, "BytesInPerSec") {
        return "broker.bytesInPerSec"
    } else if strings.Contains(mbean, "BytesOutPerSec") {
        return "broker.bytesOutPerSec"
    }
    return "unknown.metric"
}
