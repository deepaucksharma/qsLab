import { episodeLoader } from './EpisodeLoader.js';

export class EpisodeRegistry {
  constructor() {
    this.registeredEpisodes = new Map();
    this.episodesBySeason = new Map();
    this.episodesByTag = new Map();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // In a real implementation, this would scan the file system or use a config file
      // For now, we'll use a static registry configuration
      const registryConfig = await this.loadRegistryConfig();
      
      // Register all episodes
      for (const episodeConfig of registryConfig.episodes) {
        await this.registerEpisode(episodeConfig);
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize episode registry:', error);
      throw error;
    }
  }

  async loadRegistryConfig() {
    try {
      const response = await fetch('/src/plugins/episodes/registry.json');
      if (!response.ok) {
        throw new Error('Failed to load registry configuration');
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to load registry config, using fallback:', error);
      // Fallback configuration with both episodes
      return {
        episodes: [
          {
            id: 'kafka-share-groups',
            path: '/src/plugins/episodes/kafka-share-groups',
            enabled: true
          },
          {
            id: 'kafka-share-groups-ultra',
            path: '/src/plugins/episodes/kafka-share-groups-ultra',
            enabled: true
          }
        ]
      };
    }
  }

  async registerEpisode(config) {
    if (!config.enabled) return;

    try {
      const episode = await episodeLoader.loadEpisode(config.path);
      const metadata = episode.metadata;

      // Register in main registry
      this.registeredEpisodes.set(metadata.id, episode);

      // Register by season
      const seasonKey = `season-${metadata.seasonNumber}`;
      if (!this.episodesBySeason.has(seasonKey)) {
        this.episodesBySeason.set(seasonKey, []);
      }
      this.episodesBySeason.get(seasonKey).push(episode);

      // Register by tags
      for (const tag of metadata.tags) {
        if (!this.episodesByTag.has(tag)) {
          this.episodesByTag.set(tag, []);
        }
        this.episodesByTag.get(tag).push(episode);
      }

      console.log(`Registered episode: ${metadata.title}`);
    } catch (error) {
      console.error(`Failed to register episode: ${config.id}`, error);
    }
  }

  getEpisodeById(id) {
    return this.registeredEpisodes.get(id);
  }

  getEpisodesBySeason(seasonNumber) {
    const seasonKey = `season-${seasonNumber}`;
    return this.episodesBySeason.get(seasonKey) || [];
  }

  getEpisodesByTag(tag) {
    return this.episodesByTag.get(tag) || [];
  }

  getAllEpisodes() {
    return Array.from(this.registeredEpisodes.values());
  }

  getSeasons() {
    const seasons = [];
    
    for (const [key, episodes] of this.episodesBySeason) {
      const seasonNumber = parseInt(key.replace('season-', ''));
      
      // Sort episodes by episode number
      const sortedEpisodes = [...episodes].sort((a, b) => 
        a.metadata.episodeNumber - b.metadata.episodeNumber
      );

      seasons.push({
        number: seasonNumber,
        title: this.getSeasonTitle(seasonNumber),
        episodes: sortedEpisodes
      });
    }

    // Sort seasons by number
    return seasons.sort((a, b) => a.number - b.number);
  }

  getSeasonTitle(seasonNumber) {
    // This could be configured elsewhere
    const seasonTitles = {
      1: 'Foundations',
      2: 'Advanced Topics',
      3: 'Production Systems',
      4: 'Expert Patterns'
    };
    return `Season ${seasonNumber}: ${seasonTitles[seasonNumber] || 'Unknown'}`;
  }

  searchEpisodes(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    for (const episode of this.registeredEpisodes.values()) {
      const metadata = episode.metadata;
      
      // Search in title, description, and tags
      if (
        metadata.title.toLowerCase().includes(lowerQuery) ||
        metadata.description.toLowerCase().includes(lowerQuery) ||
        metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      ) {
        results.push(episode);
      }
    }

    return results;
  }

  getEpisodeStats() {
    return {
      totalEpisodes: this.registeredEpisodes.size,
      totalSeasons: this.episodesBySeason.size,
      episodesByLevel: this.getEpisodesByLevel(),
      totalDuration: this.getTotalDuration()
    };
  }

  getEpisodesByLevel() {
    const levels = {};
    
    for (const episode of this.registeredEpisodes.values()) {
      const level = episode.metadata.level;
      levels[level] = (levels[level] || 0) + 1;
    }
    
    return levels;
  }

  getTotalDuration() {
    let total = 0;
    
    for (const episode of this.registeredEpisodes.values()) {
      total += episode.metadata.duration;
    }
    
    return total;
  }
}

// Singleton instance
export const episodeRegistry = new EpisodeRegistry();