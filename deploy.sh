#!/bin/bash

set -e  # Exit on any error

echo "========================================="
echo "   SRE Full-Stack Project Deployment"
echo "========================================="
echo ""

# Configuration
REPO_URL="https://github.com/itamar-glitch/Itamar-fullstack-project.git"
PROJECT_DIR="Itamar-fullstack-project"

# Check prerequisites and install if needed
echo "🔍 Checking prerequisites..."
echo ""

# Check if running as root or with sudo
if [[ $EUID -ne 0 ]]; then
   echo "⚠️  This script may require sudo privileges for installation."
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed."
    echo "📦 Installing Docker..."
    
    # Detect OS
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
    else
        echo "❌ Cannot detect OS. Please install Docker manually."
        exit 1
    fi
    
    case $OS in
        ubuntu|debian)
            sudo apt-get update
            sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
            curl -fsSL https://download.docker.com/linux/$OS/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/$OS $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
            sudo apt-get update
            sudo apt-get install -y docker-ce docker-ce-cli containerd.io
            sudo systemctl start docker
            sudo systemctl enable docker
            sudo usermod -aG docker $USER
            echo "✅ Docker installed successfully"
            ;;
        centos|rhel|fedora)
            sudo yum install -y yum-utils
            sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            sudo yum install -y docker-ce docker-ce-cli containerd.io
            sudo systemctl start docker
            sudo systemctl enable docker
            sudo usermod -aG docker $USER
            echo "✅ Docker installed successfully"
            ;;
        *)
            echo "❌ Unsupported OS: $OS"
            echo "Please install Docker manually: https://docs.docker.com/get-docker/"
            exit 1
            ;;
    esac
else
    echo "✅ Docker is already installed ($(docker --version))"
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed."
    echo "📦 Installing Docker Compose..."
    
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed successfully"
else
    echo "✅ Docker Compose is already installed ($(docker-compose --version))"
fi

# Check Git
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed."
    echo "📦 Installing Git..."
    
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
    fi
    
    case $OS in
        ubuntu|debian)
            sudo apt-get update && sudo apt-get install -y git
            ;;
        centos|rhel|fedora)
            sudo yum install -y git
            ;;
        *)
            echo "❌ Please install Git manually"
            exit 1
            ;;
    esac
    echo "✅ Git installed successfully"
else
    echo "✅ Git is already installed ($(git --version))"
fi

echo ""
echo "✅ All prerequisites are installed"
echo ""

# Clone or pull the repository
if [ -d "$PROJECT_DIR" ]; then
    echo "📁 Project directory exists. Pulling latest changes..."
    cd "$PROJECT_DIR"
    git pull origin main || echo "⚠️  Could not pull. Continuing with existing code..."
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
echo "   - Frontend:           http://localhost"
echo "   - Monitoring Dashboard: http://localhost/monitoring/"
echo "   - API Health:         http://localhost:3000/api/health"
echo "   - TiCDC Status:       http://localhost:8300/api/v1/status"
echo ""
echo "🔑 Default Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "📋 View Logs:"
echo "   - All logs:          docker-compose logs -f"
echo "   - API logs:          docker-compose logs -f api"
echo "   - CDC Consumer:      docker-compose logs -f cdc-consumer"
echo "   - TiDB CDC:          docker-compose logs -f ticdc"
echo ""
echo "🎯 Where to Find Required Features:"
echo "   - User Activity Logs:    docker-compose logs api | grep 'LOGIN_SUCCESS'"
echo "   - Database CDC Logs:     docker-compose logs cdc-consumer"
echo "   - Live CDC Dashboard:    http://localhost/monitoring/ (admin/admin123)"
echo ""
echo "⚙️  Useful Commands:"
echo "   - Stop services:     docker-compose down"
echo "   - Restart services:  docker-compose restart"
echo "   - View containers:   docker-compose ps"
echo ""
echo "🎉 Application is ready!"
echo ""
