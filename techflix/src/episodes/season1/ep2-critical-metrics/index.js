import TradeOffsScene from '../../../components/scenes/TradeOffsScene'
import MetricSpotlightScene from '../../../components/scenes/MetricSpotlightScene'
import ZeroLagFallacyScene from '../../../components/scenes/ZeroLagFallacyScene'
import ModuleRecapScene from '../../../components/scenes/ModuleRecapScene'

export const criticalMetricsEpisode = {
  metadata: {
    seriesId: 'tech-insights',
    seasonNumber: 1,
    episodeNumber: 2,
    title: 'Performance Metrics Deep Dive',
    synopsis: 'Master the art of system observation with Share Groups metrics and understand critical trade-offs.',
    runtime: 38,
    rating: 'Intermediate',
    genres: ['Kafka', 'Monitoring', 'Metrics', 'Share Groups']
  },
  scenes: [
    {
      id: 'trade-offs',
      title: 'Share Groups vs Traditional: The Trade-offs',
      duration: 540,
      component: TradeOffsScene
    },
    {
      id: 'metric-spotlight',
      title: 'Critical Metrics Spotlight',
      duration: 660,
      component: MetricSpotlightScene
    },
    {
      id: 'zero-lag-fallacy',
      title: 'The Zero Lag Fallacy',
      duration: 540,
      component: ZeroLagFallacyScene
    },
    {
      id: 'module-recap',
      title: 'Key Takeaways',
      duration: 540,
      component: ModuleRecapScene
    }
  ]
}