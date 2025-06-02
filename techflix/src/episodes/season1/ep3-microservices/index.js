import MicroservicesOverviewScene from '../../../components/scenes/MicroservicesOverviewScene'
import ServiceMeshScene from '../../../components/scenes/ServiceMeshScene'
import ResiliencePatternScene from '../../../components/scenes/ResiliencePatternScene'
import MicroservicesKafkaScene from '../../../components/scenes/MicroservicesKafkaScene'

export const microservicesEpisode = {
  metadata: {
    seriesId: 'tech-insights',
    seasonNumber: 1,
    episodeNumber: 3,
    title: 'Microservices Architecture',
    synopsis: 'Design resilient distributed systems with modern microservices patterns and Kafka as the backbone.',
    runtime: 52,
    rating: 'Advanced',
    genres: ['Architecture', 'Microservices', 'Design Patterns', 'Kafka']
  },
  scenes: [
    {
      id: 'microservices-overview',
      title: 'Microservices Fundamentals',
      duration: 600,
      component: MicroservicesOverviewScene
    },
    {
      id: 'service-mesh',
      title: 'Service Mesh & Communication',
      duration: 900,
      component: ServiceMeshScene
    },
    {
      id: 'resilience-patterns',
      title: 'Resilience Patterns',
      duration: 720,
      component: ResiliencePatternScene
    },
    {
      id: 'kafka-backbone',
      title: 'Kafka as the Nervous System',
      duration: 900,
      component: MicroservicesKafkaScene
    }
  ]
}