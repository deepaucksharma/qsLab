// Key Shifts Critical Metrics Episode - Cinematic Implementation
import TradeOffsScene from './scenes/TradeOffsScene'
import MetricSpotlightScene from './scenes/MetricSpotlightScene'
import ZeroLagFallacyScene from './scenes/ZeroLagFallacyScene'
import ModuleRecapScene from './scenes/ModuleRecapScene'

export const criticalMetricsShiftsEpisode = {
  metadata: {
    seriesId: 'tech-insights',
    seasonNumber: 2,
    episodeNumber: 5,
    title: 'Key Shifts in Critical Metrics',
    synopsis: 'Discover the paradigm shifts in Kafka monitoring - from traditional consumer lag to share group metrics.',
    runtime: 45,
    rating: 'Advanced',
    genres: ['Kafka', 'Monitoring', 'Metrics', 'Share Groups'],
    cinematicTheme: 'tech-evolution'
  },
  scenes: [
    {
      id: 'trade-offs',
      title: 'The Trade-off Dilemma',
      duration: 12,
      component: TradeOffsScene,
      phases: {
        hook: { start: 0, duration: 2 },
        problem: { start: 2, duration: 3 },
        exploration: { start: 5, duration: 5 },
        insight: { start: 10, duration: 2 }
      }
    },
    {
      id: 'metric-spotlight',
      title: 'Metrics Under the Microscope',
      duration: 15,
      component: MetricSpotlightScene,
      phases: {
        intro: { start: 0, duration: 2 },
        deepDive: { start: 2, duration: 8 },
        comparison: { start: 10, duration: 3 },
        revelation: { start: 13, duration: 2 }
      }
    },
    {
      id: 'zero-lag-fallacy',
      title: 'The Zero Lag Fallacy',
      duration: 12,
      component: ZeroLagFallacyScene,
      phases: {
        setup: { start: 0, duration: 3 },
        demonstration: { start: 3, duration: 5 },
        reality: { start: 8, duration: 4 }
      }
    },
    {
      id: 'module-recap',
      title: 'Your Monitoring Evolution',
      duration: 6,
      component: ModuleRecapScene,
      phases: {
        summary: { start: 0, duration: 3 },
        callToAction: { start: 3, duration: 3 }
      }
    }
  ],
  interactiveMoments: [
    {
      id: 'metric-quiz',
      timestamp: 25,
      type: 'quiz',
      question: 'Which metric best indicates share group health?',
      options: [
        'Consumer lag',
        'Records unacknowledged age',
        'Partition count',
        'Throughput rate'
      ],
      correctAnswer: 1
    }
  ]
}