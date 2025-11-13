#!/bin/bash

set -e  # Exit on any error

echo "========================================="
echo "   SRE Full-Stack Project Deployment"
echo "========================================="
echo ""

# Configuration
REPO_URL="https://github.com/itamar-glitch/Itamar-fullstack-project.git"
PROJECT_DIR="Itamar-fullstack-project"

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Clone or pull the repository
if [ -d "$PROJECT_DIR" ]; then
    echo "📁 Project directory exists. Pulling latest changes..."
    cd "$PROJECT_DIR"
    git pull origin main
else
    echo "📥 Cloning repository..."
    git clone "$REPO_URL"
    cd "$PROJECT_DIR"
fi

echo ""
echo "✅ Repository ready"
echo ""

# Stop existing containers (if any)
echo "🛑 Stopping existing containers (if any)..."
docker-compose down 2>/dev/null || true

echo ""
echo "🔨 Building Docker images..."
docker-compose build

echo ""
echo "🚀 Starting all services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to initialize (30 seconds)..."
sleep 30

echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "========================================="
echo "   ✅ Deployment Complete!"
echo "========================================="
echo ""
echo "🌐 Application URLs:"
echo "   - Web Interface: http://localhost"
echo "   - API Health:    http://localhost:3000/api/health"
echo "   - TiCDC Status:  http://localhost:8300/api/v1/status"
echo ""
echo "🔑 Default Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "📋 Useful Commands:"
echo "   - View all logs:     docker-compose logs -f"
echo "   - View API logs:     docker-compose logs -f api"
echo "   - View CDC logs:     docker-compose logs -f cdc-consumer"
echo "   - Stop services:     docker-compose down"
echo "   - Restart services:  docker-compose restart"
echo ""
echo "🎉 Application is ready!"

