# Audio System End-to-End Testing Guide

## 🚀 Server Running
The development server is running at: **http://localhost:3000**

## 🧪 Test Checklist

### 1. Audio Test Page (http://localhost:3000/audio-test)
This is your main testing hub for all audio functionality.

#### System Sounds Testing:
- [ ] **Initialize Audio** - Click this first to enable browser audio
- [ ] **Ta-dum Sound** - Should play Netflix-style intro
- [ ] **Click Sound** - UI click feedback
- [ ] **Hover Sound** - Subtle hover effect
- [ ] **Transition Sound** - Scene transition effect
- [ ] **Scene Change** - Scene switching sound
- [ ] **Episode Start** - Episode beginning sound
- [ ] **Success Sound** - Positive feedback
- [ ] **Error Sound** - Error feedback

#### Episode Audio Testing:
- [ ] **Load S2E1** - Click to load episode audio assets
- [ ] **Voice-over Playback** - Test each voiceover segment:
  - evolution-intro
  - evolution-birth
  - evolution-early-days
  - evolution-growth
  - evolution-transformation
  - bottleneck-intro
  - bottleneck-cost
  - bottleneck-real-world
  - share-groups-revelation
  - impact-intro
  - impact-metrics

- [ ] **Sound Effects** - Test episode effects:
  - tech-atmosphere (ambient)
  - data-flow
  - scene-transition
  - timeline-whoosh
  - reveal
  - breakthrough
  - impact-boom

#### Controls Testing:
- [ ] **Sound Toggle** - Enable/disable system sounds
- [ ] **Volume Control** - Adjust volume levels
- [ ] **Subtitle Display** - Verify subtitles show with voiceovers
- [ ] **Activity Log** - Check all actions are logged

### 2. Diagnostics Page (http://localhost:3000/diagnostics)
Use this if you encounter any issues.

- [ ] **Web Audio API** - Should show "AudioContext available"
- [ ] **File Access** - All files should show green checkmarks
- [ ] **Audio Manager State** - Verify correct settings
- [ ] **Test Buttons** - Direct sound testing
- [ ] **Browser Info** - Check audio format support

### 3. Browse Page Testing (http://localhost:3000/browse)
Test UI interactions:

- [ ] **Hover over episode cards** - Should play hover sound
- [ ] **Click on episodes** - Should play click sound
- [ ] **Sound control button** - Toggle in navigation

### 4. Episode Playback (http://localhost:3000/browse)
Navigate to Season 2, Episode 1:

- [ ] **Episode Loading** - Ta-dum sound should play
- [ ] **Scene Playback** - Voice-overs should auto-play
- [ ] **Scene Transitions** - Transition sounds between scenes
- [ ] **Interactive Moments** - Audio should pause/resume
- [ ] **Subtitles** - Should sync with voiceovers

### 5. Preference Persistence
- [ ] Toggle sounds OFF → Refresh page → Should remain OFF
- [ ] Toggle sounds ON → Refresh page → Should remain ON
- [ ] Change volume → Refresh page → Should remember setting

## 🎯 Expected Results

### ✅ Success Indicators:
1. All system sounds play without errors
2. Voice-overs play with synchronized subtitles
3. Sound effects enhance the experience
4. Preferences persist across sessions
5. No console errors (except autoplay warnings on first load)
6. Smooth audio transitions

### ❌ Common Issues & Solutions:

1. **No Audio Playing**
   - Click "Initialize Audio" button first
   - Check browser volume isn't muted
   - Try clicking anywhere on the page

2. **"Autoplay blocked" errors**
   - This is normal - click anywhere to enable audio
   - Use the Initialize Audio button

3. **Files not loading (red X)**
   - Check if audio files exist in public/audio/
   - Run `./scripts/setup-s2e1-audio-v2.sh` if missing

4. **Subtitles not showing**
   - Verify metadata.json has text field
   - Check subtitle callback is set

## 📊 Performance Metrics to Note:

- Audio load time: Should be < 1 second
- Playback latency: Should be imperceptible
- Memory usage: Check if audio is properly cleaned up

## 🔍 Console Commands for Debugging:

Open browser console (F12) and try:

```javascript
// Check audio manager state
audioManager.getState()

// Test specific sounds
audioManager.playClick()
audioManager.playTaDum()

// Check episode loading
audioManager.loadEpisodeAudio('s2e1')

// Play specific voiceover
audioManager.playVoiceover('evolution-intro')
```

## 📝 Test Results Template:

```
Date: [Today's Date]
Browser: [Chrome/Firefox/Safari/Edge]
OS: [macOS/Windows/Linux]

System Sounds: ✅/❌
Voice-overs: ✅/❌
Sound Effects: ✅/❌
Preferences: ✅/❌
Episode Integration: ✅/❌

Issues Found:
1. 
2. 

Notes:
```

## 🚀 Quick Test Path:

1. Open http://localhost:3000/audio-test
2. Click "Initialize Audio"
3. Test Ta-dum sound
4. Load S2E1
5. Play "evolution-intro" voiceover
6. Verify subtitle appears
7. Navigate to Browse page
8. Play S2E1 episode
9. Confirm audio works throughout

---

Happy Testing! 🎵