// Season 1 Episodes
import { partitionBarrierEpisode } from './season1/ep1-partition-barrier'
import { criticalMetricsEpisode } from './season1/ep2-critical-metrics'

// Season 2 Episodes  
import { kafkaShareGroupsEpisode } from './season2/ep1-kafka-share-groups'
import { jmxExplorationEpisode } from './season2/ep2-jmx-exploration'
import { prometheusSetupEpisode } from './season2/ep3-prometheus-setup'
import { customOHIEpisode } from './season2/ep4-custom-ohi'
import { criticalMetricsShiftsEpisode } from './season2/ep5-critical-metrics'
import { dataIngestionPathsEpisode } from './season2/ep6-data-ingestion-paths'
import { kafkaEvolutionLimitsEpisode } from './season2/ep7-kafka-evolution-limits'

// Season 3 Episodes
import { seriesFinaleEpisode } from './season3/ep3-series-finale'

// Re-export episodes
export { 
  partitionBarrierEpisode, 
  criticalMetricsEpisode, 
  kafkaShareGroupsEpisode, 
  jmxExplorationEpisode,
  prometheusSetupEpisode,
  customOHIEpisode,
  criticalMetricsShiftsEpisode,
  dataIngestionPathsEpisode,
  kafkaEvolutionLimitsEpisode,
  seriesFinaleEpisode 
}

// Export all episodes organized by season
export const ALL_EPISODES = {
  season1: {
    episode1: partitionBarrierEpisode,
    episode2: criticalMetricsEpisode
  },
  season2: {
    episode1: kafkaShareGroupsEpisode,
    episode2: jmxExplorationEpisode,
    episode3: prometheusSetupEpisode,
    episode4: customOHIEpisode,
    episode5: criticalMetricsShiftsEpisode,
    episode6: dataIngestionPathsEpisode,
    episode7: kafkaEvolutionLimitsEpisode
  },
  season3: {
    episode3: seriesFinaleEpisode
  }
}