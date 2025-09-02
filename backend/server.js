// Entrypoint that selects the appropriate server based on env
const path = require('path');
const envPath = path.join(__dirname, '.env');
require('dotenv').config({ path: envPath, override: true });

// Validate environment variables for Railway deployment
try {
    const { validateEnvironment } = require('./scripts/validate_env');
    validateEnvironment();
} catch (error) {
    console.warn('⚠️  Environment validation script not found, continuing...');
}

// Set default values for critical variables if not set
if (!process.env.PORT) {
    process.env.PORT = '4000';
    console.log('[server] PORT not set, using default: 4000');
}

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
    console.log('[server] NODE_ENV not set, using default: production');
}

if (!process.env.JWT_SECRET) {
    console.error('[server] ❌ JWT_SECRET is required but not set');
    process.exit(1);
}

console.log(`[server] Starting in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`);

if (process.env.DATABASE_URL) {
    console.log('[server] DATABASE_URL detected -> starting Postgres server');
    require('./server_pg');
} else {
    console.log('[server] No DATABASE_URL -> starting SQLite server');
    require('./index');
}