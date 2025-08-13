const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const DB_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR);
const dbPath = path.join(DB_DIR, 'adonai.db');
const db = new Database(dbPath);

function run() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password_hash TEXT
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS animals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      name TEXT,
      dob TEXT,
      sex TEXT,
      notes TEXT
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT,
      path TEXT,
      uploaded_at TEXT
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS workers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      employee_id TEXT UNIQUE,
      role TEXT,
      hourly_rate REAL DEFAULT 0,
      phone TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS time_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id INTEGER,
      clock_in TEXT,
      clock_out TEXT,
      hours_worked REAL,
      date TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (worker_id) REFERENCES workers (id)
    );
  `);

  const row = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
  if (!row) {
    const hash = bcrypt.hashSync('adonai123', 10);
    db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run('admin', hash);
    console.log('Seeded admin user (admin/adonai123)');
  } else {
    console.log('Admin user already present');
  }

  const count = db.prepare('SELECT COUNT(*) as c FROM animals').get().c;
  if (count === 0) {
    const animals = [
      ['Dairy Cattle','Bella','2022-03-10','F','High yield cow'],
      ['Beef Cattle','Max','2021-06-01','M','Great frame'],
      ['Dairy Goat','Luna','2023-01-15','F','Produces well'],
      ['Pedigree Sheep','Shaun','2020-09-01','M','Healthy pedigree']
    ];
    const stmt = db.prepare('INSERT INTO animals (type,name,dob,sex,notes) VALUES (?,?,?,?,?)');
    for (const a of animals) stmt.run(...a);
    console.log('Seeded demo animals');
  } else {
    console.log('Animals already seeded');
  }

  const workerCount = db.prepare('SELECT COUNT(*) as c FROM workers').get().c;
  if (workerCount === 0) {
    const workers = [
      ['John Kamau', 'EMP001', 'Farm Worker', 500, '+254712345678'],
      ['Mary Wanjiku', 'EMP002', 'Milkman', 600, '+254723456789'],
      ['Peter Mwangi', 'EMP003', 'Driver', 800, '+254734567890'],
      ['Grace Akinyi', 'EMP004', 'Farm Worker', 500, '+254745678901'],
      ['Samuel Kiprop', 'EMP005', 'Supervisor', 1200, '+254756789012'],
      ['Faith Njeri', 'EMP006', 'Milkman', 600, '+254767890123'],
      ['David Ochieng', 'EMP007', 'Driver', 800, '+254778901234'],
      ['Rose Wambui', 'EMP008', 'Farm Worker', 500, '+254789012345']
    ];
    const stmt = db.prepare('INSERT INTO workers (name, employee_id, role, hourly_rate, phone) VALUES (?, ?, ?, ?, ?)');
    for (const w of workers) stmt.run(...w);
    console.log('Seeded demo workers');
  } else {
    console.log('Workers already seeded');
  }
  
  console.log('Migration + seeding complete.');
}
run();
