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
          episodeData: {
            metadata: {
              seriesId: 'tech-insights',
              seasonNumber: 1,
              episodeNumber: 1,
              title: 'Breaking the Partition Barrier',
              synopsis: 'Discover how Kafka Share Groups revolutionize message consumption',
              runtime: 45,
              rating: 'Advanced',
              genres: ['Kafka', 'Distributed Systems', 'Streaming']
            },
            scenes: [
              {
                id: 'opening',
                title: 'Epic Opening',
                duration: 8,
                component: 'CinematicOpeningScene'
              },
              {
                id: 'problem',
                title: 'The Problem',
                duration: 15,
                component: 'ProblemVisualizationScene'
              },
              {
                id: 'code',
                title: 'Code Examples',
                duration: 20,
                component: 'CodeExampleScene',
                interactiveMoments: [
                  {
                    id: 'state-machine',
                    timestamp: 15,
                    component: 'InteractiveStateMachine'
                  }
                ]
              }
            ]
          }
        },
        {
          number: 2,
          title: "Performance Metrics Deep Dive",
          description: "Master the art of system observation with advanced monitoring techniques.",
          duration: "38m",
          level: "Intermediate",
          tags: ["Monitoring", "Observability", "Metrics"],
          hasContent: false
        },
        {
          number: 3,
          title: "Microservices Architecture",
          description: "Design resilient distributed systems with modern microservices patterns.",
          duration: "52m",
          level: "Advanced",
          tags: ["Architecture", "Microservices", "Design Patterns"],
          hasContent: false
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
          title: "Distributed Systems Consensus",
          description: "Explore Raft, Paxos, and modern consensus algorithms.",
          duration: "55m",
          level: "Expert",
          tags: ["Consensus", "Distributed Systems", "Algorithms"],
          hasContent: false
        },
        {
          number: 2,
          title: "Real-time Stream Processing",
          description: "Build high-performance streaming pipelines with Apache Flink.",
          duration: "42m",
          level: "Advanced",
          tags: ["Streaming", "Flink", "Real-time"],
          hasContent: false
        },
        {
          number: 3,
          title: "Cloud Native Security",
          description: "Implement zero-trust architecture in Kubernetes environments.",
          duration: "50m",
          level: "Advanced",
          tags: ["Security", "Kubernetes", "Zero Trust"],
          hasContent: false
        }
      ]
    }
  ]
}