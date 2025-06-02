# Parallel Testing Environment Setup Guide

**Version:** 2.0  
**Last Updated:** 2025-02-06

This guide explains how to run multiple instances of TechFlix on the same machine for parallel testing and development. This enables multiple testers or automated agents to work simultaneously without conflicts.

**Important:** TechFlix project structure has been reorganized:
- Configuration files are now in `config/` directory
- Scripts are in `scripts/` directory  
- Server files are in `server/` directory
- All paths in this guide reflect the new structure

## Overview

Running parallel instances requires:
1. Different ports for each instance
2. Isolated browser profiles/sessions
3. Separate localStorage/sessionStorage
4. Independent debug modes
5. Non-conflicting test data

## Method 1: Multiple Port Configuration

### Setup Instructions

1. **Create Port-Specific Launch Scripts**

```bash
# Create scripts/parallel-instances.sh in the techflix directory
#!/bin/bash

# Navigate to project root
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR/.."

# Instance 1 - Primary Testing (Port 3001)
echo "Starting Instance 1 on port 3001..."
PORT=3001 npm run dev &
PID1=$!

# Instance 2 - Visual Testing (Port 3002)  
echo "Starting Instance 2 on port 3002..."
PORT=3002 npm run dev &
PID2=$!

# Instance 3 - Integration Testing (Port 3003)
echo "Starting Instance 3 on port 3003..."
PORT=3003 npm run dev &
PID3=$!

# Instance 4 - Exploratory Testing (Port 3004)
echo "Starting Instance 4 on port 3004..."
PORT=3004 npm run dev &
PID4=$!

echo "All instances started!"
echo "Instance 1: http://localhost:3001 (PID: $PID1)"
echo "Instance 2: http://localhost:3002 (PID: $PID2)"
echo "Instance 3: http://localhost:3003 (PID: $PID3)"
echo "Instance 4: http://localhost:3004 (PID: $PID4)"

# Save PIDs for cleanup
echo $PID1 > .parallel-pids
echo $PID2 >> .parallel-pids
echo $PID3 >> .parallel-pids
echo $PID4 >> .parallel-pids

# Wait for all processes
wait
```

2. **Make the script executable**
```bash
# From the techflix directory
chmod +x scripts/parallel-instances.sh
```

3. **Update package.json for parallel testing**
```json
{
  "scripts": {
    "dev": "vite --config config/vite.config.js",
    "test:parallel": "./scripts/parallel-instances.sh",
    "test:instance1": "PORT=3001 npm run dev",
    "test:instance2": "PORT=3002 npm run dev",
    "test:instance3": "PORT=3003 npm run dev",
    "test:instance4": "PORT=3004 npm run dev",
    "test:kill-parallel": "[ -f .parallel-pids ] && kill $(cat .parallel-pids) && rm .parallel-pids || echo 'No parallel instances running'"
  }
}
```

## Method 2: Docker Containers (Recommended for Isolation)

### Docker Setup

1. **Create Dockerfile.testing**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy all application files including config directory
COPY . .

# Expose port (will be mapped differently for each container)
EXPOSE 3000

# Start the dev server with config path
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

2. **Create docker-compose.testing.yml**
```yaml
version: '3.8'

services:
  techflix-test1:
    build:
      context: .
      dockerfile: Dockerfile.testing
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=test
      - TEST_INSTANCE=1
    volumes:
      - ./src:/app/src
      - ./public:/app/public
      - ./config:/app/config
      - ./scripts:/app/scripts
      - ./server:/app/server

  techflix-test2:
    build:
      context: .
      dockerfile: Dockerfile.testing
    ports:
      - "3002:3000"
    environment:
      - NODE_ENV=test
      - TEST_INSTANCE=2
    volumes:
      - ./src:/app/src
      - ./public:/app/public
      - ./config:/app/config
      - ./scripts:/app/scripts
      - ./server:/app/server

  techflix-test3:
    build:
      context: .
      dockerfile: Dockerfile.testing
    ports:
      - "3003:3000"
    environment:
      - NODE_ENV=test
      - TEST_INSTANCE=3
    volumes:
      - ./src:/app/src
      - ./public:/app/public
      - ./config:/app/config
      - ./scripts:/app/scripts
      - ./server:/app/server

  techflix-test4:
    build:
      context: .
      dockerfile: Dockerfile.testing
    ports:
      - "3004:3000"
    environment:
      - NODE_ENV=test
      - TEST_INSTANCE=4
    volumes:
      - ./src:/app/src
      - ./public:/app/public
      - ./config:/app/config
      - ./scripts:/app/scripts
      - ./server:/app/server
```

3. **Launch all containers**
```bash
docker-compose -f docker-compose.testing.yml up
```

## Method 3: Browser Profile Isolation

### Chrome Profile Setup

1. **Create testing profiles**
```bash
# Create directories for Chrome profiles (from techflix directory)
mkdir -p test-profiles/tester1
mkdir -p test-profiles/tester2
mkdir -p test-profiles/tester3
mkdir -p test-profiles/tester4

# Or in the parent testing directory
mkdir -p ../testing/chrome-profiles/tester1
mkdir -p ../testing/chrome-profiles/tester2
mkdir -p ../testing/chrome-profiles/tester3
mkdir -p ../testing/chrome-profiles/tester4
```

2. **Launch script with isolated profiles**
```bash
# scripts/launch-isolated-chrome.sh

#!/bin/bash
# Get script directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR/.."

# Tester 1 - Functional Testing
google-chrome \
  --user-data-dir=./test-profiles/tester1 \
  --new-window \
  http://localhost:3001 &

# Tester 2 - Visual Testing  
google-chrome \
  --user-data-dir=./test-profiles/tester2 \
  --new-window \
  http://localhost:3002 &

# Tester 3 - Integration Testing
google-chrome \
  --user-data-dir=./test-profiles/tester3 \
  --new-window \
  http://localhost:3003 &

# Tester 4 - Exploratory Testing
google-chrome \
  --user-data-dir=./test-profiles/tester4 \
  --new-window \
  http://localhost:3004 &
```

## Method 4: PM2 Process Manager

### PM2 Configuration

1. **Install PM2**
```bash
npm install -g pm2
```

2. **Create config/ecosystem.config.js**
```javascript
// config/ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'techflix-test-1',
      script: 'npm',
      args: 'run dev',
      cwd: './',
      env: {
        PORT: 3001,
        NODE_ENV: 'test',
        TEST_INSTANCE: '1'
      }
    },
    {
      name: 'techflix-test-2',
      script: 'npm',
      args: 'run dev',
      cwd: './',
      env: {
        PORT: 3002,
        NODE_ENV: 'test',
        TEST_INSTANCE: '2'
      }
    },
    {
      name: 'techflix-test-3',
      script: 'npm',
      args: 'run dev',
      cwd: './',
      env: {
        PORT: 3003,
        NODE_ENV: 'test',
        TEST_INSTANCE: '3'
      }
    },
    {
      name: 'techflix-test-4',
      script: 'npm',
      args: 'run dev',
      cwd: './',
      env: {
        PORT: 3004,
        NODE_ENV: 'test',
        TEST_INSTANCE: '4'
      }
    }
  ]
};
```

3. **Start all instances**
```bash
# From techflix directory
pm2 start config/ecosystem.config.js
pm2 status  # View all running instances
pm2 logs    # View logs from all instances
pm2 stop all  # Stop all instances
```

## Test Instance Allocation

### Recommended Port Assignments

| Port | Testing Focus | Tester/Agent |
|------|--------------|--------------|
| 3001 | Functional Testing | Manual Tester 1 / Automation Suite 1 |
| 3002 | Visual/Design Testing | Manual Tester 2 / Visual Regression |
| 3003 | Integration Testing | Manual Tester 3 / API Testing |
| 3004 | Exploratory Testing | Manual Tester 4 / Chaos Testing |
| 3005 | Performance Testing | Load Testing Tools |
| 3006 | Accessibility Testing | Screen Reader Testing |
| 3007 | Debug/Development | Developer Instance |
| 3008 | Demo/Stakeholder Review | Clean Instance |

## Storage Isolation

### LocalStorage Namespace

Add instance-specific storage keys:

