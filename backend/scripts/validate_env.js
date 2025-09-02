#!/usr/bin/env node
/**
 * Environment Variable Validation Script for Railway Deployment
 * Validates and sets default values for required environment variables
 */

require('dotenv').config();

const requiredVars = {
    NODE_ENV: {
        default: 'production',
        description: 'Node environment'
    },
    PORT: {
        default: '4000',
        description: 'Server port'
    },
    JWT_SECRET: {
        required: true,
        description: 'JWT secret for authentication'
    }
};

const optionalVars = {
    DATABASE_URL: {
        description: 'PostgreSQL connection string (if not provided, uses SQLite)'
    },
    FRONTEND_URL: {
        default: 'http://localhost:3000',
        description: 'Frontend URL for CORS'
    },
    SMTP_HOST: {
        description: 'SMTP server host for email'
    },
    SMTP_PORT: {
        default: '587',
        description: 'SMTP server port'
    },
    SMTP_SECURE: {
        default: 'false',
        description: 'Use SSL for SMTP'
    }
};

function validateEnvironment() {
    console.log('🔍 Validating environment variables...');
    
    let hasErrors = false;
    const warnings = [];
    
    // Check required variables
    for (const [key, config] of Object.entries(requiredVars)) {
        if (!process.env[key]) {
            if (config.default) {
                process.env[key] = config.default;
                console.log(`✅ ${key}: Using default value "${config.default}"`);
            } else if (config.required) {
                console.error(`❌ ${key}: Required environment variable missing`);
                console.error(`   Description: ${config.description}`);
                hasErrors = true;
            }
        } else {
            console.log(`✅ ${key}: Set`);
        }
    }
    
    // Check optional variables
    for (const [key, config] of Object.entries(optionalVars)) {
        if (!process.env[key]) {
            if (config.default) {
                process.env[key] = config.default;
                console.log(`⚠️  ${key}: Using default value "${config.default}"`);
            } else {
                warnings.push(`${key}: ${config.description}`);
            }
        } else {
            console.log(`✅ ${key}: Set`);
        }
    }
    
    // Display warnings for missing optional variables
    if (warnings.length > 0) {
        console.log('\n⚠️  Optional environment variables not set:');
        warnings.forEach(warning => console.log(`   ${warning}`));
    }
    
    // Database mode detection
    if (process.env.DATABASE_URL) {
        console.log('\n🐘 Database mode: PostgreSQL (Production)');
        console.log(`   Connection: ${process.env.DATABASE_URL.replace(/:[^:@]*@/, ':***@')}`);
    } else {
        console.log('\n🗃️  Database mode: SQLite (Development)');
    }
    
    if (hasErrors) {
        console.error('\n❌ Environment validation failed. Please set required variables.');
        process.exit(1);
    }
    
    console.log('\n✅ Environment validation passed');
    return true;
}

// Run validation if called directly
if (require.main === module) {
    validateEnvironment();
}

module.exports = { validateEnvironment };