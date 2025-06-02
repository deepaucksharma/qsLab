import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { SERIES_DATA } from '@data/seriesData';
import logger from '@utils/logger';

const useEpisodeStore = create(
  devtools(
    persist(
      (set, get) => ({
        // State
        seasons: SERIES_DATA.seasons || [],
        currentSeason: 1,
        currentEpisode: null,
        isPlayerActive: false,
        isLoading: false,
        error: null,
        progress: {},

        // Actions
        setCurrentSeason: (seasonNumber) => 
          set({ currentSeason: seasonNumber }, false, 'setCurrentSeason'),

        setCurrentEpisode: (episode) => {
          logger.info('Setting current episode', { episode: episode?.metadata?.title });
          set({ currentEpisode: episode }, false, 'setCurrentEpisode');
        },

        setIsPlayerActive: (active) => 
          set({ isPlayerActive: active }, false, 'setIsPlayerActive'),

        playEpisode: (episode, seasonNumber) => {
          const { setCurrentEpisode, setCurrentSeason, setIsPlayerActive } = get();
          
          logger.logEpisodeEvent('EPISODE_PLAY', {
            episodeId: episode?.metadata?.title,
            seasonNumber,
          });

          setCurrentEpisode(episode);
          setCurrentSeason(seasonNumber);
          setIsPlayerActive(true);
        },

        stopEpisode: () => {
          const { setIsPlayerActive, setCurrentEpisode } = get();
          setIsPlayerActive(false);
          setCurrentEpisode(null);
        },

        // Progress tracking
        updateProgress: (seasonNumber, episodeNumber, timeWatched, duration) => {
          const progressKey = `s${seasonNumber}e${episodeNumber}`;
          const percentComplete = (timeWatched / duration) * 100;
          const watched = percentComplete >= 95;

          set((state) => ({
            progress: {
              ...state.progress,
              [progressKey]: {
                timeWatched,
                percentComplete,
                watched,
                lastWatchedDate: new Date().toISOString(),
                watchedDate: watched && !state.progress[progressKey]?.watchedDate 
                  ? new Date().toISOString() 
                  : state.progress[progressKey]?.watchedDate,
              }
            }
          }), false, 'updateProgress');
        },

        getEpisodeProgress: (seasonNumber, episodeNumber) => {
          const progressKey = `s${seasonNumber}e${episodeNumber}`;
          return get().progress[progressKey] || {
            timeWatched: 0,
            percentComplete: 0,
            watched: false,
            lastWatchedDate: null,
            watchedDate: null,
          };
        },

        getContinueWatching: () => {
          const { seasons, progress } = get();
          const continueWatching = [];

          seasons.forEach(season => {
            season.episodes.forEach(episode => {
              const progressKey = `s${season.number}e${episode.number}`;
              const episodeProgress = progress[progressKey];

              if (episodeProgress && 
                  episodeProgress.percentComplete > 0 && 
                  episodeProgress.percentComplete < 95 &&
                  episode.hasContent) {
                continueWatching.push({
                  ...episode,
                  seasonNumber: season.number,
                  progress: episodeProgress,
                });
              }
            });
          });

          return continueWatching.sort((a, b) => 
            new Date(b.progress.lastWatchedDate) - new Date(a.progress.lastWatchedDate)
          );
        },

        // Initialize
        initialize: async () => {
          set({ isLoading: true, error: null });
          
          try {
            logger.info('Initializing episode store');
            // In a real app, this would fetch from an API
            // For now, we use static data
            set({ 
              seasons: SERIES_DATA.seasons,
              isLoading: false,
              error: null 
            });
          } catch (error) {
            logger.error('Failed to initialize episodes', { error: error.message });
            set({ 
              isLoading: false, 
              error: 'Failed to load episodes' 
            });
          }
        },
      }),
      {
        name: 'episode-storage',
        partialize: (state) => ({
          progress: state.progress,
          currentSeason: state.currentSeason,
        }),
      }
    ),
    {
      name: 'EpisodeStore',
    }
  )
);

export { useEpisodeStore };