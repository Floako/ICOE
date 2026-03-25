# ICOE - Phase 1 Prototype Setup

## Project Structure

```
ICOE/
├── backend/           # Node.js/Express server
│   ├── server.js      # Main API server
│   ├── package.json   # Dependencies
│   └── uploads/       # File storage directory
├── frontend/          # React application
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

## Quick Start (Windows)

### Prerequisites
- Node.js installed (v14 or higher) - Download from https://nodejs.org/

### Step 1: Start Backend Server

```bash
cd backend
npm install
npm start
```

Backend will run on: **http://localhost:5000**

### Step 2: Start Frontend (in a new terminal)

```bash
cd frontend
npm install
npm start
```

Frontend will run on: **http://localhost:3000** (automatically opens in browser)

---

## Features Implemented

✅ **Authentication**
- User Registration & Login with JWT
- Secure password hashing with bcrypt

✅ **Six Main Categories**
- LEGAL, HEALTH, FINANCE, SERVICES, INSURANCE, MEMBERSHIPS

✅ **Data Management**
- Add/Edit/Delete items in each category
- Store contact info, description, reference numbers
- Text field support

✅ **File Uploads**
- Upload scans/documents
- Download files when needed
- Delete files

✅ **Access Control**
- Owner-only edit/delete permissions
- Data isolated per user

✅ **Local Database**
- SQLite database (no external DB setup needed)
- All data stored locally in `backend/icoe.db`

---

## Test Credentials

Use these to test the app after logging in for the first time:

**Register a new account** or use demo credentials:
- Email: test@example.com
- Password: password123

---

## Database

SQLite database automatically created at: `backend/icoe.db`

### Tables:
- **users** - User accounts
- **categories** - Data categories (LEGAL, HEALTH, etc.)
- **items** - Individual entries within categories
- **files** - Uploaded documents
- **permissions** - User access permissions (for Phase 2)

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category

### Items
- `GET /api/categories/:categoryId/items` - List items in category
- `POST /api/categories/:categoryId/items` - Create item
- `PUT /api/items/:itemId` - Update item
- `DELETE /api/items/:itemId` - Delete item

### Files
- `POST /api/items/:itemId/upload` - Upload file
- `GET /api/items/:itemId/files` - List files for item
- `DELETE /api/files/:fileId` - Delete file

---

## Troubleshooting

**Port 5000 already in use?**
```bash
# Find process on port 5000
netstat -ano | findstr :5000
# Kill it
taskkill /PID <PID> /F
```

**Port 3000 already in use?**
The React app will prompt you to use a different port (3001, etc.)

**npm modules not installing?**
```bash
# Clear cache
npm cache clean --force
# Try install again
npm install
```

**Database issues?**
Delete `backend/mbb.db` and restart - it will recreate automatically

---

## Next Steps (Phase 2)

- [ ] Share data with family members (permissions system)
- [ ] Multi-user access control
- [ ] Notification system
- [ ] Cloud backup (AWS S3, etc.)
- [ ] Mobile responsive improvements
- [ ] Export/import data
- [ ] Email notifications for shared access

---

**Ready to test?** Start the backend and frontend, then register and log in!
