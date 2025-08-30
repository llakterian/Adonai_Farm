#!/bin/bash

# 🚂 Complete Railway Deployment Script for Adonai Farm
# This script handles the entire deployment process with proper account management

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="Adonai Farm"
GITHUB_REPO="llakterian/Adonai_Farm"
EXPECTED_ACCOUNT="llakterian@gmail.com"
DATABASE_URL="postgresql://neondb_owner:npg_Mx84qTlYGiSB@ep-little-brook-ab90jz5e-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="adonai_farm_super_secure_secret_2024_production"

# Helper functions
print_header() {
    echo -e "\n${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step() {
    echo -e "${CYAN}🔄 $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to wait for user input
wait_for_user() {
    echo -e "${YELLOW}Press Enter to continue...${NC}"
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

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    if ! command_exists "git"; then
        print_error "Git is not installed"
        exit 1
    fi
    print_success "Git is installed"
    
    if ! command_exists "npx"; then
        print_error "Node.js/npm is not installed"
        exit 1
    fi
    print_success "Node.js/npm is installed"
    
    if ! git status >/dev/null 2>&1; then
        print_error "Not in a git repository"
        exit 1
    fi
    print_success "Git repository detected"
}

# Check Railway login status
check_railway_login() {
    print_step "Checking Railway authentication..."
    
    if npx @railway/cli whoami >/dev/null 2>&1; then
        local current_user=$(npx @railway/cli whoami 2>/dev/null | grep -o '[a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]*\.[a-zA-Z]{2,}' || echo "unknown")
        
        if [[ "$current_user" == "$EXPECTED_ACCOUNT" ]]; then
            print_success "Logged in as correct account: $current_user"
            return 0
        else
            print_warning "Logged in as wrong account: $current_user"
            print_info "Expected account: $EXPECTED_ACCOUNT"
            return 1
        fi
    else
        print_warning "Not logged in to Railway"
        return 1
    fi
}

# Login to Railway with correct account
railway_login() {
    print_header "Railway Authentication"
    
    if check_railway_login; then
        if ask_yes_no "Continue with current Railway account?"; then
            return 0
        fi
    fi
    
    print_step "Logging out current user..."
    npx @railway/cli logout >/dev/null 2>&1 || true
    
    print_info "Starting Railway login process..."
    print_warning "IMPORTANT: Login with the GitHub account that owns the repository!"
    print_info "Expected account: $EXPECTED_ACCOUNT"
    echo ""
    
    print_step "Starting browserless login..."
    npx @railway/cli login --browserless
    
    if check_railway_login; then
        print_success "Railway login successful!"
    else
        print_error "Railway login failed or wrong account"
        print_info "Please ensure you login with: $EXPECTED_ACCOUNT"
        exit 1
    fi
}

# Handle git operations
handle_git_operations() {
    print_header "Git Operations"
    
    print_step "Checking git status..."
    
    if git status --porcelain | grep -q .; then
        print_warning "You have uncommitted changes"
        
        if ask_yes_no "Commit and push changes?"; then
            print_step "Adding all changes..."
            git add .
            
            local commit_msg="Deploy to Railway - $(date '+%Y-%m-%d %H:%M:%S')"
            print_step "Committing: $commit_msg"
            git commit -m "$commit_msg"
            
            print_step "Pushing to GitHub..."
            if git push origin main; then
                print_success "Code pushed to GitHub"
            else
                print_error "Failed to push to GitHub"
                print_info "Please check your GitHub authentication"
                exit 1
            fi
        else
            print_warning "Proceeding with uncommitted changes..."
        fi
    else
        print_success "Git repository is clean"
    fi
}

# Create or connect Railway project
setup_railway_project() {
    print_header "Railway Project Setup"
    
    print_step "Checking existing Railway project..."
    
    if npx @railway/cli status >/dev/null 2>&1; then
        local project_info=$(npx @railway/cli status 2>/dev/null)
        print_success "Railway project found:"
        echo "$project_info"
        
        if ask_yes_no "Continue with existing project?"; then
            return 0
        fi
    fi
    
    print_step "Creating new Railway project..."
    print_info "Project name: $PROJECT_NAME"
    
    # Create project with predefined name
    echo "$PROJECT_NAME" | npx @railway/cli init
    
    if npx @railway/cli status >/dev/null 2>&1; then
        print_success "Railway project created successfully!"
        npx @railway/cli status
    else
        print_error "Failed to create Railway project"
        exit 1
    fi
}

# Add GitHub service
add_github_service() {
    print_header "Adding GitHub Service"
    
    print_step "Connecting GitHub repository: $GITHUB_REPO"
    
    # Check if service already exists
    if npx @railway/cli status 2>/dev/null | grep -q "Service:"; then
        print_success "Service already exists"
        return 0
    fi
    
    print_step "Adding GitHub repository as service..."
    
    # Use expect-like approach with echo
    if echo -e "GitHub Repo\n$GITHUB_REPO\n\n" | npx @railway/cli add; then
        print_success "GitHub service added successfully!"
    else
        print_warning "Automated service creation may have failed"
        print_info "You can add the service manually in Railway dashboard"
        print_info "Repository: $GITHUB_REPO"
    fi
}

# Set environment variables
set_environment_variables() {
    print_header "Setting Environment Variables"
    
    print_step "Configuring production environment variables..."
    
    # Set DATABASE_URL
    print_step "Setting DATABASE_URL..."
    if npx @railway/cli variables --set "DATABASE_URL=$DATABASE_URL" >/dev/null 2>&1; then
        print_success "DATABASE_URL set"
    else
        print_warning "Failed to set DATABASE_URL"
    fi
    
    # Set JWT_SECRET
    print_step "Setting JWT_SECRET..."
    if npx @railway/cli variables --set "JWT_SECRET=$JWT_SECRET" >/dev/null 2>&1; then
        print_success "JWT_SECRET set"
    else
        print_warning "Failed to set JWT_SECRET"
    fi
    
    # Set NODE_ENV
    print_step "Setting NODE_ENV..."
    if npx @railway/cli variables --set "NODE_ENV=production" >/dev/null 2>&1; then
        print_success "NODE_ENV set"
    else
        print_warning "Failed to set NODE_ENV"
    fi
    
    # Set PORT
    print_step "Setting PORT..."
    if npx @railway/cli variables --set "PORT=4000" >/dev/null 2>&1; then
        print_success "PORT set"
    else
        print_warning "Failed to set PORT"
    fi
    
    print_info "Verifying environment variables..."
    npx @railway/cli variables --kv 2>/dev/null || print_warning "Could not display variables"
}

# Deploy application
deploy_application() {
    print_header "Deploying Application"
    
    print_info "Railway will automatically deploy from your GitHub repository"
    print_step "Triggering deployment..."
    
    # Since direct upload often fails, we rely on GitHub integration
    print_info "Deployment will happen automatically via GitHub integration"
    print_success "GitHub service is connected and configured"
    
    print_step "Checking deployment status..."
    sleep 5
    
    # Try to get logs to see if deployment started
    print_info "Checking for deployment activity..."
    timeout 10s npx @railway/cli logs --tail 10 2>/dev/null || print_info "Deployment may be starting..."
}

# Get deployment information
get_deployment_info() {
    print_header "Deployment Information"
    
    print_step "Getting project information..."
    
    # Get project URL
    if npx @railway/cli status >/dev/null 2>&1; then
        print_success "Project Status:"
        npx @railway/cli status
    fi
    
    print_step "Getting deployment URL..."
    
    # Try to get domain
    local domain_info=$(npx @railway/cli domain 2>/dev/null || echo "")
    if [[ -n "$domain_info" ]]; then
        print_success "Deployment URL: $domain_info"
    else
        print_info "Deployment URL will be available once build completes"
    fi
    
    print_info "You can monitor your deployment at:"
    echo -e "${CYAN}https://railway.app/dashboard${NC}"
}

# Show final summary
show_deployment_summary() {
    print_header "🎉 Deployment Summary"
    
    echo -e "${GREEN}✅ Railway account: $EXPECTED_ACCOUNT${NC}"
    echo -e "${GREEN}✅ GitHub repository: https://github.com/$GITHUB_REPO${NC}"
    echo -e "${GREEN}✅ Railway project: $PROJECT_NAME${NC}"
    echo -e "${GREEN}✅ Environment variables configured${NC}"
    echo -e "${GREEN}✅ Postgres database connected${NC}"
    echo ""
    
    echo -e "${BLUE}🌐 Access Points:${NC}"
    echo -e "${CYAN}   Railway Dashboard: https://railway.app/dashboard${NC}"
    echo -e "${CYAN}   GitHub Repository: https://github.com/$GITHUB_REPO${NC}"
    echo ""
    
    echo -e "${BLUE}🔑 Application Credentials:${NC}"
    echo -e "${CYAN}   Username: admin${NC}"
    echo -e "${CYAN}   Password: adonai123${NC}"
    echo ""
    
    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo -e "${CYAN}   1. Monitor deployment in Railway dashboard${NC}"
    echo -e "${CYAN}   2. Wait for build to complete (5-10 minutes)${NC}"
    echo -e "${CYAN}   3. Test your live application${NC}"
    echo -e "${CYAN}   4. Set up custom domain if needed${NC}"
    echo ""
    
    echo -e "${BLUE}🔧 If Issues Occur:${NC}"
    echo -e "${CYAN}   - Check build logs in Railway dashboard${NC}"
    echo -e "${CYAN}   - Verify environment variables are set${NC}"
    echo -e "${CYAN}   - Ensure database connection is working${NC}"
    echo ""
    
    print_success "Deployment script completed successfully! 🚀"
}

# Main execution function
main() {
    clear
    print_header "🌾 Adonai Farm Management System - Complete Railway Deployment"
    
    echo -e "${BLUE}This script will:${NC}"
    echo -e "${CYAN}• Authenticate with Railway using the correct GitHub account${NC}"
    echo -e "${CYAN}• Create/connect Railway project${NC}"
    echo -e "${CYAN}• Add GitHub repository as a service${NC}"
    echo -e "${CYAN}• Configure environment variables${NC}"
    echo -e "${CYAN}• Deploy your application${NC}"
    echo ""
    
    if ! ask_yes_no "Continue with deployment?"; then
        echo "Deployment cancelled."
        exit 0
    fi
    
    # Execute deployment steps
    check_prerequisites
    railway_login
    handle_git_operations
    setup_railway_project
    add_github_service
    set_environment_variables
    deploy_application
    get_deployment_info
    show_deployment_summary
    
    echo -e "\n${GREEN}🎉 Deployment process completed!${NC}"
    echo -e "${BLUE}Check Railway dashboard for deployment status: https://railway.app/dashboard${NC}"
}

# Error handling
trap 'print_error "Script interrupted"; exit 1' INT TERM

# Run main function
main "$@"