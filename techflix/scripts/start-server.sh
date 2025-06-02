#!/bin/bash

echo "Starting TechFlix server for WSL..."
echo ""
echo "Building the project first..."
npm run build

echo ""
echo "Starting server..."
echo ""
echo "Access TechFlix from Windows at:"
echo "  http://localhost:8081"
echo "  http://$(hostname -I | awk '{print $1}'):8081"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd dist && python3 -m http.server 8081 --bind 0.0.0.0