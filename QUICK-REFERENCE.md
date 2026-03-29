# ICON Quick Reference Card

## Project at a Glance

**Project:** ICON (In Case Of Need - Information Manager)  
**Type:** Full-stack web application  
**Tech Stack:** React + Node.js/Express + SQLite  
**Status:** Phase 1 - MVP Complete  

---

## Running the App (30 seconds)

### Option 1: Windows
```bash
cd backend
npm install && npm start

# New Terminal:
cd frontend
npm install && npm start
```

### Option 2: One Command
```bash
START-MBB.bat
```

**URLs:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Database: backend/mbb.db

---

## Project Structure

```
backend/         Express API server + SQLite database
frontend/        React web application
docs/            8 comprehensive documentation files
START-MBB.bat    One-click launcher
```

---

## File Locations Quick Map

| File Type | Location | Purpose |
|-----------|----------|---------|
| API Routes | `backend/server.js` | All endpoints |
| Database | `backend/mbb.db` | SQLite (auto-created) |
| Uploads | `backend/uploads/` | User files |
| Root Component | `frontend/src/App.js` | App entry |
| Components | `frontend/src/components/` | React components |
| Styles | `frontend/src/*.css` | Component styles |

---

## Core API Endpoints

### Auth
```
POST   /api/auth/register     Register user
POST   /api/auth/login        Login, get token
```

### Categories
```
GET    /api/categories        List all
POST   /api/categories        Create new
```

### Items (CRUD)
```
GET    /api/categories/:id/items           List for category
POST   /api/categories/:id/items           Create
PUT    /api/items/:id                      Update
DELETE /api/items/:id                      Delete
```

### Files
```
POST   /api/items/:id/upload  Upload file
GET    /api/items/:id/files   List files
DELETE /api/files/:id         Delete file
```

All require `Authorization: Bearer <token>` header

---

## React Components

```
App (Root)
├── Auth (Login/Register)
└── Dashboard (Main)
    ├── Sidebar (Categories)
    ├── CategoryList (Items + Form)
    └── ItemDetail (Edit/Delete + Files)
```

**Key Components File:**  
[04-COMPONENTS.md](docs/04-COMPONENTS.md)

---

## Database Tables

| Table | Stores |
|-------|--------|
| users | Accounts |
| categories | LEGAL, HEALTH, FINANCE, etc. |
| items | Individual entries |
| files | Uploads |
| permissions | Sharing (Phase 2) |

**Database Reference:**  
[02-DATA-MODELS.md](docs/02-DATA-MODELS.md)

---

## Authentication Flow

```
User enters credentials
         ↓
Hash password validation
         ↓
Generate JWT token
         ↓
Store in localStorage
         ↓
Include in API requests
```

Token expires in 24 hours.

---

## Common Tasks

### Add a New Endpoint

1. Edit `backend/server.js`
2. Add route handler:
   ```javascript
   app.get('/api/new-route', authenticateToken, (req, res) => {
     // Implementation
   });
   ```
3. Restart backend (`npm start`)
4. Update docs in [03-API-REFERENCE.md](docs/03-API-REFERENCE.md)

### Add a New Component Field

1. Update database schema in `backend/server.js`
2. Update API endpoint to include field
3. Update React form in component
4. Delete database file to force schema recreation
5. Test in UI

### Debug an Issue

1. Check browser DevTools (F12) - Console tab
2. Check backend logs in terminal
3. Use Postman to test API directly
4. Read [07-DEVELOPER-GUIDE.md](docs/07-DEVELOPER-GUIDE.md)

---

## Key Directories

```
backend/
├── server.js (everything is here - ~400 lines)
├── package.json (dependencies)
├── mbb.db (SQLite database)
└── uploads/ (user files)

frontend/src/
├── App.js (root)
├── components/ (5 React components)
├── index.js (React entry)
└── *.css (styles)

docs/
├── 01-ARCHITECTURE.md (System design)
├── 02-DATA-MODELS.md (Database)
├── 03-API-REFERENCE.md (Endpoints)
├── 04-COMPONENTS.md (React)
├── 05-USER-FLOWS.md (User journeys)
├── 06-BACKEND-IMPLEMENTATION.md (Server code)
├── 07-DEVELOPER-GUIDE.md (Dev guide)
└── 08-DOCUMENTATION-INDEX.md (Doc map)
```

---

## Development Commands

```bash
# Backend
npm install           Install dependencies
npm start            Start server (port 5000)

# Frontend
npm install          Install dependencies
npm start            Start dev server (port 3000)
npm run build        Build for production

# Database
# Delete backend/mbb.db to reset
# SQLite will recreate on next run
```

---

## Security Reminders

**Phase 1:**
✓ Passwords hashed with bcryptjs
✓ JWT authentication
✓ Per-user data isolation
✗ No HTTPS (local only)

