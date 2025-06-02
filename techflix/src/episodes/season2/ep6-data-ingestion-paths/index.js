// Data Ingestion Paths Episode - Cinematic Implementation
import PathwaysIntroScene from './scenes/PathwaysIntroScene'
import DirectIngestionScene from './scenes/DirectIngestionScene'
import StreamProcessingScene from './scenes/StreamProcessingScene'
import HybridArchitectureScene from './scenes/HybridArchitectureScene'

export const dataIngestionPathsEpisode = {
  metadata: {
    seriesId: 'tech-insights',
    seasonNumber: 2,
    episodeNumber: 6,
    title: 'Data Ingestion Paths',
    synopsis: 'Master the art of data ingestion patterns in Kafka - from direct producer APIs to complex stream processing pipelines.',
    runtime: 50,
    rating: 'Intermediate',
    genres: ['Kafka', 'Data Engineering', 'Stream Processing', 'Architecture'],
    cinematicTheme: 'data-flow'
  },
  scenes: [
    {
      id: 'pathways-intro',
      title: 'The Data Journey',
      duration: 10,
      component: PathwaysIntroScene,
      phases: {
        opening: { start: 0, duration: 3 },
        challenge: { start: 3, duration: 4 },
        preview: { start: 7, duration: 3 }
      }
    },
    {
      id: 'direct-ingestion',
      title: 'Direct Producer Patterns',
      duration: 15,
      component: DirectIngestionScene,
      phases: {
        basics: { start: 0, duration: 5 },
        advanced: { start: 5, duration: 7 },
        optimization: { start: 12, duration: 3 }
      }
    },
    {
      id: 'stream-processing',
      title: 'Stream Processing Pipelines',
      duration: 15,
      component: StreamProcessingScene,
      phases: {
        concepts: { start: 0, duration: 4 },
        implementation: { start: 4, duration: 8 },
        patterns: { start: 12, duration: 3 }
      }
    },
    {
      id: 'hybrid-architecture',
      title: 'Hybrid Ingestion Strategies',
      duration: 10,
      component: HybridArchitectureScene,
      phases: {
        comparison: { start: 0, duration: 4 },
        bestPractices: { start: 4, duration: 4 },
        conclusion: { start: 8, duration: 2 }
      }
    }
  ],
  interactiveMoments: [
    {
      id: 'ingestion-choice',
      timestamp: 20,
      type: 'decision',
      question: 'Which ingestion pattern fits your use case?',
      options: [
        'High-throughput direct producer',
        'Kafka Streams transformation',
        'Connect source connector',
        'Hybrid approach'
      ],
      outcomes: {
        0: 'Perfect for real-time event streaming',
        1: 'Ideal for data enrichment and aggregation',
        2: 'Best for database CDC and batch imports',
        3: 'Balanced approach for complex requirements'
      }
    }
  ]
}