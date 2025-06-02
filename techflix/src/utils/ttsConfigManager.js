/**
 * TTS Configuration Manager
 * Handles saving, loading, and exporting TTS configurations
 */

import logger from './logger';

class TTSConfigManager {
  constructor() {
    this.storageKey = 'techflix-tts-configs';
    this.presets = {
      'techflix-default': {
        name: 'TechFlix Default',
        description: 'Optimized voices for technical content',
        configs: [
          { provider: 'edge-tts', voice: 'en-US-JennyNeural', role: 'narrator' },
          { provider: 'edge-tts', voice: 'en-US-AriaNeural', role: 'technical' },
          { provider: 'edge-tts', voice: 'en-US-ChristopherNeural', role: 'dramatic' },
          { provider: 'edge-tts', voice: 'en-US-GuyNeural', role: 'alternate' }
        ]
      },
      'multilingual': {
        name: 'Multilingual',
        description: 'Voices for different languages',
        configs: [
          { provider: 'edge-tts', voice: 'en-US-JennyNeural', role: 'english' },
          { provider: 'gtts', voice: 'es', role: 'spanish' },
          { provider: 'gtts', voice: 'fr', role: 'french' },
          { provider: 'gtts', voice: 'de', role: 'german' }
        ]
      },
      'premium-quality': {
        name: 'Premium Quality',
        description: 'Best quality voices (requires API keys)',
        configs: [
          { provider: 'elevenlabs', voice: 'rachel', role: 'narrator' },
          { provider: 'amazon-polly', voice: 'Joanna', role: 'technical' },
          { provider: 'elevenlabs', voice: 'clyde', role: 'dramatic' },
          { provider: 'amazon-polly', voice: 'Matthew', role: 'alternate' }
        ]
      },
      'offline-only': {
        name: 'Offline Only',
        description: 'Works without internet',
        configs: [
          { provider: 'pyttsx3', voice: 'system_default', role: 'narrator' },
          { provider: 'coqui-tts', voice: 'tts_models/en/ljspeech/tacotron2-DDC', role: 'technical' },
          { provider: 'pyttsx3', voice: 'system_male', role: 'dramatic' },
          { provider: 'pyttsx3', voice: 'system_female', role: 'alternate' }
        ]
      }
    };
  }

  /**
   * Save a custom configuration
   */
  saveConfig(name, description, configs) {
    try {
      const savedConfigs = this.getAllConfigs();
      savedConfigs[name] = {
        name,
        description,
        configs,
        created: new Date().toISOString(),
        isCustom: true
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(savedConfigs));
      logger.info('TTS config saved', { name, configCount: configs.length });
      
      return { success: true };
    } catch (error) {
      logger.error('Failed to save TTS config', { error });
      return { success: false, error: error.message };
    }
  }

  /**
   * Load all configurations (presets + custom)
   */
  getAllConfigs() {
    try {
      const savedStr = localStorage.getItem(this.storageKey);
      const savedConfigs = savedStr ? JSON.parse(savedStr) : {};
      
      // Merge with presets
      return {
        ...this.presets,
        ...savedConfigs
      };
    } catch (error) {
      logger.error('Failed to load TTS configs', { error });
      return this.presets;
    }
  }

  /**
   * Get a specific configuration
   */
  getConfig(name) {
    const configs = this.getAllConfigs();
    return configs[name] || null;
  }

  /**
   * Delete a custom configuration
   */
  deleteConfig(name) {
    try {
      const savedConfigs = this.getAllConfigs();
      
      // Can't delete presets
      if (this.presets[name]) {
        return { success: false, error: 'Cannot delete preset configurations' };
      }
      
      delete savedConfigs[name];
      
      // Remove presets before saving
      Object.keys(this.presets).forEach(key => delete savedConfigs[key]);
      
      localStorage.setItem(this.storageKey, JSON.stringify(savedConfigs));
      logger.info('TTS config deleted', { name });
      
      return { success: true };
    } catch (error) {
      logger.error('Failed to delete TTS config', { error });
      return { success: false, error: error.message };
    }
  }

