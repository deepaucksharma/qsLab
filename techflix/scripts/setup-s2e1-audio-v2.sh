#!/bin/bash

# Setup script for S2E1 audio assets - V2 with new paths
# This script generates voice-overs and sets up the directory structure

echo "🎬 TechFlix S2E1 Audio Setup V2"
echo "==============================="

# Check if edge-tts is installed
if ! python3 -c "import edge_tts" 2>/dev/null; then
    echo "❌ edge-tts not installed. Installing..."
    pip3 install edge-tts asyncio
else
    echo "✅ edge-tts is installed"
fi

# Create directories with new structure
echo "📁 Creating directory structure..."
mkdir -p public/audio/voiceovers/s2e1
mkdir -p public/audio/effects/s2e1
mkdir -p public/audio/system

# Generate voice-overs
echo "🎙️ Generating voice-overs..."
cd scripts
python3 generate-voiceovers-s2e1.py
cd ..

# Check if voice-overs were generated
if [ -f "public/audio/voiceovers/s2e1/metadata.json" ]; then
    echo "✅ Voice-overs generated successfully"
    VOCOUNT=$(ls -1 public/audio/voiceovers/s2e1/*.mp3 2>/dev/null | wc -l)
    echo "   Generated $VOCOUNT voice-over files"
else
    echo "❌ Voice-over generation failed"
    exit 1
fi

# Create sound effects library
echo "🔊 Setting up sound effects..."
cat > public/audio/effects/s2e1/sound-library.json << 'EOF'
{
  "episode": "s2e1",
  "title": "Kafka Share Groups Sound Effects Library",
  "effects": {
    "ambient": {
      "tech-atmosphere": {
        "file": "tech-atmosphere.wav",
        "description": "Subtle tech ambience with server hum",
        "duration": 60,
        "loop": true,
        "volume": 0.2
      },
      "data-flow": {
        "file": "data-flow.wav",
        "description": "Flowing data stream sound",
        "duration": 30,
        "loop": true,
        "volume": 0.3
      }
    },
    "transitions": {
      "scene-transition": {
        "file": "scene-transition.wav",
        "description": "Cinematic scene change",
        "duration": 2,
        "volume": 0.5
      },
      "timeline-whoosh": {
        "file": "timeline-whoosh.wav",
        "description": "Timeline movement sound",
        "duration": 1.5,
        "volume": 0.4
      },
      "reveal": {
        "file": "reveal.wav",
        "description": "Dramatic reveal sound",
        "duration": 1.8,
        "volume": 0.6
      }
    },
    "ui": {
      "partition-appear": {
        "file": "partition-appear.wav",
        "description": "Partition box appearing",
        "duration": 0.5,
        "volume": 0.4
      },
      "consumer-connect": {
        "file": "consumer-connect.wav",
        "description": "Consumer connecting to partition",
        "duration": 0.8,
        "volume": 0.5
      },
      "message-process": {
        "file": "message-process.wav",
        "description": "Message being processed",
        "duration": 0.3,
        "volume": 0.3
      },
      "error-buzz": {
        "file": "error-buzz.wav",
        "description": "Error or bottleneck sound",
        "duration": 1,
        "volume": 0.6
      },
      "success-chime": {
        "file": "success-chime.wav",
        "description": "Success or achievement",
        "duration": 1.2,
        "volume": 0.5
      }
    },
    "dramatic": {
      "crisis-alarm": {
        "file": "crisis-alarm.wav",
        "description": "LinkedIn crisis moment",
        "duration": 3,
        "volume": 0.7
      },
      "breakthrough": {
        "file": "breakthrough.wav",
        "description": "Share Groups revelation",
        "duration": 2.5,
        "volume": 0.8
      },
      "impact-boom": {
        "file": "impact-boom.wav",
        "description": "Dramatic impact sound",
        "duration": 1.5,
        "volume": 0.7
      }
    },
    "data": {
      "data-stream": {
        "file": "data-stream.wav",
        "description": "Continuous data streaming",
        "duration": 5,
        "loop": true,
        "volume": 0.25
      },
      "message-burst": {
        "file": "message-burst.wav",
        "description": "Burst of messages",
        "duration": 1,
        "volume": 0.4
      },
      "scaling-up": {
        "file": "scaling-up.wav",
        "description": "System scaling up",
        "duration": 2,
        "volume": 0.5
      },
      "scaling-down": {
        "file": "scaling-down.wav",
        "description": "System scaling down",
        "duration": 2,
        "volume": 0.5
      }
    },
    "metrics": {
      "counter-tick": {
        "file": "counter-tick.wav",
        "description": "Metric counter incrementing",
        "duration": 0.1,
        "volume": 0.2
      },
      "graph-draw": {
        "file": "graph-draw.wav",
        "description": "Graph line being drawn",
        "duration": 1.5,
        "volume": 0.3
      },
      "percentage-rise": {
        "file": "percentage-rise.wav",
        "description": "Percentage increasing",
        "duration": 1,
        "volume": 0.4
      }
    }
  },
  "scenes": {
    "evolution": {
      "effects": ["tech-atmosphere", "timeline-whoosh", "crisis-alarm", "data-flow"],
      "voiceovers": ["evolution-intro", "evolution-birth", "evolution-early-days", "evolution-growth", "evolution-transformation"]
    },
    "bottleneck": {
      "effects": ["partition-appear", "consumer-connect", "error-buzz", "message-process"],
      "voiceovers": ["bottleneck-intro", "bottleneck-demo-1", "bottleneck-real-world", "bottleneck-attempts", "bottleneck-cost"]
    },
    "share-groups": {
      "effects": ["breakthrough", "reveal", "success-chime", "scaling-up", "data-stream"],
      "voiceovers": ["sharegroups-revelation", "sharegroups-how-it-works", "sharegroups-architecture", "sharegroups-demo", "sharegroups-benefits", "sharegroups-paradigm-shift"]
    },
    "impact": {
      "effects": ["impact-boom", "graph-draw", "percentage-rise", "success-chime"],
      "voiceovers": ["impact-intro", "impact-case-1", "impact-case-2", "impact-metrics", "impact-conclusion"]
    }
  }
}
EOF
echo "✅ Created sound library manifest"

# Generate placeholder sounds using Node.js
echo "🎵 Generating placeholder sound effects..."
node -e "
const fs = require('fs');
const path = require('path');

// Create a simple WAV file header
function createWavHeader(dataLength, sampleRate = 44100, channels = 1, bitsPerSample = 16) {
  const buffer = Buffer.alloc(44);
  
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channels * bitsPerSample / 8, 28);
  buffer.writeUInt16LE(channels * bitsPerSample / 8, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);
  
  return buffer;
}

// Generate a simple sine wave
function generateSineWave(frequency, duration, sampleRate = 44100) {
  const samples = Math.floor(sampleRate * duration);
  const buffer = Buffer.alloc(samples * 2);
  
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const value = Math.sin(2 * Math.PI * frequency * t) * 0.3 * 32767;
    buffer.writeInt16LE(Math.floor(value), i * 2);
  }
  
  return buffer;
}

// Create placeholder sound files
const sounds = [
  // Ambient
  { name: 'tech-atmosphere', frequency: 50, duration: 1 },
  { name: 'data-flow', frequency: 100, duration: 1 },
  // Transitions
  { name: 'scene-transition', frequency: 500, duration: 0.5 },
  { name: 'timeline-whoosh', frequency: 300, duration: 0.3 },
  { name: 'reveal', frequency: 800, duration: 0.5 },
  // UI
  { name: 'partition-appear', frequency: 1000, duration: 0.2 },
  { name: 'consumer-connect', frequency: 600, duration: 0.3 },
  { name: 'message-process', frequency: 1200, duration: 0.1 },
  { name: 'error-buzz', frequency: 150, duration: 0.5 },
  { name: 'success-chime', frequency: 880, duration: 0.5 },
  // Dramatic
  { name: 'crisis-alarm', frequency: 440, duration: 1 },
  { name: 'breakthrough', frequency: 660, duration: 0.8 },
  { name: 'impact-boom', frequency: 80, duration: 0.5 },
  // Data
  { name: 'data-stream', frequency: 200, duration: 1 },
  { name: 'message-burst', frequency: 1500, duration: 0.2 },
  { name: 'scaling-up', frequency: 400, duration: 0.5 },
  { name: 'scaling-down', frequency: 300, duration: 0.5 },
  // Metrics
  { name: 'counter-tick', frequency: 2000, duration: 0.05 },
  { name: 'graph-draw', frequency: 700, duration: 0.5 },
  { name: 'percentage-rise', frequency: 900, duration: 0.3 }
];

const outputDir = path.join(__dirname, 'public/audio/effects/s2e1');

sounds.forEach(sound => {
  const outputPath = path.join(outputDir, sound.name + '.wav');
  
  if (!fs.existsSync(outputPath)) {
    const waveData = generateSineWave(sound.frequency, sound.duration);
    const header = createWavHeader(waveData.length);
    const wav = Buffer.concat([header, waveData]);
    
    fs.writeFileSync(outputPath, wav);
    console.log('Created placeholder: ' + sound.name + '.wav');
  }
});

// Also create system sounds
const systemSounds = [
  { name: 'netflix-tadum', frequency: 146.83, duration: 2 },
  { name: 'click', frequency: 1000, duration: 0.1 },
  { name: 'hover', frequency: 800, duration: 0.05 },
  { name: 'whoosh', frequency: 300, duration: 0.5 },
  { name: 'success', frequency: 880, duration: 0.5 },
  { name: 'error', frequency: 220, duration: 0.5 },
  { name: 'transition', frequency: 500, duration: 0.3 },
  { name: 'episode-start', frequency: 523.25, duration: 1 },
  { name: 'scene-change', frequency: 400, duration: 0.4 }
];

const systemDir = path.join(__dirname, 'public/audio/system');
if (!fs.existsSync(systemDir)) {
  fs.mkdirSync(systemDir, { recursive: true });
}

systemSounds.forEach(sound => {
  const outputPath = path.join(systemDir, sound.name + '.wav');
  
  if (!fs.existsSync(outputPath)) {
    const waveData = generateSineWave(sound.frequency, sound.duration);
    const header = createWavHeader(waveData.length);
    const wav = Buffer.concat([header, waveData]);
    
    fs.writeFileSync(outputPath, wav);
    console.log('Created system sound: ' + sound.name + '.wav');
  }
});

console.log('✅ Placeholder sounds generated');
"

# Summary
echo ""
echo "🎉 S2E1 Audio Setup Complete!"
echo "============================="
echo ""
echo "✅ Voice-overs: $(ls -1 public/audio/voiceovers/s2e1/*.mp3 2>/dev/null | wc -l) files"
echo "✅ Sound effects: $(ls -1 public/audio/effects/s2e1/*.wav 2>/dev/null | wc -l) files" 
echo "✅ System sounds: $(ls -1 public/audio/system/*.wav 2>/dev/null | wc -l) files"
echo ""
echo "📝 Directory structure:"
echo "   public/audio/"
echo "   ├── system/          (general UI sounds)"
echo "   ├── voiceovers/s2e1/ (episode voice-overs)"
echo "   └── effects/s2e1/    (episode sound effects)"
echo ""
echo "🎧 Next steps:"
echo "1. Run 'npm run dev' and navigate to S2E1"
echo "2. The streamlined audio system will handle everything"
echo "3. For production, replace WAV placeholders with high-quality audio"
echo ""
echo "Happy streaming! 🎬"