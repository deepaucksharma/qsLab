import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, ChevronLeft, Maximize2, Volume2, Settings, 
         SkipForward, SkipBack, Info } from 'lucide-react'

// Import interactive components
import InteractiveStateMachine from './interactive/InteractiveStateMachine'

const NetflixEpisodePlayer = ({ episodeData, onEpisodeEnd, onBack }) => {
  const [episode, setEpisode] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const [sceneTime, setSceneTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [interactiveMode, setInteractiveMode] = useState(null)

  const playerRef = useRef(null)
  const controlsTimeoutRef = useRef(null)

  // Interactive component mapping for string references
  const interactiveComponents = {
    InteractiveStateMachine
  }

  // Format time helper
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) seconds = 0
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Load episode data
  useEffect(() => {
    if (episodeData) {
      setEpisode(episodeData)
      setTimeout(() => {
        setIsLoading(false)
        setIsPlaying(true)
      }, 1200)
    }
  }, [episodeData])

  // Playback engine
  useEffect(() => {
    if (!episode || !isPlaying || isLoading || interactiveMode) return

    const currentScene = episode.scenes[currentSceneIndex]
    if (!currentScene) return
    
    const intervalId = setInterval(() => {
      setSceneTime(prevTime => {
        const newTime = prevTime + 0.1

        // Check for interactive moments
        const interactiveMoment = currentScene.interactiveMoments?.find(
          moment => newTime >= moment.timestamp && prevTime < moment.timestamp
        )
        
        if (interactiveMoment && !interactiveMode) {
          setInteractiveMode({ 
            component: interactiveMoment.component,
            props: interactiveMoment.props || {},
            id: interactiveMoment.id
          })
          setIsPlaying(false)
          return interactiveMoment.timestamp
        }
        
        if (newTime >= currentScene.duration) {
          if (currentSceneIndex < episode.scenes.length - 1) {
            setCurrentSceneIndex(prev => prev + 1)
            return 0
          } else {
            setIsPlaying(false)
            onEpisodeEnd?.({ completed: true })
            return currentScene.duration
          }
        }
        return newTime
      })
    }, 100)

    return () => clearInterval(intervalId)
  }, [episode, isPlaying, isLoading, currentSceneIndex, interactiveMode, onEpisodeEnd])

  // Controls visibility
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
    const currentSceneDuration = episode?.scenes[currentSceneIndex]?.duration || 1
    setSceneTime(seekRatio * currentSceneDuration)
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
  const InteractiveComponent = interactiveMode ? interactiveComponents[interactiveMode.component] : null

  return (
    <div ref={playerRef} className="fixed inset-0 bg-black text-white flex flex-col select-none" onMouseMove={handleMouseMove}>
      {/* Main Viewing Area */}
      <div className="flex-grow relative w-full h-full overflow-hidden">
        {interactiveMode && InteractiveComponent ? (
          <div className="absolute inset-0 flex items-center justify-center p-8 bg-black bg-opacity-75 z-20">
            <InteractiveComponent
              {...(interactiveMode.props || {})}
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
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 flex flex-col justify-end pointer-events-auto">
          {/* Progress Bar */}
          <div className="mb-4 group">
            <div 
              className="h-1 bg-gray-700 group-hover:h-2 transition-all rounded-full relative cursor-pointer"
              onClick={handleSeek}
            >
              <div 
                className="h-full bg-red-600 rounded-full"
                style={{ width: `${(sceneTime / (currentSceneData?.duration || 1)) * 100}%` }}
              />
              {/* Interactive markers */}
              {currentSceneData?.interactiveMoments?.map((moment, idx) => (
                <div
                  key={idx}
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-500 rounded-full"
                  style={{ left: `${(moment.timestamp / currentSceneData.duration) * 100}%` }}
                  title="Interactive moment"
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1 px-0.5">
              <span>{formatTime(sceneTime)}</span>
              <span>Scene {currentSceneIndex + 1} of {episode.scenes.length}</span>
              <span>{formatTime(currentSceneData?.duration || 0)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={handlePlayPause} className="text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7" />}
              </button>
              <button className="text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                <SkipBack className="w-6 h-6" />
              </button>
              <button className="text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                <SkipForward className="w-6 h-6" />
              </button>
              <div className="relative group">
                <button className="text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative group">
                <button className="text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
              <button className="text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NetflixEpisodePlayer