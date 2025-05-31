# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Neural Learn is an AI-powered learning application that uses XTTS v2 text-to-speech to create immersive audio learning experiences. It features a modern glassmorphism UI design and supports multiple learning paths including vocabulary building, language learning, concept mastery, and pronunciation practice.

## Common Commands

### Running the Application

```bash
# Recommended: Start both servers (Python 3.12+)
python start.py

# Or manually:
python app_compatible.py      # Terminal 1: Backend (port 5000)
python serve.py              # Terminal 2: Frontend (port 8000)
# Then open http://localhost:8000 in browser

# For Python 3.9-3.11 (with full TTS audio)
python run.py
```

### Development Server Options

```bash
# Python 3.12 compatible (TTS optional)
python app_compatible.py

# Full application with TTS (requires Python 3.9-3.11)
python app.py

# Testing without TTS (faster startup)
python app_simple.py

# Basic Flask test
python test_flask.py
```

### Python Compatibility

- **Python 3.12+**: Use `app_compatible.py` (runs without TTS audio)
- **Python 3.9-3.11**: Full TTS support available with `app.py`
- TTS package (Coqui TTS) currently requires Python 3.9-3.11

## Architecture

### Backend Structure

- **app.py**: Main Flask backend with XTTS v2 integration
  - Implements audio generation queue with background worker thread
  - Provides REST API endpoints for content generation and audio synthesis
  - Supports 16 languages for TTS
  - Uses PyTorch with CUDA support when available

- **app_simple.py**: Lightweight version without TTS for UI testing
  - Mock audio generation responses
  - Same API structure as main app

- **run.py**: Smart launcher script
  - Auto-installs missing dependencies
  - Creates required directories (audio_outputs/, learning_content/)
  - Launches backend and opens frontend automatically

### Key API Endpoints

- `/api/generate-audio` - Queues text for TTS conversion
- `/api/audio-status/<task_id>` - Check audio generation progress  
- `/api/generate-content` - Create learning content from templates
- `/api/generate-lesson` - Generate complete multi-segment lessons
- `/api/learning-paths` - Get available learning paths
- `/api/supported-languages` - List supported TTS languages

### Frontend Components

- **index.html**: Main UI entry point
- **styles.css**: Glassmorphism design system
- **script.js**: Frontend logic and API integration

## Dependencies

- Flask 3.0.0 with Flask-CORS for API
- TTS 0.22.0 (Coqui TTS) for text-to-speech
- PyTorch 2.0+ with torchaudio for model inference
- XTTS v2 model (~1.8GB, downloads on first run)