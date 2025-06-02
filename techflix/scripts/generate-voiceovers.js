import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Microsoft Edge TTS voices
const VOICES = {
  narrator: 'en-US-JennyNeural', // Main narrator - professional female
  alternateNarrator: 'en-US-GuyNeural', // Alternative male narrator
  technical: 'en-US-AriaNeural', // For technical explanations
  dramatic: 'en-US-ChristopherNeural' // For dramatic moments
};

// Voice-over scripts for each scene
const VOICEOVER_SCRIPTS = {
  // Season 1, Episode 1: Breaking the Partition Barrier
  's1e1': {
    'problem-viz': {
      voice: VOICES.narrator,
      script: `In traditional Kafka consumer groups, there's a fundamental limitation that has constrained scalability for years. Each partition can only be consumed by one consumer at a time. This creates a bottleneck that Share Groups are designed to eliminate.`,
      duration: 15
    },
    'bottleneck-demo': {
      voice: VOICES.technical,
      script: `Watch closely as messages flow through the system. Notice how consumer one processes partition zero exclusively, while consumer two handles partition one. No matter how many consumers we add, we can't exceed the partition count. This is the partition barrier in action.`,
      duration: 18
    },
    'share-group-arch': {
      voice: VOICES.narrator,
      script: `Enter Kafka Share Groups - a revolutionary approach that breaks free from partition constraints. Multiple consumers can now process messages from the same partition concurrently, with intelligent acknowledgment tracking ensuring no message is lost or duplicated.`,
      duration: 16
    },
    'impact-metrics': {
      voice: VOICES.dramatic,
      script: `The impact is transformative. Throughput increases linearly with consumer count. Latency drops dramatically. And resource utilization reaches new heights. This isn't just an improvement - it's a paradigm shift in stream processing.`,
      duration: 15
    }
  },

  // Season 1, Episode 2: Performance Metrics Deep Dive
  's1e2': {
    'cinematic-opening': {
      voice: VOICES.dramatic,
      script: `In the world of distributed systems, metrics are your eyes and ears. They tell the story of your system's health, performance, and potential problems before they become critical. Today, we dive deep into the metrics that matter most.`,
      duration: 16
    },
    'critical-metrics': {
      voice: VOICES.technical,
      script: `Three metrics rule them all: throughput, latency, and error rate. Throughput measures your system's capacity. Latency reveals user experience. Error rate exposes reliability. Master these, and you master observability.`,
      duration: 15
    },
    'metrics-demo': {
      voice: VOICES.narrator,
      script: `Let's see these metrics in action. As load increases, watch how throughput climbs until it plateaus - that's your system's limit. Meanwhile, latency creeps up exponentially. This relationship is fundamental to capacity planning.`,
      duration: 17
    },
    'evolution-timeline': {
      voice: VOICES.narrator,
      script: `From simple counters to distributed tracing, metrics have evolved dramatically. Each generation brought new insights: aggregation, percentiles, histograms, and now, real-time streaming analytics. The future of observability is here.`,
      duration: 16
    }
  },

  // Season 2, Episode 1: Kafka Share Groups
  's2e1': {
    'evolution': {
      voice: VOICES.dramatic,
      script: `Kafka 4.0 changes everything. Share Groups represent the biggest evolution in Kafka's consumption model since its inception. Today, we explore how this feature revolutionizes stream processing at scale.`,
      duration: 14
    },
    'bottleneck': {
      voice: VOICES.technical,
      script: `The partition barrier has limited Kafka scalability for years. Watch closely: no matter how many consumers you add, throughput remains constrained by partition count. This fundamental limitation is what Share Groups eliminate.`,
      duration: 16
    },
    'share-groups': {
      voice: VOICES.narrator,
      script: `Share Groups break free from partition constraints. Multiple consumers can now process from the same partition concurrently. With intelligent acknowledgment tracking, every message is processed exactly once, achieving unprecedented scalability.`,
      duration: 16
    },
    'impact': {
      voice: VOICES.dramatic,
      script: `The transformation is profound. Throughput scales linearly with consumer count. Latency drops by orders of magnitude. Resource utilization soars. This isn't just an improvement - it's a paradigm shift in distributed streaming.`,
      duration: 17
    }
  },

  // Season 3, Episode 3: Series Finale
  's3e3': {
    'recap': {
      voice: VOICES.narrator,
      script: `From breaking the partition barrier to implementing comprehensive observability, you've mastered the evolution of modern streaming systems. Your journey through Kafka, monitoring, and distributed systems has prepared you for any challenge.`,
      duration: 16
    },
    'call-to-action': {
      voice: VOICES.dramatic,
      script: `The knowledge you've gained is powerful. Now it's time to apply it. Build systems that scale. Create observability that illuminates. Push the boundaries of what's possible. The future of streaming technology is in your hands.`,
      duration: 16
    }
  }
};

