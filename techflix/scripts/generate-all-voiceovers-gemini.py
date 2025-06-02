#!/usr/bin/env python3
"""
Generate all S2E1 voiceovers using Google Gemini TTS API
Requires: pip install google-genai
"""

import base64
import mimetypes
import os
import re
import struct
import json
import time
from pathlib import Path
from google import genai
from google.genai import types

# Get API key from environment
# Try multiple possible key names
GEMINI_API_KEY = os.environ.get("GEM_KEY") or os.environ.get("GEMINI_API_KEY")

# All voiceover scripts (same as ElevenLabs)
VOICEOVER_SCRIPTS = {
    "evolution": {
        "segments": [
            {
                "id": "evolution-intro",
                "text": "In 2011, LinkedIn faced a crisis. Their monolithic architecture was crumbling under the weight of 175 million users. They needed something revolutionary."
            },
            {
                "id": "evolution-birth",
                "text": "Enter Apache Kafka. Named after the author Franz Kafka, it promised to untangle the complexities of distributed data streaming. But the journey from version 0.7 to today's 4.0 would be nothing short of transformative."
            },
            {
                "id": "evolution-early-days",
                "text": "The early days were humble. Version 0.8 brought replication. Version 0.9 introduced the new consumer API. Each release solved problems, but also revealed new limitations. The most persistent? The rigid coupling between partitions and consumers."
            },
            {
                "id": "evolution-growth",
                "text": "As Kafka grew from handling millions to trillions of messages daily, this limitation became a bottleneck. Companies like Uber, Netflix, and Airbnb pushed Kafka to its limits, exposing the need for a fundamental rethink."
            },
            {
                "id": "evolution-transformation",
                "text": "By 2019, Kafka processed over 7 trillion messages per day at LinkedIn alone. The platform that started as a simple message queue had become the nervous system of the modern internet."
            }
        ]
    },
    "bottleneck": {
        "segments": [
            {
                "id": "bottleneck-intro",
                "text": "But success brought challenges. The partition-consumer coupling that once provided simplicity now created complexity at scale."
            },
            {
                "id": "bottleneck-cost",
                "text": "Rebalancing became a nightmare. A single consumer failure could trigger cascading rebalances, causing service disruptions lasting minutes or even hours."
            },
            {
                "id": "bottleneck-real-world",
                "text": "At Uber, during peak hours, a rebalancing event in their payment processing system could delay thousands of transactions. The cost wasn't just technical—it was measured in lost revenue and user trust."
            },
            {
                "id": "bottleneck-attempts",
                "text": "Teams tried workarounds: over-provisioning consumers, complex partition strategies, custom rebalancing algorithms. But these were band-aids on a fundamental architectural limitation."
            },
            {
                "id": "bottleneck-demo-1",
                "text": "Watch what happens in a traditional consumer group when we lose a consumer. Notice the rebalancing storm, the processing pause, the cascading delays."
            }
        ]
    },
    "share-groups": {
        "segments": [
            {
                "id": "sharegroups-revelation",
                "text": "Then came the revelation: What if consumers could share partitions dynamically? No ownership. No rebalancing. Just pure, efficient message distribution. This was the genesis of Share Groups."
            },
            {
                "id": "sharegroups-architecture",
                "text": "Share Groups introduce a paradigm shift. Messages are distributed among available consumers on-demand. If a consumer fails, others immediately pick up the slack. No coordination. No downtime."
            },
            {
                "id": "sharegroups-how-it-works",
                "text": "Here's the magic: Each message gets a delivery count. Failed messages are automatically retried. Successful processing is acknowledged. It's queuing done right, with Kafka's scale and reliability."
            },
            {
                "id": "sharegroups-benefits",
                "text": "The benefits are immediate: 90% reduction in rebalancing events. Near-zero downtime during scaling. Automatic load distribution. And perhaps most importantly—predictable performance under failure conditions."
            },
            {
                "id": "sharegroups-demo",
                "text": "Now watch Share Groups in action. Same scenario—we lose a consumer. But look: no rebalancing, no pause, just seamless redistribution. This is the future of stream processing."
            },
            {
                "id": "sharegroups-paradigm-shift",
                "text": "Share Groups aren't just an improvement—they're a fundamental reimagining of how we think about stream processing. The question isn't whether to adopt them, but how quickly you can."
            }
        ]
    },
    "impact": {
        "segments": [
            {
                "id": "impact-intro",
                "text": "The impact was immediate and profound. Early adopters reported 90% reduction in rebalancing events."
            },
            {
                "id": "impact-metrics",
                "text": "Processing latency dropped from seconds to milliseconds. Systems that struggled with 10,000 messages per second now handled 100,000 with ease. Share Groups didn't just solve the problem—they redefined what was possible."
            },
            {
                "id": "impact-case-1",
                "text": "A major financial institution reduced their transaction processing time by 85%. What once took minutes during peak load now completed in seconds."
            },
            {
                "id": "impact-case-2",
                "text": "An e-commerce giant eliminated Black Friday outages. Their order processing system, previously their Achilles' heel, became their competitive advantage."
            },
            {
                "id": "impact-conclusion",
                "text": "Kafka 4.0 with Share Groups isn't just an upgrade—it's a revolution. The future of event streaming has arrived, and it's more powerful than we ever imagined."
            }
        ]
    }
}

