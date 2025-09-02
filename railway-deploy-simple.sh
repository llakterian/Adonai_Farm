#!/bin/bash

# Simple Railway Deployment Script
# Handles network issues and retries

echo "🚂 Railway Simple Deployment"
echo "============================"

# Function to retry railway up with backoff
deploy_with_retry() {
    local max_attempts=3
    local attempt=1
    local delay=5
    
    while [ $attempt -le $max_attempts ]; do
        echo "🚀 Deployment attempt $attempt of $max_attempts..."
        
        if railway up; then
            echo "✅ Deployment successful!"
            return 0
        else
            echo "❌ Deployment attempt $attempt failed"
            
            if [ $attempt -lt $max_attempts ]; then
                echo "⏳ Waiting ${delay} seconds before retry..."
                sleep $delay
                delay=$((delay * 2))  # Exponential backoff
            fi
        fi
        
        attempt=$((attempt + 1))
    done
    
    echo "❌ All deployment attempts failed"
    return 1
}

# Check authentication
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway. Please run: railway login --browserless"
    exit 1
fi

echo "✅ Authenticated as: $(railway whoami)"

# Check project connection
if ! railway status &> /dev/null; then
    echo "❌ Not connected to a project. Please run: railway link"
    exit 1
fi

echo "✅ Connected to Railway project"

# Show current status
echo "📊 Current project status:"
railway status

# Attempt deployment with retry logic
if deploy_with_retry; then
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Check status: railway status"
    echo "2. View logs: railway logs"
    echo "3. Get URL: railway url"
    echo "4. Open app: railway open"
else
    echo ""
    echo "❌ Deployment failed after multiple attempts"
    echo ""
    echo "🔧 Troubleshooting options:"
    echo "1. Check network connection"
    echo "2. Try again later (Railway servers might be busy)"
    echo "3. Use Railway dashboard: https://railway.app/dashboard"
    echo "4. Check Railway status: https://status.railway.app/"
fi