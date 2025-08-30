#!/bin/bash

# 🚂 Railway Deployment Script for Adonai Farm Management System
# This script prepares and deploys your app to Railway

echo "🌾 Adonai Farm - Railway Deployment Script"
echo "=========================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
    echo "✅ Railway CLI installed"
fi

# Check if user is logged in
echo "🔐 Checking Railway authentication..."
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway. Please login:"
    railway login
fi

echo "✅ Railway authentication confirmed"

# Prepare the project
echo "📦 Preparing project for deployment..."

# Ensure all changes are committed
git add .
git status

read -p "📝 Enter commit message (or press Enter for default): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Deploy to Railway with Postgres integration"
fi

git commit -m "$commit_msg"
git push origin main

echo "✅ Code pushed to repository"

# Initialize Railway project (if not already done)
echo "🚂 Initializing Railway project..."
if [ ! -f ".railway" ]; then
    railway init
else
    echo "✅ Railway project already initialized"
fi

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

echo ""
echo "🎉 Deployment initiated!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to https://railway.app/dashboard"
echo "2. Configure your custom domain: adonaifarm.co.ke"
echo "3. Set environment variables:"
echo "   - DATABASE_URL (your Neon Postgres URL)"
echo "   - JWT_SECRET=adonai_farm_super_secure_secret_2024_production"
echo "4. Update DNS records for your domain"
echo ""
echo "🌐 Your app will be available at:"
echo "   - Railway URL: [check Railway dashboard]"
echo "   - Custom domain: https://adonaifarm.co.ke (after DNS setup)"
echo ""
echo "🔑 Login credentials:"
echo "   Username: admin"
echo "   Password: adonai123"
echo ""
echo "📖 For detailed instructions, see: RAILWAY_DEPLOYMENT_GUIDE.md"