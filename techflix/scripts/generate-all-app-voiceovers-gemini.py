#!/usr/bin/env python3
"""
Generate ALL voiceovers for the entire TechFlix app using Google Gemini TTS
This includes all episodes, seasons, and segments
"""

import os
import json
import time
import struct
from pathlib import Path
from google import genai
from google.genai import types

# Get API key from environment
GEMINI_API_KEY = os.environ.get("GEM_KEY") or os.environ.get("GEMINI_API_KEY")

# Complete voiceover scripts for all episodes
ALL_VOICEOVER_SCRIPTS = {
    "s1e1": {
        "title": "Breaking the Partition Barrier",
        "segments": [
            {
                "id": "intro",
                "text": "Welcome to Tech Insights. Today, we're diving deep into Apache Kafka's revolutionary Share Groups feature that's changing how we think about distributed messaging."
            },
            {
                "id": "problem-statement",
                "text": "For years, Kafka's partition-consumer model served us well. But as systems scaled to millions of messages per second, the cracks began to show. Rebalancing storms, processing delays, and operational nightmares became the norm."
            },
            {
                "id": "solution-intro",
                "text": "Enter Share Groups: Kafka's answer to the queue versus stream dilemma. By allowing multiple consumers to share partition access dynamically, we eliminate the biggest pain points of traditional consumer groups."
            }
        ]
    },
    "s1e2": {
        "title": "Performance Metrics Deep Dive",
        "segments": [
            {
                "id": "metrics-intro",
                "text": "Performance isn't just about speed—it's about consistency, reliability, and scalability. Today, we'll explore the metrics that matter when evaluating your Kafka deployment."
            },
            {
                "id": "latency-analysis",
                "text": "Latency tells a story. From producer acknowledgment to consumer processing, every millisecond counts. Share Groups reduce end-to-end latency by up to 73% in high-throughput scenarios."
            },
            {
                "id": "throughput-gains",
                "text": "Traditional consumer groups hit a wall at scale. Share Groups break through, achieving linear scalability up to hundreds of consumers per topic."
            }
        ]
    },
    "s2e1": {
        "title": "Kafka Share Groups",
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
            },
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
            },
            {
                "id": "share-groups-revelation",
                "text": "Then came the revelation: What if consumers could share partitions dynamically? No ownership. No rebalancing. Just pure, efficient message distribution. This was the genesis of Share Groups."
            },
            {
                "id": "share-groups-architecture",
                "text": "Share Groups introduce a paradigm shift. Messages are distributed among available consumers on-demand. If a consumer fails, others immediately pick up the slack. No coordination. No downtime."
            },
            {
                "id": "share-groups-how-it-works",
                "text": "Here's the magic: Each message gets a delivery count. Failed messages are automatically retried. Successful processing is acknowledged. It's queuing done right, with Kafka's scale and reliability."
            },
            {
                "id": "share-groups-benefits",
                "text": "The benefits are immediate: 90% reduction in rebalancing events. Near-zero downtime during scaling. Automatic load distribution. And perhaps most importantly—predictable performance under failure conditions."
            },
            {
                "id": "share-groups-demo",
                "text": "Now watch Share Groups in action. Same scenario—we lose a consumer. But look: no rebalancing, no pause, just seamless redistribution. This is the future of stream processing."
            },
            {
                "id": "share-groups-paradigm-shift",
                "text": "Share Groups aren't just an improvement—they're a fundamental reimagining of how we think about stream processing. The question isn't whether to adopt them, but how quickly you can."
            },
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
    },
    "s2e2": {
        "title": "JMX Exploration",
        "segments": [
            {
                "id": "jmx-intro",
                "text": "Java Management Extensions, or JMX, is the unsung hero of Kafka monitoring. Today, we'll unlock its full potential for deep observability."
            },
            {
                "id": "mbeans-explained",
                "text": "MBeans are the building blocks of JMX monitoring. Each Kafka component exposes dozens of metrics through MBeans, from broker health to consumer lag."
            },
            {
                "id": "metric-categories",
                "text": "Kafka metrics fall into five key categories: broker metrics, producer metrics, consumer metrics, connect metrics, and streams metrics. Understanding each is crucial for comprehensive monitoring."
            }
        ]
    },
    "s2e3": {
        "title": "Prometheus Setup",
        "segments": [
            {
                "id": "prometheus-intro",
                "text": "Prometheus has become the de facto standard for cloud-native monitoring. Let's set up a production-grade Prometheus stack for Kafka monitoring."
            },
            {
                "id": "exporters-config",
                "text": "The JMX Exporter is your bridge between Kafka's JMX metrics and Prometheus. Proper configuration is key to capturing the metrics that matter without overwhelming your system."
            },
            {
                "id": "alerting-rules",
                "text": "Effective alerting separates signal from noise. We'll build alert rules that catch real issues while avoiding alert fatigue."
            }
        ]
    },
    "s2e4": {
        "title": "Custom OHI Development",
        "segments": [
            {
                "id": "ohi-intro",
                "text": "New Relic's Open Host Integration framework lets you bring any data source into the platform. Today, we'll build a custom integration for Kafka Share Groups."
            },
            {
                "id": "data-model",
                "text": "Understanding New Relic's data model is crucial. Events, metrics, logs, and traces—each has its place in telling your Kafka story."
            },
            {
                "id": "implementation",
                "text": "From metric collection to data transformation, we'll implement a production-ready OHI that captures the unique aspects of Share Groups monitoring."
            }
        ]
    },
    "s3e3": {
        "title": "Series Finale",
        "segments": [
            {
                "id": "recap",
                "text": "From LinkedIn's crisis to Kafka's transformation, from JMX basics to advanced monitoring—we've covered incredible ground. But this is just the beginning."
            },
            {
                "id": "future-vision",
                "text": "The future of event streaming is bright. With Share Groups, advanced monitoring, and AI-driven operations, we're entering a new era of distributed systems."
            },
            {
                "id": "closing",
                "text": "Thank you for joining us on this journey through the evolution of Apache Kafka. The knowledge you've gained isn't just technical—it's transformational. Now go forth and build amazing things."
            }
        ]
    }
}

