export const PluginManifestSchema = {
  version: '1.0.0',
  name: { type: 'string', required: true },
  displayName: { type: 'string', required: true },
  description: { type: 'string', required: true },
  author: { type: 'string', required: true },
  episodeClass: { type: 'string', required: true }, // Entry point file
  seasonNumber: { type: 'number', required: true },
  episodeNumber: { type: 'number', required: true },
  dependencies: { type: 'array', items: 'string', required: false },
  assets: {
    type: 'object',
    properties: {
      thumbnails: { type: 'array', items: 'string' },
      images: { type: 'array', items: 'string' },
      videos: { type: 'array', items: 'string' }
    }
  },
  config: { type: 'object', required: false }
};

export class PluginManifest {
  constructor(data) {
    this.data = data;
    this.validate();
  }

  validate() {
    const required = ['name', 'displayName', 'description', 'author', 'episodeClass', 'seasonNumber', 'episodeNumber'];
    
    required.forEach(field => {
      if (!this.data[field]) {
        throw new Error(`Plugin manifest missing required field: ${field}`);
      }
    });

    if (typeof this.data.seasonNumber !== 'number' || this.data.seasonNumber < 1) {
      throw new Error('seasonNumber must be a positive number');
    }

    if (typeof this.data.episodeNumber !== 'number' || this.data.episodeNumber < 1) {
      throw new Error('episodeNumber must be a positive number');
    }
  }

  get name() { return this.data.name; }
  get displayName() { return this.data.displayName; }
  get description() { return this.data.description; }
  get author() { return this.data.author; }
  get episodeClass() { return this.data.episodeClass; }
  get seasonNumber() { return this.data.seasonNumber; }
  get episodeNumber() { return this.data.episodeNumber; }
  get dependencies() { return this.data.dependencies || []; }
  get assets() { return this.data.assets || {}; }
  get config() { return this.data.config || {}; }
}