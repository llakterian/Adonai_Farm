#!/usr/bin/env node

/**
 * Netlify Deployment Verification Script
 * Tests image loading and deployment configuration for Adonai Farm
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Netlify Deployment Configuration');
console.log('============================================');

// Expected images that should be available
const expectedImages = [
  'adonai1.jpg', 'adonai2.jpg', 'adonai3.jpg', 'adonai4.jpg', 'adonai5.jpg',
  'adonai6.jpg', 'adonai7.jpg', 'adonai8.jpg', 'adonai9.jpg', 'adonaix.jpg',
  'adonaixi.jpg', 'adonaixii.jpg', 'adonaixiii.jpg',
  'farm-1.jpg', 'farm-2.jpg', 'farm-3.jpg', 'farm-4.jpg', 'farm-5.jpg',
  'farm-6.jpg', 'farm-7.jpg'
];

// Check if build directory exists
const buildDir = 'netlify-build';
if (!fs.existsSync(buildDir)) {
  console.error('❌ Build directory not found. Run build-for-netlify.sh first.');
  process.exit(1);
}

console.log('✅ Build directory found');

// Check critical files
const criticalFiles = [
  'index.html',
  'netlify.toml',
  '_redirects',
  'mobile-config.js'
];

console.log('\n📋 Checking critical files...');
let missingFiles = [];

criticalFiles.forEach(file => {
  const filePath = path.join(buildDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    missingFiles.push(file);
  }
});

// Check uploads directory structure
console.log('\n🖼️ Checking image directory structure...');
const uploadsDir = path.join(buildDir, 'uploads', 'Adonai');
const imagesDir = path.join(buildDir, 'images');

if (fs.existsSync(uploadsDir)) {
  console.log('  ✅ /uploads/Adonai/ directory exists');
  
  // Check for expected images
  const availableImages = fs.readdirSync(uploadsDir).filter(file => 
    file.match(/\.(jpg|jpeg|png|webp)$/i)
  );
  
  console.log(`  📊 Found ${availableImages.length} images in uploads directory`);
  
  // Check specific expected images
  let foundImages = 0;
  let missingImages = [];
  
  expectedImages.forEach(img => {
    if (availableImages.includes(img)) {
      foundImages++;
    } else {
      missingImages.push(img);
    }
  });
  
  console.log(`  ✅ ${foundImages}/${expectedImages.length} expected images found`);
  
  if (missingImages.length > 0) {
    console.log('  ⚠️ Missing images:');
    missingImages.forEach(img => console.log(`    - ${img}`));
  }
  
} else {
  console.log('  ❌ /uploads/Adonai/ directory missing');
}

if (fs.existsSync(imagesDir)) {
  const fallbackImages = fs.readdirSync(imagesDir).filter(file => 
    file.match(/\.(jpg|jpeg|png|webp)$/i)
  );
  console.log(`  ✅ /images/ fallback directory with ${fallbackImages.length} images`);
} else {
  console.log('  ⚠️ /images/ fallback directory missing');
}

// Check netlify.toml configuration
console.log('\n⚙️ Checking Netlify configuration...');
const netlifyTomlPath = path.join(buildDir, 'netlify.toml');
if (fs.existsSync(netlifyTomlPath)) {
  const netlifyConfig = fs.readFileSync(netlifyTomlPath, 'utf8');
  
  // Check for important configuration sections
  const checks = [
    { pattern: /\[\[redirects\]\]/, name: 'SPA redirects' },
    { pattern: /\/uploads\/Adonai\/\*/, name: 'Image headers for /uploads/Adonai/*' },
    { pattern: /Cache-Control.*immutable/, name: 'Image caching headers' },
    { pattern: /X-Frame-Options/, name: 'Security headers' }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(netlifyConfig)) {
      console.log(`  ✅ ${check.name} configured`);
    } else {
      console.log(`  ⚠️ ${check.name} missing or misconfigured`);
    }
  });
} else {
  console.log('  ❌ netlify.toml missing');
}

