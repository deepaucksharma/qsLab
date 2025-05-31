#!/usr/bin/env python3
"""
Premium Audio Generation with Best Open-Source TTS Models
Supports multiple models and voice customization
"""

import json
import os
import sys
import time
import shutil
from pathlib import Path
from datetime import datetime
import warnings
warnings.filterwarnings("ignore")

# Directories
AUDIO_OUTPUT_DIR = Path("audio_outputs")
AUDIO_OUTPUT_DIR.mkdir(exist_ok=True)
LESSONS_FILE = Path("learning_content/lessons_structure.json")
VOICE_SAMPLES_DIR = Path("voice_samples")
VOICE_SAMPLES_DIR.mkdir(exist_ok=True)

# Model configurations
TTS_MODELS = {
    'xtts_v2': {
        'name': 'XTTS v2',
        'model_path': 'tts_models/multilingual/multi-dataset/xtts_v2',
        'quality': 'premium',
        'speed': 'medium',
        'features': ['voice_cloning', 'emotion', 'multilingual'],
        'voice_sample': 'voice_samples/instructor_professional.wav'
    },
    'vits_vctk': {
        'name': 'VITS Multi-Speaker',
        'model_path': 'tts_models/en/vctk/vits',
        'quality': 'high',
        'speed': 'fast',
        'features': ['multi_speaker'],
        'speakers': {
            'professional_male': 'p226',
            'professional_female': 'p225',
            'warm_male': 'p227',
            'clear_female': 'p228',
            'authoritative_male': 'p243',
            'friendly_female': 'p262'
        }
    },
    'your_tts': {
        'name': 'YourTTS',
        'model_path': 'tts_models/multilingual/multi-dataset/your_tts',
        'quality': 'high',
        'speed': 'medium',
        'features': ['voice_cloning', 'multi_speaker', 'cross_lingual']
    },
    'tacotron2_ddc': {
        'name': 'Tacotron2-DDC',
        'model_path': 'tts_models/en/ljspeech/tacotron2-DDC',
        'quality': 'good',
        'speed': 'slow',
        'features': ['consistent']
    },
    'fast_pitch': {
        'name': 'FastPitch',
        'model_path': 'tts_models/en/ljspeech/fast_pitch',
        'quality': 'good',
        'speed': 'very_fast',
        'features': ['pitch_control']
    }
}

# Voice mapping for segment types
SEGMENT_VOICE_MAP = {
    # Premium segments - Use XTTS v2 with voice cloning
    'course_opening': {'model': 'xtts_v2', 'emotion': 'excited'},
    'episode_opening': {'model': 'xtts_v2', 'emotion': 'welcoming'},
    'checkpoint': {'model': 'xtts_v2', 'emotion': 'encouraging'},
    
    # Professional segments - Use VITS multi-speaker
    'instructor_introduction': {'model': 'vits_vctk', 'speaker': 'professional_female'},
    'technical_introduction': {'model': 'vits_vctk', 'speaker': 'professional_male'},
    'concept_introduction': {'model': 'vits_vctk', 'speaker': 'clear_female'},
    
    # Explanations - Use warm voices
    'concept_explanation': {'model': 'vits_vctk', 'speaker': 'warm_male'},
    'historical_context': {'model': 'vits_vctk', 'speaker': 'friendly_female'},
    'origin_story': {'model': 'vits_vctk', 'speaker': 'warm_male'},
    
    # Technical content - Clear and precise
    'code_walkthrough': {'model': 'tacotron2_ddc', 'speed': 0.9},
    'architecture_design': {'model': 'vits_vctk', 'speaker': 'authoritative_male'},
    'practical_example': {'model': 'fast_pitch', 'pitch': 1.0},
    
    # Data/Metrics - Professional and clear
    'metric_deep_dive': {'model': 'vits_vctk', 'speaker': 'professional_female'},
    'metrics_overview': {'model': 'vits_vctk', 'speaker': 'clear_female'},
    
    # Default
    'default': {'model': 'tacotron2_ddc'}
}

