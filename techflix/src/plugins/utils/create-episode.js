#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import readline from 'readline';
import EpisodeCreator from './EpisodeCreator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createEpisode() {
  console.log('\n🎬 TechFlix Episode Creator\n');

  try {
    // Gather episode information
    const config = {
      id: await question('Episode ID (e.g., "kubernetes-basics"): '),
      className: '',
      title: await question('Episode Title: '),
      description: await question('Episode Description: '),
      seasonNumber: parseInt(await question('Season Number: ')),
      episodeNumber: parseInt(await question('Episode Number: ')),
      duration: parseInt(await question('Duration (in seconds): ')),
      level: await question('Level (Beginner/Intermediate/Advanced/Expert): '),
      tags: (await question('Tags (comma-separated): ')).split(',').map(t => t.trim()),
      author: await question('Author (default: TechFlix Team): ') || 'TechFlix Team'
    };

    // Generate className from ID
    config.className = config.id
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('') + 'Episode';

    // Generate episode structure
    const structure = EpisodeCreator.generateEpisodeStructure(config);

    // Create directories and files
    const baseDir = path.join(process.cwd(), structure.directory);
    
    // Create directories
    fs.mkdirSync(baseDir, { recursive: true });
    fs.mkdirSync(path.join(baseDir, 'scenes'), { recursive: true });
    fs.mkdirSync(path.join(baseDir, 'assets'), { recursive: true });

    // Write files
    for (const file of structure.files) {
      const filePath = path.join(baseDir, file.path);
      const fileDir = path.dirname(filePath);
      
      // Ensure directory exists
      fs.mkdirSync(fileDir, { recursive: true });
      
      // Write file
      fs.writeFileSync(filePath, file.content);
      console.log(`✅ Created: ${file.path}`);
    }

    // Update registry
    const registryPath = path.join(process.cwd(), 'src/plugins/episodes/registry.json');
    if (fs.existsSync(registryPath)) {
      const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
      
      // Add new episode to registry
      registry.episodes.push({
        id: config.id,
        path: `/src/plugins/episodes/${config.id}`,
        enabled: true,
        category: 'uncategorized'
      });

      fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
      console.log('✅ Updated episode registry');
    }

    console.log(`\n🎉 Episode "${config.title}" created successfully!`);
    console.log(`📁 Location: ${structure.directory}`);
    console.log('\nNext steps:');
    console.log('1. Add your scene components to the scenes/ directory');
    console.log('2. Update the episode class with your scenes');
    console.log('3. Add any assets to the assets/ directory');
    console.log('4. Test your episode in the app\n');

  } catch (error) {
    console.error('❌ Error creating episode:', error.message);
  } finally {
    rl.close();
  }
}

// Run the creator
createEpisode();