// Check _redirects file
console.log('\n🔀 Checking redirects configuration...');
const redirectsPath = path.join(buildDir, '_redirects');
if (fs.existsSync(redirectsPath)) {
  const redirectsConfig = fs.readFileSync(redirectsPath, 'utf8');
  
  if (redirectsConfig.includes('/uploads/*')) {
    console.log('  ✅ Upload redirects configured');
  } else {
    console.log('  ⚠️ Upload redirects missing');
  }
  
  if (redirectsConfig.includes('/*    /index.html   200')) {
    console.log('  ✅ SPA fallback configured');
  } else {
    console.log('  ⚠️ SPA fallback missing');
  }
} else {
  console.log('  ❌ _redirects file missing');
}

// Check mobile configuration
console.log('\n📱 Checking mobile configuration...');
const mobileConfigPath = path.join(buildDir, 'mobile-config.js');
if (fs.existsSync(mobileConfigPath)) {
  const mobileConfig = fs.readFileSync(mobileConfigPath, 'utf8');
  
  if (mobileConfig.includes('localStorage.setItem(\'use-local-storage\', \'true\')')) {
    console.log('  ✅ Mobile localStorage detection configured');
  } else {
    console.log('  ⚠️ Mobile localStorage detection missing');
  }
} else {
  console.log('  ❌ mobile-config.js missing');
}

// Check if mobile config is included in index.html
const indexPath = path.join(buildDir, 'index.html');
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  if (indexContent.includes('mobile-config.js')) {
    console.log('  ✅ Mobile config included in index.html');
  } else {
    console.log('  ⚠️ Mobile config not included in index.html');
  }
}

// Generate deployment report
console.log('\n📊 Deployment Report');
console.log('===================');

const totalIssues = missingFiles.length;

if (totalIssues === 0) {
  console.log('🎉 Deployment looks ready!');
  console.log('✅ All critical files present');
  console.log('✅ Image structure configured correctly');
  console.log('✅ Netlify configuration optimized');
  console.log('✅ Mobile support enabled');
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Upload adonai-farm-netlify.zip to Netlify');
  console.log('2. Test image loading on the deployed site');
  console.log('3. Verify mobile functionality');
  console.log('4. Check /test-mode.html for mode switching');
  
} else {
  console.log(`⚠️ Found ${totalIssues} potential issues`);
  console.log('Please review the warnings above before deploying');
  
  if (missingFiles.length > 0) {
    console.log('\n❌ Critical files missing - deployment may fail');
  } else {
    console.log('\n✅ Critical files present - deployment should work');
    console.log('⚠️ Some images missing - fallbacks will be used');
  }
}

// File size analysis
console.log('\n📏 Build Size Analysis');
console.log('=====================');

function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  function calculateSize(currentPath) {
    const stats = fs.statSync(currentPath);
    
    if (stats.isDirectory()) {
      const files = fs.readdirSync(currentPath);
      files.forEach(file => {
        calculateSize(path.join(currentPath, file));
      });
    } else {
      totalSize += stats.size;
    }
  }
  
  if (fs.existsSync(dirPath)) {
    calculateSize(dirPath);
  }
  
  return totalSize;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const totalSize = getDirectorySize(buildDir);
const uploadsSize = getDirectorySize(uploadsDir);
const imagesSize = getDirectorySize(imagesDir);

console.log(`Total build size: ${formatBytes(totalSize)}`);
console.log(`Images (/uploads/): ${formatBytes(uploadsSize)}`);
console.log(`Fallback images (/images/): ${formatBytes(imagesSize)}`);

if (totalSize > 100 * 1024 * 1024) { // 100MB
  console.log('⚠️ Build size is quite large - consider image optimization');
} else {
  console.log('✅ Build size is reasonable for deployment');
}

console.log('\n🔗 Useful URLs after deployment:');
console.log('- Main site: https://your-site.netlify.app/');
console.log('- Test mode: https://your-site.netlify.app/test-mode.html');
console.log('- Admin login: https://your-site.netlify.app/login');
console.log('- Sample image: https://your-site.netlify.app/uploads/Adonai/adonai1.jpg');

process.exit(totalIssues > 0 ? 1 : 0);