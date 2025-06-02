#!/usr/bin/env python3
"""
Master script to generate all voiceovers using multiple TTS providers
Supports ElevenLabs and Google Gemini
"""

import os
import sys
import subprocess
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def check_dependencies():
    """Check if required packages are installed"""
    packages = {
        "requests": "requests",
        "google-genai": "google-genai",
        "python-dotenv": "python-dotenv"
    }
    
    missing = []
    for package, pip_name in packages.items():
        try:
            __import__(package.replace("-", "_"))
        except ImportError:
            missing.append(pip_name)
    
    if missing:
        print("❌ Missing dependencies:")
        print(f"   Run: pip install {' '.join(missing)}")
        return False
    return True

def run_elevenlabs():
    """Run ElevenLabs generation"""
    print("\n🎙️ Running ElevenLabs Generation")
    print("-" * 50)
    
    # Check for API key
    api_key = os.environ.get("ELEVEN_LABS_API_KEY") or os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        print("❌ ElevenLabs API key not found!")
        print("   Add ELEVEN_LABS_API_KEY to your .env file")
        return False
    
    # Run the script
    script_path = Path(__file__).parent / "generate-all-voiceovers-elevenlabs.py"
    env = os.environ.copy()
    env["ELEVEN_LABS_API_KEY"] = api_key
    
    try:
        result = subprocess.run([sys.executable, str(script_path)], env=env)
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Error running ElevenLabs script: {e}")
        return False

def run_gemini():
    """Run Google Gemini generation"""
    print("\n🎙️ Running Google Gemini Generation")
    print("-" * 50)
    
    # Check for API key
    api_key = os.environ.get("GEM_KEY") or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("❌ Gemini API key not found!")
        print("   Add GEM_KEY to your .env file")
        return False
    
    # Run the script
    script_path = Path(__file__).parent / "generate-all-voiceovers-gemini.py"
    env = os.environ.copy()
    env["GEM_KEY"] = api_key
    
    try:
        result = subprocess.run([sys.executable, str(script_path)], env=env)
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Error running Gemini script: {e}")
        return False

def create_env_template():
    """Create a template .env file if it doesn't exist"""
    env_path = Path(".env")
    if not env_path.exists():
        template = """# TechFlix Audio Generation API Keys

# ElevenLabs API Key
# Get yours at: https://elevenlabs.io/
ELEVEN_LABS_API_KEY=your_elevenlabs_key_here

# Google Gemini API Key
# Get yours at: https://makersuite.google.com/app/apikey
GEM_KEY=your_gemini_key_here

# Optional: Azure Speech Services
AZURE_SPEECH_KEY=your_azure_key_here
AZURE_SPEECH_REGION=your_azure_region
"""
        with open(env_path, 'w') as f:
            f.write(template)
        print("📝 Created .env template file")
        print("   Please add your API keys to .env")
        return True
    return False

def main():
    print("🎬 TechFlix Voiceover Generation Master Script")
    print("=" * 60)
    
    # Check dependencies
    if not check_dependencies():
        return
    
    # Create .env template if needed
    if create_env_template():
        print("\n⚠️  Please add your API keys to the .env file and run again")
        return
    
    # Load environment variables
    load_dotenv()
    
    # Show available providers
    providers = []
    if os.environ.get("ELEVEN_LABS_API_KEY") or os.environ.get("ELEVENLABS_API_KEY"):
        providers.append("ElevenLabs")
    if os.environ.get("GEM_KEY") or os.environ.get("GEMINI_API_KEY"):
        providers.append("Google Gemini")
    
    if not providers:
        print("\n❌ No API keys found in .env file!")
        print("   Please add at least one of:")
        print("   - ELEVEN_LABS_API_KEY")
        print("   - GEM_KEY")
        return
    
    print(f"\n✅ Available providers: {', '.join(providers)}")
    
    # Ask which to run
    if len(providers) > 1:
        print("\nWhich provider would you like to use?")
        print("1. ElevenLabs only")
        print("2. Google Gemini only")
        print("3. Both providers")
        
        choice = input("\nEnter choice (1-3): ").strip()
        
        if choice == "1" and "ElevenLabs" in providers:
            run_elevenlabs()
        elif choice == "2" and "Google Gemini" in providers:
            run_gemini()
        elif choice == "3":
            if "ElevenLabs" in providers:
                run_elevenlabs()
            if "Google Gemini" in providers:
                run_gemini()
        else:
            print("Invalid choice")
    else:
        # Run the available provider
        if "ElevenLabs" in providers:
            run_elevenlabs()
        elif "Google Gemini" in providers:
            run_gemini()
    
    print("\n✅ All done!")
    print("\n📁 Generated files are in:")
    print("   - public/audio/voiceovers/s2e1-elevenlabs/")
    print("   - public/audio/voiceovers/s2e1-gemini/")
    print("\n🎧 Test them at: http://localhost:3000/audio-comparison")

if __name__ == "__main__":
    main()