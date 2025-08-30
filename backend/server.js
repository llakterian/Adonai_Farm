// Entrypoint that selects the appropriate server based on env
require('dotenv').config();

if (process.env.DATABASE_URL) {
    console.log('[server] DATABASE_URL detected -> starting Postgres server');
    require('./server_pg');
} else {
    console.log('[server] No DATABASE_URL -> starting SQLite server');
    require('./index');
}