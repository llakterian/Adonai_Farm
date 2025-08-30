// Postgres-powered server (Neon) + Cloudinary uploads
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { createDb } = require('./db/dbAdapter');
require('dotenv').config();

const db = createDb();
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const PORT = process.env.PORT || 4000;

// Email configuration (same as index.js with transporter fix)
const EMAIL_CONFIG = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
    }
};

let emailTransporter = null;
if (EMAIL_CONFIG.auth.user && EMAIL_CONFIG.auth.pass) {
    emailTransporter = nodemailer.createTransport(EMAIL_CONFIG);
    emailTransporter.verify((error) => {
        if (error) {
            console.log('Email configuration error:', error);
            emailTransporter = null;
        } else {
            console.log('Email server is ready to send messages');
        }
    });
} else {
    console.log('Email not configured - set SMTP_USER and SMTP_PASS environment variables');
}

async function sendContactNotification(inquiry) {
    if (!emailTransporter) return false;
    try {
        const adminMailOptions = {
            from: `"Adonai Farm Website" <${EMAIL_CONFIG.auth.user}>`,
            to: process.env.ADMIN_EMAIL || EMAIL_CONFIG.auth.user,
            subject: `New Contact Inquiry: ${inquiry.subject}`,
            text: JSON.stringify(inquiry, null, 2)
        };
        const customerMailOptions = {
            from: `"Adonai Farm" <${EMAIL_CONFIG.auth.user}>`,
            to: inquiry.email,
            subject: `Thank you for contacting Adonai Farm - ${inquiry.subject}`,
            text: 'Thank you for your inquiry. We will get back to you soon.'
        };
        await Promise.all([
            emailTransporter.sendMail(adminMailOptions),
            emailTransporter.sendMail(customerMailOptions)
        ]);
        return true;
    } catch (e) {
        console.error('Error sending contact notification:', e);
        return false;
    }
}

const app = express();

const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(s => s.trim())
    : ['http://localhost:3000', 'http://localhost:5173'];
app.use(cors({ origin: allowedOrigins, credentials: true, optionsSuccessStatus: 200 }));
app.use(bodyParser.json());

function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });
    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Invalid Authorization header' });
    try {
        const payload = jwt.verify(parts[1], JWT_SECRET);
        req.user = payload;
        next();
    } catch (e) { return res.status(401).json({ error: 'Invalid token' }); }
}

// --- Auth ---
app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username & password required' });
    const row = await db.prepare('SELECT id, username, password_hash FROM users WHERE username = ?').get(username);
    if (!row) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: row.id, username: row.username }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token });
});

app.put('/auth/update', authMiddleware, async (req, res) => {
    const { currentPassword, newUsername, newPassword } = req.body || {};
    if (!currentPassword) return res.status(400).json({ error: 'currentPassword required' });
    const row = await db.prepare('SELECT id, username, password_hash FROM users WHERE id = ?').get(req.user.id);
    if (!row) return res.status(404).json({ error: 'User not found' });
    const ok = await bcrypt.compare(currentPassword, row.password_hash);
    if (!ok) return res.status(401).json({ error: 'Current password incorrect' });
    const updates = [];
    const params = [];
    if (newUsername) { updates.push('username = ?'); params.push(newUsername); }
    if (newPassword) { const hash = await bcrypt.hash(newPassword, 10); updates.push('password_hash = ?'); params.push(hash); }
    if (updates.length === 0) return res.status(400).json({ error: 'No changes provided' });
    params.push(row.id);
    await db.prepare('UPDATE users SET ' + updates.join(', ') + ' WHERE id = ?').run(...params);
    res.json({ success: true });
});

// --- Animals ---
app.get('/api/livestock', authMiddleware, async (req, res) => {
    const rows = await db.prepare('SELECT * FROM animals ORDER BY id DESC').all();
    res.json(rows);
});

app.post('/api/livestock', authMiddleware, async (req, res) => {
    const { type, name, dob, sex, notes } = req.body || {};
    const insert = await db.prepare('INSERT INTO animals (type, name, dob, sex, notes) VALUES (?, ?, ?, ?, ?) RETURNING *').run(type, name, dob, sex, notes);
    const row = (insert.rows && insert.rows[0]) || await db.prepare('SELECT * FROM animals ORDER BY id DESC LIMIT 1').get();
    res.json(row);
});

