#!/bin/bash

# Railway Setup and Deployment Script
# This script helps set up Railway CLI and deploy the Adonai Farm Management System

set -e

echo "🚂 Railway Setup and Deployment"
echo "================================"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    
    # Install Railway CLI
    if command -v npm &> /dev/null; then
        npm install -g @railway/cli
    elif command -v curl &> /dev/null; then
        curl -fsSL https://railway.app/install.sh | sh
    else
        echo "❌ Please install Railway CLI manually: https://docs.railway.app/develop/cli"
        exit 1
    fi
    
    echo "✅ Railway CLI installed"
fi

# Check if logged in
echo "🔐 Checking Railway authentication..."
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway"
    echo "🔑 Please log in to Railway..."
    
    # Try browserless login first (better for headless environments)
    echo "🌐 Attempting browserless login..."
    if ! railway login --browserless; then
        echo "⚠️  Browserless login failed, trying regular login..."
        railway login
    fi
    
    # Wait for login to complete
    echo "⏳ Waiting for authentication..."
    sleep 3
    
    # Verify login
    if ! railway whoami &> /dev/null; then
        echo "❌ Railway login failed. Please try manual login:"
        echo "   railway login --browserless"
        echo "   Then run this script again."
        exit 1
    fi
fi

echo "✅ Railway authentication successful"
echo "👤 Logged in as: $(railway whoami)"

# Check project connection
echo "🔗 Checking project connection..."
if ! railway status &> /dev/null; then
    echo "❌ Not connected to a Railway project"
    echo "🔗 Linking to project..."
    railway link
fi

echo "✅ Connected to Railway project"

# Validate environment
echo "🔍 Validating environment..."
npm run validate:env

# Run the deployment
echo "🚀 Starting deployment..."
./railway-deploy-complete.sh

echo ""
echo "🎉 Deployment process completed!"
echo ""
echo "📋 Next steps:"
echo "1. Check deployment status: railway status"
echo "2. View logs: railway logs"
echo "3. Open your app: railway open"
echo "4. Test the health endpoint: curl \$(railway url)/api/health"