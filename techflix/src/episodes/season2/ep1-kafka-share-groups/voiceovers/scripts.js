/**
 * Voice-over scripts for S2E1: Kafka Share Groups
 * Each scene has multiple segments with timing information
 */

export const voiceOverScripts = {
  // Scene 1: Evolution Timeline (480s = 8 minutes)
  evolution: {
    segments: [
      {
        id: 'evolution-intro',
        startTime: 0,
        duration: 15,
        text: "In 2011, LinkedIn faced a crisis. Their monolithic architecture was crumbling under the weight of 175 million users. They needed something revolutionary.",
        voice: 'en-US-GuyNeural',
        emotion: 'narrative'
      },
      {
        id: 'evolution-birth',
        startTime: 15,
        duration: 20,
        text: "Enter Apache Kafka. Named after the author Franz Kafka, it promised to untangle the complexities of distributed data streaming. But the journey from version 0.7 to today's 4.0 would be nothing short of transformative.",
        voice: 'en-US-GuyNeural',
        emotion: 'hopeful'
      },
      {
        id: 'evolution-early-days',
        startTime: 35,
        duration: 25,
        text: "The early days were humble. Version 0.8 brought replication. Version 0.9 introduced the new consumer API. Each release solved problems, but also revealed new limitations. The most persistent? The rigid coupling between partitions and consumers.",
        voice: 'en-US-GuyNeural',
        emotion: 'technical'
      },
      {
        id: 'evolution-growth',
        startTime: 60,
        duration: 20,
        text: "As Kafka grew from handling millions to trillions of messages daily, this limitation became a bottleneck. Companies like Uber, Netflix, and Airbnb pushed Kafka to its limits, exposing the need for a fundamental rethink.",
        voice: 'en-US-GuyNeural',
        emotion: 'serious'
      },
      {
        id: 'evolution-transformation',
        startTime: 80,
        duration: 15,
        text: "By 2019, Kafka processed over 7 trillion messages per day at LinkedIn alone. The platform that started as a simple message queue had become the nervous system of the modern internet.",
        voice: 'en-US-GuyNeural',
        emotion: 'impressive'
      }
    ]
  },

  // Scene 2: Bottleneck Demo (480s = 8 minutes)
  bottleneck: {
    segments: [
      {
        id: 'bottleneck-intro',
        startTime: 0,
        duration: 12,
        text: "Let's visualize the problem. In traditional Kafka consumer groups, each partition can only be consumed by one consumer at a time. Watch what happens as we scale.",
        voice: 'en-US-JennyNeural',
        emotion: 'explanatory'
      },
      {
        id: 'bottleneck-demo-1',
        startTime: 12,
        duration: 15,
        text: "With 3 partitions and 3 consumers, perfect balance. Each consumer processes one partition. But add a fourth consumer, and it sits idle. This is the partition barrier.",
        voice: 'en-US-JennyNeural',
        emotion: 'demonstrative'
      },
      {
        id: 'bottleneck-real-world',
        startTime: 27,
        duration: 20,
        text: "In the real world, this creates massive inefficiencies. Imagine Black Friday at an e-commerce company. Traffic spikes 10x, but you can't scale beyond your partition count. Critical orders get delayed. Revenue is lost.",
        voice: 'en-US-JennyNeural',
        emotion: 'urgent'
      },
      {
        id: 'bottleneck-attempts',
        startTime: 47,
        duration: 18,
        text: "Teams tried workarounds. Over-partitioning led to overhead. Consumer pooling added complexity. Custom solutions created technical debt. The community knew: Kafka needed a native solution.",
        voice: 'en-US-JennyNeural',
        emotion: 'frustrated'
      },
      {
        id: 'bottleneck-cost',
        startTime: 65,
        duration: 15,
        text: "The cost wasn't just technical. Companies reported spending millions on infrastructure, only to hit the same scaling walls. The partition limit had become Kafka's Achilles' heel.",
        voice: 'en-US-JennyNeural',
        emotion: 'serious'
      }
    ]
  },

  // Scene 3: Share Groups Architecture (600s = 10 minutes)
  'share-groups': {
    segments: [
      {
        id: 'sharegroups-revelation',
        startTime: 0,
        duration: 12,
        text: "In 2023, KIP-932 introduced Share Groups. The breakthrough? Decouple consumers from partitions entirely. Revolutionary simplicity.",
        voice: 'en-US-GuyNeural',
        emotion: 'exciting'
      },
      {
        id: 'sharegroups-how-it-works',
        startTime: 12,
        duration: 25,
        text: "Share Groups transform Kafka into a true distributed queue. Messages from any partition can be delivered to any consumer. No more idle consumers. No more partition barriers. Just pure, scalable consumption.",
        voice: 'en-US-GuyNeural',
        emotion: 'explanatory'
      },
      {
        id: 'sharegroups-architecture',
        startTime: 37,
        duration: 20,
        text: "The architecture is elegant. A share group coordinator manages message distribution. Consumers acknowledge processing. Failed messages get redelivered. It's like having a smart load balancer built into Kafka itself.",
        voice: 'en-US-GuyNeural',
        emotion: 'technical'
      },
      {
        id: 'sharegroups-demo',
        startTime: 57,
        duration: 18,
        text: "Watch the magic happen. Ten consumers, three partitions. All consumers stay busy. Add more consumers? They immediately start processing. Remove consumers? Work redistributes seamlessly.",
        voice: 'en-US-GuyNeural',
        emotion: 'demonstrative'
      },
      {
        id: 'sharegroups-benefits',
        startTime: 75,
        duration: 22,
        text: "The benefits cascade. True elastic scaling. Simplified operations. Better resource utilization. Companies report 60% reduction in infrastructure costs and 10x improvement in scaling flexibility.",
        voice: 'en-US-GuyNeural',
        emotion: 'impressive'
      },
      {
        id: 'sharegroups-paradigm-shift',
        startTime: 97,
        duration: 15,
        text: "This isn't just an improvement. It's a paradigm shift. Share Groups transform Kafka from a partitioned log into a cloud-native streaming platform ready for the next decade.",
        voice: 'en-US-GuyNeural',
        emotion: 'visionary'
      }
    ]
  },

  // Scene 4: Real-World Impact (360s = 6 minutes)
  impact: {
    segments: [
      {
        id: 'impact-intro',
        startTime: 0,
        duration: 10,
        text: "The impact is already reshaping the industry. Let's look at early adopters and their transformative results.",
        voice: 'en-US-AriaNeural',
        emotion: 'professional'
      },
      {
        id: 'impact-case-1',
        startTime: 10,
        duration: 20,
        text: "A major financial institution processing payment transactions. Before Share Groups: 1000 partitions, complex consumer coordination, 15-minute peak delays. After: 100 partitions, simple scaling, sub-second processing even during peaks.",
        voice: 'en-US-AriaNeural',
        emotion: 'case-study'
      },
      {
        id: 'impact-case-2',
        startTime: 30,
        duration: 18,
        text: "An e-commerce giant handling inventory updates. Share Groups enabled them to reduce their Kafka cluster size by 70% while improving throughput by 5x. Black Friday? Handled with auto-scaling, zero manual intervention.",
        voice: 'en-US-AriaNeural',
        emotion: 'impressive'
      },
      {
        id: 'impact-metrics',
        startTime: 48,
        duration: 15,
        text: "The metrics speak volumes. 80% reduction in operational complexity. 90% improvement in resource utilization. 99.99% message delivery guarantee maintained. This is the future of event streaming.",
        voice: 'en-US-AriaNeural',
        emotion: 'data-driven'
      },
      {
        id: 'impact-conclusion',
        startTime: 63,
        duration: 20,
        text: "Share Groups represent more than a feature. They're Kafka's evolution into a truly cloud-native platform. As we move toward Kafka 5.0 and beyond, the possibilities are limitless. The future of event streaming has arrived.",
        voice: 'en-US-AriaNeural',
        emotion: 'inspirational'
      }
    ]
  }
}

