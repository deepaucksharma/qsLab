import JMXExplorerScene from './scenes/JMXExplorerScene';
import MBeanNavigatorScene from './scenes/MBeanNavigatorScene';
import MetricsVisualizerScene from './scenes/MetricsVisualizerScene';

export const kafkaJmxExplorationEpisode = {
  metadata: {
    id: 'kafka-jmx-exploration',
    title: 'Peeking Inside Kafka: JMX Metrics',
    description: 'Master JMX to extract critical Share Group metrics from Kafka',
    seasonNumber: 2,
    episodeNumber: 1,
    duration: 225,
    level: 'Advanced',
    tags: ['kafka', 'jmx', 'monitoring', 'metrics'],
    prerequisites: ['Understanding of Kafka Share Groups', 'Basic JMX knowledge'],
    learningOutcomes: [
      "Navigate Kafka's JMX MBean structure",
      'Identify Share Group specific MBeans',
      'Extract RecordsUnacked and OldestUnackedMs metrics'
    ]
  },
  scenes: [
    {
      id: 'jmx-intro',
      type: 'content',
      component: JMXExplorerScene,
      title: "JMX: Kafka's Internal Telemetry",
      duration: 75,
      mood: 'technical-deep-dive',
      narration: 'Kafka reveals its vital signs via JMX...'
    },
    {
      id: 'mbean-navigation',
      type: 'interactive',
      component: MBeanNavigatorScene,
      title: 'Navigating Share Group MBeans',
      duration: 90,
      mood: 'technical-deep-dive',
      interactiveElements: [{
        type: 'tree-navigation',
        allowExpand: true,
        highlightPaths: [
          'kafka.server:type=share-group-metrics'
        ]
      }]
    },
    {
      id: 'metrics-extraction',
      type: 'demo',
      component: MetricsVisualizerScene,
      title: 'Extracting Key Metrics',
      duration: 60,
      mood: 'technical-deep-dive'
    }
  ]
};

export default kafkaJmxExplorationEpisode;
