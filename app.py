"""
Enhanced Flask Backend for Neural Learn Course Platform
Supports complex course hierarchy and interactive learning features
"""

from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.exceptions import NotFound
import os
import uuid
import json
from datetime import datetime
import threading
import queue
import time
from pathlib import Path

# Import enhanced models
from models import (
    db, Course, Lesson, Episode, Segment, User, UserProgress,
    SegmentInteraction, Checkpoint, Badge, UserCertificate,
    MediaAsset, VisualAsset, InteractiveCueTemplate, AnalyticsEvent,
    create_course_from_json
)

app = Flask(__name__, static_folder='static', static_url_path='/static')
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///neural_learn_v2.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'dev-secret-key-change-in-production'

# Initialize database
db.init_app(app)

# Audio generation queue (keeping existing TTS functionality)
audio_queue = queue.Queue()
audio_status = {}

# Directories
AUDIO_DIR = Path("audio_outputs")
VISUAL_DIR = Path("visual_assets")
LEARNING_CONTENT_DIR = Path("learning_content")

# Ensure directories exist
for dir_path in [AUDIO_DIR, VISUAL_DIR, LEARNING_CONTENT_DIR]:
    dir_path.mkdir(exist_ok=True)

# TTS functionality with PyTorch 2.7 compatibility fixes
TTS_AVAILABLE = False
tts = None
tts_models = {}
device = "cpu"

# Voice presets for different segment types
VOICE_PRESETS = {
    'instructor_male': {'name': 'Professional Instructor (Male)', 'speed': 1.0},
    'instructor_female': {'name': 'Professional Instructor (Female)', 'speed': 1.0},
    'enthusiastic': {'name': 'Enthusiastic Teacher', 'speed': 1.1},
    'calm_explainer': {'name': 'Calm Explainer', 'speed': 0.95}
}

def initialize_tts():
    """Initialize TTS with PyTorch 2.7 compatibility fixes"""
    global TTS_AVAILABLE, tts, tts_models, device
    try:
        import warnings
        warnings.filterwarnings("ignore", message="You are using `torch.load` with `weights_only=False`")
        
        import torch
        import torch.serialization
        torch.serialization.add_safe_globals(['TTS.tts.configs.xtts_config.XttsConfig'])
        
        from TTS.api import TTS
        
        # Monkey patch torch.load for XTTS compatibility
        original_load = torch.load
        def patched_load(f, *args, **kwargs):
            kwargs['weights_only'] = False
            return original_load(f, *args, **kwargs)
        torch.load = patched_load
        
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {device}")
        
        # Try to load XTTS v2
        try:
            tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)
            tts_models['xtts_v2'] = tts
            TTS_AVAILABLE = True
            print("✓ XTTS v2 loaded successfully")
        except Exception as e:
            print(f"Failed to load XTTS v2: {e}")
            # Fallback to Tacotron2
            try:
                tts = TTS("tts_models/en/ljspeech/tacotron2-DDC").to(device)
                tts_models['tacotron2'] = tts
                TTS_AVAILABLE = True
                print("✓ Tacotron2-DDC loaded as fallback")
            except Exception as e2:
                print(f"Failed to load Tacotron2: {e2}")
        
    except Exception as e:
        print(f"TTS not available: {e}")
        TTS_AVAILABLE = False

# Initialize TTS on startup
initialize_tts()