app.put('/api/livestock/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { type, name, dob, sex, notes } = req.body || {};
    const existing = await db.prepare('SELECT * FROM animals WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Animal not found' });
    await db.prepare('UPDATE animals SET type = ?, name = ?, dob = ?, sex = ?, notes = ? WHERE id = ?').run(type, name, dob, sex, notes, id);
    const updated = await db.prepare('SELECT * FROM animals WHERE id = ?').get(id);
    res.json(updated);
});

app.delete('/api/livestock/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const existing = await db.prepare('SELECT * FROM animals WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Animal not found' });
    await db.prepare('DELETE FROM animals WHERE id = ?').run(id);
    res.json({ success: true, message: 'Animal deleted successfully' });
});

app.get('/api/reports/animals.csv', authMiddleware, async (req, res) => {
    const rows = await db.prepare('SELECT * FROM animals').all();
    const csv = rows.map(r => `${r.id},"${r.type}","${r.name}",${r.dob},${r.sex},"${(r.notes || '').replace(/"/g, '""')}"`).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="animals.csv"');
    res.send('id,type,name,dob,sex,notes\n' + csv);
});

// --- Gallery with Cloudinary ---
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.post('/api/gallery/upload', authMiddleware, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ folder: 'adonai' }, (error, uploadResult) => {
                if (error) return reject(error);
                resolve(uploadResult);
            });
            stream.end(req.file.buffer);
        });

        await db.prepare('INSERT INTO photos (filename, path, uploaded_at, public_id, secure_url) VALUES (?, ?, NOW(), ?, ?)')
            .run(req.file.originalname, result.secure_url, result.public_id, result.secure_url);

        res.json({ url: result.secure_url, public_id: result.public_id, filename: req.file.originalname });
    } catch (e) {
        console.error('Upload failed:', e);
        res.status(500).json({ error: 'Upload failed' });
    }
});

app.get('/api/gallery', authMiddleware, async (req, res) => {
    const rows = await db.prepare('SELECT id, filename, path as url, public_id, secure_url, uploaded_at FROM photos ORDER BY id DESC').all();
    res.json(rows);
});

// --- Workers ---
app.get('/api/workers', authMiddleware, async (req, res) => {
    const rows = await db.prepare('SELECT * FROM workers ORDER BY name').all();
    res.json(rows);
});

app.post('/api/workers', authMiddleware, async (req, res) => {
    const { name, employee_id, role, hourly_rate, phone } = req.body || {};
    if (!name || !employee_id) return res.status(400).json({ error: 'Name and employee ID are required' });
    try {
        const result = await db.prepare('INSERT INTO workers (name, employee_id, role, hourly_rate, phone) VALUES (?, ?, ?, ?, ?) RETURNING *')
            .run(name, employee_id, role || '', hourly_rate || 0, phone || '');
        const worker = (result.rows && result.rows[0]) || await db.prepare('SELECT * FROM workers ORDER BY id DESC LIMIT 1').get();
        res.json(worker);
    } catch (error) {
        // Unique constraint error may come with different codes; perform existence check
        const existing = await db.prepare('SELECT 1 FROM workers WHERE employee_id = ?').get(employee_id);
        if (existing) return res.status(400).json({ error: 'Employee ID already exists' });
        res.status(500).json({ error: 'Failed to create worker' });
    }
});

app.put('/api/workers/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { name, employee_id, role, hourly_rate, phone } = req.body || {};
    const existing = await db.prepare('SELECT * FROM workers WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Worker not found' });
    try {
        await db.prepare('UPDATE workers SET name = ?, employee_id = ?, role = ?, hourly_rate = ?, phone = ? WHERE id = ?')
            .run(name, employee_id, role, hourly_rate, phone, id);
        const updated = await db.prepare('SELECT * FROM workers WHERE id = ?').get(id);
        res.json(updated);
    } catch (error) {
        const dup = await db.prepare('SELECT 1 FROM workers WHERE employee_id = ? AND id <> ?').get(employee_id, id);
        if (dup) return res.status(400).json({ error: 'Employee ID already exists' });
        res.status(500).json({ error: 'Failed to update worker' });
    }
});

