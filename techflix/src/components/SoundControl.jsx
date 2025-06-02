/**
 * Sound control component for toggling audio effects
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import { useAudio } from '@hooks/useAudio'
import logger from '@utils/logger'

const SoundControl = ({ className = '' }) => {
  const { enabled, toggle, playClick } = useAudio()

  const handleToggle = async () => {
    await playClick()
    const newState = toggle()
    logger.info('Sound toggled', { enabled: newState })
  }

  return (
    <motion.button
      className={`sound-control ${className}`}
      onClick={handleToggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      title={enabled ? 'Mute sound effects' : 'Enable sound effects'}
    >
      <motion.div
        key={enabled ? 'on' : 'off'}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        {enabled ? (
          <Volume2 className="w-6 h-6 text-white" />
        ) : (
          <VolumeX className="w-6 h-6 text-gray-500" />
        )}
      </motion.div>
    </motion.button>
  )
}

export default SoundControl