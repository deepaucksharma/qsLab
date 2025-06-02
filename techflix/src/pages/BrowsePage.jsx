import React, { useState, useEffect } from 'react';
import HeroSection from '@components/HeroSection';
import EnhancedEpisodesSectionFixed from '@components/EnhancedEpisodesSectionFixed';
import SeriesDetails from '@components/SeriesDetails';
import NetflixEpisodePlayer from '@components/NetflixEpisodePlayer';
import EpisodeErrorBoundary from '@components/EpisodeErrorBoundary';
import DebugPanel from '@components/DebugPanel';
import { SERIES_DATA } from '@data/seriesData';
import logger from '@utils/logger';
import { AppContext } from '../App';

const BrowsePage = () => {
  const [currentSeason, setCurrentSeason] = useState(1);
  const [isPlayerActive, setIsPlayerActive] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize seasons from static data
  useEffect(() => {
    logger.info('BrowsePage initialized', {
      totalSeasons: SERIES_DATA.seasons.length,
      totalEpisodes: SERIES_DATA.seasons.reduce((acc, s) => acc + s.episodes.length, 0),
      environment: import.meta.env.MODE
    });

    // Simplified synchronous loading
    try {
      setSeasons(SERIES_DATA.seasons);
      setError(null);
      logger.info('Episodes loaded successfully', {
        seasonCount: SERIES_DATA.seasons.length
      });
    } catch (err) {
      logger.error('Failed to initialize episodes', err);
      setError('Failed to load episodes. Please try again.');
    }
    
    // Always set loading to false
    setIsLoading(false);
  }, []);

  const handleEpisodeSelect = (episode, seasonNumber) => {
    logger.logEpisodeEvent('EPISODE_SELECTED', {
      episodeId: episode.episodeData?.metadata?.title,
      seasonNumber,
      episodeNumber: episode.number
    });
    setCurrentEpisode(episode);
    setIsPlayerActive(true);
  };

  const handleEpisodeEnd = () => {
    logger.logEpisodeEvent('EPISODE_COMPLETED', {
      episodeId: currentEpisode?.episodeData?.metadata?.title
    });
    setIsPlayerActive(false);
    setCurrentEpisode(null);
  };

  return (
    <AppContext.Provider value={{
      currentSeason,
      setCurrentSeason,
      isPlayerActive,
      setIsPlayerActive,
      currentEpisode,
      setCurrentEpisode,
      seasons,
      isLoading,
      error,
      handleEpisodeSelect
    }}>
      {isPlayerActive && currentEpisode ? (
        <EpisodeErrorBoundary>
          <NetflixEpisodePlayer 
            episodeData={currentEpisode.episodeData}
            onEpisodeEnd={handleEpisodeEnd}
            onBack={() => {
              setIsPlayerActive(false);
              setCurrentEpisode(null);
            }}
          />
        </EpisodeErrorBoundary>
      ) : (
        <>
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
        </>
      )}
      <DebugPanel />
    </AppContext.Provider>
  );
};

export default BrowsePage;