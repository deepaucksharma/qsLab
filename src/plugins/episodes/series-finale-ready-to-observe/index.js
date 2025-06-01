import { EpisodePlugin } from '../../core/EpisodePlugin'
import RecapScene from './scenes/RecapScene'
import CallToActionScene from './scenes/CallToActionScene'

export default class SeriesFinaleReadyToObserve extends EpisodePlugin {
  getMetadata() {
    return {
      id: 'series-finale-ready-to-observe',
      title: "Series Finale: You're Ready to Observe!",
      description:
        "You've journeyed from Kafka fundamentals to full New Relic Ultra integration! Explore the resources, and elevate your Kafka observability.",
      seasonNumber: 3,
      episodeNumber: 3,
      runtime: 60,
      level: 'Advanced',
      tags: ['kafka', 'observability', 'share-groups']
    }
  }

  getScenes() {
    return [
      {
        id: 'recap',
        component: RecapScene,
        title: 'Journey Recap',
        duration: 40
      },
      {
        id: 'call-to-action',
        component: CallToActionScene,
        title: 'Next Steps',
        duration: 20
      }
    ]
  }
}
