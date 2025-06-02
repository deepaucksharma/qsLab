import OHIConceptScene from '../../../components/scenes/OHIConceptScene'
import OHIBuilderScene from '../../../components/scenes/OHIBuilderScene'
import QueuesUIIntegrationScene from '../../../components/scenes/QueuesUIIntegrationScene'

export const customOHIEpisode = {
  metadata: {
    seriesId: 'tech-insights',
    seasonNumber: 2,
    episodeNumber: 4,
    title: 'Cloud Native Security: Custom OHI Development',
    synopsis: 'Build a custom New Relic On-Host Integration to bring Kafka Share Groups metrics into the Queues & Streams UI.',
    runtime: 50,
    rating: 'Expert',
    genres: ['New Relic', 'OHI', 'Cloud Native', 'Integration']
  },
  scenes: [
    {
      id: 'ohi-concept',
      title: 'Understanding On-Host Integrations',
      duration: 480,
      component: OHIConceptScene
    },
    {
      id: 'ohi-builder',
      title: 'Building the Integration',
      duration: 1200,
      component: OHIBuilderScene
    },
    {
      id: 'queues-ui',
      title: 'Queues & Streams UI Integration',
      duration: 1200,
      component: QueuesUIIntegrationScene
    }
  ]
}