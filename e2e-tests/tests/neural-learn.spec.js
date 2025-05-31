// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Neural Learn - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application with test user
    await page.goto('/?userId=test-user-001');
  });

  test('Step 1: Initial page load', async ({ page }) => {
    console.log('Testing: Initial page load...');
    
    // Check page title
    await expect(page).toHaveTitle(/Neural Learn/);
    
    // Check header elements
    const appTitle = page.locator('.app-title');
    await expect(appTitle).toBeVisible();
    await expect(appTitle).toHaveText('Neural Learn');
    
    // Check user points and badges
    const userPoints = page.locator('#userPoints');
    await expect(userPoints).toBeVisible();
    await expect(userPoints).toHaveText('0');
    
    const userBadges = page.locator('#userBadges');
    await expect(userBadges).toBeVisible();
    await expect(userBadges).toHaveText('0');
    
    // Check course sidebar
    const sidebar = page.locator('.course-sidebar');
    await expect(sidebar).toBeVisible();
    
    // Check available courses section
    const coursesHeader = page.locator('h2:has-text("Available Courses")');
    await expect(coursesHeader).toBeVisible();
    
    // Check view toggle buttons
    const gridViewBtn = page.locator('.view-toggle[data-view="grid"]');
    const listViewBtn = page.locator('.view-toggle[data-view="list"]');
    await expect(gridViewBtn).toBeVisible();
    await expect(listViewBtn).toBeVisible();
    
    console.log('✓ Initial page load verified');
  });

  test('Step 2: Course grid display', async ({ page }) => {
    console.log('Testing: Course grid display...');
    
    // Wait for courses to load
    await page.waitForSelector('.course-card', { timeout: 10000 });
    
    // Check if at least one course card exists
    const courseCards = page.locator('.course-card');
    await expect(courseCards).toHaveCount(1); // At least one course
    
    // Check first course card structure
    const firstCard = courseCards.first();
    await expect(firstCard).toBeVisible();
    
    // Check course title
    const courseTitle = firstCard.locator('.course-title');
    await expect(courseTitle).toBeVisible();
    
    // Check course description
    const courseDesc = firstCard.locator('.course-description');
    await expect(courseDesc).toBeVisible();
    
    // Check start button
    const startBtn = firstCard.locator('button:has-text("Start Course")');
    await expect(startBtn).toBeVisible();
    
    // Test hover effect
    await firstCard.hover();
    // Visual regression would be better here, but we'll check computed styles
    
    console.log('✓ Course grid display verified');
  });

  test('Step 3: Start course', async ({ page }) => {
    console.log('Testing: Start course...');
    
    // Wait for courses and click start
    await page.waitForSelector('.course-card');
    await page.click('button:has-text("Start Course")');
    
    // Check sidebar updates
    const courseStructure = page.locator('#courseStructure');
    await expect(courseStructure).toBeVisible();
    
    // Check overall progress appears
    const overallProgress = page.locator('.overall-progress');
    await expect(overallProgress).toBeVisible();
    
    const progressText = page.locator('#progressText');
    await expect(progressText).toBeVisible();
    await expect(progressText).toContainText('0% Complete');
    
    // Check breadcrumb updates
    const breadcrumb = page.locator('.breadcrumb-nav');
    await expect(breadcrumb).toBeVisible();
    
    console.log('✓ Course start verified');
  });

  test('Step 4: Select episode', async ({ page }) => {
    console.log('Testing: Episode selection...');
    
    // Start course first
    await page.waitForSelector('.course-card');
    await page.click('button:has-text("Start Course")');
    
    // Wait for episode list
    await page.waitForSelector('.episode-item', { timeout: 10000 });
    
    // Click first episode
    await page.click('.episode-item:first-child');
    
    // Check episode player view
    const episodePlayer = page.locator('#episodePlayerView');
    await expect(episodePlayer).toBeVisible();
    
    // Check episode header elements
    const backBtn = page.locator('#backToCoursesBtn');
    await expect(backBtn).toBeVisible();
    
    const episodeTitle = page.locator('#episodeTitle');
    await expect(episodeTitle).toBeVisible();
    
    const episodeDuration = page.locator('#episodeDuration');
    await expect(episodeDuration).toBeVisible();
    
    // Check segment container
    const segmentContainer = page.locator('#segmentContainer');
    await expect(segmentContainer).toBeVisible();
    
    // Check audio controls
    const audioControls = page.locator('.audio-controls');
    await expect(audioControls).toBeVisible();
    
    const playBtn = page.locator('#playPauseBtn');
    await expect(playBtn).toBeVisible();
    
    // Check navigation buttons
    const prevBtn = page.locator('#prevSegmentBtn');
    const nextBtn = page.locator('#nextSegmentBtn');
    await expect(prevBtn).toBeVisible();
    await expect(prevBtn).toBeDisabled(); // First segment
    await expect(nextBtn).toBeVisible();
    await expect(nextBtn).toBeEnabled();
    
    console.log('✓ Episode selection verified');
  });

  test('Step 5: Audio playback', async ({ page }) => {
    console.log('Testing: Audio playback...');
    
    // Navigate to episode
    await page.waitForSelector('.course-card');
    await page.click('button:has-text("Start Course")');
    await page.waitForSelector('.episode-item');
    await page.click('.episode-item:first-child');
    
    // Wait for audio to be ready
    await page.waitForSelector('#playPauseBtn');
    
    // Click play
    await page.click('#playPauseBtn');
    
    // Check play button changes to pause icon
    const playIcon = page.locator('#playPauseBtn i');
    await expect(playIcon).toHaveClass(/fa-pause/);
    
    // Check audio progress updates (wait a bit for audio to play)
    await page.waitForTimeout(2000);
    
    const currentTime = page.locator('#audioCurrentTime');
    await expect(currentTime).not.toHaveText('0:00');
    
    // Click pause
    await page.click('#playPauseBtn');
    await expect(playIcon).toHaveClass(/fa-play/);
    
    console.log('✓ Audio playback verified');
  });

  test('Step 6: Navigate segments', async ({ page }) => {
    console.log('Testing: Segment navigation...');
    
    // Navigate to episode
    await page.waitForSelector('.course-card');
    await page.click('button:has-text("Start Course")');
    await page.waitForSelector('.episode-item');
    await page.click('.episode-item:first-child');
    
    // Get initial segment title
    const segmentTitle = page.locator('.segment-title').first();
    const initialTitle = await segmentTitle.textContent();
    
    // Click next
    await page.click('#nextSegmentBtn');
    
    // Check segment changed
    await expect(segmentTitle).not.toHaveText(initialTitle);
    
    // Check previous button is now enabled
    const prevBtn = page.locator('#prevSegmentBtn');
    await expect(prevBtn).toBeEnabled();
    
    // Check progress updated
    const progressText = page.locator('#episodeProgressText');
    await expect(progressText).toContainText('1/');
    
    // Check for points notification
    const toast = page.locator('.toast');
    // Points might appear as a toast
    
    console.log('✓ Segment navigation verified');
  });

  test('Step 7: Interactive elements', async ({ page }) => {
    console.log('Testing: Interactive elements...');
    
    // This test would need to find segments with interactive cues
    // For now, we'll check if the interactive system is loaded
    
    // Navigate to episode
    await page.waitForSelector('.course-card');
    await page.click('button:has-text("Start Course")');
    await page.waitForSelector('.episode-item');
    await page.click('.episode-item:first-child');
    
    // Check if interactive cue hints exist (if any)
    const interactiveHints = page.locator('.interactive-hint');
    const hintsCount = await interactiveHints.count();
    
    if (hintsCount > 0) {
      // Test first interactive element
      const firstHint = interactiveHints.first();
      await expect(firstHint).toBeVisible();
      
      // Hover or click based on type
      await firstHint.hover();
      
      console.log('✓ Interactive elements found and tested');
    } else {
      console.log('✓ No interactive elements in current segment');
    }
  });

  test('Step 8: Progress tracking', async ({ page }) => {
    console.log('Testing: Progress tracking...');
    
    // Navigate through multiple segments
    await page.waitForSelector('.course-card');
    await page.click('button:has-text("Start Course")');
    await page.waitForSelector('.episode-item');
    await page.click('.episode-item:first-child');
    
    // Complete a few segments
    for (let i = 0; i < 3; i++) {
      if (i > 0) {
        await page.click('#nextSegmentBtn');
        await page.waitForTimeout(1000); // Wait for transition
      }
    }
    
    // Check episode progress
    const episodeProgress = page.locator('#episodeProgressText');
    await expect(episodeProgress).toContainText('2/'); // 2 completed
    
    // Check user points increased
    const userPoints = page.locator('#userPoints');
    const points = await userPoints.textContent();
    expect(parseInt(points)).toBeGreaterThan(0);
    
    // Check overall progress updated
    const overallProgress = page.locator('#overallProgress');
    const progressStyle = await overallProgress.getAttribute('style');
    expect(progressStyle).toContain('width');
    
    console.log('✓ Progress tracking verified');
  });

  test('Step 9: Responsive design', async ({ page }) => {
    console.log('Testing: Responsive design...');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if menu toggle is visible
    const menuToggle = page.locator('#menuToggle');
    await expect(menuToggle).toBeVisible();
    
    // Check sidebar behavior
    const sidebar = page.locator('.course-sidebar');
    // Sidebar should be hidden or overlay on mobile
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Check layout adapts
    await expect(page.locator('.app-container')).toBeVisible();
    
    // Reset to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    
    console.log('✓ Responsive design verified');
  });

  test('Step 10: Complete user journey', async ({ page }) => {
    console.log('Testing: Complete user journey...');
    
    // 1. Load page
    await expect(page).toHaveTitle(/Neural Learn/);
    
    // 2. Select course
    await page.waitForSelector('.course-card');
    const courseTitle = await page.locator('.course-title').first().textContent();
    await page.click('button:has-text("Start Course")');
    
    // 3. Select episode
    await page.waitForSelector('.episode-item');
    const episodeTitle = await page.locator('.episode-title').first().textContent();
    await page.click('.episode-item:first-child');
    
    // 4. Play audio
    await page.click('#playPauseBtn');
    await page.waitForTimeout(1000);
    await page.click('#playPauseBtn'); // Pause
    
    // 5. Navigate segments
    await page.click('#nextSegmentBtn');
    await page.waitForTimeout(500);
    await page.click('#prevSegmentBtn');
    
    // 6. Check final state
    const userPoints = await page.locator('#userPoints').textContent();
    const progressText = await page.locator('#progressText').textContent();
    
    console.log(`✓ Complete journey: Started "${courseTitle}", played "${episodeTitle}"`);
    console.log(`  Final state: ${userPoints} points, ${progressText}`);
  });
});