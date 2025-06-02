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