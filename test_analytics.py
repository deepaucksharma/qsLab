#!/usr/bin/env python3
"""
Test script for Analytics implementation
Track 3: Learning Analytics & Insights
"""

import requests
import json
import time
from datetime import datetime

# Base URL for the API
BASE_URL = "http://localhost:5003"  # Track 3 port

def test_analytics_endpoints():
    """Test all analytics API endpoints"""
    
    print("Testing Analytics API Endpoints")
    print("=" * 50)
    
    # Test 1: Send analytics events
    print("\n1. Testing event tracking...")
    events = [
        {
            "id": f"test_event_{int(time.time())}",
            "userId": "test_user_123",
            "eventType": "segment_view",
            "timestamp": int(time.time() * 1000),
            "data": {
                "segmentId": "seg_001",
                "duration": 45
            },
            "context": {
                "url": "/course/intro/lesson1",
                "device": {"type": "desktop"}
            }
        },
        {
            "id": f"test_event_{int(time.time())}_2",
            "userId": "test_user_123",
            "eventType": "interaction_complete",
            "timestamp": int(time.time() * 1000),
            "data": {
                "segmentId": "seg_001",
                "interactionType": "quiz",
                "score": 80
            },
            "context": {
                "url": "/course/intro/lesson1",
                "device": {"type": "desktop"}
            }
        }
    ]
    
    response = requests.post(
        f"{BASE_URL}/api/analytics/events",
        json={"events": events, "sessionId": "test_session_123"}
    )
    
    if response.status_code == 200:
        print("✓ Events tracked successfully:", response.json())
    else:
        print("✗ Failed to track events:", response.status_code, response.text)
    
    # Test 2: Get analytics insights
    print("\n2. Testing analytics insights...")
    response = requests.get(f"{BASE_URL}/api/analytics/insights?range=week")
    
    if response.status_code == 200:
        insights = response.json()
        print("✓ Insights retrieved successfully:")
        print(f"  - Engagement Score: {insights.get('data', {}).get('engagement', {}).get('score', 0)}")
        print(f"  - Event Count: {insights.get('eventCount', 0)}")
    else:
        print("✗ Failed to get insights:", response.status_code, response.text)
    
    # Test 3: Get specific metrics
    print("\n3. Testing specific metrics...")
    metrics = ['engagement', 'performance', 'retention', 'progress']
    
    for metric in metrics:
        response = requests.get(f"{BASE_URL}/api/analytics/metrics/{metric}?userId=test_user_123")
        
        if response.status_code == 200:
            print(f"✓ {metric.capitalize()} metric retrieved:", response.json().get('data'))
        else:
            print(f"✗ Failed to get {metric} metric:", response.status_code)
    
    # Test 4: Get recommendations
    print("\n4. Testing recommendations...")
    response = requests.get(f"{BASE_URL}/api/analytics/recommendations?userId=test_user_123")
    
    if response.status_code == 200:
        recommendations = response.json().get('recommendations', [])
        print(f"✓ Retrieved {len(recommendations)} recommendations")
        for rec in recommendations[:3]:
            print(f"  - {rec.get('type')}: {rec.get('title')} (confidence: {rec.get('confidence')})")
    else:
        print("✗ Failed to get recommendations:", response.status_code)
    
    print("\n" + "=" * 50)
    print("Analytics API testing complete!")

def test_frontend_integration():
    """Test frontend analytics integration"""
    print("\n\nTesting Frontend Integration")
    print("=" * 50)
    
    print("\nTo test frontend integration:")
    print("1. Open the application in your browser")
    print("2. Click the 'Analytics' button in the header")
    print("3. Navigate through a few segments")
    print("4. Complete some interactions")
    print("5. Check the analytics dashboard for updates")
    print("\nThe dashboard should show:")
    print("- Real-time engagement score")
    print("- Learning velocity metrics")
    print("- Activity timeline")
    print("- Retention metrics")

if __name__ == "__main__":
    print("Analytics Implementation Test")
    print("============================")
    print(f"Testing against: {BASE_URL}")
    print(f"Time: {datetime.now()}")
    
    try:
        # Check if server is running
        response = requests.get(f"{BASE_URL}/api/health", timeout=2)
        if response.status_code == 200:
            print("✓ Server is running")
            test_analytics_endpoints()
            test_frontend_integration()
        else:
            print("✗ Server returned unexpected status:", response.status_code)
    except requests.exceptions.ConnectionError:
        print("✗ Could not connect to server")
        print("Please ensure the app is running with:")
        print("  python app.py --port=5003")
    except Exception as e:
        print(f"✗ Error: {e}")