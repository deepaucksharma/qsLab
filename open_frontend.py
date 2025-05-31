#!/usr/bin/env python3
"""Open the Neural Learn frontend in browser"""

import webbrowser
import os
import time

# Get absolute path to index.html
file_path = os.path.abspath('index.html')

print("Opening Neural Learn in your browser...")
print(f"File: {file_path}")

# Open in browser
webbrowser.open(f'file:///{file_path}')

print("\nFrontend opened!")
print("Make sure the backend is running on http://localhost:5000")