# Health Check API

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify service status"""
    try:
        # Check database connectivity
        db_status = "healthy"
        try:
            # Simple query to test database connection
            User.query.first()
        except Exception as e:
            db_status = f"unhealthy: {str(e)}"
        
        # Check TTS status
        tts_status = "healthy" if TTS_AVAILABLE else "unavailable"
        tts_model = None
        if TTS_AVAILABLE and tts_models:
            tts_model = list(tts_models.keys())[0] if tts_models else None
        
        # Check audio queue status
        queue_size = audio_queue.qsize()
        active_tasks = len([s for s in audio_status.values() if s.get('status') == 'processing'])
        
        # Check directory access
        directories_ok = all([
            AUDIO_DIR.exists() and os.access(AUDIO_DIR, os.W_OK),
            VISUAL_DIR.exists() and os.access(VISUAL_DIR, os.W_OK),
            LEARNING_CONTENT_DIR.exists() and os.access(LEARNING_CONTENT_DIR, os.R_OK)
        ])
        
        health_info = {
            'status': 'healthy' if db_status == 'healthy' and directories_ok else 'degraded',
            'timestamp': datetime.utcnow().isoformat(),
            'version': '2.0.0',
            'services': {
                'database': {
                    'status': db_status,
                    'type': 'sqlite'
                },
                'tts': {
                    'status': tts_status,
                    'model': tts_model,
                    'device': device if TTS_AVAILABLE else None
                },
                'audio_processing': {
                    'queue_size': queue_size,
                    'active_tasks': active_tasks,
                    'total_processed': len(audio_status)
                },
                'storage': {
                    'directories_accessible': directories_ok,
                    'audio_files': len(list(AUDIO_DIR.glob('*.wav'))) if AUDIO_DIR.exists() else 0
                }
            }
        }
        
        return jsonify(health_info), 200 if health_info['status'] == 'healthy' else 503
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

# Course Management APIs

@app.route('/api/courses', methods=['GET'])
def get_courses():
    """List all available courses with basic info"""
    courses = Course.query.all()
    return jsonify([{
        'id': course.id,
        'title': course.title,
        'description': course.description,
        'totalEstimatedDuration': course.total_estimated_duration,
        'lessonCount': course.lessons.count(),
        'completionRequirements': course.completion_requirements
    } for course in courses])

@app.route('/api/courses/<course_id>', methods=['GET'])
def get_course_detail(course_id):
    """Get full course details with structure"""
    course = Course.query.get_or_404(course_id)
    
    # Get user progress if user_id provided
    user_id = request.args.get('user_id')
    user_progress = None
    if user_id:
        user_progress = UserProgress.query.filter_by(
            user_id=user_id,
            course_id=course_id
        ).first()
    
    return jsonify({
        'id': course.id,
        'title': course.title,
        'description': course.description,
        'totalEstimatedDuration': course.total_estimated_duration,
        'completionRequirements': course.completion_requirements,
        'certificateId': course.certificate_id,
        'supportingMaterials': course.supporting_materials,
        'lessons': [{
            'id': lesson.id,
            'title': lesson.title,
            'order': lesson.order,
            'totalEstimatedDuration': lesson.total_estimated_duration,
            'learningObjectives': lesson.learning_objectives,
            'episodeCount': lesson.episodes.count(),
            'isCompleted': user_progress and lesson.id in user_progress.completed_episodes if user_progress else False
        } for lesson in course.lessons],
        'userProgress': {
            'pointsEarned': user_progress.points_earned,
            'badgesEarned': user_progress.badges_earned,
            'completedEpisodes': len(user_progress.completed_episodes),
            'currentEpisodeId': user_progress.current_episode_id
        } if user_progress else None
    })

@app.route('/api/courses/<course_id>/structure', methods=['GET'])
def get_course_structure(course_id):
    """Get lightweight course structure for navigation"""
    course = Course.query.get_or_404(course_id)
    
    structure = {
        'courseId': course.id,
        'courseTitle': course.title,
        'lessons': []
    }
    
    for lesson in course.lessons:
        lesson_data = {
            'lessonId': lesson.id,
            'title': lesson.title,
            'order': lesson.order,
            'episodes': []
        }
        
        for episode in lesson.episodes:
            episode_data = {
                'episodeId': episode.id,
                'title': episode.title,
                'order': episode.order,
                'segmentCount': episode.segments.count(),
                'hasCheckpoint': episode.checkpoint_id is not None,
                'badgeOnCompletion': episode.badge_on_completion
            }
            lesson_data['episodes'].append(episode_data)
        
        structure['lessons'].append(lesson_data)
    
    return jsonify(structure)

# Lesson Management APIs

@app.route('/api/lessons/<lesson_id>', methods=['GET'])
def get_lesson(lesson_id):
    """Get lesson details with episodes"""
    lesson = Lesson.query.get_or_404(lesson_id)
    
    return jsonify({
        'id': lesson.id,
        'courseId': lesson.course_id,
        'title': lesson.title,
        'order': lesson.order,
        'totalEstimatedDuration': lesson.total_estimated_duration,
        'learningObjectives': lesson.learning_objectives,
        'episodes': [{
            'id': episode.id,
            'title': episode.title,
            'order': episode.order,
            'estimatedDuration': episode.estimated_duration,
            'learningObjectives': episode.learning_objectives,
            'prerequisite': episode.prerequisite,
            'hasCheckpoint': episode.checkpoint_id is not None,
            'segmentCount': episode.segments.count()
        } for episode in lesson.episodes]
    })

@app.route('/api/lessons/<lesson_id>/prerequisites', methods=['GET'])
def check_lesson_prerequisites(lesson_id):
    """Check if user meets prerequisites for lesson"""
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'User ID required'}), 400
    
    lesson = Lesson.query.get_or_404(lesson_id)
    user_progress = UserProgress.query.filter_by(
        user_id=user_id,
        course_id=lesson.course_id
    ).first()
    
    if not user_progress:
        return jsonify({'canAccess': False, 'reason': 'No progress found'})
    
    # Check if previous lessons are completed
    previous_lessons = Lesson.query.filter(
        Lesson.course_id == lesson.course_id,
        Lesson.order < lesson.order
    ).all()
    
    for prev_lesson in previous_lessons:
        episodes_completed = all(
            ep.id in user_progress.completed_episodes
            for ep in prev_lesson.episodes
        )
        if not episodes_completed:
            return jsonify({
                'canAccess': False,
                'reason': f'Complete lesson: {prev_lesson.title}'
            })
    
    return jsonify({'canAccess': True})

# Episode Management APIs

@app.route('/api/episodes/<episode_id>', methods=['GET'])
def get_episode(episode_id):
    """Get episode with all segments"""
    episode = Episode.query.get_or_404(episode_id)
    
    return jsonify({
        'id': episode.id,
        'lessonId': episode.lesson_id,
        'title': episode.title,
        'order': episode.order,
        'estimatedDuration': episode.estimated_duration,
        'learningObjectives': episode.learning_objectives,
        'prerequisite': episode.prerequisite,
        'checkpointId': episode.checkpoint_id,
        'summaryReelAssetId': episode.summary_reel_asset_id,
        'completionCriteria': episode.completion_criteria,
        'badgeOnCompletion': episode.badge_on_completion,
        'segments': [{
            'id': segment.id,
            'order': segment.order,
            'segmentType': segment.segment_type,
            'title': segment.title,
            'learningObjectives': segment.learning_objectives,
            'textContent': segment.text_content,
            'estimatedDuration': segment.estimated_duration,
            'mediaRefs': segment.media_refs,
            'interactiveCue': segment.interactive_cue,
            'codeExample': segment.code_example,
            'dashboardExample': segment.dashboard_example,
            'keywords': segment.keywords,
            'pointsAwarded': segment.points_awarded,
            'analytics': segment.analytics
        } for segment in episode.segments]
    })

@app.route('/api/episodes/<episode_id>/checkpoint', methods=['POST'])
def submit_checkpoint(episode_id):
    """Submit checkpoint answers"""
    episode = Episode.query.get_or_404(episode_id)
    checkpoint = Checkpoint.query.get(episode.checkpoint_id)
    
    if not checkpoint:
        return jsonify({'error': 'No checkpoint for this episode'}), 404
    
    data = request.json
    user_id = data.get('userId')
    answers = data.get('answers', [])
    
    # Calculate score
    correct_count = 0
    total_questions = len(checkpoint.questions)
    
    for i, answer in enumerate(answers):
        if i < total_questions and answer == checkpoint.questions[i].get('correctAnswer'):
            correct_count += 1
    
    score = correct_count / total_questions if total_questions > 0 else 0
    passed = score >= checkpoint.passing_score
    
    # Update user progress if passed
    if passed and user_id:
        user_progress = UserProgress.query.filter_by(
            user_id=user_id,
            course_id=episode.lesson.course_id
        ).first()
        
        if user_progress and episode.checkpoint_id not in user_progress.completed_checkpoints:
            user_progress.completed_checkpoints.append(episode.checkpoint_id)
            db.session.commit()
    
    return jsonify({
        'score': score,
        'passed': passed,
        'correctCount': correct_count,
        'totalQuestions': total_questions,
        'passingScore': checkpoint.passing_score
    })

@app.route('/api/episodes/<episode_id>/can-access', methods=['GET'])
def can_access_episode(episode_id):
    """Check if user can access episode based on prerequisites"""
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'User ID required'}), 400
    
    episode = Episode.query.get_or_404(episode_id)
    
    if not episode.prerequisite:
        return jsonify({'canAccess': True})
    
    user_progress = UserProgress.query.filter_by(
        user_id=user_id,
        course_id=episode.lesson.course_id
    ).first()
    
    if not user_progress:
        return jsonify({'canAccess': False, 'reason': 'No progress found'})
    
    # Check prerequisite episodes
    prereq_episodes = episode.prerequisite.get('episodeIds', [])
    for prereq_id in prereq_episodes:
        if prereq_id not in user_progress.completed_episodes:
            prereq_episode = Episode.query.get(prereq_id)
            return jsonify({
                'canAccess': False,
                'reason': f'Complete episode: {prereq_episode.title if prereq_episode else prereq_id}'
            })
    
    # Check skip option (quiz)
    skip_option = episode.prerequisite.get('skipOption')
    if skip_option:
        # TODO: Implement quiz check
        pass
    
    return jsonify({'canAccess': True})

# Segment Management APIs

@app.route('/api/segments/<segment_id>', methods=['GET'])
def get_segment(segment_id):
    """Get segment details"""
    segment = Segment.query.get_or_404(segment_id)
    
    return jsonify({
        'id': segment.id,
        'episodeId': segment.episode_id,
        'order': segment.order,
        'segmentType': segment.segment_type,
        'title': segment.title,
        'learningObjectives': segment.learning_objectives,
        'textContent': segment.text_content,
        'estimatedDuration': segment.estimated_duration,
        'mediaRefs': segment.media_refs,
        'interactiveCue': segment.interactive_cue,
        'codeExample': segment.code_example,
        'dashboardExample': segment.dashboard_example,
        'keywords': segment.keywords,
        'pointsAwarded': segment.points_awarded,
        'analytics': segment.analytics
    })

@app.route('/api/segments/<segment_id>/complete', methods=['POST'])
def complete_segment(segment_id):
    """Mark segment as completed"""
    segment = Segment.query.get_or_404(segment_id)
    data = request.json
    user_id = data.get('userId')
    
    if not user_id:
        return jsonify({'error': 'User ID required'}), 400
    
    # Get or create user progress
    user_progress = UserProgress.query.filter_by(
        user_id=user_id,
        course_id=segment.episode.lesson.course_id
    ).first()
    
    if not user_progress:
        user_progress = UserProgress(
            user_id=user_id,
            course_id=segment.episode.lesson.course_id,
            completed_segments=[],
            completed_episodes=[],
            completed_checkpoints=[],
            badges_earned=[]
        )
        db.session.add(user_progress)
    
    # Initialize lists if they are None (for existing records)
    if user_progress.completed_segments is None:
        user_progress.completed_segments = []
    if user_progress.completed_episodes is None:
        user_progress.completed_episodes = []
    if user_progress.points_earned is None:
        user_progress.points_earned = 0
    
    # Mark segment as completed
    if segment_id not in user_progress.completed_segments:
        user_progress.completed_segments.append(segment_id)
        user_progress.points_earned += segment.points_awarded or 0
        user_progress.current_segment_id = segment_id
        user_progress.current_episode_id = segment.episode_id
        user_progress.current_lesson_id = segment.episode.lesson_id
        
        # Check if episode is completed
        episode_segments = [s.id for s in segment.episode.segments]
        completed_in_episode = [s for s in episode_segments if s in user_progress.completed_segments]
        
        if len(completed_in_episode) == len(episode_segments):
            if segment.episode_id not in user_progress.completed_episodes:
                user_progress.completed_episodes.append(segment.episode_id)
                
                # Award badge if applicable
                if segment.episode.badge_on_completion:
                    # TODO: Award badge logic
                    pass
        
        db.session.commit()
    
    return jsonify({
        'success': True,
        'pointsEarned': segment.points_awarded or 0,
        'totalPoints': user_progress.points_earned,
        'episodeCompleted': segment.episode_id in user_progress.completed_episodes
    })

@app.route('/api/segments/<segment_id>/interaction', methods=['POST'])
def log_segment_interaction(segment_id):
    """Log user interaction with segment"""
    segment = Segment.query.get_or_404(segment_id)
    data = request.json
    
    interaction = SegmentInteraction(
        user_id=data.get('userId'),
        segment_id=segment_id,
        interaction_type=data.get('interactionType'),
        interaction_data=data.get('interactionData'),
        is_correct=data.get('isCorrect'),
        score=data.get('score')
    )
    
    db.session.add(interaction)
    
    # Log analytics event if enabled
    if segment.analytics.get('xapi_enabled'):
        analytics_event = AnalyticsEvent(
            user_id=data.get('userId'),
            verb='interacted',
            object_type='segment',
            object_id=segment_id,
            context_data={
                'interactionType': data.get('interactionType'),
                'episodeId': segment.episode_id,
                'lessonId': segment.episode.lesson_id
            },
            result_data=data.get('interactionData')
        )
        db.session.add(analytics_event)
    
    db.session.commit()
    
    return jsonify({'success': True})

# Visual Asset APIs

@app.route('/api/visual-assets/<asset_id>', methods=['GET'])
def get_visual_asset(asset_id):
    """Get visual asset metadata"""
    # First check if it's a real asset in the database
    visual_asset = VisualAsset.query.get(asset_id)
    
    if visual_asset:
        return jsonify({
            'id': visual_asset.id,
            'title': visual_asset.title,
            'url': visual_asset.file_url,
            'assetType': visual_asset.asset_type,
            'caption': visual_asset.caption,
            'enableZoom': visual_asset.asset_type in ['diagram', 'infographic']
        })
    
    # Otherwise, return a placeholder for demo purposes
    # In production, this would return 404
    placeholder_types = {
        'architecture': {
            'title': 'Kafka Architecture Diagram',
            'url': '/static/placeholders/architecture-diagram.svg',
            'assetType': 'diagram',
            'caption': 'High-level Kafka architecture overview',
            'enableZoom': True
        },
        'metrics': {
            'title': 'Metrics Dashboard',
            'url': '/static/placeholders/metrics-dashboard.png',
            'assetType': 'screenshot',
            'caption': 'Example metrics dashboard view',
            'enableZoom': True
        },
        'flow': {
            'title': 'Data Flow Diagram',
            'url': '/static/placeholders/data-flow.svg',
            'assetType': 'diagram',
            'caption': 'Message flow through Kafka cluster',
            'enableZoom': True
        }
    }
    
    # Try to match asset_id to a placeholder type
    for key, data in placeholder_types.items():
        if key in asset_id.lower():
            return jsonify({
                'id': asset_id,
                **data
            })
    
    # Default placeholder
    return jsonify({
        'id': asset_id,
        'title': 'Visual Asset',
        'url': '/static/placeholders/default-diagram.svg',
        'assetType': 'diagram',
        'caption': f'Placeholder for {asset_id}',
        'enableZoom': True
    })

# Progress Tracking APIs

@app.route('/api/users/<user_id>/progress', methods=['GET'])
def get_user_progress(user_id):
    """Get user's overall progress"""
    course_id = request.args.get('course_id')
    
    if course_id:
        progress = UserProgress.query.filter_by(
            user_id=user_id,
            course_id=course_id
        ).first()
        
        if not progress:
            return jsonify({'error': 'No progress found'}), 404
        
        return jsonify({
            'userId': user_id,
            'courseId': course_id,
            'currentLessonId': progress.current_lesson_id,
            'currentEpisodeId': progress.current_episode_id,
            'currentSegmentId': progress.current_segment_id,
            'completedSegments': progress.completed_segments,
            'completedEpisodes': progress.completed_episodes,
            'completedCheckpoints': progress.completed_checkpoints,
            'pointsEarned': progress.points_earned,
            'badgesEarned': progress.badges_earned,
            'totalTimeSpent': progress.total_time_spent,
            'lastAccessed': progress.last_accessed.isoformat() if progress.last_accessed else None
        })
    else:
        # Get all progress records for user
        all_progress = UserProgress.query.filter_by(user_id=user_id).all()
        
        return jsonify([{
            'courseId': p.course_id,
            'pointsEarned': p.points_earned,
            'episodesCompleted': len(p.completed_episodes),
            'lastAccessed': p.last_accessed.isoformat() if p.last_accessed else None
        } for p in all_progress])

