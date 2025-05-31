// @ts-check
const { test, expect } = require('@playwright/test');

test('Debug: Check course loading', async ({ page }) => {
  // Enable console logging
  page.on('console', msg => console.log('Browser console:', msg.text()));
  page.on('pageerror', err => console.error('Page error:', err));
  
  // Navigate to page
  await page.goto('/?userId=test-user-001');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Check if courses API is called
  const coursesResponse = await page.waitForResponse(
    response => response.url().includes('/api/courses') && response.status() === 200,
    { timeout: 5000 }
  ).catch(() => null);
  
  if (coursesResponse) {
    const courses = await coursesResponse.json();
    console.log('API returned courses:', courses.length);
  } else {
    console.log('No courses API call detected');
  }
  
  // Check DOM for course elements
  const courseGridHTML = await page.locator('#coursesGrid').innerHTML();
  console.log('Course grid HTML:', courseGridHTML);
  
  // Try to manually trigger course loading
  const hasLoadCourses = await page.evaluate(() => {
    return typeof window.loadCourses === 'function';
  });
  
  if (hasLoadCourses) {
    console.log('Manually triggering loadCourses()');
    await page.evaluate(() => window.loadCourses());
    await page.waitForTimeout(2000);
  }
  
  // Check again
  const finalHTML = await page.locator('#coursesGrid').innerHTML();
  console.log('Final course grid HTML:', finalHTML);
  
  // Take screenshot
  await page.screenshot({ path: 'debug-courses.png', fullPage: true });
});