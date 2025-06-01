import TradeOffsScene from './scenes/TradeOffsScene.jsx';
import MetricSpotlightScene from './scenes/MetricSpotlightScene.jsx';
import ZeroLagFallacyScene from './scenes/ZeroLagFallacyScene.jsx';
import ModuleRecapScene from './scenes/ModuleRecapScene.jsx';

export const keyShiftsCriticalMetricsEpisode = {
  metadata: {
    seriesId: 'tech-insights',
    seasonNumber: 1,
    episodeNumber: 3,
    title: 'Key Shifts & Critical Metrics',
    synopsis: 'Understand trade-offs of Share Groups and learn the vital metrics to monitor.',
    runtime: 300,
    rating: 'Advanced',
    genres: ['Kafka', 'Share Groups', 'Metrics']
  },
  scenes: [
    {
      id: 'trade-offs',
      title: 'Trade-offs',
      duration: 75,
      component: TradeOffsScene
    },
    {
      id: 'metric-spotlight',
      title: 'Metric Spotlight',
      duration: 90,
      component: MetricSpotlightScene
    },
    {
      id: 'zero-lag-fallacy',
      title: 'Zero Lag Fallacy',
      duration: 75,
      component: ZeroLagFallacyScene
    },
    {
      id: 'module-recap',
      title: 'Module Recap',
      duration: 60,
      component: ModuleRecapScene
    }
  ]
};

export default keyShiftsCriticalMetricsEpisode;
