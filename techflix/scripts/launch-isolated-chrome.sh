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

echo "All Chrome instances launched with isolated profiles!"