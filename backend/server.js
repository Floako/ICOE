const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const nodemailer = require('nodemailer');
require('dotenv').config();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 5000;

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set. Refusing to start.');
  process.exit(1);
}

// Email configuration
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true' || false,
  auth: {
    user: process.env.EMAIL_USER || 'your-email@example.com',
    pass: process.env.EMAIL_PASSWORD || 'your-password'
  }
};

const EMAIL_FROM = process.env.EMAIL_FROM || emailConfig.auth.user || 'noreply@icoe.app';

const emailTransporter = nodemailer.createTransport(emailConfig);

// Function to send invitation email
async function sendInvitationEmail(invitedEmail, ownerUsername, invitationLink) {
  try {
    const mailOptions = {
      from: EMAIL_FROM,
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

async function sendPasswordResetEmail(email, username, resetLink) {
  try {
    const displayName = username || email;
    await emailTransporter.sendMail({
      from: EMAIL_FROM,
      to: email,
      subject: 'ICOE password reset request',
      html: `
        <h2>Password Reset</h2>
        <p>Hello ${displayName},</p>
        <p>We received a request to reset your ICOE password.</p>
        <p>
          <a href="${resetLink}" style="display:inline-block;background-color:#e94560;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;">
            Reset Password
          </a>
        </p>
        <p>This link expires in 1 hour.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
      `,
      text: `Reset your ICOE password using this link (valid for 1 hour): ${resetLink}`,
    });
    return true;
  } catch (error) {
    console.error(`Failed to send password reset email to ${email}:`, error.message);
    return false;
  }
}

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

// Middleware
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',').map(s => s.trim());
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    // Allow any localhost origin (any port) for local development
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return callback(null, true);
    // Allow configured production origin(s)
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

// Database setup (PostgreSQL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

const db = {
  query: async (text, params) => {
    try {
      return await pool.query(text, params);
    } catch (err) {
      console.error('DB error:', err.message);
      throw new Error('Database error');
    }
  }
};

// File upload setup
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_'));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed. Accepted: images, PDF, Word documents.'));
    }
  }
});

