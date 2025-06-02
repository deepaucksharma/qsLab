import EvolutionTimelineSceneV2 from '../../../components/scenes/EvolutionTimelineSceneV2'
import BottleneckDemoScene from '../../../components/scenes/BottleneckDemoScene'
import ShareGroupArchitectureSceneV2 from '../../../components/scenes/ShareGroupArchitectureSceneV2'
import ImpactMetricsScene from '../../../components/scenes/ImpactMetricsScene'

export const kafkaShareGroupsEpisode = {
  metadata: {
    seriesId: 'tech-insights',
    seasonNumber: 2,
    episodeNumber: 1,
    title: 'Kafka Share Groups: The Future of Event Streaming',
    synopsis: 'Explore Apache Kafka 4.0\'s revolutionary Share Groups feature that breaks the scalability bottleneck of traditional consumer groups.',
    runtime: 32,
    rating: 'Advanced',
    genres: ['Kafka', 'Share Groups', 'Event Streaming', 'Distributed Systems']
  },
  scenes: [
    {
      id: 'evolution',
      title: 'The Evolution of Apache Kafka',
      duration: 480,
      component: EvolutionTimelineSceneV2
    },
    {
      id: 'bottleneck',
      title: 'The Scalability Bottleneck',
      duration: 480,
      component: BottleneckDemoScene
    },
    {
      id: 'share-groups',
      title: 'Share Groups: The Breakthrough',
      duration: 600,
      component: ShareGroupArchitectureSceneV2
    },
    {
      id: 'impact',
      title: 'Real-World Transformation',
      duration: 360,
      component: ImpactMetricsScene
    }
  ]
}