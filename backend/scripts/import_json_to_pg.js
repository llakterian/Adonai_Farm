// Import data from JSON exports into Postgres
// Usage: DATABASE_URL=... node scripts/import_json_to_pg.js
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { createDb } = require('../db/dbAdapter');

(async () => {
    try {
        const url = process.env.DATABASE_URL;
        if (!url) {
            console.error('DATABASE_URL is required to import into Postgres');
            process.exit(1);
        }

        const db = createDb();
        const exportsDir = path.join(__dirname, '..', 'exports');
        if (!fs.existsSync(exportsDir)) {
            console.error('Exports directory not found:', exportsDir);
            process.exit(1);
        }

        function readJson(name) {
            const p = path.join(exportsDir, `${name}.json`);
            if (!fs.existsSync(p)) return [];
            return JSON.parse(fs.readFileSync(p, 'utf8'));
        }

        const users = readJson('users');
        const animals = readJson('animals');
        const workers = readJson('workers');
        const timeEntries = readJson('time_entries');
        const photos = readJson('photos');

        // Create tables if not present (idempotent)
        await db.prepare(`CREATE TABLE IF NOT EXISTS users ( id SERIAL PRIMARY KEY, username TEXT UNIQUE, password_hash TEXT );`).run();
        await db.prepare(`CREATE TABLE IF NOT EXISTS animals ( id SERIAL PRIMARY KEY, type TEXT, name TEXT, dob TEXT, sex TEXT, notes TEXT );`).run();
        await db.prepare(`CREATE TABLE IF NOT EXISTS workers ( id SERIAL PRIMARY KEY, name TEXT NOT NULL, employee_id TEXT UNIQUE, role TEXT, hourly_rate REAL DEFAULT 0, phone TEXT, created_at TIMESTAMPTZ DEFAULT NOW() );`).run();
        await db.prepare(`CREATE TABLE IF NOT EXISTS time_entries ( id SERIAL PRIMARY KEY, worker_id INTEGER REFERENCES workers(id) ON DELETE CASCADE, clock_in TIMESTAMPTZ, clock_out TIMESTAMPTZ, hours_worked REAL, date TEXT, notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW() );`).run();
        await db.prepare(`CREATE TABLE IF NOT EXISTS photos ( id SERIAL PRIMARY KEY, filename TEXT, path TEXT, uploaded_at TIMESTAMPTZ DEFAULT NOW(), public_id TEXT, secure_url TEXT );`).run();

        // Import in order: users, animals, workers, time_entries, photos
        for (const u of users) {
            await db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?) ON CONFLICT (username) DO NOTHING').run(u.username, u.password_hash);
        }

        for (const a of animals) {
            await db.prepare('INSERT INTO animals (type, name, dob, sex, notes) VALUES (?, ?, ?, ?, ?)').run(a.type, a.name, a.dob, a.sex, a.notes);
        }

        for (const w of workers) {
            await db.prepare('INSERT INTO workers (name, employee_id, role, hourly_rate, phone, created_at) VALUES (?, ?, ?, ?, ?, NOW()) ON CONFLICT (employee_id) DO NOTHING').run(w.name, w.employee_id, w.role, w.hourly_rate, w.phone);
        }

        for (const t of timeEntries) {
            await db.prepare('INSERT INTO time_entries (worker_id, clock_in, clock_out, hours_worked, date, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())').run(t.worker_id, t.clock_in, t.clock_out, t.hours_worked, t.date, t.notes);
        }

        for (const p of photos) {
            await db.prepare('INSERT INTO photos (filename, path, uploaded_at) VALUES (?, ?, NOW())').run(p.filename, p.path);
        }

        console.log('JSON -> Postgres import complete');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();