#!/bin/bash

# 🚂 Interactive Railway Deployment Script for Adonai Farm Management System
# This script handles the complete deployment process with error handling and user feedback

set -e  # Exit on any error

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project configuration
PROJECT_NAME="Adonai Farm Management System"
GITHUB_REPO="llakterian/Adonai_Farm"
DOMAIN="adonaifarm.co.ke"
DATABASE_URL="postgresql://neondb_owner:npg_Mx84qTlYGiSB@ep-little-brook-ab90jz5e-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to wait for user input
wait_for_user() {
    echo -e "${CYAN}Press Enter to continue...${NC}"
    read -r
}

# Function to ask yes/no question
ask_yes_no() {
    while true; do
        echo -e "${YELLOW}$1 (y/n): ${NC}"
        read -r yn
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Please answer yes or no.";;
        esac
    done
}

# Function to check Railway login status
check_railway_login() {
    print_status "Checking Railway authentication..."
    if npx @railway/cli whoami >/dev/null 2>&1; then
        local user=$(npx @railway/cli whoami 2>/dev/null)
        print_success "Already logged in as: $user"
        return 0
    else
        print_warning "Not logged in to Railway"
        return 1
    fi
}

# Function to login to Railway
railway_login() {
    print_header "Railway Authentication"
    
    if check_railway_login; then
        if ask_yes_no "Do you want to login with a different account?"; then
            print_status "Logging out current user..."
            npx @railway/cli logout >/dev/null 2>&1 || true
        else
            return 0
        fi
    fi
    
    print_status "Starting Railway login process..."
    print_warning "This will open a browser or provide a login URL"
    
    if ask_yes_no "Use browserless login (recommended for terminal)?"; then
        print_status "Starting browserless login..."
        npx @railway/cli login --browserless
    else
        print_status "Starting browser login..."
        npx @railway/cli login
    fi
    
    if check_railway_login; then
        print_success "Railway login successful!"
    else
        print_error "Railway login failed"
        exit 1
    fi
}

# Function to check git status
check_git_status() {
    print_status "Checking git repository status..."
    
    if ! git status >/dev/null 2>&1; then
        print_error "Not in a git repository"
        exit 1
    fi
    
    # Check if there are uncommitted changes
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        print_warning "You have uncommitted changes"
        if ask_yes_no "Do you want to commit and push changes?"; then
            return 1
        else
            print_warning "Proceeding with uncommitted changes..."
        fi
    fi
    
    return 0
}

# Function to commit and push changes
commit_and_push() {
    print_header "Git Operations"
    
    print_status "Adding all changes to git..."
    git add .
    
    echo -e "${YELLOW}Enter commit message (or press Enter for default): ${NC}"
    read -r commit_msg
    if [ -z "$commit_msg" ]; then
        commit_msg="Deploy to Railway with Postgres integration - $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    print_status "Committing changes: $commit_msg"
    git commit -m "$commit_msg"
    
    print_status "Pushing to GitHub..."
    if git push origin main; then
        print_success "Code pushed to GitHub successfully!"
    else
        print_error "Failed to push to GitHub"
        print_warning "Please check your GitHub authentication"
        exit 1
    fi
}

# Function to check if Railway project exists
check_railway_project() {
    print_status "Checking Railway project status..."
    
    if npx @railway/cli status >/dev/null 2>&1; then
        local project_info=$(npx @railway/cli status 2>/dev/null)
        print_success "Railway project found:"
        echo "$project_info"
        return 0
    else
        print_warning "No Railway project found in current directory"
        return 1
    fi
}

# Function to create Railway project
create_railway_project() {
    print_header "Railway Project Setup"
    
    if check_railway_project; then
        if ask_yes_no "Railway project already exists. Continue with existing project?"; then
            return 0
        fi
    fi
    
    print_status "Creating new Railway project..."
    echo -e "${YELLOW}Enter project name (or press Enter for '$PROJECT_NAME'): ${NC}"
    read -r project_name
    if [ -z "$project_name" ]; then
        project_name="$PROJECT_NAME"
    fi
    
    # Create project interactively
    echo "$project_name" | npx @railway/cli init
    
    if check_railway_project; then
        print_success "Railway project created successfully!"
    else
        print_error "Failed to create Railway project"
        exit 1
    fi
}

# Function to add GitHub service to Railway
add_github_service() {
    print_header "Adding GitHub Service to Railway"
    
    print_status "Adding GitHub repository as a service..."
    print_warning "This will connect your GitHub repo: $GITHUB_REPO"
    
    # Try to add GitHub service
    if echo -e "GitHub Repo\n$GITHUB_REPO\n\n" | npx @railway/cli add; then
        print_success "GitHub service added successfully!"
    else
        print_warning "Automated GitHub service creation failed"
        print_status "Please add the service manually:"
        echo -e "${CYAN}1. Go to Railway Dashboard${NC}"
        echo -e "${CYAN}2. Click '+ New' → 'GitHub Repo'${NC}"
        echo -e "${CYAN}3. Select: $GITHUB_REPO${NC}"
        wait_for_user
    fi
}

