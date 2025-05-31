# app.py - Learning App Backend with XTTS v2
# Install: pip install flask flask-cors TTS openai python-dotenv

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import uuid
import json
from datetime import datetime
from TTS.api import TTS
import torch
import threading
import queue
import time

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'audio_outputs'
CONTENT_FOLDER = 'learning_content'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CONTENT_FOLDER, exist_ok=True)

# Initialize TTS model
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Initializing XTTS v2 on {device}...")
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)
print("Model loaded successfully!")

# Audio generation queue for async processing
audio_queue = queue.Queue()
generation_status = {}

def audio_worker():
    """Background worker for audio generation"""
    while True:
        task = audio_queue.get()
        if task is None:
            break
        
        task_id = task['id']
        try:
            generation_status[task_id] = {'status': 'processing', 'progress': 0}
            
            # Generate audio
            output_path = os.path.join(UPLOAD_FOLDER, f"{task_id}.wav")
            tts.tts_to_file(
                text=task['text'],
                language=task['language'],
                file_path=output_path
            )
            
            generation_status[task_id] = {
                'status': 'completed',
                'progress': 100,
                'file_path': output_path,
                'url': f"/audio/{task_id}"
            }
        except Exception as e:
            generation_status[task_id] = {
                'status': 'error',
                'error': str(e)
            }
        
        audio_queue.task_done()

# Start background worker
worker_thread = threading.Thread(target=audio_worker, daemon=True)
worker_thread.start()

# Learning content templates
LEARNING_TEMPLATES = {
    "vocabulary": {
        "intro": "Let's learn about the word '{word}'. {word} is defined as: {definition}. Here's an example: {example}",
        "practice": "Now, try using '{word}' in your own sentence. Remember, it means {definition}."
    },
    "concept": {
        "intro": "Today we're exploring {topic}. {explanation} This concept is important because {importance}",
        "practice": "To practice {topic}, try this exercise: {exercise}"
    },
    "language": {
        "intro": "In {language}, '{phrase}' means '{translation}'. The pronunciation is: {pronunciation}",
        "practice": "Repeat after me: '{phrase}'. Use it in context: {context}"
    }
}

@app.route('/api/generate-content', methods=['POST'])
def generate_content():
    """Generate learning content based on topic and type"""
    data = request.json
    content_type = data.get('type', 'concept')
    topic_data = data.get('data', {})
    
    # Generate content based on type
    if content_type == 'vocabulary':
        content = {
            'intro': LEARNING_TEMPLATES['vocabulary']['intro'].format(**topic_data),
            'practice': LEARNING_TEMPLATES['vocabulary']['practice'].format(**topic_data),
            'cards': [
                {'front': 'Definition', 'back': topic_data.get('definition', '')},
                {'front': 'Example', 'back': topic_data.get('example', '')},
                {'front': 'Synonyms', 'back': topic_data.get('synonyms', 'N/A')}
            ]
        }
    elif content_type == 'language':
        content = {
            'intro': LEARNING_TEMPLATES['language']['intro'].format(**topic_data),
            'practice': LEARNING_TEMPLATES['language']['practice'].format(**topic_data),
            'cards': [
                {'front': topic_data.get('phrase', ''), 'back': topic_data.get('translation', '')},
                {'front': 'Pronunciation', 'back': topic_data.get('pronunciation', '')},
                {'front': 'Context', 'back': topic_data.get('context', '')}
            ]
        }
    else:  # concept
        content = {
            'intro': LEARNING_TEMPLATES['concept']['intro'].format(**topic_data),
            'practice': LEARNING_TEMPLATES['concept']['practice'].format(**topic_data),
            'cards': [
                {'front': 'What is it?', 'back': topic_data.get('explanation', '')},
                {'front': 'Why important?', 'back': topic_data.get('importance', '')},
                {'front': 'Exercise', 'back': topic_data.get('exercise', '')}
            ]
        }
    
    # Save content
    content_id = str(uuid.uuid4())
    content_path = os.path.join(CONTENT_FOLDER, f"{content_id}.json")
    with open(content_path, 'w') as f:
        json.dump({
            'id': content_id,
            'type': content_type,
            'content': content,
            'created_at': datetime.now().isoformat()
        }, f)
    
    return jsonify({
        'id': content_id,
        'content': content
    })

@app.route('/api/generate-audio', methods=['POST'])
def generate_audio():
    """Generate audio from text"""
    data = request.json
    text = data.get('text', '')
    language = data.get('language', 'en')
    voice_speed = data.get('speed', 1.0)
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    # Create task
    task_id = str(uuid.uuid4())
    task = {
        'id': task_id,
        'text': text,
        'language': language,
        'speed': voice_speed
    }
    
    # Add to queue
    audio_queue.put(task)
    generation_status[task_id] = {'status': 'queued', 'progress': 0}
    
    return jsonify({
        'task_id': task_id,
        'status': 'queued'
    })