# Available Gemini voices
GEMINI_VOICES = [
    "Zephyr",  # Default, versatile
    "Puck",    # Energetic, youthful
    "Charon",  # Deep, authoritative
    "Kore",    # Warm, friendly female
    "Fenrir",  # Bold, confident
    "Aoede"    # Clear, professional female
]

def save_binary_file(file_name, data):
    """Save binary audio data to file"""
    os.makedirs(os.path.dirname(file_name), exist_ok=True)
    with open(file_name, "wb") as f:
        f.write(data)
    return True

def convert_to_wav(audio_data: bytes, mime_type: str) -> bytes:
    """Convert audio data to WAV format with proper header"""
    parameters = parse_audio_mime_type(mime_type)
    bits_per_sample = parameters["bits_per_sample"]
    sample_rate = parameters["rate"]
    num_channels = 1
    data_size = len(audio_data)
    bytes_per_sample = bits_per_sample // 8
    block_align = num_channels * bytes_per_sample
    byte_rate = sample_rate * block_align
    chunk_size = 36 + data_size

    header = struct.pack(
        "<4sI4s4sIHHIIHH4sI",
        b"RIFF",          # ChunkID
        chunk_size,       # ChunkSize
        b"WAVE",          # Format
        b"fmt ",          # Subchunk1ID
        16,               # Subchunk1Size
        1,                # AudioFormat (PCM)
        num_channels,     # NumChannels
        sample_rate,      # SampleRate
        byte_rate,        # ByteRate
        block_align,      # BlockAlign
        bits_per_sample,  # BitsPerSample
        b"data",          # Subchunk2ID
        data_size         # Subchunk2Size
    )
    return header + audio_data

def parse_audio_mime_type(mime_type: str) -> dict[str, int]:
    """Parse audio parameters from MIME type"""
    bits_per_sample = 16
    rate = 24000
    
    parts = mime_type.split(";")
    for param in parts:
        param = param.strip()
        if param.lower().startswith("rate="):
            try:
                rate = int(param.split("=", 1)[1])
            except (ValueError, IndexError):
                pass
        elif param.startswith("audio/L"):
            try:
                bits_per_sample = int(param.split("L", 1)[1])
            except (ValueError, IndexError):
                pass
    
    return {"bits_per_sample": bits_per_sample, "rate": rate}

