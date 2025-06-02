#!/usr/bin/env node

/**
 * Alternative voice-over generation script using Google Text-to-Speech (gTTS)
 * Free alternative to Microsoft Edge TTS
 */

const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Voice configuration for gTTS
const VOICES = {
  narrator: { lang: 'en', slow: false, tld: 'com' },
  alternateNarrator: { lang: 'en', slow: false, tld: 'co.uk' },
  technical: { lang: 'en', slow: true, tld: 'com' },
  dramatic: { lang: 'en', slow: false, tld: 'com.au' }
};

// Episode scripts (same as original)
const SCRIPTS = {
  's1e1': {
    'problem-viz': {
      voice: 'narrator',
      text: `Traditional Kafka consumer groups face a fundamental limitation. 
             Each partition can only be processed by one consumer at a time. 
             This creates bottlenecks that limit your scaling potential.`
    },
    'bottleneck-demo': {
      voice: 'technical',
      text: `Watch as messages queue up behind a single consumer. 
             Even with multiple consumers in the group, each partition remains locked to one processor. 
             This is the partition barrier that Share Groups eliminate.`
    },
    'share-group-arch': {
      voice: 'narrator',
      text: `Share Groups revolutionize consumption by allowing multiple consumers to process the same partition simultaneously. 
             Messages are dynamically distributed, breaking free from partition constraints.`
    },
    'impact-metrics': {
      voice: 'dramatic',
      text: `The results speak for themselves. 
             Ten times the throughput. Dramatically reduced latency. 
             True horizontal scaling without partition limits.`
    }
  },
  's1e2': {
    'opening': {
      voice: 'narrator',
      text: `In our previous episode, we discovered how Share Groups shatter traditional Kafka limitations. 
             Now, let's explore the critical metrics that reveal their true power in production.`
    },
    'critical-metrics': {
      voice: 'technical',
      text: `Two metrics define Share Groups health: Records Unacked and Oldest Unacked Message Age. 
             These indicators expose processing bottlenecks that traditional lag metrics completely miss.`
    },
    'evolution': {
      voice: 'narrator',
      text: `The evolution from partition ownership to dynamic message distribution requires new monitoring paradigms. 
             Traditional consumer lag becomes meaningless when messages flow freely between consumers.`
    },
    'impact': {
      voice: 'dramatic',
      text: `Master these metrics, and you unlock the full potential of Share Groups. 
             Ignore them, and you're flying blind in a new architectural paradigm.`
    }
  },
  's2e1': {
    'evolution': {
      voice: 'narrator',
      text: `Kafka's architecture has evolved from rigid partition ownership to dynamic message distribution. 
             This fundamental shift demands equally revolutionary monitoring approaches.`
    },
    'bottleneck': {
      voice: 'technical',
      text: `When Records Unacked climbs, your consumers are struggling. 
             Unlike traditional lag, this metric directly measures processing pressure across your entire Share Group.`
    },
    'share-groups': {
      voice: 'narrator',
      text: `Share Groups introduce a new paradigm where multiple consumers collaborate on the same partition. 
             This cooperation requires sophisticated coordination and new observability patterns.`
    },
    'impact': {
      voice: 'dramatic',
      text: `The impact is transformative. Teams report ten-fold throughput improvements and dramatically simplified scaling. 
             But only when they monitor the right metrics.`
    }
  },
  's3e3': {
    'recap': {
      voice: 'narrator',
      text: `Throughout this series, we've journeyed from Kafka's traditional limitations through Share Groups' revolutionary architecture 
             to the critical metrics that ensure production success.`
    },
    'call-to-action': {
      voice: 'dramatic',
      text: `The future of event streaming is here. Share Groups are not just an evolution; they're a revolution. 
             Armed with the right metrics and monitoring strategies, you're ready to lead this transformation.`
    }
  }
};

// Progress bar utility
function createProgressBar(current, total, label) {
  const width = 30;
  const percentage = current / total;
  const filled = Math.floor(width * percentage);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `${label}: [${bar}] ${current}/${total}`;
}

