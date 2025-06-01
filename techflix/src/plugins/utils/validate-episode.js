#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

class EpisodeValidator {
  constructor(episodePath) {
    this.episodePath = episodePath;
    this.errors = [];
    this.warnings = [];
    this.info = [];
    this.manifest = null;
    this.episodeModule = null;
  }

  log(message, type = 'info') {
    const prefix = {
      error: `${colors.red}❌ ERROR:${colors.reset}`,
      warning: `${colors.yellow}⚠️  WARNING:${colors.reset}`,
      success: `${colors.green}✅ SUCCESS:${colors.reset}`,
      info: `${colors.cyan}ℹ️  INFO:${colors.reset}`
    };
    console.log(`${prefix[type]} ${message}`);
  }

  async validate() {
    this.log(`Validating episode at: ${this.episodePath}`, 'info');
    console.log('-'.repeat(60));

    // Check directory structure
    if (!this.checkDirectoryStructure()) return false;

    // Validate manifest
    if (!this.validateManifest()) return false;

    // Validate episode class
    if (!await this.validateEpisodeClass()) return false;

    // Validate scenes
    if (!await this.validateScenes()) return false;

    // Validate assets
    this.validateAssets();

    // Check for common issues
    this.checkCommonIssues();

    // Print summary
    this.printSummary();

    return this.errors.length === 0;
  }

  checkDirectoryStructure() {
    this.log('Checking directory structure...', 'info');

    if (!fs.existsSync(this.episodePath)) {
      this.errors.push(`Episode directory not found: ${this.episodePath}`);
      return false;
    }

    const requiredFiles = ['manifest.json', 'index.js'];
    const requiredDirs = ['scenes'];
    const recommendedFiles = ['README.md'];
    const recommendedDirs = ['assets'];

    // Check required files
    for (const file of requiredFiles) {
      const filePath = path.join(this.episodePath, file);
      if (!fs.existsSync(filePath)) {
        this.errors.push(`Required file missing: ${file}`);
      } else {
        this.log(`Found required file: ${file}`, 'success');
      }
    }

    // Check required directories
    for (const dir of requiredDirs) {
      const dirPath = path.join(this.episodePath, dir);
      if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
        this.errors.push(`Required directory missing: ${dir}`);
      } else {
        this.log(`Found required directory: ${dir}`, 'success');
      }
    }

    // Check recommended files
    for (const file of recommendedFiles) {
      const filePath = path.join(this.episodePath, file);
      if (!fs.existsSync(filePath)) {
        this.warnings.push(`Recommended file missing: ${file}`);
      }
    }

    // Check recommended directories
    for (const dir of recommendedDirs) {
      const dirPath = path.join(this.episodePath, dir);
      if (!fs.existsSync(dirPath)) {
        this.warnings.push(`Recommended directory missing: ${dir}`);
      }
    }

