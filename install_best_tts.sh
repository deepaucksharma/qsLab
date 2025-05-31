#!/bin/bash
"""
Install the best open-source TTS stack for high-quality audio generation
"""

echo "============================================================"
echo "INSTALLING BEST OPEN-SOURCE TTS STACK"
echo "============================================================"

# Check Python version
python_version=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "Python version: $python_version"

# Create virtual environment if it doesn't exist
if [ ! -d "venv_tts" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv_tts
fi

# Activate virtual environment
source venv_tts/bin/activate

echo ""
echo "Step 1: Installing PyTorch with CUDA support (if available)..."
# Install PyTorch - use CPU version for Mac
if [[ "$OSTYPE" == "darwin"* ]]; then
    pip install torch==2.1.0 torchaudio==2.1.0
else
    pip install torch==2.1.0 torchaudio==2.1.0 --index-url https://download.pytorch.org/whl/cu118
fi

echo ""
echo "Step 2: Installing Coqui TTS with all models..."
pip install TTS==0.22.0

echo ""
echo "Step 3: Installing additional high-quality TTS libraries..."
# StyleTTS 2 dependencies
pip install phonemizer>=3.2.1
pip install pypinyin
pip install jieba
pip install protobuf

# Audio processing
pip install librosa>=0.10.0
pip install soundfile>=0.12.1
pip install scipy>=1.11.0
pip install numpy>=1.24.0

# Faster inference
pip install onnxruntime

echo ""
echo "Step 4: Downloading best TTS models..."
python3 << EOF
from TTS.utils.manage import ModelManager
from TTS.utils.download import download_url
import os

print("Downloading models (this may take a while)...")

# Create models directory
os.makedirs("tts_models", exist_ok=True)

# Download model list
model_manager = ModelManager()

# Best models to download
models_to_download = [
    # XTTS v2 - Best overall quality with voice cloning
    "tts_models/multilingual/multi-dataset/xtts_v2",
    
    # VITS - Fast and high quality
    "tts_models/en/vctk/vits",
    "tts_models/en/ljspeech/vits",
    
    # YourTTS - Multi-speaker with voice cloning
    "tts_models/multilingual/multi-dataset/your_tts",
    
    # Tacotron2 - Classic high quality
    "tts_models/en/ljspeech/tacotron2-DDC",
    
    # FastPitch - Very fast, good quality
    "tts_models/en/ljspeech/fast_pitch"
]

for model_name in models_to_download:
    try:
        print(f"\nDownloading {model_name}...")
        model_manager.download_model(model_name)
        print(f"✓ {model_name} downloaded successfully")
    except Exception as e:
        print(f"✗ Failed to download {model_name}: {e}")

print("\nModel download complete!")
EOF

echo ""
echo "Step 5: Installing voice enhancement tools..."
pip install noisereduce
pip install pedalboard  # For audio effects
pip install pydub       # For format conversion

echo ""
echo "============================================================"
echo "INSTALLATION COMPLETE!"
echo "============================================================"
echo ""
echo "Available models:"
echo "1. XTTS v2 - Best quality, supports voice cloning"
echo "2. VITS - Fast and natural sounding"
echo "3. YourTTS - Multi-speaker with voice adaptation"
echo "4. Tacotron2-DDC - Clear and consistent"
echo "5. FastPitch - Very fast generation"
echo ""
echo "To activate the environment:"
echo "source venv_tts/bin/activate"
echo ""
echo "To generate audio:"
echo "python generate_premium_audio.py"