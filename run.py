# run.py - Easy launcher for Neural Learn app

import os
import sys
import subprocess
import webbrowser
import time
import platform

def check_requirements():
    """Check if all required packages are installed"""
    required_packages = ['flask', 'flask-cors', 'TTS']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"Missing packages: {', '.join(missing_packages)}")
        print("Installing missing packages...")
        
        # Install missing packages
        subprocess.check_call([sys.executable, "-m", "pip", "install"] + missing_packages)
        
        # Also install torch if TTS was missing (as it's a dependency)
        if 'TTS' in missing_packages:
            print("Installing PyTorch...")
            if platform.system() == "Windows":
                subprocess.check_call([sys.executable, "-m", "pip", "install", "torch", "torchvision", "torchaudio"])
            else:
                subprocess.check_call([sys.executable, "-m", "pip", "install", "torch", "torchvision", "torchaudio"])

def start_backend():
    """Start the Flask backend server"""
    print("Starting Neural Learn backend...")
    
    # Check if app.py exists
    if not os.path.exists('app.py'):
        print("Error: app.py not found in current directory!")
        print("Please ensure you're running this script from the project directory.")
        return None
    
    # Start Flask app
    if platform.system() == "Windows":
        process = subprocess.Popen([sys.executable, "app.py"], 
                                 creationflags=subprocess.CREATE_NEW_CONSOLE)
    else:
        process = subprocess.Popen([sys.executable, "app.py"])
    
    return process

def open_frontend():
    """Open the frontend in default browser"""
    print("Opening Neural Learn in browser...")
    
    # Check if index.html exists
    if not os.path.exists('index.html'):
        print("Error: index.html not found in current directory!")
        return
    
    # Get absolute path to index.html
    file_path = os.path.abspath('index.html')
    file_url = f'file:///{file_path}'
    
    # Wait a moment for the backend to start
    time.sleep(3)
    
    # Open in browser
    webbrowser.open(file_url)

def create_directories():
    """Create required directories"""
    directories = ['audio_outputs', 'learning_content']
    for directory in directories:
        os.makedirs(directory, exist_ok=True)

def print_banner():
    """Print welcome banner"""
    try:
        print("""
    ╔═══════════════════════════════════════════╗
    ║                                           ║
    ║      🧠 Neural Learn - AI Learning App    ║
    ║                                           ║
    ║   Text-to-Speech Powered Learning System  ║
    ║                                           ║
    ╚═══════════════════════════════════════════╝
    """)
    except UnicodeEncodeError:
        # Fallback for systems that don't support Unicode
        print("""
    =============================================
                                               
         Neural Learn - AI Learning App        
                                               
      Text-to-Speech Powered Learning System   
                                               
    =============================================
    """)

def main():
    """Main function to run the application"""
    print_banner()
    
    print("Checking requirements...")
    check_requirements()
    
    print("\nCreating directories...")
    create_directories()
    
    print("\nStarting application...")
    backend_process = start_backend()
    
    if backend_process:
        print("\n[OK] Backend started successfully!")
        print("   URL: http://localhost:5000")
        
        # Open frontend
        open_frontend()
        
        print("\n[OK] Application is running!")
        print("\nPress Ctrl+C to stop the application")
        
        try:
            # Keep the script running
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n\nShutting down...")
            backend_process.terminate()
            print("[OK] Application stopped")
    else:
        print("\n[ERROR] Failed to start backend")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n[ERROR] Error: {e}")
        input("\nPress Enter to exit...")