# Gemini voice options
VOICE_CONFIGS = {
    "narrator": "Zephyr",      # Professional, clear narrator voice
    "technical": "Charon",     # Deep, authoritative for technical content
    "energetic": "Puck",       # Energetic for exciting moments
    "friendly": "Kore",        # Warm, friendly female voice
    "professional": "Aoede"    # Clear, professional female voice
}

def convert_to_wav(audio_data: bytes, mime_type: str) -> bytes:
    """Convert audio data to WAV format with proper header"""
    # Parse audio parameters
    bits_per_sample = 16
    rate = 24000
    
    if mime_type:
        parts = mime_type.split(";")
        for param in parts:
            param = param.strip()
            if param.lower().startswith("rate="):
                try:
                    rate = int(param.split("=", 1)[1])
                except:
                    pass
    
    # Create WAV header
    num_channels = 1
    data_size = len(audio_data)
    bytes_per_sample = bits_per_sample // 8
    block_align = num_channels * bytes_per_sample
    byte_rate = rate * block_align
    chunk_size = 36 + data_size
    
    header = struct.pack(
        "<4sI4s4sIHHIIHH4sI",
        b"RIFF", chunk_size, b"WAVE", b"fmt ", 16, 1,
        num_channels, rate, byte_rate, block_align,
        bits_per_sample, b"data", data_size
    )
    return header + audio_data

