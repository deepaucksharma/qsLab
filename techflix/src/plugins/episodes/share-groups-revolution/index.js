import { EpisodePlugin } from '../../core/EpisodePlugin';
import ShareGroupArchitectureScene from '../../../components/scenes/ShareGroupArchitectureScene';
import ImpactMetricsScene from '../../../components/scenes/ImpactMetricsScene';

export default class ShareGroupsRevolutionEpisode extends EpisodePlugin {
  getMetadata() {
    return {
      id: 'share-groups-revolution',
      title: 'Share Groups Revolution',
      description: "Kafka 4.0's Share Groups smash traditional consumer limits.",
      seasonNumber: 1,
      episodeNumber: 2,
      duration: 240,
      level: 'Advanced',
      tags: ['kafka', 'share-groups', 'distributed-systems'],
      thumbnailUrl: './assets/S1_E2_thumb_episode-thumbnail.jpg'
    };
  }

  getScenes() {
    return [
      {
        id: 'share-groups-intro',
        type: 'content',
        component: ShareGroupArchitectureScene,
        title: 'Introducing Share Groups',
        duration: 75,
        mood: 'innovation-reveal',
        description: 'Simulated visualization of cooperative consumption.',
        timeline: [
          {
            time: '0-5s',
            visual: 'Fade from highway metaphor to reservoir visualization',
            voiceOver: "Kafka 4.0's Share Groups smash this bottleneck!"
          },
          {
            time: '5-10s',
            visual: 'Central reservoir glows, pulsing with data',
            voiceOver: 'Imagine multiple high-speed taps drawing from the same data reservoir'
          },
          {
            time: '10-15s',
            visual: 'First consumer tap appears drawing particles',
            voiceOver: "That's cooperative consumption - multiple consumers..."
          },
          {
            time: '15-25s',
            visual: 'Additional taps animate in sequence (2, 3, 4)',
            voiceOver: '...can now process messages from the same partition simultaneously'
          },
          {
            time: '25-35s',
            visual: 'Throughput gauge needle climbing',
            voiceOver: 'Watch as throughput increases with each additional consumer'
          },
          {
            time: '35-45s',
            visual: 'KIP-932 badge materializes with holographic effect',
            voiceOver: 'This breakthrough, defined in KIP-932, fundamentally changes...'
          },
          {
            time: '45-55s',
            visual: 'Split-screen comparison old vs new model',
            voiceOver: '...how Kafka handles consumption. No more rigid one-to-one mapping'
          },
          {
            time: '55-65s',
            visual: 'Particle flow intensifies showing distribution',
            voiceOver: 'The broker intelligently distributes work across all available consumers'
          },
          {
            time: '65-75s',
            visual: 'Zoom out to show complete system, fireworks effect',
            voiceOver: "Revolutionary? Absolutely. Let's see how it works under the hood"
          }
        ]
      },
      {
        id: 'share-groups-architecture',
        type: 'content',
        component: ShareGroupArchitectureScene,
        title: 'Share Groups Architecture Deep Dive',
        duration: 90,
        mood: 'technical-deep-dive'
      },
      {
        id: 'real-world-impact',
        type: 'content',
        component: ImpactMetricsScene,
        title: 'Real-World Impact',
        duration: 75,
        mood: 'triumphant'
      }
    ];
  }
}