app.delete('/api/workers/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const existing = await db.prepare('SELECT * FROM workers WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Worker not found' });
    await db.prepare('DELETE FROM time_entries WHERE worker_id = ?').run(id);
    await db.prepare('DELETE FROM workers WHERE id = ?').run(id);
    res.json({ success: true, message: 'Worker deleted successfully' });
});

// --- Time entries ---
app.get('/api/time-entries', authMiddleware, async (req, res) => {
    const { worker_id, date_from, date_to } = req.query;
    let query = `
    SELECT te.*, w.name as worker_name, w.employee_id, w.role, w.hourly_rate
    FROM time_entries te
    JOIN workers w ON te.worker_id = w.id
  `;
    const params = [];
    const conditions = [];
    if (worker_id) { conditions.push('te.worker_id = ?'); params.push(worker_id); }
    if (date_from) { conditions.push('te.date >= ?'); params.push(date_from); }
    if (date_to) { conditions.push('te.date <= ?'); params.push(date_to); }
    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY te.date DESC, te.clock_in DESC';
    const rows = await db.prepare(query).all(...params);
    res.json(rows);
});

app.post('/api/time-entries/clock-in', authMiddleware, async (req, res) => {
    const { worker_id, notes } = req.body || {};
    if (!worker_id) return res.status(400).json({ error: 'Worker ID is required' });
    const worker = await db.prepare('SELECT * FROM workers WHERE id = ?').get(worker_id);
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    const today = new Date().toISOString().split('T')[0];
    const existing = await db.prepare('SELECT * FROM time_entries WHERE worker_id = ? AND date = ? AND clock_out IS NULL')
        .get(worker_id, today);
    if (existing) return res.status(400).json({ error: 'Worker is already clocked in today' });
    const now = new Date().toISOString();
    const insert = await db.prepare('INSERT INTO time_entries (worker_id, clock_in, date, notes) VALUES (?, ?, ?, ?) RETURNING *')
        .run(worker_id, now, today, notes || '');
    const entry = (insert.rows && insert.rows[0]) || await db.prepare('SELECT * FROM time_entries ORDER BY id DESC LIMIT 1').get();
    res.json(entry);
});

app.post('/api/time-entries/clock-out', authMiddleware, async (req, res) => {
    const { worker_id, notes } = req.body || {};
    if (!worker_id) return res.status(400).json({ error: 'Worker ID is required' });
    const today = new Date().toISOString().split('T')[0];
    const entry = await db.prepare('SELECT * FROM time_entries WHERE worker_id = ? AND date = ? AND clock_out IS NULL').get(worker_id, today);
    if (!entry) return res.status(400).json({ error: 'No active clock-in found for today' });
    const now = new Date().toISOString();
    const clockIn = new Date(entry.clock_in);
    const clockOut = new Date(now);
    const hoursWorked = (clockOut - clockIn) / (1000 * 60 * 60);
    const updateNotes = notes ? (entry.notes ? entry.notes + '; ' + notes : notes) : entry.notes;
    await db.prepare('UPDATE time_entries SET clock_out = ?, hours_worked = ?, notes = ? WHERE id = ?')
        .run(now, hoursWorked, updateNotes, entry.id);
    const updated = await db.prepare('SELECT * FROM time_entries WHERE id = ?').get(entry.id);
    res.json(updated);
});

app.get('/api/reports/payroll', authMiddleware, async (req, res) => {
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
    if (date_from) { conditions.push('te.date >= ?'); params.push(date_from); }
    if (date_to) { conditions.push('te.date <= ?'); params.push(date_to); }
    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' GROUP BY w.id, w.name, w.employee_id, w.role, w.hourly_rate ORDER BY w.name';
    const rows = await db.prepare(query).all(...params);
    res.json(rows);
});

app.get('/api/health', async (req, res) => {
    try {
        await db.prepare('SELECT 1 as ok').get();
        res.json({ status: 'ok' });
    } catch (e) {
        res.status(500).json({ status: 'error', error: e.message });
    }
});

app.listen(PORT, () => console.log(`Postgres server listening on :${PORT}`));