def generate_audio(text, voice_name, output_path, temperature=0.7):
    """Generate audio using Gemini API"""
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        
        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=text)]
            )
        ]
        
        config = types.GenerateContentConfig(
            temperature=temperature,
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
        for chunk in client.models.generate_content_stream(
            model="gemini-2.0-flash-preview-tts",
            contents=contents,
            config=config,
        ):
            if (chunk.candidates and 
                chunk.candidates[0].content and 
                chunk.candidates[0].content.parts and
                chunk.candidates[0].content.parts[0].inline_data and
                chunk.candidates[0].content.parts[0].inline_data.data):
                
                inline_data = chunk.candidates[0].content.parts[0].inline_data
                audio_data = inline_data.data
                mime_type = inline_data.mime_type
                
                # Convert to WAV
                wav_data = convert_to_wav(audio_data, mime_type)
                
                # Save file
                os.makedirs(os.path.dirname(output_path), exist_ok=True)
                with open(output_path, 'wb') as f:
                    f.write(wav_data)
                
                return True
        
        return False
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def select_voice_for_content(segment_id, text):
    """Select appropriate voice based on content type"""
    # Use different voices for variety
    if "intro" in segment_id or "conclusion" in segment_id:
        return VOICE_CONFIGS["narrator"]
    elif "technical" in text.lower() or "architecture" in segment_id:
        return VOICE_CONFIGS["technical"]
    elif "demo" in segment_id or "action" in text.lower():
        return VOICE_CONFIGS["energetic"]
    else:
        return VOICE_CONFIGS["narrator"]

def main():
    print("🎙️ Google Gemini - Complete App Voiceover Generation")
    print("=" * 60)
    
    # Check API key
    if not GEMINI_API_KEY:
        print("❌ Gemini API key not set!")
        print("   Set it with: export GEM_KEY='your-key-here'")
        return
    
    # Count total segments
    total_segments = sum(len(ep['segments']) for ep in ALL_VOICEOVER_SCRIPTS.values())
    print(f"\n📊 Total segments to generate: {total_segments}")
    
    # Statistics
    generated = 0
    errors = 0
    start_time = time.time()
    
    # Process each episode
    for episode_id, episode_data in ALL_VOICEOVER_SCRIPTS.items():
        print(f"\n📺 Episode: {episode_id} - {episode_data['title']}")
        
        # Create output directory
        output_dir = Path(f"public/audio/voiceovers/{episode_id}")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Episode metadata
        episode_metadata = {
            "episode_id": episode_id,
            "title": episode_data['title'],
            "generated": time.strftime("%Y-%m-%d %H:%M:%S"),
            "provider": "Google Gemini",
            "model": "gemini-2.0-flash-preview-tts",
            "segments": []
        }
        
        for segment in episode_data['segments']:
            segment_id = segment['id']
            text = segment['text']
            
            # Select voice
            voice = select_voice_for_content(segment_id, text)
            
            # Output file
            output_file = output_dir / f"{segment_id}.wav"
            
            print(f"   🎤 {segment_id} ({voice})...", end="", flush=True)
            
            # Generate audio
            if generate_audio(text, voice, str(output_file)):
                print(" ✅")
                generated += 1
                
                # Add to metadata
                episode_metadata['segments'].append({
                    "id": segment_id,
                    "file": f"{segment_id}.wav",
                    "text": text,
                    "voice": voice,
                    "duration": None  # Could be calculated from WAV
                })
            else:
                print(" ❌")
                errors += 1
            
            # Rate limiting
            time.sleep(1)
        
        # Save episode metadata
        metadata_file = output_dir / "metadata.json"
        with open(metadata_file, 'w') as f:
            json.dump(episode_metadata, f, indent=2)
    
    # Create master manifest
    manifest = {
        "generated": time.strftime("%Y-%m-%d %H:%M:%S"),
        "provider": "Google Gemini",
        "statistics": {
            "total_segments": total_segments,
            "generated": generated,
            "errors": errors,
            "duration": f"{time.time() - start_time:.1f}s"
        },
        "episodes": list(ALL_VOICEOVER_SCRIPTS.keys()),
        "voices_used": list(VOICE_CONFIGS.keys())
    }
    
    manifest_file = Path("public/audio/voiceovers/manifest.json")
    with open(manifest_file, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    # Summary
    print(f"\n{'='*60}")
    print(f"✅ Generation Complete!")
    print(f"   Total: {generated}/{total_segments} segments")
    print(f"   Errors: {errors}")
    print(f"   Time: {time.time() - start_time:.1f}s")
    print(f"   Output: public/audio/voiceovers/")
    print(f"\n📁 Generated files for episodes:")
    for ep_id in ALL_VOICEOVER_SCRIPTS.keys():
        print(f"   - {ep_id}: public/audio/voiceovers/{ep_id}/")
    print(f"\n📋 Master manifest: {manifest_file}")

if __name__ == "__main__":
    main()