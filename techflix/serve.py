#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 8080
DIRECTORY = "dist"

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_GET(self):
        if self.path == '/' or not os.path.exists(os.path.join(DIRECTORY, self.path.lstrip('/'))):
            self.path = '/index.html'
        return super().do_GET()

# Skip build if dist folder exists
if not os.path.exists(DIRECTORY):
    print(f"Building the application first...")
    os.system("npm run build")
else:
    print(f"Using existing build in {DIRECTORY} folder...")

print(f"\nStarting server on all interfaces...")
print(f"Access the app at:")
print(f"  - http://localhost:{PORT}")
print(f"  - http://172.31.46.60:{PORT}")
print(f"  - http://0.0.0.0:{PORT}")

with socketserver.TCPServer(("0.0.0.0", PORT), MyHTTPRequestHandler) as httpd:
    httpd.serve_forever()