import React, { useState, createContext, useEffect } from 'react'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import EpisodesSection from './components/EpisodesSection'
import SeriesDetails from './components/SeriesDetails'
import NetflixEpisodePlayer from './components/NetflixEpisodePlayer'
import EpisodeErrorBoundary from './components/EpisodeErrorBoundary'
import { SERIES_DATA } from './data/seriesData'
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
    const initializeEpisodes = async () => {
      try {
        setIsLoading(true)
        // Use static SERIES_DATA
        setSeasons(SERIES_DATA.seasons)
        setError(null)
      } catch (err) {
        console.error('Failed to initialize episodes:', err)
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
              console.log("Episode completed!")
              setIsPlayerActive(false)
              setCurrentEpisode(null)
            }}
            onBack={() => {
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
              <EpisodesSection />
              <SeriesDetails />
            </>
          )}
        </div>
      )}
    </AppContext.Provider>
  )
}

export default App