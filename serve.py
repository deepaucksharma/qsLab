#!/usr/bin/env python3
"""Serve frontend files via HTTP to avoid CORS issues"""

import http.server
import socketserver
import os
import threading
import time

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add headers to allow CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def serve_frontend():
    """Start the frontend server"""
    handler = MyHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Frontend server running at http://localhost:{PORT}")
        print(f"Open http://localhost:{PORT} in your browser")
        httpd.serve_forever()

if __name__ == "__main__":
    print("Starting Neural Learn Frontend Server...")
    print("="*50)
    print(f"Frontend URL: http://localhost:{PORT}")
    print("Make sure backend is running on http://localhost:5000")
    print("="*50)
    
    serve_frontend()