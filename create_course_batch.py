#!/usr/bin/env python3
"""
Batch course creation script using templates
Rapidly generate course structures for multiple topics
"""

import json
from pathlib import Path
from datetime import datetime

# Load templates
templates_path = Path("learning_content/segment_templates.json")
with open(templates_path, 'r') as f:
    templates = json.load(f)

def create_course_structure(course_config):
    """Create a complete course structure from configuration"""
    
    course = {
        "course": {
            "id": course_config["id"],
            "title": course_config["title"],
            "description": course_config["description"],
            "totalEstimatedDuration": course_config["duration"],
            "level": course_config["level"],
            "prerequisites": course_config["prerequisites"],
            "learningObjectives": course_config["objectives"],
            "instructor": course_config["instructor"],
            "completionRequirements": {
                "minSegmentsCompleted": 0.8,
                "minCheckpointScore": 0.7,
                "requiredCheckpoints": []
            },
            "certificateId": f"cert-{course_config['id']}",
            "badges": course_config["badges"]
        },
        "lessons": []
    }
    
    # Create lessons
    for lesson_idx, lesson_config in enumerate(course_config["lessons"]):
        lesson = {
            "id": f"{course_config['id']}-lesson-{lesson_idx + 1}",
            "title": lesson_config["title"],
            "order": lesson_idx + 1,
            "totalEstimatedDuration": lesson_config["duration"],
            "learningObjectives": lesson_config["objectives"],
            "episodes": []
        }
        
        # Create episodes
        for ep_idx, episode_config in enumerate(lesson_config["episodes"]):
            episode = {
                "id": f"{course_config['id']}-lesson-{lesson_idx + 1}-episode-{ep_idx + 1}",
                "title": episode_config["title"],
                "order": ep_idx + 1,
                "estimatedDuration": episode_config["duration"],
                "learningObjectives": episode_config["objectives"],
                "segments": []
            }
            
            # Create segments based on templates
            for seg_idx, segment_config in enumerate(episode_config["segments"]):
                segment_type = segment_config["type"]
                template = templates["segmentTemplates"].get(segment_type, {}).get("template", {})
                
                segment = {
                    "id": f"{episode['id']}-seg-{seg_idx + 1}",
                    "order": seg_idx + 1,
                    "segmentType": segment_type,
                    "title": segment_config["title"],
                    "textContent": segment_config["content"],
                    "estimatedDuration": segment_config.get("duration", template.get("estimatedDuration", "5 minutes")),
                    "learningObjectives": segment_config.get("objectives", []),
                    "keywords": segment_config.get("keywords", []),
                    "pointsAwarded": segment_config.get("points", template.get("pointsAwarded", 10)),
                    "mediaRefs": {
                        "audioId": f"AUDIO_{episode['id']}_SEG_{seg_idx + 1}",
                        "visualIds": segment_config.get("visuals", [])
                    }
                }
                
                # Add interactive element if specified
                if "interaction" in segment_config:
                    segment["interactiveCue"] = segment_config["interaction"]
                
                # Add code example if specified
                if "code" in segment_config:
                    segment["codeExample"] = segment_config["code"]
                
                episode["segments"].append(segment)
            
            # Add checkpoint if specified
            if "checkpoint" in episode_config:
                episode["checkpoint"] = episode_config["checkpoint"]
                episode["checkpointId"] = f"{episode['id']}-checkpoint"
                course["course"]["completionRequirements"]["requiredCheckpoints"].append(episode["checkpointId"])
            
            lesson["episodes"].append(episode)
        
        course["lessons"].append(lesson)
    
    return course

