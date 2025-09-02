#!/bin/bash

# Complete Railway Deployment Script for Adon
# Optimized build process for Railway deployment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌾 Adonai Farm - Railway Deployment (Optimized)${NC}"
echo "=================================================="

# Function to check command success
check_command() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1 successful${NC}"
    else
        echo -e "${RED}❌ $1 failed${NC}"
        exit 1
    fi
}

# Validate environment
echo -e "${YELLOW}🔍 Validating environment...${NC}"
if [ -f "backend/scripts/validate_env.js" ]; then
    node backend/scripts/validate_env.js
    check_command "Environment validation"
else
    echo -e "${YELLOW}⚠️  Environment validation script not found, continuing...${NC}"
fi

# Check Railway CLI
echo -e "${YELLOW}🔧 Checking Railway CLI...${NC}"
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}Installing Railway CLI...${NC}"
    npm install -g @railway/cli
    check_command "Railway CLI installation"
fi

# Check authentication
echo -e "${YELLOW}🔐 Checking Railway authentication...${NC}"
if ! railway whoami &> /dev/null; then
    echo -e "${RED}❌ Not logged in to Railway${NC}"
    echo -e "${YELLOW}Please run: railway login${NC}"
    exit 1
fi

USER=$(railway whoami 2>/dev/null)
echo -e "${GREEN}✅ Logged in as: $USER${NC}"

# Prepare git repository
echo -e "${YELLOW}📦 Preparing repository...${NC}"
git add .
if git diff --staged --quiet; then
    echo -e "${YELLOW}No changes to commit${NC}"
else
    read -p "📝 Enter commit message (or press Enter for default): " commit_msg
    if [ -z "$commit_msg" ]; then
        commit_msg="Railway deployment optimization - $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    git commit -m "$commit_msg"
    check_command "Git commit"
fi

echo -e "${YELLOW}🚀 Pushing to repository...${NC}"
git push
check_command "Git push"

# Check Railway project
echo -e "${YELLOW}🚂 Checking Railway project...${NC}"
if railway status >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Railway project found${NC}"
    railway status
else
    echo -e "${YELLOW}Creating Railway project...${NC}"
    railway init
    check_command "Railway project initialization"
fi

# Deploy to Railway
echo -e "${YELLOW}🚀 Deploying to Railway...${NC}"
railway up --detach
check_command "Railway deployment"

echo ""
echo -e "${GREEN}🎉 Deployment initiated successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Monitor deployment: railway logs"
echo "2. Check status: railway status"
echo "3. Open dashboard: https://railway.app/dashboard"
echo ""
echo -e "${YELLOW}🔧 Required Environment Variables:${NC}"
echo "   JWT_SECRET=your_secure_secret_here"
echo "   DATABASE_URL=postgresql://... (auto-provided by Railway)"
echo "   FRONTEND_URL=https://your-frontend-domain.railway.app"
echo ""
echo -e "${GREEN}🌐 Your app will be available at the Railway-provided URL${NC}"
echo -e "${BLUE}📖 For troubleshooting, check: railway logs${NC}"