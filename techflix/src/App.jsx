import React, { useState, createContext, useEffect } from 'react'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
// import EpisodesSection from './components/EpisodesSection' // Replaced with Enhanced version
import EnhancedEpisodesSectionFixed from './components/EnhancedEpisodesSectionFixed'
import SeriesDetails from './components/SeriesDetails'
import NetflixEpisodePlayer from './components/NetflixEpisodePlayer'
import EpisodeErrorBoundary from './components/EpisodeErrorBoundary'
import DebugPanel from './components/DebugPanel'
import { SERIES_DATA } from './data/seriesData'
import logger from './utils/logger'
import './styles/global.css'

// App Context for state management
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
  const [currentSeason, setCurrentSeason] = useState(1)
  const [isPlayerActive, setIsPlayerActive] = useState(false)
  const [currentEpisode, setCurrentEpisode] = useState(null)
  const [seasons, setSeasons] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize seasons from static data
  useEffect(() => {
    logger.info('App initialized', {
      totalSeasons: SERIES_DATA.seasons.length,
      totalEpisodes: SERIES_DATA.seasons.reduce((acc, s) => acc + s.episodes.length, 0),
      environment: import.meta.env.MODE
    })

    const initializeEpisodes = async () => {
      try {
        logger.info('Loading episodes...')
        logger.startTimer('episodeLoad')
        setIsLoading(true)
        
        // Use static SERIES_DATA
        setSeasons(SERIES_DATA.seasons)
        setError(null)
        
        const loadTime = logger.endTimer('episodeLoad')
        logger.info('Episodes loaded successfully', {
          seasonCount: SERIES_DATA.seasons.length,
          loadTime
        })
      } catch (err) {
        logger.error('Failed to initialize episodes', {
          error: err.message,
          stack: err.stack
        })
        setError('Failed to load episodes. Please refresh the page.')
      } finally {
        setIsLoading(false)
      }
    }

    initializeEpisodes()
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