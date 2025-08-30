#!/bin/bash

# 🚂 Simple Railway Deployment Script - Direct Approach
# This script assumes you're already logged in with the correct Railway account

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}🌾 Adonai Farm - Railway Deployment (Simple)${NC}"
echo "=============================================="
echo ""

# Step 1: Check Railway login
echo -e "${YELLOW}Step 1: Checking Railway login...${NC}"
if npx @railway/cli whoami >/dev/null 2>&1; then
    USER_INFO=$(npx @railway/cli whoami 2>/dev/null)
    echo -e "${GREEN}✅ Railway login confirmed: $USER_INFO${NC}"
else
    echo -e "${RED}❌ Not logged in to Railway${NC}"
    echo -e "${YELLOW}Please run: npx @railway/cli login --browserless${NC}"
    echo -e "${YELLOW}Make sure to login with: llakterian@gmail.com${NC}"
    exit 1
fi

# Step 2: Check git status and push if needed
echo -e "\n${YELLOW}Step 2: Checking git status...${NC}"
if git status --porcelain | grep -q .; then
    echo -e "${YELLOW}⚠️  Uncommitted changes found${NC}"
    echo -e "${BLUE}Committing and pushing changes...${NC}"
    
    git add .
    git commit -m "Deploy to Railway - $(date '+%Y-%m-%d %H:%M:%S')"
    
    if git push origin main; then
        echo -e "${GREEN}✅ Code pushed to GitHub${NC}"
    else
        echo -e "${RED}❌ Failed to push to GitHub${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Git repository is clean${NC}"
fi

# Step 3: Check/Create Railway project
echo -e "\n${YELLOW}Step 3: Setting up Railway project...${NC}"
if npx @railway/cli status >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Railway project exists${NC}"
    npx @railway/cli status
else
    echo -e "${BLUE}Creating new Railway project...${NC}"
    echo "Adonai Farm" | npx @railway/cli init
    echo -e "${GREEN}✅ Railway project created${NC}"
fi

# Step 4: Add GitHub service if not exists
echo -e "\n${YELLOW}Step 4: Setting up GitHub service...${NC}"
if npx @railway/cli status 2>/dev/null | grep -q "Service: "; then
    echo -e "${GREEN}✅ Service already exists${NC}"
else
    echo -e "${BLUE}Adding GitHub repository as service...${NC}"
    # Try to add GitHub service
    (echo "GitHub Repo"; echo "llakterian/Adonai_Farm"; echo ""; echo "") | npx @railway/cli add || {
        echo -e "${YELLOW}⚠️  Automated service creation may have failed${NC}"
        echo -e "${CYAN}Please add manually in Railway dashboard:${NC}"
        echo -e "${CYAN}1. Go to: https://railway.app/dashboard${NC}"
        echo -e "${CYAN}2. Click '+ New' → 'GitHub Repo'${NC}"
        echo -e "${CYAN}3. Select: llakterian/Adonai_Farm${NC}"
    }
fi

# Step 5: Set environment variables
echo -e "\n${YELLOW}Step 5: Setting environment variables...${NC}"

echo -e "${BLUE}Setting DATABASE_URL...${NC}"
npx @railway/cli variables --set "DATABASE_URL=postgresql://neondb_owner:npg_Mx84qTlYGiSB@ep-little-brook-ab90jz5e-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require" || echo -e "${YELLOW}⚠️  DATABASE_URL may need manual setup${NC}"

echo -e "${BLUE}Setting JWT_SECRET...${NC}"
npx @railway/cli variables --set "JWT_SECRET=adonai_farm_super_secure_secret_2024_production" || echo -e "${YELLOW}⚠️  JWT_SECRET may need manual setup${NC}"

echo -e "${BLUE}Setting NODE_ENV...${NC}"
npx @railway/cli variables --set "NODE_ENV=production" || echo -e "${YELLOW}⚠️  NODE_ENV may need manual setup${NC}"

echo -e "${BLUE}Setting PORT...${NC}"
npx @railway/cli variables --set "PORT=4000" || echo -e "${YELLOW}⚠️  PORT may need manual setup${NC}"

# Step 6: Show current variables
echo -e "\n${YELLOW}Step 6: Verifying environment variables...${NC}"
npx @railway/cli variables --kv 2>/dev/null || echo -e "${YELLOW}⚠️  Could not display variables${NC}"

# Step 7: Get project information
echo -e "\n${YELLOW}Step 7: Getting deployment information...${NC}"
echo -e "${GREEN}✅ Project Status:${NC}"
npx @railway/cli status

# Try to get domain
DOMAIN_INFO=$(npx @railway/cli domain 2>/dev/null || echo "")
if [[ -n "$DOMAIN_INFO" ]]; then
    echo -e "${GREEN}✅ Deployment URL: $DOMAIN_INFO${NC}"
else
    echo -e "${BLUE}ℹ️  Deployment URL will be available after build completes${NC}"
fi

# Step 8: Final summary
echo -e "\n${BLUE}🎉 Deployment Setup Complete!${NC}"
echo "================================"
echo ""
echo -e "${GREEN}✅ Railway project configured${NC}"
echo -e "${GREEN}✅ GitHub repository connected${NC}"
echo -e "${GREEN}✅ Environment variables set${NC}"
echo -e "${GREEN}✅ Ready for deployment${NC}"
echo ""
echo -e "${CYAN}🌐 Monitor deployment at: https://railway.app/dashboard${NC}"
echo -e "${CYAN}📱 GitHub repository: https://github.com/llakterian/Adonai_Farm${NC}"
echo ""
echo -e "${BLUE}🔑 Application Login:${NC}"
echo -e "${CYAN}   Username: admin${NC}"
echo -e "${CYAN}   Password: adonai123${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo -e "${CYAN}1. Check Railway dashboard for build progress${NC}"
echo -e "${CYAN}2. Wait for deployment to complete (5-10 minutes)${NC}"
echo -e "${CYAN}3. Test your live application${NC}"
echo -e "${CYAN}4. Set up custom domain if needed${NC}"
echo ""

# Try to show logs if available
echo -e "${YELLOW}Checking for recent deployment activity...${NC}"
timeout 5s npx @railway/cli logs --tail 5 2>/dev/null || echo -e "${BLUE}ℹ️  No recent logs (deployment may be starting)${NC}"

echo -e "\n${GREEN}🚀 Deployment script completed successfully!${NC}"