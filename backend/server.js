const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Email configuration - Update with your email settings
// For testing: use ethereal.email or mailtrap.io
// For production: use Gmail, SendGrid, AWS SES, etc.
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true' || false,
  auth: {
    user: process.env.EMAIL_USER || 'your-email@example.com',
    pass: process.env.EMAIL_PASSWORD || 'your-password'
  }
};

const emailTransporter = nodemailer.createTransport(emailConfig);

// Function to send invitation email
async function sendInvitationEmail(invitedEmail, ownerUsername, invitationLink) {
  try {
    const mailOptions = {
      from: emailConfig.auth.user || 'noreply@icoe.app',
      to: invitedEmail,
      subject: `${ownerUsername} invited you to ICOE - In Case Of Emergency`,
      html: `
        <h2>Emergency Access Invitation</h2>
        <p>Hello,</p>
        <p><strong>${ownerUsername}</strong> has invited you to view their emergency information on ICOE (In Case Of Emergency).</p>
        <p>This is a private app for families to securely share critical information with trusted contacts in emergency situations.</p>
        <p>
          <a href="${invitationLink}" style="display: inline-block; background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Accept Invitation
          </a>
        </p>
        <p>This invitation will expire in 48 hours.</p>
        <p><strong>Important:</strong> This link is only valid for 48 hours. If you don't use it, please ask ${ownerUsername} to send you a new invitation.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          If you didn't expect this invitation or have questions, please contact ${ownerUsername} directly.
        </p>
      `,
      text: `${ownerUsername} invited you to view their emergency information on ICOE. Visit this link to accept: ${invitationLink}`
    };

    await emailTransporter.sendMail(mailOptions);
    console.log(`Invitation email sent to ${invitedEmail}`);
    return true;
  } catch (error) {
    console.error(`Failed to send invitation email to ${invitedEmail}:`, error.message);
    // Don't throw - allow invitation to be created even if email fails
    return false;
  }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database setup (PostgreSQL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

const db = {
  query: (text, params) => pool.query(text, params)
};

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Initialize database tables
async function initializeDatabase() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      category_name TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      category_id INTEGER REFERENCES categories(id),
      user_id INTEGER REFERENCES users(id),
      title TEXT,
      description TEXT,
      contact_name TEXT,
      contact_phone TEXT,
      contact_address TEXT,
      contact_email TEXT,
      reference_number TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS files (
      id SERIAL PRIMARY KEY,
      item_id INTEGER REFERENCES items(id),
      filename TEXT,
      original_filename TEXT,
      filepath TEXT,
      uploaded_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS permissions (
      id SERIAL PRIMARY KEY,
      owner_id INTEGER REFERENCES users(id),
      viewer_id INTEGER REFERENCES users(id),
      access_level TEXT DEFAULT 'view',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(owner_id, viewer_id)
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS invitations (
      id SERIAL PRIMARY KEY,
      owner_id INTEGER REFERENCES users(id),
      invited_email TEXT,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      expires_at TIMESTAMPTZ,
      accepted_at TIMESTAMPTZ,
      UNIQUE(owner_id, invited_email)
    )
  `);
  console.log('Connected to PostgreSQL and tables ready');
}

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// ROUTES

// Register
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    const result = await db.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
      [username, email, hashedPassword]
    );
    const newUserId = result.rows[0].id;

    // Auto-accept pending invitations for this email
    const invitations = await db.query(
      'SELECT owner_id FROM invitations WHERE invited_email = $1 AND status = $2 AND expires_at > NOW()',
      [email, 'pending']
    );
    for (const invite of invitations.rows) {
      await db.query(
        'INSERT INTO permissions (owner_id, viewer_id, access_level) VALUES ($1, $2, $3) ON CONFLICT (owner_id, viewer_id) DO NOTHING',
        [invite.owner_id, newUserId, 'view']
      );
      await db.query(
        'UPDATE invitations SET status = $1, accepted_at = NOW() WHERE owner_id = $2 AND invited_email = $3',
        ['accepted', invite.owner_id, email]
      );
    }

    res.status(201).json({ message: 'User registered', id: newUserId });
  } catch (err) {
    return res.status(400).json({ error: 'Username or email already exists' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all categories for user
app.get('/api/categories', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.*, CAST(COUNT(i.id) AS INTEGER) AS item_count
       FROM categories c
       LEFT JOIN items i ON i.category_id = c.id
       WHERE c.user_id = $1
       GROUP BY c.id
       ORDER BY c.category_name`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create category
app.post('/api/categories', authenticateToken, async (req, res) => {
  const { category_name } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO categories (user_id, category_name) VALUES ($1, $2) RETURNING id',
      [req.user.id, category_name]
    );
    res.status(201).json({ id: result.rows[0].id, category_name, user_id: req.user.id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get ALL items across all categories for the logged-in user (with category name)
app.get('/api/items/all', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT i.*, c.category_name
       FROM items i
       JOIN categories c ON i.category_id = c.id
       WHERE i.user_id = $1
       ORDER BY i.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get items for category
app.get('/api/categories/:categoryId/items', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM items WHERE category_id = $1 AND user_id = $2',
      [req.params.categoryId, req.user.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create item
app.post('/api/categories/:categoryId/items', authenticateToken, async (req, res) => {
  const { title, description, contact_name, contact_phone, contact_address, contact_email, reference_number } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO items (category_id, user_id, title, description, contact_name, contact_phone, contact_address, contact_email, reference_number) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id',
      [req.params.categoryId, req.user.id, title, description, contact_name, contact_phone, contact_address, contact_email, reference_number]
    );
    res.status(201).json({ id: result.rows[0].id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update item
app.put('/api/items/:itemId', authenticateToken, async (req, res) => {
  const { title, description, contact_name, contact_phone, contact_address, contact_email, reference_number } = req.body;
  try {
    await db.query(
      'UPDATE items SET title=$1, description=$2, contact_name=$3, contact_phone=$4, contact_address=$5, contact_email=$6, reference_number=$7, updated_at=NOW() WHERE id=$8 AND user_id=$9',
      [title, description, contact_name, contact_phone, contact_address, contact_email, reference_number, req.params.itemId, req.user.id]
    );
    res.json({ message: 'Item updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete item
app.delete('/api/items/:itemId', authenticateToken, async (req, res) => {
  try {
    await db.query('DELETE FROM items WHERE id=$1 AND user_id=$2', [req.params.itemId, req.user.id]);
    res.json({ message: 'Item deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Upload file
app.post('/api/items/:itemId/upload', authenticateToken, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const result = await db.query(
      'INSERT INTO files (item_id, filename, original_filename, filepath) VALUES ($1,$2,$3,$4) RETURNING id',
      [req.params.itemId, req.file.filename, req.file.originalname, req.file.path]
    );
    res.status(201).json({ id: result.rows[0].id, filename: req.file.filename, original_filename: req.file.originalname, url: `/uploads/${req.file.filename}` });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get files for item
app.get('/api/items/:itemId/files', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM files WHERE item_id=$1', [req.params.itemId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete file
app.delete('/api/files/:fileId', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM files WHERE id=$1', [req.params.fileId]);
    const file = result.rows[0];
    if (!file) return res.status(404).json({ error: 'File not found' });
    fs.unlink(file.filepath, (err) => { if (err) console.error('Error deleting file:', err); });
    await db.query('DELETE FROM files WHERE id=$1', [req.params.fileId]);
    res.json({ message: 'File deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// SHARING ENDPOINTS

// Get all users (for search/nominate)
app.get('/api/users', authenticateToken, async (req, res) => {
  const { search } = req.query;
  try {
    let query = 'SELECT id, username, email, \'registered\' as status FROM users WHERE id != $1';
    let params = [req.user.id];
    if (search) {
      query += ' AND (username ILIKE $2 OR email ILIKE $2)';
      params.push(`%${search}%`);
    }
    const result = await db.query(query, params);
    const rows = result.rows;

    if (search && search.includes('@')) {
      const invite = await db.query(
        'SELECT DISTINCT invited_email FROM invitations WHERE invited_email ILIKE $1 AND status = $2 AND expires_at > NOW()',
        [`%${search}%`, 'pending']
      );
      if (invite.rows[0] && !rows.find(u => u.email === invite.rows[0].invited_email)) {
        rows.push({ id: null, username: invite.rows[0].invited_email.split('@')[0], email: invite.rows[0].invited_email, status: 'invited' });
      }
    }
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Share data
app.post('/api/share', authenticateToken, async (req, res) => {
  const { viewer_id } = req.body;
  const owner_id = req.user.id;
  if (!viewer_id) return res.status(400).json({ error: 'Missing viewer_id' });
  try {
    const user = await db.query('SELECT id FROM users WHERE id=$1', [viewer_id]);
    if (!user.rows[0]) return res.status(404).json({ error: 'User not found' });
    await db.query(
      'INSERT INTO permissions (owner_id, viewer_id, access_level) VALUES ($1,$2,$3) ON CONFLICT (owner_id, viewer_id) DO UPDATE SET access_level=$3',
      [owner_id, viewer_id, 'view']
    );
    res.status(201).json({ message: 'Access granted', viewer_id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Revoke access
app.delete('/api/share/:viewerId', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM permissions WHERE owner_id=$1 AND viewer_id=$2',
      [req.user.id, req.params.viewerId]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Permission not found' });
    res.json({ message: 'Access revoked' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get list of people I've shared with
app.get('/api/my-sharers', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.viewer_id, u.username, u.email, p.created_at 
       FROM permissions p JOIN users u ON p.viewer_id = u.id
       WHERE p.owner_id = $1`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get shared data
app.get('/api/shared-with-me', authenticateToken, async (req, res) => {
  try {
    const owners = await db.query(
      `SELECT DISTINCT p.owner_id, u.username, u.email
       FROM permissions p JOIN users u ON p.owner_id = u.id
       WHERE p.viewer_id = $1`,
      [req.user.id]
    );
    if (!owners.rows.length) return res.json([]);

    const sharedData = await Promise.all(owners.rows.map(async owner => {
      const cats = await db.query('SELECT id, category_name FROM categories WHERE user_id=$1', [owner.owner_id]);
      return { owner_id: owner.owner_id, owner_username: owner.username, owner_email: owner.email, categories: cats.rows };
    }));
    res.json(sharedData);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get items from shared category (with permission check)
app.get('/api/shared/:ownerId/categories/:categoryId/items', authenticateToken, async (req, res) => {
  try {
    const perm = await db.query('SELECT * FROM permissions WHERE owner_id=$1 AND viewer_id=$2', [req.params.ownerId, req.user.id]);
    if (!perm.rows[0]) return res.status(403).json({ error: 'Access denied' });
    const result = await db.query('SELECT * FROM items WHERE category_id=$1 AND user_id=$2', [req.params.categoryId, req.params.ownerId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// INVITATION ENDPOINTS

// Send invite
app.post('/api/invite', authenticateToken, async (req, res) => {
  const { invited_email } = req.body;
  const owner_id = req.user.id;
  if (!invited_email) return res.status(400).json({ error: 'Missing invited_email' });

  try {
    const existing = await db.query('SELECT id FROM users WHERE email=$1', [invited_email]);
    if (existing.rows[0]) return res.status(400).json({ error: 'User already registered - use Share Data instead' });

    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    await db.query(
      'INSERT INTO invitations (owner_id, invited_email, status, expires_at) VALUES ($1,$2,$3,$4) ON CONFLICT (owner_id, invited_email) DO UPDATE SET status=$3, expires_at=$4',
      [owner_id, invited_email, 'pending', expiresAt]
    );
    const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?invited_email=${encodeURIComponent(invited_email)}`;
    await sendInvitationEmail(invited_email, req.user.username, invitationLink);
    res.status(201).json({ message: 'Invitation sent', invited_email, expires_at: expiresAt });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get pending invitations
app.get('/api/my-invitations', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, invited_email, status, created_at, expires_at, accepted_at 
       FROM invitations WHERE owner_id=$1 AND expires_at > NOW() ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Cancel invitation
app.delete('/api/invitation/:invitationId', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM invitations WHERE id=$1 AND owner_id=$2', [req.params.invitationId, req.user.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Invitation not found' });
    res.json({ message: 'Invitation cancelled' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get combined access list
app.get('/api/my-access-list', authenticateToken, async (req, res) => {
  try {
    const active = await db.query(
      `SELECT p.viewer_id as id, u.username, u.email, 'active' as type, p.created_at as date_granted
       FROM permissions p JOIN users u ON p.viewer_id = u.id WHERE p.owner_id=$1`,
      [req.user.id]
    );
    const pending = await db.query(
      `SELECT id, invited_email as email, null as username, 'invited' as type, created_at as date_granted, expires_at
       FROM invitations WHERE owner_id=$1 AND status='pending' AND expires_at > NOW()`,
      [req.user.id]
    );
    res.json([...active.rows, ...pending.rows]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err.message);
  process.exit(1);
});
