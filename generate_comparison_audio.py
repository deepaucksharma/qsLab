#!/usr/bin/env python3
"""
Generate multiple sets of audio files using different TTS approaches for comparison
"""

import os
import sys
import json
import time
import shutil
import subprocess
from pathlib import Path
from datetime import datetime

# Configuration
AUDIO_OUTPUT_DIR = Path("audio_outputs")
COMPARISON_DIR = Path("audio_comparison")
COMPARISON_DIR.mkdir(exist_ok=True)

# Sample segments for comparison
SAMPLE_SEGMENTS = [
    {
        "id": "SEG00_01_WELCOME",
        "type": "course_opening",
        "text": "Welcome to the Kafka Monitoring with Share Groups course! I'm excited to guide you through this comprehensive journey into advanced Kafka monitoring concepts."
    },
    {
        "id": "SEG01_01_TECHNICAL",
        "type": "technical_introduction", 
        "text": "Kafka's architecture consists of brokers, topics, partitions, and consumer groups. Each component plays a crucial role in the distributed messaging system."
    },
    {
        "id": "SEG01_02_CONCEPT",
        "type": "concept_explanation",
        "text": "Share Groups represent a paradigm shift in how we think about message consumption. Unlike traditional consumer groups, they enable multiple consumers to share the same messages dynamically."
    },
    {
        "id": "SEG02_01_METRICS",
        "type": "metrics_overview",
        "text": "Key metrics to monitor include consumer lag, partition distribution, and rebalance frequency. These indicators help maintain optimal cluster performance."
    },
    {
        "id": "SEG03_01_CODE",
        "type": "code_walkthrough",
        "text": "Let's examine the code implementation. First, we initialize the consumer with the new share group configuration, then we process messages using the acknowledgment API."
    }
]

def check_app_running(port=5000):
    """Check if Flask app is running"""
    import requests
    try:
        response = requests.get(f"http://localhost:{port}/api/health", timeout=5)
        data = response.json()
        return response.status_code == 200, data
    except:
        return False, None

def generate_with_gtts():
    """Generate audio using Google TTS (simple, fast)"""
    print("\n" + "="*60)
    print("GENERATING WITH GOOGLE TTS (gTTS)")
    print("="*60)
    
    try:
        from gtts import gTTS
    except ImportError:
        print("Installing gTTS...")
        subprocess.run([sys.executable, "-m", "pip", "install", "gtts"], check=True)
        from gtts import gTTS
    
    output_dir = COMPARISON_DIR / "gtts"
    output_dir.mkdir(exist_ok=True)
    
    for segment in SAMPLE_SEGMENTS:
        print(f"Generating {segment['id']}...")
        tts = gTTS(text=segment['text'], lang='en', slow=False)
        output_path = output_dir / f"{segment['id']}.mp3"
        tts.save(str(output_path))
        print(f"✓ Saved to {output_path}")
    
    # Get total size
    total_size = sum(f.stat().st_size for f in output_dir.glob("*.mp3"))
    print(f"\nTotal size: {total_size / 1024:.2f} KB")
    return output_dir

def generate_with_pyttsx3():
    """Generate audio using pyttsx3 (offline, multiple voices)"""
    print("\n" + "="*60)
    print("GENERATING WITH PYTTSX3 (Offline)")
    print("="*60)
    
    try:
        import pyttsx3
    except ImportError:
        print("Installing pyttsx3...")
        subprocess.run([sys.executable, "-m", "pip", "install", "pyttsx3"], check=True)
        import pyttsx3
    
    output_dir = COMPARISON_DIR / "pyttsx3"
    output_dir.mkdir(exist_ok=True)
    
    engine = pyttsx3.init()
    
    # Get available voices
    voices = engine.getProperty('voices')
    print(f"Available voices: {len(voices)}")
    
    # Try different voices for different segment types
    voice_map = {
        'course_opening': 0,  # First voice
        'technical_introduction': min(1, len(voices)-1),  # Second voice if available
        'concept_explanation': 0,
        'metrics_overview': min(1, len(voices)-1),
        'code_walkthrough': 0
    }
    
    for segment in SAMPLE_SEGMENTS:
        print(f"Generating {segment['id']}...")
        
        # Set voice based on segment type
        voice_idx = voice_map.get(segment['type'], 0)
        if voice_idx < len(voices):
            engine.setProperty('voice', voices[voice_idx].id)
            print(f"  Using voice: {voices[voice_idx].name}")
        
        # Set rate based on segment type
        if segment['type'] == 'course_opening':
            engine.setProperty('rate', 180)  # Slightly faster
        elif segment['type'] == 'concept_explanation':
            engine.setProperty('rate', 150)  # Slower for clarity
        else:
            engine.setProperty('rate', 165)  # Normal
        
        output_path = output_dir / f"{segment['id']}.wav"
        engine.save_to_file(segment['text'], str(output_path))
        engine.runAndWait()
        print(f"✓ Saved to {output_path}")
    
    # Get total size
    total_size = sum(f.stat().st_size for f in output_dir.glob("*.wav"))
    print(f"\nTotal size: {total_size / 1024:.2f} KB")
    return output_dir

