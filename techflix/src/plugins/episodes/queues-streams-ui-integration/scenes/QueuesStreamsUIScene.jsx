import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import NewRelicUISimulator from '../components/NewRelicUISimulator'
import QueueSampleViewer from '../components/QueueSampleViewer'
import HealthIndicator from '../components/HealthIndicator'
import MetricsChart from '../components/MetricsChart'
import AlertConditions from '../components/AlertConditions'

const generateTimeSeriesData = (queue) => {
  return Array.from({ length: 10 }).map((_, i) => ({
    x: i,
    y: queue['queue.depth'] + Math.random() * 10
  }))
}

const QueuesStreamsUIScene = ({ time, duration }) => {
  const [uiState, setUiState] = useState('loading')
  const [selectedQueue, setSelectedQueue] = useState(null)

  const queueSamples = [
    {
      provider: 'kafka-sharegroup',
      'queue.name': 'orders:share-processor',
      'share.group.name': 'share-processor',
      'topic.name': 'orders',
      'queue.depth': 245,
      'queue.oldestMessageAgeSeconds': 15.2,
      'consumers.active': 5,
      'processing.rate': 1250
    },
    {
      provider: 'kafka-sharegroup',
      'queue.name': 'payments:share-validator',
      'share.group.name': 'share-validator',
      'topic.name': 'payments',
      'queue.depth': 89,
      'queue.oldestMessageAgeSeconds': 3.7,
      'consumers.active': 3,
      'processing.rate': 890
    }
  ]

  useEffect(() => {
    if (time < 10) setUiState('loading')
    else if (time < 30) setUiState('dashboard')
    else if (time < 60) setUiState('detail')
    else setUiState('success')
  }, [time])

  return (
    <div className="queues-streams-ui-scene">
      <NewRelicUISimulator view="queues-streams" theme="dark">
        {uiState === 'loading' && (
          <div className="ui-loading">
            <div className="spinner" />
            <p>Loading Kafka Share Groups...</p>
          </div>
        )}

        {uiState === 'dashboard' && (
          <div className="queues-dashboard">
            <h1>Queues & Streams</h1>

            <div className="queue-filters">
              <select className="provider-filter">
                <option value="all">All Providers</option>
                <option value="kafka-sharegroup">Kafka Share Groups</option>
                <option value="kafka">Traditional Kafka</option>
              </select>
            </div>

            <div className="queue-list">
              {queueSamples.map((queue, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  className="queue-card"
                  onClick={() => setSelectedQueue(queue)}
                >
                  <div className="queue-header">
                    <h3>{queue['queue.name']}</h3>
                    <span className="provider-badge">{queue.provider}</span>
                  </div>

                  <div className="queue-metrics">
                    <div className="metric">
                      <span className="label">Depth</span>
                      <span className="value">{queue['queue.depth']}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Oldest Message</span>
                      <span className="value">{queue['queue.oldestMessageAgeSeconds']}s</span>
                    </div>
                    <div className="metric">
                      <span className="label">Consumers</span>
                      <span className="value">{queue['consumers.active']}</span>
                    </div>
                  </div>

                  <div className="queue-health">
                    <HealthIndicator queue={queue} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {uiState === 'detail' && selectedQueue && (
          <div className="queue-detail-view">
            <h2>{selectedQueue['queue.name']}</h2>

            <div className="detail-grid">
              <div className="metrics-panel">
                <MetricsChart metric="queue.depth" data={generateTimeSeriesData(selectedQueue)} />
                <MetricsChart metric="processing.rate" data={generateTimeSeriesData(selectedQueue)} />
              </div>

              <div className="attributes-panel">
                <h3>Queue Attributes</h3>
                <QueueSampleViewer sample={selectedQueue} />
              </div>

              <div className="alerts-panel">
                <h3>Alert Conditions</h3>
                <AlertConditions queue={selectedQueue} />
              </div>
            </div>
          </div>
        )}

        {uiState === 'success' && (
          <div className="success-view">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="success-content">
              <h1>🎉 Share Groups Fully Integrated!</h1>
              <p>Your Kafka Share Groups are now visible in the Queues & Streams UI</p>

              <div className="benefits-list">
                <div className="benefit">
                  <span className="icon">✅</span>
                  <span>Real-time queue depth monitoring</span>
                </div>
                <div className="benefit">
                  <span className="icon">✅</span>
                  <span>Message age tracking</span>
                </div>
                <div className="benefit">
                  <span className="icon">✅</span>
                  <span>Consumer health visibility</span>
                </div>
                <div className="benefit">
                  <span className="icon">✅</span>
                  <span>Integrated alerting</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </NewRelicUISimulator>
    </div>
  )
}

export default QueuesStreamsUIScene

