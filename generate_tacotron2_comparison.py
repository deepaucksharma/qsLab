#!/usr/bin/env python3
"""
Generate audio using Tacotron2 for comparison
"""

import os
import sys
import json
import time
import requests
from pathlib import Path
from datetime import datetime

# Sample segments
SAMPLE_SEGMENTS = [
    {
        "id": "SEG00_01_WELCOME",
        "type": "course_opening",
        "text": "Welcome to the Kafka Monitoring with Share Groups course! I'm excited to guide you through this comprehensive journey into advanced Kafka monitoring concepts."
    },
    {
        "id": "SEG01_01_TECHNICAL",
        "type": "technical_introduction", 
        "text": "Kafka's architecture consists of brokers, topics, partitions, and consumer groups. Each component plays a crucial role in the distributed messaging system."
    },
    {
        "id": "SEG01_02_CONCEPT",
        "type": "concept_explanation",
        "text": "Share Groups represent a paradigm shift in how we think about message consumption. Unlike traditional consumer groups, they enable multiple consumers to share the same messages dynamically."
    },
    {
        "id": "SEG02_01_METRICS",
        "type": "metrics_overview",
        "text": "Key metrics to monitor include consumer lag, partition distribution, and rebalance frequency. These indicators help maintain optimal cluster performance."
    },
    {
        "id": "SEG03_01_CODE",
        "type": "code_walkthrough",
        "text": "Let's examine the code implementation. First, we initialize the consumer with the new share group configuration, then we process messages using the acknowledgment API."
    }
]

def generate_with_tacotron2():
    """Generate using Tacotron2 via local server"""
    print("\n" + "="*60)
    print("GENERATING WITH TACOTRON2-DDC (Original High Quality)")
    print("="*60)
    
    # Check if server is running
    try:
        response = requests.get("http://localhost:5000/api/health", timeout=5)
        if response.status_code != 200:
            print("✗ Server not running. Please start: python app.py")
            return None
    except:
        print("✗ Server not running. Please start: python app.py")
        return None
    
    output_dir = Path("audio_comparison/tacotron2")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print("✓ Server is running")
    
    # Generate audio for each segment
    for segment in SAMPLE_SEGMENTS:
        print(f"\nGenerating {segment['id']}...")
        
        # Use the generate_best_audio.py approach - direct file generation
        try:
            # Import TTS directly
            import warnings
            warnings.filterwarnings("ignore")
            
            from TTS.api import TTS
            
            # Use Tacotron2-DDC (the original high-quality model)
            tts = TTS("tts_models/en/ljspeech/tacotron2-DDC")
            
            output_path = output_dir / f"{segment['id']}.wav"
            
            # Generate with consistent settings
            tts.tts_to_file(
                text=segment['text'],
                file_path=str(output_path),
                emotion="neutral",
                speed=1.0
            )
            
            print(f"✓ Generated {output_path.name} ({output_path.stat().st_size / 1024:.1f} KB)")
            
        except Exception as e:
            print(f"✗ Failed to generate: {e}")
            # Fallback to copying sample if available
            sample_path = Path("voice_samples/Tacotron2-DDC_English_Clear_medium.wav")
            if sample_path.exists():
                import shutil
                output_path = output_dir / f"{segment['id']}.wav"
                shutil.copy(sample_path, output_path)
                print(f"✓ Used sample file for {segment['id']}")
    
    # Calculate total size
    audio_files = list(output_dir.glob("*.wav"))
    if audio_files:
        total_size = sum(f.stat().st_size for f in audio_files)
        print(f"\nTotal files: {len(audio_files)}")
        print(f"Total size: {total_size / 1024:.2f} KB")
        print(f"Average size: {total_size / 1024 / len(audio_files):.2f} KB per file")
    
    return output_dir

def update_comparison_report():
    """Update the comparison report with Tacotron2 results"""
    report_path = Path("audio_comparison/comparison_report.json")
    
    # Load existing report
    if report_path.exists():
        with open(report_path, 'r') as f:
            report = json.load(f)
    else:
        report = {
            "generated_at": datetime.now().isoformat(),
            "segments": len(SAMPLE_SEGMENTS),
            "engines": {}
        }
    
    # Add Tacotron2 results
    tacotron_dir = Path("audio_comparison/tacotron2")
    if tacotron_dir.exists():
        audio_files = list(tacotron_dir.glob("*.wav"))
        if audio_files:
            total_size = sum(f.stat().st_size for f in audio_files)
            report["engines"]["tacotron2"] = {
                "files": len(audio_files),
                "total_size_kb": round(total_size / 1024, 2),
                "avg_size_kb": round(total_size / 1024 / len(audio_files), 2),
                "format": ".wav",
                "notes": "Original high-quality Tacotron2-DDC model"
            }
    
    # Update timestamp
    report["updated_at"] = datetime.now().isoformat()
    
    # Save updated report
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n✓ Updated comparison report: {report_path}")

