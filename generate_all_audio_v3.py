#!/usr/bin/env python3
"""
Comprehensive Audio Generation Script v3
Generates high-quality audio for all course segments using improved TTS system
"""

import json
import time
import requests
from pathlib import Path
from datetime import datetime
import argparse
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, List, Tuple

# Configuration
LESSONS_FILE = Path("learning_content/lessons_structure.json")
AUDIO_OUTPUT_DIR = Path("audio_outputs")
AUDIO_OUTPUT_DIR.mkdir(exist_ok=True)

# Voice presets mapping for different segment types
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

# Default voice if segment type not mapped
DEFAULT_VOICE = 'instructor_male'

class AudioGenerator:
    def __init__(self, api_url: str, use_cache: bool = True):
        self.api_url = api_url.rstrip('/')
        self.use_cache = use_cache
        self.session = requests.Session()
        self.stats = {
            'total': 0,
            'generated': 0,
            'cached': 0,
            'failed': 0,
            'skipped': 0
        }
        
    def check_health(self) -> bool:
        """Check if the audio server is healthy"""
        try:
            response = self.session.get(f"{self.api_url}/api/health", timeout=5)
            if response.status_code == 200:
                data = response.json()
                print(f"✓ Audio server is healthy")
                print(f"  - TTS Available: {data.get('tts_available', False)}")
                print(f"  - Device: {data.get('device', 'unknown')}")
                print(f"  - Models: {', '.join(data.get('models', {}).keys())}")
                print(f"  - Voice Presets: {', '.join(data.get('voice_presets', []))}")
                return True
        except Exception as e:
            print(f"✗ Audio server health check failed: {e}")
        return False
        
    def get_voice_for_segment(self, segment_type: str) -> str:
        """Get the appropriate voice preset for a segment type"""
        return SEGMENT_VOICE_MAP.get(segment_type, DEFAULT_VOICE)
        
    def check_existing_audio(self, audio_id: str) -> Tuple[bool, Dict]:
        """Check if audio already exists and return metadata"""
        audio_path = AUDIO_OUTPUT_DIR / f"{audio_id}.wav"
        metadata_path = AUDIO_OUTPUT_DIR / f"{audio_id}.json"
        
        if audio_path.exists() and metadata_path.exists():
            try:
                with open(metadata_path, 'r') as f:
                    metadata = json.load(f)
                return True, metadata
            except:
                pass
        return False, {}
        
    def generate_audio(self, segment_id: str, text: str, segment_type: str,
                      metadata: Dict) -> Tuple[str, bool, str]:
        """Generate audio for a single segment"""
        audio_id = f"AUDIO_{segment_id}"
        
        # Check if already exists and caching is enabled
        if self.use_cache:
            exists, existing_metadata = self.check_existing_audio(audio_id)
            if exists:
                # Check if it was generated with the same voice
                existing_voice = existing_metadata.get('voicePreset', 'default')
                desired_voice = self.get_voice_for_segment(segment_type)
                
                if existing_voice == desired_voice:
                    self.stats['cached'] += 1
                    return audio_id, True, "cached"
                else:
                    print(f"  → Voice changed from {existing_voice} to {desired_voice}, regenerating...")
        
        # Get appropriate voice for segment type
        voice_preset = self.get_voice_for_segment(segment_type)
        
        # Queue audio generation
        try:
            response = self.session.post(
                f"{self.api_url}/api/generate-segment-audio",
                json={
                    'segmentId': segment_id,
                    'text': text,
                    'voice': voice_preset,
                    'language': 'en',
                    'segmentType': segment_type,
                    'metadata': metadata
                },
                timeout=30
            )
            
            if response.status_code == 202:
                data = response.json()
                task_id = data['taskId']
                
                # Poll for completion
                max_attempts = 60  # 5 minutes max
                for attempt in range(max_attempts):
                    status_response = self.session.get(
                        f"{self.api_url}/api/audio-status/{task_id}",
                        timeout=10
                    )
                    
                    if status_response.status_code == 200:
                        status_data = status_response.json()
                        
                        if status_data['status'] == 'completed':
                            self.stats['generated'] += 1
                            
                            # Save metadata with voice info
                            metadata_path = AUDIO_OUTPUT_DIR / f"{audio_id}.json"
                            with open(metadata_path, 'w') as f:
                                json.dump({
                                    'audioId': audio_id,
                                    'text': text,
                                    'generatedAt': datetime.now().isoformat(),
                                    'metadata': metadata,
                                    'voicePreset': voice_preset,
                                    'segmentType': segment_type,
                                    'model': status_data.get('model', 'unknown'),
                                    'device': status_data.get('device', 'unknown')
                                }, f, indent=2)
                            
                            return audio_id, True, "generated"
                            
                        elif status_data['status'] == 'failed':
                            error = status_data.get('error', 'Unknown error')
                            self.stats['failed'] += 1
                            return audio_id, False, f"failed: {error}"
                    
                    time.sleep(5)  # Wait 5 seconds before next check
                
                self.stats['failed'] += 1
                return audio_id, False, "timeout"
                
        except Exception as e:
            self.stats['failed'] += 1
            return audio_id, False, f"error: {str(e)}"
    
    def generate_all_audio(self, max_workers: int = 4):
        """Generate audio for all segments in the course"""
        if not LESSONS_FILE.exists():
            print(f"Error: {LESSONS_FILE} not found")
            return
            
        # Load lessons structure
        with open(LESSONS_FILE, 'r') as f:
            lessons_data = json.load(f)
            
        # Collect all segments
        segments = []
        for lesson in lessons_data.get('lessons', []):
            lesson_id = lesson.get('lessonId', lesson.get('id', ''))
            lesson_title = lesson.get('title', '')
            
            for episode in lesson.get('episodes', []):
                episode_id = episode.get('episodeId', episode.get('id', ''))
                episode_title = episode.get('title', '')
                
                for segment in episode.get('segments', []):
                    segment_id = segment.get('segmentId', segment.get('id', ''))
                    segment_type = segment.get('segmentType', segment.get('type', 'unknown'))
                    segment_title = segment.get('title', 'Untitled')
                    
                    # Get narration text - check multiple possible locations
                    text = segment.get('textContent', '')
                    if not text:
                        narration = segment.get('narration', {})
                        text = narration.get('text', '')
                    
                    if not text:
                        print(f"⚠️  No narration text for segment {segment_id}")
                        self.stats['skipped'] += 1
                        continue
                        
                    segments.append({
                        'segmentId': segment_id,
                        'text': text,
                        'segmentType': segment_type,
                        'metadata': {
                            'segmentId': segment_id,
                            'lessonId': lesson_id,
                            'episodeId': episode_id,
                            'title': segment_title,
                            'lessonTitle': lesson_title,
                            'episodeTitle': episode_title
                        }
                    })
        
        self.stats['total'] = len(segments)
        print(f"\nFound {len(segments)} segments to process")
        
        # Process segments
        results = []
        start_time = time.time()
        
        print("\nGenerating audio files...")
        for i, segment_data in enumerate(segments):
            segment_id = segment_data['segmentId']
            segment_type = segment_data['segmentType']
            voice = self.get_voice_for_segment(segment_type)
            
            print(f"\n[{i+1}/{len(segments)}] Processing {segment_id}")
            print(f"  Type: {segment_type} → Voice: {voice}")
            
            audio_id, success, status = self.generate_audio(
                segment_id,
                segment_data['text'],
                segment_type,
                segment_data['metadata']
            )
            
            results.append({
                'segmentId': segment_id,
                'audioId': audio_id,
                'success': success,
                'status': status,
                'segmentType': segment_type,
                'voice': voice,
                'audioPath': f"audio_outputs/{audio_id}.wav" if success else None
            })
            
            print(f"  → {status}")
            
            # Show progress
            if (i + 1) % 10 == 0:
                elapsed = time.time() - start_time
                rate = (i + 1) / elapsed
                remaining = (len(segments) - i - 1) / rate
                print(f"\n  Progress: {i+1}/{len(segments)} ({rate:.1f} segments/min)")
                print(f"  Estimated time remaining: {remaining/60:.1f} minutes")
        
        # Generate manifest
        manifest = {
            'generatedAt': datetime.now().isoformat(),
            'totalSegments': self.stats['total'],
            'successfullyGenerated': self.stats['generated'],
            'cachedCount': self.stats['cached'],
            'failedCount': self.stats['failed'],
            'skippedCount': self.stats['skipped'],
            'voiceMapping': SEGMENT_VOICE_MAP,
            'results': results
        }
        
        manifest_path = AUDIO_OUTPUT_DIR / "generation_manifest_v3.json"
        with open(manifest_path, 'w') as f:
            json.dump(manifest, f, indent=2)
        
        # Print summary
        elapsed_time = time.time() - start_time
        print("\n" + "="*60)
        print("AUDIO GENERATION COMPLETE")
        print("="*60)
        print(f"Total segments:      {self.stats['total']}")
        print(f"Generated:           {self.stats['generated']}")
        print(f"Cached:              {self.stats['cached']}")
        print(f"Failed:              {self.stats['failed']}")
        print(f"Skipped:             {self.stats['skipped']}")
        print(f"Total time:          {elapsed_time/60:.1f} minutes")
        print(f"Manifest saved to:   {manifest_path}")
        
        # List any failures
        failures = [r for r in results if not r['success']]
        if failures:
            print("\nFailed segments:")
            for failure in failures:
                print(f"  - {failure['segmentId']}: {failure['status']}")

def main():
    parser = argparse.ArgumentParser(description='Generate audio for all course segments')
    parser.add_argument('--api-url', default='http://localhost:5000',
                       help='Audio server API URL (default: http://localhost:5000)')
    parser.add_argument('--no-cache', action='store_true',
                       help='Regenerate all audio even if it already exists')
    parser.add_argument('--workers', type=int, default=1,
                       help='Number of parallel workers (default: 1)')
    
    args = parser.parse_args()
    
    print("="*60)
    print("NEURAL LEARN AUDIO GENERATION v3")
    print("="*60)
    print(f"API URL: {args.api_url}")
    print(f"Use cache: {not args.no_cache}")
    print(f"Workers: {args.workers}")
    
    # Initialize generator
    generator = AudioGenerator(args.api_url, use_cache=not args.no_cache)
    
    # Check server health
    if not generator.check_health():
        print("\nError: Audio server is not available")
        print("Please ensure the server is running:")
        print("  python app.py")
        print("  # or")
        print("  python app_xtts_fixed.py")
        sys.exit(1)
    
    # Generate all audio
    generator.generate_all_audio(max_workers=args.workers)

if __name__ == "__main__":
    main()