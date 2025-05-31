"""
Adaptive Learning Engine for Neural Learn Platform

This module implements personalized learning paths, difficulty adjustment,
and spaced repetition algorithms to optimize learning outcomes.
"""

import json
import math
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
import numpy as np
from sqlalchemy import func
from flask import request, jsonify
from models import db, UserProgress, Segment, SegmentInteraction, AnalyticsEvent, Episode

@dataclass
class LearningProfile:
    """User's learning profile based on their interaction history"""
    user_id: str
    learning_style: str  # visual, auditory, kinesthetic, reading
    average_segment_time: float
    interaction_success_rate: float
    preferred_difficulty: str  # beginner, intermediate, advanced
    strength_areas: List[str]
    weakness_areas: List[str]
    optimal_session_length: int  # in minutes
    best_learning_time: str  # morning, afternoon, evening, night


@dataclass
class ConceptMastery:
    """Tracks mastery level for a specific concept"""
    concept: str
    exposure_count: int
    success_rate: float
    last_reviewed: datetime
    next_review: datetime
    stability: float  # How well the concept is retained
    difficulty: float  # How hard the concept is for this user


class AdaptiveLearningEngine:
    """
    Personalizes content delivery based on user performance and preferences
    """
    
    def __init__(self):
        self.difficulty_levels = ['beginner', 'intermediate', 'advanced']
        self.learning_styles = ['visual', 'auditory', 'kinesthetic', 'reading']
        self.time_periods = {
            'morning': (6, 12),
            'afternoon': (12, 17),
            'evening': (17, 21),
            'night': (21, 6)
        }
        
    def analyze_user_profile(self, user_id: str) -> LearningProfile:
        """
        Analyze user's interaction history to build their learning profile
        """
        # Get user's interaction history
        interactions = SegmentInteraction.query.filter_by(user_id=user_id).all()
        analytics = AnalyticsEvent.query.filter_by(user_id=user_id).all()
        
        if not interactions:
            # Return default profile for new users
            return self._create_default_profile(user_id)
        
        # Calculate learning metrics
        learning_style = self._detect_learning_style(interactions, analytics)
        avg_time = self._calculate_average_segment_time(interactions)
        success_rate = self._calculate_success_rate(interactions)
        difficulty = self._determine_preferred_difficulty(interactions, success_rate)
        strengths, weaknesses = self._identify_strengths_weaknesses(interactions)
        optimal_length = self._calculate_optimal_session_length(analytics)
        best_time = self._find_best_learning_time(analytics)
        
        return LearningProfile(
            user_id=user_id,
            learning_style=learning_style,
            average_segment_time=avg_time,
            interaction_success_rate=success_rate,
            preferred_difficulty=difficulty,
            strength_areas=strengths,
            weakness_areas=weaknesses,
            optimal_session_length=optimal_length,
            best_learning_time=best_time
        )
    
    def personalize_segment(self, segment: Segment, profile: LearningProfile) -> Dict:
        """
        Adapt segment content based on user's learning profile
        """
        personalized = {
            'segment_id': segment.id,
            'original_content': segment.text_content,
            'adaptations': []
        }
        
        # Adjust content based on learning style
        if profile.learning_style == 'visual':
            personalized['adaptations'].append({
                'type': 'visual_enhancement',
                'priority': 'high',
                'suggestions': [
                    'Add more diagrams and charts',
                    'Use color coding for key concepts',
                    'Include mind maps'
                ]
            })
        elif profile.learning_style == 'auditory':
            personalized['adaptations'].append({
                'type': 'audio_enhancement',
                'priority': 'high',
                'suggestions': [
                    'Emphasize audio narration',
                    'Add sound effects for key points',
                    'Include verbal mnemonics'
                ]
            })
        elif profile.learning_style == 'kinesthetic':
            personalized['adaptations'].append({
                'type': 'interactive_enhancement',
                'priority': 'high',
                'suggestions': [
                    'Add more interactive exercises',
                    'Include hands-on simulations',
                    'Provide practice opportunities'
                ]
            })
        
        # Adjust difficulty
        if profile.preferred_difficulty != self._estimate_segment_difficulty(segment):
            personalized['adaptations'].append({
                'type': 'difficulty_adjustment',
                'current': self._estimate_segment_difficulty(segment),
                'target': profile.preferred_difficulty,
                'suggestions': self._get_difficulty_adjustments(
                    segment, 
                    profile.preferred_difficulty
                )
            })
        
        # Add remediation for weak areas
        if any(weak in segment.keywords for weak in profile.weakness_areas):
            personalized['adaptations'].append({
                'type': 'remediation',
                'concepts': [w for w in profile.weakness_areas if w in segment.keywords],
                'suggestions': [
                    'Add prerequisite review',
                    'Include more examples',
                    'Slow down pace'
                ]
            })
        
        return personalized
    
    def recommend_next_segment(self, user_id: str, current_episode: Episode) -> Optional[Segment]:
        """
        Recommend the next best segment for the user to study
        """
        profile = self.analyze_user_profile(user_id)
        progress = UserProgress.query.filter_by(
            user_id=user_id,
            course_id=current_episode.lesson.course_id
        ).first()
        
        if not progress:
            # Start from the beginning
            return current_episode.segments[0] if current_episode.segments else None
        
        # Get segments user hasn't completed
        completed_ids = progress.completed_segments
        available_segments = [
            s for s in current_episode.segments 
            if s.id not in completed_ids
        ]
        
        if not available_segments:
            return None
        
        # Score each segment based on user profile
        segment_scores = []
        for segment in available_segments:
            score = self._calculate_segment_score(segment, profile, progress)
            segment_scores.append((segment, score))
        
        # Sort by score and return the best match
        segment_scores.sort(key=lambda x: x[1], reverse=True)
        return segment_scores[0][0]
    
    def adjust_difficulty_dynamically(self, user_id: str, segment_id: str, 
                                    performance: Dict) -> Dict:
        """
        Adjust difficulty based on real-time performance
        """
        profile = self.analyze_user_profile(user_id)
        
        # Calculate performance metrics
        time_taken = performance.get('time_taken', 0)
        interactions_completed = performance.get('interactions_completed', 0)
        interactions_total = performance.get('interactions_total', 1)
        errors = performance.get('errors', 0)
        
        completion_rate = interactions_completed / interactions_total
        error_rate = errors / max(interactions_total, 1)
        time_ratio = time_taken / max(profile.average_segment_time, 1)
        
        adjustments = {
            'current_performance': {
                'completion_rate': completion_rate,
                'error_rate': error_rate,
                'time_ratio': time_ratio
            },
            'recommendations': []
        }
        
        # Too difficult - user struggling
        if completion_rate < 0.5 or error_rate > 0.5 or time_ratio > 1.5:
            adjustments['recommendations'].extend([
                {'type': 'simplify', 'reason': 'User struggling with content'},
                {'type': 'add_hints', 'reason': 'High error rate'},
                {'type': 'break_down', 'reason': 'Taking too long'}
            ])
            adjustments['next_difficulty'] = 'easier'
        
        # Too easy - user breezing through
        elif completion_rate > 0.95 and error_rate < 0.1 and time_ratio < 0.5:
            adjustments['recommendations'].extend([
                {'type': 'increase_challenge', 'reason': 'User finding it too easy'},
                {'type': 'add_advanced', 'reason': 'Perfect performance'},
                {'type': 'skip_basics', 'reason': 'Fast completion'}
            ])
            adjustments['next_difficulty'] = 'harder'
        
        # Just right
        else:
            adjustments['next_difficulty'] = 'maintain'
        
        return adjustments
    
    def generate_learning_path(self, user_id: str, course_id: str) -> List[Dict]:
        """
        Generate a personalized learning path through the course
        """
        profile = self.analyze_user_profile(user_id)
        
        # Get all episodes in the course
        from models import Course
        course = Course.query.get(course_id)
        if not course:
            return []
        
        path = []
        for lesson in course.lessons:
            for episode in lesson.episodes:
                # Check prerequisites
                if self._should_skip_episode(episode, profile):
                    path.append({
                        'episode_id': episode.id,
                        'action': 'skip',
                        'reason': 'Already mastered prerequisites'
                    })
                    continue
                
                # Calculate estimated time
                estimated_time = self._estimate_episode_time(episode, profile)
                
                # Determine focus areas
                focus_segments = self._identify_focus_segments(episode, profile)
                
                path.append({
                    'episode_id': episode.id,
                    'action': 'study',
                    'estimated_time': estimated_time,
                    'focus_segments': focus_segments,
                    'adaptations': {
                        'pace': self._determine_pace(profile),
                        'depth': self._determine_depth(profile),
                        'interaction_level': self._determine_interaction_level(profile)
                    }
                })
        
        return path
    
    # Helper methods
    def _create_default_profile(self, user_id: str) -> LearningProfile:
        """Create default profile for new users"""
        return LearningProfile(
            user_id=user_id,
            learning_style='visual',
            average_segment_time=120.0,
            interaction_success_rate=0.7,
            preferred_difficulty='beginner',
            strength_areas=[],
            weakness_areas=[],
            optimal_session_length=30,
            best_learning_time='afternoon'
        )
    
    def _detect_learning_style(self, interactions: List, analytics: List) -> str:
        """Detect user's preferred learning style"""
        style_scores = {style: 0 for style in self.learning_styles}
        
        for interaction in interactions:
            if interaction.interaction_data:
                data = json.loads(interaction.interaction_data)
                # Visual learners spend more time on visual elements
                if data.get('visual_time', 0) > data.get('text_time', 0):
                    style_scores['visual'] += 1
                # Auditory learners use audio controls more
                if data.get('audio_replays', 0) > 0:
                    style_scores['auditory'] += 1
                # Kinesthetic learners complete more interactions
                if data.get('interactions_completed', 0) > 2:
                    style_scores['kinesthetic'] += 1
        
        return max(style_scores, key=style_scores.get)
    
    def _calculate_average_segment_time(self, interactions: List) -> float:
        """Calculate average time spent per segment"""
        times = []
        for interaction in interactions:
            if interaction.timestamp and interaction.interaction_data:
                data = json.loads(interaction.interaction_data)
                if 'duration' in data:
                    times.append(data['duration'])
        
        return np.mean(times) if times else 120.0
    
    def _calculate_success_rate(self, interactions: List) -> float:
        """Calculate overall interaction success rate"""
        total = len(interactions)
        if total == 0:
            return 0.7
        
        successful = sum(1 for i in interactions 
                        if json.loads(i.interaction_data or '{}').get('success', False))
        
        return successful / total
    
    def _determine_preferred_difficulty(self, interactions: List, success_rate: float) -> str:
        """Determine user's preferred difficulty level"""
        if success_rate > 0.9:
            return 'advanced'
        elif success_rate > 0.7:
            return 'intermediate'
        else:
            return 'beginner'
    
    def _identify_strengths_weaknesses(self, interactions: List) -> Tuple[List[str], List[str]]:
        """Identify areas where user excels or struggles"""
        concept_performance = {}
        
        for interaction in interactions:
            segment = Segment.query.get(interaction.segment_id)
            if segment and segment.keywords:
                for keyword in segment.keywords:
                    if keyword not in concept_performance:
                        concept_performance[keyword] = {'success': 0, 'total': 0}
                    
                    concept_performance[keyword]['total'] += 1
                    if json.loads(interaction.interaction_data or '{}').get('success', False):
                        concept_performance[keyword]['success'] += 1
        
        strengths = []
        weaknesses = []
        
        for concept, perf in concept_performance.items():
            if perf['total'] >= 3:  # Minimum interactions
                rate = perf['success'] / perf['total']
                if rate > 0.8:
                    strengths.append(concept)
                elif rate < 0.5:
                    weaknesses.append(concept)
        
        return strengths, weaknesses
    
    def _calculate_optimal_session_length(self, analytics: List) -> int:
        """Calculate optimal session length in minutes"""
        session_lengths = []
        
        for event in analytics:
            if event.event_type == 'session_end':
                data = json.loads(event.event_data or '{}')
                if 'duration' in data:
                    session_lengths.append(data['duration'] / 60)  # Convert to minutes
        
        if session_lengths:
            # Find the session length with best performance
            return int(np.percentile(session_lengths, 75))  # 75th percentile
        
        return 30  # Default 30 minutes
    
    def _find_best_learning_time(self, analytics: List) -> str:
        """Find when user performs best"""
        time_performance = {period: [] for period in self.time_periods}
        
        for event in analytics:
            if event.timestamp:
                hour = event.timestamp.hour
                for period, (start, end) in self.time_periods.items():
                    if start <= hour < end or (period == 'night' and (hour >= 21 or hour < 6)):
                        if event.event_type == 'interaction_completed':
                            data = json.loads(event.event_data or '{}')
                            if 'success' in data:
                                time_performance[period].append(data['success'])
        
        # Calculate average success rate for each period
        period_scores = {}
        for period, successes in time_performance.items():
            if successes:
                period_scores[period] = sum(successes) / len(successes)
        
        return max(period_scores, key=period_scores.get) if period_scores else 'afternoon'
    
    def _estimate_segment_difficulty(self, segment: Segment) -> str:
        """Estimate difficulty of a segment"""
        # Simple heuristic based on content length and complexity
        text_length = len(segment.text_content or '')
        keyword_count = len(segment.keywords or [])
        
        if text_length > 1000 or keyword_count > 10:
            return 'advanced'
        elif text_length > 500 or keyword_count > 5:
            return 'intermediate'
        else:
            return 'beginner'
    
    def _get_difficulty_adjustments(self, segment: Segment, target_difficulty: str) -> List[str]:
        """Get suggestions for adjusting segment difficulty"""
        current = self._estimate_segment_difficulty(segment)
        
        if target_difficulty == 'beginner' and current in ['intermediate', 'advanced']:
            return [
                'Break down complex concepts',
                'Add more examples',
                'Simplify language',
                'Add visual aids'
            ]
        elif target_difficulty == 'advanced' and current in ['beginner', 'intermediate']:
            return [
                'Add advanced concepts',
                'Include edge cases',
                'Increase pace',
                'Add challenging exercises'
            ]
        
        return []
    
    def _calculate_segment_score(self, segment: Segment, profile: LearningProfile, 
                               progress: UserProgress) -> float:
        """Score a segment based on how well it matches user needs"""
        score = 0.0
        
        # Prefer segments that address weaknesses
        for weakness in profile.weakness_areas:
            if weakness in (segment.keywords or []):
                score += 2.0
        
        # Slightly prefer segments that build on strengths
        for strength in profile.strength_areas:
            if strength in (segment.keywords or []):
                score += 0.5
        
        # Match difficulty preference
        if self._estimate_segment_difficulty(segment) == profile.preferred_difficulty:
            score += 1.0
        
        # Variety bonus - avoid too similar segments
        recent_segments = progress.completed_segments[-5:] if progress.completed_segments else []
        if segment.id not in recent_segments:
            score += 0.5
        
        return score
    
    def _should_skip_episode(self, episode: Episode, profile: LearningProfile) -> bool:
        """Determine if episode can be skipped based on user mastery"""
        if not episode.prerequisite:
            return False
        
        prereq = episode.prerequisite
        if prereq.get('skip_if_proficient'):
            # Check if user has mastered the concepts
            required_concepts = prereq.get('concepts', [])
            return all(concept in profile.strength_areas for concept in required_concepts)
        
        return False
    
    def _estimate_episode_time(self, episode: Episode, profile: LearningProfile) -> int:
        """Estimate time needed to complete episode"""
        base_time = sum(s.estimated_duration for s in episode.segments if s.estimated_duration)
        
        # Adjust based on user's pace
        pace_multiplier = 1.0
        if profile.preferred_difficulty == 'beginner':
            pace_multiplier = 1.3
        elif profile.preferred_difficulty == 'advanced':
            pace_multiplier = 0.8
        
        return int(base_time * pace_multiplier)
    
    def _identify_focus_segments(self, episode: Episode, profile: LearningProfile) -> List[str]:
        """Identify segments that need special attention"""
        focus = []
        
        for segment in episode.segments:
            # Focus on segments with weak areas
            if any(w in (segment.keywords or []) for w in profile.weakness_areas):
                focus.append(segment.id)
        
        return focus
    
    def _determine_pace(self, profile: LearningProfile) -> str:
        """Determine learning pace"""
        if profile.preferred_difficulty == 'beginner':
            return 'slow'
        elif profile.preferred_difficulty == 'advanced':
            return 'fast'
        return 'normal'
    
    def _determine_depth(self, profile: LearningProfile) -> str:
        """Determine content depth"""
        if profile.preferred_difficulty == 'advanced':
            return 'comprehensive'
        elif profile.preferred_difficulty == 'beginner':
            return 'overview'
        return 'standard'
    
    def _determine_interaction_level(self, profile: LearningProfile) -> str:
        """Determine interaction level"""
        if profile.learning_style == 'kinesthetic':
            return 'high'
        elif profile.learning_style == 'reading':
            return 'low'
        return 'medium'