```javascript
// In your app configuration
const TEST_INSTANCE = process.env.TEST_INSTANCE || '0';
const STORAGE_PREFIX = `techflix_test${TEST_INSTANCE}_`;

// Use prefixed keys
localStorage.setItem(`${STORAGE_PREFIX}userProgress`, data);
```

## Monitoring Multiple Instances

### Simple Monitoring Dashboard

Create `scripts/monitor.html` (or `../testing/monitor.html`):

```html
<!DOCTYPE html>
<html>
<head>
    <title>TechFlix Test Instance Monitor</title>
    <style>
        .instance { 
            display: inline-block; 
            margin: 10px; 
            padding: 20px; 
            border: 1px solid #ccc;
            border-radius: 5px;
        }
        .online { background: #d4edda; }
        .offline { background: #f8d7da; }
    </style>
</head>
<body>
    <h1>TechFlix Test Instances</h1>
    <div id="instances"></div>
    
    <script>
        const instances = [
            { port: 3001, name: 'Functional Testing' },
            { port: 3002, name: 'Visual Testing' },
            { port: 3003, name: 'Integration Testing' },
            { port: 3004, name: 'Exploratory Testing' }
        ];

        async function checkInstance(port) {
            try {
                const response = await fetch(`http://localhost:${port}/`, { 
                    mode: 'no-cors',
                    cache: 'no-cache' 
                });
                return true;
            } catch {
                return false;
            }
        }

        async function updateStatus() {
            const container = document.getElementById('instances');
            container.innerHTML = '';
            
            for (const instance of instances) {
                const isOnline = await checkInstance(instance.port);
                const div = document.createElement('div');
                div.className = `instance ${isOnline ? 'online' : 'offline'}`;
                div.innerHTML = `
                    <h3>${instance.name}</h3>
                    <p>Port: ${instance.port}</p>
                    <p>Status: ${isOnline ? 'Online' : 'Offline'}</p>
                    ${isOnline ? `<a href="http://localhost:${instance.port}" target="_blank">Open</a>` : ''}
                `;
                container.appendChild(div);
            }
        }

        updateStatus();
        setInterval(updateStatus, 5000);
    </script>
</body>
</html>
```

## Quick Start Commands

```bash
# From techflix directory:

# Start all test instances (using PM2)
pm2 start config/ecosystem.config.js

# Start specific instance
npm run test:instance1

# Start all with Docker
docker-compose -f docker-compose.testing.yml up

# Start with basic script
./scripts/parallel-instances.sh

# Open monitoring dashboard
open scripts/monitor.html  # or ../testing/monitor.html

# Stop all PM2 instances
pm2 stop all

# Kill parallel instances started by script
npm run test:kill-parallel

# Stop all Docker containers
docker-compose -f docker-compose.testing.yml down
```

## Best Practices

1. **Resource Management**
   - Monitor CPU/Memory usage
   - Limit concurrent instances based on machine capacity
   - Use Docker for better resource isolation

2. **Data Isolation**
   - Use different localStorage prefixes
   - Clear data between test runs
   - Don't share test accounts/data

3. **Port Management**
   - Document port assignments
   - Use consistent port ranges
   - Check for port conflicts before starting

4. **Debugging**
   - Each instance can have its own debug mode
   - Use different log files per instance
   - Include instance ID in error reports

5. **Coordination**
   - Use a shared test management tool
   - Assign specific test areas per instance
   - Avoid testing same features simultaneously

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Performance Issues
- Reduce number of concurrent instances
- Use Docker with resource limits
- Disable unnecessary features per instance

### Storage Conflicts
- Clear browser data between tests
- Use incognito/private windows
- Implement instance-specific storage keys

## Updated Project Structure Notes

```
techflix/
├── config/              # Configuration files
│   ├── vite.config.js   # Vite configuration
│   ├── vitest.config.js # Test configuration
│   └── ecosystem.config.js # PM2 configuration
├── scripts/             # All scripts
│   ├── parallel-instances.sh
│   ├── launch-isolated-chrome.sh
│   └── monitor.html
├── server/              # Server files
│   └── server.js
├── test-profiles/       # Chrome test profiles
│   ├── tester1/
│   ├── tester2/
│   ├── tester3/
│   └── tester4/
└── src/                 # Source code
```

All commands in this guide assume you're running from the `techflix/` directory.