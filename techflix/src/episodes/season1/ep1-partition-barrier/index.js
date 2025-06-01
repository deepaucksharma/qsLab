import CinematicOpeningScene from '../../../components/scenes/CinematicOpeningScene'
import ProblemVisualizationScene from '../../../components/scenes/ProblemVisualizationScene'
import CodeExampleScene from '../../../components/scenes/CodeExampleScene'

export const partitionBarrierEpisode = {
  metadata: {
    seriesId: 'tech-insights',
    seasonNumber: 1,
    episodeNumber: 1,
    title: 'Breaking the Partition Barrier',
    synopsis: 'Discover how Kafka Share Groups revolutionize message consumption by removing the partition-consumer limit.',
    runtime: 45,
    rating: 'Advanced',
    genres: ['Kafka', 'Distributed Systems', 'Streaming']
  },
  scenes: [
    {
      id: 'opening',
      title: 'Epic Opening',
      duration: 8,
      component: CinematicOpeningScene
    },
    {
      id: 'problem',
      title: 'The Problem',
      duration: 15,
      component: ProblemVisualizationScene
    },
    {
      id: 'code',
      title: 'Code Examples',
      duration: 20,
      component: CodeExampleScene,
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