def generate_audio(text, voice_name, output_path):
    """Generate audio using Gemini API"""
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        model = "gemini-2.0-flash-preview-tts"
        
        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=text)]
            )
        ]
        
        generate_content_config = types.GenerateContentConfig(
            temperature=0.7,  # Slightly lower for consistent narration
            response_modalities=["audio"],
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(
                        voice_name=voice_name
                    )
                )
            )
        )
        
        # Generate audio
        audio_data = None
        mime_type = None
        
        for chunk in client.models.generate_content_stream(
            model=model,
            contents=contents,
            config=generate_content_config,
        ):
            if (chunk.candidates and 
                chunk.candidates[0].content and 
                chunk.candidates[0].content.parts and
                chunk.candidates[0].content.parts[0].inline_data):
                
                inline_data = chunk.candidates[0].content.parts[0].inline_data
                if inline_data.data:
                    audio_data = inline_data.data
                    mime_type = inline_data.mime_type
                    break
        
        if audio_data:
            # Convert to WAV if needed
            if not mime_type or "wav" not in mime_type:
                audio_data = convert_to_wav(audio_data, mime_type or "audio/L16;rate=24000")
                output_path = output_path.replace('.mp3', '.wav')
            
            save_binary_file(output_path, audio_data)
            return True, output_path
        else:
            return False, None
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return False, None

def main():
    print("🎙️ Google Gemini S2E1 Voiceover Generation")
    print("=" * 50)
    
    # Check API key
    if not GEMINI_API_KEY:
        print("❌ Gemini API key not set!")
        print("   Set it with: export GEM_KEY='your-key-here'")
        print("   Or add GEM_KEY to your .env file")
        return
    
    # Output directory
    output_base = Path("public/audio/voiceovers/s2e1-gemini")
    
    # Select voice (using Zephyr as default narrator)
    voice_name = "Zephyr"  # Professional, clear voice
    
    print(f"\n✅ Selected voice: {voice_name}")
    print(f"   Available voices: {', '.join(GEMINI_VOICES)}")
    
    # Generate all voiceovers
    total_segments = sum(len(scene['segments']) for scene in VOICEOVER_SCRIPTS.values())
    generated = 0
    errors = 0
    
    print(f"\n📊 Generating {total_segments} voiceover segments...")
    
    metadata = {
        "generated": time.strftime("%Y-%m-%d %H:%M:%S"),
        "provider": "Google Gemini",
        "model": "gemini-2.0-flash-preview-tts",
        "voice": voice_name,
        "segments": []
    }
    
    for scene_name, scene_data in VOICEOVER_SCRIPTS.items():
        print(f"\n📁 Scene: {scene_name}")
        
        for segment in scene_data['segments']:
            segment_id = segment['id']
            text = segment['text']
            
            # Create output path
            output_file = output_base / f"{segment_id}.wav"
            
            print(f"   🎤 {segment_id}...", end="", flush=True)
            
            # Generate audio
            success, final_path = generate_audio(text, voice_name, str(output_file))
            
            if success:
                print(" ✅")
                generated += 1
                
                # Add to metadata
                metadata['segments'].append({
                    "id": segment_id,
                    "file": os.path.basename(final_path),
                    "text": text,
                    "scene": scene_name,
                    "format": "wav"
                })
            else:
                print(" ❌")
                errors += 1
            
            # Small delay to avoid rate limiting
            time.sleep(1)
    
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
    
    # Create comparison script
    comparison_script = output_base / "compare_voices.py"
    with open(comparison_script, 'w') as f:
        f.write("""#!/usr/bin/env python3
# Quick script to generate samples with different Gemini voices
import os
os.environ['GEMINI_API_KEY'] = os.environ.get('GEMINI_API_KEY', '')

from generate_all_voiceovers_gemini import generate_audio, GEMINI_VOICES

test_text = "Share Groups introduce a paradigm shift in Apache Kafka."

for voice in GEMINI_VOICES:
    print(f"Generating with {voice}...")
    generate_audio(test_text, voice, f"sample_{voice.lower()}.wav")
""")
    
    print(f"\n💡 To test different voices, run: python {comparison_script}")

if __name__ == "__main__":
    main()