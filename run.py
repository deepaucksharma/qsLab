"""
Launch script for Neural Learn v2 Course Platform
Handles environment setup and starts the enhanced application
"""

import os
import sys
import subprocess
import time
import webbrowser
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    print(f"Python version: {version.major}.{version.minor}.{version.micro}")
    
    if version.major != 3 or version.minor < 8:
        print("⚠️  Warning: This application requires Python 3.8 or higher")
        return False
    
    return True

def check_dependencies():
    """Check and install missing dependencies"""
    required_packages = [
        'flask',
        'flask-cors',
        'flask-sqlalchemy',
        'sqlalchemy',
        'numpy',  # For adaptive learning
        'requests'  # For API calls
    ]
    
    missing_required = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_required.append(package)
    
    if missing_required:
        print("\n📦 Installing required packages...")
        for package in missing_required:
            print(f"   Installing {package}...")
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
    
    return True

def create_directories():
    """Create required directories if they don't exist"""
    directories = [
        'audio_outputs',
        'visual_assets',
        'learning_content'
    ]
    
    for directory in directories:
        path = Path(directory)
        if not path.exists():
            path.mkdir(parents=True)
            print(f"✅ Created directory: {directory}")

def check_database():
    """Check if database exists and is initialized"""
    db_path = Path('neural_learn_v2.db')
    
    if not db_path.exists():
        print("\n🗄️  Database not found. Running migration to create and populate...")
        try:
            subprocess.check_call([sys.executable, 'migrate_to_v2.py'])
            print("✅ Database created and populated successfully!")
        except subprocess.CalledProcessError:
            print("❌ Failed to initialize database")
            return False
    else:
        print("✅ Database found: neural_learn_v2.db")
    
    return True

def start_backend():
    """Start the Flask backend server"""
    print("\n🚀 Starting Neural Learn v2 backend server...")
    print("   URL: http://localhost:5000")
    
    # Set environment variables
    env = os.environ.copy()
    env['FLASK_APP'] = 'app.py'
    env['FLASK_ENV'] = 'development'
    
    # Start Flask in a subprocess
    backend_process = subprocess.Popen(
        [sys.executable, 'app.py'],
        env=env
    )
    
    return backend_process

def start_frontend():
    """Start a simple HTTP server for the frontend"""
    print("\n🌐 Starting frontend server...")
    print("   URL: http://localhost:8000")
    
    # Python 3 built-in HTTP server
    frontend_process = subprocess.Popen(
        [sys.executable, '-m', 'http.server', '8000'],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    
    return frontend_process

def open_browser():
    """Open the application in the default browser"""
    time.sleep(2)  # Wait for servers to start
    url = 'http://localhost:8000/index.html'
    print(f"\n🌟 Opening Neural Learn v2 in browser: {url}")
    webbrowser.open(url)

def main():
    """Main launch sequence"""
    print("=" * 60)
    print("🧠 Neural Learn v2 - Course Platform Launcher")
    print("=" * 60)
    
    try:
        # Check environment
        if not check_python_version():
            return
        
        if not check_dependencies():
            return
        
        # Setup
        create_directories()
        
        if not check_database():
            return
        
        # Start servers
        backend_process = start_backend()
        frontend_process = start_frontend()
        
        # Open browser
        open_browser()
        
        print("\n✨ Neural Learn v2 is running!")
        print("\nAccess the application at:")
        print("   Frontend: http://localhost:8000/index.html")
        print("   Backend API: http://localhost:5000/api/courses")
        print("\nPress Ctrl+C to stop all servers\n")
        
        # Keep running
        try:
            backend_process.wait()
        except KeyboardInterrupt:
            print("\n\n🛑 Shutting down servers...")
            backend_process.terminate()
            frontend_process.terminate()
            print("✅ Servers stopped. Goodbye!")
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()