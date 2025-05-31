#!/usr/bin/env python3
"""
Test and compare different TTS models and voices to find the best quality
"""

import os
import time
from pathlib import Path
from datetime import datetime
import torch

# Set environment variable to agree to TTS terms
os.environ['COQUI_TOS_AGREED'] = '1'

# Try to import TTS
try:
    from TTS.api import TTS
    TTS_AVAILABLE = True
except ImportError:
    print("TTS not available. Please install with: pip install TTS")
    exit(1)

# Create output directory for voice samples
SAMPLES_DIR = Path('voice_samples')
SAMPLES_DIR.mkdir(exist_ok=True)

# Test text samples
TEST_TEXTS = {
    'short': "Welcome to the world of Apache Kafka monitoring.",
    'medium': "Share Groups represent a revolutionary approach to message consumption in Kafka, enabling true queue-like semantics within the streaming ecosystem.",
    'technical': "The unacknowledged_age_ms metric tracks the age of the oldest message that has been delivered to a consumer but not yet acknowledged.",
    'conversational': "Let me show you something fascinating about Kafka's architecture. It's not just another message queue - it's a distributed, append-only log that reimagines how we handle data streams."
}

class VoiceComparison:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {self.device}")
        self.results = []
        
    def list_available_models(self):
        """List all available TTS models"""
        print("\n=== Available TTS Models ===")
        print("\nChecking available models...")
        
        # Try to list models
        try:
            import subprocess
            result = subprocess.run(['tts', '--list_models'], capture_output=True, text=True)
            if result.returncode == 0:
                print(result.stdout)
            else:
                print("Could not list models automatically")
        except:
            pass
            
        # Known high-quality models
        models = {
            "XTTS-v2 (Multilingual, Voice Cloning)": "tts_models/multilingual/multi-dataset/xtts_v2",
            "VITS (English, Fast)": "tts_models/en/vctk/vits",
            "Tacotron2-DDC (English, Clear)": "tts_models/en/ljspeech/tacotron2-DDC",
            "Glow-TTS (English, Stable)": "tts_models/en/ljspeech/glow-tts",
            "YourTTS (Multilingual, Voice Cloning)": "tts_models/multilingual/multi-dataset/your_tts",
            "Bark (Multilingual, Expressive)": "tts_models/multilingual/multi-dataset/bark",
        }
        
        return models
        
    def test_model(self, model_name, model_path, test_key='medium'):
        """Test a specific model with sample text"""
        print(f"\n--- Testing {model_name} ---")
        
        try:
            start_time = time.time()
            
            # Initialize model
            print(f"Loading model: {model_path}")
            tts = TTS(model_path).to(self.device)
            load_time = time.time() - start_time
            
            # Generate audio
            text = TEST_TEXTS[test_key]
            output_file = SAMPLES_DIR / f"{model_name.replace(' ', '_').replace('(', '').replace(')', '').replace(',', '')}_{test_key}.wav"
            
            gen_start = time.time()
            
            # Check if model supports speaker selection
            if hasattr(tts, 'speakers') and tts.speakers:
                print(f"Available speakers: {tts.speakers}")
                # Test with first available speaker
                if tts.speakers:
                    tts.tts_to_file(
                        text=text,
                        speaker=tts.speakers[0],
                        file_path=str(output_file)
                    )
            else:
                # Model doesn't support speaker selection
                tts.tts_to_file(
                    text=text,
                    file_path=str(output_file)
                )
            
            gen_time = time.time() - gen_start
            
            # Get file size
            file_size = output_file.stat().st_size / 1024  # KB
            
            # Record results
            result = {
                'model': model_name,
                'model_path': model_path,
                'load_time': round(load_time, 2),
                'generation_time': round(gen_time, 2),
                'file_size_kb': round(file_size, 2),
                'output_file': str(output_file),
                'device': self.device,
                'success': True
            }
            
            self.results.append(result)
            
            print(f"✓ Success!")
            print(f"  Load time: {result['load_time']}s")
            print(f"  Generation time: {result['generation_time']}s")
            print(f"  File size: {result['file_size_kb']} KB")
            print(f"  Output: {result['output_file']}")
            
            return True
            
        except Exception as e:
            print(f"✗ Failed: {str(e)}")
            self.results.append({
                'model': model_name,
                'model_path': model_path,
                'error': str(e),
                'success': False
            })
            return False
    
    def test_xtts_speakers(self):
        """Test different XTTS v2 speakers and options"""
        print("\n=== Testing XTTS v2 Speaker Options ===")
        
        try:
            # Load XTTS v2
            model_path = "tts_models/multilingual/multi-dataset/xtts_v2"
            tts = TTS(model_path).to(self.device)
            
            # Test with different configurations
            configs = [
                {
                    'name': 'XTTS_v2_default',
                    'language': 'en',
                    'speaker': None,  # Use default
                },
                {
                    'name': 'XTTS_v2_speed_1.2',
                    'language': 'en',
                    'speed': 1.2,
                },
                {
                    'name': 'XTTS_v2_speed_0.9',
                    'language': 'en', 
                    'speed': 0.9,
                }
            ]
            
            # If we have a reference voice, we can test voice cloning
            reference_audio = Path("reference_voice.wav")
            if reference_audio.exists():
                configs.append({
                    'name': 'XTTS_v2_cloned',
                    'language': 'en',
                    'speaker_wav': str(reference_audio)
                })
            
            for config in configs:
                print(f"\nTesting configuration: {config['name']}")
                
                output_file = SAMPLES_DIR / f"{config['name']}.wav"
                
                try:
                    # Remove None values from config
                    clean_config = {k: v for k, v in config.items() if v is not None and k != 'name'}
                    
                    if 'speaker_wav' in clean_config:
                        # Voice cloning
                        tts.tts_to_file(
                            text=TEST_TEXTS['medium'],
                            file_path=str(output_file),
                            **clean_config
                        )
                    else:
                        # Default voice
                        tts.tts_to_file(
                            text=TEST_TEXTS['medium'],
                            language=clean_config.get('language', 'en'),
                            file_path=str(output_file)
                        )
                    
                    print(f"✓ Generated: {output_file}")
                    
                except Exception as e:
                    print(f"✗ Failed: {str(e)}")
                    
        except Exception as e:
            print(f"Failed to test XTTS speakers: {str(e)}")
    
    def generate_comparison_report(self):
        """Generate a report comparing all tested voices"""
        report_path = SAMPLES_DIR / f"voice_comparison_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        
        with open(report_path, 'w') as f:
            f.write("=== TTS Voice Comparison Report ===\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Device: {self.device}\n\n")
            
            # Successful models
            successful = [r for r in self.results if r['success']]
            if successful:
                f.write("SUCCESSFUL MODELS:\n")
                f.write("-" * 80 + "\n")
                
                # Sort by generation time
                successful.sort(key=lambda x: x['generation_time'])
                
                for r in successful:
                    f.write(f"\nModel: {r['model']}\n")
                    f.write(f"  Path: {r['model_path']}\n")
                    f.write(f"  Load Time: {r['load_time']}s\n")
                    f.write(f"  Generation Time: {r['generation_time']}s\n")
                    f.write(f"  File Size: {r['file_size_kb']} KB\n")
                    f.write(f"  Output: {r['output_file']}\n")
            
            # Failed models
            failed = [r for r in self.results if not r['success']]
            if failed:
                f.write("\n\nFAILED MODELS:\n")
                f.write("-" * 80 + "\n")
                
                for r in failed:
                    f.write(f"\nModel: {r['model']}\n")
                    f.write(f"  Error: {r['error']}\n")
            
            # Recommendations
            f.write("\n\nRECOMMENDATIONS:\n")
            f.write("-" * 80 + "\n")
            
            if successful:
                fastest = min(successful, key=lambda x: x['generation_time'])
                f.write(f"\nFastest Generation: {fastest['model']} ({fastest['generation_time']}s)\n")
                
                smallest = min(successful, key=lambda x: x['file_size_kb'])
                f.write(f"Smallest File Size: {smallest['model']} ({smallest['file_size_kb']} KB)\n")
            
            f.write("\nNOTES:\n")
            f.write("- XTTS v2 offers the best quality and multilingual support with voice cloning\n")
            f.write("- Tacotron2-DDC provides clear, natural English speech\n")
            f.write("- VITS is fast but may have lower quality\n")
            f.write("- Listen to all samples to determine best quality for your use case\n")
        
        print(f"\nReport saved to: {report_path}")
        return report_path

