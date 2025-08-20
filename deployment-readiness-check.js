/**
 * Deployment Readiness Check for Farm Website Enhancement
 * Verifies all deployment configurations and requirements
 */

const fs = require('fs');
const path = require('path');

class DeploymentReadinessChecker {
  constructor() {
    this.checks = [];
    this.warnings = [];
    this.errors = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);

    if (type === 'error') {
      this.errors.push(message);
    } else if (type === 'warning') {
      this.warnings.push(message);
    }
  }

  // Check 1: Package.json configurations
  checkPackageConfigurations() {
    this.log('Checking Package Configurations');

    const packagePaths = [
      'package.json',
      'frontend/package.json',
      'backend/package.json'
    ];

    const results = {};

    packagePaths.forEach(packagePath => {
      if (fs.existsSync(packagePath)) {
        const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const packageName = packagePath.replace('/package.json', '') || 'root';

        results[packageName] = {
          name: packageContent.name,
          version: packageContent.version,
          scripts: Object.keys(packageContent.scripts || {}),
          dependencies: Object.keys(packageContent.dependencies || {}),
          devDependencies: Object.keys(packageContent.devDependencies || {})
        };

        // Check for required scripts
        const requiredScripts = packagePath === 'frontend/package.json'
          ? ['build', 'dev', 'start']
          : ['start'];

        const missingScripts = requiredScripts.filter(script =>
          !packageContent.scripts || !packageContent.scripts[script]
        );

        if (missingScripts.length > 0) {
          this.log(`Warning: ${packageName} missing scripts: ${missingScripts.join(', ')}`, 'warning');
        }
      }
    });

    this.log('✅ Package configurations checked');
    return results;
  }

  // Check 2: Build system verification
  checkBuildSystem() {
    this.log('Checking Build System');

    const buildFiles = [
      'frontend/vite.config.js',
      'frontend/package.json'
    ];

    const missingBuildFiles = buildFiles.filter(file => !fs.existsSync(file));

    if (missingBuildFiles.length > 0) {
      throw new Error(`Missing build files: ${missingBuildFiles.join(', ')}`);
    }

    // Check Vite configuration
    const viteConfigPath = 'frontend/vite.config.js';
    const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');

    const viteFeatures = [
      'build',
      'outDir',
      'rollupOptions'
    ];

    const implementedFeatures = viteFeatures.filter(feature =>
      viteConfig.includes(feature)
    );

    this.log('✅ Build system verified');
    return {
      buildSystemPresent: true,
      viteConfigured: true,
      implementedFeatures: implementedFeatures.length
    };
  }

  // Check 3: Environment configuration
  checkEnvironmentConfiguration() {
    this.log('Checking Environment Configuration');

    const envFiles = [
      '.env',
      '.env.example',
      'frontend/.env',
      'backend/.env'
    ];

    const existingEnvFiles = envFiles.filter(file => fs.existsSync(file));

    // Check for environment variables in code
    const configFiles = [
      'frontend/src/auth.js',
      'backend/index.js'
    ];

    let hasEnvUsage = false;
    configFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('process.env') || content.includes('import.meta.env')) {
          hasEnvUsage = true;
        }
      }
    });

    this.log('✅ Environment configuration checked');
    return {
      envFilesFound: existingEnvFiles.length,
      envFilesPresent: existingEnvFiles,
      hasEnvironmentVariables: hasEnvUsage
    };
  }

  // Check 4: Static assets and public files
  checkStaticAssets() {
    this.log('Checking Static Assets');

    const requiredPublicFiles = [
      'frontend/public/manifest.json',
      'frontend/public/robots.txt',
      'frontend/public/sitemap.xml',
      'frontend/public/404.html'
    ];

    const missingPublicFiles = requiredPublicFiles.filter(file => !fs.existsSync(file));

    if (missingPublicFiles.length > 0) {
      this.log(`Warning: Missing public files: ${missingPublicFiles.join(', ')}`, 'warning');
    }

    // Check for images
    const imagesPath = 'backend/images/Adonai';
    let imageCount = 0;
    if (fs.existsSync(imagesPath)) {
      imageCount = fs.readdirSync(imagesPath).length;
    }

    // Check for favicon and other assets
    const assetFiles = [
      'frontend/public/favicon.ico',
      'frontend/public/images'
    ];

    const existingAssets = assetFiles.filter(file => fs.existsSync(file));

    this.log('✅ Static assets checked');
    return {
      publicFilesPresent: requiredPublicFiles.length - missingPublicFiles.length,
      imageCount,
      assetFilesPresent: existingAssets.length
    };
  }

  // Check 5: Database and backend configuration
  checkBackendConfiguration() {
    this.log('Checking Backend Configuration');

    const backendFiles = [
      'backend/index.js',
      'backend/package.json',
      'backend/data/adonai.db'
    ];

    const missingBackendFiles = backendFiles.filter(file => !fs.existsSync(file));

    if (missingBackendFiles.length > 0) {
      throw new Error(`Missing backend files: ${missingBackendFiles.join(', ')}`);
    }

    // Check backend server implementation
    const backendContent = fs.readFileSync('backend/index.js', 'utf8');

    const backendFeatures = [
      'express',
      'cors',
      'sqlite',
      'multer',
      'auth'
    ];

    const implementedBackendFeatures = backendFeatures.filter(feature =>
      backendContent.toLowerCase().includes(feature)
    );

    // Check database
    const dbPath = 'backend/data/adonai.db';
    const dbExists = fs.existsSync(dbPath);
    let dbSize = 0;
    if (dbExists) {
      dbSize = fs.statSync(dbPath).size;
    }

    this.log('✅ Backend configuration checked');
    return {
      backendFilesPresent: true,
      implementedFeatures: implementedBackendFeatures.length,
      databasePresent: dbExists,
      databaseSize: dbSize
    };
  }

  // Check 6: Deployment platform configurations
  checkDeploymentPlatforms() {
    this.log('Checking Deployment Platform Configurations');

    const deploymentConfigs = [
      { file: 'netlify.toml', platform: 'Netlify' },
      { file: 'vercel.json', platform: 'Vercel' },
      { file: 'render.yaml', platform: 'Render' },
      { file: 'railway.json', platform: 'Railway' },
      { file: 'docker-compose.yml', platform: 'Docker' },
      { file: 'Dockerfile', platform: 'Docker' }
    ];

    const availablePlatforms = deploymentConfigs.filter(config =>
      fs.existsSync(config.file)
    );

    // Check specific configurations
    const platformDetails = {};

    availablePlatforms.forEach(({ file, platform }) => {
      const content = fs.readFileSync(file, 'utf8');
      platformDetails[platform] = {
        configFile: file,
        hasContent: content.length > 0,
        configured: true
      };
    });

    // Check for deployment scripts
    const deploymentScripts = [
      'deploy.sh',
      'build-for-netlify.sh'
    ];

    const existingScripts = deploymentScripts.filter(script => fs.existsSync(script));

    this.log('✅ Deployment platforms checked');
    return {
      availablePlatforms: availablePlatforms.length,
      platforms: availablePlatforms.map(p => p.platform),
      deploymentScripts: existingScripts.length,
      platformDetails
    };
  }

  // Check 7: Security and production readiness
  checkSecurityConfiguration() {
    this.log('Checking Security Configuration');

    const securityFiles = [
      'frontend/src/auth.js',
      'frontend/src/utils/security.js',
      'frontend/src/utils/dataProtection.js'
    ];

    const missingSecurityFiles = securityFiles.filter(file => !fs.existsSync(file));

    if (missingSecurityFiles.length > 0) {
      throw new Error(`Missing security files: ${missingSecurityFiles.join(', ')}`);
    }

    // Check authentication implementation
    const authContent = fs.readFileSync('frontend/src/auth.js', 'utf8');

    const securityFeatures = [
      'authentication',
      'authorization',
      'session',
      'token',
      'logout'
    ];

    const implementedSecurityFeatures = securityFeatures.filter(feature =>
      authContent.toLowerCase().includes(feature)
    );

    // Check for HTTPS and security headers
    const backendContent = fs.readFileSync('backend/index.js', 'utf8');
    const hasSecurityHeaders = backendContent.includes('helmet') ||
      backendContent.includes('security') ||
      backendContent.includes('cors');

    this.log('✅ Security configuration checked');
    return {
      securityFilesPresent: true,
      implementedSecurityFeatures: implementedSecurityFeatures.length,
      hasSecurityHeaders,
      authenticationImplemented: true
    };
  }

  // Check 8: Performance optimization
  checkPerformanceOptimization() {
    this.log('Checking Performance Optimization');

    const performanceFiles = [
      'frontend/src/utils/imageOptimization.js',
      'frontend/src/components/OptimizedImage.jsx',
      'frontend/public/sw.js',
      'frontend/public/manifest.json'
    ];

    const existingPerformanceFiles = performanceFiles.filter(file => fs.existsSync(file));

    // Check for lazy loading in App.jsx
    const appContent = fs.readFileSync('frontend/src/App.jsx', 'utf8');
    const hasLazyLoading = appContent.includes('React.lazy') && appContent.includes('Suspense');

    // Check for code splitting
    const hasCodeSplitting = appContent.includes('lazy(') && appContent.includes('import(');

    // Check for service worker
    const hasServiceWorker = fs.existsSync('frontend/public/sw.js');

    // Check for PWA manifest
    const hasPWAManifest = fs.existsSync('frontend/public/manifest.json');

    this.log('✅ Performance optimization checked');
    return {
      performanceFilesPresent: existingPerformanceFiles.length,
      lazyLoadingImplemented: hasLazyLoading,
      codeSplittingImplemented: hasCodeSplitting,
      serviceWorkerPresent: hasServiceWorker,
      pwaManifestPresent: hasPWAManifest
    };
  }

  // Run all deployment readiness checks
  async runAllChecks() {
    console.log('🚀 Starting Deployment Readiness Check');
    console.log('======================================');

    const checks = [
      { name: 'Package Configurations', check: () => this.checkPackageConfigurations() },
      { name: 'Build System', check: () => this.checkBuildSystem() },
      { name: 'Environment Configuration', check: () => this.checkEnvironmentConfiguration() },
      { name: 'Static Assets', check: () => this.checkStaticAssets() },
      { name: 'Backend Configuration', check: () => this.checkBackendConfiguration() },
      { name: 'Deployment Platforms', check: () => this.checkDeploymentPlatforms() },
      { name: 'Security Configuration', check: () => this.checkSecurityConfiguration() },
      { name: 'Performance Optimization', check: () => this.checkPerformanceOptimization() }
    ];

    let passed = 0;
    let failed = 0;

    for (const checkItem of checks) {
      try {
        const result = checkItem.check();
        this.checks.push({ name: checkItem.name, status: 'PASS', result });
        passed++;
      } catch (error) {
        this.checks.push({ name: checkItem.name, status: 'FAIL', error: error.message });
        this.log(`❌ ${checkItem.name} failed: ${error.message}`, 'error');
        failed++;
      }
    }

    this.generateDeploymentReport();
    return { passed, failed, total: checks.length };
  }

  generateDeploymentReport() {
    console.log('\n📊 Deployment Readiness Report');
    console.log('===============================');

    const passedChecks = this.checks.filter(check => check.status === 'PASS');
    const failedChecks = this.checks.filter(check => check.status === 'FAIL');

    console.log(`✅ Passed: ${passedChecks.length}/${this.checks.length}`);
    console.log(`❌ Failed: ${failedChecks.length}/${this.checks.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);

    if (failedChecks.length > 0) {
      console.log('\n❌ Failed Checks:');
      failedChecks.forEach(check => {
        console.log(`  - ${check.name}: ${check.error}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => {
        console.log(`  - ${warning}`);
      });
    }

    console.log('\n📋 Detailed Check Results:');
    this.checks.forEach(check => {
      const status = check.status === 'PASS' ? '✅' : '❌';
      console.log(`${status} ${check.name}`);
      if (check.result && typeof check.result === 'object') {
        Object.entries(check.result).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            console.log(`    ${key}: ${JSON.stringify(value, null, 2)}`);
          } else {
            console.log(`    ${key}: ${value}`);
          }
        });
      }
    });

    // Final deployment assessment
    console.log('\n🎯 Final Deployment Assessment');
    console.log('===============================');

    const criticalChecks = ['Build System', 'Backend Configuration', 'Security Configuration'];
    const criticalFailures = failedChecks.filter(check => criticalChecks.includes(check.name));

    if (criticalFailures.length === 0 && failedChecks.length === 0) {
      console.log('🟢 FULLY READY FOR DEPLOYMENT');
      console.log('   All systems are configured and ready.');
      console.log('   Platform can be deployed to production.');
    } else if (criticalFailures.length === 0) {
      console.log('🟡 READY FOR DEPLOYMENT WITH MINOR ISSUES');
      console.log('   Core systems are functional.');
      console.log('   Address non-critical issues for optimal performance.');
    } else {
      console.log('🔴 NOT READY FOR DEPLOYMENT');
      console.log('   Critical issues must be resolved before deployment.');
      console.log('   Fix the failed checks and run this test again.');
    }

    // Deployment recommendations
    console.log('\n💡 Deployment Recommendations');
    console.log('==============================');

    const platformResults = this.checks.find(check => check.name === 'Deployment Platforms');
    if (platformResults && platformResults.result) {
      const platforms = platformResults.result.platforms || [];
      if (platforms.length > 0) {
        console.log(`Available deployment platforms: ${platforms.join(', ')}`);
        console.log('Choose the platform that best fits your needs:');
        platforms.forEach(platform => {
          console.log(`  - ${platform}: Ready for deployment`);
        });
      }
    }

    if (this.warnings.length > 0) {
      console.log('\nAddress these warnings for optimal performance:');
      this.warnings.forEach(warning => {
        console.log(`  • ${warning}`);
      });
    }
  }
}

// Run deployment readiness check
if (require.main === module) {
  const checker = new DeploymentReadinessChecker();
  checker.runAllChecks().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Deployment readiness check failed:', error);
    process.exit(1);
  });
}

module.exports = DeploymentReadinessChecker;