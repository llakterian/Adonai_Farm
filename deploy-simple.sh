#!/bin/bash

# 🚂 Simple Railway Deployment Script - Handles CLI issues gracefully
# This script provides fallback options when Railway CLI has issues

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🌾 Adonai Farm - Railway Deployment${NC}"
echo "=================================="

# Check if already logged in
echo -e "${YELLOW}Checking Railway login status...${NC}"
if npx @railway/cli whoami >/dev/null 2>&1; then
    USER=$(npx @railway/cli whoami 2>/dev/null)
    echo -e "${GREEN}✅ Logged in as: $USER${NC}"
else
    echo -e "${RED}❌ Not logged in to Railway${NC}"
    echo -e "${YELLOW}Please run: npx @railway/cli login --browserless${NC}"
    exit 1
fi

# Check git status
echo -e "${YELLOW}Checking git status...${NC}"
if git status --porcelain | grep -q .; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
    echo -e "${BLUE}Committing changes...${NC}"
    
    git add .
    git commit -m "Deploy to Railway - $(date '+%Y-%m-%d %H:%M:%S')"
    
    echo -e "${BLUE}Pushing to GitHub...${NC}"
    if git push origin main; then
        echo -e "${GREEN}✅ Code pushed to GitHub${NC}"
    else
        echo -e "${RED}❌ Failed to push to GitHub${NC}"
        echo -e "${YELLOW}Please check your GitHub authentication${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Git repository is clean${NC}"
fi

# Check Railway project
echo -e "${YELLOW}Checking Railway project...${NC}"
if npx @railway/cli status >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Railway project found${NC}"
    npx @railway/cli status
else
    echo -e "${RED}❌ No Railway project found${NC}"
    echo -e "${YELLOW}Creating Railway project...${NC}"
    echo "Adonai Farm" | npx @railway/cli init
fi

echo ""
echo -e "${BLUE}🚀 Deployment Options:${NC}"
echo "1. Deploy via Railway Dashboard (Recommended)"
echo "2. Try CLI deployment"
echo "3. Show manual setup instructions"

read -p "Choose option (1-3): " choice

case $choice in
    1)
        echo -e "${GREEN}📱 Opening Railway Dashboard...${NC}"
        echo ""
        echo -e "${YELLOW}Manual Steps:${NC}"
        echo "1. Go to: https://railway.app/dashboard"
        echo "2. Find your 'Adonai Farm' project"
        echo "3. Click '+ New' → 'GitHub Repo'"
        echo "4. Select: llakterian/Adonai_Farm"
        echo "5. Add environment variables:"
        echo "   DATABASE_URL=postgresql://neondb_owner:npg_Mx84qTlYGiSB@ep-little-brook-ab90jz5e-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
        echo "   JWT_SECRET=adonai_farm_super_secure_secret_2024_production"
        echo "   NODE_ENV=production"
        echo ""
        echo -e "${GREEN}🌐 Your app will be live at: https://[service-name].up.railway.app${NC}"
        ;;
    2)
        echo -e "${YELLOW}Attempting CLI deployment...${NC}"
        if npx @railway/cli up; then
            echo -e "${GREEN}✅ CLI deployment successful!${NC}"
        else
            echo -e "${RED}❌ CLI deployment failed${NC}"
            echo -e "${YELLOW}Please use Railway Dashboard (Option 1)${NC}"
        fi
        ;;
    3)
        echo -e "${BLUE}📋 Manual Setup Instructions:${NC}"
        echo ""
        echo "1. Railway Dashboard: https://railway.app/dashboard"
        echo "2. GitHub Repository: https://github.com/llakterian/Adonai_Farm"
        echo "3. Project ID: f2fc4c2a-54e1-4e2c-b400-94ce8478b36d"
        echo ""
        echo "Environment Variables to set:"
        echo "DATABASE_URL=postgresql://neondb_owner:npg_Mx84qTlYGiSB@ep-little-brook-ab90jz5e-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
        echo "JWT_SECRET=adonai_farm_super_secure_secret_2024_production"
        echo "NODE_ENV=production"
        echo "PORT=4000"
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Deployment process completed!${NC}"
echo -e "${BLUE}📖 For detailed instructions, see: RAILWAY_DEPLOYMENT_GUIDE.md${NC}"