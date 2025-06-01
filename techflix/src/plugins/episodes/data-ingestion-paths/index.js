import FlexIngestionScene from './scenes/FlexIngestionScene'
import NRQLDemoScene from './scenes/NRQLDemoScene'
import NriKafkaReminderScene from './scenes/NriKafkaReminderScene'
import ModuleRecapScene from './scenes/ModuleRecapScene'
export const dataIngestionPathsEpisode = {
  metadata: {
    seriesId: 'tech-insights',
    seasonNumber: 2,
    episodeNumber: 3,
    title: 'Data Ingestion Paths: Kafka to New Relic',
    synopsis: 'Different ways metrics flow depending on Kafka hosting.',
    runtime: 270,
    rating: 'Intermediate',
    genres: ['kafka', 'monitoring', 'new relic']
  },
  scenes: [
    {
      id: 'flex-ingestion',
      title: 'Quick Visibility with Flex',
      duration: 75,
      component: FlexIngestionScene
    },
    {
      id: 'nrql-demo',
      title: 'RecordsUnacked Live in NRQL',
      duration: 75,
      component: NRQLDemoScene
    },
    {
      id: 'nri-kafka-reminder',
      title: 'nri-kafka Reminder',
      duration: 60,
      component: NriKafkaReminderScene
    },
    {
      id: 'module-recap',
      title: 'Module 2 Recap',
      duration: 60,
      component: ModuleRecapScene
    }
  ]
}

export default dataIngestionPathsEpisode
