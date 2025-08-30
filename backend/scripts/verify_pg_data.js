// Verify data was imported correctly into Postgres
// Usage: DATABASE_URL=... node scripts/verify_pg_data.js
require('dotenv').config();
const { createDb } = require('../db/dbAdapter');

(async () => {
    try {
        const url = process.env.DATABASE_URL;
        if (!url) {
            console.error('DATABASE_URL is required');
            process.exit(1);
        }

        console.log('Connecting to Postgres...');
        const db = createDb();

        // Count rows in each table
        const tables = ['users', 'animals', 'workers', 'time_entries', 'photos'];
        const counts = {};

        for (const table of tables) {
            try {
                const result = await db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
                counts[table] = result.count;
                console.log(`${table}: ${result.count} rows`);
            } catch (e) {
                console.log(`${table}: ERROR - ${e.message}`);
                counts[table] = 'ERROR';
            }
        }

        // Sample some data
        console.log('\nSample data:');
        try {
            const users = await db.prepare('SELECT id, username FROM users LIMIT 2').all();
            console.log('Users:', users);
        } catch (e) {
            console.log('Users sample failed:', e.message);
        }

        try {
            const animals = await db.prepare('SELECT id, type, name FROM animals LIMIT 3').all();
            console.log('Animals:', animals);
        } catch (e) {
            console.log('Animals sample failed:', e.message);
        }

        try {
            const workers = await db.prepare('SELECT id, name, role FROM workers LIMIT 3').all();
            console.log('Workers:', workers);
        } catch (e) {
            console.log('Workers sample failed:', e.message);
        }

        console.log('\nVerification complete');
        process.exit(0);
    } catch (e) {
        console.error('Verification failed:', e);
        process.exit(1);
    }
})();