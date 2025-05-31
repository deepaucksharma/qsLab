"""
Migration script to initialize the Neural Learn v2 database with course data
Run this to set up the enhanced course platform with the Kafka monitoring course
"""

import json
import os
from datetime import datetime
from pathlib import Path

# Add the project directory to Python path
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from models import (
    db, Course, Lesson, Episode, Segment, User, UserProgress,
    Badge, InteractiveCueTemplate, create_course_from_json
)

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///neural_learn_v2.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

def init_database():
    """Create all database tables"""
    with app.app_context():
        print("Creating database tables...")
        db.create_all()
        print("Database tables created successfully!")

def load_kafka_course():
    """Load the Kafka monitoring course from analyticsSummary.json"""
    analytics_path = Path('learning_content/analyticsSummary.json')
    
    if not analytics_path.exists():
        print(f"Error: {analytics_path} not found!")
        return None
    
    print(f"Loading course data from {analytics_path}...")
    
    with open(analytics_path, 'r', encoding='utf-8') as f:
        course_data = json.load(f)
    
    # Create course using the helper function
    course = create_course_from_json(course_data)
    
    # Set specific course metadata
    course.id = "kafka-monitoring-course-v2"
    course.title = "Kafka Monitoring with Share Groups"
    course.description = "Master Kafka monitoring including the new Share Groups feature in Kafka 4.0+"
    course.total_estimated_duration = "3-4 hours"
    
    return course

def create_sample_user():
    """Create a demo user for testing"""
    user = User(
        id='demo_user',
        email='demo@neurallearn.com',
        name='Demo User'
    )
    return user

def create_badges():
    """Create badge definitions for the course"""
    badges = [
        Badge(
            id='BADGE_KAFKA_FUNDAMENTALS_EP1_V2',
            name='Kafka Fundamentals Explorer',
            description='Completed the Kafka fundamentals episode',
            criteria_type='episode_completion',
            criteria_value={'episodeId': 'EPISODE_01_01_WHY_KAFKA_V2'}
        ),
        Badge(
            id='BADGE_SHARE_GROUP_PIONEER_V2',
            name='Share Group Pioneer',
            description='Mastered Share Group metrics and concepts',
            criteria_type='episode_completion',
            criteria_value={'episodeId': 'EPISODE_01_06_SHARE_GROUP_METRICS_NEW_V2'}
        ),
        Badge(
            id='BADGE_METRICS_STRATEGIST_V2',
            name='Metrics Strategist',
            description='Completed JMX and Micrometer configuration',
            criteria_type='episode_completion',
            criteria_value={'episodeId': 'EPISODE_02_03_MICROMETER_VS_JMXEXPORTER_V2'}
        ),
        Badge(
            id='BADGE_UI_MASTER_V2',
            name='UI Master',
            description='Mastered the Queues & Streams UI',
            criteria_type='episode_completion',
            criteria_value={'episodeId': 'EPISODE_03_03_QUEUES_STREAMS_UI_V2'}
        ),
        Badge(
            id='BADGE_KAFKA_MONITORING_MASTER_V2',
            name='Kafka Monitoring Master',
            description='Completed the entire Kafka monitoring course',
            criteria_type='course_completion',
            criteria_value={'courseId': 'kafka-monitoring-course-v2'}
        )
    ]
    return badges

def create_interactive_cue_templates():
    """Create interactive cue type definitions"""
    templates = [
        ('hover_to_explore', 'Hover to Explore', 'User hovers over elements to reveal information', 
         {'hoverZones': [], 'revelations': {}}, ['targetElements', 'promptText']),
        
        ('drag_to_distribute', 'Drag to Distribute', 'User drags items to different locations',
         {'draggables': [], 'dropZones': []}, ['items', 'zones', 'correctMapping']),
        
        ('click_to_compare', 'Click to Compare', 'User clicks to see comparisons',
         {'states': [], 'currentState': 0}, ['compareItems', 'promptText']),
        
        ('simulation', 'Simulation', 'Interactive simulation with parameters',
         {'parameters': {}, 'initialState': {}}, ['simulationType', 'controls']),
        
        ('predict_value_change', 'Predict Value Change', 'User predicts how values will change',
         {'options': [], 'correctAnswer': None}, ['question', 'options', 'correctAnswer']),
        
        ('code_completion', 'Code Completion', 'User completes code snippets',
         {'template': '', 'solution': ''}, ['template', 'correctAnswer', 'language']),
        
        ('scenario_selection', 'Scenario Selection', 'User selects from multiple scenarios',
         {'scenarios': [], 'correctAnswers': []}, ['scenarios', 'correctAnswers']),
        
        ('pause_and_reflect', 'Pause and Reflect', 'Pause for user reflection',
         {'duration': 5}, ['promptText', 'revealDelay']),
        
        ('important_note', 'Important Note', 'Display important information',
         {'displayDuration': 10}, ['noteText', 'displayDuration']),
        
        ('interactive_explorer', 'Interactive Explorer', 'Explore interactive content',
         {'explorationPoints': []}, ['content', 'interactionPoints']),
        
        ('field_mapping_exercise', 'Field Mapping Exercise', 'Map fields between systems',
         {'sourceFields': [], 'targetFields': []}, ['mappings', 'promptText']),
        
        ('ui_simulation', 'UI Simulation', 'Simulate UI interactions',
         {'uiElements': [], 'interactions': []}, ['simulationType', 'steps'])
    ]
    
    return [
        InteractiveCueTemplate(
            cue_type=cue_type,
            name=name,
            description=description,
            default_config=default_config,
            required_fields=required_fields,
            component_name=f"{cue_type.title().replace('_', '')}Component"
        )
        for cue_type, name, description, default_config, required_fields in templates
    ]

