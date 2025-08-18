const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const nodemailer = require('nodemailer');
require('dotenv').config();

const DB_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR);

const dbPath = path.join(DB_DIR, 'adonai.db');
const Database = require('better-sqlite3');
const db = new Database(dbPath);

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const PORT = process.env.PORT || 4000;

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '', // Your email
    pass: process.env.SMTP_PASS || ''  // Your email password or app password
  }
};

// Create email transporter
let emailTransporter = null;
if (EMAIL_CONFIG.auth.user && EMAIL_CONFIG.auth.pass) {
  emailTransporter = nodemailer.createTransporter(EMAIL_CONFIG);
  
  // Verify email configuration
  emailTransporter.verify((error, success) => {
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

// Email notification function
async function sendContactNotification(inquiry) {
  if (!emailTransporter) {
    console.log('Email not configured, skipping notification');
    return false;
  }
  
  try {
    const inquiryTypeLabels = {
      'visit': 'Farm Visit/Tour',
      'purchase': 'Product Purchase',
      'breeding': 'Breeding Services',
      'general': 'General Questions'
    };
    
    const inquiryTypeLabel = inquiryTypeLabels[inquiry.inquiryType] || inquiry.inquiryType;
    
    // Email to admin
    const adminMailOptions = {
      from: `"Adonai Farm Website" <${EMAIL_CONFIG.auth.user}>`,
      to: process.env.ADMIN_EMAIL || EMAIL_CONFIG.auth.user,
      subject: `New Contact Inquiry: ${inquiry.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2d5016 0%, #4a7c59 100%); color: white; padding: 2rem; text-align: center;">
            <h1 style="margin: 0; color: #d4af37;">🌾 New Contact Inquiry</h1>
            <p style="margin: 0.5rem 0 0; opacity: 0.9;">Adonai Farm Website</p>
          </div>
          
          <div style="padding: 2rem; background: white;">
            <h2 style="color: #2d5016; margin-bottom: 1.5rem;">Contact Details</h2>
            
            <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
              <div style="display: grid; gap: 1rem;">
                <div><strong>Name:</strong> ${inquiry.name}</div>
                <div><strong>Email:</strong> <a href="mailto:${inquiry.email}">${inquiry.email}</a></div>
                ${inquiry.phone ? `<div><strong>Phone:</strong> <a href="tel:${inquiry.phone}">${inquiry.phone}</a></div>` : ''}
                <div><strong>Inquiry Type:</strong> ${inquiryTypeLabel}</div>
                <div><strong>Subject:</strong> ${inquiry.subject}</div>
                <div><strong>Submitted:</strong> ${new Date(inquiry.timestamp).toLocaleString()}</div>
              </div>
            </div>
            
            <h3 style="color: #2d5016; margin-bottom: 1rem;">Message</h3>
            <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #d4af37;">
              <p style="margin: 0; line-height: 1.6; white-space: pre-wrap;">${inquiry.message}</p>
            </div>
            
            <div style="margin-top: 2rem; padding: 1rem; background: #e8f5e8; border-radius: 8px;">
              <p style="margin: 0; color: #2d5016;"><strong>Next Steps:</strong></p>
              <ul style="margin: 0.5rem 0 0; color: #2d5016;">
                <li>Log into the admin dashboard to manage this inquiry</li>
                <li>Respond to the customer within 24 hours</li>
                <li>Update the inquiry status once handled</li>
              </ul>
            </div>
          </div>
          
          <div style="background: #f8f9fa; padding: 1rem; text-align: center; color: #666;">
            <p style="margin: 0; font-size: 0.9rem;">
              This is an automated notification from Adonai Farm Management System
            </p>
          </div>
        </div>
      `
    };
    
    // Auto-reply to customer
    const customerMailOptions = {
      from: `"Adonai Farm" <${EMAIL_CONFIG.auth.user}>`,
      to: inquiry.email,
      subject: `Thank you for contacting Adonai Farm - ${inquiry.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2d5016 0%, #4a7c59 100%); color: white; padding: 2rem; text-align: center;">
            <h1 style="margin: 0; color: #d4af37;">🌾 Thank You!</h1>
            <p style="margin: 0.5rem 0 0; opacity: 0.9;">We've received your inquiry</p>
          </div>
          
          <div style="padding: 2rem; background: white;">
            <p>Dear ${inquiry.name},</p>
            
            <p>Thank you for contacting Adonai Farm! We've received your inquiry about <strong>"${inquiry.subject}"</strong> and appreciate your interest in our farm.</p>
            
            <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; border-left: 4px solid #d4af37;">
              <h3 style="margin: 0 0 1rem; color: #2d5016;">Your Inquiry Summary</h3>
              <div><strong>Type:</strong> ${inquiryTypeLabel}</div>
              <div><strong>Subject:</strong> ${inquiry.subject}</div>
              <div><strong>Submitted:</strong> ${new Date(inquiry.timestamp).toLocaleString()}</div>
            </div>
            
            <p><strong>What happens next?</strong></p>
            <ul>
              <li>Our team will review your inquiry within 24 hours</li>
              <li>We'll respond with detailed information or schedule a call/visit</li>
              <li>For urgent matters, feel free to call us at +254 722 759 217</li>
            </ul>
            
            <div style="background: #e8f5e8; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0;">
              <h4 style="margin: 0 0 1rem; color: #2d5016;">🏡 Visit Our Farm</h4>
              <p style="margin: 0;">
                <strong>Location:</strong> Chepsir, Kericho, Kenya<br>
                <strong>Visit Hours:</strong> Monday - Saturday: 8:00 AM - 5:00 PM<br>
                <strong>Phone:</strong> +254 722 759 217<br>
                <strong>Email:</strong> info@adonaifarm.co.ke
              </p>
            </div>
            
            <p>We look forward to connecting with you soon!</p>
            
            <p>Best regards,<br>
            <strong>The Adonai Farm Team</strong></p>
          </div>
          
          <div style="background: #f8f9fa; padding: 1rem; text-align: center; color: #666;">
            <p style="margin: 0; font-size: 0.9rem;">
              Adonai Farm - Managing livestock with care, precision, and modern technology
            </p>
          </div>
        </div>
      `
    };
    
    // Send both emails
    await Promise.all([
      emailTransporter.sendMail(adminMailOptions),
      emailTransporter.sendMail(customerMailOptions)
    ]);
    
    console.log('Contact notification emails sent successfully');
    return true;
    
  } catch (error) {
    console.error('Error sending contact notification:', error);
    return false;
  }
}

const app = express();

// Enhanced CORS configuration for image serving
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(bodyParser.json());

// Enhanced static file serving with caching and optimization
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d', // Cache images for 1 day
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Set proper MIME types and caching headers
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (path.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
    
    // Enable compression
    res.setHeader('Vary', 'Accept-Encoding');
    
    // Security headers for images
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

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

// Public API to get available farm images (no auth required)
app.get('/api/public/images', (req, res) => {
  try {
    const adonaiDir = path.join(__dirname, 'uploads', 'Adonai');
    
    if (!fs.existsSync(adonaiDir)) {
      return res.json({ images: [], categories: {} });
    }
    
    const files = fs.readdirSync(adonaiDir);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    );
    
    const images = imageFiles.map(filename => {
      const filePath = path.join(adonaiDir, filename);
      const stats = fs.statSync(filePath);
      
      // Categorize based on filename
      let category = 'facilities';
      if (filename.startsWith('adonai')) {
        category = 'animals';
      } else if (filename.startsWith('farm-')) {
        category = 'farm';
      }
      
      return {
        filename,
        url: `/uploads/Adonai/${filename}`,
        category,
        size: stats.size,
        lastModified: stats.mtime.toISOString(),
        alt: generateImageAlt(filename),
        caption: generateImageCaption(filename)
      };
    });
    
    // Group by category
    const categories = {
      animals: images.filter(img => img.category === 'animals'),
      farm: images.filter(img => img.category === 'farm'),
      facilities: images.filter(img => img.category === 'facilities')
    };
    
    res.json({ 
      images, 
      categories,
      total: images.length 
    });
    
  } catch (error) {
    console.error('Error fetching public images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Helper functions for image metadata
function generateImageAlt(filename) {
  if (filename.startsWith('adonai')) {
    const number = filename.replace('adonai', '').replace(/\.(jpg|jpeg|png|webp)$/i, '');
    return `Adonai Farm livestock - cattle, goats, sheep, and poultry ${number}`;
  } else if (filename.startsWith('farm-')) {
    const number = filename.replace('farm-', '').replace(/\.(jpg|jpeg|png|webp)$/i, '');
    return `Adonai Farm operations and facilities ${number}`;
  }
  return 'Adonai Farm image';
}

function generateImageCaption(filename) {
  if (filename.startsWith('adonai')) {
    return 'Our diverse livestock - dairy & beef cattle, goats, sheep, and poultry';
  } else if (filename.startsWith('farm-')) {
    return 'Farm operations, facilities, and sustainable farming practices';
  }
  return 'Adonai Farm - Sustainable livestock management';
}

// Image optimization endpoint for resized images
app.get('/api/images/optimized/:size/:filename', (req, res) => {
  const { size, filename } = req.params;
  const validSizes = ['small', 'medium', 'large', 'thumbnail'];
  
  if (!validSizes.includes(size)) {
    return res.status(400).json({ error: 'Invalid size parameter' });
  }
  
  const originalPath = path.join(__dirname, 'uploads', 'Adonai', filename);
  
  if (!fs.existsSync(originalPath)) {
    return res.status(404).json({ error: 'Image not found' });
  }
  
  // For now, serve original image with proper headers
  // In production, you might want to implement actual resizing
  const stats = fs.statSync(originalPath);
  
  res.setHeader('Content-Type', getImageMimeType(filename));
  res.setHeader('Content-Length', stats.size);
  res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day cache
  res.setHeader('ETag', `"${stats.mtime.getTime()}-${stats.size}"`);
  res.setHeader('Last-Modified', stats.mtime.toUTCString());
  
  // Check if client has cached version
  const ifNoneMatch = req.headers['if-none-match'];
  const ifModifiedSince = req.headers['if-modified-since'];
  
  if (ifNoneMatch === `"${stats.mtime.getTime()}-${stats.size}"` ||
      (ifModifiedSince && new Date(ifModifiedSince) >= stats.mtime)) {
    return res.status(304).end();
  }
  
  const stream = fs.createReadStream(originalPath);
  stream.pipe(res);
});

function getImageMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    default:
      return 'image/jpeg';
  }
}

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

// Enhanced rate limiting store with security monitoring
const rateLimitStore = new Map();
const securityEvents = new Map();

// Enhanced input sanitization utilities
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  // Remove potentially dangerous characters and patterns
  return input
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remove iframe tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .substring(0, 10000); // Limit length to prevent DoS
}

// Enhanced validation utilities
function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /script/i,
    /<[^>]*>/,
    /javascript:/i,
    /data:/i,
    /vbscript:/i
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(email)) {
      return false;
    }
  }
  
  return emailRegex.test(email) && email.length <= 254; // RFC 5321 limit
}

// Security event logging
function logSecurityEvent(type, details, req) {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const event = {
    timestamp: new Date().toISOString(),
    type,
    ip: clientIP,
    userAgent: req.headers['user-agent'] || 'unknown',
    details
  };
  
  // Store recent events for analysis
  if (!securityEvents.has(clientIP)) {
    securityEvents.set(clientIP, []);
  }
  
  const events = securityEvents.get(clientIP);
  events.push(event);
  
  // Keep only last 50 events per IP
  if (events.length > 50) {
    events.splice(0, events.length - 50);
  }
  
  console.log('Security Event:', event);
}

// Enhanced rate limiting with security monitoring
function contactRateLimit(req, res, next) {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 3; // Max 3 submissions per 15 minutes per IP
  
  if (!rateLimitStore.has(clientIP)) {
    rateLimitStore.set(clientIP, []);
  }
  
  const requests = rateLimitStore.get(clientIP);
  // Remove old requests outside the window
  const validRequests = requests.filter(time => now - time < windowMs);
  
  if (validRequests.length >= maxRequests) {
    logSecurityEvent('rate_limit_exceeded', {
      endpoint: '/api/contact',
      requestCount: validRequests.length,
      windowMs
    }, req);
    
    return res.status(429).json({ 
      error: 'Too many contact form submissions. Please wait 15 minutes before trying again.' 
    });
  }
  
  validRequests.push(now);
  rateLimitStore.set(clientIP, validRequests);
  next();
}

// Suspicious activity detection
function detectSuspiciousActivity(req) {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const events = securityEvents.get(clientIP) || [];
  const recentEvents = events.filter(event => 
    Date.now() - new Date(event.timestamp).getTime() < 60 * 60 * 1000 // Last hour
  );
  
  const suspiciousPatterns = {
    highFailureRate: recentEvents.filter(e => e.type === 'validation_failed').length > 5,
    rapidRequests: recentEvents.filter(e => 
      Date.now() - new Date(e.timestamp).getTime() < 5 * 60 * 1000 // Last 5 minutes
    ).length > 10,
    maliciousContent: recentEvents.some(e => e.type === 'malicious_content_detected')
  };
  
  return Object.values(suspiciousPatterns).some(Boolean);
}

// Contact Form API
app.post('/api/contact', contactRateLimit, (req, res) => {
  const { name, email, phone, inquiryType, subject, message } = req.body || {};
  
  // Check for suspicious activity first
  if (detectSuspiciousActivity(req)) {
    logSecurityEvent('suspicious_activity_blocked', {
      endpoint: '/api/contact',
      reason: 'suspicious_pattern_detected'
    }, req);
    return res.status(429).json({ error: 'Request blocked due to suspicious activity' });
  }
  
  // Enhanced input sanitization and validation
  const trimmedName = sanitizeInput(name?.trim());
  const trimmedEmail = sanitizeInput(email?.trim()?.toLowerCase());
  const trimmedPhone = sanitizeInput(phone?.trim());
  const trimmedSubject = sanitizeInput(subject?.trim());
  const trimmedMessage = sanitizeInput(message?.trim());
  
  if (!trimmedName || !trimmedEmail || !trimmedSubject || !trimmedMessage) {
    logSecurityEvent('validation_failed', {
      endpoint: '/api/contact',
      reason: 'missing_required_fields'
    }, req);
    return res.status(400).json({ error: 'Name, email, subject, and message are required' });
  }
  
  // Enhanced email validation
  if (!validateEmail(trimmedEmail)) {
    logSecurityEvent('validation_failed', {
      endpoint: '/api/contact',
      reason: 'invalid_email_format'
    }, req);
    return res.status(400).json({ error: 'Invalid email address' });
  }
  
  // Phone validation (if provided)
  if (trimmedPhone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(trimmedPhone)) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }
  
  // Message length validation
  if (trimmedMessage.length < 10) {
    return res.status(400).json({ error: 'Message must be at least 10 characters long' });
  }
  
  if (trimmedMessage.length > 2000) {
    return res.status(400).json({ error: 'Message is too long (maximum 2000 characters)' });
  }
  
  // Subject length validation
  if (trimmedSubject.length > 200) {
    return res.status(400).json({ error: 'Subject is too long (maximum 200 characters)' });
  }
  
  // Name length validation
  if (trimmedName.length > 100) {
    return res.status(400).json({ error: 'Name is too long (maximum 100 characters)' });
  }
  
  try {
    // Create contact_inquiries table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS contact_inquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        inquiry_type TEXT DEFAULT 'general',
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'new',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT
      )
    `);
    
    // Check for potential duplicate submissions (same email, subject within last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const duplicateCheck = db.prepare(`
      SELECT id FROM contact_inquiries 
      WHERE email = ? AND subject = ? AND created_at > ?
    `).get(trimmedEmail, trimmedSubject, oneHourAgo);
    
    if (duplicateCheck) {
      return res.status(400).json({ 
        error: 'A similar inquiry was already submitted recently. Please wait before submitting again.' 
      });
    }
    
    // Insert the contact inquiry
    const stmt = db.prepare(`
      INSERT INTO contact_inquiries (name, email, phone, inquiry_type, subject, message, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const result = stmt.run(
      trimmedName, 
      trimmedEmail, 
      trimmedPhone || null, 
      inquiryType || 'general', 
      trimmedSubject, 
      trimmedMessage,
      clientIP
    );
    
    // Send email notifications
    const inquiryData = {
      id: result.lastInsertRowid,
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      inquiryType: inquiryType || 'general',
      subject: trimmedSubject,
      message: trimmedMessage,
      timestamp: new Date().toISOString()
    };
    
    console.log('New contact inquiry received:', inquiryData);
    
    // Send email notification (async, don't wait for it)
    sendContactNotification(inquiryData).catch(error => {
      console.error('Failed to send email notification:', error);
    });
    
    res.json({ 
      success: true, 
      message: 'Your inquiry has been submitted successfully. We will get back to you within 24 hours.',
      id: result.lastInsertRowid
    });
    
  } catch (error) {
    console.error('Error saving contact inquiry:', error);
    res.status(500).json({ error: 'Failed to submit inquiry. Please try again.' });
  }
});

// Get contact inquiries (admin only)
app.get('/api/contact', authMiddleware, (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM contact_inquiries ORDER BY created_at DESC').all();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching contact inquiries:', error);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

// Update contact inquiry status (admin only)
app.put('/api/contact/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  
  if (!status || !['new', 'responded', 'closed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be: new, responded, or closed' });
  }
  
  try {
    const stmt = db.prepare('UPDATE contact_inquiries SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    const result = stmt.run(status, id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Contact inquiry not found' });
    }
    
    res.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating contact inquiry:', error);
    res.status(500).json({ error: 'Failed to update inquiry status' });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => { console.log('Adonai backend listening on', PORT); });
