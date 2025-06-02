#!/usr/bin/env node

/**
 * End-to-End Audio and Animation Timing Test
 * Tests synchronization between audio narration and visual animations
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const TEST_URL = 'http://localhost:3002';
const RESULTS_DIR = path.join(__dirname, '../testing/e2e-results');

class AudioAnimationTimingTest {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
  }

  async init() {
    // Create results directory
    await fs.mkdir(RESULTS_DIR, { recursive: true });
    
    // Launch browser
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for CI
      defaultViewport: {
        width: 1920,
        height: 1080
      },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    // Enable console logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser error:', msg.text());
      }
    });
    
    // Track network requests for audio files
    this.page.on('response', response => {
      const url = response.url();
      if (url.includes('/audio/') && response.status() === 200) {
        console.log(`✓ Audio loaded: ${url.split('/').pop()}`);
      }
    });
  }

  async navigateToEpisode(seasonNumber, episodeNumber) {
    console.log(`\n📺 Navigating to Season ${seasonNumber}, Episode ${episodeNumber}...`);
    
    // Go to browse page
    await this.page.goto(`${TEST_URL}/browse`, { waitUntil: 'networkidle2' });
    await this.page.waitForTimeout(2000);
    
    // Find and click the episode
    const episodeSelector = `[data-testid="episode-s${seasonNumber}e${episodeNumber}"]`;
    await this.page.waitForSelector(episodeSelector, { timeout: 10000 });
    await this.page.click(episodeSelector);
    
    // Wait for player to load
    await this.page.waitForSelector('.netflix-episode-player', { timeout: 10000 });
    await this.page.waitForTimeout(3000);
  }

  async testAudioVideoSync(testName, sceneSelector) {
    console.log(`\n🎬 Testing: ${testName}`);
    const test = {
      name: testName,
      scene: sceneSelector,
      results: [],
      status: 'running'
    };

    try {
      // Monitor animation events
      const animationEvents = await this.page.evaluate(() => {
        const events = [];
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && 
                (mutation.attributeName === 'style' || 
                 mutation.attributeName === 'class')) {
              events.push({
                timestamp: performance.now(),
                element: mutation.target.className,
                type: 'animation'
              });
            }
          });
        });
        
        // Observe the entire scene
        const scene = document.querySelector('.scene-container');
        if (scene) {
          observer.observe(scene, {
            attributes: true,
            childList: true,
            subtree: true
          });
        }
        
        // Track audio events
        window.audioEvents = [];
        const originalPlay = HTMLAudioElement.prototype.play;
        HTMLAudioElement.prototype.play = function() {
          window.audioEvents.push({
            timestamp: performance.now(),
            src: this.src,
            type: 'audio-play'
          });
          return originalPlay.apply(this, arguments);
        };
        
        return { events, observer };
      });

      // Let the scene play for 10 seconds
      await this.page.waitForTimeout(10000);

      // Collect timing data
      const timingData = await this.page.evaluate(() => {
        const audioEvents = window.audioEvents || [];
        const currentTime = performance.now();
        
        // Get scene progress
        const progressBar = document.querySelector('.bg-red-600');
        const progress = progressBar ? 
          parseFloat(progressBar.style.width) || 0 : 0;
        
        // Check for subtitles
        const subtitleElement = document.querySelector('.bg-black\\/80 p');
        const currentSubtitle = subtitleElement ? 
          subtitleElement.textContent : null;
        
        return {
          audioEvents,
          sceneProgress: progress,
          currentSubtitle,
          totalTime: currentTime
        };
      });

      // Analyze synchronization
      const syncAnalysis = this.analyzeSynchronization(timingData);
      test.results = syncAnalysis;
      test.status = syncAnalysis.issues.length > 0 ? 'warning' : 'passed';
      
      // Log results
      console.log(`\n📊 Timing Analysis:`);
      console.log(`  - Audio events: ${timingData.audioEvents.length}`);
      console.log(`  - Scene progress: ${timingData.sceneProgress}%`);
      console.log(`  - Subtitle active: ${timingData.currentSubtitle ? 'Yes' : 'No'}`);
      
      if (syncAnalysis.issues.length > 0) {
        console.log(`\n⚠️  Synchronization Issues:`);
        syncAnalysis.issues.forEach(issue => {
          console.log(`  - ${issue}`);
        });
      } else {
        console.log(`\n✅ Audio and animations appear synchronized`);
      }

    } catch (error) {
      test.status = 'failed';
      test.error = error.message;
      console.error(`❌ Test failed: ${error.message}`);
    }

    this.results.tests.push(test);
    return test;
  }

  analyzeSynchronization(timingData) {
    const issues = [];
    const analysis = {
      audioLatency: null,
      animationSmooth: true,
      subtitleSync: true,
      issues: []
    };

    // Check audio timing
    if (timingData.audioEvents.length > 0) {
      const firstAudio = timingData.audioEvents[0];
      if (firstAudio.timestamp > 1000) {
        issues.push(`Audio started late: ${firstAudio.timestamp}ms`);
        analysis.audioLatency = firstAudio.timestamp;
      }
    } else {
      issues.push('No audio events detected');
    }

    // Check subtitle synchronization
    if (timingData.currentSubtitle && timingData.audioEvents.length === 0) {
      issues.push('Subtitles shown but no audio playing');
      analysis.subtitleSync = false;
    }

    // Check scene progress
    if (timingData.sceneProgress === 0 && timingData.totalTime > 5000) {
      issues.push('Scene progress not updating');
    }

    analysis.issues = issues;
    return analysis;
  }

  async testSceneTransitions() {
    console.log('\n🔄 Testing Scene Transitions...');
    
    const transitionTest = {
      name: 'Scene Transitions',
      transitions: [],
      status: 'running'
    };

    try {
      // Monitor for scene changes
      const transitionData = await this.page.evaluate(() => {
        return new Promise((resolve) => {
          const transitions = [];
          let lastSceneTitle = '';
          
          const checkScene = () => {
            const sceneTitle = document.querySelector('.text-gray-400')?.textContent;
            if (sceneTitle && sceneTitle !== lastSceneTitle) {
              transitions.push({
                timestamp: performance.now(),
                from: lastSceneTitle,
                to: sceneTitle
              });
              lastSceneTitle = sceneTitle;
            }
          };
          
          // Check every 500ms for 15 seconds
          const interval = setInterval(checkScene, 500);
          setTimeout(() => {
            clearInterval(interval);
            resolve(transitions);
          }, 15000);
        });
      });

      transitionTest.transitions = transitionData;
      transitionTest.status = 'passed';
      
      console.log(`\n📊 Transition Analysis:`);
      console.log(`  - Total transitions: ${transitionData.length}`);
      transitionData.forEach((t, i) => {
        console.log(`  - Transition ${i + 1}: "${t.from}" → "${t.to}" at ${t.timestamp}ms`);
      });

    } catch (error) {
      transitionTest.status = 'failed';
      transitionTest.error = error.message;
    }

    this.results.tests.push(transitionTest);
    return transitionTest;
  }

  async testAudioContinuity() {
    console.log('\n🎵 Testing Audio Continuity...');
    
    const continuityTest = {
      name: 'Audio Continuity',
      events: [],
      status: 'running'
    };

    try {
      // Track audio interruptions
      const audioData = await this.page.evaluate(() => {
        return new Promise((resolve) => {
          const events = [];
          const audioElements = Array.from(document.querySelectorAll('audio'));
          
          audioElements.forEach((audio, index) => {
            audio.addEventListener('pause', () => {
              events.push({
                type: 'pause',
                timestamp: performance.now(),
                audioIndex: index,
                currentTime: audio.currentTime
              });
            });
            
            audio.addEventListener('play', () => {
              events.push({
                type: 'play',
                timestamp: performance.now(),
                audioIndex: index,
                currentTime: audio.currentTime
              });
            });
            
            audio.addEventListener('ended', () => {
              events.push({
                type: 'ended',
                timestamp: performance.now(),
                audioIndex: index
              });
            });
          });
          
          // Monitor for 10 seconds
          setTimeout(() => resolve(events), 10000);
        });
      });

      // Analyze for unexpected pauses
      const unexpectedPauses = audioData.filter((event, index) => {
        if (event.type === 'pause') {
          const nextEvent = audioData[index + 1];
          return !nextEvent || nextEvent.type !== 'play' || 
                 (nextEvent.timestamp - event.timestamp) > 100;
        }
        return false;
      });

      continuityTest.events = audioData;
      continuityTest.unexpectedPauses = unexpectedPauses.length;
      continuityTest.status = unexpectedPauses.length > 0 ? 'warning' : 'passed';
      
      console.log(`\n📊 Audio Continuity Analysis:`);
      console.log(`  - Total audio events: ${audioData.length}`);
      console.log(`  - Unexpected pauses: ${unexpectedPauses.length}`);

    } catch (error) {
      continuityTest.status = 'failed';
      continuityTest.error = error.message;
    }

    this.results.tests.push(continuityTest);
    return continuityTest;
  }

  async generateReport() {
    // Update summary
    this.results.tests.forEach(test => {
      this.results.summary.total++;
      if (test.status === 'passed') this.results.summary.passed++;
      else if (test.status === 'failed') this.results.summary.failed++;
      else if (test.status === 'warning') this.results.summary.warnings++;
    });

    // Generate report
    const report = `
# Audio/Animation Timing Test Report
Generated: ${this.results.timestamp}

## Summary
- Total Tests: ${this.results.summary.total}
- Passed: ${this.results.summary.passed}
- Failed: ${this.results.summary.failed}
- Warnings: ${this.results.summary.warnings}

## Test Results

${this.results.tests.map(test => `
### ${test.name}
Status: ${test.status.toUpperCase()}
${test.error ? `Error: ${test.error}` : ''}
${test.results ? `
Issues: ${test.results.issues.length}
${test.results.issues.map(i => `- ${i}`).join('\n')}
` : ''}
`).join('\n')}

## Recommendations
${this.generateRecommendations()}
`;

    // Save report
    const reportPath = path.join(RESULTS_DIR, `timing-test-${Date.now()}.md`);
    await fs.writeFile(reportPath, report);
    console.log(`\n📄 Report saved to: ${reportPath}`);
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.summary.failed > 0) {
      recommendations.push('- Fix critical failures before deployment');
    }
    
    if (this.results.summary.warnings > 0) {
      recommendations.push('- Investigate synchronization warnings');
      recommendations.push('- Consider adding timing adjustments for slower devices');
    }
    
    // Check for specific issues
    this.results.tests.forEach(test => {
      if (test.results?.audioLatency > 500) {
        recommendations.push('- Preload audio files to reduce latency');
      }
      if (test.unexpectedPauses > 0) {
        recommendations.push('- Review audio cleanup logic in scene transitions');
      }
    });
    
    return recommendations.length > 0 ? 
      recommendations.join('\n') : 
      '- All systems performing well';
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.init();
      
      console.log('🚀 Starting Audio/Animation Timing Tests...\n');
      
      // Test Kafka Share Groups episode (S2E1)
      await this.navigateToEpisode(2, 1);
      await this.testAudioVideoSync('Kafka Share Groups - Evolution Timeline', '.evolution-timeline');
      await this.testSceneTransitions();
      await this.testAudioContinuity();
      
      // Generate and display report
      const report = await this.generateReport();
      console.log('\n' + report);
      
    } catch (error) {
      console.error('Test suite failed:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// Run tests
const tester = new AudioAnimationTimingTest();
tester.run().catch(console.error);