// Voice configuration for Edge TTS
export const voiceConfig = {
  'en-US-GuyNeural': {
    name: 'Microsoft Guy Online (Natural) - English (United States)',
    language: 'en-US',
    gender: 'Male',
    styles: ['narrative', 'hopeful', 'technical', 'serious', 'impressive', 'exciting', 'explanatory', 'demonstrative', 'visionary']
  },
  'en-US-JennyNeural': {
    name: 'Microsoft Jenny Online (Natural) - English (United States)',
    language: 'en-US', 
    gender: 'Female',
    styles: ['explanatory', 'demonstrative', 'urgent', 'frustrated', 'serious']
  },
  'en-US-AriaNeural': {
    name: 'Microsoft Aria Online (Natural) - English (United States)',
    language: 'en-US',
    gender: 'Female',
    styles: ['professional', 'case-study', 'impressive', 'data-driven', 'inspirational']
  }
}

// Export all segments in order for batch generation
export const getAllSegments = () => {
  const allSegments = []
  
  Object.entries(voiceOverScripts).forEach(([scene, data]) => {
    data.segments.forEach(segment => {
      allSegments.push({
        ...segment,
        scene,
        filename: `s2e1-${scene}-${segment.id}.mp3`
      })
    })
  })
  
  return allSegments
}