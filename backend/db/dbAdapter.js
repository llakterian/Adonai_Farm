// Database adapter to support SQLite (better-sqlite3) and Postgres (pg)
// It exposes a minimal API compatible with the usage in index.js:
//   db.prepare(sql).get(...args)
//   db.prepare(sql).all(...args)
//   db.prepare(sql).run(...args)
// When DATABASE_URL is present, it uses Postgres; otherwise it uses SQLite.

const path = require('path');
const fs = require('fs');

function makePgAdapter(databaseUrl) {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

    // Convert SQLite "?" placeholders to Postgres $1, $2, ... and adjust some functions
    function convertSql(sql) {
        // Replace SQLite datetime("now") with Postgres NOW()
        let out = sql.replace(/datetime\(["']now["']\)/gi, 'NOW()');

        let index = 0;
        out = out.replace(/\?/g, () => {
            index += 1;
            return `$${index}`;
        });
        return out;
    }

    return {
        prepare(sql) {
            const converted = convertSql(sql);
            return {
                async get(...args) {
                    const res = await pool.query(converted, args);
                    return res.rows[0] || null;
                },
                async all(...args) {
                    const res = await pool.query(converted, args);
                    return res.rows;
                },
                async run(...args) {
                    const res = await pool.query(converted, args);
                    return { rowCount: res.rowCount, rows: res.rows };
                }
            };
        },
        // Expose a simple query helper (optional)
        async query(sql, params = []) { return pool.query(convertSql(sql), params); }
    };
}

function makeSqliteAdapter() {
    const DB_DIR = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR);
    const dbPath = path.join(DB_DIR, 'adonai.db');
    const Database = require('better-sqlite3');
    const sqlite = new Database(dbPath);

    return {
        prepare(sql) {
            const stmt = sqlite.prepare(sql);
            return {
                get: (...args) => stmt.get(...args),
                all: (...args) => stmt.all(...args),
                run: (...args) => stmt.run(...args)
            };
        },
        // For parity
        query(sql, params = []) { return sqlite.prepare(sql).all(...params); }
    };
}

function createDb() {
    const url = process.env.DATABASE_URL;
    if (url) {
        return makePgAdapter(url);
    }
    return makeSqliteAdapter();
}

module.exports = { createDb };