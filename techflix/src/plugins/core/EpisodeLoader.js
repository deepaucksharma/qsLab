import { PluginManifest } from './PluginManifest.js';
import EpisodeValidator from '../utils/EpisodeValidator.jsx';

export class EpisodeLoader {
  constructor() {
    this.loadedEpisodes = new Map();
    this.manifests = new Map();
    this.loadingPromises = new Map();
  }

  async loadEpisode(episodePath) {
    // Check if already loaded
    if (this.loadedEpisodes.has(episodePath)) {
      return this.loadedEpisodes.get(episodePath);
    }

    // Check if already loading
    if (this.loadingPromises.has(episodePath)) {
      return this.loadingPromises.get(episodePath);
    }

    // Start loading
    const loadingPromise = this._loadEpisodeInternal(episodePath);
    this.loadingPromises.set(episodePath, loadingPromise);

    try {
      const episode = await loadingPromise;
      this.loadedEpisodes.set(episodePath, episode);
      this.loadingPromises.delete(episodePath);
      return episode;
    } catch (error) {
      this.loadingPromises.delete(episodePath);
      throw error;
    }
  }

  async _loadEpisodeInternal(episodePath) {
    try {
      // Load manifest
      const manifestPath = `${episodePath}/manifest.json`;
      const manifestResponse = await fetch(manifestPath);
      
      if (!manifestResponse.ok) {
        throw new Error(`Failed to load manifest: ${manifestPath}`);
      }

      const manifestData = await manifestResponse.json();
      const manifest = new PluginManifest(manifestData);
      this.manifests.set(episodePath, manifest);

      // Dynamically import the episode module
      const modulePath = episodePath + '/' + manifest.episodeClass;
      const module = await import(/* @vite-ignore */ modulePath);
      const EpisodeClass = module.default;

      if (!EpisodeClass) {
        throw new Error(`No default export found in ${modulePath}`);
      }

      // Create instance
      const episodeInstance = new EpisodeClass();
      
      // Validate it's an EpisodePlugin
      if (!episodeInstance.getMetadata || !episodeInstance.getScenes) {
        throw new Error(`Invalid episode plugin: ${episodePath}`);
      }

      // Validate episode
      const validation = EpisodeValidator.validateEpisode(episodeInstance);
      if (!validation.valid) {
        console.error(`Episode validation errors for ${episodePath}:`, validation.errors);
        if (validation.errors.length > 0) {
          throw new Error(`Episode validation failed: ${validation.errors[0]}`);
        }
      }

      if (validation.warnings.length > 0) {
        console.warn(`Episode validation warnings for ${episodePath}:`, validation.warnings);
      }

      return {
        path: episodePath,
        manifest,
        instance: episodeInstance,
        metadata: episodeInstance.getMetadata(),
        scenes: episodeInstance.getScenes(),
        interactiveElements: episodeInstance.getInteractiveElements(),
        resources: episodeInstance.getResourceRequirements(),
        validation
      };
    } catch (error) {
      console.error(`Failed to load episode: ${episodePath}`, error);
      throw new Error(`Episode loading failed: ${error.message}`);
    }
  }

  async loadMultipleEpisodes(episodePaths) {
    const promises = episodePaths.map(path => this.loadEpisode(path));
    return Promise.all(promises);
  }

  getLoadedEpisode(episodePath) {
    return this.loadedEpisodes.get(episodePath);
  }

  getAllLoadedEpisodes() {
    return Array.from(this.loadedEpisodes.values());
  }

  clearCache() {
    this.loadedEpisodes.clear();
    this.manifests.clear();
    this.loadingPromises.clear();
  }
}

// Singleton instance
export const episodeLoader = new EpisodeLoader();