// Generate voice-over using edge-tts
async function generateVoiceOver(text, voice, outputPath) {
  return new Promise((resolve, reject) => {
    const command = `edge-tts --voice "${voice}" --text "${text}" --write-media "${outputPath}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error generating ${outputPath}:`, error);
        reject(error);
      } else {
        console.log(`✅ Generated: ${outputPath}`);
        resolve(outputPath);
      }
    });
  });
}

// Ensure directory exists
async function ensureDir(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// Generate all voice-overs
async function generateAllVoiceOvers() {
  console.log('🎙️ Starting voice-over generation with Microsoft Edge TTS...\n');
  
  const audioDir = path.join(__dirname, '..', 'public', 'audio', 'voiceovers');
  await ensureDir(audioDir);
  
  let totalGenerated = 0;
  let totalDuration = 0;
  
  for (const [episodeId, scenes] of Object.entries(VOICEOVER_SCRIPTS)) {
    console.log(`\n📺 Episode ${episodeId.toUpperCase()}:`);
    
    const episodeDir = path.join(audioDir, episodeId);
    await ensureDir(episodeDir);
    
    for (const [sceneId, voData] of Object.entries(scenes)) {
      const filename = `${sceneId}.mp3`;
      const outputPath = path.join(episodeDir, filename);
      
      try {
        await generateVoiceOver(voData.script, voData.voice, outputPath);
        totalGenerated++;
        totalDuration += voData.duration;
        
        // Generate metadata file
        const metadataPath = path.join(episodeDir, `${sceneId}.json`);
        await fs.writeFile(metadataPath, JSON.stringify({
          voice: voData.voice,
          duration: voData.duration,
          wordCount: voData.script.split(' ').length,
          generated: new Date().toISOString()
        }, null, 2));
        
      } catch (error) {
        console.error(`❌ Failed to generate ${sceneId}:`, error.message);
      }
    }
  }
  
  // Generate index file
  const indexPath = path.join(audioDir, 'index.json');
  await fs.writeFile(indexPath, JSON.stringify({
    episodes: Object.keys(VOICEOVER_SCRIPTS),
    totalScenes: totalGenerated,
    totalDuration: totalDuration,
    generated: new Date().toISOString(),
    voices: VOICES
  }, null, 2));
  
  console.log(`\n✨ Voice-over generation complete!`);
  console.log(`📊 Generated ${totalGenerated} voice-overs`);
  console.log(`⏱️ Total duration: ${totalDuration} seconds (${Math.round(totalDuration / 60)} minutes)`);
  console.log(`📁 Output directory: ${audioDir}`);
}

// Check if edge-tts is installed
async function checkDependencies() {
  return new Promise((resolve) => {
    exec('edge-tts --help', (error) => {
      if (error) {
        console.error('❌ edge-tts is not installed!');
        console.log('\nTo install edge-tts, run:');
        console.log('  pip install edge-tts');
        console.log('\nOr if you prefer using pipx:');
        console.log('  pipx install edge-tts');
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

// Main execution
async function main() {
  const isInstalled = await checkDependencies();
  
  if (!isInstalled) {
    process.exit(1);
  }
  
  try {
    await generateAllVoiceOvers();
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}