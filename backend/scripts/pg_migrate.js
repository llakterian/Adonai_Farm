// Create tables in Postgres matching the SQLite schema, with a few additions for photos
require('dotenv').config();
const { createDb } = require('../db/dbAdapter');

(async () => {
    const db = createDb();

    // Users
    await db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE,
      password_hash TEXT
    );
  `).run();

    // Animals
    await db.prepare(`
    CREATE TABLE IF NOT EXISTS animals (
      id SERIAL PRIMARY KEY,
      type TEXT,
      name TEXT,
      dob TEXT,
      sex TEXT,
      notes TEXT
    );
  `).run();

    // Photos (extended)
    await db.prepare(`
    CREATE TABLE IF NOT EXISTS photos (
      id SERIAL PRIMARY KEY,
      filename TEXT,
      path TEXT,
      uploaded_at TIMESTAMPTZ DEFAULT NOW(),
      public_id TEXT,
      secure_url TEXT
    );
  `).run();

    // Workers
    await db.prepare(`
    CREATE TABLE IF NOT EXISTS workers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      employee_id TEXT UNIQUE,
      role TEXT,
      hourly_rate REAL DEFAULT 0,
      phone TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `).run();

    // Time entries
    await db.prepare(`
    CREATE TABLE IF NOT EXISTS time_entries (
      id SERIAL PRIMARY KEY,
      worker_id INTEGER REFERENCES workers(id) ON DELETE CASCADE,
      clock_in TIMESTAMPTZ,
      clock_out TIMESTAMPTZ,
      hours_worked REAL,
      date TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `).run();

    console.log('Postgres migration complete');
    process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });