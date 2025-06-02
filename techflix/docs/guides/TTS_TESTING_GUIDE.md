# TTS Testing Guide

## Overview
TechFlix includes a comprehensive TTS (Text-to-Speech) testing lab that allows you to compare different voice providers and configurations.

## Access the TTS Testing Lab

1. **Via Browser**: Navigate to http://localhost:3001/tts-test
2. **Via Header**: Click "TTS Lab" in the navigation menu

## Available TTS Providers

### 1. Microsoft Edge TTS (Currently Used)
- **Pros**: High quality, free, neural voices
- **Cons**: Requires edge-tts package
- **Setup**: `npm install -g edge-tts`

### 2. Google TTS (gTTS)
- **Pros**: Simple, free, reliable
- **Cons**: Limited voice options
- **Setup**: `pip install gtts`

### 3. System TTS (pyttsx3)
- **Pros**: Offline, no API needed
- **Cons**: Quality varies by OS
- **Setup**: `pip install pyttsx3`

### 4. Amazon Polly
- **Pros**: Professional quality, many voices
- **Cons**: Requires AWS account (free tier available)
- **Setup**: AWS credentials needed

### 5. ElevenLabs
- **Pros**: Most natural sounding
- **Cons**: Limited free tier
- **Setup**: API key required

### 6. Coqui TTS
- **Pros**: Open source, customizable
- **Cons**: Resource intensive
- **Setup**: `pip install TTS`

## Running the TTS API Mock Server

To test real TTS generation:

```bash
# Start both dev server and TTS API
npm run tts:test

# Or run separately:
npm run dev        # In terminal 1
npm run tts:api    # In terminal 2
```

## Using the TTS Testing Lab

1. **Select Provider**: Choose from 6 different TTS providers
2. **Choose Voice**: Each provider offers different voice options
3. **Enter Text**: Type or select sample text
4. **Generate**: Click to create voice-over
5. **Compare**: Play and compare results

## Sample Test Texts

The lab includes pre-written samples:
- **Technical**: For documentation style
- **Narrative**: For storytelling
- **Instructional**: For tutorials
- **Dramatic**: For emphasis

## API Integration

The TTS test page can work in two modes:

### Mock Mode (Default)
- Uses existing voice-over files
- No setup required
- Shows warning indicator

### API Mode
- Real TTS generation
- Requires TTS API server running
- Actual voice synthesis

## Adding New Providers

To add a new TTS provider:

1. Update `src/pages/TTSTestPage.jsx`:
```javascript
providers: {
  'new-provider': {
    name: 'New Provider Name',
    voices: { /* voice options */ },
    options: { /* configuration */ }
  }
}
```

2. Update `scripts/tts-api-mock.js`:
```javascript
ttsProviders: {
  'new-provider': async (text, voice, options) => {
    // Implementation
  }
}
```

## Best Practices

1. **Test Different Voices**: Each voice has strengths for different content types
2. **Consider Context**: Technical content may need clearer pronunciation
3. **Check File Sizes**: Some providers create larger files
4. **Test Offline**: Some providers work without internet

## Troubleshooting

### edge-tts not found
```bash
npm install -g edge-tts
```

### gTTS not working
```bash
pip install gtts
# or
pip3 install gtts
```

### API connection failed
- Check if TTS API is running: `npm run tts:api`
- Verify port 3333 is available
- Check console for errors

## Production Considerations

For production use:
1. **Edge TTS**: Good balance of quality and cost
2. **Amazon Polly**: Professional, scalable
3. **Self-hosted**: Coqui TTS for full control
4. **Premium**: ElevenLabs for best quality

## Voice-Over File Structure

Generated files are saved to:
```
public/
└── audio/
    ├── voiceovers/     # Production voice-overs
    └── tts-test/       # Test generations
```