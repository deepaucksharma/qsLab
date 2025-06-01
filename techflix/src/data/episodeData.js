export const episodeData = {
  id: 'kafka-share-groups-ep1',
  title: 'Understanding Kafka Share Groups',
  description: 'An interactive deep dive into Apache Kafka 4.0 Share Groups functionality',
  duration: 900, // 15 minutes in seconds
  scenes: [
    {
      id: 'intro',
      title: 'Welcome to Kafka Share Groups',
      category: 'Introduction',
      description: 'Discover the revolutionary Share Groups feature in Apache Kafka 4.0 that simplifies consumer group management.',
      narration: 'Welcome to TechFlix. Today we\'re exploring one of the most exciting features in Apache Kafka 4.0: Share Groups. This new capability transforms how we think about message consumption patterns.',
      duration: 60,
      backgroundImage: null,
      interactiveElements: [
        {
          type: 'quiz',
          question: 'What is the primary benefit of Kafka Share Groups?',
          options: [
            'Improved performance through parallel processing',
            'Simplified consumer group management',
            'Better fault tolerance',
            'All of the above'
          ],
          correctAnswer: 3,
          explanation: 'Share Groups combine all these benefits: they enable parallel processing, simplify management, and provide better fault tolerance through automatic rebalancing.'
        }
      ]
    },
    {
      id: 'concepts',
      title: 'Core Concepts',
      category: 'Fundamentals',
      description: 'Learn the fundamental concepts behind Share Groups and how they differ from traditional consumer groups.',
      narration: 'Unlike traditional consumer groups where each partition is assigned to a single consumer, Share Groups allow multiple consumers to process messages from the same partition concurrently.',
      duration: 120,
      backgroundImage: null,
      interactiveElements: [
        {
          type: 'quiz',
          question: 'How do Share Groups differ from traditional consumer groups?',
          code: `// Traditional Consumer Group\nconsumer.subscribe(Arrays.asList("topic"));\n\n// Share Group\nconsumer.subscribe(Arrays.asList("topic"), \n  ShareGroupConsumerConfig.builder()\n    .groupId("share-group-1")\n    .build());`,
          options: [
            'Share Groups use different APIs',
            'Share Groups allow concurrent processing of the same partition',
            'Share Groups require special configuration',
            'Share Groups are only for high-throughput scenarios'
          ],
          correctAnswer: 1,
          explanation: 'The key difference is that Share Groups enable multiple consumers to process messages from the same partition simultaneously, breaking the traditional one-partition-per-consumer limitation.'
        }
      ]
    },
    {
      id: 'implementation',
      title: 'Implementation Patterns',
      category: 'Advanced',
      description: 'Explore practical implementation patterns and best practices for Share Groups in production environments.',
      narration: 'When implementing Share Groups, consider factors like message ordering, processing guarantees, and scaling strategies. Let\'s examine some common patterns.',
      duration: 180,
      backgroundImage: null,
      interactiveElements: [
        {
          type: 'quiz',
          question: 'Which pattern is recommended for order-sensitive processing with Share Groups?',
          code: `// Pattern A: Key-based routing\nProperties props = new Properties();\nprops.put("key.deserializer", StringDeserializer.class);\nprops.put("partition.assignment.strategy", "KeyBasedStrategy");\n\n// Pattern B: Sequential processing\nprops.put("share.group.processing.mode", "sequential");\n\n// Pattern C: Hybrid approach\nprops.put("share.group.ordered.partitions", "0,1,2");`,
          options: [
            'Pattern A: Key-based routing',
            'Pattern B: Sequential processing',
            'Pattern C: Hybrid approach',
            'None - Share Groups cannot maintain order'
          ],
          correctAnswer: 2,
          explanation: 'The hybrid approach allows you to designate specific partitions for ordered processing while allowing parallel processing on others, giving you the best of both worlds.'
        }
      ]
    },
    {
      id: 'monitoring',
      title: 'Monitoring & Observability',
      category: 'Operations',
      description: 'Learn how to monitor Share Group performance and troubleshoot common issues in production.',
      narration: 'Effective monitoring of Share Groups requires understanding new metrics like concurrent processing ratios, message acknowledgment patterns, and consumer coordination overhead.',
      duration: 120,
      backgroundImage: null,
      interactiveElements: [
        {
          type: 'quiz',
          question: 'Which metric is most important for Share Group performance monitoring?',
          options: [
            'Consumer lag',
            'Concurrent processing ratio',
            'Message acknowledgment rate',
            'All of the above'
          ],
          correctAnswer: 3,
          explanation: 'All these metrics are crucial: consumer lag shows overall performance, concurrent processing ratio indicates efficiency, and acknowledgment rate reveals potential issues with message processing.'
        }
      ]
    },
    {
      id: 'conclusion',
      title: 'Real-World Applications',
      category: 'Case Studies',
      description: 'Discover how leading companies are leveraging Share Groups to solve complex distributed processing challenges.',
      narration: 'Share Groups are already being used in production by companies processing billions of messages daily. Let\'s look at some real-world success stories and lessons learned.',
      duration: 150,
      backgroundImage: null,
      interactiveElements: [
        {
          type: 'quiz',
          question: 'What is the primary use case where Share Groups excel?',
          options: [
            'Strict ordering requirements',
            'High-throughput, parallel processing',
            'Low-latency messaging',
            'Simple pub-sub patterns'
          ],
          correctAnswer: 1,
          explanation: 'Share Groups excel in high-throughput scenarios where you need parallel processing capabilities while maintaining the flexibility to scale consumers independently of partition count.'
        }
      ]
    }
  ]
}