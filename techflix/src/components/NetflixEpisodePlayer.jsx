import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, ChevronLeft, Maximize2, Volume2, Settings, 
         SkipForward, SkipBack, Info } from 'lucide-react'
import logger from '../utils/logger'
import audioManager from '../utils/audioManager'
import { useEpisodeStore } from '../store/episodeStore'
import { useVoiceOver } from '../hooks/useVoiceOver'
import { usePageVisibility } from '../hooks/usePageVisibility'
import VoiceOverControls from './VoiceOverControls'
import ErrorBoundary from './ErrorBoundary'
import SceneWrapper from './SceneWrapper'

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
  const [voiceOverEnabled, setVoiceOverEnabled] = useState(() => audioManager.voiceOverEnabled)
  
  // Use Zustand store for progress tracking
  const { updateProgress: updateZustandProgress } = useEpisodeStore()
  
  // Get episode and scene IDs for voice-over
  const episodeId = episode ? `s${episode.metadata?.seasonNumber || 1}e${episode.metadata?.episodeNumber || 1}` : null
  const currentScene = episode?.scenes[currentSceneIndex]
  const sceneId = currentScene?.id
  
  // Use voice-over hook for current scene
  // TEMPORARILY DISABLED: Old voice-over system to prevent conflicts with new episode audio
  const voiceOver = useVoiceOver(episodeId, sceneId, {
    enabled: false, // Disabled to prevent conflicts with new audio system in scenes
    autoPlay: false,
    onEnd: () => {
      logger.info('Scene voice-over completed', { episodeId, sceneId })
    },
    onError: (error) => {
      logger.error('Voice-over error', { episodeId, sceneId, error })
    }
  })
  
  // Update progress using Zustand store
  const updateProgress = useCallback((seasonNumber, episodeNumber, timeWatched, duration) => {
    updateZustandProgress(seasonNumber, episodeNumber, timeWatched, duration);
  }, [updateZustandProgress]);

  const playerRef = useRef(null)
  const controlsTimeoutRef = useRef(null)
  const wasPlayingBeforeHidden = useRef(false)

  // Use page visibility hook to optimize performance
  usePageVisibility({
    onHidden: () => {
      // Store current playing state and pause
      if (isPlaying) {
        wasPlayingBeforeHidden.current = true;
        setIsPlaying(false);
        logger.info('Pausing playback - tab hidden');
      }
      // Pause voice-over
      if (voiceOver && voiceOver.pause) {
        voiceOver.pause();
      }
    },
    onVisible: () => {
      // Resume if was playing before
      if (wasPlayingBeforeHidden.current && !interactiveMode) {
        setIsPlaying(true);
        wasPlayingBeforeHidden.current = false;
        logger.info('Resuming playback - tab visible');
        // Resume voice-over
        if (voiceOver && voiceOver.play && voiceOverEnabled) {
          voiceOver.play();
        }
      }
    },
    pauseAnimations: true,
    suspendAudio: true,
    throttleTimers: true
  });

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
      logger.info('Episode data received', { 
        hasMetadata: !!episodeData.metadata,
        hasScenes: !!episodeData.scenes,
        sceneCount: episodeData.scenes?.length 
      });
      logger.logEpisodeEvent('EPISODE_LOAD_START', {
        episodeId: episodeData.metadata?.title,
        sceneCount: episodeData.scenes?.length
      })
      logger.startTimer('episodePlayerLoad')
      
      setEpisode(episodeData)
      setTimeout(() => {
        setIsLoading(false)
        setIsPlaying(true)
        const loadTime = logger.endTimer('episodePlayerLoad')
        logger.logEpisodeEvent('EPISODE_LOAD_COMPLETE', {
          episodeId: episodeData.metadata?.title,
          loadTime
        })
      }, 1200)
    } else {
      logger.warn('No episode data received');
    }
  }, [episodeData])

  // Track progress periodically
  useEffect(() => {
    if (!episode || isLoading) return;
    
    const progressInterval = setInterval(() => {
      if (isPlaying && !interactiveMode) {
        // Calculate total time watched across all scenes
        let totalTime = 0;
        for (let i = 0; i < currentSceneIndex; i++) {
          totalTime += episode.scenes[i].duration;
        }
        totalTime += sceneTime;
        
        // Calculate total episode duration
        const totalDuration = episode.scenes.reduce((sum, scene) => sum + scene.duration, 0);
        
        // Update progress
        const seasonNumber = episode.metadata?.seasonNumber || 1;
        const episodeNumber = episode.metadata?.episodeNumber || 1;
        updateProgress(seasonNumber, episodeNumber, totalTime, totalDuration);
      }
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(progressInterval);
  }, [episode, isPlaying, isLoading, interactiveMode, currentSceneIndex, sceneTime, updateProgress]);

  // Playback engine - Using requestAnimationFrame for better performance
  useEffect(() => {
    if (!episode || !isPlaying || isLoading || interactiveMode) return

    const currentScene = episode.scenes[currentSceneIndex]
    if (!currentScene) return
    
    let frameId;
    let lastTime = performance.now();
    
    const updateTime = (currentTime) => {
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;
      
      setSceneTime(prevTime => {
        const newTime = prevTime + deltaTime;

        // Check for interactive moments
        const interactiveMoment = currentScene.interactiveMoments?.find(
          moment => newTime >= moment.timestamp && prevTime < moment.timestamp
        )
        
        if (interactiveMoment && !interactiveMode) {
          logger.logEpisodeEvent('INTERACTIVE_START', {
            episodeId: episode.metadata?.title,
            interactiveId: interactiveMoment.id,
            sceneId: currentScene.id,
            timestamp: interactiveMoment.timestamp
          })
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
            const nextSceneIndex = currentSceneIndex + 1
            logger.logSceneTransition(
              currentScene,
              episode.scenes[nextSceneIndex],
              episode.metadata?.title
            )
            setCurrentSceneIndex(prev => prev + 1)
            return 0
          } else {
            setIsPlaying(false)
            // Mark episode as completed
            const seasonNumber = episode.metadata?.seasonNumber || 1;
            const episodeNumber = episode.metadata?.episodeNumber || 1;
            const totalDuration = episode.scenes.reduce((sum, scene) => sum + scene.duration, 0);
            updateProgress(seasonNumber, episodeNumber, totalDuration, totalDuration);
            onEpisodeEnd?.({ completed: true })
            return currentScene.duration
          }
        }
        return newTime
      })
      
      frameId = requestAnimationFrame(updateTime);
    }
    
    frameId = requestAnimationFrame(updateTime);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    }
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
      // Clear controls timeout on unmount
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [handleMouseMove])

  const handlePlayPause = () => {
    if (interactiveMode) return
    const newPlayState = !isPlaying
    setIsPlaying(newPlayState)
    setShowControls(true)
    
    // Handle voice-over play/pause
    if (voiceOverEnabled && voiceOver) {
      if (newPlayState) {
        voiceOver.play()
      } else {
        voiceOver.pause()
      }
    }
    
    logger.info(`Playback ${newPlayState ? 'resumed' : 'paused'}`, {
      episodeId: episode?.metadata?.title,
      sceneId: episode?.scenes[currentSceneIndex]?.id,
      timestamp: sceneTime
    })
  }

  const handleSeek = (e) => {
    if (interactiveMode) return
    const progressBar = e.currentTarget
    const clickPosition = e.nativeEvent.offsetX
    const barWidth = progressBar.clientWidth
    const seekRatio = Math.max(0, Math.min(1, clickPosition / barWidth)) // Clamp between 0 and 1
    const currentSceneDuration = episode?.scenes[currentSceneIndex]?.duration || 1
    const newTime = Math.max(0, Math.min(currentSceneDuration, seekRatio * currentSceneDuration))
    setSceneTime(newTime)
  }

  // Control handlers for player buttons
  const handleSkipBack = () => {
    // Skip back 10 seconds or to beginning of scene
    const newTime = Math.max(0, sceneTime - 10)
    setSceneTime(newTime)
    const currentSceneData = episode?.scenes[currentSceneIndex]
    logger.info('Skip back', { episodeId: episode?.metadata?.title, sceneId: currentSceneData?.id, newTime })
  }

  const handleSkipForward = () => {
    // Skip forward 10 seconds or to end of scene
    const currentSceneData = episode?.scenes[currentSceneIndex]
    const currentSceneDuration = currentSceneData?.duration || 0
    const newTime = Math.min(currentSceneDuration, sceneTime + 10)
    setSceneTime(newTime)
    logger.info('Skip forward', { episodeId: episode?.metadata?.title, sceneId: currentSceneData?.id, newTime })
  }

  const handleVolumeToggle = () => {
    // Placeholder for volume control
    logger.info('Volume control clicked - functionality pending implementation')
  }

  const handleSettings = () => {
    // Placeholder for settings
    logger.info('Settings control clicked - functionality pending implementation')
  }

  const handleFullscreen = () => {
    // Toggle fullscreen
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen()
      logger.info('Entered fullscreen mode')
    } else {
      document.exitFullscreen()
      logger.info('Exited fullscreen mode')
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
        <p className="text-center">We&apos;re sorry, but this episode could not be loaded.</p>
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
                logger.logEpisodeEvent('INTERACTIVE_COMPLETE', {
                  episodeId: episode?.metadata?.title,
                  interactiveId: interactiveMode.id,
                  result
                })
                setInteractiveMode(null)
                setIsPlaying(true)
              }}
            />
          </div>
        ) : (
          <div className="absolute inset-0">
            {SceneComponent ? (
              <ErrorBoundary
                fallback={
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Info className="w-12 h-12 mb-4 mx-auto text-red-500" />
                      <p className="text-xl text-red-500">Scene unavailable</p>
                      <p className="text-gray-400 mt-2">Error loading scene: {currentSceneData?.id}</p>
                    </div>
                  </div>
                }
                onError={(error) => {
                  logger.error('Scene component error', { 
                    error: error.message, 
                    sceneId: currentSceneData?.id,
                    episodeId: episode?.metadata?.title 
                  });
                }}
              >
                <SceneWrapper
                  component={SceneComponent}
                  time={sceneTime}
                  duration={currentSceneData?.duration}
                  sceneId={currentSceneData?.id}
                />
              </ErrorBoundary>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Info className="w-12 h-12 mb-4 mx-auto text-yellow-500" />
                  <p className="text-xl text-yellow-500">Scene not found</p>
                  <p className="text-gray-400 mt-2">Scene ID: {currentSceneData?.id}</p>
                </div>
              </div>
            )}
          </div>
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
                style={{ width: `${(currentSceneData?.duration && currentSceneData.duration > 0) ? (sceneTime / currentSceneData.duration) * 100 : 0}%` }}
              />
              {/* Interactive markers */}
              {currentSceneData?.interactiveMoments?.map((moment, idx) => (
                <div
                  key={idx}
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-500 rounded-full"
                  style={{ left: `${(currentSceneData.duration && currentSceneData.duration > 0) ? (moment.timestamp / currentSceneData.duration) * 100 : 0}%` }}
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
              <button onClick={handleSkipBack} className="text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                <SkipBack className="w-6 h-6" />
              </button>
              <button onClick={handleSkipForward} className="text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                <SkipForward className="w-6 h-6" />
              </button>
              <div className="relative group">
                <button onClick={handleVolumeToggle} className="text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>
              
              {/* Voice-over controls */}
              {voiceOver.hasVoiceOver && (
                <VoiceOverControls
                  {...voiceOver}
                  onToggle={() => {
                    const newEnabled = audioManager.toggleVoiceOver()
                    setVoiceOverEnabled(newEnabled)
                  }}
                  mode="minimal"
                />
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="relative group">
                <button onClick={handleSettings} className="text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
              <button onClick={handleFullscreen} className="text-white p-2 rounded-full hover:bg-white/10 transition-colors">
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