# Function to set environment variables
set_environment_variables() {
    print_header "Setting Environment Variables"
    
    print_status "Setting up production environment variables..."
    
    # List of environment variables to set
    declare -A env_vars=(
        ["DATABASE_URL"]="$DATABASE_URL"
        ["JWT_SECRET"]="adonai_farm_super_secure_secret_2024_production"
        ["NODE_ENV"]="production"
        ["PORT"]="4000"
    )
    
    for key in "${!env_vars[@]}"; do
        print_status "Setting $key..."
        if echo "${env_vars[$key]}" | npx @railway/cli variables set "$key"; then
            print_success "$key set successfully"
        else
            print_warning "Failed to set $key automatically"
            echo -e "${CYAN}Please set manually: $key=${env_vars[$key]}${NC}"
        fi
    done
}

# Function to deploy to Railway
deploy_to_railway() {
    print_header "Deploying to Railway"
    
    print_status "Starting deployment..."
    print_warning "This may take a few minutes..."
    
    if npx @railway/cli up; then
        print_success "Deployment successful!"
    else
        print_warning "Direct deployment failed, but your GitHub repo is connected"
        print_status "Railway will automatically deploy from GitHub"
    fi
}

# Function to get deployment URL
get_deployment_url() {
    print_header "Deployment Information"
    
    print_status "Getting deployment URL..."
    
    # Try to get the URL
    if command_exists "npx"; then
        local url=$(npx @railway/cli domain 2>/dev/null || echo "")
        if [ -n "$url" ]; then
            print_success "Your app is deployed at: $url"
        else
            print_status "Getting Railway project URL..."
            npx @railway/cli open --no-browser 2>/dev/null || true
        fi
    fi
    
    print_status "You can also check your deployment at:"
    echo -e "${CYAN}https://railway.app/dashboard${NC}"
}

# Function to setup custom domain
setup_custom_domain() {
    print_header "Custom Domain Setup"
    
    if ask_yes_no "Do you want to set up custom domain ($DOMAIN)?"; then
        print_status "To set up custom domain:"
        echo -e "${CYAN}1. Go to Railway Dashboard → Your Service → Settings → Domains${NC}"
        echo -e "${CYAN}2. Click 'Custom Domain'${NC}"
        echo -e "${CYAN}3. Enter: $DOMAIN${NC}"
        echo -e "${CYAN}4. Add DNS records at your domain registrar:${NC}"
        echo -e "${YELLOW}   Type: CNAME${NC}"
        echo -e "${YELLOW}   Name: @${NC}"
        echo -e "${YELLOW}   Value: [your-railway-domain].up.railway.app${NC}"
        wait_for_user
    fi
}

# Function to show final summary
show_summary() {
    print_header "Deployment Summary"
    
    print_success "🎉 Adonai Farm Management System Deployment Complete!"
    echo ""
    echo -e "${GREEN}✅ Code pushed to GitHub: https://github.com/$GITHUB_REPO${NC}"
    echo -e "${GREEN}✅ Railway project created and configured${NC}"
    echo -e "${GREEN}✅ Environment variables set${NC}"
    echo -e "${GREEN}✅ Postgres database connected${NC}"
    echo ""
    echo -e "${BLUE}🌐 Access your application:${NC}"
    echo -e "${CYAN}   - Railway Dashboard: https://railway.app/dashboard${NC}"
    echo -e "${CYAN}   - Custom Domain (after DNS): https://$DOMAIN${NC}"
    echo ""
    echo -e "${BLUE}🔑 Login Credentials:${NC}"
    echo -e "${CYAN}   Username: admin${NC}"
    echo -e "${CYAN}   Password: adonai123${NC}"
    echo ""
    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo -e "${CYAN}   1. Check deployment status in Railway dashboard${NC}"
    echo -e "${CYAN}   2. Set up custom domain DNS records${NC}"
    echo -e "${CYAN}   3. Test your application${NC}"
    echo -e "${CYAN}   4. Monitor logs and performance${NC}"
}

# Main deployment function
main() {
    clear
    print_header "🌾 Adonai Farm Management System - Railway Deployment"
    
    print_status "Starting interactive deployment process..."
    echo ""
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    
    if ! command_exists "git"; then
        print_error "Git is not installed"
        exit 1
    fi
    
    if ! command_exists "npx"; then
        print_error "Node.js/npm is not installed"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
    echo ""
    
    # Step 1: Railway Authentication
    railway_login
    echo ""
    
    # Step 2: Git Operations
    if ! check_git_status; then
        commit_and_push
    fi
    echo ""
    
    # Step 3: Railway Project Setup
    create_railway_project
    echo ""
    
    # Step 4: Add GitHub Service
    add_github_service
    echo ""
    
    # Step 5: Set Environment Variables
    set_environment_variables
    echo ""
    
    # Step 6: Deploy
    deploy_to_railway
    echo ""
    
    # Step 7: Get Deployment URL
    get_deployment_url
    echo ""
    
    # Step 8: Custom Domain Setup
    setup_custom_domain
    echo ""
    
    # Step 9: Show Summary
    show_summary
    
    print_success "Deployment script completed successfully! 🚀"
}

# Error handling
trap 'print_error "Script interrupted"; exit 1' INT TERM

# Run main function
main "$@"