class PremiumAudioGenerator:
    def __init__(self):
        self.models = {}
        self.device = None
        self.stats = {
            'total': 0,
            'generated': 0,
            'failed': 0,
            'models_used': {}
        }
        
    def initialize_models(self):
        """Initialize all available TTS models"""
        try:
            import torch
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            print(f"Using device: {self.device}")
            
            from TTS.api import TTS
            
            # Load models
            for model_key, config in TTS_MODELS.items():
                try:
                    print(f"\nLoading {config['name']}...")
                    model = TTS(config['model_path']).to(self.device)
                    self.models[model_key] = model
                    print(f"✓ {config['name']} loaded successfully")
                    
                    # List available speakers for multi-speaker models
                    if hasattr(model, 'speakers') and model.speakers:
                        print(f"  Available speakers: {len(model.speakers)}")
                        
                except Exception as e:
                    print(f"✗ Failed to load {config['name']}: {e}")
                    
        except ImportError:
            print("Error: TTS not installed. Run: bash install_best_tts.sh")
            sys.exit(1)
            
    def create_voice_samples(self):
        """Create or download voice samples for voice cloning"""
        sample_text = "Welcome to Neural Learn, your comprehensive guide to advanced topics in technology."
        
        # Create a professional voice sample if it doesn't exist
        instructor_sample = VOICE_SAMPLES_DIR / "instructor_professional.wav"
        if not instructor_sample.exists() and 'tacotron2_ddc' in self.models:
            print("\nCreating voice sample for cloning...")
            self.models['tacotron2_ddc'].tts_to_file(
                text=sample_text,
                file_path=str(instructor_sample)
            )
            print("✓ Voice sample created")
            
    def generate_with_xtts(self, text, output_path, emotion='neutral', voice_sample=None):
        """Generate audio using XTTS v2 with voice cloning"""
        model = self.models['xtts_v2']
        
        # Use voice sample if available
        if voice_sample and Path(voice_sample).exists():
            model.tts_to_file(
                text=text,
                speaker_wav=str(voice_sample),
                language="en",
                file_path=str(output_path),
                emotion=emotion
            )
        else:
            # Use default XTTS voice
            model.tts_to_file(
                text=text,
                language="en",
                file_path=str(output_path)
            )
            
    def generate_with_vits(self, text, output_path, speaker='p226'):
        """Generate audio using VITS multi-speaker"""
        model = self.models['vits_vctk']
        
        # Map speaker names to IDs
        speaker_map = TTS_MODELS['vits_vctk']['speakers']
        speaker_id = speaker_map.get(speaker, speaker)
        
        # Ensure speaker exists
        if hasattr(model, 'speakers') and speaker_id not in model.speakers:
            speaker_id = model.speakers[0]  # Fallback to first speaker
            
        model.tts_to_file(
            text=text,
            speaker=speaker_id,
            file_path=str(output_path)
        )
        
    def generate_with_model(self, text, output_path, model_key, **kwargs):
        """Generate audio with specified model"""
        if model_key not in self.models:
            raise ValueError(f"Model {model_key} not loaded")
            
        model = self.models[model_key]
        
        if model_key == 'xtts_v2':
            self.generate_with_xtts(text, output_path, **kwargs)
        elif model_key == 'vits_vctk':
            self.generate_with_vits(text, output_path, **kwargs)
        else:
            # Standard generation for other models
            model.tts_to_file(text=text, file_path=str(output_path))
            
    def enhance_audio(self, audio_path):
        """Apply audio enhancements for better quality"""
        try:
            import noisereduce as nr
            import librosa
            import soundfile as sf
            
            # Load audio
            audio, sr = librosa.load(str(audio_path), sr=None)
            
            # Reduce noise
            audio_denoised = nr.reduce_noise(y=audio, sr=sr, prop_decrease=0.8)
            
            # Normalize volume
            audio_normalized = librosa.util.normalize(audio_denoised)
            
            # Save enhanced audio
            sf.write(str(audio_path), audio_normalized, sr)
            
        except Exception as e:
            print(f"Audio enhancement failed: {e}")
            
    def generate_all_segments(self):
        """Generate audio for all segments with best quality"""
        
        # Load lessons
        with open(LESSONS_FILE, 'r') as f:
            lessons_data = json.load(f)
            
        # Collect segments
        segments = []
        for lesson in lessons_data.get('lessons', []):
            for episode in lesson.get('episodes', []):
                for segment in episode.get('segments', []):
                    segment_id = segment.get('segmentId', '')
                    segment_type = segment.get('segmentType', 'default')
                    text = segment.get('textContent', '')
                    media_refs = segment.get('mediaRefs', {})
                    audio_id = media_refs.get('audioId', '')
                    
                    if text and audio_id:
                        segments.append({
                            'audioId': audio_id,
                            'segmentId': segment_id,
                            'segmentType': segment_type,
                            'text': text,
                            'title': segment.get('title', '')
                        })
                        
        self.stats['total'] = len(segments)
        print(f"\nProcessing {len(segments)} segments...")
        
        # Backup existing audio
        backup_dir = self.backup_existing_audio()
        
        # Generate audio for each segment
        for i, segment in enumerate(segments):
            print(f"\n[{i+1}/{len(segments)}] {segment['audioId']}")
            print(f"  Type: {segment['segmentType']}")
            
            try:
                # Get voice configuration
                voice_config = SEGMENT_VOICE_MAP.get(
                    segment['segmentType'], 
                    SEGMENT_VOICE_MAP['default']
                )
                
                model_key = voice_config['model']
                print(f"  Model: {TTS_MODELS[model_key]['name']}")
                
                # Generate audio
                output_path = AUDIO_OUTPUT_DIR / f"{segment['audioId']}.wav"
                
                # Extract model-specific parameters
                kwargs = {k: v for k, v in voice_config.items() if k != 'model'}
                
                self.generate_with_model(
                    segment['text'],
                    output_path,
                    model_key,
                    **kwargs
                )
                
                # Enhance audio quality
                self.enhance_audio(output_path)
                
                # Save metadata
                self.save_metadata(segment, voice_config, output_path)
                
                # Update stats
                self.stats['generated'] += 1
                self.stats['models_used'][model_key] = \
                    self.stats['models_used'].get(model_key, 0) + 1
                
                print(f"  ✓ Generated successfully")
                
                # Small delay to prevent overheating
                time.sleep(0.5)
                
            except Exception as e:
                print(f"  ✗ Failed: {e}")
                self.stats['failed'] += 1
                
                # Try to restore from backup
                if backup_dir:
                    self.restore_from_backup(segment['audioId'], backup_dir)
                    
    def backup_existing_audio(self):
        """Backup existing audio files"""
        if any(AUDIO_OUTPUT_DIR.glob("*.wav")):
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_dir = Path(f"audio_outputs_backup_{timestamp}")
            shutil.copytree(AUDIO_OUTPUT_DIR, backup_dir)
            print(f"\n✓ Backed up existing audio to: {backup_dir}")
            return backup_dir
        return None
        
    def restore_from_backup(self, audio_id, backup_dir):
        """Restore audio file from backup"""
        backup_file = backup_dir / f"{audio_id}.wav"
        if backup_file.exists():
            shutil.copy2(backup_file, AUDIO_OUTPUT_DIR / f"{audio_id}.wav")
            print(f"  → Restored from backup")
            
    def save_metadata(self, segment, voice_config, output_path):
        """Save generation metadata"""
        metadata = {
            'audioId': segment['audioId'],
            'text': segment['text'],
            'generatedAt': datetime.now().isoformat(),
            'segmentType': segment['segmentType'],
            'model': TTS_MODELS[voice_config['model']]['name'],
            'voiceConfig': voice_config,
            'device': str(self.device),
            'fileSize': output_path.stat().st_size,
            'enhanced': True
        }
        
        metadata_path = AUDIO_OUTPUT_DIR / f"{segment['audioId']}.json"
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
            
    def print_summary(self):
        """Print generation summary"""
        print("\n" + "="*60)
        print("PREMIUM AUDIO GENERATION COMPLETE")
        print("="*60)
        print(f"Total segments: {self.stats['total']}")
        print(f"Successfully generated: {self.stats['generated']}")
        print(f"Failed: {self.stats['failed']}")
        
        print("\nModels used:")
        for model, count in self.stats['models_used'].items():
            print(f"  {TTS_MODELS[model]['name']}: {count} files")
            
        total_size = sum(f.stat().st_size for f in AUDIO_OUTPUT_DIR.glob('*.wav'))
        print(f"\nTotal size: {total_size / (1024*1024):.2f} MB")
        print(f"Average size: {total_size / (1024*1024) / self.stats['generated']:.2f} MB per file")
        
        print("\n✅ High-quality audio generation complete!")
        print("\nNext steps:")
        print("1. Test audio in the app: python app.py")
        print("2. Fine-tune voice mappings in SEGMENT_VOICE_MAP")
        print("3. Create custom voice samples for voice cloning")

def main():
    print("="*60)
    print("PREMIUM AUDIO GENERATION WITH OPEN-SOURCE TTS")
    print("="*60)
    
    generator = PremiumAudioGenerator()
    
    # Initialize models
    generator.initialize_models()
    
    if not generator.models:
        print("\nNo models loaded! Please run:")
        print("bash install_best_tts.sh")
        return
        
    # Create voice samples
    generator.create_voice_samples()
    
    # Generate all audio
    generator.generate_all_segments()
    
    # Print summary
    generator.print_summary()

if __name__ == "__main__":
    main()