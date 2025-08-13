#!/bin/bash

echo "🌾 Building Adonai Farm for Netlify ZIP upload..."

# Create build directory
mkdir -p netlify-build

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build

# Copy built frontend to netlify-build
cp -r dist/* ../netlify-build/

# Copy netlify functions
cd ..
mkdir -p netlify-build/.netlify/functions
cp netlify/functions/* netlify-build/.netlify/functions/

# Create ZIP file
echo "📦 Creating ZIP file..."
cd netlify-build
zip -r ../adonai-farm-netlify.zip .
cd ..

echo "✅ ZIP file created: adonai-farm-netlify.zip"
echo "📤 Upload this ZIP file to Netlify!"
echo ""
echo "🔗 Netlify Upload Steps:"
echo "1. Go to netlify.com"
echo "2. Drag and drop adonai-farm-netlify.zip"
echo "3. Your farm management system will be live!"
echo ""
echo "👤 Login credentials:"
echo "   Username: admin"
echo "   Password: adonai123"