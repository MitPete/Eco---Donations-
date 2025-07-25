#!/bin/bash

# Eco Donations Platform - Vercel Deployment Script
# Deploys frontend + serverless API to Vercel for free hosting

set -e

echo "🌱 Eco Donations - Deploying to Vercel"
echo "=================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Navigate to project root
cd "$(dirname "$0")"

echo "🔧 Preparing deployment..."

# Ensure frontend has necessary build script
if [ ! -f "frontend/package.json" ]; then
    echo "❌ Frontend package.json not found"
    exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Check if this is first deployment
if [ ! -f ".vercel/project.json" ]; then
    echo "🚀 First time deployment - configuring Vercel..."
    echo ""
    echo "Please follow the prompts:"
    echo "- Set up and deploy? Y"
    echo "- Which scope? (select your account)"
    echo "- Link to existing project? N"
    echo "- Project name: eco-donations-beta"
    echo "- Directory: ./"
    echo ""
    vercel
else
    echo "🚀 Deploying to production..."
    vercel --prod
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Your Eco Donations platform is now live at:"
echo "🔗 Production: $(vercel --prod --confirm 2>/dev/null | grep 'https://' | head -1 || echo 'Check Vercel dashboard for URL')"
echo ""
echo "📊 API Endpoints:"
echo "   /api/feedback - Beta feedback collection"
echo "   /api/health - System health check"
echo ""
echo "🧪 Beta Testing Features:"
echo "   - Floating feedback widget on all pages"
echo "   - Real-time feedback collection"
echo "   - User experience tracking"
echo ""
echo "Next steps:"
echo "1. Share the URL with beta testers"
echo "2. Monitor feedback via /api/feedback"
echo "3. Iterate based on user feedback"
echo "4. Update checklist progress"