def main():
    print("=== TTS Voice Quality Comparison Tool ===\n")
    
    comparison = VoiceComparison()
    
    # Get available models
    models = comparison.list_available_models()
    
    print("\n\nStarting voice quality tests...")
    print("This will generate audio samples for comparison.\n")
    
    # Test main models
    tested_models = []
    
    # Priority models to test
    priority_models = [
        ("XTTS-v2 (Multilingual, Voice Cloning)", "tts_models/multilingual/multi-dataset/xtts_v2"),
        ("Tacotron2-DDC (English, Clear)", "tts_models/en/ljspeech/tacotron2-DDC"),
    ]
    
    for model_name, model_path in priority_models:
        if comparison.test_model(model_name, model_path):
            tested_models.append(model_name)
    
    # Test XTTS v2 with different configurations
    comparison.test_xtts_speakers()
    
    # Generate comparison report
    report_path = comparison.generate_comparison_report()
    
    print("\n\n=== TESTING COMPLETE ===")
    print(f"\nVoice samples saved in: {SAMPLES_DIR}")
    print(f"Comparison report: {report_path}")
    print("\nListen to the generated samples to determine the best voice quality.")
    print("\nRecommended for production:")
    print("1. XTTS v2 - Best overall quality, multilingual support, voice cloning")
    print("2. Tacotron2-DDC - Clear English voice, faster than XTTS")
    
if __name__ == "__main__":
    main()