**For Production (Phase 2):**
- [ ] Generate strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Configure CORS
- [ ] Add rate limiting
- [ ] Set up logging

---

## Categories Supported

- **LEGAL** - Lawyers, Wills, POA
- **HEALTH** - Doctors, Carers
- **FINANCE** - Banks, Pensions, Mortgages
- **SERVICES** - Utilities, Telecoms
- **INSURANCE** - Car, House, Personal
- **MEMBERSHIPS** - Subscriptions, Memberships

---

## File Upload Constraints

- **Max size:** 10MB per file
- **Allowed types:** PDF, JPEG, PNG, GIF, WEBP, DOC, DOCX, XLS, XLSX, TXT, RTF
- **Storage:** `backend/uploads/`
- **Database:** File metadata stored, files physically stored on disk

---

## Testing Checklist

```
□ Register new user
□ Login successfully
□ Navigate categories
□ Create item
□ Edit item
□ Upload file
□ Download file
□ Delete file
□ Delete item
□ Logout
□ Test with invalid data
```

---

## Troubleshooting

### Port Already in Use
```bash
# Find process
netstat -ano | findstr :5000

# Kill it
taskkill /PID <PID> /F
```

### npm install fails
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Database Issues
```bash
# Delete database file
del backend\mbb.db

# Restart backend - recreates automatically
npm start
```

### Token Issues
- Check localStorage: `localStorage.getItem('token')`
- Check expires in 24h
- Check header format: `Authorization: Bearer <token>`

---

## Documentation Map

Start with: **[08-DOCUMENTATION-INDEX.md](docs/08-DOCUMENTATION-INDEX.md)**

Then read by role:
- **PM/Product:** [05-USER-FLOWS.md](docs/05-USER-FLOWS.md)
- **Frontend Dev:** [04-COMPONENTS.md](docs/04-COMPONENTS.md)
- **Backend Dev:** [06-BACKEND-IMPLEMENTATION.md](docs/06-BACKEND-IMPLEMENTATION.md)
- **Architect:** [01-ARCHITECTURE.md](docs/01-ARCHITECTURE.md)
- **Database:** [02-DATA-MODELS.md](docs/02-DATA-MODELS.md)
- **API Consumer:** [03-API-REFERENCE.md](docs/03-API-REFERENCE.md)
- **Developer:** [07-DEVELOPER-GUIDE.md](docs/07-DEVELOPER-GUIDE.md)

---

## Important Files to Know

| File | Lines | Purpose |
|------|-------|---------|
| `backend/server.js` | ~400 | Everything: routes, auth, DB |
| `frontend/src/App.js` | 30 | Root component |
| `frontend/src/components/Dashboard.js` | 100 | Main app layout |
| `backend/ICON.db` | Binary | SQLite database |

---

## User Login Flow

```
1. User visits localhost:3000
2. Sees login form
3. Enters email + password
4. Frontend: POST /api/auth/login
5. Backend: Verify credentials, generate JWT
6. Frontend: Store token in localStorage
7. Redirect to Dashboard
8. Dashboard fetches categories with token
```

---

## Data Entry Example

**Scenario: Add a lawyer's info in LEGAL category**

```
Item:
  Title: "Smith & Associates"
  Description: "Our family lawyer"
  Contact: "Tel: 020-3456-7890, Email: john@smith.co.uk"
  Reference: "Client ID: LAW001"

Upload:
  - Will scan (PDF)
  - POA document (PDF)
  - Deed (PDF)
```

---

## Next Steps

1. **Get it running:** 
   - Run `START-MBB.bat` or follow setup

2. **Understand the code:**
   - Read backend/server.js
   - Read frontend/src/App.js
   - Check docs/

3. **Make a change:**
   - Add an item
   - Upload a file
   - Try edit/delete

4. **Extend the app:**
   - Add new field
   - Create new endpoint
   - Add new component

---

## Quick Links

- Backend: `backend/server.js` (all routes)
- Frontend: `frontend/src/App.js` (entry)
- Database: `backend/mbb.db` (auto-created)
- Docs: `docs/` folder
- API: `localhost:5000`
- UI: `localhost:3000`

---

## Version Info

**Created:** March 25, 2026  
**Status:** Phase 1 - MVP Complete  
**Next:** Phase 2 - User Sharing  
**Node.js:** v14+  
**React:** 18.2  
**Database:** SQLite3  

---

## Support

Having issues? Check here:
1. [README_SETUP.md](../README_SETUP.md) - Setup troubleshooting
2. [07-DEVELOPER-GUIDE.md](docs/07-DEVELOPER-GUIDE.md) - Dev troubleshooting  
3. [08-DOCUMENTATION-INDEX.md](docs/08-DOCUMENTATION-INDEX.md) - Find specific topic
4. Backend logs in terminal
5. Browser DevTools console (F12)

---

**Print this card for quick reference!**
