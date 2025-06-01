import { EpisodePlugin } from '../../core/EpisodePlugin';
import EvolutionTimelineScene from './scenes/EvolutionTimelineScene';
import BottleneckDemoScene from './scenes/BottleneckDemoScene';
import ShareGroupArchitectureScene from './scenes/ShareGroupArchitectureScene';
import ImpactMetricsScene from './scenes/ImpactMetricsScene';

export default class KafkaShareGroupsUltraEpisode extends EpisodePlugin {
  getMetadata() {
    return {
      id: 'kafka-share-groups-ultra',
      title: 'Kafka Share Groups: The Future of Event Streaming',
      description: 'Explore Apache Kafka 4.0\'s revolutionary Share Groups feature that breaks the scalability bottleneck of traditional consumer groups.',
      seasonNumber: 2,
      episodeNumber: 1,
      duration: 1920, // 32 minutes
      level: 'Advanced',
      tags: ['Kafka', 'Share Groups', 'Event Streaming', 'Distributed Systems', 'Apache Kafka 4.0'],
      
      // Optional fields
      thumbnailUrl: './assets/thumbnail.jpg',
      releaseDate: '2025-01-15',
      prerequisites: [
        'Basic understanding of Apache Kafka',
        'Knowledge of consumer groups',
        'Familiarity with distributed systems concepts'
      ],
      learningOutcomes: [
        'Understand the limitations of traditional Kafka consumer groups',
        'Learn how Share Groups enable concurrent processing within partitions',
        'Master the architectural improvements in Kafka 4.0',
        'Evaluate real-world performance gains and use cases'
      ]
    };
  }

  getScenes() {
    return [
      {
        id: 'evolution',
        type: 'content',
        component: EvolutionTimelineScene,
        title: 'The Evolution of Apache Kafka',
        subtitle: 'From Consumer Groups to Share Groups Revolution',
        duration: 480, // 8 minutes
        category: 'Introduction',
        description: 'Journey through Kafka\'s evolution from its inception to the revolutionary Share Groups feature.',
        narration: 'Apache Kafka transformed how we handle real-time data streaming, powering everything from Netflix recommendations to Uber\'s real-time logistics. But as applications scaled to massive sizes, traditional consumer groups hit a fundamental scalability wall.',
        mood: 'epic-intro'
      },
      {
        id: 'bottleneck',
        type: 'content',
        component: BottleneckDemoScene,
        title: 'The Scalability Bottleneck',
        subtitle: 'When One-to-One Becomes a Limitation',
        duration: 480, // 8 minutes
        category: 'Problem Analysis',
        description: 'Understand the fundamental limitations of traditional consumer groups and why they create bottlenecks.',
        narration: 'In traditional consumer groups, each partition can only be processed by one consumer. This rigid constraint creates bottlenecks where fast messages get stuck behind slow ones, leading to underutilized resources and scaling nightmares.',
        mood: 'tension-building'
      },
      {
        id: 'share-groups',
        type: 'content',
        component: ShareGroupArchitectureScene,
        title: 'Share Groups: The Breakthrough',
        subtitle: 'Concurrent Processing Within Partitions',
        duration: 600, // 10 minutes
        category: 'Solution',
        description: 'Discover how Share Groups revolutionize Kafka by enabling concurrent message processing.',
        narration: 'Share Groups revolutionize Kafka by allowing multiple consumers to process messages from the same partition concurrently. This breakthrough enables true horizontal scaling while maintaining Kafka\'s delivery guarantees and ordering semantics.',
        mood: 'innovation-reveal'
      },
      {
        id: 'impact',
        type: 'content',
        component: ImpactMetricsScene,
        title: 'Real-World Transformation',
        subtitle: 'Performance Gains That Matter',
        duration: 360, // 6 minutes
        category: 'Results',
        description: 'See the dramatic performance improvements and real-world impact of Share Groups.',
        narration: 'Early adopters report 3x throughput improvements, 70% reduction in consumer management complexity, and seamless scaling during unpredictable traffic spikes. Share Groups are reshaping how we think about event-driven architectures.',
        mood: 'triumphant'
      }
    ];
  }

  getInteractiveElements() {
    return [
      {
        id: 'state-transition-quiz',
        sceneId: 'share-groups',
        timestamp: 300, // 5 minutes into the scene
        component: null, // We'll implement this later if needed
        duration: 60,
        data: {
          question: 'What happens when a consumer fails to process a message in a Share Group?',
          options: [
            'The message is lost',
            'The message is automatically reassigned to another consumer',
            'The entire partition is blocked',
            'The consumer group fails'
          ],
          correctAnswer: 1,
          explanation: 'Share Groups automatically reassign failed messages to other available consumers, ensuring no message is lost and processing continues.'
        }
      }
    ];
  }

  getResourceRequirements() {
    return {
      images: [],
      videos: [],
      scripts: [],
      styles: ['./styles/ultra-theme.css']
    };
  }
}