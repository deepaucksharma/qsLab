import React from 'react';
import { motion } from 'framer-motion';

/**
 * Displays a code snippet with a subtle fade in animation.
 */
const CodeHighlight = ({ code, language = 'bash' }) => (
  <motion.pre
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    className="code-highlight bg-black text-white p-4 rounded-lg overflow-auto font-mono text-sm"
  >
    {code}
  </motion.pre>
);

export default CodeHighlight;
