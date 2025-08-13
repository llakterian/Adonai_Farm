#!/bin/bash

# Adonai Farm Management System - Quick Deploy Script
echo "🌾 Deploying Adonai Farm Management System..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Set production JWT secret if not provided
if [ -z "$JWT_SECRET" ]; then
    export JWT_SECRET="adonai_farm_$(openssl rand -hex 32)"
    echo "🔐 Generated JWT secret: $JWT_SECRET"
    echo "💡 Save this secret for future deployments!"
fi

# Build and start the application
echo "🏗️  Building application..."
docker-compose build

echo "🚀 Starting application..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Application deployed successfully!"
    echo ""
    echo "🌐 Your farm management system is now running at:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:4000"
    echo ""
    echo "👤 Default login credentials:"
    echo "   Username: admin"
    echo "   Password: adonai123"
    echo ""
    echo "📊 To view logs: docker-compose logs -f"
    echo "🛑 To stop: docker-compose down"
    echo "🔄 To restart: docker-compose restart"
else
    echo "❌ Deployment failed. Check logs with: docker-compose logs"
    exit 1
fi