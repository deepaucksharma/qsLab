import PrometheusArchitectureScene from '../../../components/scenes/PrometheusArchitectureScene'
import JMXExporterConfigScene from '../../../components/scenes/JMXExporterConfigScene'
import PrometheusVerificationScene from '../../../components/scenes/PrometheusVerificationScene'

export const prometheusSetupEpisode = {
  metadata: {
    seriesId: 'tech-insights',
    seasonNumber: 2,
    episodeNumber: 3,
    title: 'Real-time Stream Processing: Prometheus Integration',
    synopsis: 'Transform JMX metrics into Prometheus format, building a production-ready monitoring pipeline for Kafka Share Groups.',
    runtime: 42,
    rating: 'Advanced',
    genres: ['Prometheus', 'JMX', 'Monitoring', 'Stream Processing']
  },
  scenes: [
    {
      id: 'architecture',
      title: 'Prometheus + JMX Architecture',
      duration: 600,
      component: PrometheusArchitectureScene
    },
    {
      id: 'jmx-exporter-config',
      title: 'JMX Exporter Configuration',
      duration: 900,
      component: JMXExporterConfigScene
    },
    {
      id: 'verification',
      title: 'Metrics Verification',
      duration: 600,
      component: PrometheusVerificationScene
    }
  ]
}