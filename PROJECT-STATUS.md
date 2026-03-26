# ICOE — Project Status & Continuation Prompt
*Last updated: 26 March 2026*

---

## COPY THIS ENTIRE BLOCK TO START A NEW SESSION

```
I am continuing development of ICOE (In Case of Emergency) — a React + Node.js web app 
that lets users securely store and share emergency information with trusted contacts.

Here is the full project status as of 26 March 2026:

## What ICOE is
A personal emergency information vault. Users store critical records (legal, health, 
finance, insurance, etc.) and can share access with family/trusted contacts via email 
invitation. Think of it as a private digital black box for your life.

## Tech Stack
- Frontend: React (Create React App), plain CSS, port 3000
- Backend: Node.js + Express, port 5000
- Database: PostgreSQL via Supabase (cloud)
- Auth: JWT + bcryptjs
- Email: Nodemailer + Mailtrap (sandbox, working)
- File uploads: Multer
- GitHub: https://github.com/Floako/ICOE.git (master branch)

## Workspace
C:\Users\pheal\code\MBB1\MBB\
  backend/
    server.js       — Express API, fully migrated to PostgreSQL (pg package)
    package.json
    .env            — secrets (not in git)
    uploads/        — file upload storage
  frontend/
    src/
      App.js        — root, controls Welcome/Auth/Dashboard routing
      index.css     — global design tokens and resets
      components/
        Welcome.js / Welcome.css   — landing page (dark theme, red accent)
        Auth.js / Auth.css         — login/register (dark glass card)
        Dashboard.js / Dashboard.css — main app shell
        CategoryList.js / CategoryList.css — record list + add form
        ItemDetail.js / ItemDetail.css     — record detail view
        ShareData.js, ManageAccess.js, SharedWithMe.js, PendingInvites.js

## Credentials & Connectivity

### Supabase (PostgreSQL)
- Project ref: ryovrymicbosabnmwgju
- Region: eu-central-1
- Connection string (Session Pooler, port 5432):
  postgresql://postgres.ryovrymicbosabnmwgju:Cm551977%21postgres@aws-1-eu-central-1.pooler.supabase.com:5432/postgres
- Password: Cm551977!postgres  (the word "postgres" is appended — this is correct)
- Status: WORKING as of 25 March 2026

### Mailtrap (Email sandbox)
- Host: sandbox.smtp.mailtrap.io
- Port: 587
- User: e9ca4c86644223
- Password: 9069ce6ebb0ada
- Status: VERIFIED WORKING

### GitHub
- Repo: https://github.com/Floako/ICOE.git
- Branch: master
- Git user: floako / pauljhealymail@gmail.com
- Credentials cached via Windows Credential Manager
- Last push: 25 March 2026 (code was up to date at that point)

## .env file (backend/.env)
DATABASE_URL=postgresql://postgres.ryovrymicbosabnmwgju:Cm551977%21postgres@aws-1-eu-central-1.pooler.supabase.com:5432/postgres
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=e9ca4c86644223
EMAIL_PASSWORD=9069ce6ebb0ada
FRONTEND_URL=http://localhost:3000

## How to Start the App
1. Backend:  cd backend  then  node server.js
   → Should print: "Connected to PostgreSQL and tables ready" then "Server running on http://localhost:5000"

2. Frontend: cd frontend  then  npm start
   → Opens http://localhost:3000

## Database Tables (auto-created on first backend run)
- users (id, username, email, password_hash, created_at)
- categories (id, user_id, category_name, created_at)
- items (id, category_id, user_id, title, item_type, priority, description,
         contact_name, contact_phone, contact_address, contact_email,
         reference_number, start_date, expiry_date, created_at, updated_at)
- files (id, item_id, filename, original_filename, filepath, created_at)
- invitations (id, owner_id, invited_email, token, status, expires_at, created_at)
- shared_access (id, owner_id, viewer_id, permissions, created_at)

## Key API Endpoints
POST /api/auth/register      — create account
POST /api/auth/login         — returns JWT token
GET  /api/categories         — returns categories WITH item_count (LEFT JOIN)
POST /api/categories         — create category
GET  /api/categories/:id/items — items for a category
POST /api/categories/:id/items — create item
PUT  /api/items/:id          — update item
DELETE /api/items/:id        — delete item
GET  /api/items/all          — all items across all categories (for overview)
POST /api/invitations        — send email invite
GET  /api/invitations/pending — pending invites
POST /api/invitations/:token/accept — accept invite

## Design System
- Dark navy theme: #1a1a2e (darkest), #0f3460 (navy), #16213e (mid)
- Red accent: #e94560
- Background for dashboard: #f0f2f7 (light grey)
- Sidebar: #1e2235 (dark charcoal)
- Font: system-ui / -apple-system stack

## Current Categories (hardcoded in Dashboard.js)
LEGAL ⚖️, HEALTH 🏥, FINANCE 💰, SERVICES 🔧, 
INSURANCE/ASSURANCE 🛡️, MEMBERSHIPS 🪪,
TRANSPORT 🚗, TRAVEL ✈️, TICKETS & EVENTS 🎟️

## Item Record Fields
- title (required)
- item_type: document | contact | account | policy  (radio cards)
- priority: normal | important | critical  (radio pills)
- description
- contact_name, contact_phone, contact_email, contact_address
- reference_number
- start_date (optional DATE, for future AI scanning)
- expiry_date (optional DATE, for future AI scanning)

## Features Completed
- Welcome landing page with ICOE branding and feature cards
- Login / Register with dark glass card UI
- Dashboard with dark sidebar, category icons, item count badges
- Overview panel on login showing all categories as clickable cards
  - Shows up to 3 record previews per category
  - Critical records alert banner
  - Total record count in header
- Add Record form with radio buttons (type + priority) and labelled fields
- Item cards with type icon + priority dot
- Sharing system (invite by email, manage access, shared-with-me view)
- Pending invites tab
- All data stored in Supabase PostgreSQL
- File attachments: multi-file picker on Add Record form, files uploaded after record creation
- File viewing: files served directly from backend (http://localhost:5000/uploads/...) — links open in new tab
- Start Date + Expiry/Renewal Date fields on Add Record form and Item Detail view/edit
- Auth form clears on logout, mode switch, and mount (prevents stale data showing)
- Logout resets URL params and auth mode

## Known Issues / Pending Work
- [ ] File viewing: backend must be running for links to work (expected for local dev)
- [ ] Browser autofill (F5 refresh) may still repopulate auth form — autocomplete attributes not yet applied
- [ ] ShareData.js, ManageAccess.js, SharedWithMe.js, PendingInvites.js — backend routes exist but UI components need end-to-end review
- [ ] Deployment to Railway or Render (not yet done)
- [ ] No password reset / forgot password flow yet
- [ ] Mobile responsive layout not fully tested
- [ ] JWT_SECRET still hardcoded in server.js — must move to .env before going live

## Important Technical Notes for Next Agent
- File URLs: backend GET /api/items/:id/files now rebuilds URL from filename on the fly
  (url: `http://localhost:5000/uploads/${filename}`) — so old DB records with null url still work
