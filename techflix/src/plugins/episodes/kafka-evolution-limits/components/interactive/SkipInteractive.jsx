import React from 'react';

const SkipInteractive = ({ onSkip, label = 'Skip Intro' }) => (
  <button
    type="button"
    className="px-4 py-2 bg-red-600 text-white rounded"
    onClick={onSkip}
  >
    {label}
  </button>
);

export default SkipInteractive;
