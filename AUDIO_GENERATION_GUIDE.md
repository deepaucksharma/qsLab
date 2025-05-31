# Audio Generation Guide

## Overview

The Neural Learn platform now includes an improved TTS (Text-to-Speech) system with multiple voice presets and better quality audio generation.

## Current Setup

### TTS Integration in app.py
- **Fixed**: PyTorch 2.7 compatibility issues
- **Models**: XTTS v2 (primary) with Tacotron2-DDC fallback
- **Voices**: 4 presets (instructor male/female, enthusiastic, calm)
- **Languages**: English (can support 16 languages with XTTS v2)

### Voice Presets
- `instructor_male`: Professional male voice (default)
- `instructor_female`: Professional female voice
- `enthusiastic`: Energetic teaching voice (1.1x speed)
- `calm_explainer`: Thoughtful explanatory voice (0.95x speed)

## Generating Audio

### Quick Start
```bash
# Start the main app (includes TTS server)
python app.py

# In another terminal, generate all audio
python generate_all_audio_v3.py
```

### Advanced Options
```bash
# Regenerate all audio (ignore cache)
python generate_all_audio_v3.py --no-cache

# Use custom API URL
python generate_all_audio_v3.py --api-url http://localhost:5001

# Parallel generation (experimental)
python generate_all_audio_v3.py --workers 4
```

## Voice Mapping

The script automatically selects appropriate voices based on segment type:

| Segment Type | Voice Preset | Description |
|-------------|--------------|-------------|
| course_opening | enthusiastic | Energetic welcome |
| technical_introduction | instructor_male | Clear technical explanation |
| concept_explanation | calm_explainer | Thoughtful teaching |
| knowledge_check | enthusiastic | Encouraging assessment |
| metrics_overview | instructor_female | Professional data presentation |

## Audio Files

Generated audio files are stored in `audio_outputs/`:
- Format: `AUDIO_SEG{XX}_{XX}_{NAME}_V2.wav`
- Metadata: Corresponding `.json` files with generation details
- Manifest: `generation_manifest_v3.json` tracks all generated audio

## Monitoring Progress

The generation script shows:
- Real-time progress with ETA
- Voice assignment for each segment
- Cache status (cached/generated/failed)
- Final summary with statistics

## Troubleshooting

### TTS Not Loading
If you see "TTS not available":
1. Check PyTorch installation: `pip install torch torchaudio`
2. Install TTS: `pip install TTS==0.22.0`
3. First run downloads models (~1.8GB)

### Audio Generation Fails
1. Ensure app.py is running: `python app.py`
2. Check API health: `curl http://localhost:5000/api/health`
3. Look for errors in app.py console output

### Wrong Voice Used
The script maps segment types to voices automatically. To customize:
1. Edit `SEGMENT_VOICE_MAP` in `generate_all_audio_v3.py`
2. Add new mappings for your segment types
3. Run with `--no-cache` to regenerate

## Performance

- Average generation time: ~4 seconds per segment
- Total time for 29 segments: ~2 minutes
- Cached segments: Instant (0 seconds)
- Memory usage: ~2GB (model loaded once)

## Next Steps

To improve voice quality further:
1. Record custom voice samples for voice cloning
2. Integrate OpenAI TTS for premium segments
3. Add emotion control with Bark model
4. Implement voice consistency across lessons

See `TTS_UPGRADE_PLAN.md` for detailed enhancement options.