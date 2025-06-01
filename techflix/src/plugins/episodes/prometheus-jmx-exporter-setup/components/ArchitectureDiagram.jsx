import React from 'react';
import { motion } from 'framer-motion';

/**
 * Very simple diagram component used for episode scenes.
 * It lists components horizontally and draws arrow icons
 * between them to indicate the data flow.
 */
const ArchitectureDiagram = ({ components = [], connections = [], animated = false }) => {
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1 } })
  };

  return (
    <div className="architecture-diagram bg-gray-900 text-white rounded-lg p-4">
      <div className="flex items-center flex-wrap gap-4 justify-center">
        {components.map((c, i) => (
          <React.Fragment key={c.id}>
            <motion.div
              className="flex flex-col items-center justify-center px-3 py-2 rounded-md shadow-md"
              style={{ background: c.color || '#333' }}
              custom={i}
              initial="hidden"
              animate={animated ? 'visible' : 'hidden'}
              variants={variants}
            >
              <div className="text-xl mb-1">{c.icon}</div>
              <div className="text-sm font-semibold whitespace-nowrap">{c.label}</div>
            </motion.div>
            {i < components.length - 1 && (
              <motion.span
                className="text-gray-400"
                custom={i}
                initial="hidden"
                animate={animated ? 'visible' : 'hidden'}
                variants={variants}
              >
                ➡️
              </motion.span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ArchitectureDiagram;
