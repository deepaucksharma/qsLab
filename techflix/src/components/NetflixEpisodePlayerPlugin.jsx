import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, ChevronLeft, Maximize2, Volume2, Settings, 
         SkipForward, SkipBack, Info } from 'lucide-react'

const NetflixEpisodePlayerPlugin = ({ episodeData, onEpisodeEnd, onBack }) => {
  const [episode, setEpisode] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const [sceneTime, setSceneTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [interactiveMode, setInteractiveMode] = useState(null)
  const [globalTime, setGlobalTime] = useState(0)

  const playerRef = useRef(null)
  const controlsTimeoutRef = useRef(null)
  const playbackIntervalRef = useRef(null)

  // Format time helper
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) seconds = 0
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Calculate total duration
  const calculateTotalDuration = useCallback(() => {
    if (!episode?.scenes) return 0
    return episode.scenes.reduce((total, scene) => total + (scene.duration || 0), 0)
  }, [episode])

  // Calculate global time from scene progress
  const calculateGlobalTime = useCallback(() => {
    if (!episode?.scenes) return 0
    let time = 0
    for (let i = 0; i < currentSceneIndex; i++) {
      time += episode.scenes[i].duration || 0
    }
    time += sceneTime
    return time
  }, [episode, currentSceneIndex, sceneTime])

  // Load episode data
  useEffect(() => {
    if (episodeData) {
      setEpisode(episodeData)
      setTimeout(() => {
        setIsLoading(false)
        setIsPlaying(true)
      }, 1500)
    }
  }, [episodeData])

  // Playback logic
  useEffect(() => {
    if (!episode || !isPlaying || interactiveMode) {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current)
      }
      return
    }

    playbackIntervalRef.current = setInterval(() => {
      setSceneTime(prevTime => {
        const currentScene = episode.scenes[currentSceneIndex]
        const newTime = prevTime + 0.1

        // Check for interactive moments
        if (episode.interactiveElements) {
          const interactiveElement = episode.interactiveElements.find(
            element => element.sceneId === currentScene.id && 
                      Math.floor(newTime) === element.timestamp
          )
          
          if (interactiveElement) {
            setIsPlaying(false)
            setInteractiveMode({
              component: interactiveElement.component,
              data: interactiveElement.data
            })
          }
        }

        if (newTime >= currentScene.duration) {
          if (currentSceneIndex < episode.scenes.length - 1) {
            setCurrentSceneIndex(currentSceneIndex + 1)
            return 0
          } else {
            setIsPlaying(false)
            if (onEpisodeEnd) onEpisodeEnd()
            return currentScene.duration
          }
        }
        return newTime
      })
    }, 100)

    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current)
      }
    }
  }, [isPlaying, currentSceneIndex, episode, interactiveMode, onEpisodeEnd])

  // Update global time
  useEffect(() => {
    setGlobalTime(calculateGlobalTime())
  }, [calculateGlobalTime])

  // Mouse movement handler
  const handleMouseMove = useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 3000)
  }, [isPlaying])

  useEffect(() => {
    const playerElement = playerRef.current
    if (playerElement) {
      playerElement.addEventListener('mousemove', handleMouseMove)
    }
    return () => {
      if (playerElement) {
        playerElement.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [handleMouseMove])

  const handlePlayPause = () => {
    if (interactiveMode) return
    setIsPlaying(!isPlaying)
    setShowControls(true)
  }

  const handleSeek = (e) => {
    if (interactiveMode) return
    const progressBar = e.currentTarget
    const clickPosition = e.nativeEvent.offsetX
    const barWidth = progressBar.clientWidth
    const seekRatio = clickPosition / barWidth
    const totalDuration = calculateTotalDuration()
    const targetTime = seekRatio * totalDuration

    // Find the scene and time within that scene
    let accumulatedTime = 0
    for (let i = 0; i < episode.scenes.length; i++) {
      const sceneDuration = episode.scenes[i].duration
      if (accumulatedTime + sceneDuration >= targetTime) {
        setCurrentSceneIndex(i)
        setSceneTime(targetTime - accumulatedTime)
        break
      }
      accumulatedTime += sceneDuration
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
        <div className="netflix-loader" />
        <p className="text-gray-400 mt-4 text-lg">Loading Episode...</p>
      </div>
    )
  }

  if (!episode) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-red-500 p-8 z-50">
        <Info className="w-12 h-12 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Episode Unavailable</h2>
        <p className="text-center">We're sorry, but this episode could not be loaded.</p>
        {onBack && <button onClick={onBack} className="mt-6 netflix-button">Go Back</button>}
      </div>
    )
  }

  const currentSceneData = episode.scenes[currentSceneIndex]
  const SceneComponent = currentSceneData?.component
  const InteractiveComponent = interactiveMode?.component

  // Validate scene component
  if (currentSceneData && SceneComponent && typeof SceneComponent !== 'function') {
    console.error('Scene component is not a valid React component:', currentSceneData.id)
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-red-500">
        <div className="text-center">
          <h2 className="text-2xl mb-2">Scene Loading Error</h2>
          <p>Invalid scene component for: {currentSceneData.title || currentSceneData.id}</p>
        </div>
      </div>
    )
  }

  const totalDuration = calculateTotalDuration()
  const progress = totalDuration > 0 ? (globalTime / totalDuration) * 100 : 0

  return (
    <div ref={playerRef} className="fixed inset-0 bg-black text-white flex flex-col select-none" onMouseMove={handleMouseMove}>
      {/* Main Viewing Area */}
      <div className="flex-grow relative w-full h-full overflow-hidden">
        {interactiveMode && InteractiveComponent ? (
          <div className="absolute inset-0 flex items-center justify-center p-8 bg-black bg-opacity-75 z-20">
            <InteractiveComponent
              {...(interactiveMode.data || {})}
              onComplete={(result) => {
                console.log(`Interactive moment completed:`, result)
                setInteractiveMode(null)
                setIsPlaying(true)
              }}
            />
          </div>
        ) : (
          SceneComponent && (
            <div className="absolute inset-0">
              <SceneComponent
                time={sceneTime}
                duration={currentSceneData?.duration}
              />
            </div>
          )
        )}
      </div>

      {/* Netflix-style Controls */}
      <div className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Top gradient & Controls */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 via-black/50 to-transparent p-6 flex items-start pointer-events-auto">
          {onBack && (
            <button onClick={onBack} className="text-white hover:text-gray-300 transition-colors p-2 -ml-2 rounded-full hover:bg-white/10">
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}
          <div className="ml-4">
            <h1 className="text-xl font-semibold">{episode.metadata.title}</h1>
            <p className="text-sm text-gray-400">{currentSceneData?.title || `Scene ${currentSceneIndex + 1}`}</p>
          </div>
        </div>

        {/* Bottom gradient & Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-auto">
          {/* Progress bar */}
          <div className="px-12 pb-2">
            <div className="relative h-1 bg-gray-600 rounded cursor-pointer" onClick={handleSeek}>
              <div className="absolute h-full bg-red-600 rounded" style={{ width: `${progress}%` }} />
              <div className="absolute h-3 w-3 bg-white rounded-full -mt-1 shadow-lg" style={{ left: `${progress}%`, transform: 'translateX(-50%)' }} />
            </div>
          </div>

          {/* Control buttons */}
          <div className="px-6 pb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={handlePlayPause} className="text-white hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-white/10">
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              <button className="text-white hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-white/10">
                <SkipBack className="w-5 h-5" />
              </button>
              <button className="text-white hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-white/10">
                <SkipForward className="w-5 h-5" />
              </button>
              <button className="text-white hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-white/10">
                <Volume2 className="w-5 h-5" />
              </button>
              <span className="text-sm">
                {formatTime(globalTime)} / {formatTime(totalDuration)}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <button className="text-white hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-white/10">
                <Settings className="w-5 h-5" />
              </button>
              <button className="text-white hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-white/10">
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NetflixEpisodePlayerPlugin