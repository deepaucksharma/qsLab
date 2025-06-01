const express = require('express');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = 8081;

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Get WSL IP
exec('hostname -I', (error, stdout) => {
  const wslIp = stdout.trim().split(' ')[0];
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log('\n🚀 TechFlix Server Running!\n');
    console.log('Access from Windows browser at:');
    console.log(`  http://localhost:${PORT}`);
    console.log(`  http://127.0.0.1:${PORT}`);
    console.log(`  http://${wslIp}:${PORT}`);
    console.log('\nIf localhost doesn\'t work, try:');
    console.log('1. Use the WSL IP address directly');
    console.log('2. Run the PowerShell script (run-wsl.ps1) as Administrator on Windows');
    console.log('3. Or use: npx localtunnel --port 8081\n');
    console.log('Press Ctrl+C to stop the server\n');
  });
});