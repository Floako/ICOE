# ICON Documentation Index

Complete documentation for the ICON (In Case Of Need) project. Start here to find what you need.

## Quick Navigation

```
START HERE
├─ README_SETUP.md (5 min read)
│  └─ Quick start for running the app
│
UNDERSTAND THE SYSTEM
├─ 01-ARCHITECTURE.md (10 min read)
│  └─ How the system works, technology stack, data flow
├─ 02-DATA-MODELS.md (15 min read)
│  └─ Database schema, tables, relationships, ER diagram
│
BUILDING FEATURES
├─ 03-API-REFERENCE.md (20 min read)
│  └─ All endpoints, requests, responses
├─ 04-COMPONENTS.md (15 min read)
│  └─ React components, props, state
│
USING THE APP
├─ 05-USER-FLOWS.md (20 min read)
│  └─ How users interact, workflows, scenarios
│
DEVELOPING
├─ 06-BACKEND-IMPLEMENTATION.md (20 min read)
│  └─ Server code, routes, middleware, security
├─ 07-DEVELOPER-GUIDE.md (15 min read)
│  └─ How to make changes, debug, test
```

---

## Documentation by Role

### Project Manager

1. Start: [PROJECT_OVERVIEW.md](../PROJECT_OVERVIEW.md)
2. Read: [05-USER-FLOWS.md](05-USER-FLOWS.md) - Understand user needs
3. Read: [README_SETUP.md](../README_SETUP.md) - Learn how to demo

### Designer / UX

1. Read: [05-USER-FLOWS.md](05-USER-FLOWS.md) - User journeys and scenarios
2. Read: [04-COMPONENTS.md](04-COMPONENTS.md) - Component layout and structure
3. Reference: [03-API-REFERENCE.md](03-API-REFERENCE.md) - Data returned from API

### Frontend Developer

1. Start: [README_SETUP.md](../README_SETUP.md) - Get it running
2. Read: [04-COMPONENTS.md](04-COMPONENTS.md) - Component architecture
3. Read: [03-API-REFERENCE.md](03-API-REFERENCE.md) - API endpoints
4. Reference: [07-DEVELOPER-GUIDE.md](07-DEVELOPER-GUIDE.md) - Development tasks

### Backend Developer

1. Start: [README_SETUP.md](../README_SETUP.md) - Get it running
2. Read: [01-ARCHITECTURE.md](01-ARCHITECTURE.md) - System design
3. Read: [02-DATA-MODELS.md](02-DATA-MODELS.md) - Database schema
4. Read: [06-BACKEND-IMPLEMENTATION.md](06-BACKEND-IMPLEMENTATION.md) - Code details
5. Reference: [03-API-REFERENCE.md](03-API-REFERENCE.md) - Endpoint specs
6. Reference: [07-DEVELOPER-GUIDE.md](07-DEVELOPER-GUIDE.md) - Debugging/testing

### DevOps / Infrastructure

1. Read: [01-ARCHITECTURE.md](01-ARCHITECTURE.md) - System architecture
2. Read: [06-BACKEND-IMPLEMENTATION.md](06-BACKEND-IMPLEMENTATION.md) - Security, deployment
3. Read: [02-DATA-MODELS.md](02-DATA-MODELS.md) - Database considerations

### Tester

1. Start: [README_SETUP.md](../README_SETUP.md) - Get it running
2. Read: [05-USER-FLOWS.md](05-USER-FLOWS.md) - Expected workflows
3. Reference: [07-DEVELOPER-GUIDE.md](07-DEVELOPER-GUIDE.md) - Testing checklist

---

## Key Documents at a Glance

### High-Level Overview
- **PROJECT_OVERVIEW.md** - Project vision and features (3 min)
- **README_SETUP.md** - How to run the application (5 min)

### Architecture & Design
- **01-ARCHITECTURE.md** - System design, tech stack, data flow
  - Technology choices
  - 3-tier architecture diagram
  - Authentication flow
  - Scalability path
  
- **02-DATA-MODELS.md** - Database design
  - ER diagram with all tables
  - Schema definitions
  - Relationships and constraints
  - Sample queries

### Implementation & APIs
- **03-API-REFERENCE.md** - Complete API documentation
  - All 12 endpoints documented
  - Request/response examples
  - Error handling
  - Testing instructions

- **04-COMPONENTS.md** - React component documentation
  - 5 core components explained
  - Props, state, methods
  - Data flow through components
  - Styling approach

- **06-BACKEND-IMPLEMENTATION.md** - Backend code details
  - Route organization
  - Middleware explained
  - Security practices
  - Error handling patterns

### User Experience
- **05-USER-FLOWS.md** - User workflows and scenarios
  - User journey map
  - Step-by-step flows
  - Category-specific workflows
  - Emergency scenarios

### Development
- **07-DEVELOPER-GUIDE.md** - How to develop and maintain
  - Project structure
  - Common development tasks
  - Debugging techniques
  - Testing strategies
  - Deployment checklist

---

## Common Questions & Where to Find Answers

### "How do I run this app?"
→ [README_SETUP.md](../README_SETUP.md)

### "How does authentication work?"
→ [01-ARCHITECTURE.md](01-ARCHITECTURE.md) - Authentication Flow section
→ [06-BACKEND-IMPLEMENTATION.md](06-BACKEND-IMPLEMENTATION.md) - Auth Routes section

### "What's in the database?"
→ [02-DATA-MODELS.md](02-DATA-MODELS.md) - Database Schema section

### "How do I add a new API endpoint?"
→ [03-API-REFERENCE.md](03-API-REFERENCE.md) - Understand existing patterns
→ [06-BACKEND-IMPLEMENTATION.md](06-BACKEND-IMPLEMENTATION.md) - Route examples
→ [07-DEVELOPER-GUIDE.md](07-DEVELOPER-GUIDE.md) - Development workflow

