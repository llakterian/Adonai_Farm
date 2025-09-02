#!/usr/bin/env node

/**
 * Deployment Readiness Check
 * Verifies all components are ready for Railway deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Deployment Readiness Check');
console.log('=============================\n');

let allChecksPass = true;

// Check 1: Required files exist
const requiredFiles = [
    'package.json',
    'backend/index.js',
    'backend/scripts/validate_env.js',
    'backend/scripts/pg_migrate.js',
    'backend/db/dbAdapter.js',
    'railway.json'
];

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        allChecksPass = false;
    }
});

// Check 2: Frontend build exists
console.log('\n🏗️  Checking frontend build...');
if (fs.existsSync('frontend/dist')) {
    console.log('✅ Frontend build directory exists');
    
    const indexHtml = 'frontend/dist/index.html';
    if (fs.existsSync(indexHtml)) {
        console.log('✅ Frontend index.html exists');
    } else {
        console.log('❌ Frontend index.html missing - run npm run build');
        allChecksPass = false;
    }
} else {
    console.log('❌ Frontend build missing - run npm run build');
    allChecksPass = false;
}

// Check 3: Package.json scripts
console.log('\n📜 Checking package.json scripts...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredScripts = [
    'railway:build',
    'railway:start',
    'railway:migrate',
    'validate:env'
];

requiredScripts.forEach(script => {
    if (packageJson.scripts[script]) {
        console.log(`✅ ${script}`);
    } else {
        console.log(`❌ ${script} - MISSING`);
        allChecksPass = false;
    }
});

// Check 4: Dependencies
console.log('\n📦 Checking critical dependencies...');
const criticalDeps = ['express', 'pg', 'bcrypt', 'dotenv'];
criticalDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
        console.log(`✅ ${dep}`);
    } else {
        console.log(`❌ ${dep} - MISSING`);
        allChecksPass = false;
    }
});

// Check 5: Railway configuration
console.log('\n🚂 Checking Railway configuration...');
if (fs.existsSync('railway.json')) {
    try {
        const railwayConfig = JSON.parse(fs.readFileSync('railway.json', 'utf8'));
        console.log('✅ railway.json is valid JSON');
        
        if (railwayConfig.build && railwayConfig.build.builder) {
            console.log(`✅ Builder configured: ${railwayConfig.build.builder}`);
        }
    } catch (error) {
        console.log('❌ railway.json is invalid JSON');
        allChecksPass = false;
    }
} else {
    console.log('⚠️  railway.json not found (Railway will use defaults)');
}

// Final result
console.log('\n' + '='.repeat(40));
if (allChecksPass) {
    console.log('🎉 All checks passed! Ready for deployment.');
    console.log('\n📋 Next steps:');
    console.log('1. railway login --browserless');
    console.log('2. railway link (if not already linked)');
    console.log('3. ./railway-setup-and-deploy.sh');
} else {
    console.log('❌ Some checks failed. Please fix the issues above.');
    process.exit(1);
}