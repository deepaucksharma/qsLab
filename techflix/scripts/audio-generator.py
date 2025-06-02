#!/usr/bin/env python3
"""
Unified Audio Generation Script for TechFlix
Supports multiple TTS providers: Edge TTS, Google Gemini, ElevenLabs
"""

import asyncio
import os
import sys
import json
import time
from pathlib import Path
from typing import Dict, List, Optional
import argparse

# Edge TTS support
try:
    import edge_tts
    EDGE_TTS_AVAILABLE = True
except ImportError:
    EDGE_TTS_AVAILABLE = False
    print("Warning: edge-tts not installed. Run: pip install edge-tts")

# Google Gemini support
try:
    from google import genai
    from google.genai import types
    import struct
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("Warning: google-generativeai not installed. Run: pip install google-generativeai")

# Load voiceover scripts from a centralized location
VOICEOVER_SCRIPTS_PATH = Path(__file__).parent.parent / "src" / "content" / "voiceover-scripts.json"

class AudioGenerator:
    """Unified audio generator supporting multiple TTS providers"""
    
    def __init__(self, provider: str = "edge"):
        self.provider = provider.lower()
        self.scripts = self._load_scripts()
        
        # Provider configurations
        self.edge_voices = {
            "primary": {"voice": "en-US-GuyNeural", "rate": "-5%", "pitch": "-2Hz"},
            "secondary": {"voice": "en-US-AriaNeural", "rate": "-3%", "pitch": "0Hz"},
            "technical": {"voice": "en-US-ChristopherNeural", "rate": "-8%", "pitch": "-3Hz"},
            "energetic": {"voice": "en-US-JennyNeural", "rate": "+5%", "pitch": "+2Hz"}
        }
        
        self.gemini_voices = {
            "narrator": "Zephyr",
            "technical": "Charon",
            "energetic": "Puck",
            "friendly": "Kore",
            "professional": "Aoede"
        }
    
    def _load_scripts(self) -> Dict:
        """Load voiceover scripts from JSON file"""
        # If scripts file doesn't exist, use the embedded scripts
        if not VOICEOVER_SCRIPTS_PATH.exists():
            return self._get_default_scripts()
        
        with open(VOICEOVER_SCRIPTS_PATH) as f:
            return json.load(f)
    
    def _get_default_scripts(self) -> Dict:
        """Return default embedded scripts"""
        return {
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
            # Add other episodes here...
        }
    
    async def generate_edge_tts(self, text: str, voice_config: dict, output_path: str) -> bool:
        """Generate audio using Edge TTS"""
        if not EDGE_TTS_AVAILABLE:
            print("Edge TTS not available")
            return False
        
        try:
            communicate = edge_tts.Communicate(
                text,
                voice_config["voice"],
                rate=voice_config.get("rate", "-5%"),
                pitch=voice_config.get("pitch", "0Hz")
            )
            
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            await communicate.save(output_path)
            return True
        except Exception as e:
            print(f"Edge TTS Error: {str(e)}")
            return False
    
    def generate_gemini(self, text: str, voice_name: str, output_path: str) -> bool:
        """Generate audio using Google Gemini"""
        if not GEMINI_AVAILABLE:
            print("Gemini not available")
            return False
        
        api_key = os.environ.get("GEM_KEY") or os.environ.get("GEMINI_API_KEY")
        if not api_key:
            print("Gemini API key not set. Use: export GEM_KEY='your-key'")
            return False
        
        try:
            client = genai.Client(api_key=api_key)
            
            contents = [
                types.Content(
                    role="user",
                    parts=[types.Part.from_text(text=text)]
                )
            ]
            
            config = types.GenerateContentConfig(
                temperature=0.7,
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
                    chunk.candidates[0].content.parts[0].inline_data):
                    
                    inline_data = chunk.candidates[0].content.parts[0].inline_data
                    audio_data = self._convert_to_wav(inline_data.data, inline_data.mime_type)
                    
                    os.makedirs(os.path.dirname(output_path), exist_ok=True)
                    with open(output_path, 'wb') as f:
                        f.write(audio_data)
                    
                    return True
            
            return False
            
        except Exception as e:
            print(f"Gemini Error: {str(e)}")
            return False
    
    def _convert_to_wav(self, audio_data: bytes, mime_type: str) -> bytes:
        """Convert audio data to WAV format"""
        # Extract sample rate from mime type
        rate = 24000
        if mime_type:
            parts = mime_type.split(";")
            for param in parts:
                if param.strip().lower().startswith("rate="):
                    try:
                        rate = int(param.split("=", 1)[1])
                    except:
                        pass
        
        # Create WAV header
        num_channels = 1
        bits_per_sample = 16
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
    
    def select_voice(self, segment_id: str, text: str) -> tuple:
        """Select appropriate voice based on content"""
        if self.provider == "edge":
            if "intro" in segment_id or "conclusion" in segment_id:
                return "primary", self.edge_voices["primary"]
            elif "technical" in text.lower() or "metrics" in segment_id:
                return "technical", self.edge_voices["technical"]
            elif "demo" in segment_id or "action" in text.lower():
                return "energetic", self.edge_voices["energetic"]
            else:
                return "primary", self.edge_voices["primary"]
        
        else:  # Gemini
            if "intro" in segment_id or "conclusion" in segment_id:
                return "narrator", self.gemini_voices["narrator"]
            elif "technical" in text.lower() or "architecture" in segment_id:
                return "technical", self.gemini_voices["technical"]
            elif "demo" in segment_id or "action" in text.lower():
                return "energetic", self.gemini_voices["energetic"]
            else:
                return "narrator", self.gemini_voices["narrator"]
    
    async def generate_all(self, episodes: Optional[List[str]] = None, output_dir: str = "public/audio/voiceovers"):
        """Generate all voiceovers for specified episodes"""
        if episodes is None:
            episodes = list(self.scripts.keys())
        
        print(f"🎙️ {self.provider.upper()} TTS - Audio Generation")
        print("=" * 60)
        
        total_segments = sum(len(self.scripts[ep]['segments']) for ep in episodes if ep in self.scripts)
        print(f"📊 Total segments to generate: {total_segments}")
        
        generated = 0
        errors = 0
        start_time = time.time()
        
        for episode_id in episodes:
            if episode_id not in self.scripts:
                print(f"❌ Episode {episode_id} not found in scripts")
                continue
            
            episode_data = self.scripts[episode_id]
            print(f"\n📺 Episode: {episode_id} - {episode_data['title']}")
            
            # Create output directory
            ep_output_dir = Path(output_dir) / episode_id
            ep_output_dir.mkdir(parents=True, exist_ok=True)
            
            # Episode metadata
            metadata = {
                "episode_id": episode_id,
                "title": episode_data['title'],
                "generated": time.strftime("%Y-%m-%d %H:%M:%S"),
                "provider": self.provider.upper() + " TTS",
                "segments": []
            }
            
            for segment in episode_data['segments']:
                segment_id = segment['id']
                text = segment['text']
                
                # Select voice
                voice_type, voice_config = self.select_voice(segment_id, text)
                
                # Output file
                extension = "mp3" if self.provider == "edge" else "wav"
                output_file = ep_output_dir / f"{segment_id}.{extension}"
                
                print(f"   🎤 {segment_id} ({voice_type})...", end="", flush=True)
                
                # Generate audio
                success = False
                if self.provider == "edge":
                    success = await self.generate_edge_tts(text, voice_config, str(output_file))
                elif self.provider == "gemini":
                    success = self.generate_gemini(text, voice_config, str(output_file))
                
                if success:
                    print(" ✅")
                    generated += 1
                    metadata['segments'].append({
                        "id": segment_id,
                        "file": f"{segment_id}.{extension}",
                        "text": text,
                        "voice": voice_type
                    })
                else:
                    print(" ❌")
                    errors += 1
                
                # Rate limiting for API providers
                if self.provider == "gemini":
                    time.sleep(1)
            
            # Save metadata
            metadata_file = ep_output_dir / "metadata.json"
            with open(metadata_file, 'w') as f:
                json.dump(metadata, f, indent=2)
            print(f"   📋 Metadata saved: {metadata_file}")
        
        # Create master manifest
        manifest = {
            "generated": time.strftime("%Y-%m-%d %H:%M:%S"),
            "provider": self.provider.upper() + " TTS",
            "statistics": {
                "total_segments": total_segments,
                "generated": generated,
                "errors": errors,
                "duration": f"{time.time() - start_time:.1f}s"
            },
            "episodes": episodes
        }
        
        manifest_file = Path(output_dir) / "manifest.json"
        with open(manifest_file, 'w') as f:
            json.dump(manifest, f, indent=2)
        
        # Summary
        print(f"\n{'='*60}")
        print(f"✅ Generation Complete!")
        print(f"   Total: {generated}/{total_segments} segments")
        print(f"   Errors: {errors}")
        print(f"   Time: {time.time() - start_time:.1f}s")
        print(f"   Output: {output_dir}")

def main():
    parser = argparse.ArgumentParser(description='Generate audio for TechFlix episodes')
    parser.add_argument('--provider', choices=['edge', 'gemini'], default='edge',
                        help='TTS provider to use (default: edge)')
    parser.add_argument('--episodes', nargs='+', help='Specific episodes to generate')
    parser.add_argument('--output', default='public/audio/voiceovers',
                        help='Output directory (default: public/audio/voiceovers)')
    parser.add_argument('--list-episodes', action='store_true',
                        help='List available episodes')
    
    args = parser.parse_args()
    
    generator = AudioGenerator(provider=args.provider)
    
    if args.list_episodes:
        print("Available episodes:")
        for ep_id, ep_data in generator.scripts.items():
            print(f"  {ep_id}: {ep_data['title']}")
        return
    
    # Run generation
    asyncio.run(generator.generate_all(
        episodes=args.episodes,
        output_dir=args.output
    ))

if __name__ == "__main__":
    main()