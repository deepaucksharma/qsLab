import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { AppContext } from '../App';
import SeasonTabs from './SeasonTabs';
import NetflixEpisodeCard from './NetflixEpisodeCard';
import { Grid3x3, List, Clock } from 'lucide-react';
// import { SERIES_DATA } from '../data/seriesData'; // Not needed - using from context
import logger from '../utils/logger';

// Progress tracking utilities
const getProgress = (seasonNumber, episodeNumber) => {
  const key = `progress_s${seasonNumber}e${episodeNumber}`;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : {
    watched: false,
    watchedDate: null,
    timeWatched: 0,
    percentComplete: 0,
    lastWatchedPosition: 0
  };
};

const saveProgress = (seasonNumber, episodeNumber, progress) => {
  const key = `progress_s${seasonNumber}e${episodeNumber}`;
  localStorage.setItem(key, JSON.stringify(progress));
};

// Transform existing episode data to enhanced format
const transformEpisodeData = (episode, seasonNumber) => {
  const progress = getProgress(seasonNumber, episode.number);
  
  // Parse duration to seconds
  const durationMatch = episode.duration?.match(/(\d+)m/);
  const durationInSeconds = durationMatch ? parseInt(durationMatch[1]) * 60 : 2700;
  
  return {
    id: `s${seasonNumber}e${episode.number}`,
    seasonNumber,
    episodeNumber: episode.number,
    overallNumber: episode.number + (seasonNumber - 1) * 4, // Assuming 4 episodes per season
    title: episode.title,
    description: episode.description,
    synopsis: episode.description, // Using description as synopsis
    duration: durationInSeconds,
    durationDisplay: episode.duration,
    level: episode.level,
    tags: episode.tags || [],
    hasContent: episode.hasContent,
    episodeData: episode.episodeData,
    thumbnail: null, // Would need actual thumbnails
    previewVideo: null, // Would need actual preview videos
    progress,
    ratings: {
      userScore: 4.5 + Math.random() * 0.5, // Mock rating
      viewCount: Math.floor(50000 + Math.random() * 100000)
    },
    downloadAvailable: episode.hasContent,
    comingSoon: !episode.hasContent,
    expectedReleaseDate: !episode.hasContent ? 
      new Date(Date.now() + (7 + episode.number * 7) * 24 * 60 * 60 * 1000).toISOString() : null,
    metadata: {
      director: "Tech Studios",
      writers: ["TechFlix Team"],
      producers: ["TechFlix Productions"]
    }
  };
};