@app.route('/api/users/<user_id>/award-badge', methods=['POST'])
def award_badge(user_id):
    """Award badge to user"""
    data = request.json
    badge_id = data.get('badgeId')
    course_id = data.get('courseId')
    
    user = User.query.get_or_404(user_id)
    badge = Badge.query.get_or_404(badge_id)
    
    # Check if already awarded
    if badge not in user.earned_badges:
        user.earned_badges.append(badge)
        
        # Update progress record
        if course_id:
            progress = UserProgress.query.filter_by(
                user_id=user_id,
                course_id=course_id
            ).first()
            if progress and badge_id not in progress.badges_earned:
                progress.badges_earned.append(badge_id)
        
        db.session.commit()
    
    return jsonify({
        'success': True,
        'badge': {
            'id': badge.id,
            'name': badge.name,
            'description': badge.description,
            'iconUrl': badge.icon_url
        }
    })

@app.route('/api/users/<user_id>/certificates', methods=['GET'])
def get_user_certificates(user_id):
    """Get user's earned certificates"""
    certificates = UserCertificate.query.filter_by(user_id=user_id).all()
    
    return jsonify([{
        'courseId': cert.course_id,
        'certificateId': cert.certificate_id,
        'issuedAt': cert.issued_at.isoformat(),
        'certificateData': cert.certificate_data,
        'publicUrl': cert.public_url
    } for cert in certificates])

