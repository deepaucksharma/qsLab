#!/usr/bin/env python3
"""
Build a complete Kafka monitoring course by merging and enhancing existing content
"""

import json
from pathlib import Path

# Load existing course data
learning_content_dir = Path("learning_content")
analytics_data = json.loads((learning_content_dir / "analyticsSummary.json").read_text())
enhanced_data = json.loads((learning_content_dir / "kafka_course_enhanced.json").read_text())
templates_data = json.loads((learning_content_dir / "segment_templates.json").read_text())

# Build complete course structure
complete_course = {
    "course": {
        "id": "kafka-monitoring-share-groups-v2",
        "title": "Kafka Monitoring & Share Groups: The Complete Guide",
        "description": "Master Kafka monitoring from fundamentals to the revolutionary Share Groups feature in Kafka 4.0+",
        "totalEstimatedDuration": "12 hours",
        "level": "intermediate",
        "prerequisites": ["Basic understanding of distributed systems", "Familiarity with message queues"],
        "learningObjectives": [
            "Understand Kafka's architecture and core concepts",
            "Master consumer groups and the new Share Groups feature",
            "Learn JMX and Micrometer monitoring approaches",
            "Integrate Kafka with NewRelic using QueueSample v2",
            "Build production-ready monitoring dashboards"
        ],
        "instructor": {
            "name": "Alex Rodriguez",
            "bio": "Principal Engineer with 10+ years of Kafka experience at scale",
            "avatar": "/static/instructors/alex-rodriguez.png"
        },
        "completionRequirements": {
            "minSegmentsCompleted": 0.8,
            "minCheckpointScore": 0.7,
            "requiredCheckpoints": [
                "checkpoint-kafka-fundamentals",
                "checkpoint-share-groups",
                "checkpoint-monitoring-strategy",
                "checkpoint-newrelic-integration"
            ]
        },
        "certificateId": "cert-kafka-monitoring-expert",
        "badges": [
            {
                "id": "kafka-basics-master",
                "name": "Kafka Basics Master",
                "criteria": "Complete Lesson 1 with 80%+ score"
            },
            {
                "id": "share-groups-pioneer",
                "name": "Share Groups Pioneer",
                "criteria": "Complete Share Groups episodes"
            },
            {
                "id": "monitoring-guru",
                "name": "Monitoring Guru",
                "criteria": "Complete all monitoring lessons"
            },
            {
                "id": "kafka-expert",
                "name": "Kafka Monitoring Expert",
                "criteria": "Complete entire course with 85%+ score"
            }
        ]
    },
    "lessons": []
}

