import React from 'react'
import { motion } from 'framer-motion'

const ProgressiveReveal = ({ 
  children, 
  delay = 0, 
  duration = 0.5,
  direction = 'up', // up, down, left, right
  stagger = 0.1,
  className = ''
}) => {
  const directions = {
    up: { y: 20, x: 0 },
    down: { y: -20, x: 0 },
    left: { x: 20, y: 0 },
    right: { x: -20, y: 0 }
  }

  const initial = {
    opacity: 0,
    ...directions[direction]
  }

  const animate = {
    opacity: 1,
    x: 0,
    y: 0
  }

  // Handle single child
  if (!Array.isArray(children)) {
    return (
      <motion.div
        initial={initial}
        animate={animate}
        transition={{ 
          delay, 
          duration,
          ease: "easeOut"
        }}
        className={className}
      >
        {children}
      </motion.div>
    )
  }

  // Handle multiple children with stagger
  return (
    <motion.div className={className}>
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          initial={initial}
          animate={animate}
          transition={{ 
            delay: delay + (index * stagger), 
            duration,
            ease: "easeOut"
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

export default ProgressiveReveal