def migrate_vocabulary_lessons():
    """Migrate existing vocabulary lessons to the new structure"""
    vocab_path = Path('learning_content/course_structure.json')
    
    if not vocab_path.exists():
        print("No existing vocabulary lessons to migrate")
        return None
    
    print("Migrating vocabulary lessons...")
    
    with open(vocab_path, 'r', encoding='utf-8') as f:
        vocab_data = json.load(f)
    
    # Create a vocabulary course
    vocab_course = Course(
        id='vocabulary-basics-v2',
        title='Vocabulary Building',
        description='Build your vocabulary with AI-powered lessons',
        total_estimated_duration='30 minutes'
    )
    
    # Create a single lesson for all vocabulary
    vocab_lesson = Lesson(
        id='vocab-lesson-1',
        course_id=vocab_course.id,
        title='Essential Vocabulary',
        order=1,
        learning_objectives=['Learn new vocabulary words', 'Practice pronunciation']
    )
    vocab_course.lessons.append(vocab_lesson)
    
    # Convert vocabulary data to episode(s)
    # Check if vocab_data is a list or single item
    vocab_items = vocab_data if isinstance(vocab_data, list) else [vocab_data]
    
    for idx, vocab_item in enumerate(vocab_items):
        episode = Episode(
            id=vocab_item['id'],
            lesson_id=vocab_lesson.id,
            title=vocab_item['title'],
            order=idx + 1,
            estimated_duration='5 minutes',
            learning_objectives=[f'Master the word: {vocab_item["title"]}']
        )
        vocab_lesson.episodes.append(episode)
        
        # Convert segments
        for seg_idx, segment_data in enumerate(vocab_item.get('segments', [])):
            segment = Segment(
                id=f"{vocab_item['id']}_seg_{seg_idx}",
                episode_id=episode.id,
                order=seg_idx + 1,
                segment_type=map_vocab_segment_type(segment_data['type']),
                title=f"{segment_data['type'].title()} - {vocab_item['title']}",
                text_content=segment_data['text'],
                estimated_duration='1 minute',
                media_refs={'audioId': segment_data.get('audio_task_id')},
                points_awarded=10
            )
            episode.segments.append(segment)
    
    return vocab_course

def map_vocab_segment_type(old_type):
    """Map old vocabulary segment types to new types"""
    mapping = {
        'intro': 'course_opening',
        'definition': 'concept_explanation',
        'examples': 'practical_example',
        'practice': 'knowledge_check'
    }
    return mapping.get(old_type, 'concept_explanation')

def main():
    """Run the migration"""
    print("=" * 60)
    print("Neural Learn v2 Migration Script")
    print("=" * 60)
    
    with app.app_context():
        # Initialize database
        init_database()
        
        # Create interactive cue templates
        print("\nCreating interactive cue templates...")
        templates = create_interactive_cue_templates()
        for template in templates:
            existing = InteractiveCueTemplate.query.filter_by(cue_type=template.cue_type).first()
            if not existing:
                db.session.add(template)
        
        # Create badges
        print("\nCreating badges...")
        badges = create_badges()
        for badge in badges:
            existing = Badge.query.get(badge.id)
            if not existing:
                db.session.add(badge)
        
        # Create demo user
        print("\nCreating demo user...")
        user = create_sample_user()
        existing_user = User.query.get(user.id)
        if not existing_user:
            db.session.add(user)
        
        # Load Kafka course
        print("\nLoading Kafka monitoring course...")
        kafka_course = load_kafka_course()
        if kafka_course:
            existing_course = Course.query.get(kafka_course.id)
            if not existing_course:
                db.session.add(kafka_course)
                print(f"Added course: {kafka_course.title}")
                # Statistics will be shown after commit
            else:
                print("Kafka course already exists")
        
        # Migrate vocabulary lessons
        vocab_course = migrate_vocabulary_lessons()
        if vocab_course:
            existing_vocab = Course.query.get(vocab_course.id)
            if not existing_vocab:
                db.session.add(vocab_course)
                print(f"\nMigrated vocabulary course: {vocab_course.title}")
        
        # Create initial progress for demo user
        if kafka_course:
            progress = UserProgress.query.filter_by(
                user_id=user.id,
                course_id=kafka_course.id
            ).first()
            if not progress:
                progress = UserProgress(
                    user_id=user.id,
                    course_id=kafka_course.id,
                    points_earned=0
                )
                db.session.add(progress)
        
        # Commit all changes
        try:
            db.session.commit()
            print("\n✅ Migration completed successfully!")
            
            # Print summary
            print("\nDatabase Summary:")
            print(f"  - Courses: {Course.query.count()}")
            print(f"  - Lessons: {Lesson.query.count()}")
            print(f"  - Episodes: {Episode.query.count()}")
            print(f"  - Segments: {Segment.query.count()}")
            print(f"  - Badges: {Badge.query.count()}")
            print(f"  - Interactive Templates: {InteractiveCueTemplate.query.count()}")
            print(f"  - Users: {User.query.count()}")
            
        except Exception as e:
            db.session.rollback()
            print(f"\n❌ Migration failed: {e}")
            raise

if __name__ == '__main__':
    main()