# Process lessons from analytics data
for idx, lesson in enumerate(analytics_data["lessons"]):
    lesson_data = {
        "id": lesson["lessonId"],
        "title": lesson["title"],
        "order": lesson.get("order", idx + 1),
        "totalEstimatedDuration": lesson.get("totalEstimatedDuration", "3 hours"),
        "learningObjectives": lesson.get("learningObjectives", []),
        "episodes": []
    }
    
    # Process episodes
    for ep_idx, episode in enumerate(lesson["episodes"]):
        episode_data = {
            "id": episode["episodeId"],
            "title": episode["title"],
            "order": episode.get("order", ep_idx + 1),
            "estimatedDuration": episode.get("estimatedDuration", "30 minutes"),
            "learningObjectives": episode.get("learningObjectives", []),
            "prerequisite": episode.get("prerequisite"),
            "segments": []
        }
        
        # Process segments from analytics data
        for seg_idx, segment in enumerate(episode["segments"]):
            segment_data = {
                "id": segment["segmentId"],
                "order": segment.get("order", seg_idx + 1),
                "segmentType": segment["segmentType"],
                "title": segment["title"],
                "learningObjectives": segment.get("learningObjectives", []),
                "textContent": segment.get("textContent", ""),
                "estimatedDuration": segment.get("estimatedDuration", "5 minutes"),
                "mediaRefs": segment.get("mediaRefs", {}),
                "interactiveCue": segment.get("interactiveCue"),
                "codeExample": segment.get("codeExample"),
                "keywords": segment.get("keywords", []),
                "pointsAwarded": segment.get("pointsAwarded", 10),
                "analytics": segment.get("analytics", {"xapi_enabled": True})
            }
            
            # Check if we have enhanced content for this segment
            enhanced_segments = []
            for enhanced_lesson in enhanced_data.get("enhancements", []):
                if enhanced_lesson["lessonId"] == lesson["lessonId"]:
                    for enhanced_episode in enhanced_lesson.get("episodes", []):
                        if enhanced_episode["episodeId"] == episode["episodeId"]:
                            enhanced_segments.extend(enhanced_episode.get("additionalSegments", []))
                            enhanced_segments.extend(enhanced_episode.get("enhancedSegments", []))
            
            # Look for enhanced version of this segment
            for enhanced_seg in enhanced_segments:
                if enhanced_seg.get("segmentId") == segment["segmentId"]:
                    # Merge enhanced content
                    segment_data.update(enhanced_seg)
                    break
            
            episode_data["segments"].append(segment_data)
        
        # Add any additional segments from enhanced data
        for enhanced_lesson in enhanced_data.get("enhancements", []):
            if enhanced_lesson["lessonId"] == lesson["lessonId"]:
                for enhanced_episode in enhanced_lesson.get("episodes", []):
                    if enhanced_episode["episodeId"] == episode["episodeId"]:
                        for additional_seg in enhanced_episode.get("additionalSegments", []):
                            # Check if not already added
                            if not any(s.get("id") == additional_seg.get("segmentId") for s in episode_data["segments"]):
                                # Ensure the additional segment has all required fields
                                complete_seg = {
                                    "id": additional_seg.get("segmentId"),
                                    "order": additional_seg.get("order", len(episode_data["segments"]) + 1),
                                    "segmentType": additional_seg.get("segmentType", "concept_explanation"),
                                    "title": additional_seg.get("title", "Additional Content"),
                                    "learningObjectives": additional_seg.get("learningObjectives", []),
                                    "textContent": additional_seg.get("textContent", ""),
                                    "estimatedDuration": additional_seg.get("estimatedDuration", "5 minutes"),
                                    "mediaRefs": additional_seg.get("mediaRefs", {}),
                                    "interactiveCue": additional_seg.get("interactiveCue"),
                                    "codeExample": additional_seg.get("codeExample"),
                                    "keywords": additional_seg.get("keywords", []),
                                    "pointsAwarded": additional_seg.get("pointsAwarded", 10),
                                    "analytics": additional_seg.get("analytics", {"xapi_enabled": True})
                                }
                                episode_data["segments"].append(complete_seg)
        
        # Sort segments by order
        episode_data["segments"].sort(key=lambda s: s["order"])
        
        # Add checkpoint if exists
        if episode.get("checkpoint"):
            episode_data["checkpointId"] = episode["checkpoint"]["id"]
            episode_data["checkpoint"] = episode["checkpoint"]
        
        # Add badge if specified
        if episode.get("badgeOnCompletion"):
            episode_data["badgeOnCompletion"] = episode["badgeOnCompletion"]
        
        lesson_data["episodes"].append(episode_data)
    
    complete_course["lessons"].append(lesson_data)