@app.route('/api/audio-status/<task_id>', methods=['GET'])
def get_audio_status(task_id):
    """Check audio generation status"""
    status = generation_status.get(task_id, {'status': 'not_found'})
    return jsonify(status)

@app.route('/audio/<task_id>', methods=['GET'])
def get_audio(task_id):
    """Serve generated audio file"""
    file_path = os.path.join(UPLOAD_FOLDER, f"{task_id}.wav")
    if os.path.exists(file_path):
        return send_file(file_path, mimetype='audio/wav')
    return jsonify({'error': 'Audio not found'}), 404

@app.route('/api/learning-paths', methods=['GET'])
def get_learning_paths():
    """Get available learning paths"""
    paths = [
        {
            'id': 'vocab-builder',
            'name': 'Vocabulary Builder',
            'description': 'Expand your vocabulary with audio pronunciation',
            'icon': '📚',
            'color': 'gradient-1'
        },
        {
            'id': 'language-learning',
            'name': 'Language Learning',
            'description': 'Learn new languages with native pronunciation',
            'icon': '🌍',
            'color': 'gradient-2'
        },
        {
            'id': 'concept-mastery',
            'name': 'Concept Mastery',
            'description': 'Master complex concepts with audio explanations',
            'icon': '🧠',
            'color': 'gradient-3'
        },
        {
            'id': 'pronunciation',
            'name': 'Pronunciation Practice',
            'description': 'Perfect your pronunciation with AI feedback',
            'icon': '🗣️',
            'color': 'gradient-4'
        }
    ]
    return jsonify(paths)

@app.route('/api/generate-lesson', methods=['POST'])
def generate_lesson():
    """Generate a complete lesson with multiple audio segments"""
    data = request.json
    lesson_type = data.get('type', 'vocabulary')
    topic = data.get('topic', '')
    difficulty = data.get('difficulty', 'beginner')
    
    # Generate lesson structure
    lesson = {
        'id': str(uuid.uuid4()),
        'title': f"{topic.title()} - {difficulty.title()} Level",
        'type': lesson_type,
        'segments': []
    }
    
    # Create lesson segments based on type
    if lesson_type == 'vocabulary':
        segments = [
            {'type': 'intro', 'text': f"Welcome to today's vocabulary lesson on {topic}."},
            {'type': 'definition', 'text': f"Let's start with the definition and usage."},
            {'type': 'examples', 'text': f"Here are some examples to help you understand better."},
            {'type': 'practice', 'text': f"Now it's your turn to practice using this word."}
        ]
    elif lesson_type == 'language':
        segments = [
            {'type': 'intro', 'text': f"Today we're learning {topic} phrases."},
            {'type': 'pronunciation', 'text': f"Listen carefully to the pronunciation."},
            {'type': 'conversation', 'text': f"Let's use these phrases in conversation."},
            {'type': 'review', 'text': f"Let's review what we've learned."}
        ]
    else:
        segments = [
            {'type': 'intro', 'text': f"Let's explore the concept of {topic}."},
            {'type': 'explanation', 'text': f"Here's what you need to know."},
            {'type': 'application', 'text': f"This is how it applies in real life."},
            {'type': 'summary', 'text': f"To summarize the key points."}
        ]
    
    # Generate audio for each segment
    for segment in segments:
        task_id = str(uuid.uuid4())
        segment['audio_task_id'] = task_id
        
        task = {
            'id': task_id,
            'text': segment['text'],
            'language': 'en',
            'speed': 1.0
        }
        audio_queue.put(task)
        generation_status[task_id] = {'status': 'queued', 'progress': 0}
    
    lesson['segments'] = segments
    
    # Save lesson
    lesson_path = os.path.join(CONTENT_FOLDER, f"lesson_{lesson['id']}.json")
    with open(lesson_path, 'w') as f:
        json.dump(lesson, f)
    
    return jsonify(lesson)

@app.route('/api/supported-languages', methods=['GET'])
def get_supported_languages():
    """Get list of supported languages"""
    languages = [
        {'code': 'en', 'name': 'English', 'flag': '🇬🇧'},
        {'code': 'es', 'name': 'Spanish', 'flag': '🇪🇸'},
        {'code': 'fr', 'name': 'French', 'flag': '🇫🇷'},
        {'code': 'de', 'name': 'German', 'flag': '🇩🇪'},
        {'code': 'it', 'name': 'Italian', 'flag': '🇮🇹'},
        {'code': 'pt', 'name': 'Portuguese', 'flag': '🇵🇹'},
        {'code': 'ja', 'name': 'Japanese', 'flag': '🇯🇵'},
        {'code': 'ko', 'name': 'Korean', 'flag': '🇰🇷'},
        {'code': 'zh-cn', 'name': 'Chinese', 'flag': '🇨🇳'}
    ]
    return jsonify(languages)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
