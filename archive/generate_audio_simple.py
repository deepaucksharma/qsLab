#!/usr/bin/env python3
"""
Simple script to generate all audio files from JSON metadata
"""

import asyncio
import json
from pathlib import Path
import edge_tts

# Configuration
AUDIO_DIR = Path("audio_outputs")

# Voice mappings
VOICE_MAP = {
    'course_opening': 'en-US-ChristopherNeural',
    'instructor_introduction': 'en-US-AriaNeural',
    'episode_opening': 'en-US-JennyNeural',
    'concept_explanation': 'en-US-GuyNeural',
    'historical_context': 'en-US-GuyNeural',
    'origin_story': 'en-US-AriaNeural',
    'problem_recap': 'en-US-EricNeural',
    'paradigm_shift': 'en-US-JennyNeural',
    'technical_introduction': 'en-US-EricNeural',
    'code_walkthrough': 'en-US-EricNeural',
    'architecture_design': 'en-US-EricNeural',
    'practical_example': 'en-US-ChristopherNeural',
    'practical_configuration': 'en-US-EricNeural',
    'metric_deep_dive': 'en-US-GuyNeural',
    'new_metric_deep_dive': 'en-US-GuyNeural',
    'metrics_overview': 'en-US-EricNeural',
    'metric_taxonomy': 'en-US-EricNeural',
    'feature_introduction': 'en-US-JennyNeural',
    'new_feature_highlight': 'en-US-JennyNeural',
    'new_feature_discovery': 'en-US-AnaNeural',
    'concept_introduction': 'en-US-GuyNeural',
    'scalability_concept': 'en-US-EricNeural',
    'immutability_concept': 'en-US-EricNeural',
    'technology_comparison': 'en-US-GuyNeural',
    'decision_framework': 'en-US-EricNeural',
    'ui_walkthrough': 'en-US-AnaNeural',
    'schema_introduction': 'en-US-EricNeural',
    'advanced_customization': 'en-US-EricNeural',
    'knowledge_check': 'en-US-AnaNeural',
    'checkpoint': 'en-US-AnaNeural',
    'scenario_selection': 'en-US-AnaNeural',
    'field_mapping_exercise': 'en-US-AnaNeural',
    'simulation': 'en-US-JennyNeural'
}

async def generate_audio(text, voice, output_path):
    """Generate audio file"""
    try:
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(str(output_path))
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

async def main():
    """Process all JSON files"""
    json_files = sorted(AUDIO_DIR.glob("AUDIO_*.json"))
    
    print(f"Found {len(json_files)} JSON files")
    print("=" * 60)
    
    success_count = 0
    skip_count = 0
    
    for json_file in json_files:
        if json_file.name in ['generation_manifest.json', 'batch_generation_summary.json']:
            continue
            
        try:
            with open(json_file, 'r') as f:
                data = json.load(f)
            
            text = data.get('text', '')
            segment_type = data.get('segmentType', 'default')
            
            if not text:
                print(f"✗ {json_file.name}: No text")
                continue
            
            # Check if audio exists
            mp3_path = json_file.with_suffix('.mp3')
            wav_path = json_file.with_suffix('.wav')
            
            if mp3_path.exists():
                print(f"✓ {json_file.name}: MP3 exists")
                skip_count += 1
                continue
                
            if wav_path.exists():
                print(f"✓ {json_file.name}: WAV exists")
                skip_count += 1
                continue
            
            # Get voice
            voice = VOICE_MAP.get(segment_type, 'en-US-ChristopherNeural')
            
            print(f"→ {json_file.name}: Generating ({segment_type})...")
            
            # Generate audio
            if await generate_audio(text, voice, mp3_path):
                print(f"✓ {json_file.name}: Generated")
                success_count += 1
            else:
                print(f"✗ {json_file.name}: Failed")
                
        except Exception as e:
            print(f"✗ {json_file.name}: Error - {e}")
    
    print("\n" + "=" * 60)
    print(f"Complete! Generated: {success_count}, Skipped: {skip_count}")

if __name__ == '__main__':
    asyncio.run(main())