class SpacedRepetitionScheduler:
    """
    Implements spaced repetition algorithm for optimal knowledge retention
    Based on SM-2 algorithm with modifications
    """
    
    def __init__(self):
        # Base intervals in days
        self.base_intervals = [1, 3, 7, 14, 30, 90, 180, 365]
        self.min_ease_factor = 1.3
        self.max_ease_factor = 2.5
        self.target_retention = 0.9
        
    def calculate_next_review(self, concept: str, user_id: str, 
                            performance: float) -> ConceptMastery:
        """
        Calculate when to review a concept next based on performance
        
        Args:
            concept: The concept/keyword to review
            user_id: User ID
            performance: Score between 0 and 1
        
        Returns:
            ConceptMastery object with next review date
        """
        # Get or create concept mastery record
        mastery = self._get_concept_mastery(concept, user_id)
        
        # Update based on performance
        mastery.exposure_count += 1
        mastery.last_reviewed = datetime.now()
        
        # Calculate new interval
        if performance < 0.6:
            # Failed - reset to beginning
            interval = self.base_intervals[0]
            mastery.stability *= 0.6
        else:
            # Passed - calculate next interval
            interval = self._calculate_interval(mastery, performance)
            mastery.stability = self._update_stability(mastery.stability, performance)
        
        mastery.next_review = datetime.now() + timedelta(days=interval)
        mastery.success_rate = self._update_success_rate(mastery.success_rate, performance)
        
        return mastery
    
    def get_due_concepts(self, user_id: str) -> List[ConceptMastery]:
        """
        Get all concepts due for review
        """
        # In a real implementation, this would query the database
        # For now, return mock data
        return []
    
    def generate_review_session(self, user_id: str, max_items: int = 20) -> Dict:
        """
        Generate a review session with mixed content
        """
        due_concepts = self.get_due_concepts(user_id)
        
        if not due_concepts:
            return {
                'session_type': 'no_reviews',
                'message': 'No concepts due for review!',
                'next_review': self._get_next_review_date(user_id)
            }
        
        # Sort by priority (overdue items first)
        due_concepts.sort(key=lambda x: x.next_review)
        
        # Limit to max items
        review_items = due_concepts[:max_items]
        
        # Mix different types of content
        session = {
            'session_type': 'spaced_review',
            'total_items': len(review_items),
            'estimated_time': len(review_items) * 2,  # 2 minutes per item
            'items': []
        }
        
        for concept in review_items:
            # Find segments containing this concept
            segments = self._find_segments_with_concept(concept.concept)
            
            if segments:
                session['items'].append({
                    'concept': concept.concept,
                    'last_seen': concept.last_reviewed.isoformat(),
                    'difficulty': concept.difficulty,
                    'segment_options': [
                        {
                            'segment_id': s.id,
                            'segment_type': s.segment_type,
                            'preview': s.text_content[:100] + '...'
                        }
                        for s in segments[:3]  # Offer up to 3 segments
                    ]
                })
        
        return session
    
    def optimize_review_schedule(self, user_id: str, available_time: int) -> Dict:
        """
        Optimize review schedule based on available time and forgetting curves
        
        Args:
            user_id: User ID
            available_time: Available time in minutes
            
        Returns:
            Optimized review schedule
        """
        due_concepts = self.get_due_concepts(user_id)
        profile = AdaptiveLearningEngine().analyze_user_profile(user_id)
        
        # Calculate priority score for each concept
        prioritized = []
        for concept in due_concepts:
            priority = self._calculate_priority(concept, profile)
            time_needed = self._estimate_review_time(concept, profile)
            prioritized.append({
                'concept': concept,
                'priority': priority,
                'time_needed': time_needed
            })
        
        # Sort by priority
        prioritized.sort(key=lambda x: x['priority'], reverse=True)
        
        # Select items that fit in available time
        selected = []
        total_time = 0
        
        for item in prioritized:
            if total_time + item['time_needed'] <= available_time:
                selected.append(item)
                total_time += item['time_needed']
        
        return {
            'total_items': len(selected),
            'total_time': total_time,
            'items': selected,
            'deferred_items': len(prioritized) - len(selected)
        }
    
    # Helper methods
    def _get_concept_mastery(self, concept: str, user_id: str) -> ConceptMastery:
        """Get or create concept mastery record"""
        # In real implementation, query database
        # For now, return new record
        return ConceptMastery(
            concept=concept,
            exposure_count=0,
            success_rate=0.0,
            last_reviewed=datetime.now(),
            next_review=datetime.now(),
            stability=1.0,
            difficulty=1.0
        )
    
    def _calculate_interval(self, mastery: ConceptMastery, performance: float) -> int:
        """Calculate next review interval using modified SM-2"""
        if mastery.exposure_count == 1:
            return self.base_intervals[0]
        
        # Get previous interval
        prev_interval = (mastery.next_review - mastery.last_reviewed).days
        
        # Calculate ease factor
        ease_factor = mastery.stability + (0.1 - (5 - performance * 5) * (0.08 + (5 - performance * 5) * 0.02))
        ease_factor = max(self.min_ease_factor, min(self.max_ease_factor, ease_factor))
        
        # Calculate new interval
        if mastery.exposure_count == 2:
            new_interval = 6
        else:
            new_interval = prev_interval * ease_factor
        
        # Add some randomness to prevent clustering
        new_interval *= (0.9 + np.random.random() * 0.2)
        
        return int(new_interval)
    
    def _update_stability(self, current_stability: float, performance: float) -> float:
        """Update stability factor based on performance"""
        if performance >= 0.9:
            return min(current_stability * 1.1, self.max_ease_factor)
        elif performance >= 0.6:
            return current_stability
        else:
            return max(current_stability * 0.9, self.min_ease_factor)
    
    def _update_success_rate(self, current_rate: float, performance: float) -> float:
        """Update success rate with exponential moving average"""
        alpha = 0.3  # Weight for new performance
        return alpha * performance + (1 - alpha) * current_rate
    
    def _get_next_review_date(self, user_id: str) -> Optional[datetime]:
        """Get date of next scheduled review"""
        # In real implementation, query database for earliest next_review
        return datetime.now() + timedelta(days=1)
    
    def _find_segments_with_concept(self, concept: str) -> List[Segment]:
        """Find segments containing a specific concept"""
        # In real implementation, this would be a database query
        # For now, return empty list
        return []
    
    def _calculate_priority(self, concept: ConceptMastery, profile: LearningProfile) -> float:
        """Calculate review priority based on multiple factors"""
        priority = 0.0
        
        # Overdue items get highest priority
        days_overdue = (datetime.now() - concept.next_review).days
        if days_overdue > 0:
            priority += days_overdue * 2
        
        # Weak areas get priority
        if concept.concept in profile.weakness_areas:
            priority += 5
        
        # Low success rate increases priority
        priority += (1 - concept.success_rate) * 3
        
        # High difficulty increases priority
        priority += concept.difficulty
        
        return priority
    
    def _estimate_review_time(self, concept: ConceptMastery, profile: LearningProfile) -> int:
        """Estimate time needed to review a concept"""
        base_time = 2  # 2 minutes base
        
        # Adjust for difficulty
        base_time *= concept.difficulty
        
        # Adjust for user's pace
        if profile.preferred_difficulty == 'beginner':
            base_time *= 1.5
        elif profile.preferred_difficulty == 'advanced':
            base_time *= 0.8
        
        return int(base_time)


