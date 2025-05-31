# Neural Learn - AI-Powered Learning App

An innovative learning application that uses XTTS v2 text-to-speech to create an immersive audio learning experience with a cutting-edge glassmorphism UI.

## Features

- 🎨 **Modern glassmorphism design** with animated gradients
- 🧠 **4 Learning Paths**: Vocabulary, Language Learning, Concepts, Pronunciation
- 🌍 **16 language support** for audio generation
- 📈 **Progress tracking** with streak counter
- 🎵 **Real-time audio visualizer**
- 💾 **Local progress storage**

## Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd Q&S

# Run the application (installs dependencies automatically)
python run.py
```

The app will:
- Install missing dependencies
- Download XTTS v2 model (~1.8GB) on first run
- Open your browser automatically

## Manual Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Run backend
python app.py

# Open index.html in browser
```

## Project Structure

- `app.py` - Flask backend with XTTS v2
- `index.html` - Main HTML file
- `styles.css` - All CSS styles
- `script.js` - JavaScript functionality
- `run.py` - Easy launcher script

## License

Uses Coqui TTS library. See their license for terms.
