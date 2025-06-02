import React, { createContext, useEffect } from 'react'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
// import EpisodesSection from './components/EpisodesSection' // Replaced with Enhanced version
import EnhancedEpisodesSectionFixed from './components/EnhancedEpisodesSectionFixed'
import SeriesDetails from './components/SeriesDetails'
import NetflixEpisodePlayer from './components/NetflixEpisodePlayer'
import EpisodeErrorBoundary from './components/EpisodeErrorBoundary'
import DebugPanel from './components/DebugPanel'
import { useEpisodeStore } from './store/episodeStore'
import logger from './utils/logger'
import './styles/global.css'

// App Context for backward compatibility
export const AppContext = createContext({
  currentSeason: 1,
  setCurrentSeason: () => {},
  isPlayerActive: false,
  setIsPlayerActive: () => {},
  currentEpisode: null,
  setCurrentEpisode: () => {},
  seasons: [],
  isLoading: true,
  error: null
})

// Main App Component
function App() {
  // Use Zustand store for all state
  const {
    seasons,
    currentSeason,
    currentEpisode,
    isPlayerActive,
    isLoading,
    error,
    setCurrentSeason,
    setCurrentEpisode,
    setIsPlayerActive,
    initialize,
    updateProgress
  } = useEpisodeStore()

  // Initialize store on mount
  useEffect(() => {
    logger.info('App initialized', {
      environment: import.meta.env.MODE
    })
    
    // Initialize the Zustand store
    initialize()
  }, [])

  const contextValue = {
    currentSeason,
    setCurrentSeason,
    isPlayerActive,
    setIsPlayerActive,
    currentEpisode,
    setCurrentEpisode,
    seasons,
    isLoading,
    error
  }

  return (
    <AppContext.Provider value={contextValue}>
      {isPlayerActive && currentEpisode ? (
        <EpisodeErrorBoundary
          onBack={() => {
            setIsPlayerActive(false)
            setCurrentEpisode(null)
          }}
        >
          <NetflixEpisodePlayer
            episodeData={currentEpisode}
            onEpisodeEnd={() => {
              logger.logEpisodeEvent('EPISODE_COMPLETE', {
                episodeId: currentEpisode?.metadata?.title,
                duration: currentEpisode?.metadata?.runtime
              })
              setIsPlayerActive(false)
              setCurrentEpisode(null)
            }}
            onBack={() => {
              logger.info('User exited episode player', {
                episodeId: currentEpisode?.metadata?.title
              })
              setIsPlayerActive(false)
              setCurrentEpisode(null)
            }}
          />
        </EpisodeErrorBoundary>
      ) : (
        <div id="netflix-view">
          <Header />
          <HeroSection />
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-white text-xl">Loading episodes...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-red-500 text-xl">{error}</div>
            </div>
          ) : (
            <>
              <EnhancedEpisodesSectionFixed />
              <SeriesDetails />
            </>
          )}
        </div>
      )}
      <DebugPanel />
    </AppContext.Provider>
  )
}

export default App