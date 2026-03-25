# ICOE Developer Guide

## Getting Started

### Prerequisites
- Node.js v14+ ([Download](https://nodejs.org/))
- npm (comes with Node.js)
- Text editor or VS Code
- Git (optional, for version control)

### Environment Setup

```bash
# Clone or download project
cd path/to/MBB

# Backend setup
cd backend
npm install
npm start

# Frontend setup (new terminal)
cd frontend
npm install
npm start
```

---

## Project Structure Explained

```
MBB/
├── backend/                    # Node.js/Express server
│   ├── server.js              # All routes, database, middleware
│   ├── package.json           # Dependencies list
│   ├── mbb.db                # SQLite database (auto-created)
│   └── uploads/              # User-uploaded files
│
├── frontend/                   # React web application
│   ├── src/
│   │   ├── App.js            # Root component
│   │   ├── index.js          # React entry point
│   │   ├── components/       # React components
│   │   │   ├── Auth.js       # Login/Register
│   │   │   ├── Dashboard.js  # Main layout
│   │   │   ├── CategoryList.js
│   │   │   └── ItemDetail.js
│   │   └── styles/           # CSS files
│   ├── public/
│   │   └── index.html        # HTML skeleton
│   └── package.json          # Dependencies
│
├── docs/                      # Documentation
│   ├── 01-ARCHITECTURE.md
│   ├── 02-DATA-MODELS.md
│   ├── 03-API-REFERENCE.md
│   ├── 04-COMPONENTS.md
│   └── 05-USER-FLOWS.md
│
└── README_SETUP.md           # Quick start guide
```

---

## Development Workflow

### 1. Making a Backend Change

**Example: Add new API endpoint**

```bash
# 1. Stop backend server (Ctrl+C)
# 2. Edit backend/server.js
# 3. Add new route:

app.get('/api/new-endpoint', authenticateToken, (req, res) => {
  // Implementation
  res.json({ data: 'response' });
});

# 4. Save file
# 5. Restart: npm start
# 6. Test in Postman or frontend
```

**Testing the change:**

```bash
# Terminal - test the new endpoint
curl http://localhost:5000/api/new-endpoint \
  -H "Authorization: Bearer <token>"
```

### 2. Making a Frontend Change

**Example: Modify a component**

```bash
# 1. Edit src/components/MyComponent.js
# 2. Save file (React dev server auto-reloads)
# 3. Browser updates automatically
# 4. Test in UI
```

**Hot Reload:**
- Changes to `.js` files auto-refresh browser
- Changes to `.css` files inject without reload
- Errors show in browser console

### 3. Database Changes

**To inspect database:**

```bash
# Install sqlite3 CLI (Windows/Mac/Linux)
# Then:
sqlite3 backend/mbb.db

# Now in SQLite shell:
> .tables           # List tables
> SELECT * FROM users;  # View data
> .schema items    # View table structure
> .exit            # Exit
```

**To reset database:**

```bash
# 1. Stop backend
# 2. Delete: backend/mbb.db
# 3. Restart backend
# 4. Database recreates with fresh schema
```

---

## Common Development Tasks

### Add a New Item Field

**Scenario:** Add a "priority" field to items

#### Step 1: Update Database Schema

Edit `backend/server.js`:

```javascript
// In initializeDatabase() function, update CREATE TABLE items:

db.run(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    contact_info TEXT,
    reference_number TEXT,
    priority INTEGER DEFAULT 0,  // ADD THIS LINE
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(category_id) REFERENCES categories(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`);
```

#### Step 2: Update Create Endpoint

```javascript
// In POST /api/categories/:categoryId/items

app.post('/api/categories/:categoryId/items', authenticateToken, (req, res) => {
  const { title, description, contact_info, reference_number, priority } = req.body;
  
  db.run(
    `INSERT INTO items 
     (category_id, user_id, title, description, contact_info, reference_number, priority)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [categoryId, req.user.id, title, description, contact_info, reference_number, priority],
    // ...
  );
});
```

#### Step 3: Update Update Endpoint

```javascript
// In PUT /api/items/:itemId

db.run(
  `UPDATE items 
   SET title = ?, description = ?, contact_info = ?, 
       reference_number = ?, priority = ?, updated_at = CURRENT_TIMESTAMP
   WHERE id = ? AND user_id = ?`,
  [title, description, contact_info, reference_number, priority, itemId, req.user.id],
  // ...
);
```

#### Step 4: Update Frontend Component

Edit `frontend/src/components/CategoryList.js`:

```javascript
// In item form:
const [formData, setFormData] = useState({
  title: '',
  description: '',
  contact_info: '',
  reference_number: '',
  priority: 0  // ADD THIS
});

// In JSX:
<select value={formData.priority} 
        onChange={(e) => setFormData({...formData, priority: e.target.value})}>
  <option value={0}>Low</option>
  <option value={1}>Medium</option>
  <option value={2}>High</option>
</select>
```

#### Step 5: Test

1. Delete `backend/mbb.db` (forces schema recreation)
2. Restart backend
3. Test in UI - priority dropdown should appear

---

### Add Authentication to a Route

**Scenario:** Add a route that requires a logged-in user

```javascript
// BEFORE (anyone can access):
app.get('/api/public-data', (req, res) => {
  res.json({ data: 'public' });
});

// AFTER (requires authentication):
app.get('/api/user-data', authenticateToken, (req, res) => {
  // req.user is now available
  res.json({ 
    userId: req.user.id,
    email: req.user.email,
    data: 'private'
  });
});
```

The `authenticateToken` middleware:
1. Checks for Authorization header
2. Verifies JWT token signature
3. If valid: adds `req.user` to request
4. If invalid: returns 403 Forbidden

---

### Handle Errors Properly

**Pattern:**

```javascript
app.post('/api/example', authenticateToken, (req, res) => {
  const { name } = req.body;
  
  // 1. Validate input
  if (!name) {
    return res.status(400).json({ error: 'Name required' });
  }
  
  // 2. Check authorization
  if (req.user.id !== expectedUserId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // 3. Execute operation
  db.run('...', (err) => {
    // 4. Handle database errors
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // 5. Return success
    res.json({ message: 'Success' });
  });
});
```

---

## Debugging Tips

### Backend Debugging

**1. Console Logs**

```javascript
// Add to understand flow
console.log('User ID:', req.user.id);
console.log('Request body:', req.body);
console.log('Database query:', query);
```

**Run with logs:**
```bash
npm start 2>&1 | tee debug.log
```

**2. Check Network Requests**

Open browser DevTools (F12):
- Network tab → see all HTTP requests
- Console tab → see JavaScript errors
- Application → LocalStorage (check token)

**3. Test API Directly**

```bash
# Using curl
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# Using Postman
# 1. Create request
# 2. Set URL: http://localhost:5000/api/endpoint
# 3. Add token in Headers: Authorization: Bearer <token>
# 4. Send request
```

### Frontend Debugging

**1. Browser DevTools**

```javascript
// console.log patterns
console.log('Component mounted', this.props);
console.log('State updated:', this.state);
```

**2. React DevTools Extension**

Chrome/Firefox extension shows:
- Component tree
- Props/state values
- Re-render reasons

**3. Check LocalStorage**

```javascript
// In browser console:
localStorage.getItem('token')     // See stored token
localStorage.removeItem('token')  // Clear for testing
```

---

## Testing

### Manual Testing Checklist

- [ ] Register new user
- [ ] Login with credentials
- [ ] Logout
- [ ] Create item in each category
- [ ] Edit item
- [ ] Upload file to item
- [ ] Download file
- [ ] Delete file
- [ ] Delete item
- [ ] Test with invalid data (empty fields)

### Automated Testing (Future)

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

---

## Performance Monitoring

### Identify Slow Queries

```bash
# Enable SQLite query logging:
SQLITE_QUERY_LOG=1 npm start
```

### Browser Performance

DevTools → Performance tab:
1. Click Record
2. Perform action
3. Stop recording
4. Analyze flamegraph

---

## Version Control (Git)

### Basic Workflow

```bash
# 1. Check status
git status

# 2. Add changes
git add .

# 3. Commit
git commit -m "Add priority field to items"

# 4. Push
git push origin main
```

### .gitignore

```
node_modules/
backend/mbb.db
backend/uploads/*
.env
.env.local
```

---

## Deployment Preparation

### Pre-deployment Checklist

**Backend:**
- [ ] Set NODE_ENV=production
- [ ] Generate strong JWT_SECRET
- [ ] Configure database (PostgreSQL)
- [ ] Set up file storage (AWS S3)
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up error logging
- [ ] Test all endpoints

**Frontend:**
- [ ] Update API base URL to production
- [ ] Build for production: `npm run build`
- [ ] Test built version locally
- [ ] Configure CDN if using
- [ ] Set environment variables

---

## Resources

### Documentation
- [Express.js docs](http://expressjs.com/)
- [React docs](https://react.dev/)
- [SQLite docs](https://sqlite.org/docs.html)
- [JWT introduction](https://jwt.io/introduction)

### Tools
- [Postman](https://www.postman.com/) - API testing
- [SQLite Browser](https://sqlitebrowser.org/) - Database inspection
- [VS Code](https://code.visualstudio.com/) - Code editor

### Learning
- Node.js best practices
- React hooks patterns
- RESTful API design
- Database indexing

---

## Getting Help

### Troubleshooting Common Issues

**1. Port already in use**

```bash
# Find process on port 5000
netstat -ano | findstr :5000

# Kill it (Windows)
taskkill /PID <PID> /F

# Or use different port
PORT=5001 npm start
```

**2. npm install fails**

```bash
# Clear cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

**3. Token not working**

- Check token is in localStorage
- Check token is included in request header
- Check token hasn't expired (24 hours)
- Check JWT_SECRET matches server

**4. Database locked**

```bash
# Stop all processes
# Delete mbb.db
# Restart backend
```

---

## Contributing Guidelines

### Code Style

```javascript
// Use arrow functions
const fetchData = () => { };

// Use const/let, not var
const name = 'value';

// Use template literals
const message = `Hello ${name}`;

// Use async/await (future)
async function getData() {
  const result = await fetch(...);
}
```

### Commit Messages

```
// Format: type(scope): message
feat(auth): add password reset
fix(upload): resolve file size validation
docs: update API reference
test: add user registration tests
```

---

## Next Steps

1. **Understand the code:**
   - Read backend/server.js
   - Read frontend component files
   - Trace a user flow from login to data entry

2. **Run locally:**
   - Start backend and frontend
   - Create test user
   - Add sample data in each category
   - Try all features

3. **Make a change:**
   - Add a new field
   - Create a new endpoint
   - Fix a bug
   - Test thoroughly

4. **Review documentation:**
   - Read API Reference for endpoints
   - Read Data Models for schema
   - Read User Flows for feature context
