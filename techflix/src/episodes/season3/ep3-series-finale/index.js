import RecapScene from '../../../components/scenes/RecapScene'
import CallToActionScene from '../../../components/scenes/CallToActionScene'

export const seriesFinaleEpisode = {
  metadata: {
    seriesId: 'tech-insights',
    seasonNumber: 3,
    episodeNumber: 3,
    title: 'Series Finale: You\'re Ready to Observe!',
    synopsis: 'You\'ve journeyed from Kafka fundamentals to full New Relic Ultra integration! Explore the resources, and elevate your Kafka observability.',
    runtime: 10,
    rating: 'Advanced',
    genres: ['Kafka', 'Observability', 'Share Groups', 'Finale']
  },
  scenes: [
    {
      id: 'recap',
      title: 'Journey Recap',
      duration: 360,
      component: RecapScene
    },
    {
      id: 'call-to-action',
      title: 'Your Next Steps',
      duration: 240,
      component: CallToActionScene
    }
  ]
}