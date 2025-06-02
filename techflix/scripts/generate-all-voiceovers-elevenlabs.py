#!/usr/bin/env python3
"""
Generate all S2E1 voiceovers using ElevenLabs API
"""

import os
import requests
import json
import time
from pathlib import Path

# API Configuration
ELEVEN_LABS_API_KEY = os.environ.get('ELEVEN_LABS_API_KEY', 'sk_531e3c9f4969efec538df80f0034a282a22a159566dd38e1')
API_BASE_URL = "https://api.elevenlabs.io/v1"

# All voiceover scripts for S2E1
VOICEOVER_SCRIPTS = {
    "evolution": {
        "segments": [
            {
                "id": "evolution-intro",
                "text": "In 2011, LinkedIn faced a crisis. Their monolithic architecture was crumbling under the weight of 175 million users. They needed something revolutionary.",
                "rate": "-5%",
                "pitch": "-2Hz"
            },
            {
                "id": "evolution-birth",
                "text": "Enter Apache Kafka. Named after the author Franz Kafka, it promised to untangle the complexities of distributed data streaming. But the journey from version 0.7 to today's 4.0 would be nothing short of transformative.",
                "rate": "-3%",
                "pitch": "0Hz"
            },
            {
                "id": "evolution-early-days",
                "text": "The early days were humble. Version 0.8 brought replication. Version 0.9 introduced the new consumer API. Each release solved problems, but also revealed new limitations. The most persistent? The rigid coupling between partitions and consumers.",
                "rate": "0%",
                "pitch": "0Hz"
            },
            {
                "id": "evolution-growth",
                "text": "As Kafka grew from handling millions to trillions of messages daily, this limitation became a bottleneck. Companies like Uber, Netflix, and Airbnb pushed Kafka to its limits, exposing the need for a fundamental rethink.",
                "rate": "-5%",
                "pitch": "-2Hz"
            },
            {
                "id": "evolution-transformation",
                "text": "By 2019, Kafka processed over 7 trillion messages per day at LinkedIn alone. The platform that started as a simple message queue had become the nervous system of the modern internet.",
                "rate": "-8%",
                "pitch": "-3Hz"
            }
        ]
    },
    "bottleneck": {
        "segments": [
            {
                "id": "bottleneck-intro",
                "text": "But success brought challenges. The partition-consumer coupling that once provided simplicity now created complexity at scale.",
                "rate": "-5%",
                "pitch": "0Hz"
            },
            {
                "id": "bottleneck-cost",
                "text": "Rebalancing became a nightmare. A single consumer failure could trigger cascading rebalances, causing service disruptions lasting minutes or even hours.",
                "rate": "-3%",
                "pitch": "-2Hz"
            },
            {
                "id": "bottleneck-real-world",
                "text": "At Uber, during peak hours, a rebalancing event in their payment processing system could delay thousands of transactions. The cost wasn't just technical—it was measured in lost revenue and user trust.",
                "rate": "-5%",
                "pitch": "-3Hz"
            },
            {
                "id": "bottleneck-attempts",
                "text": "Teams tried workarounds: over-provisioning consumers, complex partition strategies, custom rebalancing algorithms. But these were band-aids on a fundamental architectural limitation.",
                "rate": "0%",
                "pitch": "0Hz"
            },
            {
                "id": "bottleneck-demo-1",
                "text": "Watch what happens in a traditional consumer group when we lose a consumer. Notice the rebalancing storm, the processing pause, the cascading delays.",
                "rate": "-3%",
                "pitch": "-2Hz"
            }
        ]
    },
    "share-groups": {
        "segments": [
            {
                "id": "sharegroups-revelation",
                "text": "Then came the revelation: What if consumers could share partitions dynamically? No ownership. No rebalancing. Just pure, efficient message distribution. This was the genesis of Share Groups.",
                "rate": "-5%",
                "pitch": "-2Hz"
            },
            {
                "id": "sharegroups-architecture",
                "text": "Share Groups introduce a paradigm shift. Messages are distributed among available consumers on-demand. If a consumer fails, others immediately pick up the slack. No coordination. No downtime.",
                "rate": "-3%",
                "pitch": "0Hz"
            },
            {
                "id": "sharegroups-how-it-works",
                "text": "Here's the magic: Each message gets a delivery count. Failed messages are automatically retried. Successful processing is acknowledged. It's queuing done right, with Kafka's scale and reliability.",
                "rate": "0%",
                "pitch": "0Hz"
            },
            {
                "id": "sharegroups-benefits",
                "text": "The benefits are immediate: 90% reduction in rebalancing events. Near-zero downtime during scaling. Automatic load distribution. And perhaps most importantly—predictable performance under failure conditions.",
                "rate": "-5%",
                "pitch": "-2Hz"
            },
            {
                "id": "sharegroups-demo",
                "text": "Now watch Share Groups in action. Same scenario—we lose a consumer. But look: no rebalancing, no pause, just seamless redistribution. This is the future of stream processing.",
                "rate": "-3%",
                "pitch": "-2Hz"
            },
            {
                "id": "sharegroups-paradigm-shift",
                "text": "Share Groups aren't just an improvement—they're a fundamental reimagining of how we think about stream processing. The question isn't whether to adopt them, but how quickly you can.",
                "rate": "-5%",
                "pitch": "-3Hz"
            }
        ]
    },
    "impact": {
        "segments": [
            {
                "id": "impact-intro",
                "text": "The impact was immediate and profound. Early adopters reported 90% reduction in rebalancing events.",
                "rate": "-5%",
                "pitch": "0Hz"
            },
            {
                "id": "impact-metrics",
                "text": "Processing latency dropped from seconds to milliseconds. Systems that struggled with 10,000 messages per second now handled 100,000 with ease. Share Groups didn't just solve the problem—they redefined what was possible.",
                "rate": "-3%",
                "pitch": "-2Hz"
            },
            {
                "id": "impact-case-1",
                "text": "A major financial institution reduced their transaction processing time by 85%. What once took minutes during peak load now completed in seconds.",
                "rate": "0%",
                "pitch": "0Hz"
            },
            {
                "id": "impact-case-2",
                "text": "An e-commerce giant eliminated Black Friday outages. Their order processing system, previously their Achilles' heel, became their competitive advantage.",
                "rate": "-3%",
                "pitch": "-2Hz"
            },
            {
                "id": "impact-conclusion",
                "text": "Kafka 4.0 with Share Groups isn't just an upgrade—it's a revolution. The future of event streaming has arrived, and it's more powerful than we ever imagined.",
                "rate": "-8%",
                "pitch": "-3Hz"
            }
        ]
    }
}