# Course configurations
courses_to_create = [
    {
        "id": "javascript-essentials-v1",
        "title": "JavaScript Essentials: Modern Development",
        "description": "Master modern JavaScript from ES6+ to async programming and web APIs",
        "duration": "10 hours",
        "level": "beginner",
        "prerequisites": ["Basic HTML/CSS knowledge"],
        "objectives": [
            "Master JavaScript fundamentals and ES6+ features",
            "Understand asynchronous programming patterns",
            "Work with DOM and browser APIs",
            "Build interactive web applications",
            "Debug and test JavaScript code"
        ],
        "instructor": {
            "name": "Maya Patel",
            "bio": "Full-stack developer with 8+ years of JavaScript expertise",
            "avatar": "/static/instructors/maya-patel.png"
        },
        "badges": [
            {"id": "js-starter", "name": "JavaScript Starter", "criteria": "Complete first lesson"},
            {"id": "async-master", "name": "Async Master", "criteria": "Master promises and async/await"},
            {"id": "js-developer", "name": "JavaScript Developer", "criteria": "Complete entire course"}
        ],
        "lessons": [
            {
                "title": "JavaScript Fundamentals",
                "duration": "2.5 hours",
                "objectives": ["Understand JS basics", "Work with data types", "Control program flow"],
                "episodes": [
                    {
                        "title": "Introduction to JavaScript",
                        "duration": "30 minutes",
                        "objectives": ["Understand what JavaScript is", "Set up development environment"],
                        "segments": [
                            {
                                "type": "course_opening",
                                "title": "Welcome to JavaScript Essentials",
                                "content": "Welcome to the exciting world of JavaScript! This course will transform you from a beginner to a confident JavaScript developer. We'll start with the basics and build up to creating interactive web applications.",
                                "keywords": ["javascript", "welcome", "introduction"],
                                "points": 10
                            },
                            {
                                "type": "origin_story",
                                "title": "JavaScript's Journey: From 10 Days to Everywhere",
                                "content": "In 1995, Brendan Eich created JavaScript in just 10 days. Originally called Mocha, then LiveScript, it was designed to make web pages interactive. Today, JavaScript runs everywhere - browsers, servers, mobile apps, and even IoT devices.",
                                "keywords": ["history", "brendan eich", "evolution"],
                                "points": 15,
                                "interaction": {
                                    "cueType": "interactive_explorer",
                                    "config": {
                                        "timeline": {
                                            "1995": "JavaScript created at Netscape",
                                            "1997": "ECMAScript standard established",
                                            "2009": "Node.js brings JS to servers",
                                            "2015": "ES6/ES2015 modernizes the language",
                                            "2024": "JavaScript powers 98% of websites"
                                        }
                                    }
                                }
                            },
                            {
                                "type": "practical_configuration",
                                "title": "Setting Up Your JavaScript Environment",
                                "content": "Let's set up a modern JavaScript development environment. We'll use VS Code as our editor, Chrome DevTools for debugging, and Node.js for running JavaScript outside the browser.",
                                "duration": "10 minutes",
                                "keywords": ["setup", "environment", "tools"],
                                "points": 20,
                                "visuals": ["VISUAL_VSCODE_SETUP", "VISUAL_DEVTOOLS_INTRO"],
                                "interaction": {
                                    "cueType": "ui_simulation",
                                    "config": {
                                        "simulation": "setup_wizard",
                                        "steps": [
                                            "Download VS Code",
                                            "Install Node.js",
                                            "Configure extensions",
                                            "Test installation"
                                        ]
                                    }
                                }
                            }
                        ]
                    },
                    {
                        "title": "Variables and Data Types",
                        "duration": "45 minutes",
                        "objectives": ["Declare and use variables", "Understand data types", "Type conversion"],
                        "segments": [
                            {
                                "type": "concept_explanation",
                                "title": "Variables: Containers for Data",
                                "content": "Variables are like labeled boxes where we store data. In modern JavaScript, we use 'let' for values that change and 'const' for values that stay the same. The old 'var' keyword has quirks we'll explore.",
                                "keywords": ["variables", "let", "const", "var"],
                                "points": 15,
                                "code": {
                                    "language": "javascript",
                                    "code": "// Modern variable declaration\nconst name = 'Alice';  // Can't be reassigned\nlet age = 25;         // Can be reassigned\nage = 26;             // This works!\n\n// Old way (avoid in modern code)\nvar oldStyle = 'legacy';",
                                    "filename": "variables.js"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                "title": "Functions and Scope",
                "duration": "2 hours",
                "objectives": ["Create and use functions", "Understand scope and closures", "Master arrow functions"],
                "episodes": []
            },
            {
                "title": "Asynchronous JavaScript",
                "duration": "2.5 hours",
                "objectives": ["Master callbacks, promises, and async/await", "Handle errors gracefully", "Work with APIs"],
                "episodes": []
            },
            {
                "title": "DOM and Web APIs",
                "duration": "2 hours",
                "objectives": ["Manipulate the DOM", "Handle events", "Use browser APIs"],
                "episodes": []
            },
            {
                "title": "Modern JavaScript Practices",
                "duration": "1 hour",
                "objectives": ["Use modules", "Debug effectively", "Follow best practices"],
                "episodes": []
            }
        ]
    },
    {
        "id": "data-structures-algorithms-v1",
        "title": "Data Structures & Algorithms in Practice",
        "description": "Master essential data structures and algorithms with practical implementations",
        "duration": "12 hours",
        "level": "intermediate",
        "prerequisites": ["Programming experience in any language"],
        "objectives": [
            "Understand core data structures",
            "Implement common algorithms",
            "Analyze time and space complexity",
            "Solve coding interview problems",
            "Apply DSA to real-world problems"
        ],
        "instructor": {
            "name": "Dr. Chen Wei",
            "bio": "Computer Science professor and algorithms researcher",
            "avatar": "/static/instructors/chen-wei.png"
        },
        "badges": [
            {"id": "dsa-starter", "name": "DSA Explorer", "criteria": "Complete first lesson"},
            {"id": "complexity-master", "name": "Complexity Analyzer", "criteria": "Master Big O analysis"},
            {"id": "algorithm-expert", "name": "Algorithm Expert", "criteria": "Complete entire course"}
        ],
        "lessons": [
            {
                "title": "Introduction and Complexity Analysis",
                "duration": "2 hours",
                "objectives": ["Understand DSA importance", "Master Big O notation", "Analyze algorithms"],
                "episodes": []
            },
            {
                "title": "Linear Data Structures",
                "duration": "3 hours",
                "objectives": ["Master arrays, lists, stacks, queues", "Implement from scratch", "Real applications"],
                "episodes": []
            },
            {
                "title": "Trees and Graphs",
                "duration": "3 hours",
                "objectives": ["Understand tree structures", "Graph representations", "Traversal algorithms"],
                "episodes": []
            },
            {
                "title": "Sorting and Searching",
                "duration": "2 hours",
                "objectives": ["Compare sorting algorithms", "Binary search variations", "Performance optimization"],
                "episodes": []
            },
            {
                "title": "Dynamic Programming",
                "duration": "2 hours",
                "objectives": ["Understand DP principles", "Solve classic problems", "Optimization techniques"],
                "episodes": []
            }
        ]
    },
    {
        "id": "microservices-architecture-v1",
        "title": "Microservices Architecture: Design to Deployment",
        "description": "Build scalable microservices systems from architecture to production",
        "duration": "10 hours",
        "level": "advanced",
        "prerequisites": ["Experience with web applications", "Basic distributed systems knowledge"],
        "objectives": [
            "Design microservices architectures",
            "Implement service communication patterns",
            "Handle distributed system challenges",
            "Deploy and monitor microservices",
            "Apply best practices and patterns"
        ],
        "instructor": {
            "name": "Jordan Smith",
            "bio": "Cloud architect with 10+ years building microservices at scale",
            "avatar": "/static/instructors/jordan-smith.png"
        },
        "badges": [
            {"id": "microservices-designer", "name": "Service Designer", "criteria": "Complete architecture lessons"},
            {"id": "resilience-expert", "name": "Resilience Expert", "criteria": "Master fault tolerance patterns"},
            {"id": "microservices-architect", "name": "Microservices Architect", "criteria": "Complete entire course"}
        ],
        "lessons": [
            {
                "title": "Microservices Fundamentals",
                "duration": "2 hours",
                "objectives": ["Understand microservices principles", "Compare with monoliths", "Design considerations"],
                "episodes": []
            },
            {
                "title": "Service Communication",
                "duration": "2.5 hours",
                "objectives": ["REST vs gRPC vs messaging", "Service discovery", "API gateways"],
                "episodes": []
            },
            {
                "title": "Data Management",
                "duration": "2 hours",
                "objectives": ["Database per service", "Distributed transactions", "Event sourcing"],
                "episodes": []
            },
            {
                "title": "Resilience and Monitoring",
                "duration": "2 hours",
                "objectives": ["Circuit breakers", "Distributed tracing", "Observability"],
                "episodes": []
            },
            {
                "title": "Deployment and Operations",
                "duration": "1.5 hours",
                "objectives": ["Containerization", "Kubernetes", "CI/CD pipelines"],
                "episodes": []
            }
        ]
    }
]

# Generate courses
output_dir = Path("learning_content/generated_courses")
output_dir.mkdir(exist_ok=True)

for course_config in courses_to_create:
    print(f"Creating course: {course_config['title']}")
    course_data = create_course_structure(course_config)
    
    # Save course
    output_file = output_dir / f"{course_config['id']}.json"
    with open(output_file, 'w') as f:
        json.dump(course_data, f, indent=2)
    
    # Generate summary
    total_segments = sum(
        len(episode['segments']) 
        for lesson in course_data['lessons'] 
        for episode in lesson['episodes']
    )
    
    print(f"  - Saved to: {output_file}")
    print(f"  - Lessons: {len(course_data['lessons'])}")
    print(f"  - Episodes: {sum(len(lesson['episodes']) for lesson in course_data['lessons'])}")
    print(f"  - Segments: {total_segments}")
    print()

print(f"\nGenerated {len(courses_to_create)} course templates in {output_dir}")
print("\nNext steps:")
print("1. Fill in remaining episode structures")
print("2. Add segment content using templates")
print("3. Create visual assets")
print("4. Generate audio narration")
print("5. Validate with validate_course_content.py")