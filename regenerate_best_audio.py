#!/usr/bin/env python3
"""
Regenerate all audio files using the best available TTS approach
"""

import json
import time
import subprocess
import sys
from pathlib import Path
from datetime import datetime

# Configuration
AUDIO_DIR = Path("audio_outputs")
BACKUP_DIR = Path("archive_20250531_234920/audio_outputs")
LESSONS_FILE = Path("learning_content/lessons_structure.json")

# Voice mapping for different segment types (consistent with generate_all_audio_v3.py)
SEGMENT_VOICE_MAP = {
    # Opening/Introduction segments - Enthusiastic
    'course_opening': 'enthusiastic',
    'instructor_introduction': 'instructor_female',
    'episode_opening': 'enthusiastic',
    
    # Technical/Code segments - Clear and professional
    'technical_introduction': 'instructor_male',
    'code_walkthrough': 'instructor_male',
    'architecture_design': 'instructor_male',
    'practical_example': 'instructor_male',
    'practical_configuration': 'instructor_male',
    
    # Explanation/Context - Calm and thoughtful
    'concept_explanation': 'calm_explainer',
    'historical_context': 'calm_explainer',
    'origin_story': 'calm_explainer',
    'problem_recap': 'calm_explainer',
    'paradigm_shift': 'enthusiastic',
    
    # Metrics/Data - Professional
    'metric_deep_dive': 'instructor_female',
    'new_metric_deep_dive': 'instructor_female',
    'metrics_overview': 'instructor_female',
    'metric_taxonomy': 'instructor_female',
    
    # Features/Concepts - Clear and engaging
    'feature_introduction': 'instructor_male',
    'new_feature_highlight': 'enthusiastic',
    'new_feature_discovery': 'enthusiastic',
    'concept_introduction': 'instructor_female',
    'scalability_concept': 'instructor_male',
    'immutability_concept': 'instructor_male',
    
    # UI/Schema - Professional
    'ui_walkthrough': 'instructor_female',
    'schema_introduction': 'instructor_male',
    'advanced_customization': 'instructor_male',
    
    # Assessment - Encouraging
    'knowledge_check': 'enthusiastic',
    'checkpoint': 'instructor_female',
    'scenario_selection': 'instructor_male',
    'field_mapping_exercise': 'instructor_female',
    'simulation': 'instructor_male'
}

def check_app_running():
    """Check if app.py is running on port 5000"""
    import requests
    try:
        response = requests.get("http://localhost:5000/api/health", timeout=5)
        return response.status_code == 200
    except:
        return False

def start_app():
    """Start app.py in the background"""
    print("Starting app.py...")
    # Check if already running
    if check_app_running():
        print("✓ App is already running")
        return None
        
    # Start the app
    process = subprocess.Popen(
        [sys.executable, "app.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # Wait for it to start
    for i in range(30):
        time.sleep(2)
        if check_app_running():
            print("✓ App started successfully")
            return process
    
    print("✗ Failed to start app")
    return None

def regenerate_all_audio():
    """Regenerate all audio using generate_all_audio_v3.py with --no-cache"""
    print("\n" + "="*60)
    print("REGENERATING ALL AUDIO WITH BEST QUALITY")
    print("="*60)
    
    # Step 1: Start app.py if needed
    app_process = None
    if not check_app_running():
        app_process = start_app()
        if not app_process and not check_app_running():
            print("Error: Could not start app.py")
            return
    
    # Step 2: Run audio generation with --no-cache to force regeneration
    print("\nRunning audio generation...")
    try:
        result = subprocess.run(
            [sys.executable, "generate_all_audio_v3.py", "--no-cache"],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            print("✓ Audio generation completed successfully")
            print("\nOutput:")
            print(result.stdout)
        else:
            print("✗ Audio generation failed")
            print("\nError:")
            print(result.stderr)
    
    except Exception as e:
        print(f"Error running audio generation: {e}")
    
    finally:
        # Stop app.py if we started it
        if app_process:
            print("\nStopping app.py...")
            app_process.terminate()
            time.sleep(2)
    
    # Step 3: Show summary
    show_summary()

def show_summary():
    """Show summary of generated audio files"""
    print("\n" + "="*60)
    print("AUDIO GENERATION SUMMARY")
    print("="*60)
    
    # Count audio files
    audio_files = list(AUDIO_DIR.glob("*.wav"))
    json_files = list(AUDIO_DIR.glob("*.json"))
    
    print(f"Audio files (.wav): {len(audio_files)}")
    print(f"Metadata files (.json): {len(json_files)}")
    
    # Calculate total size
    total_size = sum(f.stat().st_size for f in audio_files)
    print(f"Total size: {total_size / (1024*1024):.2f} MB")
    
    # Check manifest
    manifest_path = AUDIO_DIR / "generation_manifest_v3.json"
    if manifest_path.exists():
        with open(manifest_path, 'r') as f:
            manifest = json.load(f)
        
        print(f"\nGeneration stats:")
        print(f"  Total segments: {manifest.get('totalSegments', 0)}")
        print(f"  Generated: {manifest.get('successfullyGenerated', 0)}")
        print(f"  Cached: {manifest.get('cachedCount', 0)}")
        print(f"  Failed: {manifest.get('failedCount', 0)}")
        print(f"  Skipped: {manifest.get('skippedCount', 0)}")
        
        # Show voice usage
        voice_usage = {}
        for result in manifest.get('results', []):
            voice = result.get('voice', 'unknown')
            voice_usage[voice] = voice_usage.get(voice, 0) + 1
        
        print(f"\nVoice usage:")
        for voice, count in sorted(voice_usage.items(), key=lambda x: -x[1]):
            print(f"  {voice}: {count} segments")
    
    print("\n✓ Audio regeneration complete!")
    print(f"Audio files are in: {AUDIO_DIR.absolute()}")

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Regenerate all audio with best quality')
    parser.add_argument('--check-only', action='store_true',
                       help='Only check current status without regenerating')
    
    args = parser.parse_args()
    
    if args.check_only:
        show_summary()
    else:
        regenerate_all_audio()

if __name__ == "__main__":
    main()