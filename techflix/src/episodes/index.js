// Season 1 Episodes
export { partitionBarrierEpisode } from './season1/ep1-partition-barrier'

// Season 2 Episodes  
export { kafkaShareGroupsEpisode } from './season2/ep1-kafka-share-groups'

// Export all episodes organized by season
export const ALL_EPISODES = {
  season1: {
    episode1: partitionBarrierEpisode
  },
  season2: {
    episode1: kafkaShareGroupsEpisode
  }
}