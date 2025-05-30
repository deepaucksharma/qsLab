#!/bin/bash
# Simple Deployment Script

VERSION=${1:-latest}
ENVIRONMENT=${2:-production}

echo "🚀 Deploying Kafka Learning Lab"
echo "Version: $VERSION"
echo "Environment: $ENVIRONMENT"
echo

# Pre-deployment checks
echo "📋 Pre-deployment checks..."
if ! ./scripts/health-check.sh > /dev/null 2>&1; then
  echo "⚠️  Warning: Current system not healthy"
fi

# Backup current state
echo "💾 Creating backup..."
./scripts/collect-logs.sh

# Update configurations
echo "📝 Updating configurations..."
# Add any config updates here

# Restart services
echo "🔄 Restarting services..."
./scripts/lab-manager.sh restart

# Post-deployment validation
echo "✅ Validating deployment..."
sleep 10
if ./scripts/health-check.sh > /dev/null 2>&1; then
  echo "✅ Deployment successful!"
else
  echo "❌ Deployment validation failed"
  echo "Run './scripts/lab-manager.sh logs' to investigate"
  exit 1
fi

echo
echo "Deployment complete!"
