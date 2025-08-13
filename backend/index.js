const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();

const DB_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR);

const dbPath = path.join(DB_DIR, 'adonai.db');
const Database = require('better-sqlite3');
const db = new Database(dbPath);

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Invalid Authorization header' });
  try {
    const payload = jwt.verify(parts[1], JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.post('/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username & password required' });
  const row = db.prepare('SELECT id, username, password_hash FROM users WHERE username = ?').get(username);
  if (!row) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = bcrypt.compareSync(password, row.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: row.id, username: row.username }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token });
});

app.put('/auth/update', authMiddleware, (req, res) => {
  const { currentPassword, newUsername, newPassword } = req.body || {};
  if (!currentPassword) return res.status(400).json({ error: 'currentPassword required' });
  const row = db.prepare('SELECT id, username, password_hash FROM users WHERE id = ?').get(req.user.id);
  if (!row) return res.status(404).json({ error: 'User not found' });
  const ok = bcrypt.compareSync(currentPassword, row.password_hash);
  if (!ok) return res.status(401).json({ error: 'Current password incorrect' });
  const updates = [];
  const params = [];
  if (newUsername) { updates.push('username = ?'); params.push(newUsername); }
  if (newPassword) { const hash = bcrypt.hashSync(newPassword, 10); updates.push('password_hash = ?'); params.push(hash); }
  if (updates.length === 0) return res.status(400).json({ error: 'No changes provided' });
  params.push(row.id);
  db.prepare('UPDATE users SET ' + updates.join(', ') + ' WHERE id = ?').run(...params);
  res.json({ success: true });
});

app.get('/api/livestock', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM animals ORDER BY id DESC').all();
  res.json(rows);
});

app.post('/api/livestock', authMiddleware, (req, res) => {
  const { type, name, dob, sex, notes } = req.body || {};
  const stmt = db.prepare('INSERT INTO animals (type, name, dob, sex, notes) VALUES (?, ?, ?, ?, ?)');
  const info = stmt.run(type, name, dob, sex, notes);
  const row = db.prepare('SELECT * FROM animals WHERE id = ?').get(info.lastInsertRowid);
  res.json(row);
});

app.put('/api/livestock/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { type, name, dob, sex, notes } = req.body || {};
  
  // Check if animal exists
  const existing = db.prepare('SELECT * FROM animals WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Animal not found' });
  }
  
  // Update the animal
  const stmt = db.prepare('UPDATE animals SET type = ?, name = ?, dob = ?, sex = ?, notes = ? WHERE id = ?');
  stmt.run(type, name, dob, sex, notes, id);
  
  // Return updated animal
  const updated = db.prepare('SELECT * FROM animals WHERE id = ?').get(id);
  res.json(updated);
});

app.delete('/api/livestock/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  
  // Check if animal exists
  const existing = db.prepare('SELECT * FROM animals WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Animal not found' });
  }
  
  // Delete the animal
  const stmt = db.prepare('DELETE FROM animals WHERE id = ?');
  const result = stmt.run(id);
  
  if (result.changes > 0) {
    res.json({ success: true, message: 'Animal deleted successfully' });
  } else {
    res.status(500).json({ error: 'Failed to delete animal' });
  }
});

app.get('/api/reports/animals.csv', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM animals').all();
  const csv = rows.map(r => `${r.id},"${r.type}","${r.name}",${r.dob},${r.sex},"${(r.notes||'').replace(/"/g,'""')}"`).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="animals.csv"');
  res.send('id,type,name,dob,sex,notes\n' + csv);
});

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadDir); },
  filename: function (req, file, cb) { const name = Date.now() + '-' + file.originalname; cb(null, name); }
});
const upload = multer({ storage });
app.post('/api/gallery/upload', authMiddleware, upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = '/uploads/' + req.file.filename;
  db.prepare('INSERT INTO photos (filename, path, uploaded_at) VALUES (?, ?, datetime("now"))').run(req.file.originalname, url);
  res.json({ url, filename: req.file.originalname });
});

app.get('/api/gallery', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM photos ORDER BY id DESC').all();
  res.json(rows);
});

// Worker Management APIs
app.get('/api/workers', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM workers ORDER BY name').all();
  res.json(rows);
});

app.post('/api/workers', authMiddleware, (req, res) => {
  const { name, employee_id, role, hourly_rate, phone } = req.body || {};
  if (!name || !employee_id) {
    return res.status(400).json({ error: 'Name and employee ID are required' });
  }
  
  try {
    const stmt = db.prepare('INSERT INTO workers (name, employee_id, role, hourly_rate, phone) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(name, employee_id, role || '', hourly_rate || 0, phone || '');
    const worker = db.prepare('SELECT * FROM workers WHERE id = ?').get(info.lastInsertRowid);
    res.json(worker);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(400).json({ error: 'Employee ID already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create worker' });
    }
  }
});

app.put('/api/workers/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { name, employee_id, role, hourly_rate, phone } = req.body || {};
  
  const existing = db.prepare('SELECT * FROM workers WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Worker not found' });
  }
  
  try {
    const stmt = db.prepare('UPDATE workers SET name = ?, employee_id = ?, role = ?, hourly_rate = ?, phone = ? WHERE id = ?');
    stmt.run(name, employee_id, role, hourly_rate, phone, id);
    const updated = db.prepare('SELECT * FROM workers WHERE id = ?').get(id);
    res.json(updated);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(400).json({ error: 'Employee ID already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update worker' });
    }
  }
});

