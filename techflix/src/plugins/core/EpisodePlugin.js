export class EpisodePlugin {
  constructor() {
    this.metadata = this.getMetadata();
    this.scenes = this.getScenes();
    this.validatePlugin();
  }

  getMetadata() {
    throw new Error('getMetadata() must be implemented by episode plugin');
  }

  getScenes() {
    throw new Error('getScenes() must be implemented by episode plugin');
  }

  getInteractiveElements() {
    return [];
  }

  getResourceRequirements() {
    return {
      images: [],
      videos: [],
      scripts: [],
      styles: []
    };
  }

  validatePlugin() {
    const { metadata, scenes } = this;
    
    if (!metadata.id) throw new Error('Episode must have an id');
    if (!metadata.title) throw new Error('Episode must have a title');
    if (!metadata.seasonNumber) throw new Error('Episode must have a seasonNumber');
    if (!metadata.episodeNumber) throw new Error('Episode must have an episodeNumber');
    if (!metadata.duration) throw new Error('Episode must have a duration');
    if (!metadata.description) throw new Error('Episode must have a description');
    
    if (!Array.isArray(scenes) || scenes.length === 0) {
      throw new Error('Episode must have at least one scene');
    }

    scenes.forEach((scene, index) => {
      if (!scene.id) throw new Error(`Scene ${index} must have an id`);
      if (!scene.type) throw new Error(`Scene ${index} must have a type`);
      if (!scene.component) throw new Error(`Scene ${index} must have a component`);
      if (!scene.duration) throw new Error(`Scene ${index} must have a duration`);
    });
  }

  toSerializableData() {
    return {
      ...this.metadata,
      scenes: this.scenes.map(scene => ({
        id: scene.id,
        title: scene.title,
        type: scene.type,
        duration: scene.duration,
        category: scene.category,
        description: scene.description,
        narration: scene.narration,
        backgroundImage: scene.backgroundImage,
        interactiveElements: scene.interactiveElements
      })),
      interactiveElements: this.getInteractiveElements(),
      resourceRequirements: this.getResourceRequirements()
    };
  }
}

export const EpisodeMetadataSchema = {
  id: { type: 'string', required: true },
  title: { type: 'string', required: true },
  description: { type: 'string', required: true },
  seasonNumber: { type: 'number', required: true },
  episodeNumber: { type: 'number', required: true },
  duration: { type: 'number', required: true }, // in seconds
  level: { type: 'string', enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], required: true },
  tags: { type: 'array', items: 'string', required: true },
  thumbnailUrl: { type: 'string', required: false },
  releaseDate: { type: 'string', required: false },
  prerequisites: { type: 'array', items: 'string', required: false },
  learningOutcomes: { type: 'array', items: 'string', required: false }
};

export const SceneSchema = {
  id: { type: 'string', required: true },
  type: { type: 'string', required: true },
  component: { type: 'function', required: true },
  title: { type: 'string', required: false },
  category: { type: 'string', required: false },
  description: { type: 'string', required: false },
  narration: { type: 'string', required: false },
  duration: { type: 'number', required: true },
  backgroundImage: { type: 'string', required: false },
  interactiveElements: { type: 'array', required: false }
};