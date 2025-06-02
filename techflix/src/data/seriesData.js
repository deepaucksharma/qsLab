import { partitionBarrierEpisode, criticalMetricsEpisode, microservicesEpisode, kafkaShareGroupsEpisode, jmxExplorationEpisode, prometheusSetupEpisode, customOHIEpisode, criticalMetricsShiftsEpisode, dataIngestionPathsEpisode, kafkaEvolutionLimitsEpisode, seriesFinaleEpisode } from '../episodes'

export const SERIES_DATA = {
  seasons: [
    {
      number: 1,
      title: "Season 1: Foundations",
      episodes: [
        {
          number: 1,
          title: "Breaking the Partition Barrier",
          description: "Discover how Kafka Share Groups revolutionize message consumption by removing the partition-consumer limit.",
          duration: "45m",
          level: "Advanced",
          tags: ["Kafka", "Distributed Systems", "Streaming"],
          hasContent: true,
          episodeData: partitionBarrierEpisode
        },
        {
          number: 2,
          title: "Performance Metrics Deep Dive",
          description: "Master the art of system observation with advanced monitoring techniques.",
          duration: "38m",
          level: "Intermediate",
          tags: ["Monitoring", "Observability", "Metrics"],
          hasContent: true,
          episodeData: criticalMetricsEpisode
        },
        {
          number: 3,
          title: "Microservices Architecture",
          description: "Design resilient distributed systems with modern microservices patterns.",
          duration: "52m",
          level: "Advanced",
          tags: ["Architecture", "Microservices", "Design Patterns"],
          hasContent: true,
          episodeData: microservicesEpisode
        },
        {
          number: 4,
          title: "Event-Driven Systems",
          description: "Build reactive applications using event sourcing and CQRS patterns.",
          duration: "48m",
          level: "Advanced",
          tags: ["Events", "CQRS", "Event Sourcing"],
          hasContent: false
        }
      ]
    },
    {
      number: 2,
      title: "Season 2: Advanced Topics",
      episodes: [
        {
          number: 1,
          title: "Kafka Share Groups: The Future of Event Streaming",
          description: "Explore Apache Kafka 4.0's revolutionary Share Groups feature that breaks the scalability bottleneck of traditional consumer groups.",
          duration: "32m",
          level: "Advanced",
          tags: ["Kafka", "Share Groups", "Event Streaming"],
          hasContent: true,
          episodeData: kafkaShareGroupsEpisode
        },
        {
          number: 2,
          title: "Distributed Systems Consensus",
          description: "Explore Raft, Paxos, and modern consensus algorithms.",
          duration: "55m",
          level: "Expert",
          tags: ["Consensus", "Distributed Systems", "Algorithms"],
          hasContent: true,
          episodeData: jmxExplorationEpisode
        },
        {
          number: 3,
          title: "Real-time Stream Processing",
          description: "Build high-performance streaming pipelines with Apache Flink.",
          duration: "42m",
          level: "Advanced",
          tags: ["Streaming", "Flink", "Real-time"],
          hasContent: true,
          episodeData: prometheusSetupEpisode
        },
        {
          number: 4,
          title: "Cloud Native Security",
          description: "Implement zero-trust architecture in Kubernetes environments.",
          duration: "50m",
          level: "Advanced",
          tags: ["Security", "Kubernetes", "Zero Trust"],
          hasContent: true,
          episodeData: customOHIEpisode
        },
        {
          number: 5,
          title: "Key Shifts in Critical Metrics",
          description: "Discover the paradigm shifts in Kafka monitoring - from traditional consumer lag to share group metrics.",
          duration: "45m",
          level: "Advanced",
          tags: ["Kafka", "Monitoring", "Metrics", "Share Groups"],
          hasContent: true,
          episodeData: criticalMetricsShiftsEpisode
        },
        {
          number: 6,
          title: "Data Ingestion Paths",
          description: "Master the art of data ingestion patterns in Kafka - from direct producer APIs to complex stream processing pipelines.",
          duration: "50m",
          level: "Intermediate",
          tags: ["Kafka", "Data Engineering", "Stream Processing", "Architecture"],
          hasContent: true,
          episodeData: dataIngestionPathsEpisode
        },
        {
          number: 7,
          title: "Kafka Evolution and Limits",
          description: "Journey through Kafka's evolution, understand its architectural limits, and glimpse the future of distributed streaming.",
          duration: "55m",
          level: "Expert",
          tags: ["Kafka", "Architecture", "Distributed Systems", "Future Tech"],
          hasContent: true,
          episodeData: kafkaEvolutionLimitsEpisode
        }
      ]
    },
    {
      number: 3,
      title: "Season 3: Series Finale",
      episodes: [
        {
          number: 3,
          title: "Series Finale: You're Ready to Observe!",
          description: "Celebrate your journey from Kafka fundamentals to full observability mastery.",
          duration: "10m",
          level: "Advanced",
          tags: ["Finale", "Kafka", "Observability", "Share Groups"],
          hasContent: true,
          episodeData: seriesFinaleEpisode
        }
      ]
    }
  ]
}