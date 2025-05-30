package main

import (
    "fmt"
    "log"
    "os"
    "strings"
    "time"
    
    "github.com/Shopify/sarama"
    "github.com/newrelic/infra-integrations-sdk/integration"
)

type TombstoneMonitor struct {
    client   sarama.Consumer
    topics   []string
    interval time.Duration
}

func main() {
    // Create integration
    i, err := integration.New("com.custom.kafka.tombstone", "1.0.0")
    if err != nil {
        log.Fatal(err)
    }

    // Get configuration from environment variables
    bootstrapServers := os.Getenv("BOOTSTRAP_SERVERS")
    if bootstrapServers == "" {
        bootstrapServers = "localhost:9092"
    }
    
    topicsEnv := os.Getenv("TOPICS")
    var topics []string
    if topicsEnv != "" {
        topics = strings.Split(topicsEnv, ",")
        // Trim spaces
        for i := range topics {
            topics[i] = strings.TrimSpace(topics[i])
        }
    } else {
        topics = []string{"orders", "payments", "inventory"}
    }

    // Configure Kafka client
    config := sarama.NewConfig()
    config.Version = sarama.V3_0_0_0  // Updated for modern Kafka
    
    client, err := sarama.NewConsumer(strings.Split(bootstrapServers, ","), config)
    if err != nil {
        log.Fatal(err)
    }
    defer client.Close()

    // Monitor topics
    topics := []string{"orders", "payments", "inventory"}
    monitor := &TombstoneMonitor{
        client:   client,
        topics:   topics,
        interval: 10 * time.Second,
    }

    // Collect metrics
    metrics, err := monitor.CollectTombstoneRatios()
    if err != nil {
        log.Fatal(err)
    }

    // Create entity and metrics
    entity, err := i.Entity("kafka-tombstone-monitor", "custom")
    if err != nil {
        log.Fatal(err)
    }
    for topic, ratio := range metrics {
        ms := entity.NewMetricSet("KafkaTopicTombstoneSample")
        ms.SetMetric("topic.name", topic, integration.ATTRIBUTE)
        ms.SetMetric("topic.tombstoneRatio", ratio, integration.GAUGE)
        ms.SetMetric("topic.tombstoneCheckTime", time.Now().Unix(), integration.ATTRIBUTE)
    }

    if err := i.Publish(); err != nil {
        log.Fatal(err)
    }
}

func (tm *TombstoneMonitor) CollectTombstoneRatios() (map[string]float64, error) {
    ratios := make(map[string]float64)
    
    for _, topic := range tm.topics {
        partitions, err := tm.client.Partitions(topic)
        if err != nil {
            log.Printf("Warning: Failed to get partitions for topic %s: %v", topic, err)
            continue
        }
        
        var totalMessages, tombstones int64
        
        for _, partition := range partitions {
            pc, err := tm.client.ConsumePartition(topic, partition, sarama.OffsetOldest)
            if err != nil {
                log.Printf("Warning: Failed to consume partition %d of topic %s: %v", partition, topic, err)
                continue
            }
            
            // Sample last 1000 messages
            timeout := time.After(5 * time.Second)
            messageCount := 0
            
        SampleLoop:
            for {
                select {
                case msg := <-pc.Messages():
                    totalMessages++
                    if msg.Value == nil {
                        tombstones++
                    }
                    messageCount++
                    if messageCount >= 1000 {
                        break SampleLoop
                    }
                case <-timeout:
                    break SampleLoop
                }
            }
            
            pc.Close()
        }
        
        if totalMessages > 0 {
            ratios[topic] = float64(tombstones) / float64(totalMessages) * 100
        }
    }
    
    return ratios, nil
}