# Media Management APIs (Enhanced)

@app.route('/api/generate-segment-audio', methods=['POST'])
def generate_segment_audio():
    """Generate audio for a segment"""
    if not TTS_AVAILABLE:
        return jsonify({'error': 'TTS not available'}), 503
    
    data = request.json
    segment_id = data.get('segmentId')
    text = data.get('text')
    voice = data.get('voice', 'default')
    language = data.get('language', 'en')
    
    if not segment_id or not text:
        return jsonify({'error': 'Segment ID and text required'}), 400
    
    task_id = str(uuid.uuid4())
    
    # Add to queue
    audio_queue.put({
        'task_id': task_id,
        'segment_id': segment_id,
        'text': text,
        'voice': voice,
        'language': language
    })
    
    audio_status[task_id] = {
        'status': 'queued',
        'segment_id': segment_id
    }
    
    return jsonify({
        'taskId': task_id,
        'status': 'queued'
    })

@app.route('/api/audio-status/<task_id>', methods=['GET'])
def get_audio_status(task_id):
    """Check status of audio generation task"""
    if task_id not in audio_status:
        return jsonify({'error': 'Task not found'}), 404
    
    status_info = audio_status[task_id].copy()
    
    # Add additional info if completed
    if status_info['status'] == 'completed' and 'audio_url' in status_info:
        # Get file size if available
        audio_filename = status_info['audio_url'].split('/')[-1]
        audio_path = AUDIO_DIR / audio_filename
        if audio_path.exists():
            status_info['fileSize'] = audio_path.stat().st_size
    
    return jsonify(status_info)


