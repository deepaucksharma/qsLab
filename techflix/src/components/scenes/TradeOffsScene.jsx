import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/techflix-cinematic-v2.css';

const TradeOffsScene = ({ time, duration }) => {
  const progress = (time / duration) * 100;
  
  const tradeoffs = [
    {
      aspect: 'Parallelism',
      shareGroups: 'Beyond partition limits',
      traditional: 'Limited to partition count',
      highlight: false
    },
    {
      aspect: 'Ordering',
      shareGroups: 'Flexible per-key ordering',
      traditional: 'Strict partition ordering',
      highlight: true
    },
    {
      aspect: 'Scalability',
      shareGroups: 'Linear scaling with consumers',
      traditional: 'Plateau at partition count',
      highlight: false
    },
    {
      aspect: 'Complexity',
      shareGroups: 'New monitoring paradigms',
      traditional: 'Well-understood patterns',
      highlight: false
    }
  ];

  const shouldShowRow = (index) => {
    const delay = index * 1.5;
    return time > delay;
  };

  const shouldShowInsight = time > 7;

  return (
    <div className="scene-container-v2">
      <div className="scene-content">
        <div className="flex flex-col items-center justify-center min-h-full py-12">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="scene-title">Share Groups vs Traditional Kafka</h1>
            <p className="scene-subtitle">Understanding the Trade-offs</p>
          </motion.div>

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="metric-card-v2 p-8 max-w-5xl w-full"
          >
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 text-sm uppercase tracking-wider border-b border-gray-700">
                  <th className="text-left py-4">Aspect</th>
                  <th className="text-center py-4">Share Groups</th>
                  <th className="text-center py-4">Traditional</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {tradeoffs.map((tradeoff, index) => (
                    shouldShowRow(index) && (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className={`border-b border-gray-800 ${
                          tradeoff.highlight && time > 3 ? 'bg-purple-900/10' : ''
                        }`}
                      >
                        <td className="py-6 text-lg font-semibold text-gray-200">
                          {tradeoff.aspect}
                        </td>
                        <td className="py-6 text-center text-green-400">
                          {tradeoff.shareGroups}
                        </td>
                        <td className="py-6 text-center text-orange-400">
                          {tradeoff.traditional}
                        </td>
                      </motion.tr>
                    )
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </motion.div>

          {/* Key Insight */}
          <AnimatePresence>
            {shouldShowInsight && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8 }}
                className="mt-8 max-w-4xl w-full"
              >
                <div className="alert-box p-6">
                  <h3 className="text-xl font-bold mb-3 text-purple-300">Key Insight</h3>
                  <p className="text-gray-300">
                    Share Groups trade strict ordering guarantees for massive scalability gains. 
                    This paradigm shift requires new approaches to monitoring and operations.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TradeOffsScene;