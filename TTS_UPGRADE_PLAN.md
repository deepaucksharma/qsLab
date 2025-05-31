# TTS Voice Quality Upgrade Plan

## Current State Analysis

### Working Models
- **Tacotron2-DDC**: Clear voice, 4s generation time, single speaker
- **VITS Multi-Speaker**: 100+ voices available in `app_best_tts.py`

### Issues
- **XTTS v2**: PyTorch 2.6 compatibility issue (fixed in `app_xtts_fixed.py`)
- **Limited Voice Variety**: Current production uses single voice
- **No Emotion Control**: Flat delivery for all content types

## Recommended Upgrade Path

### Phase 1: Fix XTTS v2 (Immediate)
1. Deploy `app_xtts_fixed.py` with PyTorch compatibility fixes
2. Benefits:
   - Voice cloning capability
   - 16 language support
   - Better prosody and emotion
   - Speed control (0.5x - 2.0x)

### Phase 2: Add Voice Variety (1 week)
1. Create voice reference samples:
   ```bash
   # Record 10-30 second samples for each voice type:
   - Professional male instructor
   - Professional female instructor  
   - Enthusiastic teacher
   - Calm explainer
   - Technical expert
   ```

2. Implement voice selection by segment type:
   ```python
   SEGMENT_VOICE_MAP = {
       'course_opening': 'enthusiastic',
       'technical_introduction': 'technical_expert',
       'knowledge_check': 'instructor_female',
       'concept_explanation': 'calm_explainer'
   }
   ```

### Phase 3: Modern TTS Integration (2-4 weeks)

#### Option 1: OpenAI TTS (Best Quality)
```python
# pip install openai
from openai import OpenAI

client = OpenAI()
response = client.audio.speech.create(
    model="tts-1-hd",  # or "tts-1" for faster
    voice="alloy",     # nova, echo, fable, onyx, shimmer
    input=text,
    speed=1.0
)
```
- **Pros**: Best quality, 6 professional voices, fast
- **Cons**: API cost ($15/1M chars), requires internet
- **Cost**: ~$0.30 per course hour

#### Option 2: ElevenLabs (Best Voice Cloning)
```python
# pip install elevenlabs
from elevenlabs import Voice, VoiceSettings, generate

audio = generate(
    text=text,
    voice=Voice(
        voice_id="21m00Tcm4TlvDq8ikWAM",  # or clone custom
        settings=VoiceSettings(
            stability=0.71,
            similarity_boost=0.75,
            style=0.5,
            use_speaker_boost=True
        )
    )
)
```
- **Pros**: Best voice cloning, emotion control
- **Cons**: More expensive ($30/1M chars)
- **Cost**: ~$0.60 per course hour

#### Option 3: Bark (Free, Experimental)
```python
from bark import SAMPLE_RATE, generate_audio, preload_models

# Supports emotions and sound effects
text = "Hello [laughs], this is amazing! ♪"
audio_array = generate_audio(text)
```
- **Pros**: Free, emotions, sound effects, music
- **Cons**: Slower, less consistent quality

#### Option 4: StyleTTS 2 (Free, High Quality)
```python
# Latest open-source model
from styletts2 import tts

model = tts.StyleTTS2()
wav = model.inference(
    text,
    diffusion_steps=5,
    embedding_scale=1
)
```
- **Pros**: Free, near commercial quality, fast
- **Cons**: Single speaker per model

### Phase 4: Hybrid Approach (Recommended)

1. **Primary**: XTTS v2 (fixed) for main content
2. **Premium**: OpenAI TTS for important segments
3. **Variety**: VITS multi-speaker for character voices
4. **Effects**: Bark for special sound effects

```python
def select_tts_engine(segment):
    if segment.type in ['course_opening', 'checkpoint']:
        return 'openai'  # Best quality for important parts
    elif segment.needs_emotion:
        return 'bark'    # For laughs, music, effects
    elif segment.speaker_id:
        return 'vits'    # For multi-character scenarios
    else:
        return 'xtts'    # Default high-quality
```

## Implementation Steps

### Step 1: Test Fixed XTTS v2
```bash
# Test the fixed implementation
python app_xtts_fixed.py

# Generate voice samples
curl -X POST http://localhost:5000/api/generate-voice-samples \
  -H "Content-Type: application/json" \
  -d '{"text": "Welcome to Neural Learn"}'
```

### Step 2: Create Voice References
```bash
# Create voice samples directory
mkdir -p voice_samples

# Record or download reference voices
# Use Audacity or similar to record 10-30s samples
```

### Step 3: Update Frontend
```javascript
// Add voice selection to UI
const voiceSelector = {
    'default': 'Use default voice',
    'instructor_male': 'Professional Male',
    'instructor_female': 'Professional Female',
    'enthusiastic': 'Enthusiastic Teacher',
    'calm_explainer': 'Calm Explainer'
};

// Auto-select based on segment type
function getVoiceForSegment(segmentType) {
    const voiceMap = {
        'course_opening': 'enthusiastic',
        'concept_explanation': 'calm_explainer',
        'code_walkthrough': 'instructor_male'
    };
    return voiceMap[segmentType] || 'default';
}
```

### Step 4: Add Voice Preview
```python
@app.route('/api/preview-voice', methods=['POST'])
def preview_voice():
    """Generate quick preview of voice"""
    voice = request.json.get('voice')
    text = "This is how I sound. Let's learn together!"
    # Generate 5-second preview
```

## Performance Optimization

### 1. Pre-generate Common Phrases
```python
COMMON_PHRASES = {
    'welcome': "Welcome to this lesson",
    'complete': "Great job completing this section",
    'next': "Let's move on to the next topic"
}
# Pre-generate on startup
```

### 2. Implement Caching
```python
import hashlib
from functools import lru_cache

@lru_cache(maxsize=1000)
def get_cached_audio(text_hash, voice_id):
    return f"audio_outputs/cache/{text_hash}_{voice_id}.wav"
```

### 3. Parallel Generation
```python
from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor(max_workers=4)
# Generate multiple segments in parallel
```

## Quality Metrics

Track these metrics to measure improvement:

1. **User Engagement**: Time spent per lesson
2. **Completion Rate**: % who finish audio segments
3. **Replay Rate**: How often users replay audio
4. **Feedback Score**: Voice quality ratings
5. **Generation Time**: Avg time to create audio

## Migration Strategy

1. **Week 1**: Deploy fixed XTTS v2, test with beta users
2. **Week 2**: Add voice variety, A/B test engagement
3. **Week 3**: Integrate OpenAI for premium segments
4. **Week 4**: Full rollout with voice selection UI

## Cost Analysis

For 1000 hours of content:
- **Current (XTTS v2)**: $0 (local generation)
- **OpenAI TTS**: ~$300 (premium segments only: ~$30)
- **ElevenLabs**: ~$600 (premium segments only: ~$60)
- **Hybrid Approach**: ~$30-50 (10% premium segments)

## Conclusion

The recommended approach:
1. Fix and deploy XTTS v2 immediately
2. Add voice variety with presets
3. Integrate OpenAI TTS for key segments
4. Monitor metrics and adjust voice allocation

This provides the best balance of quality, cost, and implementation speed.