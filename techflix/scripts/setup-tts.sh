#!/bin/bash

echo "🎙️ Setting up Microsoft Edge TTS for voice-over generation..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3 first."
    exit 1
fi

# Install edge-tts
echo "📦 Installing edge-tts..."
pip3 install edge-tts

# Verify installation
if command -v edge-tts &> /dev/null; then
    echo "✅ edge-tts installed successfully!"
    echo ""
    echo "📋 Available voices:"
    edge-tts --list-voices | grep en-US | head -10
    echo ""
    echo "✨ Setup complete! You can now generate voice-overs with:"
    echo "   npm run generate:voiceovers"
else
    echo "❌ Failed to install edge-tts"
    exit 1
fi