# Add lesson 4 (Advanced Monitoring) which wasn't in the original data
lesson_4 = {
    "id": "LESSON_04_ADVANCED_MONITORING_V2",
    "title": "Advanced Monitoring & Best Practices",
    "order": 4,
    "totalEstimatedDuration": "3 hours",
    "learningObjectives": [
        "Implement alerting strategies",
        "Optimize for scale",
        "Troubleshoot common issues",
        "Build monitoring culture"
    ],
    "episodes": [
        {
            "id": "EPISODE_04_01_ALERTING_STRATEGIES_V2",
            "title": "Building Effective Alerting Strategies",
            "order": 1,
            "estimatedDuration": "45 minutes",
            "learningObjectives": [
                "Design alert hierarchies",
                "Avoid alert fatigue",
                "Implement SLO-based alerts",
                "Create runbooks"
            ],
            "segments": [
                {
                    "id": "SEG_04_01_01_ALERT_PHILOSOPHY",
                    "order": 1,
                    "segmentType": "paradigm_shift",
                    "title": "From Reactive to Proactive: Alert Philosophy",
                    "textContent": "Most teams drown in alerts. The problem isn't too few alerts - it's too many meaningless ones. We need a fundamental shift: from alerting on symptoms to alerting on customer impact. This means focusing on SLOs, not just metrics.",
                    "estimatedDuration": "6 minutes",
                    "pointsAwarded": 20,
                    "keywords": ["alerting", "SLO", "philosophy"],
                    "mediaRefs": {
                        "audioId": "AUDIO_SEG04_01_01_PHILOSOPHY",
                        "visualIds": ["VISUAL_ALERT_HIERARCHY", "VISUAL_SLO_PYRAMID"]
                    },
                    "interactiveCue": {
                        "cueType": "drag_to_distribute",
                        "config": {
                            "title": "Classify Alerts by Priority",
                            "instruction": "Drag each alert to its appropriate tier",
                            "items": [
                                {"id": "1", "text": "Kafka cluster down"},
                                {"id": "2", "text": "Disk usage at 60%"},
                                {"id": "3", "text": "Consumer lag > 1M messages"},
                                {"id": "4", "text": "JVM GC time > 10%"},
                                {"id": "5", "text": "Single broker restart"},
                                {"id": "6", "text": "Network packet loss detected"}
                            ],
                            "categories": [
                                {
                                    "id": "page",
                                    "label": "Page Immediately (P1)",
                                    "description": "Customer impacting, requires immediate action",
                                    "correctItems": ["1", "3"]
                                },
                                {
                                    "id": "notify",
                                    "label": "Notify On-Call (P2)",
                                    "description": "Potential impact, investigate within hours",
                                    "correctItems": ["4", "6"]
                                },
                                {
                                    "id": "ticket",
                                    "label": "Create Ticket (P3)",
                                    "description": "Needs attention but not urgent",
                                    "correctItems": ["2", "5"]
                                }
                            ]
                        }
                    }
                }
            ]
        },
        {
            "id": "EPISODE_04_02_SCALE_OPTIMIZATION_V2",
            "title": "Optimizing Kafka at Scale",
            "order": 2,
            "estimatedDuration": "45 minutes",
            "learningObjectives": [
                "Tune for high throughput",
                "Optimize for low latency",
                "Balance resources effectively",
                "Plan capacity properly"
            ],
            "segments": []
        },
        {
            "id": "EPISODE_04_03_TROUBLESHOOTING_V2",
            "title": "Troubleshooting Common Issues",
            "order": 3,
            "estimatedDuration": "45 minutes",
            "learningObjectives": [
                "Diagnose performance problems",
                "Fix consumer lag issues",
                "Resolve replication problems",
                "Debug Share Group issues"
            ],
            "segments": []
        },
        {
            "id": "EPISODE_04_04_MONITORING_CULTURE_V2",
            "title": "Building a Monitoring Culture",
            "order": 4,
            "estimatedDuration": "45 minutes",
            "learningObjectives": [
                "Foster observability mindset",
                "Implement monitoring standards",
                "Create effective dashboards",
                "Build team expertise"
            ],
            "segments": []
        }
    ]
}

complete_course["lessons"].append(lesson_4)

# Add assessment bank
complete_course["assessmentBank"] = enhanced_data.get("assessmentBank", {})

# Add content guidelines
complete_course["contentGuidelines"] = enhanced_data.get("contentGuidelines", {})

# Write the complete course
output_path = learning_content_dir / "kafka_course_complete_v2.json"
with open(output_path, 'w') as f:
    json.dump(complete_course, f, indent=2)

print(f"Complete Kafka course written to {output_path}")
print(f"Total lessons: {len(complete_course['lessons'])}")
total_episodes = sum(len(lesson['episodes']) for lesson in complete_course['lessons'])
print(f"Total episodes: {total_episodes}")
total_segments = sum(len(episode['segments']) for lesson in complete_course['lessons'] for episode in lesson['episodes'])
print(f"Total segments: {total_segments}")