### "How do I modify/add a React component?"
→ [04-COMPONENTS.md](04-COMPONENTS.md) - Component reference
→ [07-DEVELOPER-GUIDE.md](07-DEVELOPER-GUIDE.md) - Development workflow

### "What are the user workflows?"
→ [05-USER-FLOWS.md](05-USER-FLOWS.md) - Complete flows with diagrams

### "How do I debug an issue?"
→ [07-DEVELOPER-GUIDE.md](07-DEVELOPER-GUIDE.md) - Debugging Tips section

### "How do I set up email for invitations?"
→ [EMAIL-SETUP.md](EMAIL-SETUP.md) - Complete email configuration guide
→ [INVITATION-SYSTEM-GUIDE.md](INVITATION-SYSTEM-GUIDE.md) - How invitations work

### "How do I deploy this?"
→ [06-BACKEND-IMPLEMENTATION.md](06-BACKEND-IMPLEMENTATION.md) - Deployment Checklist
→ [01-ARCHITECTURE.md](01-ARCHITECTURE.md) - Deployment Architecture section

### "What are the security concerns?"
→ [06-BACKEND-IMPLEMENTATION.md](06-BACKEND-IMPLEMENTATION.md) - Security Best Practices

### "How does the file upload work?"
→ [03-API-REFERENCE.md](03-API-REFERENCE.md) - File upload endpoints
→ [06-BACKEND-IMPLEMENTATION.md](06-BACKEND-IMPLEMENTATION.md) - File Upload Routes

---

## Roadmap Reference

### Phase 1 (Current)
✓ Authentication
✓ 6 Categories
✓ CRUD operations
✓ File uploads
✓ Local storage
✓ Data sharing system
✓ Invitation system
✓ Email notifications

### Phase 2 (Plan)
- [ ] Cloud storage
- [ ] Data export
- [ ] Advanced filtering

### Phase 3 (Vision)
- [ ] Mobile apps
- [ ] Advanced search
- [ ] Audit logging
- [ ] Data encryption
- [ ] Multi-device sync

---

## File Locations

All documentation is in the `/docs/` folder:

```
docs/
├── 01-ARCHITECTURE.md             (System design)
├── 02-DATA-MODELS.md              (Database) 
├── 03-API-REFERENCE.md            (API endpoints)
├── 04-COMPONENTS.md               (React components)
├── 05-USER-FLOWS.md               (User workflows)
├── 06-BACKEND-IMPLEMENTATION.md   (Server code)
├── 07-DEVELOPER-GUIDE.md          (Dev tasks)
├── 08-DOCUMENTATION-INDEX.md      (This file)
├── EMAIL-SETUP.md                 (Email configuration)
├── SHARING-SYSTEM-GUIDE.md        (Data sharing feature)
├── INVITATION-SYSTEM-GUIDE.md     (Invitation system)
└── README.md                       (General info)
```

---

## How to Update Documentation

When making changes to the codebase:

1. **New endpoint?** → Update [03-API-REFERENCE.md](03-API-REFERENCE.md)
2. **New component?** → Update [04-COMPONENTS.md](04-COMPONENTS.md)
3. **Database schema change?** → Update [02-DATA-MODELS.md](02-DATA-MODELS.md)
4. **New user flow?** → Update [05-USER-FLOWS.md](05-USER-FLOWS.md)
5. **Security change?** → Update [06-BACKEND-IMPLEMENTATION.md](06-BACKEND-IMPLEMENTATION.md)

---

## Documentation Standards

### Format
- Markdown (.md) files
- Mermaid diagrams where helpful
- Code examples in relevant sections
- Clear headers and navigation

### Content
- Written for developers (technical audience)
- Include "why" not just "what"
- Provide examples and use cases
- Link between related docs

### Maintenance
- Keep in sync with code changes
- Update version info regularly
- Remove outdated information
- Link checker (broken links)

---

## Quick Reference Sheets

### API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/register` | Create user |
| POST | `/api/auth/login` | Authenticate |
| GET | `/api/categories` | List categories |
| POST | `/api/categories` | Create category |
| GET | `/api/categories/:id/items` | List items |
| POST | `/api/categories/:id/items` | Create item |
| PUT | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |
| POST | `/api/items/:id/upload` | Upload file |
| GET | `/api/items/:id/files` | List files |
| DELETE | `/api/files/:id` | Delete file |

Full details → [03-API-REFERENCE.md](03-API-REFERENCE.md)

### Component Hierarchy

```
App
├── Auth
└── Dashboard
    ├── CategoryList
    └── ItemDetail
```

Full details → [04-COMPONENTS.md](04-COMPONENTS.md)

### Database Tables

| Table | Purpose |
|-------|---------|
| users | User accounts |
| categories | Data categories (LEGAL, HEALTH, etc.) |
| items | Items within categories |
| files | Uploaded documents |
| permissions | User access control |

Full details → [02-DATA-MODELS.md](02-DATA-MODELS.md)

---

## Getting Help

### For Setup Issues
→ [README_SETUP.md](../README_SETUP.md) - Troubleshooting section

### For Code Issues
→ [07-DEVELOPER-GUIDE.md](07-DEVELOPER-GUIDE.md) - Debugging section

### For Architecture Questions
→ [01-ARCHITECTURE.md](01-ARCHITECTURE.md) - System Overview

### For Database Questions
→ [02-DATA-MODELS.md](02-DATA-MODELS.md) - Schema and relationships

---

**Last Updated:** March 25, 2026
**Status:** Active Development - Phase 1
**Maintainer:** Development Team
