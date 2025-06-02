import http from 'http';

async function diagnose() {
  const tests = [
    { path: '/', name: 'Home' },
    { path: '/browse', name: 'Browse' },
    { path: '/simple', name: 'Simple' },
    { path: '/test-css', name: 'Test CSS' },
    { path: '/series/tech-insights/s2e1', name: 'Episode' },
    { path: '/audio-test', name: 'Audio Test' }
  ];

  console.log('=== TechFlix Diagnostic ===\n');

  for (const test of tests) {
    await new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: test.path,
        method: 'GET'
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          console.log(`${test.name} (${test.path}):`);
          console.log(`  Status: ${res.statusCode}`);
          console.log(`  Size: ${data.length} bytes`);
          
          // Check for React app
          if (data.includes('id="root"')) {
            const hasContent = data.includes('TechFlix') && data.length > 600;
            console.log(`  React: ${hasContent ? '✓ Rendered' : '✗ Not rendered (empty root)'}`);
          }
          
          // Check for errors
          if (data.includes('Error') || data.includes('error')) {
            const errorMatch = data.match(/[Ee]rror[^<]*/);
            if (errorMatch) {
              console.log(`  Error: ${errorMatch[0].substring(0, 50)}...`);
            }
          }
          
          console.log('');
          resolve();
        });
      });

      req.on('error', (e) => {
        console.log(`${test.name}: Connection error - ${e.message}\n`);
        resolve();
      });

      req.end();
    });
  }

  // Check specific resources
  console.log('=== Resource Check ===\n');
  
  const resources = [
    '/src/main.jsx',
    '/src/index.css',
    '/src/App.jsx'
  ];

  for (const resource of resources) {
    await new Promise((resolve) => {
      http.get(`http://localhost:3000${resource}`, (res) => {
        console.log(`${resource}: ${res.statusCode} (${res.headers['content-type'] || 'unknown'})`);
        resolve();
      }).on('error', () => {
        console.log(`${resource}: Failed to load`);
        resolve();
      });
    });
  }
}

diagnose().catch(console.error);