def generate_with_edge_tts():
    """Generate audio using Edge TTS (Microsoft voices, high quality)"""
    print("\n" + "="*60)
    print("GENERATING WITH EDGE TTS (Microsoft)")
    print("="*60)
    
    try:
        import edge_tts
    except ImportError:
        print("Installing edge-tts...")
        subprocess.run([sys.executable, "-m", "pip", "install", "edge-tts"], check=True)
        import edge_tts
    
    output_dir = COMPARISON_DIR / "edge_tts"
    output_dir.mkdir(exist_ok=True)
    
    # Voice selection based on segment type
    voice_map = {
        'course_opening': 'en-US-AriaNeural',  # Female, friendly
        'technical_introduction': 'en-US-GuyNeural',  # Male, professional
        'concept_explanation': 'en-US-JennyNeural',  # Female, clear
        'metrics_overview': 'en-US-AriaNeural',
        'code_walkthrough': 'en-US-GuyNeural'
    }
    
    import asyncio
    
    async def generate_segment(segment):
        voice = voice_map.get(segment['type'], 'en-US-AriaNeural')
        print(f"Generating {segment['id']} with voice {voice}...")
        
        communicate = edge_tts.Communicate(segment['text'], voice)
        output_path = output_dir / f"{segment['id']}.mp3"
        await communicate.save(str(output_path))
        print(f"✓ Saved to {output_path}")
    
    async def generate_all():
        tasks = [generate_segment(segment) for segment in SAMPLE_SEGMENTS]
        await asyncio.gather(*tasks)
    
    # Run async generation
    asyncio.run(generate_all())
    
    # Get total size
    total_size = sum(f.stat().st_size for f in output_dir.glob("*.mp3"))
    print(f"\nTotal size: {total_size / 1024:.2f} KB")
    return output_dir

def generate_with_local_tts():
    """Generate using local TTS if app.py is running"""
    print("\n" + "="*60)
    print("GENERATING WITH LOCAL TTS (Tacotron2/XTTS)")
    print("="*60)
    
    is_running, health = check_app_running()
    if not is_running:
        print("✗ Local TTS server not running. Start with: python app.py")
        return None
    
    tts_status = health.get('services', {}).get('tts', {}).get('status', 'unknown')
    if tts_status == 'unavailable':
        print("✗ TTS is unavailable in the running server")
        return None
    
    print(f"✓ TTS available: {health['services']['tts']['model']}")
    
    output_dir = COMPARISON_DIR / "local_tts"
    output_dir.mkdir(exist_ok=True)
    
    import requests
    
    # Voice selection based on segment type
    voice_map = {
        'course_opening': 'enthusiastic',
        'technical_introduction': 'instructor_male',
        'concept_explanation': 'calm_explainer',
        'metrics_overview': 'instructor_female',
        'code_walkthrough': 'instructor_male'
    }
    
    for segment in SAMPLE_SEGMENTS:
        voice = voice_map.get(segment['type'], 'default')
        print(f"Generating {segment['id']} with voice {voice}...")
        
        # Request audio generation
        response = requests.post('http://localhost:5000/api/generate-segment-audio', json={
            'segmentId': segment['id'],
            'text': segment['text'],
            'voice': voice,
            'language': 'en'
        })
        
        if response.status_code == 202:
            task_id = response.json()['taskId']
            
            # Poll for completion
            for _ in range(30):
                status_response = requests.get(f'http://localhost:5000/api/audio-status/{task_id}')
                if status_response.status_code == 200:
                    status = status_response.json()
                    if status['status'] == 'completed':
                        # Download audio
                        audio_url = f"http://localhost:5000{status['audio_url']}"
                        audio_response = requests.get(audio_url)
                        output_path = output_dir / f"{segment['id']}.wav"
                        with open(output_path, 'wb') as f:
                            f.write(audio_response.content)
                        print(f"✓ Saved to {output_path}")
                        break
                    elif status['status'] == 'failed':
                        print(f"✗ Failed: {status.get('error', 'Unknown error')}")
                        break
                time.sleep(2)
        else:
            print(f"✗ Failed to queue generation")
    
    # Get total size
    total_size = sum(f.stat().st_size for f in output_dir.glob("*.wav"))
    print(f"\nTotal size: {total_size / 1024:.2f} KB")
    return output_dir

