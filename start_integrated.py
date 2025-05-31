#!/usr/bin/env python3
"""
Simple startup script for the integrated Flask app
"""
import subprocess
import sys
import os

# Set the working directory
os.chdir('/Users/deepaksharma/Desktop/src/qslab')

# Run the integrated app
try:
    print("Starting integrated Neural Learn server...")
    print("Server will run on http://localhost:5000")
    print("Open http://localhost:8000 in your browser to use the app")
    print("\nPress Ctrl+C to stop the server")
    
    subprocess.run([sys.executable, 'app_integrated.py'])
except KeyboardInterrupt:
    print("\nServer stopped.")