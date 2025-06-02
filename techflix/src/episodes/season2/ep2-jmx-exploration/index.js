import JMXExplorerScene from '../../../components/scenes/JMXExplorerScene'
import MBeanNavigatorScene from '../../../components/scenes/MBeanNavigatorScene'
import MetricsVisualizerScene from '../../../components/scenes/MetricsVisualizerScene'

export const jmxExplorationEpisode = {
  metadata: {
    seriesId: 'tech-insights',
    seasonNumber: 2,
    episodeNumber: 2,
    title: 'Distributed Systems Consensus: JMX Deep Dive',
    synopsis: 'Master Kafka monitoring through JMX, exploring MBeans and extracting critical Share Groups metrics.',
    runtime: 55,
    rating: 'Advanced',
    genres: ['Kafka', 'JMX', 'Monitoring', 'Distributed Systems']
  },
  scenes: [
    {
      id: 'jmx-explorer',
      title: 'JMX Explorer: Gateway to Kafka Metrics',
      duration: 900,
      component: JMXExplorerScene
    },
    {
      id: 'mbean-navigator',
      title: 'Navigating the MBean Tree',
      duration: 1200,
      component: MBeanNavigatorScene
    },
    {
      id: 'metrics-visualizer',
      title: 'Share Groups Metrics in Action',
      duration: 1200,
      component: MetricsVisualizerScene
    }
  ]
}