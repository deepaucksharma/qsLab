#!/usr/bin/env python3
"""
Best TTS audio generation server using optimal models for quality
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import uuid
import time
import threading
import queue
from pathlib import Path
from datetime import datetime
import json
import torch
import warnings

# Suppress the weights_only warning for XTTS
warnings.filterwarnings("ignore", message="You are using `torch.load` with `weights_only=False`")

# Set environment variable to agree to TTS terms
os.environ['COQUI_TOS_AGREED'] = '1'

# Try to import TTS
try:
    from TTS.api import TTS
    TTS_AVAILABLE = True
except ImportError:
    TTS_AVAILABLE = False
    print("Error: TTS not available. Please install with: pip install TTS")

app = Flask(__name__)
CORS(app)

# Configuration
AUDIO_OUTPUT_DIR = Path('audio_outputs')
AUDIO_OUTPUT_DIR.mkdir(exist_ok=True)

# Audio generation queue and tracking
audio_queue = queue.Queue()
audio_tasks = {}

# Available models ranked by quality
TTS_MODELS = {
    'ultra': {
        'model': 'tts_models/en/vctk/vits',  # Multi-speaker English model
        'name': 'VITS Multi-Speaker',
        'description': 'High quality multi-speaker English model'
    },
    'high': {
        'model': 'tts_models/en/ljspeech/tacotron2-DDC',
        'name': 'Tacotron2-DDC',
        'description': 'Clear, natural English voice'
    },
    'balanced': {
        'model': 'tts_models/en/ljspeech/vits',
        'name': 'VITS LJSpeech',
        'description': 'Fast and good quality'
    },
    'fast': {
        'model': 'tts_models/en/ljspeech/glow-tts',
        'name': 'Glow-TTS',
        'description': 'Fastest generation, decent quality'
    }
}

# Initialize TTS models
tts_models = {}
device = "cuda" if torch.cuda.is_available() else "cpu"

def initialize_models():
    """Initialize TTS models on startup"""
    global tts_models
    
    # Start with Tacotron2-DDC as default
    try:
        print(f"Initializing TTS models on {device}...")
        model_id = TTS_MODELS['high']['model']
        print(f"Loading {TTS_MODELS['high']['name']}...")
        tts_models['high'] = TTS(model_id).to(device)
        print("✓ Tacotron2-DDC loaded successfully!")
        
        # Try to load VITS multi-speaker for ultra quality
        try:
            model_id = TTS_MODELS['ultra']['model']
            print(f"Loading {TTS_MODELS['ultra']['name']}...")
            tts_models['ultra'] = TTS(model_id).to(device)
            print("✓ VITS Multi-Speaker loaded successfully!")
        except Exception as e:
            print(f"Failed to load VITS Multi-Speaker: {e}")
        
    except Exception as e:
        print(f"Failed to initialize TTS models: {e}")
        TTS_AVAILABLE = False

# Initialize models on startup
if TTS_AVAILABLE:
    initialize_models()

def get_tts_model(quality='high'):
    """Get the appropriate TTS model based on quality setting"""
    # If requested quality is available, use it
    if quality in tts_models:
        return tts_models[quality], quality
    
    # Otherwise fall back to highest available quality
    for q in ['ultra', 'high', 'balanced', 'fast']:
        if q in tts_models:
            return tts_models[q], q
    
    return None, None

def audio_worker():
    """Background worker for audio generation"""
    while True:
        task = audio_queue.get()
        if task is None:
            break
        
        task_id = task['taskId']
        text = task['text']
        audio_id = task['audioId']
        quality = task.get('quality', 'high')
        speaker = task.get('speaker', None)
        speed = task.get('speed', 1.0)
        
        try:
            audio_tasks[task_id]['status'] = 'processing'
            
            # Get appropriate model
            tts_model, actual_quality = get_tts_model(quality)
            
            if tts_model:
                # Generate audio
                output_path = AUDIO_OUTPUT_DIR / f"{audio_id}.wav"
                
                # Check if model supports speakers
                if hasattr(tts_model, 'speakers') and tts_model.speakers:
                    available_speakers = tts_model.speakers
                    
                    # Use specified speaker or pick a good default
                    if speaker and speaker in available_speakers:
                        selected_speaker = speaker
                    else:
                        # Pick a recommended speaker for quality
                        recommended_speakers = {
                            'p225': 'Clear female voice',
                            'p226': 'Warm male voice', 
                            'p227': 'Professional male voice',
                            'p228': 'Clear female voice 2'
                        }
                        
                        # Try to find a recommended speaker
                        selected_speaker = None
                        for rec_speaker in recommended_speakers:
                            if rec_speaker in available_speakers:
                                selected_speaker = rec_speaker
                                break
                        
                        # Fallback to first available
                        if not selected_speaker:
                            selected_speaker = available_speakers[0]
                    
                    # Generate with speaker
                    tts_model.tts_to_file(
                        text=text,
                        speaker=selected_speaker,
                        file_path=str(output_path)
                    )
                    
                    audio_tasks[task_id]['speaker'] = selected_speaker
                else:
                    # Generate without speaker selection
                    tts_model.tts_to_file(
                        text=text,
                        file_path=str(output_path)
                    )
                
                audio_tasks[task_id]['status'] = 'completed'
                audio_tasks[task_id]['audioPath'] = str(output_path)
                audio_tasks[task_id]['quality'] = actual_quality
                audio_tasks[task_id]['model'] = TTS_MODELS[actual_quality]['name']
                
                # Create metadata file
                metadata_path = AUDIO_OUTPUT_DIR / f"{audio_id}.json"
                with open(metadata_path, 'w') as f:
                    json.dump({
                        'audioId': audio_id,
                        'text': text,
                        'generatedAt': datetime.now().isoformat(),
                        'metadata': task.get('metadata', {}),
                        'model': TTS_MODELS[actual_quality]['name'],
                        'quality': actual_quality,
                        'device': str(device),
                        'speaker': audio_tasks[task_id].get('speaker')
                    }, f, indent=2)
                
            else:
                audio_tasks[task_id]['status'] = 'failed'
                audio_tasks[task_id]['error'] = 'No TTS model available'
                
        except Exception as e:
            audio_tasks[task_id]['status'] = 'failed'
            audio_tasks[task_id]['error'] = str(e)
            print(f"Audio generation failed for {task_id}: {e}")
        
        audio_queue.task_done()

# Start the background worker
worker_thread = threading.Thread(target=audio_worker, daemon=True)
worker_thread.start()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    available_models = list(tts_models.keys())
    model_info = {}
    
    for quality, model in tts_models.items():
        model_info[quality] = {
            'name': TTS_MODELS[quality]['name'],
            'loaded': True
        }
        
        # Check for available speakers
        if hasattr(model, 'speakers') and model.speakers:
            model_info[quality]['speakers'] = model.speakers[:10]  # First 10 speakers
    
    return jsonify({
        "status": "healthy",
        "tts_available": TTS_AVAILABLE,
        "device": str(device),
        "available_models": available_models,
        "model_info": model_info,
        "audio_queue_size": audio_queue.qsize(),
        "active_tasks": len([t for t in audio_tasks.values() if t['status'] == 'processing'])
    })

@app.route('/api/generate-audio', methods=['POST'])
def generate_audio():
    """Queue audio generation for text"""
    data = request.json
    text = data.get('text', '')
    audio_id = data.get('audioId', f'audio_{int(time.time())}')
    metadata = data.get('metadata', {})
    quality = data.get('quality', 'high')  # ultra, high, balanced, fast
    speaker = data.get('speaker', None)
    speed = data.get('speed', 1.0)
    
    if not text:
        return jsonify({"error": "No text provided"}), 400
    
    # Create a task ID
    task_id = str(uuid.uuid4())
    
    # Add to queue
    audio_queue.put({
        'taskId': task_id,
        'text': text,
        'audioId': audio_id,
        'metadata': metadata,
        'quality': quality,
        'speaker': speaker,
        'speed': speed
    })
    
    # Track the task
    audio_tasks[task_id] = {
        'status': 'queued',
        'audioPath': None,
        'error': None,
        'metadata': metadata,
        'quality': quality,
        'createdAt': datetime.now().isoformat()
    }
    
    return jsonify({
        'taskId': task_id,
        'status': 'queued',
        'message': 'Audio generation queued',
        'quality': quality
    }), 202

@app.route('/api/audio-status/<task_id>', methods=['GET'])
def get_audio_status(task_id):
    """Check status of audio generation task"""
    if task_id not in audio_tasks:
        return jsonify({"error": "Task not found"}), 404
    
    task = audio_tasks[task_id]
    return jsonify(task)

@app.route('/api/audio/<audio_id>', methods=['GET'])
def serve_audio(audio_id):
    """Serve generated audio file"""
    file_path = AUDIO_OUTPUT_DIR / f"{audio_id}.wav"
    if file_path.exists():
        return send_file(str(file_path), mimetype='audio/wav')
    return jsonify({'error': 'Audio file not found'}), 404

@app.route('/api/models', methods=['GET'])
def get_models():
    """Get available models and their info"""
    models_info = {}
    
    for quality, config in TTS_MODELS.items():
        models_info[quality] = {
            'name': config['name'],
            'description': config['description'],
            'available': quality in tts_models
        }
        
        if quality in tts_models:
            model = tts_models[quality]
            if hasattr(model, 'speakers') and model.speakers:
                models_info[quality]['speakers'] = model.speakers
                models_info[quality]['speaker_count'] = len(model.speakers)
    
    return jsonify({
        'models': models_info,
        'default': 'high',
        'recommended': 'ultra' if 'ultra' in tts_models else 'high'
    })

@app.route('/api/test-voices', methods=['POST'])
def test_voices():
    """Generate test samples with different voices"""
    data = request.json
    test_text = data.get('text', 'Welcome to Neural Learn, your AI-powered learning companion.')
    
    tasks = []
    
    # Test with different qualities
    for quality in ['ultra', 'high']:
        if quality in tts_models:
            task_id = str(uuid.uuid4())
            audio_id = f'test_{quality}_{int(time.time())}'
            
            audio_queue.put({
                'taskId': task_id,
                'text': test_text,
                'audioId': audio_id,
                'metadata': {'test': True, 'quality': quality},
                'quality': quality
            })
            
            audio_tasks[task_id] = {
                'status': 'queued',
                'audioPath': None,
                'error': None,
                'metadata': {'test': True},
                'quality': quality,
                'createdAt': datetime.now().isoformat()
            }
            
            tasks.append({
                'taskId': task_id,
                'audioId': audio_id,
                'quality': quality
            })
    
    return jsonify({
        'message': f'Queued {len(tasks)} test samples',
        'tasks': tasks
    }), 202

@app.route('/api/batch-generate', methods=['POST'])
def batch_generate_audio():
    """Queue multiple audio generation tasks"""
    data = request.json
    tasks = data.get('tasks', [])
    default_quality = data.get('defaultQuality', 'high')
    
    if not tasks:
        return jsonify({"error": "No tasks provided"}), 400
    
    task_ids = []
    
    for task in tasks:
        text = task.get('text', '')
        audio_id = task.get('audioId', f'audio_{int(time.time())}_{len(task_ids)}')
        
        if text:
            task_id = str(uuid.uuid4())
            
            audio_queue.put({
                'taskId': task_id,
                'text': text,
                'audioId': audio_id,
                'metadata': task.get('metadata', {}),
                'quality': task.get('quality', default_quality),
                'speaker': task.get('speaker'),
                'speed': task.get('speed', 1.0)
            })
            
            audio_tasks[task_id] = {
                'status': 'queued',
                'audioPath': None,
                'error': None,
                'metadata': task.get('metadata', {}),
                'quality': task.get('quality', default_quality),
                'createdAt': datetime.now().isoformat()
            }
            
            task_ids.append({
                'taskId': task_id,
                'audioId': audio_id
            })
    
    return jsonify({
        'message': f'{len(task_ids)} tasks queued',
        'tasks': task_ids
    }), 202

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get generation statistics"""
    total_files = len(list(AUDIO_OUTPUT_DIR.glob('*.wav')))
    total_metadata = len(list(AUDIO_OUTPUT_DIR.glob('*.json')))
    
    status_counts = {}
    quality_counts = {}
    model_counts = {}
    
    for task in audio_tasks.values():
        status = task.get('status', 'unknown')
        status_counts[status] = status_counts.get(status, 0) + 1
        
        quality = task.get('quality', 'unknown')
        quality_counts[quality] = quality_counts.get(quality, 0) + 1
        
        model = task.get('model', 'unknown')
        model_counts[model] = model_counts.get(model, 0) + 1
    
    return jsonify({
        'totalAudioFiles': total_files,
        'totalMetadataFiles': total_metadata,
        'taskStatusCounts': status_counts,
        'qualityCounts': quality_counts,
        'modelCounts': model_counts,
        'queueSize': audio_queue.qsize(),
        'device': str(device),
        'availableModels': list(tts_models.keys())
    })

if __name__ == '__main__':
    print(f"Starting Best TTS audio generation server...")
    print(f"Device: {device}")
    print(f"Available models: {list(tts_models.keys())}")
    print(f"Audio output directory: {AUDIO_OUTPUT_DIR}")
    app.run(host='0.0.0.0', port=5001, debug=False)