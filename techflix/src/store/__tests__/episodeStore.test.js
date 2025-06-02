import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEpisodeStore } from '../episodeStore';

// Mock logger
vi.mock('@utils/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  }
}));

describe('episodeStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useEpisodeStore());
    act(() => {
      result.current.resetStore();
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useEpisodeStore());
      
      expect(result.current.currentSeason).toBe(1);
      expect(result.current.currentEpisode).toBe(null);
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.seasons).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe('Season Management', () => {
    it('should set current season', () => {
      const { result } = renderHook(() => useEpisodeStore());
      
      act(() => {
        result.current.setCurrentSeason(2);
      });
      
      expect(result.current.currentSeason).toBe(2);
    });

    it('should not set invalid season number', () => {
      const { result } = renderHook(() => useEpisodeStore());
      
      act(() => {
        result.current.setCurrentSeason(-1);
      });
      
      expect(result.current.currentSeason).toBe(1);
    });
  });

  describe('Episode Management', () => {
    it('should set current episode', () => {
      const { result } = renderHook(() => useEpisodeStore());
      
      act(() => {
        result.current.setCurrentEpisode('ep1');
      });
      
      expect(result.current.currentEpisode).toBe('ep1');
    });

    it('should get episode by id', () => {
      const { result } = renderHook(() => useEpisodeStore());
      
      // Mock seasons data
      const mockSeasons = [
        {
          id: 'season1',
          episodes: [
            { id: 'ep1', title: 'Episode 1' },
            { id: 'ep2', title: 'Episode 2' }
          ]
        }
      ];
      
      act(() => {
        result.current.setSeasons(mockSeasons);
      });
      
      const episode = result.current.getEpisode('techflix', 'season1', 'ep1');
      expect(episode).toEqual({ id: 'ep1', title: 'Episode 1' });
    });

    it('should return null for non-existent episode', () => {
      const { result } = renderHook(() => useEpisodeStore());
      
      const episode = result.current.getEpisode('techflix', 'season1', 'ep999');
      expect(episode).toBe(null);
    });
  });

  describe('Playback State', () => {
    it('should toggle play state', () => {
      const { result } = renderHook(() => useEpisodeStore());
      
      expect(result.current.isPlaying).toBe(false);
      
      act(() => {
        result.current.setIsPlaying(true);
      });
      
      expect(result.current.isPlaying).toBe(true);
    });

    it('should update playback time', () => {
      const { result } = renderHook(() => useEpisodeStore());
      
      act(() => {
        result.current.setPlaybackTime(120);
      });
      
      expect(result.current.playbackTime).toBe(120);
    });
  });

  describe('Loading and Error States', () => {
    it('should set loading state', () => {
      const { result } = renderHook(() => useEpisodeStore());
      
      act(() => {
        result.current.setIsLoading(true);
      });
      
      expect(result.current.isLoading).toBe(true);
    });

    it('should set error state', () => {
      const { result } = renderHook(() => useEpisodeStore());
      
      act(() => {
        result.current.setError('Test error');
      });
      
      expect(result.current.error).toBe('Test error');
    });

    it('should clear error when setting loading', () => {
      const { result } = renderHook(() => useEpisodeStore());
      
      act(() => {
        result.current.setError('Test error');
        result.current.setIsLoading(true);
      });
      
      expect(result.current.error).toBe(null);
    });
  });

  describe('Store Reset', () => {
    it('should reset store to initial state', () => {
      const { result } = renderHook(() => useEpisodeStore());
      
      // Modify state
      act(() => {
        result.current.setCurrentSeason(3);
        result.current.setCurrentEpisode('ep5');
        result.current.setIsPlaying(true);
        result.current.setError('Some error');
      });
      
      // Reset
      act(() => {
        result.current.resetStore();
      });
      
      expect(result.current.currentSeason).toBe(1);
      expect(result.current.currentEpisode).toBe(null);
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });
});