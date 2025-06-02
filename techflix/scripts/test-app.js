import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('error', error => console.log('ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url()));
  
  try {
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Check if CSS is loaded
    const hasStyles = await page.evaluate(() => {
      const computedStyle = window.getComputedStyle(document.body);
      return {
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color,
        fontFamily: computedStyle.fontFamily,
        bodyClasses: document.body.className,
        rootClasses: document.getElementById('root')?.className || 'No root element'
      };
    });
    
    console.log('Styles:', hasStyles);
    
    // Check for any React errors
    const reactErrors = await page.evaluate(() => {
      const errorDiv = document.querySelector('#root > div[style*="color: rgb(255, 99, 71)"]');
      return errorDiv ? errorDiv.innerText : null;
    });
    
    if (reactErrors) {
      console.log('React Error:', reactErrors);
    }
    
    // Get page title
    const title = await page.title();
    console.log('Page title:', title);
    
  } catch (error) {
    console.error('Navigation error:', error);
  }
  
  await browser.close();
})();