#!/usr/bin/env python3
"""
Complete the missing segments for Lesson 4 of the Kafka course
"""

import json
from pathlib import Path

# Define the missing segments for each episode
episode_segments = {
    "EPISODE_04_02_SCALE_OPTIMIZATION_V2": [
        {
            "id": "SEG_04_02_01_PERFORMANCE_BASELINE",
            "order": 1,
            "segmentType": "practical_example",
            "title": "Establishing Performance Baselines",
            "textContent": "Before optimizing, you need to know where you stand. Performance tuning without baselines is like driving blindfolded. We'll establish baselines for throughput, latency, and resource utilization that will guide all optimization efforts.",
            "estimatedDuration": "6 minutes",
            "pointsAwarded": 20,
            "keywords": ["performance", "baseline", "metrics"],
            "mediaRefs": {
                "audioId": "AUDIO_SEG04_02_01_BASELINE",
                "visualIds": ["VISUAL_BASELINE_METRICS", "VISUAL_PERFORMANCE_TARGETS"]
            },
            "interactiveCue": {
                "cueType": "simulation",
                "config": {
                    "simulationType": "performance_tuning",
                    "title": "Kafka Performance Simulator",
                    "parameters": {
                        "producerCount": {
                            "type": "slider",
                            "min": 1,
                            "max": 100,
                            "default": 10
                        },
                        "batchSize": {
                            "type": "slider",
                            "min": 1,
                            "max": 1000,
                            "default": 100,
                            "unit": "KB"
                        },
                        "compressionType": {
                            "type": "select",
                            "options": ["none", "gzip", "snappy", "lz4", "zstd"],
                            "default": "lz4"
                        },
                        "acks": {
                            "type": "select",
                            "options": ["0", "1", "all"],
                            "default": "1"
                        }
                    },
                    "metrics": ["throughput", "latency", "cpu_usage", "network_io"]
                }
            }
        },
        {
            "id": "SEG_04_02_02_PRODUCER_OPTIMIZATION",
            "order": 2,
            "segmentType": "code_walkthrough",
            "title": "Producer Optimization Techniques",
            "textContent": "Producers are often the first bottleneck. By tuning batch size, compression, and async settings, you can achieve 10x throughput improvements. Let's explore the key producer configurations that matter at scale.",
            "estimatedDuration": "8 minutes",
            "pointsAwarded": 30,
            "keywords": ["producer", "optimization", "throughput"],
            "codeExample": {
                "language": "java",
                "code": "// Optimized producer configuration for high throughput\nProperties props = new Properties();\n\n// Batching for efficiency\nprops.put(\"batch.size\", 65536); // 64KB batches\nprops.put(\"linger.ms\", 10); // Wait up to 10ms for batching\n\n// Compression for network efficiency\nprops.put(\"compression.type\", \"lz4\"); // Fast compression\n\n// Memory and buffering\nprops.put(\"buffer.memory\", 67108864); // 64MB buffer\nprops.put(\"max.in.flight.requests.per.connection\", 5);\n\n// Reliability vs performance trade-off\nprops.put(\"acks\", \"1\"); // Leader acknowledgment only\nprops.put(\"retries\", 3);\nprops.put(\"max.request.size\", 1048576); // 1MB max request\n\n// Idempotence for exactly-once semantics\nprops.put(\"enable.idempotence\", true);",
                "filename": "OptimizedProducer.java"
            },
            "mediaRefs": {
                "audioId": "AUDIO_SEG04_02_02_PRODUCER",
                "visualIds": ["VISUAL_PRODUCER_FLOW", "VISUAL_BATCHING_IMPACT"]
            },
            "interactiveCue": {
                "cueType": "predict_value_change",
                "config": {
                    "title": "Predict Performance Impact",
                    "scenarios": [
                        {
                            "setup": "You increase batch.size from 16KB to 64KB",
                            "question": "What happens to throughput?",
                            "options": ["Decreases", "Stays same", "Increases 2-3x", "Increases 10x"],
                            "correct": "Increases 2-3x",
                            "explanation": "Larger batches amortize overhead, improving throughput significantly"
                        },
                        {
                            "setup": "You enable compression (lz4)",
                            "question": "What happens to CPU usage?",
                            "options": ["No change", "Slight increase", "Doubles", "Decreases"],
                            "correct": "Slight increase",
                            "explanation": "LZ4 is CPU-efficient, trading small CPU cost for major network savings"
                        }
                    ]
                }
            }
        },
        {
            "id": "SEG_04_02_03_BROKER_TUNING",
            "order": 3,
            "segmentType": "practical_configuration",
            "title": "Broker-Side Performance Tuning",
            "textContent": "Brokers are the heart of Kafka. Proper tuning of thread pools, memory allocation, and disk I/O can mean the difference between handling 100K and 1M messages per second. Let's optimize for your scale.",
            "estimatedDuration": "7 minutes",
            "pointsAwarded": 25,
            "keywords": ["broker", "tuning", "scale"],
            "codeExample": {
                "language": "properties",
                "code": "# High-performance broker configuration\n\n# Network and I/O threads\nnum.network.threads=16\nnum.io.threads=16\nnum.replica.fetchers=8\n\n# Socket buffer sizes (1MB)\nsocket.send.buffer.bytes=1048576\nsocket.receive.buffer.bytes=1048576\nsocket.request.max.bytes=104857600\n\n# Log configuration\nlog.segment.bytes=1073741824  # 1GB segments\nlog.retention.check.interval.ms=300000\n\n# Replication tuning\nreplica.lag.time.max.ms=30000\nreplica.socket.receive.buffer.bytes=1048576\n\n# Group coordinator settings\noffsets.topic.replication.factor=3\ntransaction.state.log.replication.factor=3\n\n# Share Groups optimization (Kafka 4.0+)\nshare.group.max.session.timeout.ms=600000\nshare.group.partition.max.fetch.bytes=10485760",
                "filename": "broker-performance.properties"
            },
            "mediaRefs": {
                "audioId": "AUDIO_SEG04_02_03_BROKER",
                "visualIds": ["VISUAL_BROKER_INTERNALS", "VISUAL_THREAD_MODEL"]
            },
            "interactiveCue": {
                "cueType": "field_mapping_exercise",
                "config": {
                    "title": "Match Configuration to Impact",
                    "instruction": "Connect each config to its primary impact",
                    "leftSide": [
                        {"id": "1", "label": "num.io.threads"},
                        {"id": "2", "label": "socket.buffer.bytes"},
                        {"id": "3", "label": "log.segment.bytes"},
                        {"id": "4", "label": "replica.lag.time.max.ms"}
                    ],
                    "rightSide": [
                        {"id": "a", "label": "Network throughput"},
                        {"id": "b", "label": "Disk I/O parallelism"},
                        {"id": "c", "label": "Log compaction efficiency"},
                        {"id": "d", "label": "ISR stability"}
                    ],
                    "correctMappings": {
                        "1": "b",
                        "2": "a",
                        "3": "c",
                        "4": "d"
                    }
                }
            }
        },
        {
            "id": "SEG_04_02_04_CAPACITY_PLANNING",
            "order": 4,
            "segmentType": "decision_framework",
            "title": "Capacity Planning for Scale",
            "textContent": "Capacity planning isn't just about having enough servers. It's about understanding growth patterns, peak loads, and failure scenarios. We'll build a framework for planning Kafka capacity that scales with your business.",
            "estimatedDuration": "8 minutes",
            "pointsAwarded": 30,
            "keywords": ["capacity", "planning", "scale"],
            "mediaRefs": {
                "audioId": "AUDIO_SEG04_02_04_CAPACITY",
                "visualIds": ["VISUAL_CAPACITY_FORMULA", "VISUAL_GROWTH_PROJECTION"]
            },
            "interactiveCue": {
                "cueType": "simulation",
                "config": {
                    "simulationType": "capacity_planner",
                    "title": "Kafka Capacity Calculator",
                    "inputs": {
                        "messageRate": {
                            "label": "Messages/sec",
                            "type": "number",
                            "default": 100000
                        },
                        "messageSize": {
                            "label": "Avg Message Size (bytes)",
                            "type": "number",
                            "default": 1000
                        },
                        "replicationFactor": {
                            "label": "Replication Factor",
                            "type": "select",
                            "options": [1, 2, 3],
                            "default": 3
                        },
                        "retentionHours": {
                            "label": "Retention (hours)",
                            "type": "number",
                            "default": 168
                        },
                        "peakMultiplier": {
                            "label": "Peak Traffic Multiplier",
                            "type": "slider",
                            "min": 1,
                            "max": 10,
                            "default": 3
                        }
                    },
                    "outputs": [
                        "Required Storage (TB)",
                        "Network Bandwidth (Gbps)",
                        "Recommended Brokers",
                        "Partition Count"
                    ]
                }
            }
        },
        {
            "id": "SEG_04_02_05_MONITORING_PERFORMANCE",
            "order": 5,
            "segmentType": "checkpoint",
            "title": "Performance Optimization Checkpoint",
            "textContent": "Let's validate your understanding of Kafka performance optimization. These scenarios will test your ability to diagnose and resolve real performance issues.",
            "estimatedDuration": "5 minutes",
            "pointsAwarded": 40,
            "keywords": ["checkpoint", "performance", "assessment"],
            "checkpoint": {
                "id": "checkpoint-performance-optimization",
                "questions": [
                    {
                        "type": "scenario",
                        "scenario": "Your Kafka cluster shows 80% CPU usage on brokers but only 50K messages/sec throughput",
                        "question": "What's the most likely bottleneck?",
                        "options": [
                            "Network bandwidth",
                            "Disk I/O",
                            "Compression overhead",
                            "Insufficient partitions"
                        ],
                        "correctAnswer": "Compression overhead",
                        "explanation": "High CPU with low throughput often indicates expensive compression. Try lz4 or snappy instead of gzip."
                    },
                    {
                        "type": "multiple_choice",
                        "question": "Which producer setting has the biggest impact on throughput?",
                        "options": [
                            "buffer.memory",
                            "batch.size",
                            "max.in.flight.requests",
                            "request.timeout.ms"
                        ],
                        "correctAnswer": "batch.size",
                        "explanation": "Batch size directly affects how efficiently producers can send data"
                    }
                ],
                "passingScore": 0.7
            }
        }
    ],
    "EPISODE_04_03_TROUBLESHOOTING_V2": [
        {
            "id": "SEG_04_03_01_DIAGNOSTIC_APPROACH",
            "order": 1,
            "segmentType": "decision_framework",
            "title": "Systematic Troubleshooting Approach",
            "textContent": "When Kafka misbehaves, random debugging wastes precious time. We need a systematic approach: observe symptoms, form hypotheses, test methodically, and validate fixes. This framework will save you hours of frustration.",
            "estimatedDuration": "6 minutes",
            "pointsAwarded": 20,
            "keywords": ["troubleshooting", "methodology", "diagnostics"],
            "mediaRefs": {
                "audioId": "AUDIO_SEG04_03_01_APPROACH",
                "visualIds": ["VISUAL_TROUBLESHOOTING_FLOWCHART", "VISUAL_DIAGNOSTIC_TOOLS"]
            },
            "interactiveCue": {
                "cueType": "scenario_selection",
                "config": {
                    "title": "Diagnose the Issue",
                    "scenarios": [
                        {
                            "id": "high_latency",
                            "symptoms": "Producer latency spikes to 5 seconds, no errors",
                            "question": "Where do you start investigating?",
                            "options": [
                                {
                                    "approach": "Check broker disk I/O metrics",
                                    "optimal": True,
                                    "reasoning": "High latency without errors often indicates I/O bottlenecks"
                                },
                                {
                                    "approach": "Restart all producers",
                                    "optimal": False,
                                    "reasoning": "Treats symptom, not cause - issue will recur"
                                },
                                {
                                    "approach": "Increase producer timeout",
                                    "optimal": False,
                                    "reasoning": "Masks the problem without solving it"
                                }
                            ]
                        }
                    ]
                }
            }
        },
        {
            "id": "SEG_04_03_02_CONSUMER_LAG_ISSUES",
            "order": 2,
            "segmentType": "practical_example",
            "title": "Solving Consumer Lag Problems",
            "textContent": "Consumer lag is the #1 Kafka operational issue. But lag is a symptom with many causes: slow processing, rebalancing storms, or broker problems. Let's build a systematic approach to diagnose and fix lag issues.",
            "estimatedDuration": "8 minutes",
            "pointsAwarded": 30,
            "keywords": ["consumer lag", "troubleshooting", "performance"],
            "codeExample": {
                "language": "bash",
                "code": "#!/bin/bash\n# Consumer lag diagnostic script\n\nTOPIC=\"your-topic\"\nGROUP=\"your-consumer-group\"\nKAFKA_HOME=\"/opt/kafka\"\n\necho \"=== Consumer Lag Analysis ===\"\n\n# 1. Check current lag\necho \"Current lag by partition:\"\n$KAFKA_HOME/bin/kafka-consumer-groups.sh \\\n  --bootstrap-server localhost:9092 \\\n  --group $GROUP --describe\n\n# 2. Check consumer performance\necho -e \"\\nConsumer performance metrics:\"\n$KAFKA_HOME/bin/kafka-consumer-perf-test.sh \\\n  --bootstrap-server localhost:9092 \\\n  --topic $TOPIC \\\n  --messages 10000 \\\n  --threads 1\n\n# 3. Check partition distribution\necho -e \"\\nPartition assignment:\"\n$KAFKA_HOME/bin/kafka-consumer-groups.sh \\\n  --bootstrap-server localhost:9092 \\\n  --group $GROUP --describe --members\n\n# 4. Check for rebalancing\necho -e \"\\nRecent rebalances:\"\n$KAFKA_HOME/bin/kafka-consumer-groups.sh \\\n  --bootstrap-server localhost:9092 \\\n  --group $GROUP --describe --state",
                "filename": "diagnose-consumer-lag.sh"
            },
            "mediaRefs": {
                "audioId": "AUDIO_SEG04_03_02_LAG",
                "visualIds": ["VISUAL_LAG_PATTERNS", "VISUAL_LAG_SOLUTIONS"]
            },
            "interactiveCue": {
                "cueType": "drag_to_distribute",
                "config": {
                    "title": "Match Symptoms to Root Causes",
                    "instruction": "Drag each symptom to its most likely root cause",
                    "items": [
                        {"id": "1", "text": "Lag increases linearly over time"},
                        {"id": "2", "text": "Lag spikes then recovers repeatedly"},
                        {"id": "3", "text": "Lag only on specific partitions"},
                        {"id": "4", "text": "Lag across all partitions suddenly"}
                    ],
                    "categories": [
                        {
                            "id": "processing",
                            "label": "Slow Processing",
                            "correctItems": ["1"]
                        },
                        {
                            "id": "rebalancing",
                            "label": "Frequent Rebalancing",
                            "correctItems": ["2"]
                        },
                        {
                            "id": "skew",
                            "label": "Data Skew",
                            "correctItems": ["3"]
                        },
                        {
                            "id": "broker",
                            "label": "Broker Issues",
                            "correctItems": ["4"]
                        }
                    ]
                }
            }
        },
        {
            "id": "SEG_04_03_03_REPLICATION_ISSUES",
            "order": 3,
            "segmentType": "technical_introduction",
            "title": "Debugging Replication Problems",
            "textContent": "Replication issues threaten data durability. Under-replicated partitions, ISR shrinking, and follower lag can cascade into data loss. We'll master the tools and techniques to keep replication healthy.",
            "estimatedDuration": "7 minutes",
            "pointsAwarded": 25,
            "keywords": ["replication", "ISR", "debugging"],
            "mediaRefs": {
                "audioId": "AUDIO_SEG04_03_03_REPLICATION",
                "visualIds": ["VISUAL_REPLICATION_FLOW", "VISUAL_ISR_STATES"]
            },
            "interactiveCue": {
                "cueType": "interactive_explorer",
                "config": {
                    "title": "Explore Replication States",
                    "states": {
                        "healthy": {
                            "description": "All replicas in sync",
                            "metrics": {
                                "ISR": "3/3",
                                "Lag": "< 100 messages",
                                "Status": "✅ Healthy"
                            },
                            "actions": ["Normal operation"]
                        },
                        "degraded": {
                            "description": "Follower falling behind",
                            "metrics": {
                                "ISR": "2/3",
                                "Lag": "10K messages",
                                "Status": "⚠️ Degraded"
                            },
                            "actions": ["Check network", "Verify disk I/O", "Tune replica.lag.time.max.ms"]
                        },
                        "critical": {
                            "description": "Below min.insync.replicas",
                            "metrics": {
                                "ISR": "1/3",
                                "Lag": "100K+ messages",
                                "Status": "🔴 Critical"
                            },
                            "actions": ["Immediate investigation", "Check broker health", "Possible produce failures"]
                        }
                    }
                }
            }
        },
        {
            "id": "SEG_04_03_04_SHARE_GROUP_DEBUGGING",
            "order": 4,
            "segmentType": "new_feature_discovery",
            "title": "Debugging Share Group Issues",
            "textContent": "Share Groups introduce new failure modes. Stuck messages, redelivery storms, and coordinator failures require specific debugging techniques. Let's master troubleshooting these next-generation consumption patterns.",
            "estimatedDuration": "8 minutes",
            "pointsAwarded": 30,
            "keywords": ["share groups", "debugging", "kafka 4.0"],
            "codeExample": {
                "language": "java",
                "code": "// Share Group debugging utilities\npublic class ShareGroupDebugger {\n    \n    // Monitor message acknowledgment patterns\n    public void monitorAcknowledgments(String shareGroupId) {\n        Properties props = new Properties();\n        props.put(\"bootstrap.servers\", \"localhost:9092\");\n        props.put(\"group.type\", \"share\");\n        props.put(\"share.group.id\", shareGroupId);\n        \n        try (AdminClient admin = AdminClient.create(props)) {\n            // Get Share Group description\n            DescribeShareGroupsResult result = admin.describeShareGroups(\n                Collections.singletonList(shareGroupId));\n            \n            ShareGroupDescription desc = result.all().get().get(shareGroupId);\n            \n            System.out.println(\"Share Group State: \" + desc.state());\n            System.out.println(\"Members: \" + desc.members().size());\n            \n            // Check delivery states\n            desc.deliveryStates().forEach((topicPartition, state) -> {\n                System.out.printf(\"Partition %s: %d in-flight, %d pending\\n\",\n                    topicPartition, \n                    state.inFlightCount(),\n                    state.pendingCount());\n            });\n            \n            // Monitor redelivery metrics\n            Map<MetricName, Metric> metrics = admin.metrics();\n            metrics.entrySet().stream()\n                .filter(e -> e.getKey().name().contains(\"redelivery\"))\n                .forEach(e -> System.out.printf(\"%s: %.2f\\n\", \n                    e.getKey().name(), e.getValue().metricValue()));\n        }\n    }\n}",
                "filename": "ShareGroupDebugger.java"
            },
            "mediaRefs": {
                "audioId": "AUDIO_SEG04_03_04_SHAREGROUP",
                "visualIds": ["VISUAL_SHARE_GROUP_STATES", "VISUAL_DELIVERY_FLOW"]
            },
            "interactiveCue": {
                "cueType": "code_completion",
                "config": {
                    "title": "Complete the Debugging Code",
                    "template": "// Detect stuck messages in Share Group\nif (state.pendingCount() > 1000 && ___) {\n    log.warn(\"Potential stuck messages detected\");\n    // Take corrective action\n}",
                    "solution": "state.inFlightCount() == 0",
                    "hints": [
                        "Stuck messages have high pending count",
                        "But no messages are being processed",
                        "Check in-flight status"
                    ]
                }
            }
        },
        {
            "id": "SEG_04_03_05_TROUBLESHOOTING_TOOLS",
            "order": 5,
            "segmentType": "ui_walkthrough",
            "title": "Essential Troubleshooting Tools",
            "textContent": "The right tools make troubleshooting 10x faster. From built-in Kafka scripts to third-party utilities, we'll build your debugging toolkit. Never feel helpless when Kafka misbehaves again.",
            "estimatedDuration": "6 minutes",
            "pointsAwarded": 20,
            "keywords": ["tools", "debugging", "utilities"],
            "mediaRefs": {
                "audioId": "AUDIO_SEG04_03_05_TOOLS",
                "visualIds": ["VISUAL_TOOL_OVERVIEW", "VISUAL_TOOL_COMPARISON"]
            },
            "interactiveCue": {
                "cueType": "ui_simulation",
                "config": {
                    "simulation": "troubleshooting_toolkit",
                    "tools": {
                        "kafka-topics": {
                            "purpose": "Topic inspection and management",
                            "commonUses": ["List topics", "Describe partitions", "Check replication"]
                        },
                        "kafka-consumer-groups": {
                            "purpose": "Consumer group management",
                            "commonUses": ["Check lag", "Reset offsets", "List members"]
                        },
                        "kafka-log-dirs": {
                            "purpose": "Disk usage analysis",
                            "commonUses": ["Check partition sizes", "Verify disk balance"]
                        },
                        "kafka-dump-log": {
                            "purpose": "Low-level log inspection",
                            "commonUses": ["Verify messages", "Check corruption", "Debug issues"]
                        }
                    }
                }
            }
        }
    ],
    "EPISODE_04_04_MONITORING_CULTURE_V2": [
        {
            "id": "SEG_04_04_01_OBSERVABILITY_MINDSET",
            "order": 1,
            "segmentType": "paradigm_shift",
            "title": "From Monitoring to Observability",
            "textContent": "Monitoring tells you what happened. Observability tells you why. This shift in mindset transforms how teams operate. Instead of reacting to alerts, you'll understand system behavior and prevent issues before they occur.",
            "estimatedDuration": "6 minutes",
            "pointsAwarded": 20,
            "keywords": ["observability", "culture", "mindset"],
            "mediaRefs": {
                "audioId": "AUDIO_SEG04_04_01_MINDSET",
                "visualIds": ["VISUAL_MONITORING_VS_OBSERVABILITY", "VISUAL_CULTURE_SHIFT"]
            },
            "interactiveCue": {
                "cueType": "click_to_compare",
                "config": {
                    "title": "Monitoring vs Observability",
                    "comparisons": [
                        {
                            "label": "Traditional Monitoring",
                            "characteristics": {
                                "focus": "Known problems",
                                "approach": "Predefined metrics",
                                "questions": "Is it up? Is it fast?",
                                "team": "Ops responsibility",
                                "when": "After deployment"
                            }
                        },
                        {
                            "label": "Observability Culture",
                            "characteristics": {
                                "focus": "Unknown unknowns",
                                "approach": "Rich context and traces",
                                "questions": "Why did this happen?",
                                "team": "Everyone's responsibility",
                                "when": "Built into design"
                            }
                        }
                    ]
                }
            }
        },
        {
            "id": "SEG_04_04_02_MONITORING_STANDARDS",
            "order": 2,
            "segmentType": "practical_configuration",
            "title": "Implementing Monitoring Standards",
            "textContent": "Standards aren't bureaucracy - they're force multipliers. Consistent naming, labeling, and dashboard patterns mean anyone can understand any system. Let's build monitoring standards that scale with your organization.",
            "estimatedDuration": "7 minutes",
            "pointsAwarded": 25,
            "keywords": ["standards", "consistency", "best practices"],
            "codeExample": {
                "language": "yaml",
                "code": "# Monitoring Standards Document\n\n# Metric Naming Convention\nmetrics:\n  pattern: \"<service>.<component>.<measurement>.<unit>\"\n  examples:\n    - kafka.producer.messages.sent.rate\n    - kafka.consumer.lag.messages.count\n    - kafka.broker.disk.usage.percent\n\n# Label Standards\nlabels:\n  required:\n    - service: \"kafka\"\n    - environment: \"prod|staging|dev\"\n    - cluster: \"<cluster-name>\"\n    - team: \"<owning-team>\"\n  \n  optional:\n    - topic: \"<topic-name>\"\n    - partition: \"<partition-id>\"\n    - consumer_group: \"<group-id>\"\n\n# Alert Naming\nalerts:\n  pattern: \"<Severity>_<Service>_<Component>_<Condition>\"\n  examples:\n    - Critical_Kafka_Broker_Down\n    - Warning_Kafka_Consumer_HighLag\n    - Info_Kafka_Disk_Usage\n\n# Dashboard Standards\ndashboards:\n  structure:\n    - row1: \"Service Health Overview\"\n    - row2: \"Golden Signals (Rate, Errors, Duration)\"\n    - row3: \"Resource Utilization\"\n    - row4: \"Business Metrics\"\n  \n  panels:\n    - timeRange: \"Last 24 hours (default)\"\n    - refreshRate: \"30s\"\n    - annotations: \"Deployments, incidents\"\n\n# SLO Standards\nslos:\n  availability:\n    target: 99.9%\n    window: \"30 days\"\n  \n  latency:\n    p99: \"< 100ms\"\n    p95: \"< 50ms\"\n    \n  error_rate:\n    target: \"< 0.1%\"",
                "filename": "monitoring-standards.yaml"
            },
            "mediaRefs": {
                "audioId": "AUDIO_SEG04_04_02_STANDARDS",
                "visualIds": ["VISUAL_NAMING_STANDARDS", "VISUAL_LABEL_TAXONOMY"]
            },
            "interactiveCue": {
                "cueType": "field_mapping_exercise",
                "config": {
                    "title": "Apply Naming Standards",
                    "instruction": "Match raw metrics to standard names",
                    "leftSide": [
                        {"id": "1", "label": "producer_msg_sent"},
                        {"id": "2", "label": "ConsumerLagCount"},
                        {"id": "3", "label": "broker-cpu"},
                        {"id": "4", "label": "DISK_USAGE_PCT"}
                    ],
                    "rightSide": [
                        {"id": "a", "label": "kafka.producer.messages.sent.count"},
                        {"id": "b", "label": "kafka.consumer.lag.messages.count"},
                        {"id": "c", "label": "kafka.broker.cpu.usage.percent"},
                        {"id": "d", "label": "kafka.broker.disk.usage.percent"}
                    ],
                    "correctMappings": {
                        "1": "a",
                        "2": "b",
                        "3": "c",
                        "4": "d"
                    }
                }
            }
        },
        {
            "id": "SEG_04_04_03_EFFECTIVE_DASHBOARDS",
            "order": 3,
            "segmentType": "ui_walkthrough",
            "title": "Creating Dashboards That Tell Stories",
            "textContent": "Most dashboards are data dumps. Great dashboards tell stories: what's normal, what's wrong, and what to do about it. We'll design dashboards that reduce MTTR and empower your entire team.",
            "estimatedDuration": "8 minutes",
            "pointsAwarded": 30,
            "keywords": ["dashboards", "visualization", "UX"],
            "mediaRefs": {
                "audioId": "AUDIO_SEG04_04_03_DASHBOARDS",
                "visualIds": ["VISUAL_DASHBOARD_PATTERNS", "VISUAL_STORY_FLOW"]
            },
            "interactiveCue": {
                "cueType": "ui_simulation",
                "config": {
                    "simulation": "dashboard_builder",
                    "title": "Build an Effective Dashboard",
                    "template": {
                        "rows": [
                            {
                                "title": "Service Health",
                                "panels": ["Availability", "Error Rate", "Active Alerts"]
                            },
                            {
                                "title": "Performance",
                                "panels": ["Throughput", "Latency P99", "Consumer Lag"]
                            },
                            {
                                "title": "Resources",
                                "panels": ["CPU Usage", "Memory", "Disk I/O", "Network"]
                            },
                            {
                                "title": "Business Impact",
                                "panels": ["Messages Processed", "Processing Time", "Queue Depth"]
                            }
                        ]
                    },
                    "interactions": [
                        "Drag panels to reorder",
                        "Click to configure thresholds",
                        "Add annotations for context"
                    ]
                }
            }
        },
        {
            "id": "SEG_04_04_04_TEAM_EXPERTISE",
            "order": 4,
            "segmentType": "practical_example",
            "title": "Building Team Monitoring Expertise",
            "textContent": "Monitoring expertise can't live in one person's head. Through documentation, training, and practice, we'll build a team where everyone can confidently investigate issues and contribute to observability.",
            "estimatedDuration": "7 minutes",
            "pointsAwarded": 25,
            "keywords": ["team", "training", "expertise"],
            "mediaRefs": {
                "audioId": "AUDIO_SEG04_04_04_EXPERTISE",
                "visualIds": ["VISUAL_SKILL_MATRIX", "VISUAL_LEARNING_PATH"]
            },
            "interactiveCue": {
                "cueType": "scenario_selection",
                "config": {
                    "title": "Building Team Skills",
                    "scenarios": [
                        {
                            "id": "new_engineer",
                            "context": "A new engineer joins your team",
                            "question": "How do you onboard them to monitoring?",
                            "options": [
                                {
                                    "approach": "Structured learning path + mentoring",
                                    "optimal": True,
                                    "plan": [
                                        "Week 1: Dashboard tour and basic alerts",
                                        "Week 2: Hands-on troubleshooting exercises",
                                        "Week 3: Shadow on-call engineer",
                                        "Week 4: Handle simple issues with support"
                                    ]
                                },
                                {
                                    "approach": "Documentation only",
                                    "optimal": False,
                                    "reasoning": "Passive learning rarely builds real skills"
                                },
                                {
                                    "approach": "Immediate on-call rotation",
                                    "optimal": False,
                                    "reasoning": "Sink-or-swim approach causes stress and mistakes"
                                }
                            ]
                        }
                    ]
                }
            }
        },
        {
            "id": "SEG_04_04_05_CONTINUOUS_IMPROVEMENT",
            "order": 5,
            "segmentType": "pause_and_reflect",
            "title": "Continuous Monitoring Improvement",
            "textContent": "Great monitoring is never done. Through post-mortems, metric reviews, and team feedback, we continuously improve. This culture of improvement turns every incident into a learning opportunity.",
            "estimatedDuration": "5 minutes",
            "pointsAwarded": 20,
            "keywords": ["improvement", "post-mortem", "learning"],
            "mediaRefs": {
                "audioId": "AUDIO_SEG04_04_05_IMPROVEMENT",
                "visualIds": ["VISUAL_IMPROVEMENT_CYCLE", "VISUAL_POSTMORTEM_TEMPLATE"]
            },
            "interactiveCue": {
                "cueType": "pause_and_reflect",
                "config": {
                    "duration": 60,
                    "prompts": [
                        "What monitoring gaps has your team discovered recently?",
                        "How could better observability have prevented your last incident?",
                        "What one monitoring improvement would have the biggest impact?"
                    ],
                    "followUp": "Document your reflections and share with your team"
                }
            }
        },
        {
            "id": "SEG_04_04_06_COURSE_COMPLETION",
            "order": 6,
            "segmentType": "course_opening",
            "title": "Congratulations! Course Complete",
            "textContent": "You've mastered Kafka monitoring from fundamentals to advanced practices. You understand Share Groups, can build comprehensive monitoring systems, and know how to foster a culture of observability. You're now equipped to run Kafka at any scale with confidence.",
            "estimatedDuration": "3 minutes",
            "pointsAwarded": 50,
            "keywords": ["completion", "congratulations", "summary"],
            "mediaRefs": {
                "audioId": "AUDIO_SEG04_04_06_COMPLETE",
                "visualIds": ["VISUAL_COURSE_SUMMARY", "VISUAL_CERTIFICATE"]
            },
            "interactiveCue": {
                "cueType": "important_note",
                "config": {
                    "emphasis": "celebration",
                    "icon": "trophy",
                    "title": "You're Now a Kafka Monitoring Expert!",
                    "achievements": [
                        "Mastered Kafka fundamentals and architecture",
                        "Learned the revolutionary Share Groups feature",
                        "Built comprehensive monitoring strategies",
                        "Created production-ready dashboards",
                        "Developed troubleshooting expertise",
                        "Fostered monitoring culture"
                    ],
                    "nextSteps": [
                        "Apply these concepts to your Kafka clusters",
                        "Share knowledge with your team",
                        "Contribute to the Kafka community",
                        "Keep learning as Kafka evolves"
                    ]
                }
            }
        }
    ]
}

# Load the current course file
course_file = Path("learning_content/kafka_course_complete_v2.json")
with open(course_file, 'r') as f:
    course_data = json.load(f)

# Find Lesson 4 and update its episodes
for lesson in course_data["lessons"]:
    if lesson["id"] == "LESSON_04_ADVANCED_MONITORING_V2":
        # Update each episode with its segments
        for episode in lesson["episodes"]:
            episode_id = episode["id"]
            if episode_id in episode_segments:
                episode["segments"] = episode_segments[episode_id]
                print(f"Added {len(episode_segments[episode_id])} segments to {episode_id}")

# Save the updated course
output_file = Path("learning_content/kafka_course_complete_final.json")
with open(output_file, 'w') as f:
    json.dump(course_data, f, indent=2)

print(f"\nCourse completed and saved to {output_file}")
print("\nSummary:")
print(f"- Total episodes with segments: {len(episode_segments)}")
print(f"- Total new segments added: {sum(len(segs) for segs in episode_segments.values())}")