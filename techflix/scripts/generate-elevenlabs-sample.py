#!/usr/bin/env python3
"""
Generate sample audio using ElevenLabs API
"""

import os
import requests
import json
from pathlib import Path

# API Configuration
ELEVEN_LABS_API_KEY = os.environ.get('ELEVEN_LABS_API_KEY', 'your_api_key_here')
API_BASE_URL = "https://api.elevenlabs.io/v1"

# Sample text
SAMPLE_TEXT = """
In 2011, LinkedIn faced a crisis. Their monolithic architecture was crumbling under the weight of 175 million users. They needed something revolutionary. Enter Apache Kafka.
"""

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

def generate_audio(text, voice_id, output_path):
    """Generate audio using ElevenLabs API"""
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVEN_LABS_API_KEY
    }
    
    data = {
        "text": text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75
        }
    }
    
    response = requests.post(
        f"{API_BASE_URL}/text-to-speech/{voice_id}",
        json=data,
        headers=headers
    )
    
    if response.status_code == 200:
        with open(output_path, 'wb') as f:
            f.write(response.content)
        print(f"✅ Audio saved to: {output_path}")
        return True
    else:
        print(f"❌ Error generating audio: {response.status_code} - {response.text}")
        return False

def main():
    print("🎙️ ElevenLabs Audio Generation")
    print("=" * 40)
    
    # Create output directory
    output_dir = Path("public/audio/voiceovers/elevenlabs-samples")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Get available voices
    print("\n📋 Fetching available voices...")
    voices = get_voices()
    
    if not voices:
        print("❌ No voices available or API error")
        return
    
    print(f"\n✅ Found {len(voices)} voices:")
    for i, voice in enumerate(voices[:5]):  # Show first 5 voices
        print(f"  {i+1}. {voice['name']} - {voice.get('description', 'No description')[:50]}...")
    
    # Use the first available voice for demo
    selected_voice = voices[0]
    voice_id = selected_voice["voice_id"]
    voice_name = selected_voice["name"]
    
    print(f"\n🎯 Using voice: {voice_name}")
    print(f"\n📝 Sample text:\n{SAMPLE_TEXT[:100]}...")
    
    # Generate audio
    output_file = output_dir / f"evolution-intro-{voice_name.lower().replace(' ', '-')}.mp3"
    print(f"\n🔊 Generating audio...")
    
    if generate_audio(SAMPLE_TEXT, voice_id, output_file):
        print(f"\n✅ Success! Audio generated with {voice_name}")
        print(f"📁 File: {output_file}")
        
        # Generate comparison data
        comparison_data = {
            "provider": "ElevenLabs",
            "voice": voice_name,
            "voice_id": voice_id,
            "model": "eleven_monolingual_v1",
            "text": SAMPLE_TEXT,
            "file": str(output_file),
            "settings": {
                "stability": 0.5,
                "similarity_boost": 0.75
            }
        }
        
        # Save metadata
        metadata_file = output_dir / "metadata.json"
        with open(metadata_file, 'w') as f:
            json.dump(comparison_data, f, indent=2)
        print(f"📋 Metadata saved to: {metadata_file}")
    else:
        print("\n❌ Failed to generate audio")

if __name__ == "__main__":
    # Check if API key is provided
    if ELEVEN_LABS_API_KEY == 'your_api_key_here':
        print("⚠️  Please set your ElevenLabs API key:")
        print("   export ELEVEN_LABS_API_KEY='your_key_here'")
        print("   or edit this script and add it directly")
    else:
        main()