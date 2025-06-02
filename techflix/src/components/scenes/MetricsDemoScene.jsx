import AnimatedMetricCounter from '../AnimatedMetricCounter'
import ProgressiveReveal from '../ProgressiveReveal'
import { motion } from 'framer-motion'

const MetricsDemoScene = ({ progress = 0 }) => {
  const metrics = [
    { label: 'Message Throughput', value: 125000, suffix: '/s' },
    { label: 'Consumer Lag', value: 0.3, suffix: 'ms', decimals: 1 },
    { label: 'Partition Count', value: 128, suffix: '' },
    { label: 'Replication Factor', value: 3, suffix: 'x' }
  ]

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-8">
      {/* Background animation */}
      <motion.div
        className="absolute inset-0 opacity-10"
        animate={{
          backgroundImage: [
            'radial-gradient(circle at 20% 50%, #e50914 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, #e50914 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, #e50914 0%, transparent 50%)'
          ]
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        <ProgressiveReveal delay={0.2}>
          <h2 className="text-5xl font-bold text-white mb-12 text-center">
            Critical Kafka Metrics
          </h2>
        </ProgressiveReveal>

        <div className="grid grid-cols-2 gap-8">
          {metrics.map((metric, index) => (
            <ProgressiveReveal 
              key={metric.label}
              delay={0.5 + index * 0.2}
              direction="up"
            >
              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700"
                whileHover={{ scale: 1.05, borderColor: '#e50914' }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">
                  {metric.label}
                </h3>
                <AnimatedMetricCounter
                  value={metric.value}
                  suffix={metric.suffix}
                  decimals={metric.decimals || 0}
                  duration={2000}
                  className="text-4xl text-white"
                />
              </motion.div>
            </ProgressiveReveal>
          ))}
        </div>

        <ProgressiveReveal delay={2} className="mt-12">
          <motion.div
            className="text-center"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <p className="text-gray-400 text-lg">
              Real-time metrics powered by Kafka JMX
            </p>
          </motion.div>
        </ProgressiveReveal>
      </div>
    </div>
  )
}

export default MetricsDemoScene