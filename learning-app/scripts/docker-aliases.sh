#!/bin/bash
# Docker aliases for WSL when Docker Desktop integration is not enabled

alias docker='docker.exe'
alias docker-compose='docker-compose.exe'

# Export for use in scripts
export DOCKER_CMD="docker.exe"
export DOCKER_COMPOSE_CMD="docker-compose.exe"