def get_best_voice(voices, preference="neutral"):
    """Select the best voice based on preference"""
    # Try to find specific voice characteristics
    for voice in voices:
        desc = voice.get('description', '').lower()
        name = voice['name'].lower()
        
        if preference == "professional" and ('professional' in desc or 'narrator' in desc):
            return voice
        elif preference == "warm" and ('warm' in desc or 'friendly' in desc):
            return voice
        elif preference == "authoritative" and ('authoritative' in desc or 'confident' in desc):
            return voice
    
    # Default to first available voice
    return voices[0] if voices else None

def generate_audio(text, voice_id, output_path, settings=None):
    """Generate audio using ElevenLabs API"""
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVEN_LABS_API_KEY
    }
    
    # Default settings optimized for narration
    voice_settings = settings or {
        "stability": 0.75,  # Higher for consistent narration
        "similarity_boost": 0.75,
        "style": 0.0,  # Lower for neutral narration
        "use_speaker_boost": True
    }
    
    data = {
        "text": text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": voice_settings
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/text-to-speech/{voice_id}",
            json=data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            with open(output_path, 'wb') as f:
                f.write(response.content)
            return True
        else:
            print(f"Error {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"Exception: {str(e)}")
        return False

def get_voices():
    """Get available voices from ElevenLabs"""
    headers = {
        "Accept": "application/json",
        "xi-api-key": ELEVEN_LABS_API_KEY
    }
    
    try:
        response = requests.get(f"{API_BASE_URL}/voices", headers=headers)
        if response.status_code == 200:
            return response.json()["voices"]
        else:
            print(f"Error getting voices: {response.status_code}")
            return []
    except Exception as e:
        print(f"Exception getting voices: {str(e)}")
        return []

def main():
    print("🎙️ ElevenLabs S2E1 Voiceover Generation")
    print("=" * 50)
    
    # Output directory
    output_base = Path("public/audio/voiceovers/s2e1-elevenlabs")
    
    # Get available voices
    print("\n📋 Fetching available voices...")
    voices = get_voices()
    
    if not voices:
        print("❌ No voices available. Check API key.")
        return
    
    # Select best voice for narration
    narrator_voice = get_best_voice(voices, "professional")
    if not narrator_voice:
        narrator_voice = voices[0]
    
    print(f"\n✅ Selected narrator: {narrator_voice['name']}")
    print(f"   Description: {narrator_voice.get('description', 'N/A')[:80]}...")
    
    # Generate all voiceovers
    total_segments = sum(len(scene['segments']) for scene in VOICEOVER_SCRIPTS.values())
    generated = 0
    errors = 0
    
    print(f"\n📊 Generating {total_segments} voiceover segments...")
    
    metadata = {
        "generated": time.strftime("%Y-%m-%d %H:%M:%S"),
        "provider": "ElevenLabs",
        "voice": narrator_voice['name'],
        "voice_id": narrator_voice['voice_id'],
        "model": "eleven_monolingual_v1",
        "segments": []
    }
    
    for scene_name, scene_data in VOICEOVER_SCRIPTS.items():
        print(f"\n📁 Scene: {scene_name}")
        
        for segment in scene_data['segments']:
            segment_id = segment['id']
            text = segment['text']
            
            # Create output path
            output_file = output_base / f"{segment_id}.mp3"
            
            print(f"   🎤 {segment_id}...", end="", flush=True)
            
            # Generate audio
            if generate_audio(text, narrator_voice['voice_id'], output_file):
                print(" ✅")
                generated += 1
                
                # Add to metadata
                metadata['segments'].append({
                    "id": segment_id,
                    "file": f"{segment_id}.mp3",
                    "text": text,
                    "scene": scene_name
                })
            else:
                print(" ❌")
                errors += 1
            
            # Small delay to avoid rate limiting
            time.sleep(0.5)
    
    # Save metadata
    metadata_file = output_base / "metadata.json"
    output_base.mkdir(parents=True, exist_ok=True)
    with open(metadata_file, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"\n✅ Generation complete!")
    print(f"   Generated: {generated}/{total_segments}")
    print(f"   Errors: {errors}")
    print(f"   Output: {output_base}")
    print(f"   Metadata: {metadata_file}")

if __name__ == "__main__":
    main()