  /**
   * Export configuration as JSON
   */
  exportConfig(name) {
    const config = this.getConfig(name);
    if (!config) {
      return null;
    }

    const exportData = {
      version: '1.0',
      exported: new Date().toISOString(),
      source: 'TechFlix TTS Lab',
      config: {
        name: config.name,
        description: config.description,
        configs: config.configs
      }
    };

    return {
      data: exportData,
      filename: `tts-config-${name.toLowerCase().replace(/\s+/g, '-')}.json`
    };
  }

  /**
   * Import configuration from JSON
   */
  importConfig(jsonData) {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      if (!data.version || !data.config) {
        throw new Error('Invalid configuration format');
      }

      const { name, description, configs } = data.config;
      
      if (!name || !configs || !Array.isArray(configs)) {
        throw new Error('Missing required fields');
      }

      // Add import timestamp
      const importedName = `${name} (Imported)`;
      
      return this.saveConfig(importedName, description, configs);
    } catch (error) {
      logger.error('Failed to import TTS config', { error });
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate voice-over script with configuration
   */
  generateScriptWithConfig(configName, episodes) {
    const config = this.getConfig(configName);
    if (!config) {
      return null;
    }

    const voiceMapping = {};
    config.configs.forEach(c => {
      voiceMapping[c.role] = {
        provider: c.provider,
        voice: c.voice
      };
    });

    // Generate script structure
    const script = {
      configuration: configName,
      voiceMapping,
      episodes: {}
    };

    // Map episodes to voices based on roles
    Object.entries(episodes).forEach(([episodeId, scenes]) => {
      script.episodes[episodeId] = {};
      
      Object.entries(scenes).forEach(([sceneId, sceneData]) => {
        const role = sceneData.role || 'narrator';
        const voiceConfig = voiceMapping[role] || voiceMapping.narrator;
        
        script.episodes[episodeId][sceneId] = {
          text: sceneData.text,
          ...voiceConfig,
          role
        };
      });
    });

    return script;
  }

  /**
   * Test configuration availability
   */
  async testConfig(configName) {
    const config = this.getConfig(configName);
    if (!config) {
      return { success: false, error: 'Configuration not found' };
    }

    const results = [];
    
    for (const voiceConfig of config.configs) {
      const result = {
        role: voiceConfig.role,
        provider: voiceConfig.provider,
        voice: voiceConfig.voice,
        available: false,
        error: null
      };

      // Check provider availability
      switch (voiceConfig.provider) {
        case 'edge-tts':
          // Frontend code should not execute shell commands
          // This should be handled by a backend API with proper validation
          result.error = 'TTS testing requires backend API';
          result.available = false;
          break;

        case 'gtts':
          // Frontend code should not execute shell commands
          // This should be handled by a backend API with proper validation
          result.error = 'TTS testing requires backend API';
          result.available = false;
          break;

        case 'pyttsx3':
          // Frontend code should not execute shell commands
          // This should be handled by a backend API with proper validation
          result.error = 'TTS testing requires backend API';
          result.available = false;
          break;

        case 'amazon-polly':
          result.error = 'Requires AWS credentials';
          break;

        case 'elevenlabs':
          result.error = 'Requires API key';
          break;

        case 'coqui-tts':
          result.error = 'Requires model download';
          break;

        default:
          result.error = 'Unknown provider';
      }

      results.push(result);
    }

    const allAvailable = results.every(r => r.available);
    
    return {
      success: allAvailable,
      results,
      summary: {
        total: results.length,
        available: results.filter(r => r.available).length,
        unavailable: results.filter(r => !r.available).length
      }
    };
  }
}

// Create singleton instance
const ttsConfigManager = new TTSConfigManager();

export default ttsConfigManager;