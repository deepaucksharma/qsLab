#!/usr/bin/env python3
"""
Generate voice-overs for S2E1: Kafka Share Groups using Microsoft Edge TTS
Requires: pip install edge-tts asyncio
"""

import asyncio
import edge_tts
import os
import json
from pathlib import Path

# Voice-over scripts
VOICEOVER_SCRIPTS = {
    "evolution": {
        "segments": [
            {
                "id": "evolution-intro",
                "text": "In 2011, LinkedIn faced a crisis. Their monolithic architecture was crumbling under the weight of 175 million users. They needed something revolutionary.",
                "voice": "en-US-GuyNeural",
                "rate": "-5%",
                "pitch": "-2Hz"
            },
            {
                "id": "evolution-birth",
                "text": "Enter Apache Kafka. Named after the author Franz Kafka, it promised to untangle the complexities of distributed data streaming. But the journey from version 0.7 to today's 4.0 would be nothing short of transformative.",
                "voice": "en-US-GuyNeural",
                "rate": "-3%",
                "pitch": "0Hz"
            },
            {
                "id": "evolution-early-days",
                "text": "The early days were humble. Version 0.8 brought replication. Version 0.9 introduced the new consumer API. Each release solved problems, but also revealed new limitations. The most persistent? The rigid coupling between partitions and consumers.",
                "voice": "en-US-GuyNeural",
                "rate": "0%",
                "pitch": "0Hz"
            },
            {
                "id": "evolution-growth",
                "text": "As Kafka grew from handling millions to trillions of messages daily, this limitation became a bottleneck. Companies like Uber, Netflix, and Airbnb pushed Kafka to its limits, exposing the need for a fundamental rethink.",
                "voice": "en-US-GuyNeural",
                "rate": "-5%",
                "pitch": "-2Hz"
            },
            {
                "id": "evolution-transformation",
                "text": "By 2019, Kafka processed over 7 trillion messages per day at LinkedIn alone. The platform that started as a simple message queue had become the nervous system of the modern internet.",
                "voice": "en-US-GuyNeural",
                "rate": "-8%",
                "pitch": "-3Hz"
            }
        ]
    },
    "bottleneck": {
        "segments": [
            {
                "id": "bottleneck-intro",
                "text": "Let's visualize the problem. In traditional Kafka consumer groups, each partition can only be consumed by one consumer at a time. Watch what happens as we scale.",
                "voice": "en-US-JennyNeural",
                "rate": "0%",
                "pitch": "0Hz"
            },
            {
                "id": "bottleneck-demo-1",
                "text": "With 3 partitions and 3 consumers, perfect balance. Each consumer processes one partition. But add a fourth consumer, and it sits idle. This is the partition barrier.",
                "voice": "en-US-JennyNeural",
                "rate": "+5%",
                "pitch": "+2Hz"
            },
            {
                "id": "bottleneck-real-world",
                "text": "In the real world, this creates massive inefficiencies. Imagine Black Friday at an e-commerce company. Traffic spikes 10x, but you can't scale beyond your partition count. Critical orders get delayed. Revenue is lost.",
                "voice": "en-US-JennyNeural",
                "rate": "+10%",
                "pitch": "+3Hz"
            },
            {
                "id": "bottleneck-attempts",
                "text": "Teams tried workarounds. Over-partitioning led to overhead. Consumer pooling added complexity. Custom solutions created technical debt. The community knew: Kafka needed a native solution.",
                "voice": "en-US-JennyNeural",
                "rate": "0%",
                "pitch": "0Hz"
            },
            {
                "id": "bottleneck-cost",
                "text": "The cost wasn't just technical. Companies reported spending millions on infrastructure, only to hit the same scaling walls. The partition limit had become Kafka's Achilles' heel.",
                "voice": "en-US-JennyNeural",
                "rate": "-5%",
                "pitch": "-2Hz"
            }
        ]
    },
    "share-groups": {
        "segments": [
            {
                "id": "sharegroups-revelation",
                "text": "In 2023, KIP-932 introduced Share Groups. The breakthrough? Decouple consumers from partitions entirely. Revolutionary simplicity.",
                "voice": "en-US-GuyNeural",
                "rate": "-10%",
                "pitch": "-3Hz"
            },
            {
                "id": "sharegroups-how-it-works",
                "text": "Share Groups transform Kafka into a true distributed queue. Messages from any partition can be delivered to any consumer. No more idle consumers. No more partition barriers. Just pure, scalable consumption.",
                "voice": "en-US-GuyNeural",
                "rate": "0%",
                "pitch": "0Hz"
            },
            {
                "id": "sharegroups-architecture",
                "text": "The architecture is elegant. A share group coordinator manages message distribution. Consumers acknowledge processing. Failed messages get redelivered. It's like having a smart load balancer built into Kafka itself.",
                "voice": "en-US-GuyNeural",
                "rate": "+3%",
                "pitch": "0Hz"
            },
            {
                "id": "sharegroups-demo",
                "text": "Watch the magic happen. Ten consumers, three partitions. All consumers stay busy. Add more consumers? They immediately start processing. Remove consumers? Work redistributes seamlessly.",
                "voice": "en-US-GuyNeural",
                "rate": "+5%",
                "pitch": "+2Hz"
            },
            {
                "id": "sharegroups-benefits",
                "text": "The benefits cascade. True elastic scaling. Simplified operations. Better resource utilization. Companies report 60% reduction in infrastructure costs and 10x improvement in scaling flexibility.",
                "voice": "en-US-GuyNeural",
                "rate": "-3%",
                "pitch": "-2Hz"
            },
            {
                "id": "sharegroups-paradigm-shift",
                "text": "This isn't just an improvement. It's a paradigm shift. Share Groups transform Kafka from a partitioned log into a cloud-native streaming platform ready for the next decade.",
                "voice": "en-US-GuyNeural",
                "rate": "-8%",
                "pitch": "-4Hz"
            }
        ]
    },
    "impact": {
        "segments": [
            {
                "id": "impact-intro",
                "text": "The impact is already reshaping the industry. Let's look at early adopters and their transformative results.",
                "voice": "en-US-AriaNeural",
                "rate": "-5%",
                "pitch": "0Hz"
            },
            {
                "id": "impact-case-1",
                "text": "A major financial institution processing payment transactions. Before Share Groups: 1000 partitions, complex consumer coordination, 15-minute peak delays. After: 100 partitions, simple scaling, sub-second processing even during peaks.",
                "voice": "en-US-AriaNeural",
                "rate": "0%",
                "pitch": "0Hz"
            },
            {
                "id": "impact-case-2",
                "text": "An e-commerce giant handling inventory updates. Share Groups enabled them to reduce their Kafka cluster size by 70% while improving throughput by 5x. Black Friday? Handled with auto-scaling, zero manual intervention.",
                "voice": "en-US-AriaNeural",
                "rate": "+3%",
                "pitch": "+2Hz"
            },
            {
                "id": "impact-metrics",
                "text": "The metrics speak volumes. 80% reduction in operational complexity. 90% improvement in resource utilization. 99.99% message delivery guarantee maintained. This is the future of event streaming.",
                "voice": "en-US-AriaNeural",
                "rate": "-3%",
                "pitch": "-2Hz"
            },
            {
                "id": "impact-conclusion",
                "text": "Share Groups represent more than a feature. They're Kafka's evolution into a truly cloud-native platform. As we move toward Kafka 5.0 and beyond, the possibilities are limitless. The future of event streaming has arrived.",
                "voice": "en-US-AriaNeural",
                "rate": "-8%",
                "pitch": "-3Hz"
            }
        ]
    }
}