@app.route('/api/code-examples/highlight', methods=['POST'])
def highlight_code():
    """Syntax highlight code examples"""
    data = request.json
    code = data.get('code', '')
    language = data.get('language', 'python')
    
    # TODO: Implement syntax highlighting
    # For now, return as-is
    
    return jsonify({
        'highlighted': code,
        'language': language
    })

# Interactive Cue Templates

@app.route('/api/interactive-cues/templates', methods=['GET'])
def get_interactive_templates():
    """Get all available interactive cue templates"""
    templates = InteractiveCueTemplate.query.all()
    
    return jsonify([{
        'cueType': template.cue_type,
        'name': template.name,
        'description': template.description,
        'defaultConfig': template.default_config,
        'requiredFields': template.required_fields,
        'componentName': template.component_name
    } for template in templates])

# Data Initialization

@app.route('/api/init-course-data', methods=['POST'])
def init_course_data():
    """Initialize database with course data from JSON files"""
    try:
        # Load analyticsSummary.json
        analytics_path = LEARNING_CONTENT_DIR / 'analyticsSummary.json'
        if analytics_path.exists():
            with open(analytics_path, 'r') as f:
                course_data = json.load(f)
            
            # Create course from JSON
            course = create_course_from_json(course_data)
            course.id = "kafka-monitoring-course-v2"
            course.title = "Kafka Monitoring with Share Groups"
            course.description = "Master Kafka monitoring including the new Share Groups feature"
            
            # Add to database
            db.session.add(course)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Course data initialized',
                'courseId': course.id
            })
        else:
            return jsonify({'error': 'Course data file not found'}), 404
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Audio worker thread (keeping existing implementation)
def audio_worker():
    """Background worker for audio generation"""
    while True:
        try:
            task = audio_queue.get(timeout=1)
            task_id = task['task_id']
            
            audio_status[task_id]['status'] = 'processing'
            
            # Generate audio with voice customization
            audio_path = AUDIO_DIR / f"{task['segment_id']}_{task_id}.wav"
            voice_preset = task.get('voice', 'instructor_male')
            language = task.get('language', 'en')
            
            if TTS_AVAILABLE and tts:
                try:
                    # Check if we have XTTS v2 for multilingual support
                    if 'xtts_v2' in tts_models:
                        tts_models['xtts_v2'].tts_to_file(
                            text=task['text'],
                            language=language,
                            file_path=str(audio_path),
                            speed=VOICE_PRESETS.get(voice_preset, {}).get('speed', 1.0)
                        )
                    else:
                        # Fallback to basic TTS
                        tts.tts_to_file(
                            text=task['text'],
                            file_path=str(audio_path)
                        )
                except Exception as e:
                    print(f"TTS generation failed: {e}")
                    raise
            
            audio_status[task_id] = {
                'status': 'completed',
                'segment_id': task['segment_id'],
                'audio_url': f'/audio/{audio_path.name}'
            }
            
            # Create media asset record
            media_asset = MediaAsset(
                id=f"audio_{task_id}",
                asset_type='audio',
                file_path=str(audio_path),
                file_url=f'/audio/{audio_path.name}',
                source_text=task['text'],
                generation_params={
                    'voice': task['voice'],
                    'language': task['language']
                },
                generation_task_id=task_id
            )
            db.session.add(media_asset)
            db.session.commit()
            
        except queue.Empty:
            continue
        except Exception as e:
            if 'task_id' in locals():
                audio_status[task_id] = {
                    'status': 'failed',
                    'error': str(e)
                }