const EnhancedEpisodesSectionFixed = () => {
  const { 
    currentSeason, 
    setCurrentSeason, 
    setIsPlayerActive, 
    setCurrentEpisode,
    isPlayerActive,
    currentEpisode: currentlyPlayingEpisode,
    seasons 
  } = useContext(AppContext);
  
  const [selectedSeason, setSelectedSeason] = useState(currentSeason || 1);
  const [viewMode, setViewMode] = useState('grid');
  const [showContinueWatching, setShowContinueWatching] = useState(true);
  const [transformedData, setTransformedData] = useState({});
  
  // Transform all episode data and load progress
  useEffect(() => {
    const transformed = {};
    seasons.forEach(season => {
      // Defensive check: ensure episodes array exists
      if (season && season.episodes && Array.isArray(season.episodes)) {
        transformed[season.number] = season.episodes.map(episode => 
          transformEpisodeData(episode, season.number)
        );
      } else {
        logger.warn('Season missing episodes array', { seasonNumber: season?.number });
        transformed[season.number] = [];
      }
    });
    setTransformedData(transformed);
  }, [seasons]);
  
  // Get continue watching episodes (memoized for performance)
  const continueWatchingEpisodes = useMemo(() => {
    const continueWatching = [];
    Object.entries(transformedData).forEach(([_seasonNumber, episodes]) => {
      episodes.forEach(episode => {
        if (episode.progress.percentComplete > 0 && episode.progress.percentComplete < 95) {
          continueWatching.push(episode);
        }
      });
    });
    return continueWatching.sort((a, b) => {
      const dateA = new Date(a.progress.watchedDate || 0);
      const dateB = new Date(b.progress.watchedDate || 0);
      return dateB - dateA;
    });
  }, [transformedData]);
  
  // Get current season data
  const currentSeasonData = seasons.find(s => s.number === selectedSeason);
  const episodes = transformedData[selectedSeason] || [];
  
  // Check for new episodes in each season
  const seasonsWithNewBadges = seasons.map(season => ({
    ...season,
    hasNewEpisodes: season.episodes.some(ep => {
      // For demo purposes, mark Season 3 as new
      return season.number === 3 && ep.hasContent;
    })
  }));

  const handlePlayEpisode = (episode) => {
    if (!episode.hasContent || !episode.episodeData) return;
    
    // Update context with the original episode data format
    setCurrentEpisode(episode.episodeData);
    setCurrentSeason(episode.seasonNumber);
    setIsPlayerActive(true);
    
    // Update progress to mark as started
    const newProgress = {
      ...episode.progress,
      lastWatchedDate: new Date().toISOString()
    };
    saveProgress(episode.seasonNumber, episode.episodeNumber, newProgress);
    
    // Scroll to player
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSeasonChange = (seasonNumber) => {
    setSelectedSeason(seasonNumber);
    setCurrentSeason(seasonNumber);
  };

  // Determine currently playing episode
  const currentlyPlayingEpisodeId = isPlayerActive && currentlyPlayingEpisode ? 
    `s${currentSeason}e${currentlyPlayingEpisode.metadata?.episodeNumber || 1}` : null;

  return (
    <section className="w-full bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Continue Watching Section */}
        {continueWatchingEpisodes.length > 0 && showContinueWatching && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Clock className="w-6 h-6" />
                Continue Watching
              </h2>
              <button
                onClick={() => setShowContinueWatching(false)}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Hide
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {continueWatchingEpisodes.slice(0, 4).map((episode) => (
                <NetflixEpisodeCard
                  key={episode.id}
                  episode={episode}
                  onPlay={handlePlayEpisode}
                  isCurrentEpisode={currentlyPlayingEpisodeId === episode.id}
                  layoutMode="grid"
                />
              ))}
            </div>
          </div>
        )}

        {/* Season Tabs */}
        <SeasonTabs
          seasons={seasonsWithNewBadges}
          selectedSeason={selectedSeason}
          onSeasonChange={handleSeasonChange}
        />

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-medium text-white">
              {currentSeasonData?.title || `Season ${selectedSeason}`}
            </h3>
            <span className="text-gray-400 text-sm">
              {episodes.filter(ep => ep.hasContent).length} of {episodes.length} available
            </span>
          </div>
          
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              aria-label="Grid view"
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              aria-label="List view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Episodes Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {episodes.map((episode) => (
              <NetflixEpisodeCard
                key={episode.id}
                episode={episode}
                onPlay={handlePlayEpisode}
                isCurrentEpisode={currentlyPlayingEpisodeId === episode.id}
                layoutMode="grid"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {episodes.map((episode) => (
              <NetflixEpisodeCard
                key={episode.id}
                episode={episode}
                onPlay={handlePlayEpisode}
                isCurrentEpisode={currentlyPlayingEpisodeId === episode.id}
                layoutMode="list"
              />
            ))}
          </div>
        )}

        {/* More Like This Section */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-6">More Like This</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors cursor-pointer">
              <h3 className="text-white font-medium text-lg mb-2">Advanced Kafka Patterns</h3>
              <p className="text-gray-400 text-sm mb-4">
                Deep dive into advanced Kafka patterns including exactly-once semantics, transactions, and stream processing.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-green-500">95% Match</span>
                <span className="text-gray-500">Coming Soon</span>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors cursor-pointer">
              <h3 className="text-white font-medium text-lg mb-2">Observability Masterclass</h3>
              <p className="text-gray-400 text-sm mb-4">
                Complete guide to building observable systems with distributed tracing, metrics, and logging.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-green-500">92% Match</span>
                <span className="text-gray-500">Coming Soon</span>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors cursor-pointer">
              <h3 className="text-white font-medium text-lg mb-2">Cloud Native Architecture</h3>
              <p className="text-gray-400 text-sm mb-4">
                Build and deploy cloud-native applications with Kubernetes, service mesh, and serverless.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-green-500">89% Match</span>
                <span className="text-gray-500">Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnhancedEpisodesSectionFixed;