import QueuesStreamsUIScene from './scenes/QueuesStreamsUIScene'

export const queuesStreamsUIIntegrationEpisode = {
  metadata: {
    seriesId: 'tech-insights',
    seasonNumber: 3,
    episodeNumber: 2,
    title: 'Queues & Streams UI Integration',
    synopsis: 'Visualize Kafka Share Groups inside New Relic\'s Queues & Streams UI.',
    runtime: 90,
    rating: 'Advanced',
    genres: ['Kafka', 'New Relic', 'Monitoring']
  },
  scenes: [
    {
      id: 'ui-simulator',
      title: 'Queues & Streams UI',
      duration: 90,
      component: QueuesStreamsUIScene
    }
  ]
}

export default queuesStreamsUIIntegrationEpisode
