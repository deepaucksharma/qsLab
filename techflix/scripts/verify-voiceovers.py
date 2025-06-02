#!/usr/bin/env python3
"""Verify all generated voiceover files"""

import os
import json
from pathlib import Path

def verify_voiceovers():
    voiceover_dir = Path("public/audio/voiceovers")
    
    # Load manifest
    manifest_path = voiceover_dir / "manifest.json"
    if not manifest_path.exists():
        print("❌ Manifest file not found!")
        return
    
    with open(manifest_path) as f:
        manifest = json.load(f)
    
    print("🎙️ Voiceover Verification Report")
    print("=" * 50)
    print(f"Provider: {manifest['provider']}")
    print(f"Generated: {manifest['generated']}")
    print(f"Total Episodes: {len(manifest['episodes'])}")
    print("")
    
    total_files = 0
    missing_files = 0
    
    # Check each episode
    for episode_id in manifest['episodes']:
        episode_dir = voiceover_dir / episode_id
        metadata_path = episode_dir / "metadata.json"
        
        if not metadata_path.exists():
            print(f"❌ {episode_id}: metadata.json missing")
            continue
        
        with open(metadata_path) as f:
            metadata = json.load(f)
        
        episode_files = 0
        episode_missing = 0
        
        for segment in metadata['segments']:
            file_path = episode_dir / segment['file']
            total_files += 1
            
            if file_path.exists():
                episode_files += 1
            else:
                missing_files += 1
                episode_missing += 1
                print(f"   ❌ Missing: {file_path}")
        
        status = "✅" if episode_missing == 0 else "⚠️"
        print(f"{status} {episode_id}: {episode_files}/{len(metadata['segments'])} files ({metadata['title']})")
    
    print("")
    print("=" * 50)
    print(f"Total Files: {total_files - missing_files}/{total_files}")
    
    if missing_files == 0:
        print("✅ All voiceover files are present!")
    else:
        print(f"⚠️  {missing_files} files are missing")
    
    # List all MP3 files
    all_mp3s = list(voiceover_dir.rglob("*.mp3"))
    print(f"\n📁 Total MP3 files found: {len(all_mp3s)}")
    
    # Check file sizes
    total_size = sum(f.stat().st_size for f in all_mp3s)
    print(f"💾 Total size: {total_size / (1024*1024):.1f} MB")

if __name__ == "__main__":
    verify_voiceovers()