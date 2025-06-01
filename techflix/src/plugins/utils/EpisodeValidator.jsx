import { EpisodeMetadataSchema, SceneSchema } from '../core/EpisodePlugin';

export class EpisodeValidator {
  static validateMetadata(metadata) {
    const errors = [];
    const warnings = [];

    // Required fields
    const requiredFields = ['id', 'title', 'description', 'seasonNumber', 
                          'episodeNumber', 'duration', 'level', 'tags'];
    
    for (const field of requiredFields) {
      if (!metadata[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate types
    if (metadata.seasonNumber && typeof metadata.seasonNumber !== 'number') {
      errors.push('seasonNumber must be a number');
    }

    if (metadata.episodeNumber && typeof metadata.episodeNumber !== 'number') {
      errors.push('episodeNumber must be a number');
    }

    if (metadata.duration && typeof metadata.duration !== 'number') {
      errors.push('duration must be a number (in seconds)');
    }

    // Validate level
    const validLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    if (metadata.level && !validLevels.includes(metadata.level)) {
      errors.push(`level must be one of: ${validLevels.join(', ')}`);
    }

    // Validate tags
    if (metadata.tags) {
      if (!Array.isArray(metadata.tags)) {
        errors.push('tags must be an array');
      } else if (metadata.tags.length === 0) {
        warnings.push('Episode has no tags');
      }
    }

    // Validate ranges
    if (metadata.seasonNumber && metadata.seasonNumber < 1) {
      errors.push('seasonNumber must be >= 1');
    }

    if (metadata.episodeNumber && metadata.episodeNumber < 1) {
      errors.push('episodeNumber must be >= 1');
    }

    if (metadata.duration && metadata.duration < 60) {
      warnings.push('Episode duration is less than 1 minute');
    }

    // Validate optional fields
    if (metadata.releaseDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(metadata.releaseDate)) {
        warnings.push('releaseDate should be in YYYY-MM-DD format');
      }
    }

    if (metadata.thumbnailUrl && !metadata.thumbnailUrl.startsWith('/')) {
      warnings.push('thumbnailUrl should start with / for relative paths');
    }

    return { errors, warnings };
  }

  static validateScene(scene, index) {
    const errors = [];
    const warnings = [];

    // Required fields
    if (!scene.id) {
      errors.push(`Scene ${index}: missing required field 'id'`);
    }

    if (!scene.type) {
      errors.push(`Scene ${index}: missing required field 'type'`);
    }

    if (!scene.component) {
      errors.push(`Scene ${index}: missing required field 'component'`);
    }

    if (scene.duration === undefined || scene.duration === null) {
      errors.push(`Scene ${index}: missing required field 'duration'`);
    }

    // Validate types
    if (scene.duration && typeof scene.duration !== 'number') {
      errors.push(`Scene ${index}: duration must be a number`);
    }

    if (scene.duration && scene.duration <= 0) {
      errors.push(`Scene ${index}: duration must be > 0`);
    }

    // Validate component
    if (scene.component && typeof scene.component !== 'function') {
      errors.push(`Scene ${index}: component must be a React component`);
    }

    // Warnings
    if (!scene.title) {
      warnings.push(`Scene ${index}: no title provided`);
    }

    if (scene.interactiveElements && !Array.isArray(scene.interactiveElements)) {
      errors.push(`Scene ${index}: interactiveElements must be an array`);
    }

    return { errors, warnings };
  }

  static validateEpisode(episode) {
    const allErrors = [];
    const allWarnings = [];

    try {
      // Validate metadata
      const metadata = episode.getMetadata();
      const metadataValidation = this.validateMetadata(metadata);
      allErrors.push(...metadataValidation.errors);
      allWarnings.push(...metadataValidation.warnings);

      // Validate scenes
      const scenes = episode.getScenes();
      if (!Array.isArray(scenes)) {
        allErrors.push('getScenes() must return an array');
      } else if (scenes.length === 0) {
        allErrors.push('Episode must have at least one scene');
      } else {
        scenes.forEach((scene, index) => {
          const sceneValidation = this.validateScene(scene, index);
          allErrors.push(...sceneValidation.errors);
          allWarnings.push(...sceneValidation.warnings);
        });

        // Check for duplicate scene IDs
        const sceneIds = scenes.map(s => s.id);
        const duplicates = sceneIds.filter((id, index) => sceneIds.indexOf(id) !== index);
        if (duplicates.length > 0) {
          allErrors.push(`Duplicate scene IDs found: ${duplicates.join(', ')}`);
        }
      }

      // Validate interactive elements
      const interactiveElements = episode.getInteractiveElements();
      if (!Array.isArray(interactiveElements)) {
        allErrors.push('getInteractiveElements() must return an array');
      } else {
        interactiveElements.forEach((element, index) => {
          if (!element.id) {
            allErrors.push(`Interactive element ${index}: missing 'id'`);
          }
          if (!element.sceneId) {
            allErrors.push(`Interactive element ${index}: missing 'sceneId'`);
          }
          if (element.timestamp === undefined) {
            allErrors.push(`Interactive element ${index}: missing 'timestamp'`);
          }
          if (!element.component) {
            allErrors.push(`Interactive element ${index}: missing 'component'`);
          }
        });
      }

      // Validate resources
      const resources = episode.getResourceRequirements();
      if (resources) {
        if (typeof resources !== 'object') {
          allErrors.push('getResourceRequirements() must return an object');
        }
      }

    } catch (error) {
      allErrors.push(`Validation failed: ${error.message}`);
    }

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }

  static createErrorBoundary() {
    return class EpisodeErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }

      static getDerivedStateFromError(error) {
        return { hasError: true, error };
      }

      componentDidCatch(error, errorInfo) {
        console.error('Episode Error:', error, errorInfo);
      }

      render() {
        if (this.state.hasError) {
          return (
            <div className="error-boundary p-8 bg-red-900/20 border border-red-500 rounded-lg">
              <h2 className="text-2xl font-bold text-red-500 mb-4">
                Episode Error
              </h2>
              <p className="text-white mb-2">
                An error occurred while loading this episode:
              </p>
              <pre className="text-sm text-red-300 bg-black/50 p-4 rounded">
                {this.state.error?.toString()}
              </pre>
            </div>
          );
        }

        return this.props.children;
      }
    };
  }
}

export default EpisodeValidator;