# API endpoints for adaptive learning
def create_adaptive_routes(app):
    """Create Flask routes for adaptive learning features"""
    
    @app.route('/api/v1/adaptive/profile/<user_id>', methods=['GET'])
    def get_learning_profile(user_id):
        """Get user's learning profile"""
        engine = AdaptiveLearningEngine()
        profile = engine.analyze_user_profile(user_id)
        return json.dumps(asdict(profile), default=str)
    
    @app.route('/api/v1/adaptive/personalize', methods=['POST'])
    def personalize_segment():
        """Personalize a segment for a user"""
        data = request.get_json()
        user_id = data.get('user_id')
        segment_id = data.get('segment_id')
        
        segment = Segment.query.get(segment_id)
        if not segment:
            return {'error': 'Segment not found'}, 404
        
        engine = AdaptiveLearningEngine()
        profile = engine.analyze_user_profile(user_id)
        personalized = engine.personalize_segment(segment, profile)
        
        return personalized
    
    @app.route('/api/v1/adaptive/recommend-next', methods=['POST'])
    def recommend_next():
        """Recommend next segment to study"""
        data = request.get_json()
        user_id = data.get('user_id')
        episode_id = data.get('episode_id')
        
        episode = Episode.query.get(episode_id)
        if not episode:
            return {'error': 'Episode not found'}, 404
        
        engine = AdaptiveLearningEngine()
        next_segment = engine.recommend_next_segment(user_id, episode)
        
        if next_segment:
            return {
                'segment_id': next_segment.id,
                'segment_type': next_segment.segment_type,
                'title': next_segment.title
            }
        else:
            return {'message': 'No more segments available'}
    
    @app.route('/api/v1/adaptive/adjust-difficulty', methods=['POST'])
    def adjust_difficulty():
        """Adjust difficulty based on performance"""
        data = request.get_json()
        user_id = data.get('user_id')
        segment_id = data.get('segment_id')
        performance = data.get('performance', {})
        
        engine = AdaptiveLearningEngine()
        adjustments = engine.adjust_difficulty_dynamically(user_id, segment_id, performance)
        
        return adjustments
    
    @app.route('/api/v1/adaptive/learning-path/<course_id>', methods=['GET'])
    def get_learning_path(course_id):
        """Get personalized learning path"""
        user_id = request.args.get('user_id')
        
        engine = AdaptiveLearningEngine()
        path = engine.generate_learning_path(user_id, course_id)
        
        return {'learning_path': path}
    
    @app.route('/api/v1/spaced-repetition/schedule-review', methods=['POST'])
    def schedule_review():
        """Schedule next review for a concept"""
        data = request.get_json()
        concept = data.get('concept')
        user_id = data.get('user_id')
        performance = data.get('performance', 0.7)
        
        scheduler = SpacedRepetitionScheduler()
        mastery = scheduler.calculate_next_review(concept, user_id, performance)
        
        return asdict(mastery, default=str)
    
    @app.route('/api/v1/spaced-repetition/due-reviews/<user_id>', methods=['GET'])
    def get_due_reviews(user_id):
        """Get concepts due for review"""
        scheduler = SpacedRepetitionScheduler()
        due_concepts = scheduler.get_due_concepts(user_id)
        
        return {
            'total': len(due_concepts),
            'concepts': [asdict(c, default=str) for c in due_concepts]
        }
    
    @app.route('/api/v1/spaced-repetition/generate-session', methods=['POST'])
    def generate_review_session():
        """Generate a review session"""
        data = request.get_json()
        user_id = data.get('user_id')
        max_items = data.get('max_items', 20)
        
        scheduler = SpacedRepetitionScheduler()
        session = scheduler.generate_review_session(user_id, max_items)
        
        return session
    
    @app.route('/api/v1/spaced-repetition/optimize-schedule', methods=['POST'])
    def optimize_schedule():
        """Optimize review schedule based on available time"""
        data = request.get_json()
        user_id = data.get('user_id')
        available_time = data.get('available_time', 30)
        
        scheduler = SpacedRepetitionScheduler()
        schedule = scheduler.optimize_review_schedule(user_id, available_time)
        
        return schedule