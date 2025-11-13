#!/bin/bash

set -e  # Exit on any error

echo "========================================="
echo "   Updating SRE Full-Stack Project"
echo "========================================="
echo ""

# Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

echo ""
echo "🛑 Stopping running containers..."
docker-compose down

echo ""
echo "🔨 Rebuilding Docker images..."
docker-compose build

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 20

echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ Update complete!"
echo ""
echo "🌐 Application is ready at http://localhost"

