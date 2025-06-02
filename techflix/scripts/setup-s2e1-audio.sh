#!/bin/bash

# Setup script for S2E1 audio assets
# This script generates voice-overs and sets up the directory structure

echo "🎬 TechFlix S2E1 Audio Setup"
echo "============================"

# Check if edge-tts is installed
if ! python3 -c "import edge_tts" 2>/dev/null; then
    echo "❌ edge-tts not installed. Installing..."
    pip3 install edge-tts asyncio
else
    echo "✅ edge-tts is installed"
fi

# Create directories
echo "📁 Creating directory structure..."
mkdir -p public/audio/voiceovers/s2e1
mkdir -p public/audio/effects/s2e1

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

# Create placeholder sound effects (if they don't exist)
echo "🔊 Setting up sound effects..."
if [ ! -f "public/audio/effects/s2e1/sound-library.json" ]; then
    # Copy the sound library manifest
    cat > public/audio/effects/s2e1/sound-library.json << 'EOF'
{
  "episode": "s2e1",
  "title": "Kafka Share Groups Sound Effects Library",
  "effects": {
    "ambient": {
      "tech-atmosphere": {"file": "tech-atmosphere.mp3", "duration": 60, "loop": true, "volume": 0.2},
      "data-flow": {"file": "data-flow.mp3", "duration": 30, "loop": true, "volume": 0.3}
    }
  }
}
EOF
    echo "✅ Created sound library manifest"
fi

# Generate placeholder sounds using Node.js
echo "🎵 Generating placeholder sound effects..."
cat > scripts/generate-placeholder-sounds.js << 'EOF'
const fs = require('fs');
const path = require('path');

// Create a simple WAV file header
function createWavHeader(dataLength, sampleRate = 44100, channels = 1, bitsPerSample = 16) {
  const buffer = Buffer.alloc(44);
  
  // "RIFF" chunk descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  
  // "fmt " sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20); // AudioFormat (PCM)
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channels * bitsPerSample / 8, 28); // ByteRate
  buffer.writeUInt16LE(channels * bitsPerSample / 8, 32); // BlockAlign
  buffer.writeUInt16LE(bitsPerSample, 34);
  
  // "data" sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);
  
  return buffer;
}

// Generate a simple sine wave
function generateSineWave(frequency, duration, sampleRate = 44100) {
  const samples = Math.floor(sampleRate * duration);
  const buffer = Buffer.alloc(samples * 2); // 16-bit samples
  
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const value = Math.sin(2 * Math.PI * frequency * t) * 0.3 * 32767;
    buffer.writeInt16LE(Math.floor(value), i * 2);
  }
  
  return buffer;
}

// Create placeholder sound files
const sounds = [
  { name: 'tech-atmosphere', frequency: 50, duration: 1 },
  { name: 'data-flow', frequency: 100, duration: 1 },
  { name: 'scene-transition', frequency: 500, duration: 0.5 },
  { name: 'timeline-whoosh', frequency: 300, duration: 0.3 },
  { name: 'reveal', frequency: 800, duration: 0.5 },
  { name: 'partition-appear', frequency: 1000, duration: 0.2 },
  { name: 'consumer-connect', frequency: 600, duration: 0.3 },
  { name: 'message-process', frequency: 1200, duration: 0.1 },
  { name: 'error-buzz', frequency: 150, duration: 0.5 },
  { name: 'success-chime', frequency: 880, duration: 0.5 },
  { name: 'crisis-alarm', frequency: 440, duration: 1 },
  { name: 'breakthrough', frequency: 660, duration: 0.8 },
  { name: 'impact-boom', frequency: 80, duration: 0.5 }
];

const outputDir = path.join(__dirname, '../public/audio/effects/s2e1');

sounds.forEach(sound => {
  const outputPath = path.join(outputDir, `${sound.name}.wav`);
  
  if (!fs.existsSync(outputPath)) {
    const waveData = generateSineWave(sound.frequency, sound.duration);
    const header = createWavHeader(waveData.length);
    const wav = Buffer.concat([header, waveData]);
    
    fs.writeFileSync(outputPath, wav);
    console.log(`Created placeholder: ${sound.name}.wav`);
  }
});

console.log('✅ Placeholder sounds generated');
EOF

node scripts/generate-placeholder-sounds.js
rm scripts/generate-placeholder-sounds.js

# Summary
echo ""
echo "🎉 S2E1 Audio Setup Complete!"
echo "============================="
echo ""
echo "✅ Voice-overs: $(ls -1 public/audio/voiceovers/s2e1/*.mp3 2>/dev/null | wc -l) files"
echo "✅ Sound effects: $(ls -1 public/audio/effects/s2e1/*.wav 2>/dev/null | wc -l) placeholder files"
echo ""
echo "📝 Next steps:"
echo "1. Open scripts/generate-sound-effects.html in a browser for better sounds"
echo "2. Or use the placeholder WAV files that were generated"
echo "3. Run 'npm run dev' and navigate to S2E1 to test"
echo ""
echo "🎧 For production-quality audio:"
echo "- Replace placeholder sounds with professional effects"
echo "- Consider professional voice recording"
echo "- Add audio post-processing"
echo ""
echo "Happy streaming! 🎬"