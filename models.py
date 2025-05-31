"""
Enhanced Data Models for Neural Learn Course Platform
Supports the complex course structure from analyticsSummary.json
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

# Association tables for many-to-many relationships
user_badges = db.Table('user_badges',
    db.Column('user_id', db.String(50), db.ForeignKey('users.id'), primary_key=True),
    db.Column('badge_id', db.String(100), db.ForeignKey('badges.id'), primary_key=True),
    db.Column('earned_at', db.DateTime, default=datetime.utcnow)
)

# Core Learning Structure Models

class Course(db.Model):
    """Top-level course container"""
    __tablename__ = 'courses'
    
    id = db.Column(db.String(100), primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    total_estimated_duration = db.Column(db.String(50))
    
    # Relationships
    lessons = db.relationship('Lesson', backref='course', lazy='dynamic', order_by='Lesson.order')
    
    # Completion requirements
    completion_requirements = db.Column(db.JSON, default={
        'min_episodes_completed': 0,
        'min_checkpoints_passed': 0,
        'min_badges_earned': 0,
        'min_points': 0
    })
    
    # Certificate info
    certificate_id = db.Column(db.String(100))
    certificate_metadata = db.Column(db.JSON)  # title, issuer, skills, etc.
    
    # Supporting materials
    supporting_materials = db.Column(db.JSON)  # quick_reference, troubleshooting_guide, lab_exercises
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Lesson(db.Model):
    """Chapter/Lesson within a course"""
    __tablename__ = 'lessons'
    
    id = db.Column(db.String(100), primary_key=True)
    course_id = db.Column(db.String(100), db.ForeignKey('courses.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    order = db.Column(db.Integer, nullable=False)
    total_estimated_duration = db.Column(db.String(50))
    learning_objectives = db.Column(db.JSON, default=list)
    
    # Relationships
    episodes = db.relationship('Episode', backref='lesson', lazy='dynamic', order_by='Episode.order')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Episode(db.Model):
    """Episode within a lesson"""
    __tablename__ = 'episodes'
    
    id = db.Column(db.String(100), primary_key=True)
    lesson_id = db.Column(db.String(100), db.ForeignKey('lessons.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    order = db.Column(db.Integer, nullable=False)
    estimated_duration = db.Column(db.String(50))
    learning_objectives = db.Column(db.JSON, default=list)
    
    # Prerequisites
    prerequisite = db.Column(db.JSON)  # {episode_ids: [], skip_option: {quiz_id, passing_score}}
    
    # Relationships
    segments = db.relationship('Segment', backref='episode', lazy='dynamic', order_by='Segment.order')
    checkpoint = db.relationship('Checkpoint', backref='episode', uselist=False)
    
    # Completion tracking
    checkpoint_id = db.Column(db.String(100))
    summary_reel_asset_id = db.Column(db.String(100))
    completion_criteria = db.Column(db.JSON, default={
        'min_segments_viewed': 0,
        'checkpoint_passed': False,
        'min_interactions_completed': 0
    })
    badge_on_completion = db.Column(db.String(100))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Segment(db.Model):
    """Individual learning segment within an episode"""
    __tablename__ = 'segments'
    
    id = db.Column(db.String(100), primary_key=True)
    episode_id = db.Column(db.String(100), db.ForeignKey('episodes.id'), nullable=False)
    order = db.Column(db.Integer, nullable=False)
    
    # Content metadata
    segment_type = db.Column(db.String(50), nullable=False)  # 15+ types from JSON
    title = db.Column(db.String(255))
    learning_objectives = db.Column(db.JSON, default=list)
    text_content = db.Column(db.Text)
    estimated_duration = db.Column(db.String(20))
    
    # Media references
    media_refs = db.Column(db.JSON, default={})  # {audioId, visualIds: []}
    
    # Interactive elements
    interactive_cue = db.Column(db.JSON)  # {cueType, promptText, triggerAtSeconds, etc.}
    
    # Code examples
    code_example = db.Column(db.JSON)  # {language, snippet, highlightLines, animateTyping}
    
    # Dashboard examples (for specific segments)
    dashboard_example = db.Column(db.JSON)
    
    # Metadata
    keywords = db.Column(db.JSON, default=list)
    points_awarded = db.Column(db.Integer, default=0)
    
    # Analytics configuration
    analytics = db.Column(db.JSON, default={
        'xapi_enabled': False,
        'track_time_spent': True,
        'interactions_to_track': []
    })
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    interactions = db.relationship('SegmentInteraction', backref='segment', lazy='dynamic')


# Progress and User Tracking Models

class User(db.Model):
    """User account"""
    __tablename__ = 'users'
    
    id = db.Column(db.String(50), primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(100))
    
    # Relationships
    progress_records = db.relationship('UserProgress', backref='user', lazy='dynamic')
    earned_badges = db.relationship('Badge', secondary=user_badges, backref='users')
    certificates = db.relationship('UserCertificate', backref='user', lazy='dynamic')
    interactions = db.relationship('SegmentInteraction', backref='user', lazy='dynamic')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class UserProgress(db.Model):
    """Tracks user progress through courses"""
    __tablename__ = 'user_progress'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    course_id = db.Column(db.String(100), db.ForeignKey('courses.id'), nullable=False)
    
    # Current position
    current_lesson_id = db.Column(db.String(100))
    current_episode_id = db.Column(db.String(100))
    current_segment_id = db.Column(db.String(100))
    
    # Completion tracking
    completed_segments = db.Column(db.JSON, default=list)  # List of segment IDs
    completed_episodes = db.Column(db.JSON, default=list)  # List of episode IDs
    completed_checkpoints = db.Column(db.JSON, default=list)  # List of checkpoint IDs
    
    # Gamification
    points_earned = db.Column(db.Integer, default=0)
    badges_earned = db.Column(db.JSON, default=list)  # List of badge IDs
    
    # Time tracking
    total_time_spent = db.Column(db.Integer, default=0)  # Seconds
    last_accessed = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('user_id', 'course_id'),)


class SegmentInteraction(db.Model):
    """Logs user interactions with segments"""
    __tablename__ = 'segment_interactions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    segment_id = db.Column(db.String(100), db.ForeignKey('segments.id'), nullable=False)
    
    interaction_type = db.Column(db.String(50))  # hover, click, drag, quiz_response, etc.
    interaction_data = db.Column(db.JSON)  # Specific data for the interaction
    
    # For quizzes/assessments
    is_correct = db.Column(db.Boolean)
    score = db.Column(db.Float)
    
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)


# Assessment and Gamification Models

class Checkpoint(db.Model):
    """Episode checkpoints/assessments"""
    __tablename__ = 'checkpoints'
    
    id = db.Column(db.String(100), primary_key=True)
    episode_id = db.Column(db.String(100), db.ForeignKey('episodes.id'), nullable=False)
    title = db.Column(db.String(255))
    
    questions = db.Column(db.JSON, default=list)  # List of question objects
    passing_score = db.Column(db.Float, default=0.8)  # 80% default
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Badge(db.Model):
    """Achievement badges"""
    __tablename__ = 'badges'
    
    id = db.Column(db.String(100), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    icon_url = db.Column(db.String(255))
    
    # Award criteria
    criteria_type = db.Column(db.String(50))  # episode_completion, points_earned, etc.
    criteria_value = db.Column(db.JSON)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class UserCertificate(db.Model):
    """Earned certificates"""
    __tablename__ = 'user_certificates'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    course_id = db.Column(db.String(100), db.ForeignKey('courses.id'), nullable=False)
    certificate_id = db.Column(db.String(100), nullable=False)
    
    issued_at = db.Column(db.DateTime, default=datetime.utcnow)
    certificate_data = db.Column(db.JSON)  # Name, skills, etc.
    public_url = db.Column(db.String(255))  # For sharing
    
    __table_args__ = (db.UniqueConstraint('user_id', 'course_id'),)


# Media and Asset Models

class MediaAsset(db.Model):
    """Audio, visual, and other media assets"""
    __tablename__ = 'media_assets'
    
    id = db.Column(db.String(100), primary_key=True)
    asset_type = db.Column(db.String(20), nullable=False)  # audio, visual, video
    title = db.Column(db.String(255))
    description = db.Column(db.Text)
    
    # Storage info
    file_path = db.Column(db.String(500))
    file_url = db.Column(db.String(500))
    file_size = db.Column(db.Integer)  # Bytes
    duration = db.Column(db.Integer)  # Seconds (for audio/video)
    
    # Generation info (for TTS audio)
    source_text = db.Column(db.Text)
    generation_params = db.Column(db.JSON)  # Voice, language, etc.
    generation_task_id = db.Column(db.String(100))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class VisualAsset(db.Model):
    """Visual assets like images, diagrams, infographics"""
    __tablename__ = 'visual_assets'
    
    id = db.Column(db.String(100), primary_key=True)
    title = db.Column(db.String(255))
    file_url = db.Column(db.String(500), nullable=False)
    asset_type = db.Column(db.String(50))  # image, diagram, infographic, screenshot
    
    # Metadata
    caption = db.Column(db.Text)
    alt_text = db.Column(db.Text)
    width = db.Column(db.Integer)
    height = db.Column(db.Integer)
    file_size = db.Column(db.Integer)  # bytes
    
    # Usage tracking
    segment_id = db.Column(db.String(100), db.ForeignKey('segments.id'))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class InteractiveCueTemplate(db.Model):
    """Templates for different interactive cue types"""
    __tablename__ = 'interactive_cue_templates'
    
    id = db.Column(db.Integer, primary_key=True)
    cue_type = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100))
    description = db.Column(db.Text)
    
    # Template configuration
    default_config = db.Column(db.JSON)
    required_fields = db.Column(db.JSON, default=list)
    
    # UI component info
    component_name = db.Column(db.String(100))  # React/JS component to render
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# Analytics Models

class AnalyticsEvent(db.Model):
    """xAPI-compliant analytics events"""
    __tablename__ = 'analytics_events'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    
    # xAPI statement components
    verb = db.Column(db.String(50))  # viewed, completed, interacted, etc.
    object_type = db.Column(db.String(50))  # segment, episode, course, etc.
    object_id = db.Column(db.String(100))
    
    # Context
    context_data = db.Column(db.JSON)
    result_data = db.Column(db.JSON)
    
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Session info
    session_id = db.Column(db.String(100))
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.String(500))


# Helper functions for model operations

def create_course_from_json(course_data):
    """Create course structure from JSON data like analyticsSummary.json"""
    course = Course(
        id=course_data.get('id', f"course_{datetime.utcnow().timestamp()}"),
        title=course_data.get('title', 'Untitled Course'),
        completion_requirements=course_data.get('courseCompletion', {}).get('requirements', {})
    )
    
    for lesson_data in course_data.get('lessons', []):
        lesson = Lesson(
            id=lesson_data['lessonId'],
            title=lesson_data['title'],
            order=lesson_data.get('order', 0),
            total_estimated_duration=lesson_data.get('totalEstimatedDuration'),
            learning_objectives=lesson_data.get('learningObjectives', [])
        )
        course.lessons.append(lesson)
        
        for ep_idx, episode_data in enumerate(lesson_data.get('episodes', [])):
            episode = Episode(
                id=episode_data['episodeId'],
                title=episode_data['title'],
                order=episode_data.get('order', ep_idx),
                estimated_duration=episode_data.get('estimatedDuration'),
                learning_objectives=episode_data.get('learningObjectives', []),
                prerequisite=episode_data.get('prerequisite'),
                checkpoint_id=episode_data.get('checkpointId'),
                completion_criteria=episode_data.get('completionCriteria', {}),
                badge_on_completion=episode_data.get('badgeOnCompletion')
            )
            lesson.episodes.append(episode)
            
            for seg_idx, segment_data in enumerate(episode_data.get('segments', [])):
                segment = Segment(
                    id=segment_data['segmentId'],
                    order=segment_data.get('order', seg_idx),
                    segment_type=segment_data['segmentType'],
                    title=segment_data.get('title'),
                    learning_objectives=segment_data.get('learningObjectives', []),
                    text_content=segment_data.get('textContent'),
                    estimated_duration=segment_data.get('estimatedDuration'),
                    media_refs=segment_data.get('mediaRefs', {}),
                    interactive_cue=segment_data.get('interactiveCue'),
                    code_example=segment_data.get('codeExample'),
                    dashboard_example=segment_data.get('dashboardExample'),
                    keywords=segment_data.get('keywords', []),
                    points_awarded=segment_data.get('pointsAwarded', 0),
                    analytics=segment_data.get('analytics', {})
                )
                episode.segments.append(segment)
    
    return course