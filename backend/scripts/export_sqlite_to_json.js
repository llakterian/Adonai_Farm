// Export data from SQLite into JSON files for offline transfer/import
// Usage: node scripts/export_sqlite_to_json.js

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

function ensureDir(p) {
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

(async () => {
    try {
        const DB_DIR = path.join(__dirname, '..', 'data');
        const dbPath = path.join(DB_DIR, 'adonai.db');
        if (!fs.existsSync(dbPath)) {
            console.error('SQLite DB not found at', dbPath);
            process.exit(1);
        }

        const outDir = path.join(__dirname, '..', 'exports');
        ensureDir(outDir);

        const sqlite = new Database(dbPath, { readonly: true });

        const tables = [
            { name: 'users', query: 'SELECT id, username, password_hash FROM users' },
            { name: 'animals', query: 'SELECT id, type, name, dob, sex, notes FROM animals' },
            { name: 'workers', query: 'SELECT id, name, employee_id, role, hourly_rate, phone FROM workers' },
            { name: 'time_entries', query: 'SELECT id, worker_id, clock_in, clock_out, hours_worked, date, notes FROM time_entries' },
        ];

        // Photos table may not exist in SQLite
        try {
            sqlite.prepare('SELECT 1 FROM photos LIMIT 1').get();
            tables.push({ name: 'photos', query: 'SELECT id, filename, path, uploaded_at FROM photos' });
        } catch (_) {
            // skip if not exists
        }

        const summary = {};

        for (const t of tables) {
            const rows = sqlite.prepare(t.query).all();
            const filePath = path.join(outDir, `${t.name}.json`);
            fs.writeFileSync(filePath, JSON.stringify(rows, null, 2));
            summary[t.name] = rows.length;
            console.log(`Exported ${rows.length} rows -> ${path.relative(process.cwd(), filePath)}`);
        }

        const summaryPath = path.join(outDir, '_summary.json');
        fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
        console.log('Export complete. Summary:', summary);

        process.exit(0);
    } catch (e) {
        console.error('Export failed:', e);
        process.exit(1);
    }
})();