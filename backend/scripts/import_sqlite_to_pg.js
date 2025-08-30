// Import data from existing SQLite DB to Postgres
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const { createDb } = require('../db/dbAdapter');

(async () => {
    const DB_DIR = path.join(__dirname, '..', 'data');
    const dbPath = path.join(DB_DIR, 'adonai.db');
    if (!fs.existsSync(dbPath)) {
        console.error('SQLite DB not found at', dbPath);
        process.exit(1);
    }

    const sqlite = new Database(dbPath);
    const pg = createDb();

    // Users
    const users = sqlite.prepare('SELECT * FROM users').all();
    for (const u of users) {
        await pg.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?) ON CONFLICT (username) DO NOTHING')
            .run(u.username, u.password_hash);
    }

    // Animals
    const animals = sqlite.prepare('SELECT * FROM animals').all();
    for (const a of animals) {
        await pg.prepare('INSERT INTO animals (type, name, dob, sex, notes) VALUES (?, ?, ?, ?, ?)')
            .run(a.type, a.name, a.dob, a.sex, a.notes);
    }

    // Workers
    const workers = sqlite.prepare('SELECT * FROM workers').all();
    for (const w of workers) {
        await pg.prepare('INSERT INTO workers (name, employee_id, role, hourly_rate, phone, created_at) VALUES (?, ?, ?, ?, ?, NOW()) ON CONFLICT (employee_id) DO NOTHING')
            .run(w.name, w.employee_id, w.role, w.hourly_rate, w.phone);
    }

    // Time entries
    const tes = sqlite.prepare('SELECT * FROM time_entries').all();
    for (const t of tes) {
        await pg.prepare('INSERT INTO time_entries (worker_id, clock_in, clock_out, hours_worked, date, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())')
            .run(t.worker_id, t.clock_in, t.clock_out, t.hours_worked, t.date, t.notes);
    }

    // Photos (only filename/path and uploaded_at if present; Cloudinary fields empty)
    try {
        const photos = sqlite.prepare('SELECT * FROM photos').all();
        for (const p of photos) {
            await pg.prepare('INSERT INTO photos (filename, path, uploaded_at) VALUES (?, ?, NOW())')
                .run(p.filename, p.path);
        }
    } catch (e) {
        console.log('No photos table in SQLite or import error:', e.message);
    }

    console.log('SQLite -> Postgres import complete');
    process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });