#!/usr/bin/env node

/**
 * Mock TTS API for testing different providers
 * This demonstrates how a real backend API would handle multiple TTS providers
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const app = express();
const upload = multer();

// Enable CORS for development
app.use(cors());
app.use(express.json());

// Output directory for generated audio
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'audio', 'tts-test');

// Ensure output directory exists
fs.mkdir(OUTPUT_DIR, { recursive: true }).catch(console.error);

// TTS Provider implementations
const ttsProviders = {
  // Microsoft Edge TTS
  'edge-tts': async (text, voice, options = {}) => {
    const outputFile = path.join(OUTPUT_DIR, `edge-${Date.now()}.mp3`);
    const rate = options.rate || '+0%';
    const pitch = options.pitch || '+0Hz';
    
    const command = `edge-tts --voice "${voice}" --rate="${rate}" --pitch="${pitch}" --text "${text}" --write-media "${outputFile}"`;
    
    try {
      await execAsync(command);
      return { success: true, file: outputFile };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Google TTS
  'gtts': async (text, voice, options = {}) => {
    const outputFile = path.join(OUTPUT_DIR, `gtts-${Date.now()}.mp3`);
    const slow = options.slow ? 'True' : 'False';
    const lang = voice; // For gTTS, voice is the language code
    
    const pythonScript = `
from gtts import gTTS
tts = gTTS(text='''${text.replace(/'/g, "\\'")}''', lang='${lang}', slow=${slow})
tts.save('${outputFile}')
`;
    
    try {
      const scriptFile = path.join(OUTPUT_DIR, 'temp_gtts.py');
      await fs.writeFile(scriptFile, pythonScript);
      await execAsync(`python3 ${scriptFile}`);
      await fs.unlink(scriptFile);
      return { success: true, file: outputFile };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // System TTS (pyttsx3)
  'pyttsx3': async (text, voice, options = {}) => {
    const outputFile = path.join(OUTPUT_DIR, `pyttsx3-${Date.now()}.mp3`);
    const rate = options.rate || 150;
    const volume = options.volume || 1.0;
    
    const pythonScript = `
import pyttsx3
engine = pyttsx3.init()
engine.setProperty('rate', ${rate})
engine.setProperty('volume', ${volume})
engine.save_to_file('''${text.replace(/'/g, "\\'")}''', '${outputFile}')
engine.runAndWait()
`;
    
    try {
      const scriptFile = path.join(OUTPUT_DIR, 'temp_pyttsx3.py');
      await fs.writeFile(scriptFile, pythonScript);
      await execAsync(`python3 ${scriptFile}`);
      await fs.unlink(scriptFile);
      return { success: true, file: outputFile };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Mock implementations for demo purposes
  'amazon-polly': async (text, voice, options = {}) => {
    // In real implementation, this would use AWS SDK
    console.log('Amazon Polly mock:', { text, voice, options });
    return { 
      success: false, 
      error: 'Amazon Polly requires AWS credentials. This is a mock implementation.' 
    };
  },

  'elevenlabs': async (text, voice, options = {}) => {
    // In real implementation, this would use ElevenLabs API
    console.log('ElevenLabs mock:', { text, voice, options });
    return { 
      success: false, 
      error: 'ElevenLabs requires API key. This is a mock implementation.' 
    };
  },

  'coqui-tts': async (text, voice, options = {}) => {
    // In real implementation, this would use Coqui TTS
    console.log('Coqui TTS mock:', { text, voice, options });
    return { 
      success: false, 
      error: 'Coqui TTS requires model download. This is a mock implementation.' 
    };
  }
};

// API endpoint to generate TTS
app.post('/api/tts/generate', async (req, res) => {
  const { provider, voice, text, options = {} } = req.body;
  
  if (!provider || !voice || !text) {
    return res.status(400).json({ 
      error: 'Missing required parameters: provider, voice, text' 
    });
  }

  if (!ttsProviders[provider]) {
    return res.status(400).json({ 
      error: `Unknown provider: ${provider}` 
    });
  }

  try {
    console.log(`Generating TTS: ${provider} - ${voice}`);
    const result = await ttsProviders[provider](text, voice, options);
    
    if (result.success) {
      // Get file info
      const stats = await fs.stat(result.file);
      const filename = path.basename(result.file);
      
      res.json({
        success: true,
        url: `/audio/tts-test/${filename}`,
        size: stats.size,
        provider,
        voice,
        generated: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        provider,
        voice
      });
    }
  } catch (error) {
    console.error('TTS generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      provider,
      voice
    });
  }
});

// API endpoint to list available providers and voices
app.get('/api/tts/providers', (req, res) => {
  res.json({
    providers: {
      'edge-tts': {
        name: 'Microsoft Edge TTS',
        available: true,
        requiresSetup: false
      },
      'gtts': {
        name: 'Google TTS',
        available: true,
        requiresSetup: 'pip install gtts'
      },
      'pyttsx3': {
        name: 'System TTS',
        available: true,
        requiresSetup: 'pip install pyttsx3'
      },
      'amazon-polly': {
        name: 'Amazon Polly',
        available: false,
        requiresSetup: 'AWS credentials required'
      },
      'elevenlabs': {
        name: 'ElevenLabs',
        available: false,
        requiresSetup: 'API key required'
      },
      'coqui-tts': {
        name: 'Coqui TTS',
        available: false,
        requiresSetup: 'Model download required'
      }
    }
  });
});

// Health check endpoint
app.get('/api/tts/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`TTS API Mock Server running on http://localhost:${PORT}`);
  console.log('\nEndpoints:');
  console.log('  POST /api/tts/generate - Generate TTS audio');
  console.log('  GET  /api/tts/providers - List available providers');
  console.log('  GET  /api/tts/health - Health check');
  console.log('\nMake sure you have installed:');
  console.log('  - edge-tts (npm install -g edge-tts)');
  console.log('  - gtts (pip install gtts)');
  console.log('  - pyttsx3 (pip install pyttsx3)');
});

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('\nShutting down TTS API server...');
  process.exit(0);
});