# app_rich.py - Simplified Backend without Language Features
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from models import db, Course, Module, Lesson, Segment, Visual, UserProgress
import os
import uuid
from datetime import datetime
from TTS.api import TTS
import torch
import threading
import queue

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///neural_learn_rich.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
UPLOAD_FOLDER = 'audio_outputs'
VISUAL_FOLDER = 'visual_assets'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(VISUAL_FOLDER, exist_ok=True)

# Initialize database
db.init_app(app)

# Initialize TTS model (English only)
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Initializing XTTS v2 on {device}...")
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)
print("Model loaded successfully!")

# Audio generation queue
audio_queue = queue.Queue()
generation_status = {}

def audio_worker():
    """Background worker for audio generation"""
    while True:
        task = audio_queue.get()
        if task is None:
            break
        
        task_id = task['id']
        entity_type = task.get('entity_type')
        entity_id = task.get('entity_id')
        
        try:
            generation_status[task_id] = {'status': 'processing', 'progress': 0}
            
            # Generate audio in English only
            output_path = os.path.join(UPLOAD_FOLDER, f"{task_id}.wav")
            tts.tts_to_file(
                text=task['text'],
                language='en',  # Always English
                file_path=output_path
            )
            
            # Update status
            generation_status[task_id] = {
                'status': 'completed',
                'progress': 100,
                'file_path': output_path,
                'url': f"/audio/{task_id}"
            }
            
            # Update entity in database
            if entity_type == 'segment':
                segment = Segment.query.get(entity_id)
                if segment:
                    segment.audio_status = 'completed'
                    segment.audio_url = f"/audio/{task_id}"
                    segment.audio_task_id = task_id
                    db.session.commit()
                    
        except Exception as e:
            generation_status[task_id] = {
                'status': 'error',
                'error': str(e)
            }
        
        audio_queue.task_done()

# Start background worker
worker_thread = threading.Thread(target=audio_worker, daemon=True)
worker_thread.start()

# Create tables
with app.app_context():
    db.create_all()

# Course Management Routes
@app.route('/api/courses', methods=['GET'])
def get_courses():
    """Get all courses"""
    courses = Course.query.all()
    return jsonify([{
        'id': c.id,
        'course_code': c.course_code,
        'title': c.title,
        'description': c.description,
        'prerequisites': c.prerequisites,
        'learning_objectives': c.learning_objectives,
        'instructor_name': c.instructor_name,
        'module_count': len(c.modules)
    } for c in courses])

@app.route('/api/courses/<course_id>/learning-view', methods=['GET'])
def get_course_learning_view(course_id):
    """Get course data optimized for learning mode"""
    course = Course.query.get_or_404(course_id)
    
    modules_data = []
    for module in course.modules:
        lessons_data = []
        for lesson in module.lessons:
            lessons_data.append({
                'id': lesson.id,
                'title': lesson.title,
                'duration': lesson.estimated_duration_minutes,
                'segment_count': len(lesson.segments),
                'completion_status': calculate_lesson_completion(lesson)
            })
        
        modules_data.append({
            'id': module.id,
            'title': module.title,
            'lessons': lessons_data
        })
    
    return jsonify({
        'course': {
            'id': course.id,
            'title': course.title,
            'description': course.description,
            'visual_theme': course.visual_theme
        },
        'modules': modules_data
    })

