#!/usr/bin/env python3
"""Start both backend and frontend servers for Neural Learn"""

import subprocess
import time
import webbrowser
import os
import sys

def check_port(port):
    """Check if a port is in use"""
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def kill_port(port):
    """Kill process on a specific port"""
    try:
        subprocess.run(f"lsof -ti:{port} | xargs kill -9", shell=True, stderr=subprocess.DEVNULL)
    except:
        pass

def main():
    print("""
    ╔═══════════════════════════════════════════╗
    ║      🧠 Neural Learn - AI Learning App    ║
    ║   Starting Backend and Frontend Servers   ║
    ╚═══════════════════════════════════════════╝
    """)
    
    # Kill any existing processes
    print("Cleaning up old processes...")
    kill_port(5000)
    kill_port(8000)
    time.sleep(1)
    
    # Start backend
    print("\n1. Starting backend server on port 5000...")
    backend = subprocess.Popen([sys.executable, "app_compatible.py"])
    time.sleep(3)
    
    if not check_port(5000):
        print("❌ Backend failed to start!")
        return
    print("✅ Backend running at http://localhost:5000")
    
    # Start frontend
    print("\n2. Starting frontend server on port 8000...")
    frontend = subprocess.Popen([sys.executable, "serve.py"])
    time.sleep(2)
    
    if not check_port(8000):
        print("❌ Frontend server failed to start!")
        backend.terminate()
        return
    print("✅ Frontend running at http://localhost:8000")
    
    # Open browser
    print("\n3. Opening browser...")
    time.sleep(1)
    webbrowser.open("http://localhost:8000")
    
    print("\n" + "="*50)
    print("✅ Neural Learn is now running!")
    print("="*50)
    print("\nAccess the app at: http://localhost:8000")
    print("\nPress Ctrl+C to stop both servers")
    print("="*50)
    
    try:
        # Keep running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\nShutting down...")
        backend.terminate()
        frontend.terminate()
        print("✅ Servers stopped")

if __name__ == "__main__":
    main()