#!/usr/bin/env python3
"""
Content validation tool for Neural Learn courses
Ensures content meets quality standards and platform requirements
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Tuple, Any
from collections import defaultdict

class ContentValidator:
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.info = []
        self.stats = defaultdict(int)
        
        # Load valid segment types and interaction types
        self.valid_segment_types = {
            'course_opening', 'instructor_introduction', 'episode_opening',
            'concept_explanation', 'historical_context', 'origin_story',
            'problem_recap', 'paradigm_shift', 'technical_introduction',
            'code_walkthrough', 'architecture_design', 'practical_example',
            'practical_configuration', 'metric_deep_dive', 'new_metric_deep_dive',
            'metrics_overview', 'metric_taxonomy', 'feature_introduction',
            'new_feature_highlight', 'new_feature_discovery', 'concept_introduction',
            'scalability_concept', 'immutability_concept', 'technology_comparison',
            'decision_framework', 'ui_walkthrough', 'schema_introduction',
            'advanced_customization', 'knowledge_check', 'checkpoint',
            'scenario_selection', 'field_mapping_exercise', 'simulation',
            'important_note', 'pause_and_reflect'
        }
        
        self.valid_interaction_types = {
            'hover_to_explore', 'drag_to_distribute', 'click_to_compare',
            'simulation', 'predict_value_change', 'code_completion',
            'scenario_selection', 'pause_and_reflect', 'important_note',
            'interactive_explorer', 'field_mapping_exercise', 'ui_simulation'
        }
        
        self.required_course_fields = {
            'id', 'title', 'description', 'totalEstimatedDuration',
            'level', 'learningObjectives'
        }
        
        self.required_segment_fields = {
            'id', 'order', 'segmentType', 'title', 'textContent',
            'estimatedDuration', 'pointsAwarded'
        }

    def validate_course(self, course_path: Path) -> Tuple[bool, Dict[str, Any]]:
        """Validate a complete course file"""
        try:
            with open(course_path, 'r') as f:
                course_data = json.load(f)
        except json.JSONDecodeError as e:
            self.errors.append(f"Invalid JSON in {course_path}: {e}")
            return False, self.get_report()
        except Exception as e:
            self.errors.append(f"Error reading {course_path}: {e}")
            return False, self.get_report()
        
        # Validate course structure
        if 'course' not in course_data:
            self.errors.append("Missing 'course' root element")
            return False, self.get_report()
        
        course = course_data['course']
        self._validate_course_metadata(course)
        
        # Validate lessons
        if 'lessons' not in course_data:
            self.errors.append("Missing 'lessons' array")
        else:
            self._validate_lessons(course_data['lessons'])
        
        # Generate statistics
        self._generate_stats(course_data)
        
        # Overall validation result
        is_valid = len(self.errors) == 0
        
        return is_valid, self.get_report()
    
    def _validate_course_metadata(self, course: Dict):
        """Validate course-level metadata"""
        # Check required fields
        for field in self.required_course_fields:
            if field not in course:
                self.errors.append(f"Missing required course field: {field}")
        
        # Validate learning objectives
        if 'learningObjectives' in course:
            objectives = course['learningObjectives']
            if len(objectives) < 3:
                self.warnings.append("Course should have at least 3 learning objectives")
            for obj in objectives:
                if len(obj) < 10:
                    self.warnings.append(f"Learning objective too short: '{obj}'")
        
        # Validate duration format
        if 'totalEstimatedDuration' in course:
            if not re.match(r'\d+(\.\d+)?\s*(hours?|minutes?)', course['totalEstimatedDuration']):
                self.warnings.append(f"Invalid duration format: {course['totalEstimatedDuration']}")
    
    def _validate_lessons(self, lessons: List[Dict]):
        """Validate all lessons"""
        if len(lessons) == 0:
            self.errors.append("Course has no lessons")
            return
        
        seen_orders = set()
        for lesson in lessons:
            self._validate_lesson(lesson)
            
            # Check for duplicate orders
            if 'order' in lesson:
                if lesson['order'] in seen_orders:
                    self.errors.append(f"Duplicate lesson order: {lesson['order']}")
                seen_orders.add(lesson['order'])
    
    def _validate_lesson(self, lesson: Dict):
        """Validate a single lesson"""
        if 'id' not in lesson:
            self.errors.append("Lesson missing 'id' field")
            return
        
        lesson_id = lesson['id']
        
        # Required fields
        required = ['title', 'order', 'episodes']
        for field in required:
            if field not in lesson:
                self.errors.append(f"Lesson {lesson_id} missing required field: {field}")
        
        # Validate episodes
        if 'episodes' in lesson:
            if len(lesson['episodes']) == 0:
                self.warnings.append(f"Lesson {lesson_id} has no episodes")
            else:
                for episode in lesson['episodes']:
                    self._validate_episode(episode, lesson_id)
    
    def _validate_episode(self, episode: Dict, lesson_id: str):
        """Validate a single episode"""
        if 'id' not in episode:
            self.errors.append(f"Episode in lesson {lesson_id} missing 'id' field")
            return
        
        episode_id = episode['id']
        
        # Validate segments
        if 'segments' not in episode:
            self.errors.append(f"Episode {episode_id} missing 'segments' array")
        elif len(episode['segments']) == 0:
            self.warnings.append(f"Episode {episode_id} has no segments")
        else:
            for segment in episode['segments']:
                self._validate_segment(segment, episode_id)
        
        # Validate checkpoint if present
        if 'checkpoint' in episode:
            self._validate_checkpoint(episode['checkpoint'], episode_id)
    
    def _validate_segment(self, segment: Dict, episode_id: str):
        """Validate a single segment"""
        if 'id' not in segment:
            self.errors.append(f"Segment in episode {episode_id} missing 'id' field")
            return
        
        segment_id = segment['id']
        
        # Check required fields
        for field in self.required_segment_fields:
            if field not in segment:
                self.errors.append(f"Segment {segment_id} missing required field: {field}")
        
        # Validate segment type
        if 'segmentType' in segment:
            if segment['segmentType'] not in self.valid_segment_types:
                self.errors.append(f"Invalid segment type '{segment['segmentType']}' in {segment_id}")
        
        # Validate content length
        if 'textContent' in segment:
            content_length = len(segment['textContent'])
            if content_length < 50:
                self.warnings.append(f"Segment {segment_id} has very short content ({content_length} chars)")
            elif content_length > 2000:
                self.warnings.append(f"Segment {segment_id} has very long content ({content_length} chars)")
        
        # Validate interactive cue
        if 'interactiveCue' in segment and segment['interactiveCue'] is not None:
            self._validate_interactive_cue(segment['interactiveCue'], segment_id)
        
        # Validate points
        if 'pointsAwarded' in segment:
            points = segment['pointsAwarded']
            if points < 5 or points > 100:
                self.warnings.append(f"Segment {segment_id} has unusual points value: {points}")
    
    def _validate_interactive_cue(self, cue: Dict, segment_id: str):
        """Validate interactive cue configuration"""
        if 'cueType' not in cue:
            self.errors.append(f"Interactive cue in segment {segment_id} missing 'cueType'")
            return
        
        cue_type = cue['cueType']
        if cue_type not in self.valid_interaction_types:
            self.errors.append(f"Invalid interaction type '{cue_type}' in segment {segment_id}")
        
        # Type-specific validation
        if cue_type == 'hover_to_explore' and 'config' in cue:
            if 'hotspots' not in cue['config']:
                self.warnings.append(f"hover_to_explore in {segment_id} missing hotspots")
        
        elif cue_type == 'scenario_selection' and 'config' in cue:
            if 'scenarios' not in cue['config']:
                self.errors.append(f"scenario_selection in {segment_id} missing scenarios")
    
    def _validate_checkpoint(self, checkpoint: Dict, episode_id: str):
        """Validate checkpoint configuration"""
        if 'questions' not in checkpoint:
            self.errors.append(f"Checkpoint in episode {episode_id} missing questions")
            return
        
        if len(checkpoint['questions']) < 3:
            self.warnings.append(f"Checkpoint in episode {episode_id} has too few questions")
        
        for q_idx, question in enumerate(checkpoint['questions']):
            if 'type' not in question:
                self.errors.append(f"Question {q_idx} in episode {episode_id} missing type")
            if 'correctAnswer' not in question and question.get('type') != 'open_ended':
                self.errors.append(f"Question {q_idx} in episode {episode_id} missing correctAnswer")
    
    def _generate_stats(self, course_data: Dict):
        """Generate content statistics"""
        if 'course' in course_data:
            self.stats['course_count'] = 1
        
        if 'lessons' in course_data:
            lessons = course_data['lessons']
            self.stats['lesson_count'] = len(lessons)
            
            for lesson in lessons:
                if 'episodes' in lesson:
                    self.stats['episode_count'] += len(lesson['episodes'])
                    
                    for episode in lesson['episodes']:
                        if 'segments' in episode:
                            self.stats['segment_count'] += len(episode['segments'])
                            
                            for segment in episode['segments']:
                                # Count segment types
                                seg_type = segment.get('segmentType', 'unknown')
                                self.stats[f'segment_type_{seg_type}'] += 1
                                
                                # Count interactions
                                if 'interactiveCue' in segment and segment['interactiveCue'] is not None:
                                    cue_type = segment['interactiveCue'].get('cueType', 'unknown')
                                    self.stats[f'interaction_{cue_type}'] += 1
                        
                        if 'checkpoint' in episode:
                            self.stats['checkpoint_count'] += 1
    
    def get_report(self) -> Dict[str, Any]:
        """Generate validation report"""
        return {
            'valid': len(self.errors) == 0,
            'errors': self.errors,
            'warnings': self.warnings,
            'info': self.info,
            'statistics': dict(self.stats),
            'summary': {
                'error_count': len(self.errors),
                'warning_count': len(self.warnings),
                'lessons': self.stats.get('lesson_count', 0),
                'episodes': self.stats.get('episode_count', 0),
                'segments': self.stats.get('segment_count', 0),
                'checkpoints': self.stats.get('checkpoint_count', 0)
            }
        }

def main():
    """Main validation script"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Validate Neural Learn course content')
    parser.add_argument('course_file', help='Path to course JSON file')
    parser.add_argument('--strict', action='store_true', help='Treat warnings as errors')
    parser.add_argument('--stats-only', action='store_true', help='Only show statistics')
    args = parser.parse_args()
    
    validator = ContentValidator()
    course_path = Path(args.course_file)
    
    if not course_path.exists():
        print(f"Error: Course file not found: {course_path}")
        return 1
    
    is_valid, report = validator.validate_course(course_path)
    
    # Print report
    print(f"\n{'='*60}")
    print(f"Validation Report for: {course_path.name}")
    print(f"{'='*60}\n")
    
    if args.stats_only:
        print("STATISTICS:")
        for key, value in sorted(report['statistics'].items()):
            print(f"  {key}: {value}")
    else:
        # Errors
        if report['errors']:
            print(f"ERRORS ({len(report['errors'])}):")
            for error in report['errors']:
                print(f"  ❌ {error}")
            print()
        
        # Warnings
        if report['warnings']:
            print(f"WARNINGS ({len(report['warnings'])}):")
            for warning in report['warnings']:
                print(f"  ⚠️  {warning}")
            print()
        
        # Summary
        print("SUMMARY:")
        summary = report['summary']
        print(f"  Lessons:     {summary['lessons']}")
        print(f"  Episodes:    {summary['episodes']}")
        print(f"  Segments:    {summary['segments']}")
        print(f"  Checkpoints: {summary['checkpoints']}")
        print(f"  Errors:      {summary['error_count']}")
        print(f"  Warnings:    {summary['warning_count']}")
        print()
        
        # Segment type distribution
        print("SEGMENT TYPES:")
        seg_types = {k: v for k, v in report['statistics'].items() if k.startswith('segment_type_')}
        for seg_type, count in sorted(seg_types.items(), key=lambda x: x[1], reverse=True):
            print(f"  {seg_type.replace('segment_type_', '')}: {count}")
        print()
        
        # Interaction distribution
        print("INTERACTION TYPES:")
        interactions = {k: v for k, v in report['statistics'].items() if k.startswith('interaction_')}
        for interaction, count in sorted(interactions.items(), key=lambda x: x[1], reverse=True):
            print(f"  {interaction.replace('interaction_', '')}: {count}")
    
    print()
    if is_valid:
        print("✅ Validation PASSED")
    else:
        print("❌ Validation FAILED")
    
    return 0 if is_valid or (args.strict and report['warnings']) else 1

if __name__ == '__main__':
    exit(main())