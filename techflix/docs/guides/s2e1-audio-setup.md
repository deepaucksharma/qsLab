# S2E1 Audio Setup Guide

This guide explains how to set up complete audio (voice-overs and sound effects) for Season 2 Episode 1: Kafka Share Groups.

## Overview

The episode features:
- **Professional voice-overs** using Microsoft Edge TTS with 3 different voices
- **Cinematic sound effects** for transitions, UI interactions, and dramatic moments
- **Synchronized subtitles** that appear with voice-overs
- **Ambient background audio** for atmosphere

## Step 1: Generate Voice-Overs

### Prerequisites
```bash
pip install edge-tts asyncio
```

### Generate All Voice-Overs
```bash
cd scripts
python generate-voiceovers-s2e1.py
```

This will:
- Generate 20 voice-over segments
- Use 3 different neural voices (Guy, Jenny, Aria)
- Apply prosody adjustments for emotion
- Save files to `public/sounds/voiceovers/s2e1/`
- Create `metadata.json` with timing information

### Voice-Over Structure
- **Scene 1 (Evolution)**: 5 segments with Guy's narrative voice
- **Scene 2 (Bottleneck)**: 5 segments with Jenny's explanatory voice
- **Scene 3 (Share Groups)**: 6 segments with Guy's technical voice
- **Scene 4 (Impact)**: 5 segments with Aria's professional voice

## Step 2: Generate Sound Effects

### Option A: Use Web Audio Generator
1. Open `scripts/generate-sound-effects.html` in Chrome/Firefox
2. Click each button to generate and download sounds
3. Move downloaded files to `public/sounds/effects/s2e1/`
4. Convert WAV to MP3 if desired (optional)

### Option B: Use Professional Sound Libraries
Download or create these sounds:
- **Ambient**: tech-atmosphere.mp3, data-flow.mp3
- **Transitions**: scene-transition.mp3, timeline-whoosh.mp3, reveal.mp3
- **UI**: partition-appear.mp3, consumer-connect.mp3, message-process.mp3
- **Dramatic**: crisis-alarm.mp3, breakthrough.mp3, impact-boom.mp3

## Step 3: File Structure

Ensure your files are organized as follows:

```
public/sounds/
├── voiceovers/
│   └── s2e1/
│       ├── metadata.json
│       ├── evolution-evolution-intro.mp3
│       ├── evolution-evolution-birth.mp3
│       ├── evolution-evolution-early-days.mp3
│       ├── evolution-evolution-growth.mp3
│       ├── evolution-evolution-transformation.mp3
│       ├── bottleneck-bottleneck-intro.mp3
│       ├── ... (all voice-over files)
│       └── impact-impact-conclusion.mp3
└── effects/
    └── s2e1/
        ├── sound-library.json
        ├── tech-atmosphere.mp3
        ├── data-flow.mp3
        ├── scene-transition.mp3
        ├── ... (all effect files)
        └── impact-boom.mp3
```

## Step 4: Test the Episode

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to Season 2, Episode 1

3. The episode will:
   - Load all audio assets automatically
   - Play the "ta-dum" sound on episode start
   - Synchronize voice-overs with scene progression
   - Display subtitles (can be toggled with CC button)
   - Play ambient and effect sounds at appropriate moments

## Audio Timing Reference

### Scene 1: Evolution Timeline (0-480s)
- 0s: Crisis alarm + intro narration
- 15s: Reveal sound + Kafka introduction
- 35s: Timeline progression + early days
- 60s: Growth challenges narration
- 80s: Transformation complete

### Scene 2: Bottleneck Demo (480-960s)
- 480s: Visualization intro
- 492s: Partition demonstration
- 507s: Real-world impact
- 527s: Failed workarounds
- 545s: Cost analysis

### Scene 3: Share Groups (960-1560s)
- 960s: Breakthrough revelation
- 972s: How it works explanation
- 997s: Architecture deep dive
- 1017s: Live demonstration
- 1035s: Benefits cascade
- 1057s: Paradigm shift

### Scene 4: Impact (1560-1920s)
- 1560s: Industry impact intro
- 1570s: Financial institution case
- 1590s: E-commerce case study
- 1608s: Metrics showcase
- 1623s: Future vision

## Customization

### Adjust Voice Settings
Edit `scripts/generate-voiceovers-s2e1.py`:
- `rate`: Speech speed (-50% to +50%)
- `pitch`: Voice pitch (-20Hz to +20Hz)
- `voice`: Change narrator

### Modify Sound Effects
Edit `public/sounds/effects/s2e1/sound-library.json`:
- `volume`: Effect loudness (0-1)
- `loop`: Whether to repeat
- `duration`: Length in seconds

### Update Subtitles
Subtitles are automatically extracted from voice-over text. To modify:
1. Edit text in `voiceovers/scripts.js`
2. Regenerate voice-overs
3. Subtitles will update automatically

## Troubleshooting

### No Audio Playing
1. Check browser console for errors
2. Ensure files exist in correct paths
3. Try clicking/interacting with page first (browser requirement)

### Voice-Overs Out of Sync
1. Check scene `duration` matches audio length
2. Verify `startTime` in scripts.js
3. Review scene progression logic

### Missing Subtitles
1. Ensure CC is enabled (button in top-right)
2. Check episodeAudioManager is initialized
3. Verify subtitle callback is set

## Production Tips

1. **Voice-Over Quality**: Edge TTS produces good quality, but for production consider:
   - Professional voice actors
   - Studio recording
   - Audio post-processing

2. **Sound Effects**: The Web Audio generator creates placeholder sounds. For production:
   - License professional sound effects
   - Custom sound design
   - Spatial audio for immersion

3. **Performance**: Preload all audio during episode loading screen to prevent delays

4. **Accessibility**: Always provide subtitles and consider audio descriptions