# Alternative Free TTS APIs for Voice-Over Generation

## 1. **Google Text-to-Speech (gTTS)**
A Python library that uses Google's TTS API (no API key required for basic usage).

### Installation
```bash
pip install gtts
```

### Usage Example
```python
from gtts import gTTS
import os

def generate_voiceover_gtts(text, output_file, lang='en', slow=False):
    tts = gTTS(text=text, lang=lang, slow=slow)
    tts.save(output_file)

# Example
generate_voiceover_gtts(
    "Welcome to TechFlix. Today we explore Kafka Share Groups.",
    "voiceover.mp3"
)
```

### Pros
- No API key required
- Multiple languages (en, es, fr, de, etc.)
- Simple to use
- Good quality

### Cons
- Limited voice options
- Requires internet connection
- No voice customization

## 2. **Mozilla TTS**
Open-source deep learning TTS system.

### Installation
```bash
pip install TTS
```

### Usage Example
```python
from TTS.api import TTS

# List available models
# TTS.list_models()

# Init TTS with a pretrained model
tts = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC")

# Generate speech
tts.tts_to_file(
    text="Welcome to TechFlix",
    file_path="voiceover.wav"
)
```

### Pros
- Completely offline
- Multiple models available
- High quality output
- Open source

### Cons
- Larger installation size
- Requires more CPU/GPU resources
- Slower generation

## 3. **pyttsx3 (Offline)**
Python text-to-speech that works offline using system voices.

### Installation
```bash
pip install pyttsx3
```

### Usage Example
```python
import pyttsx3

def generate_voiceover_pyttsx3(text, output_file, rate=150, volume=1.0):
    engine = pyttsx3.init()
    engine.setProperty('rate', rate)
    engine.setProperty('volume', volume)
    
    # List available voices
    voices = engine.getProperty('voices')
    # engine.setProperty('voice', voices[1].id)  # Change voice
    
    engine.save_to_file(text, output_file)
    engine.runAndWait()

generate_voiceover_pyttsx3(
    "Welcome to TechFlix",
    "voiceover.mp3"
)
```

### Pros
- Completely offline
- No API limits
- Uses system voices
- Fast generation

### Cons
- Quality depends on system voices
- Limited voice options
- Less natural sounding

## 4. **Amazon Polly (Free Tier)**
AWS service with 5 million characters free per month for 12 months.

### Installation
```bash
pip install boto3
```

### Usage Example
```python
import boto3

polly = boto3.client('polly', region_name='us-east-1')

response = polly.synthesize_speech(
    Text='Welcome to TechFlix',
    OutputFormat='mp3',
    VoiceId='Joanna',  # Many voices available
    Engine='neural'    # Better quality
)

with open('voiceover.mp3', 'wb') as file:
    file.write(response['AudioStream'].read())
```

### Pros
- High quality neural voices
- Many voice options
- SSML support
- Multiple languages

### Cons
- Requires AWS account
- Free tier limits
- Requires API credentials

## 5. **ElevenLabs (Free Tier)**
AI voice synthesis with 10,000 characters/month free.

### Installation
```bash
pip install elevenlabs
```

### Usage Example
```python
from elevenlabs import generate, save

audio = generate(
    text="Welcome to TechFlix",
    voice="Rachel",  # Or other available voices
    model="eleven_monolingual_v1"
)

save(audio, "voiceover.mp3")
```

### Pros
- Very high quality
- Natural sounding
- Voice cloning available
- Emotion control

### Cons
- Limited free tier
- Requires API key
- Internet required

## 6. **Coqui TTS (Successor to Mozilla TTS)**
Advanced open-source TTS with many models.

### Installation
```bash
pip install coqui-tts
```

### Usage Example
```python
from TTS.api import TTS

# Initialize with a model
tts = TTS("tts_models/en/vctk/vits")

# Generate speech
tts.tts_to_file(
    text="Welcome to TechFlix",
    speaker="p225",  # Choose speaker
    file_path="voiceover.wav"
)
```

### Pros
- Open source
- Many models and voices
- High quality
- Offline capable

### Cons
- Large download size
- Resource intensive
- Setup complexity

## Modified Voice-Over Generation Script

Here's how to modify the existing script to use gTTS (simplest alternative):

```javascript
// scripts/generate-voiceovers-gtts.js
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const VOICES = {
  narrator: { lang: 'en', slow: false },
  technical: { lang: 'en', slow: true },
  dramatic: { lang: 'en', slow: false },
  alternate: { lang: 'en-uk', slow: false }
};

async function generateVoiceOver(text, outputPath, voiceType = 'narrator') {
  const voice = VOICES[voiceType];
  const tempFile = path.join(path.dirname(outputPath), 'temp.mp3');
  
  // Create Python script
  const pythonScript = `
from gtts import gTTS
tts = gTTS(text='''${text.replace(/'/g, "\\'")}''', lang='${voice.lang}', slow=${voice.slow})
tts.save('${tempFile}')
`;
  
  // Save and run Python script
  const scriptPath = path.join(path.dirname(outputPath), 'tts_temp.py');
  await fs.writeFile(scriptPath, pythonScript);
  
  return new Promise((resolve, reject) => {
    exec(`python ${scriptPath}`, async (error) => {
      if (error) {
        reject(error);
        return;
      }
      
      // Move temp file to final location
      await fs.rename(tempFile, outputPath);
      await fs.unlink(scriptPath);
      resolve();
    });
  });
}

// Rest of the script remains similar...
```

## Recommendation

For TechFlix, I recommend:

1. **For Quick Setup**: Use **gTTS** - simplest to implement, good quality
2. **For Best Quality**: Use **Coqui TTS** - open source, high quality, many voices
3. **For Offline**: Use **pyttsx3** - no internet required, uses system voices
4. **For Production**: Consider **Amazon Polly** free tier - professional quality, reliable

The current edge-tts is actually a good choice as it provides high-quality neural voices for free. However, if you want alternatives, gTTS would be the easiest drop-in replacement.