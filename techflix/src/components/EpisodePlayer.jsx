import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SceneContent from './SceneContent'
import InteractiveOverlay from './InteractiveOverlay'
import ProgressBar from './ProgressBar'
import { episodeData } from '../data/episodeData'

const EpisodePlayer = ({ currentScene, setCurrentScene }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const [sceneProgress, setSceneProgress] = useState(0)

  const totalScenes = episodeData.scenes.length
  const currentSceneData = episodeData.scenes[currentScene]

  useEffect(() => {
    let interval
    if (isPlaying) {
      interval = setInterval(() => {
        setSceneProgress(prev => {
          if (prev >= 100) {
            if (currentScene < totalScenes - 1) {
              setCurrentScene(current => current + 1)
              return 0
            } else {
              setIsPlaying(false)
              return 100
            }
          }
          return prev + 0.5 // Adjust speed as needed
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isPlaying, currentScene, totalScenes, setCurrentScene])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleSceneSelect = (sceneIndex) => {
    setCurrentScene(sceneIndex)
    setSceneProgress(0)
  }

  const handleInteractionComplete = () => {
    setShowOverlay(false)
    setIsPlaying(true)
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Main Scene Content */}
      <SceneContent 
        scene={currentSceneData}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onShowOverlay={() => setShowOverlay(true)}
      />

      {/* Interactive Overlay */}
      <AnimatePresence>
        {showOverlay && (
          <InteractiveOverlay
            scene={currentSceneData}
            onComplete={handleInteractionComplete}
            onClose={() => setShowOverlay(false)}
          />
        )}
      </AnimatePresence>

      {/* Progress and Controls */}
      <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
        <ProgressBar
          currentScene={currentScene}
          totalScenes={totalScenes}
          sceneProgress={sceneProgress}
          onSceneSelect={handleSceneSelect}
        />
        
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-300">
            Scene {currentScene + 1} of {totalScenes}: {currentSceneData.title}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => currentScene > 0 && handleSceneSelect(currentScene - 1)}
              className="btn-secondary text-sm py-2 px-4"
              disabled={currentScene === 0}
            >
              Previous
            </button>
            <button
              onClick={handlePlayPause}
              className="btn-primary text-sm py-2 px-6"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={() => currentScene < totalScenes - 1 && handleSceneSelect(currentScene + 1)}
              className="btn-secondary text-sm py-2 px-4"
              disabled={currentScene === totalScenes - 1}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EpisodePlayer