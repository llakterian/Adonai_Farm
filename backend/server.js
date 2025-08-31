// Entrypoint that selects the appropriate server based on env
const path = require('path');
const envPath = path.join(__dirname, '.env');
require('dotenv').config({ path: envPath, override: true });

if (process.env.DATABASE_URL) {
    console.log('[server] DATABASE_URL detected -> starting Postgres server');
    require('./server_pg');
} else {
    console.log('[server] No DATABASE_URL -> starting SQLite server');
    require('./index');
}