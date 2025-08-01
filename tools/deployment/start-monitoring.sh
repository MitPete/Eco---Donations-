#!/bin/bash

# Eco Donations Production Monitoring Setup Script
# This script sets up and starts the production monitoring system

set -e

echo "🌱 Eco Donations - Production Monitoring Setup"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Navigate to monitoring directory
cd "$(dirname "$0")/monitoring"

# Install dependencies
echo ""
echo "📦 Installing monitoring dependencies..."
npm install

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo ""
    echo "⚙️  Creating environment configuration..."
    cp .env.example .env
    echo "📝 Please edit monitoring/.env with your configuration:"
    echo "   - WEB3_PROVIDER_URL (Infura/Alchemy endpoint)"
    echo "   - Contract addresses"
    echo "   - Wallet addresses to monitor"
    echo "   - Notification settings"
    echo ""
    echo "🔐 Default dashboard credentials:"
    echo "   Username: admin"
    echo "   Password: (set DASHBOARD_PASSWORD in .env)"
    echo ""
    read -p "Press Enter to open .env file for editing..."

    # Try to open .env in default editor
    if command -v code &> /dev/null; then
        code .env
    elif command -v nano &> /dev/null; then
        nano .env
    elif command -v vim &> /dev/null; then
        vim .env
    else
        echo "Please edit monitoring/.env manually"
    fi

    echo ""
    read -p "Have you configured the .env file? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Please configure the .env file and run this script again."
        exit 1
    fi
fi

# Create metrics directory
mkdir -p ../metrics
echo "✅ Created metrics directory"

# Start monitoring system
echo ""
echo "🚀 Starting Production Monitoring System..."
echo ""
echo "Dashboard will be available at:"
echo "   🔍 http://localhost:3002/dashboard"
echo "   📊 http://localhost:3002/metrics"
echo "   💚 http://localhost:3002/health"
echo ""
echo "Press Ctrl+C to stop monitoring"
echo ""

# Check if port is already in use
if lsof -Pi :3002 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3002 is already in use. Stopping existing process..."
    kill $(lsof -t -i:3002) 2>/dev/null || true
    sleep 2
fi

# Start the monitoring server
npm start
