#!/usr/bin/env python3
"""
Integrated Flask app with lessons from JSON and generated audio files
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from models import db, Course, Module, Lesson, Segment, Visual, UserProgress
import os
import json
from pathlib import Path
from datetime import datetime
import uuid

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///neural_learn_integrated.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
AUDIO_OUTPUT_DIR = Path('audio_outputs')
LEARNING_CONTENT_DIR = Path('learning_content')

# Initialize database
db.init_app(app)

# Load lesson structure from JSON
def load_lesson_structure():
    """Load the lesson structure from JSON file"""
    lessons_file = LEARNING_CONTENT_DIR / 'lessons_structure.json'
    if lessons_file.exists():
        with open(lessons_file, 'r') as f:
            return json.load(f)
    return None

# Map audio files to segments
def get_audio_mapping():
    """Create a mapping of segment IDs to audio file paths"""
    audio_mapping = {}
    manifest_file = AUDIO_OUTPUT_DIR / 'generation_manifest.json'
    
    if manifest_file.exists():
        with open(manifest_file, 'r') as f:
            manifest = json.load(f)
            for audio_info in manifest.get('audioFiles', []):
                segment_id = audio_info.get('segmentId')
                audio_path = audio_info.get('audioPath')
                if segment_id and audio_path:
                    # Convert to URL path
                    audio_mapping[segment_id] = f"/audio/{audio_info.get('audioId')}"
    
    return audio_mapping

# Initialize database with lesson content
def init_database_from_json():
    """Initialize database from lesson structure JSON"""
    # Check if already initialized
    if Course.query.first():
        return False
    
    lesson_data = load_lesson_structure()
    if not lesson_data:
        return False
    
    audio_mapping = get_audio_mapping()
    
    # Create the main course
    course = Course(
        course_code='KAFKA_MON_2025',
        title='Kafka Monitoring with Share Groups',
        description='Master Apache Kafka monitoring with focus on Share Groups and modern observability',
        prerequisites=['Basic Kafka knowledge', 'Understanding of distributed systems'],
        learning_objectives=[
            'Understand Kafka fundamentals and Share Groups',
            'Master JMX monitoring and metric collection',
            'Implement New Relic integration with QueueSample v2'
        ],
        instructor_name='Neural Learn AI'
    )
    db.session.add(course)
    db.session.commit()
    
    # Process lessons
    for lesson_idx, lesson_data in enumerate(lesson_data.get('lessons', [])):
        # Create module
        module = Module(
            course_id=course.id,
            title=lesson_data.get('title', ''),
            order=lesson_idx,
            learning_objectives=lesson_data.get('learningObjectives', [])
        )
        db.session.add(module)
        db.session.commit()
        
        # Process episodes as lessons
        for episode_idx, episode_data in enumerate(lesson_data.get('episodes', [])):
            lesson = Lesson(
                module_id=module.id,
                title=episode_data.get('title', ''),
                order=episode_idx,
                estimated_duration_minutes=int(episode_data.get('estimatedDuration', '10 minutes').split()[0]),
                learning_objectives=episode_data.get('learningObjectives', [])
            )
            db.session.add(lesson)
            db.session.commit()
            
            # Process segments
            for segment_idx, segment_data in enumerate(episode_data.get('segments', [])):
                segment_id = segment_data.get('segmentId', '')
                
                # Create segment
                segment = Segment(
                    lesson_id=lesson.id,
                    title=segment_data.get('title', ''),
                    segment_type=segment_data.get('segmentType', 'explanation'),
                    text_content=segment_data.get('textContent', ''),
                    order=segment_idx,
                    keywords=segment_data.get('keywords', []),
                    points_value=segment_data.get('pointsAwarded', 10),
                    audio_status='completed' if segment_id in audio_mapping else 'pending',
                    audio_url=audio_mapping.get(segment_id, '')
                )
                
                # Add code example if present
                if 'codeExample' in segment_data:
                    code_data = segment_data['codeExample']
                    segment.code_example = {
                        'language': code_data.get('language', ''),
                        'code': code_data.get('snippet', '')
                    }
                
                # Add interactive elements if present
                if 'interactiveCue' in segment_data:
                    segment.interactive_elements = [segment_data['interactiveCue']]
                
                db.session.add(segment)
                db.session.commit()
                
                # Add visuals if specified
                visual_ids = segment_data.get('mediaRefs', {}).get('visualIds', [])
                for visual_idx, visual_id in enumerate(visual_ids):
                    visual = Visual(
                        segment_id=segment.id,
                        visual_type='diagram',
                        url=f'/api/visual/{visual_id}',  # Placeholder URL
                        alt_text=f'Visual for {segment.title}',
                        order=visual_idx
                    )
                    db.session.add(visual)
            
            db.session.commit()
    
    return True

with app.app_context():
    db.create_all()
    if init_database_from_json():
        print("Database initialized with lesson content and audio mappings!")

# API Routes

@app.route('/api/courses', methods=['GET'])
def get_courses():
    """Get all courses"""
    courses = Course.query.all()
    return jsonify([{
        'id': c.id,
        'title': c.title,
        'description': c.description,
        'code': c.course_code,
        'modules_count': len(c.modules)
    } for c in courses])

@app.route('/api/courses/<course_id>/modules', methods=['GET'])
def get_course_modules(course_id):
    """Get modules for a course with lessons"""
    course = Course.query.get_or_404(course_id)
    
    modules_data = []
    for module in course.modules:
        module_data = {
            'id': module.id,
            'title': module.title,
            'order': module.order,
            'lessons': []
        }
        
        for lesson in module.lessons:
            lesson_data = {
                'id': lesson.id,
                'title': lesson.title,
                'order': lesson.order,
                'duration': lesson.estimated_duration_minutes,
                'segments_count': len(lesson.segments),
                'audio_ready': sum(1 for s in lesson.segments if s.audio_status == 'completed')
            }
            module_data['lessons'].append(lesson_data)
        
        modules_data.append(module_data)
    
    return jsonify(modules_data)

@app.route('/api/lessons/<lesson_id>/segments', methods=['GET'])
def get_lesson_segments(lesson_id):
    """Get all segments for a lesson"""
    lesson = Lesson.query.get_or_404(lesson_id)
    
    segments_data = []
    for segment in sorted(lesson.segments, key=lambda s: s.order):
        segment_data = {
            'id': segment.id,
            'title': segment.title,
            'type': segment.segment_type,
            'text': segment.text_content,
            'order': segment.order,
            'audio_url': segment.audio_url if segment.audio_url else None,
            'audio_status': segment.audio_status,
            'keywords': segment.keywords,
            'points': segment.points_value,
            'completed': segment.completed
        }
        
        # Add code example if present
        if segment.code_example:
            segment_data['code_example'] = segment.code_example
        
        # Add visuals
        segment_data['visuals'] = [{
            'id': v.id,
            'type': v.visual_type,
            'url': v.url,
            'alt_text': v.alt_text,
            'caption': v.caption
        } for v in segment.visuals]
        
        # Add interactive elements
        if segment.interactive_elements:
            segment_data['interactive_elements'] = segment.interactive_elements
        
        segments_data.append(segment_data)
    
    return jsonify({
        'lesson': {
            'id': lesson.id,
            'title': lesson.title,
            'objectives': lesson.learning_objectives
        },
        'segments': segments_data
    })

# Audio serving
@app.route('/audio/<audio_id>', methods=['GET'])
def serve_audio(audio_id):
    """Serve generated audio file"""
    file_path = AUDIO_OUTPUT_DIR / f"{audio_id}.wav"
    if file_path.exists():
        return send_file(str(file_path), mimetype='audio/wav')
    return jsonify({'error': 'Audio file not found'}), 404

# User progress
@app.route('/api/progress/<user_id>/lesson/<lesson_id>', methods=['GET'])
def get_lesson_progress(user_id, lesson_id):
    """Get user progress for a lesson"""
    lesson = Lesson.query.get_or_404(lesson_id)
    
    # Get completed segments
    completed_segments = []
    for segment in lesson.segments:
        progress = UserProgress.query.filter_by(
            user_id=user_id,
            segment_id=segment.id
        ).first()
        
        if progress and progress.completed:
            completed_segments.append(segment.id)
    
    return jsonify({
        'lesson_id': lesson_id,
        'total_segments': len(lesson.segments),
        'completed_segments': completed_segments,
        'progress_percentage': int((len(completed_segments) / len(lesson.segments)) * 100) if lesson.segments else 0
    })

@app.route('/api/progress/<user_id>/segment/<segment_id>/complete', methods=['POST'])
def mark_segment_complete(user_id, segment_id):
    """Mark a segment as completed"""
    segment = Segment.query.get_or_404(segment_id)
    
    # Find or create progress record
    progress = UserProgress.query.filter_by(
        user_id=user_id,
        segment_id=segment_id
    ).first()
    
    if not progress:
        progress = UserProgress(
            user_id=user_id,
            course_id=segment.lesson.module.course_id,
            module_id=segment.lesson.module_id,
            lesson_id=segment.lesson_id,
            segment_id=segment_id
        )
        db.session.add(progress)
    
    progress.completed = True
    progress.completed_at = datetime.utcnow()
    progress.points_earned = segment.points_value
    
    # Update segment completion
    segment.completed = True
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'points_earned': segment.points_value
    })

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    audio_files = len(list(AUDIO_OUTPUT_DIR.glob('*.wav')))
    total_segments = Segment.query.count()
    segments_with_audio = Segment.query.filter(Segment.audio_url != '').count()
    
    return jsonify({
        'status': 'healthy',
        'database': 'connected',
        'audio_files': audio_files,
        'total_segments': total_segments,
        'segments_with_audio': segments_with_audio
    })

if __name__ == '__main__':
    print("Starting integrated Neural Learn server...")
    print(f"Audio directory: {AUDIO_OUTPUT_DIR}")
    print(f"Learning content: {LEARNING_CONTENT_DIR}")
    app.run(host='0.0.0.0', port=5000, debug=True)