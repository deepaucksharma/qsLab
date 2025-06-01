import React from 'react';
import { motion } from 'framer-motion';

/**
 * Very light-weight YAML viewer. It can highlight specific lines and
 * fades in when mounted to mimic a code editor popping into view.
 */
const YAMLEditor = ({ content, highlights = [], editable = false }) => {
  const lines = content.split('\n');
  return (
    <motion.pre
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="yaml-editor bg-gray-900 text-green-300 rounded-lg p-4 font-mono text-sm whitespace-pre overflow-auto"
    >
      {lines.map((line, idx) => {
        const highlight = highlights.find(h => h.line === idx + 1);
        return (
          <div key={idx} className={highlight ? 'bg-green-800/40' : undefined}>
            {line}
            {highlight && (
              <span className="ml-2 text-green-400">// {highlight.label}</span>
            )}
          </div>
        );
      })}
    </motion.pre>
  );
};

export default YAMLEditor;
