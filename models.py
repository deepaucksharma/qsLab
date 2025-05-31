# models.py - Enhanced Data Models for Course Structure
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

class Course(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    course_code = db.Column(db.String(20), unique=True, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    prerequisites = db.Column(db.JSON)  # List of prerequisite strings
    learning_objectives = db.Column(db.JSON)  # List of objective strings
    instructor_name = db.Column(db.String(100))
    instructor_bio = db.Column(db.Text)
    visual_theme = db.Column(db.JSON)  # Primary/secondary colors, font, icon style
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    modules = db.relationship('Module', backref='course', cascade='all, delete-orphan', order_by='Module.order')

class Module(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = db.Column(db.String(36), db.ForeignKey('course.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    order = db.Column(db.Integer, default=0)
    learning_objectives = db.Column(db.JSON)
    
    # Introductory content
    intro_audio_task_id = db.Column(db.String(36))
    intro_audio_status = db.Column(db.String(20), default='pending')
    intro_audio_url = db.Column(db.String(500))
    intro_audio_duration = db.Column(db.Integer)
    intro_audio_transcript = db.Column(db.Text)
    
    intro_visual_type = db.Column(db.String(50))  # animated_title_card, image_collage, etc.
    intro_visual_url = db.Column(db.String(500))
    intro_visual_alt_text = db.Column(db.String(500))
    intro_visual_caption = db.Column(db.String(200))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    lessons = db.relationship('Lesson', backref='module', cascade='all, delete-orphan', order_by='Lesson.order')

class Lesson(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    module_id = db.Column(db.String(36), db.ForeignKey('module.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    order = db.Column(db.Integer, default=0)
    estimated_duration_minutes = db.Column(db.Integer, default=30)
    learning_objectives = db.Column(db.JSON)
    
    # Introductory content
    intro_audio_task_id = db.Column(db.String(36))
    intro_audio_status = db.Column(db.String(20), default='pending')
    intro_audio_url = db.Column(db.String(500))
    intro_audio_duration = db.Column(db.Integer)
    intro_audio_transcript = db.Column(db.Text)
    
    intro_visual_type = db.Column(db.String(50))
    intro_visual_url = db.Column(db.String(500))
    intro_visual_alt_text = db.Column(db.String(500))
    intro_visual_caption = db.Column(db.String(200))
    
    # Summary content
    summary_text = db.Column(db.Text)
    summary_audio_task_id = db.Column(db.String(36))
    summary_audio_status = db.Column(db.String(20), default='pending')
    summary_audio_url = db.Column(db.String(500))
    summary_audio_duration = db.Column(db.Integer)
    summary_audio_transcript = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    segments = db.relationship('Segment', backref='lesson', cascade='all, delete-orphan', order_by='Segment.order')

class Segment(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lesson_id = db.Column(db.String(36), db.ForeignKey('lesson.id'), nullable=False)
    order = db.Column(db.Integer, default=0)
    title = db.Column(db.String(200))
    
    # Content types
    segment_type = db.Column(db.String(50), default='explanation')
    # Types: introduction, definition, explanation, example, analogy, historical_context,
    # formula_derivation, data_interpretation, thought_experiment, reflection_prompt, key_concept_highlight
    
    # Text content
    text_content = db.Column(db.Text, nullable=False)
    
    # Audio content
    audio_task_id = db.Column(db.String(36))
    audio_status = db.Column(db.String(20), default='pending')
    audio_url = db.Column(db.String(500))
    audio_duration = db.Column(db.Integer)
    voice_style_hint = db.Column(db.String(50))  # clear_and_authoritative, enthusiastic, calm_explanatory
    language = db.Column(db.String(10), default='en')
    generation_parameters = db.Column(db.JSON)  # Engine, speaker_wav, speed, etc.
    
    # Metadata
    keywords = db.Column(db.JSON)  # List of keyword strings
    further_reading_links = db.Column(db.JSON)  # List of {title, url} objects
    reflection_prompt = db.Column(db.Text)  # For reflection_prompt segment type
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    visuals = db.relationship('Visual', backref='segment', cascade='all, delete-orphan', order_by='Visual.order')

class Visual(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    segment_id = db.Column(db.String(36), db.ForeignKey('segment.id'), nullable=False)
    order = db.Column(db.Integer, default=0)
    
    visual_type = db.Column(db.String(50), nullable=False)
    # Types: annotated_diagram, static_image, gif, short_video_clip, interactive_simulation_link,
    # mermaid_diagram, data_plot, 3d_model_embed, data_table
    
    asset_url = db.Column(db.String(500))  # Path to asset or null for embedded data
    alt_text = db.Column(db.String(500))
    caption = db.Column(db.String(500))
    
    # Display timing
    display_timing = db.Column(db.String(50), default='show_throughout_segment')
    # Options: show_throughout_segment, show_at_start, show_at_timestamp_X, sync_with_audio_cue_X
    display_duration_seconds = db.Column(db.Integer)
    
    # Animation and interactivity
    animation_hints = db.Column(db.String(200))  # fade_in_slowly, zoom_on_label, highlight_orbit
    interactivity_type = db.Column(db.String(50))  # hover_to_reveal_details, click_to_zoom, drag_to_rotate
    interactivity_data = db.Column(db.JSON)  # Hotspots, interactive regions, etc.
    
    # For data tables or embedded content
    embedded_data = db.Column(db.JSON)  # For data_table type: {headers: [], rows: [[]]}
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# User progress tracking (optional for future)
class UserProgress(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36))  # Link to user system if implemented
    course_id = db.Column(db.String(36), db.ForeignKey('course.id'))
    current_module_id = db.Column(db.String(36))
    current_lesson_id = db.Column(db.String(36))
    current_segment_id = db.Column(db.String(36))
    completed_segments = db.Column(db.JSON)  # List of completed segment IDs
    last_accessed = db.Column(db.DateTime, default=datetime.utcnow)
    total_time_spent_minutes = db.Column(db.Integer, default=0)