# Start audio worker
if TTS_AVAILABLE:
    audio_thread = threading.Thread(target=audio_worker, daemon=True)
    audio_thread.start()

def init_database():
    """Initialize database tables and data"""
    with app.app_context():
        db.create_all()
        
        # Initialize interactive cue templates
        cue_types = [
            ('hover_to_explore', 'Hover to Explore', 'User hovers over elements to reveal information'),
            ('drag_to_distribute', 'Drag to Distribute', 'User drags items to different locations'),
            ('click_to_compare', 'Click to Compare', 'User clicks to see comparisons'),
            ('simulation', 'Simulation', 'Interactive simulation'),
            ('predict_value_change', 'Predict Value Change', 'User predicts how values will change'),
            ('code_completion', 'Code Completion', 'User completes code snippets'),
            ('scenario_selection', 'Scenario Selection', 'User selects from multiple scenarios'),
            ('pause_and_reflect', 'Pause and Reflect', 'Pause for user reflection'),
            ('important_note', 'Important Note', 'Display important information'),
            ('interactive_explorer', 'Interactive Explorer', 'Explore interactive content'),
            ('field_mapping_exercise', 'Field Mapping Exercise', 'Map fields between systems'),
            ('ui_simulation', 'UI Simulation', 'Simulate UI interactions')
        ]
        
        for cue_type, name, description in cue_types:
            if not InteractiveCueTemplate.query.filter_by(cue_type=cue_type).first():
                template = InteractiveCueTemplate(
                    cue_type=cue_type,
                    name=name,
                    description=description,
                    component_name=f"{cue_type.title().replace('_', '')}Component"
                )
                db.session.add(template)
        
        db.session.commit()


