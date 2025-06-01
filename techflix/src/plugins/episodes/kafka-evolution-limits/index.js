import { EpisodePlugin } from '../../core/EpisodePlugin';
import KafkaRefresherScene from './scenes/KafkaRefresherScene';
import TraditionalLimitsScene from './scenes/TraditionalLimitsScene';
import SkipInteractive from './components/interactive/SkipInteractive';

export default class KafkaEvolutionLimitsEpisode extends EpisodePlugin {
  getMetadata() {
    return {
      id: 'kafka-evolution-limits',
      title: 'The Evolution & Limitations of Kafka',
      description: "Explore Kafka's journey from traditional consumer groups to the need for Share Groups",
      seasonNumber: 1,
      episodeNumber: 1,
      duration: 195, // seconds
      level: 'Intermediate',
      tags: ['kafka', 'consumer-groups', 'scalability', 'share-groups'],
      thumbnailUrl: './assets/S1_E1_thumb_episode-thumbnail.jpg',
      releaseDate: '2024-02-01',
      prerequisites: ['Basic messaging concepts'],
      learningOutcomes: [
        'Understand traditional Kafka consumer group architecture',
        'Identify scalability limitations',
        'Recognize when Share Groups are needed'
      ]
    };
  }

  getScenes() {
    return [
      {
        id: 'kafka-refresher',
        type: 'intro',
        component: KafkaRefresherScene,
        title: 'Kafka Refresher / Jump Ahead',
        duration: 45,
        category: 'Introduction',
        description: 'Optional Kafka fundamentals refresher with skip option',
        narration: 'New to Kafka or need a quick primer? Great!',
        mood: 'epic-intro',
        backgroundImage: './assets/S1_E1_S1_bg_kafka-universe.jpg'
      },
      {
        id: 'traditional-limits',
        type: 'content',
        component: TraditionalLimitsScene,
        title: 'Traditional Consumer Group Limits',
        duration: 150,
        category: 'Core Concepts',
        description: 'Understanding the bottlenecks of traditional consumer groups',
        narration: 'Imagine Kafka partitions as highway lanes...',
        mood: 'tension-building'
      }
    ];
  }

  getInteractiveElements() {
    return [
      {
        id: 'skip-intro',
        sceneId: 'kafka-refresher',
        timestamp: 3,
        component: SkipInteractive,
        duration: 10,
        data: {
          skipToScene: 'traditional-limits',
          buttonText: 'Kafka Pro? Jump to Share Groups',
          analytics: {
            action: 'skip_intro',
            category: 'navigation'
          }
        }
      }
    ];
  }
}
