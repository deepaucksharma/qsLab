import http from 'http';

async function visualTest() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    console.log('Testing TechFlix Visual Elements...\n');
    
    // Test different viewport sizes
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];
    
    for (const viewport of viewports) {
      console.log(`\n=== Testing ${viewport.name} View (${viewport.width}x${viewport.height}) ===`);
      await page.setViewport(viewport);
      
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
      
      // Wait for React to render
      await page.waitForSelector('#root > *', { timeout: 5000 });
      
      // Check for main elements
      const elements = {
        header: await page.$('header'),
        heroSection: await page.$('.hero-section, [class*="hero"]'),
        episodeGrid: await page.$('[class*="episode"], [class*="grid"]'),
        navigation: await page.$('nav, [class*="nav"]')
      };
      
      console.log('Elements found:');
      for (const [name, element] of Object.entries(elements)) {
        console.log(`  ${name}: ${element ? '✓' : '✗'}`);
      }
      
      // Check for CSS loading
      const styles = await page.evaluate(() => {
        const stylesheets = Array.from(document.styleSheets);
        return {
          count: stylesheets.length,
          hasStyles: window.getComputedStyle(document.body).backgroundColor !== 'rgba(0, 0, 0, 0)'
        };
      });
      
      console.log(`\nCSS Status:`);
      console.log(`  Stylesheets loaded: ${styles.count}`);
      console.log(`  Styles applied: ${styles.hasStyles ? '✓' : '✗'}`);
      
      // Check for console errors
      const consoleMessages = [];
      page.on('console', msg => consoleMessages.push({
        type: msg.type(),
        text: msg.text()
      }));
      
      // Check for layout issues
      const layoutIssues = await page.evaluate(() => {
        const issues = [];
        
        // Check for horizontal overflow
        if (document.documentElement.scrollWidth > window.innerWidth) {
          issues.push('Horizontal scroll detected');
        }
        
        // Check for overlapping elements
        const elements = document.querySelectorAll('*');
        const rects = new Map();
        
        elements.forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const key = `${Math.round(rect.top)}-${Math.round(rect.left)}`;
            if (rects.has(key)) {
              const zIndex1 = window.getComputedStyle(el).zIndex;
              const zIndex2 = window.getComputedStyle(rects.get(key)).zIndex;
              if (zIndex1 === zIndex2) {
                issues.push(`Potential overlap at position ${key}`);
              }
            }
            rects.set(key, el);
          }
        });
        
        // Check for text overflow
        elements.forEach(el => {
          if (el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight) {
            issues.push(`Text overflow in element: ${el.tagName}.${el.className}`);
          }
        });
        
        return issues;
      });
      
      if (layoutIssues.length > 0) {
        console.log('\nLayout Issues:');
        layoutIssues.forEach(issue => console.log(`  - ${issue}`));
      } else {
        console.log('\nNo layout issues detected ✓');
      }
      
      // Check accessibility
      const accessibilityChecks = await page.evaluate(() => {
        const checks = {
          hasH1: !!document.querySelector('h1'),
          imagesHaveAlt: Array.from(document.querySelectorAll('img')).every(img => img.alt),
          buttonsHaveText: Array.from(document.querySelectorAll('button')).every(btn => 
            btn.textContent.trim() || btn.getAttribute('aria-label')
          ),
          linksHaveText: Array.from(document.querySelectorAll('a')).every(link => 
            link.textContent.trim() || link.getAttribute('aria-label')
          )
        };
        return checks;
      });
      
      console.log('\nAccessibility Checks:');
      console.log(`  Has H1: ${accessibilityChecks.hasH1 ? '✓' : '✗'}`);
      console.log(`  Images have alt text: ${accessibilityChecks.imagesHaveAlt ? '✓' : '✗'}`);
      console.log(`  Buttons have text/label: ${accessibilityChecks.buttonsHaveText ? '✓' : '✗'}`);
      console.log(`  Links have text/label: ${accessibilityChecks.linksHaveText ? '✓' : '✗'}`);
      
      // Take screenshot for visual reference
      await page.screenshot({ 
        path: `./visual-test-${viewport.name.toLowerCase()}.png`,
        fullPage: true 
      });
    }
    
    console.log('\n\nVisual testing completed! Screenshots saved.');
    
  } catch (error) {
    console.error('Error during visual testing:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is installed
try {
  require.resolve('puppeteer');
  visualTest();
} catch (e) {
  console.log('Puppeteer not installed. Running basic checks instead...\n');
  
  // Fallback to basic HTTP checks
  const http = require('http');
  
  console.log('Running basic HTTP visual checks...\n');
  
  const testUrls = [
    '/',
    '/src/index.css',
    '/src/main.jsx'
  ];
  
  testUrls.forEach(url => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: url,
      method: 'GET'
    };
    
    http.get(options, (res) => {
      console.log(`${url}: ${res.statusCode} ${res.statusCode === 200 ? '✓' : '✗'}`);
    }).on('error', (err) => {
      console.log(`${url}: Error - ${err.message}`);
    });
  });
}