- start_date and expiry_date columns added via ALTER TABLE IF NOT EXISTS on server startup
  — existing DB will get them automatically on next backend restart
- Backend must be started from inside the backend/ folder:
    cd C:\Users\pheal\code\MBB1\MBB\backend
    node server.js
  (NOT from the workspace root — .env won't load)
- Last GitHub push: commit d124301 on 26 March 2026

## Next Session Priority Tasks
1. Test file upload + viewing end-to-end (upload image to record, click link, confirm opens)
2. Test Start Date / Expiry Date fields (add record with dates, view detail, edit and save)
3. Fix browser autofill on auth form (add autoComplete="off" / "new-password" to inputs)
4. Review sharing flow end-to-end (invite → accept → view shared data)
5. Deploy to Railway (backend) + Netlify or Railway (frontend)
6. Set production environment variables on Railway (DATABASE_URL, JWT_SECRET, BACKEND_URL, FRONTEND_URL)

## Notes
- .env is in .gitignore — never committed
- The word "postgres" in the password (Cm551977!postgres) is correct — it was 
  appended when the Supabase password was originally set
- Old SQLite database was abandoned — Supabase is the only DB now
- sqlite3 package is still in package.json but not used
- JWT_SECRET is currently hardcoded in server.js as 'change-this-before-production'
  — must be moved to .env before going live
- BACKEND_URL env var is read in server.js for file URLs (defaults to http://localhost:5000)
  — set this to production URL on Railway when deploying
```