def create_comparison_report():
    """Create a comparison report of all generated audio"""
    print("\n" + "="*60)
    print("AUDIO COMPARISON REPORT")
    print("="*60)
    
    report = {
        "generated_at": datetime.now().isoformat(),
        "segments": len(SAMPLE_SEGMENTS),
        "engines": {}
    }
    
    for engine_dir in COMPARISON_DIR.iterdir():
        if engine_dir.is_dir():
            audio_files = list(engine_dir.glob("*.mp3")) + list(engine_dir.glob("*.wav"))
            if audio_files:
                total_size = sum(f.stat().st_size for f in audio_files)
                report["engines"][engine_dir.name] = {
                    "files": len(audio_files),
                    "total_size_kb": round(total_size / 1024, 2),
                    "avg_size_kb": round(total_size / 1024 / len(audio_files), 2),
                    "format": audio_files[0].suffix
                }
                
                print(f"\n{engine_dir.name.upper()}:")
                print(f"  Files: {len(audio_files)}")
                print(f"  Total size: {total_size / 1024:.2f} KB")
                print(f"  Average size: {total_size / 1024 / len(audio_files):.2f} KB")
                print(f"  Format: {audio_files[0].suffix}")
    
    # Save report
    report_path = COMPARISON_DIR / "comparison_report.json"
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\nReport saved to: {report_path}")
    print(f"\nAll audio files are in: {COMPARISON_DIR.absolute()}")
    
    # Create HTML player for easy comparison
    create_html_player()

def create_html_player():
    """Create an HTML file to easily compare audio files"""
    html_content = """<!DOCTYPE html>
<html>
<head>
    <title>TTS Audio Comparison</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
        .segment { margin: 30px 0; padding: 20px; background: #f9f9f9; border-radius: 8px; }
        .segment h2 { color: #555; margin: 0 0 10px 0; }
        .segment-text { font-style: italic; color: #666; margin: 10px 0; padding: 10px; background: white; border-left: 3px solid #ddd; }
        .engine { margin: 15px 0; padding: 15px; background: white; border-radius: 5px; border: 1px solid #e0e0e0; }
        .engine h3 { color: #333; margin: 0 0 10px 0; font-size: 16px; }
        audio { width: 100%; margin: 5px 0; }
        .info { font-size: 12px; color: #999; }
    </style>
</head>
<body>
    <div class="container">
        <h1>TTS Audio Comparison</h1>
        <p style="text-align: center; color: #666;">Compare different Text-to-Speech engines side by side</p>
"""

    for segment in SAMPLE_SEGMENTS:
        html_content += f"""
        <div class="segment">
            <h2>{segment['id']} - {segment['type'].replace('_', ' ').title()}</h2>
            <div class="segment-text">{segment['text']}</div>
"""
        
        for engine_dir in sorted(COMPARISON_DIR.iterdir()):
            if engine_dir.is_dir():
                audio_files = list(engine_dir.glob(f"{segment['id']}.*"))
                if audio_files:
                    audio_file = audio_files[0]
                    rel_path = audio_file.relative_to(COMPARISON_DIR)
                    size_kb = audio_file.stat().st_size / 1024
                    
                    html_content += f"""
            <div class="engine">
                <h3>{engine_dir.name.upper().replace('_', ' ')}</h3>
                <audio controls>
                    <source src="{rel_path}" type="audio/{audio_file.suffix[1:]}">
                    Your browser does not support the audio element.
                </audio>
                <div class="info">Format: {audio_file.suffix} | Size: {size_kb:.1f} KB</div>
            </div>
"""
        
        html_content += """
        </div>
"""

    html_content += """
    </div>
</body>
</html>"""

    player_path = COMPARISON_DIR / "comparison_player.html"
    with open(player_path, 'w') as f:
        f.write(html_content)
    
    print(f"\nHTML player created: {player_path}")
    print("Open this file in a web browser to compare audio quality")

def main():
    """Main function to generate all comparison audio"""
    print("="*60)
    print("TTS AUDIO COMPARISON GENERATOR")
    print("="*60)
    print(f"Generating {len(SAMPLE_SEGMENTS)} sample segments with multiple TTS engines")
    
    # 1. Google TTS (simple, cloud-based)
    try:
        generate_with_gtts()
    except Exception as e:
        print(f"✗ gTTS failed: {e}")
    
    # 2. pyttsx3 (offline, system voices)
    try:
        generate_with_pyttsx3()
    except Exception as e:
        print(f"✗ pyttsx3 failed: {e}")
    
    # 3. Edge TTS (Microsoft neural voices)
    try:
        generate_with_edge_tts()
    except Exception as e:
        print(f"✗ Edge TTS failed: {e}")
    
    # 4. Local TTS (if available)
    try:
        generate_with_local_tts()
    except Exception as e:
        print(f"✗ Local TTS failed: {e}")
    
    # Create comparison report
    create_comparison_report()

if __name__ == "__main__":
    main()