# Interaction logging endpoint
@app.route('/api/interactions/log', methods=['POST'])
def log_interaction():
    """Log user interaction from frontend"""
    data = request.json
    
    # For now, just log and return success
    # In production, this would save to database
    print(f"Interaction logged: {data}")
    
    return jsonify({
        'success': True,
        'message': 'Interaction logged'
    })

# Audio file serving
@app.route('/audio/<filename>')
def serve_audio(filename):
    """Serve generated audio files"""
    try:
        return send_from_directory(AUDIO_DIR, filename)
    except FileNotFoundError:
        return jsonify({'error': 'Audio file not found'}), 404

# Static placeholder serving
@app.route('/static/placeholders/<filename>')
def serve_placeholder(filename):
    """Serve placeholder images"""
    placeholders_dir = Path(__file__).parent / 'static' / 'placeholders'
    
    # Create directory if it doesn't exist
    placeholders_dir.mkdir(parents=True, exist_ok=True)
    
    # If file doesn't exist, generate a simple SVG placeholder
    file_path = placeholders_dir / filename
    if not file_path.exists() and filename.endswith('.svg'):
        svg_content = generate_placeholder_svg(filename)
        with open(file_path, 'w') as f:
            f.write(svg_content)
    
    try:
        return send_from_directory(placeholders_dir, filename)
    except FileNotFoundError:
        return jsonify({'error': 'Placeholder not found'}), 404

def generate_placeholder_svg(filename):
    """Generate a simple SVG placeholder"""
    title = filename.replace('-', ' ').replace('.svg', '').title()
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="400" fill="#f0f0f0" stroke="#ddd" stroke-width="2"/>
    <text x="400" y="200" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="#666">
        {title}
    </text>
    <text x="400" y="230" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#999">
        Placeholder Image
    </text>