@app.route('/api/lessons/<lesson_id>/learning-content', methods=['GET'])
def get_lesson_learning_content(lesson_id):
    """Get complete lesson content for learning mode"""
    lesson = Lesson.query.get_or_404(lesson_id)
    
    segments_data = []
    for segment in lesson.segments:
        visuals_data = []
        for visual in segment.visuals:
            visuals_data.append({
                'id': visual.id,
                'type': visual.visual_type,
                'url': visual.asset_url,
                'alt_text': visual.alt_text,
                'caption': visual.caption,
                'timing': visual.display_timing,
                'animation': visual.animation_hints,
                'data': visual.embedded_data
            })
        
        # Add code example if present
        code_example = None
        if segment.segment_type in ['example', 'formula_derivation']:
            # Mock code example - in real app, this would be stored in DB
            code_example = {
                'language': 'python',
                'code': '# Example code for this segment\nprint("Hello, Neural Learn!")'
            }
        
        segments_data.append({
            'id': segment.id,
            'title': segment.title,
            'type': segment.segment_type,
            'text': segment.text_content,
            'audio_url': segment.audio_url,
            'audio_status': segment.audio_status,
            'visuals': visuals_data,
            'keywords': segment.keywords,
            'further_reading_links': segment.further_reading_links,
            'code_example': code_example
        })
    
    return jsonify({
        'lesson': {
            'id': lesson.id,
            'title': lesson.title,
            'objectives': lesson.learning_objectives,
            'intro_audio_url': lesson.intro_audio_url,
            'intro_visual': {
                'type': lesson.intro_visual_type,
                'url': lesson.intro_visual_url,
                'caption': lesson.intro_visual_caption
            }
        },
        'segments': segments_data,
        'summary': {
            'text': lesson.summary_text,
            'audio_url': lesson.summary_audio_url
        }
    })

# Segment Management Routes
@app.route('/api/segments/<segment_id>/generate-audio', methods=['POST'])
def generate_segment_audio(segment_id):
    """Generate audio for a segment"""
    segment = Segment.query.get_or_404(segment_id)
    
    task_id = str(uuid.uuid4())
    audio_queue.put({
        'id': task_id,
        'entity_type': 'segment',
        'entity_id': segment_id,
        'text': segment.text_content
    })
    
    segment.audio_status = 'processing'
    db.session.commit()
    
    return jsonify({
        'task_id': task_id,
        'message': 'Audio generation started'
    })

# User Progress Routes
@app.route('/api/progress/<user_id>/course/<course_id>', methods=['GET'])
def get_user_progress(user_id, course_id):
    """Get user progress for a course"""
    progress = UserProgress.query.filter_by(user_id=user_id, course_id=course_id).first()
    if not progress:
        return jsonify({
            'completed_segments': [],
            'current_segment_id': None,
            'total_time_spent_minutes': 0
        })
    
    return jsonify({
        'completed_segments': progress.completed_segments or [],
        'current_module_id': progress.current_module_id,
        'current_lesson_id': progress.current_lesson_id,
        'current_segment_id': progress.current_segment_id,
        'total_time_spent_minutes': progress.total_time_spent_minutes
    })

@app.route('/api/progress/<user_id>/course/<course_id>/segment/<segment_id>', methods=['POST'])
def update_segment_progress(user_id, course_id, segment_id):
    """Mark a segment as completed"""
    progress = UserProgress.query.filter_by(user_id=user_id, course_id=course_id).first()
    if not progress:
        progress = UserProgress(user_id=user_id, course_id=course_id, completed_segments=[])
        db.session.add(progress)
    
    completed = progress.completed_segments or []
    if segment_id not in completed:
        completed.append(segment_id)
        progress.completed_segments = completed
    
    progress.current_segment_id = segment_id
    progress.last_accessed = datetime.utcnow()
    db.session.commit()
    
    return jsonify({'message': 'Progress updated'})

# Content Creation Routes
@app.route('/api/courses', methods=['POST'])
def create_course():
    """Create a new course"""
    data = request.json
    course = Course(
        course_code=data['course_code'],
        title=data['title'],
        description=data.get('description', ''),
        prerequisites=data.get('prerequisites', []),
        learning_objectives=data.get('learning_objectives', []),
        instructor_name=data.get('instructor_name'),
        instructor_bio=data.get('instructor_bio'),
        visual_theme=data.get('visual_theme', {
            'primaryColor': '#6366f1',
            'secondaryColor': '#8b5cf6',
            'fontFamily': 'Inter, sans-serif',
            'iconStyle': 'modern_minimal'
        })
    )
    db.session.add(course)
    db.session.commit()
    return jsonify({'id': course.id, 'message': 'Course created successfully'})

