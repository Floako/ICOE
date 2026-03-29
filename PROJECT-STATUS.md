# ICON — Project Status & Continuation Prompt
*Last updated: 29 March 2026 (evening)*

---

## COPY THIS ENTIRE BLOCK TO START A NEW SESSION

```
I am continuing development of ICON (In Case Of Need) — a React + Node.js web app 
that lets users securely store and share emergency information with trusted contacts.

Here is the full project status as of 29 March 2026 (evening):

## What ICON is
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
- GitHub: https://github.com/Floako/ICON.git (master branch)

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
- Connection string: see backend/.env (NOT committed to git)
- Status: WORKING as of 25 March 2026

### Mailtrap (Email sandbox)
- Host: sandbox.smtp.mailtrap.io
- Port: 587
- Credentials: see backend/.env (NOT committed to git)
- Status: VERIFIED WORKING

### GitHub
- Repo: https://github.com/Floako/ICON.git
- Branch: master
- Git user: floako / pauljhealymail@gmail.com
- Credentials cached via Windows Credential Manager
- Last push: 29 March 2026 (evening) — includes media integration (hero video + hero image on Welcome page)

## .env file (backend/.env)
⚠️ NEVER commit real credentials. The .env file is gitignored. Keep actual values local only.

Required variables (set in backend/.env — not in git):
- DATABASE_URL=postgresql://...
- JWT_SECRET=<random secret — change before deploy>
- EMAIL_HOST=smtp.gmail.com
- EMAIL_PORT=587
- EMAIL_SECURE=false
- EMAIL_USER=<gmail address>
- EMAIL_PASSWORD=<gmail app password>
- EMAIL_FROM=ICON <<gmail address>>
- FRONTEND_URL=http://localhost:3000
# Note: Gmail App Password is used (not normal Gmail password). Label: ICON

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
- Welcome landing page with ICON branding and feature cards
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
- File viewing: files served via authenticated backend route GET /uploads/:filename (requires JWT)
- Start Date + Expiry/Renewal Date fields on Add Record form and Item Detail view/edit
- Auth form clears on logout, mode switch, and mount (prevents stale data showing)
- Logout resets URL params and auth mode
- Auth form autocomplete attributes set (autoComplete="off" on form, proper values on fields)
- JWT_SECRET moved to backend/.env (no longer hardcoded in server.js)
- Email switched from Mailtrap sandbox to Gmail (App Password, label: ICON)
- ManageAccess.js state update filter bugs fixed (revoke/cancel item removal now type-safe)
- Sidebar moved to far left edge (removed max-width centering from .dashboard-container)
- **Security hardening (28 Mar):**
  - helmet() added for HTTP security headers
  - express-rate-limit: 20 req/15min on all auth endpoints
  - CORS locked to localhost regex + FRONTEND_URL env var (allows localhost and 127.0.0.1 on any port)
  - /uploads now requires JWT authentication (removed public express.static)
  - bcrypt.hash() used async in register and reset-password (was blocking hashSync)
  - JWT_SECRET crashes server if missing (no unsafe fallback)
  - db.query wrapper catches raw Postgres errors, logs server-side only, throws generic 'Database error'
- **Password reset flow (28 Mar):** Forgot password email + secure token reset fully implemented
  - POST /api/auth/forgot-password — sends reset email via Gmail, stores token in password_resets table
  - POST /api/auth/reset-password — validates token, updates password_hash, marks token used
  - Auth.js has forgot/reset views wired up; reset link navigates via ?mode=reset&token=...
  - Fixed bug: reset was updating wrong column name (password → password_hash)
- **Media integration (29 Mar):** AI-generated video and image added to Welcome page
  - Entry screen: fullscreen looping video background (hero-video.mp4) with dark overlay
  - Video skips first 2 seconds (AI artefacts) using useRef + onLoadedMetadata/onEnded seek to VIDEO_START=2
  - Main welcome page: hero image card (hero-image.png — "Safe. Secure. Digital.") above feature cards
  - Media files in frontend/public/media/ (served as static assets)

## Known Issues / Pending Work
- [ ] File viewing: backend must be running for authenticated /uploads route to work (expected for local dev)
- [ ] Browser autofill (F5 refresh) may still repopulate auth form visually despite autoComplete — browsers can override this
- [ ] ShareData.js, ManageAccess.js, SharedWithMe.js, PendingInvites.js — backend routes reviewed and correct; end-to-end test still needed with two live accounts
- [ ] Deployment to Railway or Render (not yet done)
- [ ] Mobile responsive layout not fully tested
- [ ] Invitation flow uses email-based lookup (no cryptographic token in link) — acceptable for now, address before public launch
- [ ] `sqlite3` package still in package.json but not used — can be removed
- [ ] Save Entry (POST /api/categories/:id/items) occasionally times out — Supabase connection pool issue, not yet resolved

## Important Technical Notes for Next Agent
- File URLs: backend GET /api/items/:id/files rebuilds the URL from filename. The /uploads/:filename
  route now requires a valid JWT. Frontend must send Authorization header to view files.
- start_date and expiry_date columns added via ALTER TABLE IF NOT EXISTS on server startup
  — existing DB will get them automatically on next backend restart
- password_resets table is auto-created on startup alongside other tables
- Backend must be started from inside the backend/ folder:
    cd C:\Users\pheal\code\MBB1\MBB\backend
    node server.js
  (NOT from the workspace root — .env won't load)
- CORS allows any localhost/127.0.0.1 origin on any port (regex) + production FRONTEND_URL env var
- new packages installed: helmet, express-rate-limit (both in backend/package.json)
- Last GitHub push: 29 March 2026 (evening)

## Next Session Priority Tasks
1. Test password reset end-to-end: request reset email → click link → set new password → log in
2. Test file upload + viewing end-to-end (upload image to record, click link, confirm opens in new tab)
3. Test Start Date / Expiry Date fields (add record with dates, view detail, edit and save)
4. Test sharing flow end-to-end with two accounts (invite → register → view shared data)
5. Deploy to Railway (backend) + Netlify or Railway (frontend)
6. Set production environment variables on Railway (DATABASE_URL, JWT_SECRET, BACKEND_URL, FRONTEND_URL, EMAIL_*)
7. Investigate and fix Save Entry timeout (POST /api/categories/:id/items hangs >10s occasionally)

## Notes
- .env is in .gitignore — never committed
- The Supabase DB password has the word "postgres" appended — this is correct (see .env)
  appended when the Supabase password was originally set
- Old SQLite database was abandoned — Supabase is the only DB now
- sqlite3 package is still in package.json but not used
- JWT_SECRET is in backend/.env — server.js reads it via process.env.JWT_SECRET
- BACKEND_URL env var is read in server.js for file URLs (defaults to http://localhost:5000)
  — set this to production URL on Railway when deploying
- Email is now configured for Gmail with App Password (label: ICON)
  — Mailtrap sandbox credentials are no longer active in .env
- `shared_access` in the docs/PROJECT-STATUS refers to the `permissions` table in server.js
  — this is just a naming discrepancy between docs and code (same concept)
- Invitation flow: no cryptographic token in the link, just the email as a query param.
  The backend auto-accepts the invitation when the invited email registers.
- Password reset tokens are stored in the password_resets table (auto-created). Tokens expire in 1 hour.
  Reset link format: http://localhost:3000/?mode=reset&token=<hex_token>
- CORS: browser may send 127.0.0.1 instead of localhost — fixed with regex matching both
- /uploads is protected: file links from frontend must include Authorization: Bearer <token> header
```
