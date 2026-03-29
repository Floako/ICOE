# ICON Data Sharing System - Testing Guide

## Overview
The sharing system allows ICON users to nominate trusted contacts to view their emergency information. Viewers get full read-only access to all shared owner's data.

## Features Implemented

### Backend Endpoints (Node.js/Express)
1. **GET /api/users** - Search for users by email/username
2. **POST /api/share** - Owner grants access to viewer
3. **DELETE /api/share/:viewerId** - Owner revokes access
4. **GET /api/my-sharers** - Owner sees who has access
5. **GET /api/shared-with-me** - Viewer sees all shared data
6. **GET /api/shared/:ownerId/categories/:categoryId/items** - Viewer gets items from shared category

### Frontend Components

#### 1. ShareData Component
- **Location:** `frontend/src/components/ShareData.js`
- **Tab:** "Share Data"
- **Features:**
  - Search users by username or email
  - Grant access with one click
  - Success/error messages
  - Real-time user search

#### 2. ManageAccess Component
- **Location:** `frontend/src/components/ManageAccess.js`
- **Tab:** "Manage Access"
- **Features:**
  - See all viewers who can access your data
  - View when access was granted
  - Revoke access with confirmation
  - Update in real-time

#### 3. SharedWithMe Component
- **Location:** `frontend/src/components/SharedWithMe.js`
- **Tab:** "Shared With Me"
- **Features:**
  - Expandable list of owners who shared with you
  - View all categories and items from each owner
  - Organized by owner and category
  - Read-only view (no editing)

### Dashboard Updates
- Added 4 tabs: My Data, Share Data, Manage Access, Shared With Me
- Tab switching preserves state
- Responsive tab interface

## Testing Scenarios

### Scenario 1: Basic Sharing
1. **User A:** Register/login to ICON
2. **User A:** Create categories (Legal, Health, Finance, etc.)
3. **User A:** Add items to categories with details and files
4. **User A:** Go to "Share Data" tab
5. **User A:** Search for "User B"
6. **User A:** Click "Grant Access"
7. **Verify:** Success message appears
8. **Verify (User A):** Go to "Manage Access" → User B is listed

### Scenario 2: Viewing Shared Data
1. **User B:** Login to ICON
2. **User B:** Go to "Shared With Me" tab
3. **Verify:** User A appears in the list
4. **User B:** Click "+" to expand User A
5. **Verify:** All categories from User A appear
6. **User B:** Can see all items, contact info, and references
7. **Verify:** User B **cannot** edit, delete, or modify any data

### Scenario 3: Revoking Access
1. **User A:** Go to "Manage Access" tab
2. **User A:** See User B in the list
3. **User A:** Click "Revoke" button
4. **User A:** Confirm revocation
5. **Verify:** User B disappears from list
6. **Verify (User B):** Refresh "Shared With Me" → User A is gone

### Scenario 4: Multiple Viewers
1. **User A:** Grant access to User B, User C, User D
2. **Verify (User A):** "Manage Access" shows all three
3. **User A:** Revoke access from User B only
4. **Verify (User A):** User C and D still have access
5. **Verify (User B):** User A no longer appears
6. **Verify (User C & D):** User A still visible

### Scenario 5: File Access
1. **User A:** Upload files to an item
2. **User A:** Grant access to User B
3. **User B:** Go to "Shared With Me"
4. **User B:** Expand shared item
5. **Verify:** Files are visible (if you later implement file viewing in shared view)

## Database Verification

### Check permissions table:
```sql
SELECT * FROM permissions;
```
Should show entries like:
- owner_id: 1, viewer_id: 2, access_level: 'view', created_at: [timestamp]

### Check users table:
```sql
SELECT id, username, email FROM users;
```

## Potential Issues & Solutions

### Issue 1: Search not finding users
- **Cause:** User hasn't registered yet
- **Solution:** Verify user exists in database, exact username/email match

### Issue 2: Can't revoke access
- **Cause:** Database constraints or permissions not found
- **Solution:** Check if permission exists in database

### Issue 3: Shared data not loading
- **Cause:** Frontend API call fails silently
- **Solution:** Check browser console for errors, verify token is valid

### Issue 4: File uploads not visible in shared view
- **Note:** File viewing in shared view requires additional frontend implementation

## Known Limitations

1. **Single directory structure:** Files aren't restricted to viewer's scope (they see references only)
2. **No notification system:** Viewers don't get notified when access is granted
3. **No audit log:** No record of who accessed what and when
4. **No partial sharing:** Owner shares all data, not selective categories
5. **No expiration:** Once granted, access stays until manually revoked

## Performance Notes

- Shared data loads categories dynamically when expanded
- Each category's items loaded on-demand (not all at once)
- Search debounced for large user lists

## Next Steps for Enhancement

1. Add notifications when someone shares data with you
2. Add selective category sharing (share only specific categories)
3. Add access expiration dates
4. Add audit logging for data access
5. Add file download permissions for viewers
6. Add comments/notes between owner and viewer
7. Add emergency contact designation (priority viewer)

## Testing Checklist

- [ ] User can search for other users
- [ ] User can grant access to another user
- [ ] Shared user appears in "Manage Access"
- [ ] Viewer sees shared data in "Shared With Me"
- [ ] Viewer cannot edit shared data
- [ ] Viewer cannot delete shared data
- [ ] Owner can revoke access
- [ ] Multiple viewers can have simultaneous access
- [ ] Revoking from one doesn't affect others
- [ ] Items and categories display correctly in shared view
- [ ] File references visible in shared items
- [ ] Error handling for network failures
- [ ] Tab switching is smooth and responsive