</svg>'''

# Serve frontend
@app.route('/')
def index():
    """Serve the main application page"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files (JS, CSS, etc.)"""
    if path.endswith(('.js', '.css', '.html', '.json')):
        return send_from_directory('.', path)
    return jsonify({'error': 'Resource not found'}), 404

# Health check endpoint is already defined above

# Analytics API Routes
@app.route('/api/analytics/events', methods=['POST'])
def track_analytics_events():
    """Receive and process analytics events from frontend"""
    data = request.json
    events = data.get('events', [])
    session_id = data.get('sessionId')
    
    try:
        # Process each event
        for event in events:
            # Create analytics event record
            analytics_event = AnalyticsEvent(
                id=event.get('id', str(uuid.uuid4())),
                user_id=event.get('userId'),
                session_id=session_id,
                event_type=event.get('eventType'),
                event_data=event.get('data', {}),
                timestamp=datetime.fromtimestamp(event.get('timestamp', 0) / 1000),
                context=event.get('context', {})
            )
            db.session.add(analytics_event)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'processed': len(events),
            'message': f'Processed {len(events)} analytics events'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/analytics/insights', methods=['GET'])
def get_analytics_insights():
    """Get analytics insights for a time range"""
    time_range = request.args.get('range', 'week')
    user_id = request.args.get('userId')
    
    try:
        # Calculate time window
        from datetime import timedelta
        now = datetime.now()
        if time_range == 'day':
            start_time = now - timedelta(days=1)
        elif time_range == 'week':
            start_time = now - timedelta(weeks=1)
        elif time_range == 'month':
            start_time = now - timedelta(days=30)
        else:
            start_time = now - timedelta(weeks=1)
        
        # Query analytics events
        query = AnalyticsEvent.query.filter(AnalyticsEvent.timestamp >= start_time)
        if user_id:
            query = query.filter_by(user_id=user_id)
        
        events = query.all()
        
        # Calculate insights
        insights = calculate_insights(events)
        
        return jsonify({
            'success': True,
            'data': insights,
            'timeRange': time_range,
            'eventCount': len(events)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/analytics/metrics/<metric_type>', methods=['GET'])
def get_specific_metric(metric_type):
    """Get a specific analytics metric"""
    user_id = request.args.get('userId')
    segment_id = request.args.get('segmentId')
    course_id = request.args.get('courseId')
    
    try:
        if metric_type == 'engagement':
            metric_data = calculate_engagement_metrics(user_id, course_id)
        elif metric_type == 'performance':
            metric_data = calculate_performance_metrics(user_id, course_id)
        elif metric_type == 'retention':
            metric_data = calculate_retention_metrics(user_id)
        elif metric_type == 'progress':
            metric_data = calculate_progress_metrics(user_id, course_id)
        else:
            return jsonify({'error': 'Unknown metric type'}), 400
        
        return jsonify({
            'success': True,
            'metricType': metric_type,
            'data': metric_data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/analytics/recommendations', methods=['GET'])
def get_learning_recommendations():
    """Get personalized learning recommendations based on analytics"""
    user_id = request.args.get('userId')
    
    if not user_id:
        return jsonify({'error': 'User ID required'}), 400
    
    try:
        recommendations = generate_recommendations(user_id)
        
        return jsonify({
            'success': True,
            'recommendations': recommendations
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Analytics helper functions
def calculate_insights(events):
    """Calculate analytics insights from events"""
    if not events:
        return {
            'engagement': {'score': 0, 'trend': 'neutral'},
            'performance': {'score': 0, 'improvement': 0},
            'recommendations': [],
            'trends': []
        }
    
    # Group events by type
    event_types = {}
    for event in events:
        event_type = event.event_type
        if event_type not in event_types:
            event_types[event_type] = []
        event_types[event_type].append(event)
    
    # Calculate engagement score
    total_events = len(events)
    interaction_events = len(event_types.get('interaction_complete', []))
    view_events = len(event_types.get('segment_view', []))
    
    engagement_score = min(100, (interaction_events * 2 + view_events) / max(1, total_events) * 100)
    
    # Calculate performance metrics
    quiz_events = event_types.get('quiz_attempt', [])
    avg_score = 0
    if quiz_events:
        scores = [e.event_data.get('score', 0) for e in quiz_events]
        avg_score = sum(scores) / len(scores)
    
    # Generate basic recommendations
    recommendations = []
    if engagement_score < 50:
        recommendations.append({
            'type': 'engagement',
            'message': 'Try completing more interactive exercises',
            'priority': 'high'
        })
    if avg_score < 70 and quiz_events:
        recommendations.append({
            'type': 'performance',
            'message': 'Review recent topics before proceeding',
            'priority': 'medium'
        })
    
    return {
        'engagement': {
            'score': engagement_score,
            'trend': 'improving' if engagement_score > 70 else 'needs_attention'
        },
        'performance': {
            'score': avg_score,
            'improvement': 5  # Placeholder
        },
        'recommendations': recommendations,
        'trends': [
            {'name': 'Daily Activity', 'data': calculate_daily_trends(events)},
            {'name': 'Topic Progress', 'data': calculate_topic_trends(events)}
        ]
    }

def calculate_engagement_metrics(user_id, course_id=None):
    """Calculate engagement metrics for a user"""
    # Placeholder implementation
    return {
        'totalTime': 3600,  # seconds
        'sessionsCount': 12,
        'averageSessionLength': 300,
        'interactionRate': 0.75,
        'lastActive': datetime.now().isoformat()
    }

def calculate_performance_metrics(user_id, course_id=None):
    """Calculate performance metrics for a user"""
    # Placeholder implementation
    return {
        'averageScore': 85,
        'improvementRate': 0.12,
        'strengthAreas': ['Problem Solving', 'Code Analysis'],
        'weaknessAreas': ['Memory Management'],
        'recommendedDifficulty': 'intermediate'
    }

def calculate_retention_metrics(user_id):
    """Calculate retention metrics for a user"""
    # Placeholder implementation
    return {
        'retentionRate': 0.78,
        'streakDays': 5,
        'longestStreak': 12,
        'returnRate': 0.85
    }

def calculate_progress_metrics(user_id, course_id=None):
    """Calculate progress metrics for a user"""
    # Placeholder implementation
    return {
        'completionRate': 0.65,
        'currentLesson': 3,
        'totalLessons': 8,
        'estimatedTimeToComplete': 240  # minutes
    }

def generate_recommendations(user_id):
    """Generate personalized recommendations for a user"""
    # Placeholder implementation
    return [
        {
            'type': 'next_lesson',
            'title': 'Advanced Data Structures',
            'reason': 'Based on your progress in basic structures',
            'confidence': 0.85
        },
        {
            'type': 'review',
            'title': 'Review: Memory Management',
            'reason': 'Lower performance detected in recent quiz',
            'confidence': 0.72
        },
        {
            'type': 'practice',
            'title': 'Interactive Exercise: Binary Trees',
            'reason': 'Reinforce recent learning',
            'confidence': 0.68
        }
    ]

def calculate_daily_trends(events):
    """Calculate daily activity trends"""
    # Placeholder - would group events by day
    return [
        {'date': '2024-01-01', 'value': 45},
        {'date': '2024-01-02', 'value': 52},
        {'date': '2024-01-03', 'value': 38}
    ]

def calculate_topic_trends(events):
    """Calculate topic progress trends"""
    # Placeholder - would analyze topic completion
    return [
        {'topic': 'Introduction', 'progress': 100},
        {'topic': 'Fundamentals', 'progress': 75},
        {'topic': 'Advanced', 'progress': 30}
    ]

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

# Register adaptive learning routes
try:
    from adaptive_learning import create_adaptive_routes
    create_adaptive_routes(app)
    print("Adaptive learning routes registered successfully")
except ImportError:
    print("Adaptive learning module not found, skipping adaptive routes")
except Exception as e:
    print(f"Error loading adaptive learning routes: {e}")

if __name__ == '__main__':
    # Initialize database
    init_database()
    
    app.run(debug=True, port=5000)