# app_simple.py - Flask backend without TTS for testing
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import uuid
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configuration
CONTENT_FOLDER = 'learning_content'
os.makedirs(CONTENT_FOLDER, exist_ok=True)

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
    else:
        content = {'intro': 'Content generation available when TTS is installed'}
    
    return jsonify({'content': content})

@app.route('/api/generate-audio', methods=['POST'])
def generate_audio():
    """Mock audio generation"""
    return jsonify({
        'task_id': str(uuid.uuid4()),
        'status': 'unavailable',
        'message': 'Audio generation requires TTS installation'
    })

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

@app.route('/')
def home():
    return jsonify({
        'message': 'Neural Learn API is running!',
        'note': 'Audio features disabled - TTS not installed',
        'endpoints': [
            '/api/learning-paths',
            '/api/supported-languages',
            '/api/generate-content',
            '/api/generate-audio'
        ]
    })

if __name__ == '__main__':
    print("\n" + "="*50)
    print("Neural Learn - Running without TTS")
    print("="*50)
    print("API running at: http://localhost:5000")
    print("Open index.html in your browser to see the UI")
    print("\nNote: Audio generation is disabled.")
    print("To enable audio, install TTS separately.")
    print("="*50 + "\n")
    
    app.run(debug=True, port=5000)
