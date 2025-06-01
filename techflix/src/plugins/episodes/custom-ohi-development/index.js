import { EpisodePlugin } from '../../core/EpisodePlugin';
import OHIBuilderScene from './scenes/OHIBuilderScene';

export default class CustomOHIDevelopmentEpisode extends EpisodePlugin {
  getMetadata() {
    return {
      id: 'custom-ohi-development',
      title: 'Custom OHI Development',
      description: 'Building a custom New Relic On-Host Integration using the OHI builder.',
      seasonNumber: 3,
      episodeNumber: 1,
      duration: 120,
      level: 'Advanced',
      tags: ['newrelic', 'ohi', 'observability']
    };
  }

  getScenes() {
    return [
      {
        id: 'ohi-builder',
        type: 'demo',
        component: OHIBuilderScene,
        title: 'OHI Builder',
        duration: 120
      }
    ];
  }
}
