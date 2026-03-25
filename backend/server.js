const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database setup
const db = new sqlite3.Database(path.join(__dirname, 'icoe.db'), (err) => {
  if (err) console.error('Database error:', err);
  else console.log('Connected to SQLite database (ICOE)');
});

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
function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Categories table
    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        category_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    // Items table
    db.run(`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER,
        user_id INTEGER,
        title TEXT,
        description TEXT,
        contact_info TEXT,
        reference_number TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(category_id) REFERENCES categories(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    // Files table
    db.run(`
      CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER,
        filename TEXT,
        original_filename TEXT,
        filepath TEXT,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(item_id) REFERENCES items(id)
      )
    `);

    // Permissions table
    db.run(`
      CREATE TABLE IF NOT EXISTS permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner_id INTEGER,
        viewer_id INTEGER,
        access_level TEXT DEFAULT 'view',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(owner_id) REFERENCES users(id),
        FOREIGN KEY(viewer_id) REFERENCES users(id),
        UNIQUE(owner_id, viewer_id)
      )
    `);
  });
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
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username, email, hashedPassword],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }
      res.status(201).json({ message: 'User registered', id: this.lastID });
    }
  );
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '24h'
    });

    res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
  });
});

// Get all categories for user
app.get('/api/categories', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM categories WHERE user_id = ?',
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
});

// Create category
app.post('/api/categories', authenticateToken, (req, res) => {
  const { category_name } = req.body;

  db.run(
    'INSERT INTO categories (user_id, category_name) VALUES (?, ?)',
    [req.user.id, category_name],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, category_name, user_id: req.user.id });
    }
  );
});

// Get items for category
app.get('/api/categories/:categoryId/items', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM items WHERE category_id = ? AND user_id = ?',
    [req.params.categoryId, req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
});

// Create item
app.post('/api/categories/:categoryId/items', authenticateToken, (req, res) => {
  const { title, description, contact_info, reference_number } = req.body;

  db.run(
    'INSERT INTO items (category_id, user_id, title, description, contact_info, reference_number) VALUES (?, ?, ?, ?, ?, ?)',
    [req.params.categoryId, req.user.id, title, description, contact_info, reference_number],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Update item
app.put('/api/items/:itemId', authenticateToken, (req, res) => {
  const { title, description, contact_info, reference_number } = req.body;

  db.run(
    'UPDATE items SET title = ?, description = ?, contact_info = ?, reference_number = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
    [title, description, contact_info, reference_number, req.params.itemId, req.user.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Item updated' });
    }
  );
});

// Delete item
app.delete('/api/items/:itemId', authenticateToken, (req, res) => {
  db.run(
    'DELETE FROM items WHERE id = ? AND user_id = ?',
    [req.params.itemId, req.user.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Item deleted' });
    }
  );
});

// Upload file
app.post('/api/items/:itemId/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  db.run(
    'INSERT INTO files (item_id, filename, original_filename, filepath) VALUES (?, ?, ?, ?)',
    [req.params.itemId, req.file.filename, req.file.originalname, req.file.path],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ 
        id: this.lastID, 
        filename: req.file.filename,
        original_filename: req.file.originalname,
        url: `/uploads/${req.file.filename}`
      });
    }
  );
});

// Get files for item
app.get('/api/items/:itemId/files', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM files WHERE item_id = ?',
    [req.params.itemId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
});

// Delete file
app.delete('/api/files/:fileId', authenticateToken, (req, res) => {
  db.get('SELECT * FROM files WHERE id = ?', [req.params.fileId], (err, file) => {
    if (err || !file) return res.status(404).json({ error: 'File not found' });

    fs.unlink(file.filepath, (err) => {
      if (err) console.error('Error deleting file:', err);
    });

    db.run('DELETE FROM files WHERE id = ?', [req.params.fileId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'File deleted' });
    });
  });
});

// Start server
initializeDatabase();
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
