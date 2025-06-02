import { motion } from 'framer-motion';

const MicroservicesKafkaScene = ({ time, duration }) => {
  const progress = time / duration;

  const services = [
    { name: 'User Service', x: 100, y: 100 },
    { name: 'Order Service', x: 100, y: 300 },
    { name: 'Inventory Service', x: 500, y: 100 },
    { name: 'Payment Service', x: 500, y: 300 },
    { name: 'Notification Service', x: 900, y: 200 }
  ];

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <svg className="w-full h-full" viewBox="0 0 1200 600">
          {/* Kafka cluster in the center */}
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: progress > 0.1 ? 1 : 0, scale: progress > 0.1 ? 1 : 0 }}
          >
            <rect x="250" y="150" width="400" height="200" rx="10" fill="#1a1a1a" stroke="#e50914" strokeWidth="2"/>
            <text x="450" y="250" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">
              Apache Kafka
            </text>
            <text x="450" y="280" textAnchor="middle" fill="#999" fontSize="16">
              Event Streaming Platform
            </text>
          </motion.g>

          {/* Services */}
          {services.map((service, index) => (
            <motion.g
              key={service.name}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: progress > 0.2 + index * 0.1 ? 1 : 0,
                scale: progress > 0.2 + index * 0.1 ? 1 : 0
              }}
            >
              <circle cx={service.x} cy={service.y} r="60" fill="#2a2a2a" stroke="#666" strokeWidth="2"/>
              <text x={service.x} y={service.y} textAnchor="middle" fill="white" fontSize="14">
                {service.name.split(' ')[0]}
              </text>
              <text x={service.x} y={service.y + 20} textAnchor="middle" fill="white" fontSize="14">
                {service.name.split(' ')[1]}
              </text>
            </motion.g>
          ))}

          {/* Connections */}
          {progress > 0.5 && services.map((service, index) => (
            <motion.line
              key={`line-${index}`}
              x1={service.x}
              y1={service.y}
              x2={service.x < 450 ? 250 : 650}
              y2={250}
              stroke="#e50914"
              strokeWidth="2"
              strokeDasharray="5,5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: index * 0.1 }}
            />
          ))}
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center p-8">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: progress > 0.05 ? 1 : 0, y: progress > 0.05 ? 0 : -50 }}
          className="text-6xl font-bold text-white mb-6"
        >
          Kafka as the Nervous System
        </motion.h1>

        {progress > 0.7 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 p-6 rounded-lg border border-gray-700 mt-8"
          >
            <h3 className="text-2xl font-semibold text-white mb-4">Event-Driven Benefits</h3>
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-300">Loose Coupling</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-300">Scalability</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-300">Resilience</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-300">Real-time Processing</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MicroservicesKafkaScene;