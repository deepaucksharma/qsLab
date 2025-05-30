# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Recent Updates (January 2025)

- **Week 2 Content Complete**: Full Builder track with tombstone monitoring, Flex integrations, and custom OHI development
- **Technical Extension App**: New technical-app.html for Q&S lab extensions
- **DevOps Scripts**: Infrastructure automation with devops-quickstart.sh and setup-simple-infra.sh
- **Week 1 Quiz System**: Interactive assessment with week1-quiz.js
- **Implementation Plans**: IMPLEMENTATION_PLAN.md (4 tracks) and TRACK3_EXECUTION_PLAN.md (detailed content roadmap)

## Project Overview

qsLab is a Kafka observability learning platform that teaches monitoring and observability using New Relic. It consists of an interactive web application with embedded terminals and Docker-based Kafka labs following a 5-week curriculum.

## Common Commands

### Terminal Server Development
```bash
# Start the terminal server (required for interactive terminals)
cd learning-app/server
npm install  # First time only
npm run dev  # Development with auto-reload
npm start    # Production mode
```

### Web Application
```bash
# Serve the learning app (from project root)
python3 -m http.server 8080
# Access at http://localhost:8080

# Technical Extension App
# Access at http://localhost:8080/learning-app/technical-app.html
```

### Lab Infrastructure
```bash
# Start Kafka cluster (example for Week 1)
cd learning-app/labs/week1-xray
docker-compose up -d

# Week 2 Builder lab
cd learning-app/labs/week2-builder
docker-compose up -d
./scripts/generate-tombstones.sh all  # Create tombstone scenarios
./scripts/test-integrations.sh        # Validate custom integrations

# Generate traffic for exercises
cd learning-app/scripts
./generate-traffic.sh all     # All traffic patterns
./generate-traffic.sh steady  # Steady traffic only
./generate-traffic.sh burst   # Burst traffic only
```

### Testing Commands
```bash
# Test terminal server connectivity
curl http://localhost:3001/health

# Test Docker integration
docker exec kafka-xray-broker kafka-broker-api-versions --bootstrap-server localhost:9092

# DevOps infrastructure quick start
./devops-quickstart.sh
./setup-simple-infra.sh
```

## Architecture

### Frontend (learning-app/)
- **app.js**: Main application logic, terminal management, progress tracking
- **terminal.js**: WebSocket terminal implementation
- **index.html**: Single-page application with 5-week curriculum
- **styles.css**: Design system and responsive layouts
- **technical-app.html/js**: Q&S extension lab implementation with module-based architecture
- **technical-styles.css**: Technical app styling with professional design system
- **week1-quiz.js**: Interactive assessment system with scoring and feedback

### Backend (learning-app/server/)
- **server.js**: Express server with WebSocket support for terminal execution
- **CommandExecutor.js**: Docker command execution with output streaming
- **SecurityManager.js**: Command validation and sandboxing

### Lab Infrastructure (learning-app/labs/)
- **week1-xray/**: X-Ray vision lab with JMX exploration and metric discovery
- **week2-builder/**: Custom metrics lab with tombstone monitoring and Flex/OHI development
  - Scripts: `generate-tombstones.sh`, `test-integrations.sh`
  - Custom integrations workspace
- Each week has its own `docker-compose.yml` with Kafka, Zookeeper, and monitoring
- Configurations in `learning-app/configs/` for New Relic integrations

## Key Technical Details

- **Terminal Integration**: Real-time Docker command execution via WebSockets
- **Progress Persistence**: LocalStorage API for saving user progress
- **Security Model**: Commands are validated against whitelist before execution
- **Docker Integration**: Uses dockerode library for container management
- **Monitoring Stack**: New Relic Infrastructure agent with nri-kafka integration

## Development Guidelines

- Terminal server must be running for interactive features to work
- Each week's lab has its own isolated Docker environment
- Progress is saved automatically in browser localStorage
- All Docker commands are executed in the context of the specific week's containers
- Use the generate-traffic.sh script to create realistic Kafka workloads for exercises

## Implementation Status

See IMPLEMENTATION_PLAN.md for the full 4-track development roadmap:
- **Track 1 (Frontend)**: Enhanced UI components and progress tracking
- **Track 2 (Backend)**: Terminal integration and multi-tenancy
- **Track 3 (Content)**: Week 2 complete, detailed execution plan in TRACK3_EXECUTION_PLAN.md
- **Track 4 (Infrastructure)**: DevOps scripts started (devops-quickstart.sh, setup-simple-infra.sh)

