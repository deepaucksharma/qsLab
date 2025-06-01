import PrometheusConfigScene from './scenes/PrometheusConfigScene';

export const prometheusJmxExporterEpisode = {
  metadata: {
    seriesId: 'tech-insights',
    seasonNumber: 2,
    episodeNumber: 2,
    title: 'Prometheus JMX Exporter Setup',
    synopsis: 'Learn how to configure and verify the Prometheus JMX Exporter for Kafka Share Groups.',
    runtime: 90,
    rating: 'Intermediate',
    genres: ['Kafka', 'Prometheus', 'Monitoring']
  },
  scenes: [
    {
      id: 'prometheus-config',
      title: 'Prometheus Configuration & Verification',
      duration: 90,
      component: PrometheusConfigScene
    }
  ]
};
