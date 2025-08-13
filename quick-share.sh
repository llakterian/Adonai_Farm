#!/bin/bash

echo "🌾 Quick Share - Adonai Farm Management System"
echo "This will run your app locally and create a public URL"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start the application
echo "🏗️  Starting your farm management system..."
docker-compose up -d

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 15

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "📦 Installing ngrok..."
    # Download ngrok
    curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
    echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
    sudo apt update && sudo apt install ngrok
fi

echo "🌐 Creating public URL..."
echo "Your farm management system is starting..."
echo ""
echo "🔗 In a few seconds, you'll get a public URL like:"
echo "   https://abc123.ngrok.io"
echo ""
echo "📱 Share this URL with your farm crew!"
echo "👤 Login: admin / adonai123"
echo ""
echo "Press Ctrl+C to stop sharing"

# Start ngrok
ngrok http 3000