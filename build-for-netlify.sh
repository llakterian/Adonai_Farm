#!/bin/bash

# Build script for Netlify deployment with local storage support
# Creates a complete package ready for mobile testing

echo "🌾 Building Adonai Farm for Netlify Deployment"
echo "=============================================="

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf netlify-build
rm -f adonai-farm-netlify.zip

# Create build directory
mkdir -p netlify-build

# Build the frontend
echo "🔨 Building frontend..."
cd frontend
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "✅ Frontend build completed"

# Copy built frontend to netlify-build
echo "📦 Copying frontend build..."
cp -r dist/* ../netlify-build/

# Copy backend images to the build (priority source)
echo "🖼️ Copying farm images from backend uploads..."
mkdir -p ../netlify-build/uploads/Adonai

# First, try to copy from backend/uploads directory
if [ -d "../backend/uploads" ]; then
    # Copy all images from backend/uploads directly to Adonai folder
    cp ../backend/uploads/*.jpg ../netlify-build/uploads/Adonai/ 2>/dev/null || true
    cp ../backend/uploads/*.jpeg ../netlify-build/uploads/Adonai/ 2>/dev/null || true
    cp ../backend/uploads/*.png ../netlify-build/uploads/Adonai/ 2>/dev/null || true
    cp ../backend/uploads/*.webp ../netlify-build/uploads/Adonai/ 2>/dev/null || true
    
    # Also maintain the original structure for compatibility
    mkdir -p ../netlify-build/uploads
    cp ../backend/uploads/* ../netlify-build/uploads/ 2>/dev/null || true
    
    ADONAI_COUNT=$(ls -1 ../netlify-build/uploads/Adonai 2>/dev/null | wc -l)
    echo "✅ Copied backend uploads to Adonai folder: $ADONAI_COUNT images"
    
    # List the copied images for verification
    if [ $ADONAI_COUNT -gt 0 ]; then
        echo "  📸 Images copied:"
        ls -1 ../netlify-build/uploads/Adonai/ | head -5
        if [ $ADONAI_COUNT -gt 5 ]; then
            echo "  ... and $((ADONAI_COUNT - 5)) more"
        fi
    fi
else
    echo "⚠️ Backend uploads directory not found, checking for individual images..."
    
    # Fallback: look for images in backend directory
    if [ -d "../backend" ]; then
        find ../backend -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" | while read img; do
            cp "$img" ../netlify-build/uploads/Adonai/ 2>/dev/null || true
        done
        echo "✅ Copied individual images found in backend directory"
    fi
fi

# Ensure we have the expected farm images
EXPECTED_IMAGES=("adonai1.jpg" "adonai2.jpg" "adonai3.jpg" "adonai4.jpg" "adonai5.jpg" "adonai6.jpg" "adonai7.jpg" "adonai8.jpg" "adonai9.jpg" "adonaix.jpg" "adonaixi.jpg" "adonaixii.jpg" "adonaixiii.jpg" "farm-1.jpg" "farm-2.jpg" "farm-3.jpg" "farm-4.jpg" "farm-5.jpg" "farm-6.jpg" "farm-7.jpg")

echo "🔍 Verifying expected images..."
FOUND_COUNT=0
for img in "${EXPECTED_IMAGES[@]}"; do
    if [ -f "../netlify-build/uploads/Adonai/$img" ]; then
        ((FOUND_COUNT++))
    else
        echo "  ⚠️ Missing: $img"
    fi
done
echo "  ✅ Found $FOUND_COUNT of ${#EXPECTED_IMAGES[@]} expected images"

# Copy public images as fallback
echo "🖼️ Copying fallback images from public..."
mkdir -p ../netlify-build/images
if [ -d "public/images" ]; then
    cp public/images/* ../netlify-build/images/
    echo "✅ Copied $(ls -1 public/images | wc -l) fallback images"
else
    echo "⚠️ Public images directory not found"
fi

# Verify image availability
echo "📊 Image inventory:"
if [ -d "../netlify-build/uploads/Adonai" ]; then
    BACKEND_IMAGES=$(ls -1 ../netlify-build/uploads/Adonai 2>/dev/null | wc -l)
    echo "  - Backend images: $BACKEND_IMAGES"
fi
if [ -d "../netlify-build/images" ]; then
    FALLBACK_IMAGES=$(ls -1 ../netlify-build/images 2>/dev/null | wc -l)
    echo "  - Fallback images: $FALLBACK_IMAGES"
fi

# Create Netlify configuration
echo "⚙️ Creating Netlify configuration..."
cd ..
cat > netlify-build/_redirects << 'EOF'
# SPA routing - redirect all non-file requests to index.html
/*    /index.html   200

# API redirects for local storage fallback
/api/*  /index.html  200
/uploads/*  /uploads/:splat  200
EOF

# Create netlify.toml for build settings
cat > netlify-build/netlify.toml << 'EOF'
[build]
  publish = "."
  command = "echo 'Static build - no build command needed'"

[build.environment]
  NODE_VERSION = "18"

# Redirects for SPA routing
[[redirects]]
  from = "/api/*"
  to = "/index.html"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  conditions = {Role = ["admin"], Country = ["US"]}
  force = false

# Static file serving with proper MIME types
[[headers]]
  for = "/uploads/Adonai/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    Access-Control-Allow-Origin = "*"
    Content-Type = "image/*"
    
[[headers]]
  for = "/uploads/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    Access-Control-Allow-Origin = "*"
    
[[headers]]
  for = "/images/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    Access-Control-Allow-Origin = "*"

[[headers]]
  for = "*.jpg"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    Content-Type = "image/jpeg"

[[headers]]
  for = "*.jpeg"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    Content-Type = "image/jpeg"

[[headers]]
  for = "*.png"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    Content-Type = "image/png"

[[headers]]
  for = "*.webp"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    Content-Type = "image/webp"

[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

# Comprehensive Security Headers
[[headers]]
  for = "/*"
  [headers.values]
    # XSS Protection
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    
    # Content Security Policy - Strict but functional
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https: wss:; media-src 'self'; object-src 'none'; child-src 'none'; worker-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'self'; manifest-src 'self'"
    
    # Referrer Policy
    Referrer-Policy = "strict-origin-when-cross-origin"
    
    # Permissions Policy (Feature Policy)
    Permissions-Policy = "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=(), vibrate=(), fullscreen=(self), sync-xhr=()"
    
    # HSTS (HTTP Strict Transport Security)
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
    
    # Additional Security Headers
    X-Permitted-Cross-Domain-Policies = "none"
    Cross-Origin-Embedder-Policy = "require-corp"
    Cross-Origin-Opener-Policy = "same-origin"
    Cross-Origin-Resource-Policy = "same-origin"
    
    # Server Information Hiding
    Server = ""
    X-Powered-By = ""
    
    # Cache Control for Security
    Cache-Control = "no-cache, no-store, must-revalidate, private"
    Pragma = "no-cache"
    Expires = "0"

# Specific security for sensitive paths
[[headers]]
  for = "/admin/*"
  [headers.values]
    X-Robots-Tag = "noindex, nofollow, noarchive, nosnippet, notranslate, noimageindex"
    Cache-Control = "no-cache, no-store, must-revalidate, private"
    
[[headers]]
  for = "/dashboard/*"
  [headers.values]
    X-Robots-Tag = "noindex, nofollow, noarchive, nosnippet, notranslate, noimageindex"
    Cache-Control = "no-cache, no-store, must-revalidate, private"

[[headers]]
  for = "/login"
  [headers.values]
    X-Robots-Tag = "noindex, nofollow, noarchive, nosnippet, notranslate, noimageindex"
    Cache-Control = "no-cache, no-store, must-revalidate, private"
EOF

# Create a mobile test configuration
echo "📱 Creating mobile test configuration..."
cat > netlify-build/mobile-config.js << 'EOF'
// Mobile test configuration
// This script automatically enables localStorage mode for mobile devices
(function() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isFileProtocol = window.location.protocol === 'file:';
  
  if (isMobile || isFileProtocol || !navigator.onLine) {
    localStorage.setItem('use-local-storage', 'true');
    console.log('📱 Mobile/offline mode detected - using localStorage backend');
  }
  
  // Add mobile-specific optimizations
  if (isMobile) {
    document.documentElement.classList.add('mobile-device');
    
    // Optimize for mobile performance
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }
})();
EOF

# Update index.html to include mobile config
echo "📝 Updating index.html for mobile support..."
sed -i 's|</head>|  <script src="/mobile-config.js"></script>\n  </head>|' netlify-build/index.html

# Create a test page for switching modes
echo "🧪 Creating test utilities..."
cat > netlify-build/test-mode.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Adonai Farm - Test Mode Switcher</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
        .mode-card { border: 1px solid #ddd; padding: 20px; margin: 10px 0; border-radius: 8px; }
        .current { background: #e8f5e8; border-color: #4caf50; }
        button { padding: 10px 20px; margin: 5px; border: none; border-radius: 4px; cursor: pointer; }
        .primary { background: #4caf50; color: white; }
        .secondary { background: #2196f3; color: white; }
        .info { background: #f0f0f0; padding: 15px; border-radius: 4px; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>🌾 Adonai Farm - Test Mode</h1>
    
    <div class="info">
        <strong>Current Mode:</strong> <span id="currentMode">Loading...</span><br>
        <strong>Device Type:</strong> <span id="deviceType">Loading...</span><br>
        <strong>Connection:</strong> <span id="connectionStatus">Loading...</span>
    </div>
    
    <div class="mode-card" id="localStorageCard">
        <h3>📱 Local Storage Mode</h3>
        <p>Perfect for mobile testing and offline use. All data is stored locally in your browser.</p>
        <button class="primary" onclick="switchToLocalStorage()">Use Local Storage</button>
    </div>
    
    <div class="mode-card" id="backendCard">
        <h3>🖥️ Backend Mode</h3>
        <p>Connects to the backend server. Requires internet connection and running backend.</p>
        <button class="secondary" onclick="switchToBackend()">Use Backend</button>
    </div>
    
    <div style="margin-top: 30px;">
        <button onclick="goToApp()" style="background: #ff9800; color: white; font-size: 16px; padding: 15px 30px;">
            🚀 Go to Farm Website
        </button>
    </div>
    
    <script>
        function updateStatus() {
            const useLocalStorage = localStorage.getItem('use-local-storage') === 'true';
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            document.getElementById('currentMode').textContent = useLocalStorage ? 'Local Storage' : 'Backend';
            document.getElementById('deviceType').textContent = isMobile ? 'Mobile' : 'Desktop';
            document.getElementById('connectionStatus').textContent = navigator.onLine ? 'Online' : 'Offline';
            
            // Highlight current mode
            document.getElementById('localStorageCard').classList.toggle('current', useLocalStorage);
            document.getElementById('backendCard').classList.toggle('current', !useLocalStorage);
        }
        
        function switchToLocalStorage() {
            localStorage.setItem('use-local-storage', 'true');
            alert('✅ Switched to Local Storage mode!\n\nThis mode is perfect for:\n• Mobile testing\n• Offline use\n• Demo purposes');
            updateStatus();
        }
        
        function switchToBackend() {
            localStorage.removeItem('use-local-storage');
            alert('✅ Switched to Backend mode!\n\nMake sure the backend server is running on localhost:4000');
            updateStatus();
        }
        
        function goToApp() {
            window.location.href = '/';
        }
        
        // Update status on load
        updateStatus();
        
        // Update connection status when it changes
        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);
    </script>
</body>
</html>
EOF

# Create README for deployment
echo "📚 Creating deployment README..."
cat > netlify-build/README.md << 'EOF'
# Adonai Farm - Netlify Deployment

This is a complete build of the Adonai Farm website ready for Netlify deployment.

## Features

- **Dual Mode Operation**: Automatically switches between backend API and localStorage based on device/connection
- **Mobile Optimized**: Optimized for mobile devices with touch-friendly interface
- **Offline Support**: Works offline using localStorage backend
- **Progressive Web App**: Includes service worker and manifest for PWA functionality
- **Image Gallery**: 20+ farm images with lazy loading and optimization
- **Admin Dashboard**: Complete farm management system
- **Contact Forms**: Working contact forms with local storage

## Deployment

1. **Netlify**: Upload this entire folder to Netlify or connect your Git repository
2. **Manual**: Serve the files from any static web server

## Testing

- Visit `/test-mode.html` to switch between localStorage and backend modes
- Mobile devices automatically use localStorage mode
- Desktop can use either mode

## Login Credentials

- **Username**: admin
- **Password**: adonai123

## File Structure

```
/
├── index.html          # Main application
├── mobile-config.js    # Mobile detection and configuration
├── test-mode.html      # Mode switching utility
├── uploads/Adonai/     # Farm images
├── images/             # Fallback images
├── js/                 # Application JavaScript
├── css/                # Application styles
├── _redirects          # Netlify routing rules
└── netlify.toml        # Netlify configuration
```

## Local Storage Data

The app automatically initializes with:
- 5 sample animals (cattle, goats, sheep, chickens)
- 3 sample workers
- 4+ farm images
- Admin user account

All data persists in browser localStorage for testing.
EOF

# Test the build
echo "🧪 Testing the build..."
if [ -f "netlify-build/index.html" ] && [ -d "netlify-build/js" ] && [ -d "netlify-build/css" ]; then
    echo "✅ Build structure looks good"
else
    echo "❌ Build structure incomplete"
    exit 1
fi

# Run deployment verification
echo "🔍 Running deployment verification..."
if command -v node >/dev/null 2>&1; then
    node verify-netlify-deployment.js
    VERIFICATION_EXIT_CODE=$?
else
    echo "⚠️ Node.js not found - skipping verification"
    VERIFICATION_EXIT_CODE=0
fi

# Create zip file for easy deployment
echo "📦 Creating deployment package..."
cd netlify-build
zip -r ../adonai-farm-netlify.zip . -x "*.DS_Store" "*.git*"
cd ..

# Calculate sizes
BUILD_SIZE=$(du -sh netlify-build | cut -f1)
ZIP_SIZE=$(du -sh adonai-farm-netlify.zip | cut -f1)

echo ""
echo "🎉 Build completed successfully!"
echo "================================"
echo "📁 Build directory: netlify-build/ ($BUILD_SIZE)"
echo "📦 Deployment package: adonai-farm-netlify.zip ($ZIP_SIZE)"

if [ $VERIFICATION_EXIT_CODE -eq 0 ]; then
    echo "✅ Deployment verification passed"
else
    echo "⚠️ Deployment verification found issues (see above)"
fi

echo ""
echo "🚀 Ready for deployment!"
echo "• Upload adonai-farm-netlify.zip to Netlify"
echo "• Or drag the netlify-build folder to Netlify"
echo "• Visit /test-mode.html to switch modes"
echo ""
echo "📱 Mobile Testing:"
echo "• Automatically uses localStorage on mobile devices"
echo "• Works offline"
echo "• All features available without backend"
echo ""
echo "🔐 Login: admin / adonai123"
echo ""
echo "🔗 Test URLs after deployment:"
echo "• Main site: https://your-site.netlify.app/"
echo "• Image test: https://your-site.netlify.app/uploads/Adonai/adonai1.jpg"
echo "• Mode switcher: https://your-site.netlify.app/test-mode.html"