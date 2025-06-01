import { EpisodePlugin } from '../../core/EpisodePlugin';
import CinematicOpeningScene from './scenes/CinematicOpeningScene';
import ProblemVisualizationScene from './scenes/ProblemVisualizationScene';
import CodeExampleScene from './scenes/CodeExampleScene';
import InteractiveStateMachine from './scenes/InteractiveStateMachine';

export default class KafkaShareGroupsEpisode extends EpisodePlugin {
  getMetadata() {
    return {
      id: 'kafka-share-groups-ep1',
      title: 'Breaking the Partition Barrier',
      description: 'Discover how Kafka Share Groups revolutionize message consumption patterns, enabling dynamic scaling and fault-tolerant processing',
      seasonNumber: 1,
      episodeNumber: 1,
      duration: 2700, // 45 minutes in seconds
      level: 'Advanced',
      tags: ['Kafka', 'Distributed Systems', 'Architecture', 'Share Groups'],
      thumbnailUrl: '/episodes/kafka-share-groups/assets/thumbnail.jpg',
      releaseDate: '2024-01-15',
      prerequisites: ['Basic Kafka knowledge', 'Understanding of consumer groups'],
      learningOutcomes: [
        'Understand the limitations of traditional Kafka consumer groups',
        'Master the Share Groups architecture and benefits',
        'Implement Share Groups in production scenarios',
        'Handle fault tolerance and scaling with Share Groups'
      ]
    };
  }

  getScenes() {
    return [
      {
        id: 'opening',
        type: 'cinematic',
        component: CinematicOpeningScene,
        title: 'Epic Opening',
        duration: 8,
        category: 'Introduction'
      },
      {
        id: 'problem-visualization',
        type: 'visualization',
        component: ProblemVisualizationScene,
        title: 'The Consumer Group Problem',
        duration: 300,
        category: 'Fundamentals',
        description: 'Visualizing the limitations of traditional consumer groups',
        narration: 'Let\'s explore why traditional Kafka consumer groups hit scaling limits...'
      },
      {
        id: 'share-groups-intro',
        type: 'visualization',
        component: ProblemVisualizationScene,
        title: 'Introducing Share Groups',
        duration: 420,
        category: 'Fundamentals',
        description: 'Understanding the Share Groups solution',
        narration: 'Share Groups revolutionize how we think about message consumption...'
      },
      {
        id: 'code-examples',
        type: 'code',
        component: CodeExampleScene,
        title: 'Implementation Deep Dive',
        duration: 600,
        category: 'Advanced',
        description: 'Implementing Share Groups in production',
        narration: 'Let\'s see how to implement Share Groups in your applications...',
        interactiveElements: [
          {
            type: 'quiz',
            question: 'What is the primary benefit of Share Groups over Consumer Groups?',
            options: [
              'Lower latency',
              'Better compression',
              'Dynamic partition assignment across multiple consumers',
              'Simpler configuration'
            ],
            correctAnswer: 2,
            explanation: 'Share Groups allow multiple consumers to share partitions dynamically, breaking the one-partition-per-consumer limitation.'
          }
        ]
      },
      {
        id: 'fault-tolerance',
        type: 'visualization',
        component: ProblemVisualizationScene,
        title: 'Fault Tolerance & Recovery',
        duration: 480,
        category: 'Operations',
        description: 'Handling failures with Share Groups',
        narration: 'Share Groups provide robust fault tolerance mechanisms...'
      },
      {
        id: 'case-studies',
        type: 'visualization',
        component: ProblemVisualizationScene,
        title: 'Real-World Case Studies',
        duration: 600,
        category: 'Case Studies',
        description: 'Share Groups in production environments',
        narration: 'Let\'s examine how leading companies use Share Groups...'
      }
    ];
  }

  getInteractiveElements() {
    return [
      {
        id: 'state-machine',
        sceneId: 'code-examples',
        timestamp: 300, // 5 minutes into the code scene
        component: InteractiveStateMachine,
        duration: 60,
        data: {
          states: ['IDLE', 'FETCHING', 'PROCESSING', 'COMMITTING'],
          transitions: [
            { from: 'IDLE', to: 'FETCHING', label: 'Poll' },
            { from: 'FETCHING', to: 'PROCESSING', label: 'Records Available' },
            { from: 'PROCESSING', to: 'COMMITTING', label: 'Process Complete' },
            { from: 'COMMITTING', to: 'IDLE', label: 'Commit Success' }
          ]
        }
      }
    ];
  }

  getResourceRequirements() {
    return {
      images: [
        '/episodes/kafka-share-groups/assets/thumbnail.jpg',
        '/episodes/kafka-share-groups/assets/architecture-diagram.png'
      ],
      videos: [],
      scripts: [],
      styles: []
    };
  }
}