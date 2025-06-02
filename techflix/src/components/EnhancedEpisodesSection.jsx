import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../App';
import SeasonTabs from './SeasonTabs';
import NetflixEpisodeCard from './NetflixEpisodeCard';
import { Grid3x3, List, Play, Clock } from 'lucide-react';
import { ENHANCED_SERIES_DATA } from '../data/enhancedSeriesData';

const EnhancedEpisodesSection = () => {
  const { state, dispatch } = useContext(AppContext);
  const [selectedSeason, setSelectedSeason] = useState(state.currentSeason || 1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showContinueWatching, setShowContinueWatching] = useState(true);
  
  // Get continue watching episodes
  const continueWatchingEpisodes = ENHANCED_SERIES_DATA.getContinueWatching();
  
  // Get current season data
  const currentSeasonData = ENHANCED_SERIES_DATA.seasons.find(s => s.number === selectedSeason);
  const episodes = currentSeasonData?.episodes || [];
  
  // Check for new episodes in each season
  const seasonsWithNewBadges = ENHANCED_SERIES_DATA.seasons.map(season => ({
    ...season,
    hasNewEpisodes: season.episodes.some(ep => {
      // Check if episode was released in the last 7 days
      const releaseDate = new Date(ep.releaseDate);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return releaseDate > sevenDaysAgo && ep.hasContent;
    })
  }));

  const handlePlayEpisode = (episode) => {
    if (!episode.hasContent) return;
    
    dispatch({ 
      type: 'SET_CURRENT_EPISODE', 
      payload: episode.episodeNumber 
    });
    dispatch({ 
      type: 'SET_CURRENT_SEASON', 
      payload: episode.seasonNumber 
    });
    dispatch({ 
      type: 'SET_PLAYING', 
      payload: true 
    });
    
    // Scroll to player
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSeasonChange = (seasonNumber) => {
    setSelectedSeason(seasonNumber);
    dispatch({ type: 'SET_CURRENT_SEASON', payload: seasonNumber });
  };

  // Get the currently playing episode
  const currentlyPlayingEpisode = state.isPlaying ? 
    ENHANCED_SERIES_DATA.seasons
      .find(s => s.number === state.currentSeason)
      ?.episodes.find(e => e.episodeNumber === state.currentEpisode) : null;

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
                  isCurrentEpisode={currentlyPlayingEpisode?.id === episode.id}
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
                isCurrentEpisode={currentlyPlayingEpisode?.id === episode.id}
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
                isCurrentEpisode={currentlyPlayingEpisode?.id === episode.id}
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

export default EnhancedEpisodesSection;