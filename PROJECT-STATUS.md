# ICON — Project Status & Continuation Prompt
*Last updated: 29 March 2026 (late evening)*

---

## COPY THIS ENTIRE BLOCK TO START A NEW SESSION

```
I am continuing development of ICON (In Case Of Need) — a React + Node.js web app 
that lets users securely store and share emergency information with trusted contacts.

Here is the full project status as of 29 March 2026 (late evening):

## ⚠️ CURRENT BLOCKER — READ FIRST
The Supabase connection pooler (Supavisor) circuit breaker is open due to repeated 
failed connection attempts during a DB password rotation earlier today. 

- The DB itself is HEALTHY (confirmed via Supabase SQL Editor)
- The password in backend/.env is correct
- The circuit breaker resets automatically — just needs time with NO connection attempts
- Do NOT restart the backend repeatedly — each failed attempt extends the cooldown
- When you return after 24 hours, simply run `node server.js` ONCE and it should connect

If it still fails after 24 hours, go to Supabase dashboard → Database → Reset database 
password → set ONE new password → update backend/.env DATABASE_URL → try once.

## What ICON is
A personal emergency information vault. Users store critical records (legal, health, 
finance, insurance, etc.) and can share access with family/trusted contacts via email 
invitation. Think of it as a private digital black box for your life.

## Tech Stack
- Frontend: React (Create React App), plain CSS, port 3000
- Backend: Node.js + Express, port 5000
- Database: PostgreSQL via Supabase (cloud)
- Auth: JWT + bcryptjs
- Email: Nodemailer + Gmail (App Password)
- File uploads: Multer
- GitHub: https://github.com/Floako/ICOE.git (ui-redesign branch — active)

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
- Connection: transaction pooler, port 6543 (NOT 5432 — direct host not available for this region)
- Connection string: see backend/.env (NOT committed to git)
- Status: DB healthy, pooler circuit breaker open (see blocker note at top)
- Password was rotated 29 March 2026 — value is in backend/.env

### Email (Gmail)
- Provider: Gmail + App Password
- Credentials: see backend/.env (NOT committed to git)
- App password label: ICOE (Gmail account label — do not rename)
- Status: Working (app password rotated 29 March 2026)

### Git
- Active branch: ui-redesign (last commit: a99f402)
- master branch: e1d7d4f (stable baseline)
- Latest push: 29 March 2026 — "feat: rename ICOE->ICON in UI, add media videos, update docs"
- Git user: floako / pauljhealymail@gmail.com
- Credentials cached via Windows Credential Manager

## Workspace
C:\Users\pheal\code\MBB1\MBB\
  backend/
    server.js       — Express API, fully migrated to PostgreSQL (pg package)
    package.json
    .env            — secrets (not in git)
    uploads/        — file upload storage
  frontend/
    public/
      media/        — hero-video.mp4, about-video.mp4, friends-share.mp4, hero-image.png
    src/
      App.js        — root, controls Welcome/Auth/Dashboard routing
      index.css     — global design tokens and resets
      components/
        Welcome.js / Welcome.css   — landing page (dark theme, red accent)
        About.js / About.css       — about page with video hero
        Auth.js / Auth.css         — login/register (dark glass card)
        Dashboard.js / Dashboard.css — main app shell
        CategoryList.js / CategoryList.css — record list + add form
        ItemDetail.js / ItemDetail.css     — record detail view
        ShareData.js, ManageAccess.js, SharedWithMe.js, PendingInvites.js
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
- **ICON rename (29 Mar):** All user-visible UI text changed from ICOE to ICON
  - Backend code, email config, .env keys, and docs deliberately left as ICOE (email account names etc.)
  - Files updated: Welcome.js, About.js, Auth.js, Dashboard.js, Icons.js, index.html
- **Media integration (29 Mar):** Videos added to Welcome and About pages
  - Entry screen: fullscreen looping hero-video.mp4 background (skips first 2s via useRef seek)
  - Welcome page (after Enter): friends-share.mp4 inline autoplay card (replaced static hero-image.png)
  - About page: about-video.mp4 fullscreen hero with overlay
  - All media in frontend/public/media/ — hero-video.mp4, about-video.mp4, friends-share.mp4, hero-image.png

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
1. **FIRST: Test backend connection** — run `node server.js` once from backend/ folder
   - Should print: "Connected to PostgreSQL and tables ready" then "Server running on http://localhost:5000"
   - If still "Circuit breaker open": go to Supabase → Database → Reset password → update .env → try once
   - Do NOT run it repeatedly if it fails — wait and try again
2. Start frontend: cd frontend → npm start → open http://localhost:3000
3. Test full login flow once backend is up
4. Test password reset end-to-end (forgot password → email link → new password → login)
5. Test file upload + viewing (upload image to record, confirm it opens)
6. Test sharing flow end-to-end with two accounts
7. Deploy to Railway (backend) + Netlify or Railway (frontend)
8. UI redesign — further visual improvements on ui-redesign branch

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