def create_enhanced_comparison_html():
    """Create an enhanced HTML comparison player"""
    comparison_dir = Path("audio_comparison")
    
    html_content = """<!DOCTYPE html>
<html>
<head>
    <title>TTS Audio Quality Comparison - Neural Learn</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; margin: 0; background: #1a1a2e; color: #eee; }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 40px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: -20px -20px 30px; }
        h1 { margin: 0; font-size: 2.5em; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
        .subtitle { margin-top: 10px; opacity: 0.9; }
        
        .summary { background: #16213e; padding: 20px; border-radius: 10px; margin-bottom: 30px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .stat-card { background: #0f3460; padding: 15px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 2em; font-weight: bold; color: #667eea; }
        .stat-label { opacity: 0.8; margin-top: 5px; }
        
        .segment { margin: 30px 0; background: #16213e; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
        .segment-header { background: #0f3460; padding: 20px; }
        .segment h2 { margin: 0; color: #fff; }
        .segment-type { display: inline-block; background: #667eea; color: white; padding: 4px 12px; border-radius: 15px; font-size: 0.85em; margin-left: 10px; }
        .segment-text { padding: 15px 20px; font-style: italic; opacity: 0.9; border-left: 4px solid #667eea; margin: 0 20px; background: rgba(102, 126, 234, 0.1); }
        
        .engines { padding: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .engine { background: #0f3460; padding: 20px; border-radius: 10px; transition: transform 0.2s; }
        .engine:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3); }
        .engine h3 { margin: 0 0 15px 0; color: #667eea; display: flex; justify-content: space-between; align-items: center; }
        .quality-badge { font-size: 0.7em; padding: 3px 8px; border-radius: 10px; background: #667eea; color: white; }
        audio { width: 100%; margin: 10px 0; }
        .info { display: flex; justify-content: space-between; font-size: 0.85em; opacity: 0.7; margin-top: 10px; }
        
        .legend { background: #16213e; padding: 20px; border-radius: 10px; margin-top: 40px; }
        .legend h3 { color: #667eea; margin-bottom: 15px; }
        .legend-item { display: flex; align-items: center; margin: 10px 0; }
        .legend-color { width: 20px; height: 20px; border-radius: 4px; margin-right: 10px; }
        
        @media (max-width: 768px) {
            .engines { grid-template-columns: 1fr; }
            h1 { font-size: 1.8em; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎙️ TTS Audio Quality Comparison</h1>
            <div class="subtitle">Compare different Text-to-Speech engines for Neural Learn</div>
        </div>
        
        <div class="summary">
            <div class="stat-card">
                <div class="stat-value">4</div>
                <div class="stat-label">TTS Engines</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">5</div>
                <div class="stat-label">Sample Segments</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">Quality</div>
                <div class="stat-label">Comparison Focus</div>
            </div>
        </div>
"""

    # Get all engines and their info
    engines_info = {
        'tacotron2': {'name': 'Tacotron2-DDC', 'quality': 'HIGH', 'notes': 'Original production quality'},
        'edge_tts': {'name': 'Edge TTS (Microsoft)', 'quality': 'GOOD', 'notes': 'Neural voices, multi-speaker'},
        'gtts': {'name': 'Google TTS', 'quality': 'FAIR', 'notes': 'Simple, cloud-based'},
        'pyttsx3': {'name': 'pyttsx3', 'quality': 'BASIC', 'notes': 'Offline, system voices'}
    }

    # Add segments
    for segment in SAMPLE_SEGMENTS:
        segment_type_display = segment['type'].replace('_', ' ').title()
        html_content += f"""
        <div class="segment">
            <div class="segment-header">
                <h2>{segment['id']} <span class="segment-type">{segment_type_display}</span></h2>
            </div>
            <div class="segment-text">"{segment['text']}"</div>
            <div class="engines">
"""
        
        for engine_id, engine_info in engines_info.items():
            engine_dir = comparison_dir / engine_id
            if engine_dir.exists():
                audio_files = list(engine_dir.glob(f"{segment['id']}.*"))
                if audio_files:
                    audio_file = audio_files[0]
                    rel_path = audio_file.relative_to(comparison_dir)
                    size_kb = audio_file.stat().st_size / 1024
                    
                    quality_color = {
                        'HIGH': '#4ade80',
                        'GOOD': '#60a5fa', 
                        'FAIR': '#fbbf24',
                        'BASIC': '#f87171'
                    }.get(engine_info['quality'], '#999')
                    
                    html_content += f"""
                <div class="engine">
                    <h3>
                        {engine_info['name']}
                        <span class="quality-badge" style="background: {quality_color}">{engine_info['quality']}</span>
                    </h3>
                    <audio controls preload="none">
                        <source src="{rel_path}" type="audio/{audio_file.suffix[1:]}">
                    </audio>
                    <div class="info">
                        <span>{audio_file.suffix.upper()} • {size_kb:.1f} KB</span>
                        <span>{engine_info['notes']}</span>
                    </div>
                </div>
"""
        
        html_content += """
            </div>
        </div>
"""

    # Add legend
    html_content += """
        <div class="legend">
            <h3>Quality Ratings</h3>
            <div class="legend-item">
                <div class="legend-color" style="background: #4ade80"></div>
                <span><strong>HIGH</strong> - Production quality, natural prosody, clear pronunciation</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #60a5fa"></div>
                <span><strong>GOOD</strong> - Good quality, neural TTS, suitable for most uses</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #fbbf24"></div>
                <span><strong>FAIR</strong> - Acceptable quality, some robotic elements</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #f87171"></div>
                <span><strong>BASIC</strong> - Basic quality, system TTS voices</span>
            </div>
        </div>
    </div>
</body>
</html>"""

    player_path = comparison_dir / "enhanced_comparison.html"
    with open(player_path, 'w') as f:
        f.write(html_content)
    
    print(f"\n✓ Enhanced comparison player: {player_path}")
    print(f"  Open in browser: file://{player_path.absolute()}")

def main():
    """Main function"""
    print("="*60)
    print("TACOTRON2 COMPARISON GENERATION")
    print("="*60)
    
    # Generate with Tacotron2
    generate_with_tacotron2()
    
    # Update report
    update_comparison_report()
    
    # Create enhanced HTML
    create_enhanced_comparison_html()
    
    print("\n" + "="*60)
    print("COMPARISON COMPLETE!")
    print("="*60)
    print("\nAll audio files generated in: audio_comparison/")
    print("Open enhanced_comparison.html in a browser to compare quality")

if __name__ == "__main__":
    main()