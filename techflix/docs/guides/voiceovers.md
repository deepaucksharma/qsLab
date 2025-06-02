# Voice-Over Guide

This guide explains how to generate and integrate voice-overs for TechFlix episodes using Microsoft Edge TTS.

## Overview

TechFlix uses Microsoft Edge TTS (Text-to-Speech) to generate high-quality voice-overs for episode narration. The system supports multiple voices for different contexts (narrator, technical explanations, dramatic moments).

## Setup

### 1. Install Dependencies

Run the setup script to install edge-tts:

```bash
./scripts/setup-tts.sh
```

Or manually install:

```bash
pip3 install edge-tts
```

### 2. Generate Voice-Overs

Generate all voice-overs for existing episodes:

```bash
npm run generate:voiceovers
```

This will:
- Create MP3 files for each scene
- Generate metadata JSON files
- Store files in `public/audio/voiceovers/`

### 3. List Available Voices

To see all available English voices:

```bash
npm run voiceover:list
```

## Voice Configuration

### Available Voices

The system uses different voices for different contexts:

```javascript
const VOICES = {
  narrator: 'en-US-JennyNeural',        // Main narrator - professional female
  alternateNarrator: 'en-US-GuyNeural',  // Alternative male narrator
  technical: 'en-US-AriaNeural',         // For technical explanations
  dramatic: 'en-US-ChristopherNeural'   // For dramatic moments
};
```

### Adding Voice-Overs to Episodes

Edit `scripts/generate-voiceovers.js` to add voice-over scripts:

```javascript
const VOICEOVER_SCRIPTS = {
  's1e1': {  // Season 1, Episode 1
    'scene-id': {
      voice: VOICES.narrator,
      script: `Your narration text here...`,
      duration: 15  // seconds
    }
  }
};
```

## Integration with Episodes

### Automatic Integration

Voice-overs are automatically loaded when:
1. Episode ID matches (e.g., `s1e1`)
2. Scene ID matches
3. Audio file exists at the correct path

### Manual Control

The episode player provides voice-over controls:
- Play/Pause narration
- Volume control
- Progress tracking
- Enable/Disable toggle

### React Hook Usage

Use the `useVoiceOver` hook in custom components:

```javascript
import { useVoiceOver } from '@hooks/useVoiceOver';

const MyScene = ({ time, duration }) => {
  const voiceOver = useVoiceOver('s1e1', 'my-scene', {
    autoPlay: true,
    volume: 0.8,
    onEnd: () => console.log('Narration complete')
  });
  
  return (
    <div>
      {voiceOver.hasVoiceOver && (
        <button onClick={voiceOver.toggle}>
          {voiceOver.isPlaying ? 'Pause' : 'Play'} Narration
        </button>
      )}
    </div>
  );
};
```

## File Structure

```
public/
└── audio/
    └── voiceovers/
        ├── index.json          # Global metadata
        ├── s1e1/              # Season 1, Episode 1
        │   ├── scene-1.mp3
        │   ├── scene-1.json
        │   ├── scene-2.mp3
        │   └── scene-2.json
        └── s2e1/              # Season 2, Episode 1
            ├── opening.mp3
            └── opening.json
```

## Voice-Over Script Guidelines

### Writing Effective Scripts

1. **Keep it concise**: Aim for 15-20 seconds per scene
2. **Match the mood**: Use appropriate voice for context
3. **Avoid redundancy**: Don't describe what's visually obvious
4. **Add value**: Provide insights, context, or emphasis
5. **Natural pacing**: Include pauses with punctuation

### Example Script

```javascript
{
  voice: VOICES.narrator,
  script: `In traditional Kafka consumer groups, there's a fundamental 
          limitation that has constrained scalability for years. 
          Each partition can only be consumed by one consumer at a time. 
          This creates a bottleneck that Share Groups are designed to eliminate.`,
  duration: 15
}
```

## Troubleshooting

### Voice-over not playing
1. Check browser console for errors
2. Verify audio file exists: `public/audio/voiceovers/{episodeId}/{sceneId}.mp3`
3. Check metadata file: `public/audio/voiceovers/{episodeId}/{sceneId}.json`
4. Ensure episode/scene IDs match exactly

### edge-tts installation issues
- Requires Python 3.6+
- Try: `pip3 install --user edge-tts`
- Or use pipx: `pipx install edge-tts`

### Audio quality issues
- Use higher quality voices (Neural voices)
- Adjust speaking rate: `--rate -10%`
- Add SSML markup for better control

## Advanced Features

### Custom Voice Parameters

Modify the generation command for custom settings:

```javascript
const command = `edge-tts --voice "${voice}" --text "${text}" --rate -5% --write-media "${outputPath}"`;
```

### SSML Support

Use SSML for advanced control:

```javascript
const ssmlText = `<speak>
  <prosody rate="-10%" pitch="+5%">
    ${text}
  </prosody>
</speak>`;
```

### Batch Processing

Generate voice-overs for specific episodes:

```bash
node scripts/generate-voiceovers.js --episode s1e1
```

## Best Practices

1. **Test locally**: Always preview voice-overs before committing
2. **Version control**: Commit both MP3 and metadata files
3. **Consistent naming**: Use exact scene IDs from episode data
4. **Fallback gracefully**: App works without voice-overs
5. **Monitor file size**: Optimize audio for web delivery

## Future Enhancements

- [ ] Real-time TTS generation
- [ ] Multiple language support
- [ ] User voice preferences
- [ ] Subtitle synchronization
- [ ] Voice emotion detection