// Generate voice-over using gTTS
async function generateVoiceOver(text, outputPath, voiceType = 'narrator') {
  const voice = VOICES[voiceType];
  const tempFile = path.join(path.dirname(outputPath), 'temp_gtts.mp3');
  
  // Escape single quotes in text
  const escapedText = text.replace(/'/g, "\\'");
  
  // Create Python command for gTTS
  const pythonCommand = `python3 -c "
from gtts import gTTS
import sys

text = '''${escapedText}'''
tts = gTTS(text=text, lang='${voice.lang}', slow=${voice.slow ? 'True' : 'False'}, tld='${voice.tld}')
tts.save('${tempFile}')
"`;
  
  try {
    console.log(`  Generating with gTTS (${voiceType})...`);
    await execAsync(pythonCommand);
    
    // Move temp file to final location
    await fs.rename(tempFile, outputPath);
    
    // Get file info
    const stats = await fs.stat(outputPath);
    const duration = Math.round(text.split(' ').length / 2.5); // Rough estimate
    
    return {
      duration,
      size: stats.size,
      voice: voiceType
    };
  } catch (error) {
    console.error(`  ❌ Failed to generate: ${error.message}`);
    
    // Try to clean up temp file if it exists
    try {
      await fs.unlink(tempFile);
    } catch {}
    
    throw error;
  }
}

// Main generation function
async function generateAllVoiceOvers() {
  console.log('🎙️  TechFlix Voice-Over Generation (using gTTS)');
  console.log('='.repeat(50));
  
  // Check if gTTS is installed
  try {
    await execAsync('python3 -c "import gtts"');
  } catch (error) {
    console.error('\n❌ Error: gTTS is not installed!');
    console.log('\nPlease install gTTS first:');
    console.log('  pip install gtts');
    console.log('\nOr use pip3:');
    console.log('  pip3 install gtts');
    process.exit(1);
  }
  
  const outputBase = path.join(__dirname, '..', 'public', 'audio', 'voiceovers');
  
  // Ensure output directory exists
  await fs.mkdir(outputBase, { recursive: true });
  
  let totalGenerated = 0;
  let totalDuration = 0;
  const results = [];
  
  // Count total scripts
  const totalScripts = Object.values(SCRIPTS).reduce(
    (sum, episode) => sum + Object.keys(episode).length, 
    0
  );
  
  // Generate voice-overs for each episode
  for (const [episodeId, scenes] of Object.entries(SCRIPTS)) {
    console.log(`\n📺 Episode ${episodeId}`);
    const episodeDir = path.join(outputBase, episodeId);
    await fs.mkdir(episodeDir, { recursive: true });
    
    for (const [sceneId, sceneData] of Object.entries(scenes)) {
      const outputPath = path.join(episodeDir, `${sceneId}.mp3`);
      const metadataPath = path.join(episodeDir, `${sceneId}.json`);
      
      try {
        totalGenerated++;
        console.log(`\n  🎬 Scene: ${sceneId}`);
        console.log(`  ${createProgressBar(totalGenerated, totalScripts, 'Progress')}`);
        
        const result = await generateVoiceOver(
          sceneData.text,
          outputPath,
          sceneData.voice
        );
        
        // Save metadata
        const metadata = {
          voice: sceneData.voice,
          duration: result.duration,
          wordCount: sceneData.text.split(/\s+/).length,
          generated: new Date().toISOString(),
          generator: 'gTTS'
        };
        
        await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
        
        totalDuration += result.duration;
        results.push({
          episode: episodeId,
          scene: sceneId,
          ...result
        });
        
        console.log(`  ✅ Generated: ${result.duration}s, ${(result.size / 1024).toFixed(1)}KB`);
        
      } catch (error) {
        console.error(`  ❌ Failed to generate ${sceneId}: ${error.message}`);
      }
    }
  }
  
  // Create index file
  const indexPath = path.join(outputBase, 'index.json');
  const index = {
    episodes: Object.keys(SCRIPTS),
    totalScenes: totalGenerated,
    totalDuration,
    generated: new Date().toISOString(),
    generator: 'gTTS',
    voices: Object.keys(VOICES)
  };
  
  await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
  
  // Summary
  console.log(`\n${  '='.repeat(50)}`);
  console.log('✅ Voice-Over Generation Complete!\n');
  console.log(`📊 Summary:`);
  console.log(`  • Episodes: ${Object.keys(SCRIPTS).length}`);
  console.log(`  • Scenes: ${totalGenerated}`);
  console.log(`  • Total Duration: ~${totalDuration} seconds`);
  console.log(`  • Output: ${outputBase}`);
  console.log('\n💡 Note: Duration is estimated. gTTS doesn\'t provide exact duration.');
  console.log('   Consider using ffprobe or similar tools for accurate duration.\n');
}

// Run the script
if (require.main === module) {
  generateAllVoiceOvers().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { generateVoiceOver, SCRIPTS };