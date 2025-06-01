import React from 'react'
import { motion } from 'framer-motion'

const ProgressBar = ({ currentScene, totalScenes, sceneProgress, onSceneSelect }) => {
  return (
    <div className="space-y-2">
      {/* Overall Episode Progress */}
      <div className="progress-bar">
        <motion.div
          className="progress-fill"
          style={{
            width: `${((currentScene + (sceneProgress / 100)) / totalScenes) * 100}%`
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Scene Markers */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-1">
          {Array.from({ length: totalScenes }, (_, index) => (
            <button
              key={index}
              onClick={() => onSceneSelect(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentScene
                  ? 'bg-netflix-red scale-125'
                  : index < currentScene
                  ? 'bg-gray-400'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
              title={`Scene ${index + 1}`}
            />
          ))}
        </div>
        
        <div className="text-xs text-gray-400">
          {Math.round(((currentScene + (sceneProgress / 100)) / totalScenes) * 100)}% Complete
        </div>
      </div>
    </div>
  )
}

export default ProgressBar