// Initialize database tables
async function initializeDatabase() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password TEXT,
      vault_access TEXT DEFAULT 'full',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS vault_access TEXT DEFAULT 'full'`);
  await db.query(`
    UPDATE users
    SET vault_access = 'full'
    WHERE vault_access IS NULL
       OR TRIM(vault_access) = ''
       OR vault_access NOT IN ('full', 'view_only')
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
      item_type TEXT DEFAULT 'document',
      priority TEXT DEFAULT 'normal',
      description TEXT,
      contact_name TEXT,
      contact_phone TEXT,
      contact_address TEXT,
      contact_email TEXT,
      reference_number TEXT,
      start_date DATE,
      expiry_date DATE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  // Add columns if they don't exist (for databases created before these fields were added)
  await db.query(`ALTER TABLE items ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'document'`);
  await db.query(`ALTER TABLE items ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal'`);
  await db.query(`ALTER TABLE items ADD COLUMN IF NOT EXISTS start_date DATE`);
  await db.query(`ALTER TABLE items ADD COLUMN IF NOT EXISTS expiry_date DATE`);
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
  await db.query(`
    CREATE TABLE IF NOT EXISTS vault_access_requests (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE REFERENCES users(id),
      status TEXT DEFAULT 'pending',
      requested_at TIMESTAMPTZ DEFAULT NOW(),
      reviewed_at TIMESTAMPTZ,
      note TEXT
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      token TEXT UNIQUE,
      expires_at TIMESTAMPTZ,
      used BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('Connected to PostgreSQL and tables ready');
}

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, async (err, user) => {
    if (err) return res.sendStatus(403);

    try {
      const result = await db.query(
        'SELECT id, email, username, vault_access FROM users WHERE id = $1',
        [user.id]
      );

      if (!result.rows[0]) return res.sendStatus(401);

      req.user = result.rows[0];
      next();
    } catch (dbErr) {
      res.status(500).json({ error: dbErr.message });
    }
  });
}

function requireVaultAccess(req, res, next) {
  if (req.user.vault_access === 'view_only') {
    return res.status(403).json({
      error: 'Your account currently has view access only. Request your own vault access to add or edit personal records.'
    });
  }

  next();
}

// ROUTES

// Protected file serving — requires a valid JWT
app.get('/uploads/:filename', authenticateToken, (req, res) => {
  const filename = path.basename(req.params.filename);
  const filepath = path.join(__dirname, 'uploads', filename);
  if (!fs.existsSync(filepath)) return res.status(404).json({ error: 'File not found' });
  res.sendFile(filepath);
});

// Register
app.post('/api/auth/register', authLimiter, async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const invitations = await db.query(
      'SELECT owner_id FROM invitations WHERE invited_email = $1 AND status = $2 AND expires_at > NOW()',
      [email, 'pending']
    );
    const vaultAccess = invitations.rows.length > 0 ? 'view_only' : 'full';

    const result = await db.query(
      'INSERT INTO users (username, email, password, vault_access) VALUES ($1, $2, $3, $4) RETURNING id',
      [username, email, hashedPassword, vaultAccess]
    );
    const newUserId = result.rows[0].id;

    // Auto-accept pending invitations for this email
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

    res.status(201).json({ message: 'User registered', id: newUserId, vault_access: vaultAccess });
  } catch (err) {
    return res.status(400).json({ error: 'Username or email already exists' });
  }
});

// Login
app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, username: user.username, vault_access: user.vault_access || 'full' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/forgot-password', authLimiter, async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const userResult = await db.query(
      'SELECT id, username, email FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    // Always return success shape to avoid user enumeration.
    if (!userResult.rows[0]) {
      return res.json({ message: 'If this email exists, a reset link has been sent.' });
    }

    const user = userResult.rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await db.query('UPDATE password_resets SET used = true WHERE user_id = $1 AND used = false', [user.id]);
    await db.query(
      'INSERT INTO password_resets (user_id, token, expires_at, used) VALUES ($1, $2, $3, false)',
      [user.id, token, expiresAt]
    );

    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendBase}/reset-password?token=${encodeURIComponent(token)}`;
    await sendPasswordResetEmail(user.email, user.username, resetLink);

    return res.json({ message: 'If this email exists, a reset link has been sent.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/reset-password', authLimiter, async (req, res) => {
  const token = (req.body.token || '').trim();
  const newPassword = req.body.new_password || '';

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const resetResult = await db.query(
      `SELECT id, user_id
       FROM password_resets
       WHERE token = $1 AND used = false AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [token]
    );

    const resetRow = resetResult.rows[0];
    if (!resetRow) {
      return res.status(400).json({ error: 'Reset link is invalid or expired' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, resetRow.user_id]);
    await db.query('UPDATE password_resets SET used = true WHERE id = $1', [resetRow.id]);

    return res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Get all categories for user
app.get('/api/categories', authenticateToken, requireVaultAccess, async (req, res) => {
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
app.post('/api/categories', authenticateToken, requireVaultAccess, async (req, res) => {
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
app.get('/api/items/all', authenticateToken, requireVaultAccess, async (req, res) => {
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
app.get('/api/categories/:categoryId/items', authenticateToken, requireVaultAccess, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM items WHERE category_id = $1 AND user_id = $2',
      [req.params.categoryId, req.user.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create item
app.post('/api/categories/:categoryId/items', authenticateToken, requireVaultAccess, async (req, res) => {
  const { title, item_type, priority, description, contact_name, contact_phone, contact_address, contact_email, reference_number, start_date, expiry_date } = req.body;
  const validTypes = ['document', 'contact', 'account', 'policy'];
  const validPriorities = ['normal', 'important', 'critical'];
  const safeType = validTypes.includes(item_type) ? item_type : 'document';
  const safePriority = validPriorities.includes(priority) ? priority : 'normal';
  try {
    const result = await db.query(
      'INSERT INTO items (category_id, user_id, title, item_type, priority, description, contact_name, contact_phone, contact_address, contact_email, reference_number, start_date, expiry_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id',
      [req.params.categoryId, req.user.id, title, safeType, safePriority, description, contact_name, contact_phone, contact_address, contact_email, reference_number, start_date || null, expiry_date || null]
    );
    res.status(201).json({ id: result.rows[0].id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update item
app.put('/api/items/:itemId', authenticateToken, requireVaultAccess, async (req, res) => {
  const { title, item_type, priority, description, contact_name, contact_phone, contact_address, contact_email, reference_number, start_date, expiry_date } = req.body;
  const validTypes = ['document', 'contact', 'account', 'policy'];
  const validPriorities = ['normal', 'important', 'critical'];
  const safeType = validTypes.includes(item_type) ? item_type : 'document';
  const safePriority = validPriorities.includes(priority) ? priority : 'normal';
  try {
    await db.query(
      'UPDATE items SET title=$1, item_type=$2, priority=$3, description=$4, contact_name=$5, contact_phone=$6, contact_address=$7, contact_email=$8, reference_number=$9, start_date=$10, expiry_date=$11, updated_at=NOW() WHERE id=$12 AND user_id=$13',
      [title, safeType, safePriority, description, contact_name, contact_phone, contact_address, contact_email, reference_number, start_date || null, expiry_date || null, req.params.itemId, req.user.id]
    );
    res.json({ message: 'Item updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete item
app.delete('/api/items/:itemId', authenticateToken, requireVaultAccess, async (req, res) => {
  try {
    await db.query('DELETE FROM items WHERE id=$1 AND user_id=$2', [req.params.itemId, req.user.id]);
    res.json({ message: 'Item deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Upload file
app.post('/api/items/:itemId/upload', authenticateToken, requireVaultAccess, (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
      const result = await db.query(
        'INSERT INTO files (item_id, filename, original_filename, filepath) VALUES ($1,$2,$3,$4) RETURNING id',
        [req.params.itemId, req.file.filename, req.file.originalname, req.file.path]
      );
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
      res.status(201).json({ id: result.rows[0].id, filename: req.file.filename, original_filename: req.file.originalname, url: `${backendUrl}/uploads/${req.file.filename}` });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
});

// Get files for item
app.get('/api/items/:itemId/files', authenticateToken, requireVaultAccess, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM files WHERE item_id=$1', [req.params.itemId]);
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const rows = result.rows.map(f => ({ ...f, url: `${backendUrl}/uploads/${f.filename}` }));
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete file
app.delete('/api/files/:fileId', authenticateToken, requireVaultAccess, async (req, res) => {
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
app.get('/api/users', authenticateToken, requireVaultAccess, async (req, res) => {
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
app.post('/api/share', authenticateToken, requireVaultAccess, async (req, res) => {
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
app.delete('/api/share/:viewerId', authenticateToken, requireVaultAccess, async (req, res) => {
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
app.get('/api/my-sharers', authenticateToken, requireVaultAccess, async (req, res) => {
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
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${PORT}`;
    const result = await db.query(
      `SELECT i.*,
        COALESCE((
          SELECT json_agg(
            json_build_object(
              'id', f.id,
              'filename', f.filename,
              'original_filename', f.original_filename,
              'filepath', f.filepath,
              'created_at', f.uploaded_at,
              'url', $3 || '/uploads/' || f.filename
            )
          )
          FROM files f
          WHERE f.item_id = i.id
        ), '[]'::json) AS files
      FROM items i
      JOIN categories c ON c.id = i.category_id
      WHERE i.category_id=$1 AND c.user_id=$2
      ORDER BY i.updated_at DESC NULLS LAST, i.created_at DESC`,
      [req.params.categoryId, req.params.ownerId, backendUrl]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// INVITATION ENDPOINTS

// Send invite
app.post('/api/invite', authenticateToken, requireVaultAccess, async (req, res) => {
  const { invited_email } = req.body;
  const owner_id = req.user.id;
  const normalizedEmail = (invited_email || '').trim().toLowerCase();
  if (!normalizedEmail) return res.status(400).json({ error: 'Missing invited_email' });

  try {
    const ownerResult = await db.query('SELECT username, email FROM users WHERE id=$1', [owner_id]);
    const owner = ownerResult.rows[0];
    const ownerDisplayName = owner?.username || owner?.email || 'Someone';

    const existing = await db.query('SELECT id FROM users WHERE LOWER(email)=LOWER($1)', [normalizedEmail]);
    if (existing.rows[0]) {
      if (existing.rows[0].id === owner_id) {
        return res.status(400).json({ error: 'You cannot share data with yourself' });
      }

      await db.query(
        'INSERT INTO permissions (owner_id, viewer_id, access_level) VALUES ($1,$2,$3) ON CONFLICT (owner_id, viewer_id) DO UPDATE SET access_level=$3',
        [owner_id, existing.rows[0].id, 'view']
      );

      return res.status(200).json({
        message: 'User already registered. Access granted successfully.',
        invited_email: normalizedEmail,
        shared_user_id: existing.rows[0].id,
      });
    }

    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    await db.query(
      'INSERT INTO invitations (owner_id, invited_email, status, expires_at) VALUES ($1,$2,$3,$4) ON CONFLICT (owner_id, invited_email) DO UPDATE SET status=$3, expires_at=$4',
      [owner_id, normalizedEmail, 'pending', expiresAt]
    );
    const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?invited_email=${encodeURIComponent(normalizedEmail)}`;
    await sendInvitationEmail(normalizedEmail, ownerDisplayName, invitationLink);
    res.status(201).json({ message: 'Invitation sent', invited_email: normalizedEmail, expires_at: expiresAt });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get pending invitations
app.get('/api/my-invitations', authenticateToken, requireVaultAccess, async (req, res) => {
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
app.delete('/api/invitation/:invitationId', authenticateToken, requireVaultAccess, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM invitations WHERE id=$1 AND owner_id=$2', [req.params.invitationId, req.user.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Invitation not found' });
    res.json({ message: 'Invitation cancelled' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get combined access list
app.get('/api/my-access-list', authenticateToken, requireVaultAccess, async (req, res) => {
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

app.get('/api/account-access/status', authenticateToken, async (req, res) => {
  try {
    if (req.user.vault_access !== 'view_only') {
      return res.json({ vault_access: 'full', request_status: 'approved' });
    }

    const result = await db.query(
      'SELECT status, requested_at, reviewed_at, note FROM vault_access_requests WHERE user_id = $1',
      [req.user.id]
    );

    res.json({
      vault_access: req.user.vault_access,
      request_status: result.rows[0]?.status || 'not_requested',
      request: result.rows[0] || null,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/account-access/request', authenticateToken, async (req, res) => {
  try {
    if (req.user.vault_access === 'full') {
      return res.status(400).json({ error: 'Your account already has full vault access.' });
    }

    const result = await db.query(
      `INSERT INTO vault_access_requests (user_id, status, requested_at, reviewed_at)
       VALUES ($1, 'pending', NOW(), NULL)
       ON CONFLICT (user_id)
       DO UPDATE SET status = 'pending', requested_at = NOW(), reviewed_at = NULL
       RETURNING status, requested_at`,
      [req.user.id]
    );

    res.status(201).json({
      message: 'Vault access request submitted.',
      request_status: result.rows[0].status,
      requested_at: result.rows[0].requested_at,
    });
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
