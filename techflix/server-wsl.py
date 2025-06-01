#!/usr/bin/env python3
import http.server
import socketserver
import os
import subprocess
import socket

PORT = 8081
DIRECTORY = "dist"

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

Handler = CORSRequestHandler

# Get WSL IP
try:
    wsl_ip = subprocess.check_output(['hostname', '-I']).decode().strip().split()[0]
except:
    wsl_ip = "WSL IP not found"

# Get Windows host IP (usually the default gateway in WSL2)
try:
    windows_ip = subprocess.check_output(['ip', 'route', 'show']).decode()
    windows_ip = windows_ip.split('default via ')[1].split()[0]
except:
    windows_ip = "Windows IP not found"

print("\n🚀 TechFlix Server Starting...\n")
print(f"Server will run on port {PORT}")
print(f"Serving directory: {os.path.abspath(DIRECTORY)}\n")
print("=" * 50)
print("Access TechFlix from Windows browser at:")
print(f"  http://localhost:{PORT}")
print(f"  http://127.0.0.1:{PORT}")
print(f"  http://{wsl_ip}:{PORT}")
print("\nIf localhost doesn't work in Windows:")
print("1. Try the WSL IP address directly")
print("2. Check Windows Firewall settings")
print("3. Run this PowerShell command as Admin:")
print(f"   netsh interface portproxy add v4tov4 listenport={PORT} listenaddress=0.0.0.0 connectport={PORT} connectaddress={wsl_ip}")
print("=" * 50)
print("\nPress Ctrl+C to stop the server\n")

with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
    httpd.serve_forever()