@app.route('/api/courses/<course_id>/modules', methods=['GET'])
def get_modules(course_id):
    """Get all modules for a course"""
    modules = Module.query.filter_by(course_id=course_id).order_by(Module.order).all()
    return jsonify([{
        'id': m.id,
        'title': m.title,
        'order': m.order,
        'learning_objectives': m.learning_objectives,
        'lesson_count': len(m.lessons)
    } for m in modules])

# Utility functions
def calculate_lesson_completion(lesson):
    """Calculate completion percentage for a lesson"""
    total_segments = len(lesson.segments)
    if total_segments == 0:
        return 0
    
    completed_segments = sum(1 for s in lesson.segments if s.audio_status == 'completed')
    return int((completed_segments / total_segments) * 100)

# Audio serving
@app.route('/audio/<task_id>', methods=['GET'])
def serve_audio(task_id):
    """Serve generated audio file"""
    file_path = os.path.join(UPLOAD_FOLDER, f"{task_id}.wav")
    if os.path.exists(file_path):
        return send_file(file_path, mimetype='audio/wav')
    return jsonify({'error': 'Audio file not found'}), 404

# Initialize with sample data
@app.route('/api/init-sample-data', methods=['POST'])
def init_sample_data():
    """Initialize database with sample course data"""
    # Check if data already exists
    if Course.query.first():
        return jsonify({'message': 'Data already exists'})
    
    # Create sample course
    course = Course(
        course_code='ASTRO101',
        title='Introduction to Astrophysics',
        description='Explore the wonders of the cosmos in this comprehensive journey through space and time.',
        prerequisites=['High School Physics', 'Basic Mathematics'],
        learning_objectives=[
            'Understand fundamental principles of celestial mechanics',
            'Describe the life cycle of stars',
            'Explain galaxy formation and evolution',
            'Discuss current cosmological theories'
        ],
        instructor_name='Dr. Carl Cosmos'
    )
    db.session.add(course)
    db.session.commit()
    
    # Create sample module
    module = Module(
        course_id=course.id,
        title='Our Place in the Universe',
        order=1,
        learning_objectives=[
            'Grasp the scale of the universe',
            'Understand cosmic distances',
            'Learn about astronomical tools'
        ]
    )
    db.session.add(module)
    db.session.commit()
    
    # Create sample lesson
    lesson = Lesson(
        module_id=module.id,
        title='Cosmic Scales and Distances',
        order=1,
        estimated_duration_minutes=45,
        learning_objectives=[
            'Define astronomical units',
            'Compare sizes of celestial objects',
            'Appreciate the vastness of space'
        ]
    )
    db.session.add(lesson)
    db.session.commit()
    
    # Create sample segments
    segments = [
        {
            'title': 'What is an Astronomical Unit?',
            'type': 'definition',
            'text': 'The Astronomical Unit (AU) is a unit of length, roughly the distance from Earth to the Sun. It\'s defined as exactly 149,597,870,700 meters (about 150 million kilometers). This unit helps us measure distances within our Solar System.'
        },
        {
            'title': 'Light Years and Parsecs',
            'type': 'explanation',
            'text': 'For distances beyond our Solar System, we use light-years and parsecs. A light-year is the distance light travels in one year - about 9.46 trillion kilometers. A parsec is approximately 3.26 light-years.'
        },
        {
            'title': 'The Scale of the Universe',
            'type': 'example',
            'text': 'To put these distances in perspective: If Earth were the size of a marble, the Sun would be a beach ball 15 meters away. The nearest star would be another beach ball 4,000 kilometers away!'
        }
    ]
    
    for i, seg_data in enumerate(segments):
        segment = Segment(
            lesson_id=lesson.id,
            title=seg_data['title'],
            segment_type=seg_data['type'],
            text_content=seg_data['text'],
            order=i,
            keywords=['astronomy', 'distance', 'space', 'measurement']
        )
        db.session.add(segment)
    
    db.session.commit()
    
    return jsonify({'message': 'Sample data initialized successfully'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)