async def generate_voiceover(text, voice, output_file, rate="0%", pitch="0Hz"):
    """Generate a single voice-over file"""
    # Create SSML for better control
    ssml = f'''<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
    <voice name="{voice}">
        <prosody rate="{rate}" pitch="{pitch}">
            {text}
        </prosody>
    </voice>
</speak>'''
    
    # Generate speech
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_file)
    print(f"✓ Generated: {output_file}")

async def generate_all_voiceovers():
    """Generate all voice-overs for the episode"""
    # Create output directory
    base_dir = Path(__file__).parent.parent
    output_dir = base_dir / "public" / "audio" / "voiceovers" / "s2e1"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Track metadata
    metadata = {
        "episode": "s2e1",
        "title": "Kafka Share Groups",
        "segments": []
    }
    
    # Generate all segments
    tasks = []
    for scene_name, scene_data in VOICEOVER_SCRIPTS.items():
        for segment in scene_data["segments"]:
            output_file = output_dir / f"{scene_name}-{segment['id']}.mp3"
            task = generate_voiceover(
                segment["text"],
                segment["voice"],
                str(output_file),
                segment.get("rate", "0%"),
                segment.get("pitch", "0Hz")
            )
            tasks.append(task)
            
            # Add to metadata
            metadata["segments"].append({
                "scene": scene_name,
                "id": segment["id"],
                "file": f"{scene_name}-{segment['id']}.mp3",
                "text": segment["text"],
                "voice": segment["voice"]
            })
    
    # Run all tasks
    await asyncio.gather(*tasks)
    
    # Save metadata
    metadata_file = output_dir / "metadata.json"
    with open(metadata_file, "w") as f:
        json.dump(metadata, f, indent=2)
    
    print(f"\n✅ Generated {len(tasks)} voice-over files")
    print(f"📁 Output directory: {output_dir}")
    print(f"📋 Metadata saved to: {metadata_file}")

if __name__ == "__main__":
    # Check if edge-tts is installed
    try:
        import edge_tts
    except ImportError:
        print("❌ edge-tts not installed. Run: pip install edge-tts")
        exit(1)
    
    # Run the generation
    print("🎙️ Generating voice-overs for S2E1: Kafka Share Groups...")
    asyncio.run(generate_all_voiceovers())