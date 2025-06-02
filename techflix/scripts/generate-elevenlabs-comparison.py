#!/usr/bin/env python3
"""
Generate comparison audio samples using different ElevenLabs voices
"""

import os
import requests
import json
from pathlib import Path
import time

# API Configuration
ELEVEN_LABS_API_KEY = os.environ.get('ELEVEN_LABS_API_KEY', 'your_api_key_here')
API_BASE_URL = "https://api.elevenlabs.io/v1"

# Test segments
TEST_SEGMENTS = {
    "evolution-intro": {
        "text": "In 2011, LinkedIn faced a crisis. Their monolithic architecture was crumbling under the weight of 175 million users. They needed something revolutionary.",
        "duration": "8s"
    },
    "share-groups-revelation": {
        "text": "Then came the revelation: What if consumers could share partitions dynamically? No ownership. No rebalancing. Just pure, efficient message distribution. This was the genesis of Share Groups.",
        "duration": "13s"
    },
    "impact-metrics": {
        "text": "Processing latency dropped from seconds to milliseconds. Systems that struggled with 10,000 messages per second now handled 100,000 with ease. Share Groups didn't just solve the problem—they redefined what was possible.",
        "duration": "16s"
    }
}

def get_voices():
    """Get available voices from ElevenLabs"""
    headers = {
        "Accept": "application/json",
        "xi-api-key": ELEVEN_LABS_API_KEY
    }
    
    response = requests.get(f"{API_BASE_URL}/voices", headers=headers)
    if response.status_code == 200:
        return response.json()["voices"]
    else:
        print(f"Error getting voices: {response.status_code} - {response.text}")
        return []

def generate_audio(text, voice_id, output_path, voice_settings=None):
    """Generate audio using ElevenLabs API"""
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVEN_LABS_API_KEY
    }
    
    settings = voice_settings or {
        "stability": 0.5,
        "similarity_boost": 0.75
    }
    
    data = {
        "text": text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": settings
    }
    
    response = requests.post(
        f"{API_BASE_URL}/text-to-speech/{voice_id}",
        json=data,
        headers=headers
    )
    
    if response.status_code == 200:
        with open(output_path, 'wb') as f:
            f.write(response.content)
        return True
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return False

def main():
    print("🎙️ ElevenLabs Comparison Audio Generation")
    print("=" * 50)
    
    # Create output directory
    output_dir = Path("public/audio/voiceovers/s2e1-elevenlabs")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Get available voices
    print("\n📋 Fetching available voices...")
    voices = get_voices()
    
    if not voices:
        print("❌ No voices available or API error")
        return
    
    # Select diverse voices for comparison
    selected_voices = []
    
    # Try to get different voice types
    voice_categories = {
        "male": None,
        "female": None,
        "young": None,
        "mature": None
    }
    
    for voice in voices:
        desc = voice.get('description', '').lower()
        name = voice['name'].lower()
        
        if not voice_categories["male"] and ('male' in desc or 'man' in desc):
            voice_categories["male"] = voice
        elif not voice_categories["female"] and ('female' in desc or 'woman' in desc):
            voice_categories["female"] = voice
        elif not voice_categories["young"] and 'young' in desc:
            voice_categories["young"] = voice
        elif not voice_categories["mature"] and ('mature' in desc or 'middle' in desc):
            voice_categories["mature"] = voice
    
    # Add found voices to selected list
    for category, voice in voice_categories.items():
        if voice and voice not in selected_voices:
            selected_voices.append(voice)
    
    # If we need more voices, add the top ones
    for voice in voices[:5]:
        if voice not in selected_voices and len(selected_voices) < 4:
            selected_voices.append(voice)
    
    print(f"\n✅ Selected {len(selected_voices)} voices for comparison:")
    for i, voice in enumerate(selected_voices):
        print(f"  {i+1}. {voice['name']} - {voice.get('description', 'No description')[:60]}...")
    
    # Generate audio for each voice and segment
    results = []
    
    for segment_id, segment_data in TEST_SEGMENTS.items():
        print(f"\n📝 Generating segment: {segment_id}")
        print(f"   Text: {segment_data['text'][:80]}...")
        
        for voice in selected_voices:
            voice_id = voice["voice_id"]
            voice_name = voice["name"]
            
            # Create filename
            filename = f"{segment_id}-{voice_name.lower().replace(' ', '-')}.mp3"
            output_path = output_dir / filename
            
            print(f"   🔊 Generating with {voice_name}...", end="", flush=True)
            
            # Try different voice settings for variety
            settings = {
                "stability": 0.5 if 'stable' in voice_name.lower() else 0.6,
                "similarity_boost": 0.75,
                "style": 0.3,  # For v2 voices
                "use_speaker_boost": True
            }
            
            if generate_audio(segment_data['text'], voice_id, output_path, settings):
                print(" ✅")
                results.append({
                    "segment": segment_id,
                    "voice": voice_name,
                    "voice_id": voice_id,
                    "file": str(filename),
                    "text": segment_data['text'],
                    "duration": segment_data['duration']
                })
            else:
                print(" ❌")
            
            # Small delay to avoid rate limiting
            time.sleep(0.5)
    
    # Save metadata
    metadata = {
        "provider": "ElevenLabs",
        "generated": time.strftime("%Y-%m-%d %H:%M:%S"),
        "model": "eleven_monolingual_v1",
        "voices": [
            {
                "name": v["name"],
                "id": v["voice_id"],
                "description": v.get("description", "")
            } for v in selected_voices
        ],
        "segments": results
    }
    
    metadata_file = output_dir / "metadata.json"
    with open(metadata_file, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"\n✅ Generation complete!")
    print(f"📁 Files saved to: {output_dir}")
    print(f"📋 Metadata: {metadata_file}")
    print(f"🎵 Generated {len(results)} audio files")

if __name__ == "__main__":
    # Check if API key is provided
    if ELEVEN_LABS_API_KEY == 'your_api_key_here':
        print("⚠️  Please set your ElevenLabs API key:")
        print("   export ELEVEN_LABS_API_KEY='your_key_here'")
    else:
        main()