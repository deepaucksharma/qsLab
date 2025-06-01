import React from 'react';
import { motion } from 'framer-motion';

const KafkaRefresherScene = ({ time = 0, duration = 45 }) => {
  const progress = Math.min((time / duration) * 100, 100);
  return (
    <motion.div
      className="scene-container kafka-refresher flex items-center justify-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Kafka Refresher</h2>
        <p className="text-sm text-gray-400">Placeholder scene content</p>
        <div className="h-1 bg-gray-700 rounded mt-4 w-64">
          <div className="h-full bg-red-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </motion.div>
  );
};

export default KafkaRefresherScene;