app.delete('/api/workers/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  
  const existing = db.prepare('SELECT * FROM workers WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Worker not found' });
  }
  
  // Delete associated time entries first
  db.prepare('DELETE FROM time_entries WHERE worker_id = ?').run(id);
  
  // Delete the worker
  const result = db.prepare('DELETE FROM workers WHERE id = ?').run(id);
  
  if (result.changes > 0) {
    res.json({ success: true, message: 'Worker deleted successfully' });
  } else {
    res.status(500).json({ error: 'Failed to delete worker' });
  }
});

// Time Tracking APIs
app.get('/api/time-entries', authMiddleware, (req, res) => {
  const { worker_id, date_from, date_to } = req.query;
  
  let query = `
    SELECT te.*, w.name as worker_name, w.employee_id, w.role, w.hourly_rate
    FROM time_entries te
    JOIN workers w ON te.worker_id = w.id
  `;
  const params = [];
  const conditions = [];
  
  if (worker_id) {
    conditions.push('te.worker_id = ?');
    params.push(worker_id);
  }
  
  if (date_from) {
    conditions.push('te.date >= ?');
    params.push(date_from);
  }
  
  if (date_to) {
    conditions.push('te.date <= ?');
    params.push(date_to);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY te.date DESC, te.clock_in DESC';
  
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

app.post('/api/time-entries/clock-in', authMiddleware, (req, res) => {
  const { worker_id, notes } = req.body || {};
  
  if (!worker_id) {
    return res.status(400).json({ error: 'Worker ID is required' });
  }
  
  // Check if worker exists
  const worker = db.prepare('SELECT * FROM workers WHERE id = ?').get(worker_id);
  if (!worker) {
    return res.status(404).json({ error: 'Worker not found' });
  }
  
  // Check if worker is already clocked in today
  const today = new Date().toISOString().split('T')[0];
  const existing = db.prepare('SELECT * FROM time_entries WHERE worker_id = ? AND date = ? AND clock_out IS NULL').get(worker_id, today);
  
  if (existing) {
    return res.status(400).json({ error: 'Worker is already clocked in today' });
  }
  
  const now = new Date().toISOString();
  const stmt = db.prepare('INSERT INTO time_entries (worker_id, clock_in, date, notes) VALUES (?, ?, ?, ?)');
  const info = stmt.run(worker_id, now, today, notes || '');
  
  const entry = db.prepare(`
    SELECT te.*, w.name as worker_name, w.employee_id, w.role, w.hourly_rate
    FROM time_entries te
    JOIN workers w ON te.worker_id = w.id
    WHERE te.id = ?
  `).get(info.lastInsertRowid);
  
  res.json(entry);
});

app.post('/api/time-entries/clock-out', authMiddleware, (req, res) => {
  const { worker_id, notes } = req.body || {};
  
  if (!worker_id) {
    return res.status(400).json({ error: 'Worker ID is required' });
  }
  
  // Find the active clock-in entry for today
  const today = new Date().toISOString().split('T')[0];
  const entry = db.prepare('SELECT * FROM time_entries WHERE worker_id = ? AND date = ? AND clock_out IS NULL').get(worker_id, today);
  
  if (!entry) {
    return res.status(400).json({ error: 'No active clock-in found for today' });
  }
  
  const now = new Date().toISOString();
  const clockIn = new Date(entry.clock_in);
  const clockOut = new Date(now);
  const hoursWorked = (clockOut - clockIn) / (1000 * 60 * 60); // Convert to hours
  
  const updateNotes = notes ? (entry.notes ? entry.notes + '; ' + notes : notes) : entry.notes;
  
  const stmt = db.prepare('UPDATE time_entries SET clock_out = ?, hours_worked = ?, notes = ? WHERE id = ?');
  stmt.run(now, hoursWorked, updateNotes, entry.id);
  
  const updated = db.prepare(`
    SELECT te.*, w.name as worker_name, w.employee_id, w.role, w.hourly_rate
    FROM time_entries te
    JOIN workers w ON te.worker_id = w.id
    WHERE te.id = ?
  `).get(entry.id);
  
  res.json(updated);
});

app.get('/api/reports/payroll', authMiddleware, (req, res) => {
  const { date_from, date_to } = req.query;
  
  let query = `
    SELECT 
      w.id,
      w.name,
      w.employee_id,
      w.role,
      w.hourly_rate,
      COALESCE(SUM(te.hours_worked), 0) as total_hours,
      COALESCE(SUM(te.hours_worked * w.hourly_rate), 0) as total_pay
    FROM workers w
    LEFT JOIN time_entries te ON w.id = te.worker_id
  `;
  
  const params = [];
  const conditions = [];
  
  if (date_from) {
    conditions.push('te.date >= ?');
    params.push(date_from);
  }
  
  if (date_to) {
    conditions.push('te.date <= ?');
    params.push(date_to);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' GROUP BY w.id, w.name, w.employee_id, w.role, w.hourly_rate ORDER BY w.name';
  
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => { console.log('Adonai backend listening on', PORT); });