    return this.errors.length === 0;
  }

  validateManifest() {
    this.log('Validating manifest.json...', 'info');

    const manifestPath = path.join(this.episodePath, 'manifest.json');
    
    try {
      const manifestContent = fs.readFileSync(manifestPath, 'utf8');
      this.manifest = JSON.parse(manifestContent);
    } catch (error) {
      this.errors.push(`Invalid manifest.json: ${error.message}`);
      return false;
    }

    // Check required fields
    const requiredFields = [
      'version', 'name', 'displayName', 'description', 
      'author', 'episodeClass', 'seasonNumber', 'episodeNumber'
    ];

    for (const field of requiredFields) {
      if (!this.manifest[field]) {
        this.errors.push(`Manifest missing required field: ${field}`);
      }
    }

    // Validate field values
    if (this.manifest.version !== '1.0.0') {
      this.errors.push(`Invalid version: ${this.manifest.version} (must be 1.0.0)`);
    }

    if (this.manifest.name && !/^[a-z0-9-]+$/.test(this.manifest.name)) {
      this.errors.push(`Invalid episode name: ${this.manifest.name} (must be lowercase kebab-case)`);
    }

    if (this.manifest.episodeClass !== './index.js') {
      this.errors.push(`Invalid episodeClass: ${this.manifest.episodeClass} (must be ./index.js)`);
    }

    if (typeof this.manifest.seasonNumber !== 'number' || this.manifest.seasonNumber < 1) {
      this.errors.push(`Invalid seasonNumber: ${this.manifest.seasonNumber} (must be positive integer)`);
    }

    if (typeof this.manifest.episodeNumber !== 'number' || this.manifest.episodeNumber < 1) {
      this.errors.push(`Invalid episodeNumber: ${this.manifest.episodeNumber} (must be positive integer)`);
    }

    // Check optional fields
    if (this.manifest.dependencies && !Array.isArray(this.manifest.dependencies)) {
      this.errors.push('Dependencies must be an array');
    }

    if (this.manifest.assets) {
      if (this.manifest.assets.thumbnails && !Array.isArray(this.manifest.assets.thumbnails)) {
        this.errors.push('assets.thumbnails must be an array');
      }
      if (this.manifest.assets.images && !Array.isArray(this.manifest.assets.images)) {
        this.errors.push('assets.images must be an array');
      }
      if (this.manifest.assets.videos && !Array.isArray(this.manifest.assets.videos)) {
        this.errors.push('assets.videos must be an array');
      }
    }

    if (this.errors.length === 0) {
      this.log('Manifest validation passed', 'success');
    }

    return true; // Continue even with errors to find more issues
  }

  async validateEpisodeClass() {
    this.log('Validating episode class...', 'info');

    const indexPath = path.join(this.episodePath, 'index.js');
    
    try {
      // Dynamic import of the episode module
      const modulePath = `file://${indexPath}`;
      const module = await import(modulePath);
      
      if (!module.default) {
        this.errors.push('Episode class must be exported as default');
        return false;
      }

      const EpisodeClass = module.default;
      
      // Try to instantiate
      try {
        this.episodeModule = new EpisodeClass();
      } catch (error) {
        this.errors.push(`Failed to instantiate episode class: ${error.message}`);
        return false;
      }

      // Check required methods
      const requiredMethods = ['getMetadata', 'getScenes'];
      for (const method of requiredMethods) {
        if (typeof this.episodeModule[method] !== 'function') {
          this.errors.push(`Episode class missing required method: ${method}()`);
        }
      }

      // Validate metadata
      this.validateMetadata();

      // Validate scenes
      this.validateScenesData();

      // Check optional methods
      const optionalMethods = ['getInteractiveElements', 'getResourceRequirements'];
      for (const method of optionalMethods) {
        if (this.episodeModule[method] && typeof this.episodeModule[method] !== 'function') {
          this.warnings.push(`${method} should be a function`);
        }
      }

    } catch (error) {
      this.errors.push(`Failed to load episode class: ${error.message}`);
      return false;
    }

    return true;
  }

  validateMetadata() {
    try {
      const metadata = this.episodeModule.getMetadata();
      
      // Check required metadata fields
      const requiredFields = [
        'id', 'title', 'description', 'seasonNumber', 
        'episodeNumber', 'duration', 'level', 'tags'
      ];

      for (const field of requiredFields) {
        if (!metadata[field] && metadata[field] !== 0) {
          this.errors.push(`Metadata missing required field: ${field}`);
        }
      }

      // Validate metadata values
      if (metadata.id !== this.manifest.name) {
        this.errors.push(`Metadata ID (${metadata.id}) doesn't match manifest name (${this.manifest.name})`);
      }

      if (metadata.seasonNumber !== this.manifest.seasonNumber) {
        this.errors.push(`Metadata seasonNumber doesn't match manifest`);
      }

      if (metadata.episodeNumber !== this.manifest.episodeNumber) {
        this.errors.push(`Metadata episodeNumber doesn't match manifest`);
      }

      if (typeof metadata.duration !== 'number' || metadata.duration <= 0) {
        this.errors.push(`Invalid duration: ${metadata.duration} (must be positive number in seconds)`);
      }

      const validLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
      if (!validLevels.includes(metadata.level)) {
        this.errors.push(`Invalid level: ${metadata.level} (must be one of: ${validLevels.join(', ')})`);
      }

      if (!Array.isArray(metadata.tags) || metadata.tags.length === 0) {
        this.warnings.push('Episode should have at least one tag');
      }

      // Check optional fields
      if (metadata.releaseDate && !/^\d{4}-\d{2}-\d{2}$/.test(metadata.releaseDate)) {
        this.warnings.push('releaseDate should be in YYYY-MM-DD format');
      }

      if (metadata.prerequisites && !Array.isArray(metadata.prerequisites)) {
        this.errors.push('prerequisites must be an array');
      }

      if (metadata.learningOutcomes && !Array.isArray(metadata.learningOutcomes)) {
        this.errors.push('learningOutcomes must be an array');
      }

      this.info.push(`Episode duration: ${Math.floor(metadata.duration / 60)} minutes`);
      this.info.push(`Episode level: ${metadata.level}`);

    } catch (error) {
      this.errors.push(`Failed to validate metadata: ${error.message}`);
    }
  }

  validateScenesData() {
    try {
      const scenes = this.episodeModule.getScenes();
      
      if (!Array.isArray(scenes)) {
        this.errors.push('getScenes() must return an array');
        return;
      }

      if (scenes.length === 0) {
        this.errors.push('Episode must have at least one scene');
        return;
      }

      const sceneIds = new Set();
      let totalDuration = 0;

      scenes.forEach((scene, index) => {
        // Check required scene fields
        if (!scene.id) {
          this.errors.push(`Scene ${index} missing required field: id`);
        } else if (sceneIds.has(scene.id)) {
          this.errors.push(`Duplicate scene ID: ${scene.id}`);
        } else {
          sceneIds.add(scene.id);
        }

        if (!scene.type) {
          this.errors.push(`Scene ${scene.id || index} missing required field: type`);
        }

        if (!scene.component) {
          this.errors.push(`Scene ${scene.id || index} missing required field: component`);
        } else if (typeof scene.component !== 'function') {
          this.errors.push(`Scene ${scene.id || index} component must be a React component (function)`);
        }

        if (typeof scene.duration !== 'number' || scene.duration <= 0) {
          this.errors.push(`Scene ${scene.id || index} has invalid duration`);
        } else {
          totalDuration += scene.duration;
        }

        // Check optional fields
        if (!scene.title) {
          this.warnings.push(`Scene ${scene.id || index} has no title`);
        }

        if (scene.interactiveElements && !Array.isArray(scene.interactiveElements)) {
          this.errors.push(`Scene ${scene.id || index} interactiveElements must be an array`);
        }
      });

      // Check if total duration matches metadata
      const metadata = this.episodeModule.getMetadata();
      if (Math.abs(totalDuration - metadata.duration) > 1) {
        this.warnings.push(
          `Scene durations (${totalDuration}s) don't match episode duration (${metadata.duration}s)`
        );
      }

      this.info.push(`Total scenes: ${scenes.length}`);
      this.info.push(`Scene IDs: ${Array.from(sceneIds).join(', ')}`);

      // Validate interactive elements if present
      if (this.episodeModule.getInteractiveElements) {
        const interactiveElements = this.episodeModule.getInteractiveElements();
        
        if (!Array.isArray(interactiveElements)) {
          this.errors.push('getInteractiveElements() must return an array');
        } else {
          interactiveElements.forEach((element, index) => {
            if (!element.id) {
              this.errors.push(`Interactive element ${index} missing id`);
            }
            if (!element.sceneId) {
              this.errors.push(`Interactive element ${element.id || index} missing sceneId`);
            } else if (!sceneIds.has(element.sceneId)) {
              this.errors.push(`Interactive element ${element.id || index} references non-existent scene: ${element.sceneId}`);
            }
            if (typeof element.timestamp !== 'number') {
              this.errors.push(`Interactive element ${element.id || index} missing timestamp`);
            }
            if (!element.component || typeof element.component !== 'function') {
              this.errors.push(`Interactive element ${element.id || index} missing valid component`);
            }
          });
        }
      }

    } catch (error) {
      this.errors.push(`Failed to validate scenes: ${error.message}`);
    }
  }

  async validateScenes() {
    this.log('Validating scene components...', 'info');

    const scenesDir = path.join(this.episodePath, 'scenes');
    
    if (!fs.existsSync(scenesDir)) {
      return true; // Already reported in structure check
    }

    const sceneFiles = fs.readdirSync(scenesDir)
      .filter(file => file.endsWith('.jsx') || file.endsWith('.js'));

    if (sceneFiles.length === 0) {
      this.warnings.push('No scene files found in scenes directory');
    } else {
      this.info.push(`Found ${sceneFiles.length} scene files`);
      
      // Check if each scene file exports a valid component
      for (const file of sceneFiles) {
        const filePath = path.join(scenesDir, file);
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Basic checks
          if (!content.includes('export default')) {
            this.warnings.push(`Scene ${file} may not have a default export`);
          }
          
          if (!content.includes('({ time, duration })')) {
            this.warnings.push(`Scene ${file} may not accept required props (time, duration)`);
          }
          
        } catch (error) {
          this.warnings.push(`Could not validate scene file ${file}: ${error.message}`);
        }
      }
    }

    return true;
  }

  validateAssets() {
    this.log('Validating assets...', 'info');

    if (this.manifest.assets) {
      const assetsDir = path.join(this.episodePath, 'assets');
      
      // Check thumbnails
      if (this.manifest.assets.thumbnails) {
        for (const thumbnail of this.manifest.assets.thumbnails) {
          const assetPath = path.join(this.episodePath, thumbnail);
          if (!fs.existsSync(assetPath)) {
            this.warnings.push(`Declared thumbnail not found: ${thumbnail}`);
          } else {
            this.log(`Found thumbnail: ${thumbnail}`, 'success');
          }
        }
      }

      // Check images
      if (this.manifest.assets.images) {
        for (const image of this.manifest.assets.images) {
          const assetPath = path.join(this.episodePath, image);
          if (!fs.existsSync(assetPath)) {
            this.warnings.push(`Declared image not found: ${image}`);
          }
        }
      }

      // Check videos
      if (this.manifest.assets.videos) {
        for (const video of this.manifest.assets.videos) {
          const assetPath = path.join(this.episodePath, video);
          if (!fs.existsSync(assetPath)) {
            this.warnings.push(`Declared video not found: ${video}`);
          }
        }
      }
    }

    // Check for common asset issues
    const assetsDir = path.join(this.episodePath, 'assets');
    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);
      
      // Check for large files
      for (const file of files) {
        const filePath = path.join(assetsDir, file);
        const stats = fs.statSync(filePath);
        if (stats.size > 10 * 1024 * 1024) { // 10MB
          this.warnings.push(`Large asset file (${(stats.size / 1024 / 1024).toFixed(1)}MB): ${file}`);
        }
      }
    }
  }

  checkCommonIssues() {
    this.log('Checking for common issues...', 'info');

    // Check for absolute paths
    const indexPath = path.join(this.episodePath, 'index.js');
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf8');
      
      if (content.includes('C:\\') || content.includes('/Users/') || content.includes('/home/')) {
        this.warnings.push('Episode may contain absolute paths');
      }
      
      if (content.includes('localhost') || content.includes('127.0.0.1')) {
        this.warnings.push('Episode contains localhost references');
      }
      
      if (content.includes('console.log') || content.includes('console.error')) {
        this.warnings.push('Episode contains console statements');
      }
    }

    // Check README
    const readmePath = path.join(this.episodePath, 'README.md');
    if (fs.existsSync(readmePath)) {
      const content = fs.readFileSync(readmePath, 'utf8');
      if (content.length < 100) {
        this.warnings.push('README.md is very short - consider adding more documentation');
      }
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('VALIDATION SUMMARY');
    console.log('='.repeat(60));

    if (this.info.length > 0) {
      console.log(`\n${colors.cyan}Episode Information:${colors.reset}`);
      this.info.forEach(msg => console.log(`  • ${msg}`));
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log(`\n${colors.green}✅ Episode validation PASSED!${colors.reset}`);
      console.log('Your episode meets all requirements.');
    } else {
      if (this.errors.length > 0) {
        console.log(`\n${colors.red}Errors (${this.errors.length}):${colors.reset}`);
        this.errors.forEach(error => console.log(`  ❌ ${error}`));
      }

      if (this.warnings.length > 0) {
        console.log(`\n${colors.yellow}Warnings (${this.warnings.length}):${colors.reset}`);
        this.warnings.forEach(warning => console.log(`  ⚠️  ${warning}`));
      }

      console.log(`\n${colors.red}❌ Episode validation FAILED${colors.reset}`);
      console.log(`Found ${this.errors.length} errors and ${this.warnings.length} warnings.`);
    }

    console.log('\n' + '='.repeat(60));
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
${colors.blue}TechFlix Episode Validator${colors.reset}

Usage: node validate-episode.js <episode-path>

Example:
  node validate-episode.js ./src/plugins/episodes/my-episode
  node validate-episode.js ../episodes/kafka-basics

Options:
  --help    Show this help message
`);
    process.exit(0);
  }

  const episodePath = path.resolve(args[0]);
  const validator = new EpisodeValidator(episodePath);
  
  try {
    const isValid = await validator.validate();
    process.exit(isValid ? 0 : 1);
  } catch (error) {
    console.error(`${colors.red}Validation failed with error:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${__filename}`) {
  main();
}

export default EpisodeValidator;