# ICOE Invitation System - Testing Guide

## Overview
Extended the sharing system with email-based invitations for non-registered users. When you invite someone who doesn't have an account, they automatically get access once they register.

## New Features

### Backend Enhancements
1. **Invitations Table** - Tracks pending invites with 48-hour expiration
2. **Auto-Accept on Registration** - When invitee registers, permissions auto-activate
3. **Combined Access Endpoint** - `/api/my-access-list` shows both active users and pending invites
4. **Invitation Management**: 
   - `POST /api/invite` - Send invite to email
   - `GET /api/my-invitations` - See pending invites
   - `DELETE /api/invitation/:id` - Cancel invite

### Frontend Components

#### ShareData (Updated)
- Detect when search is an email not yet registered
- Show "Send Invite" button for unrecognized emails
- Distinguished between registered users and invited users in search results

#### ManageAccess (Enhanced)
- Now shows **both** active sharers and pending invites
- Color-coded: Green for active, Yellow for pending
- Shows expiration time for pending invites
- Can revoke active access or cancel pending invites

#### PendingInvites (New)
- Dedicated tab to see all invitations sent
- Shows countdown timer (hours/minutes remaining)
- Status badges for pending vs accepted
- Can cancel unaccepted invitations

#### Dashboard (Updated)
- Added "Pending Invites" tab
- Better organization of sharing workflows

## Testing Flow

### Scenario 1: Invite Non-Registered User

**User A:**
1. Go to "Share Data" tab
2. Search for: `charlie@example.com` (doesn't exist yet)
3. See "No registered users found"
4. See "Send Invite to charlie@example.com" button
5. Click button
6. Success: "Invitation sent! They will have access when they register."

**Verify (User A):**
1. Go to "Manage Access" tab
2. See "charlie@example.com" with status "Invitation Pending"
3. See expiration date (48 hours from now)
4. Go to "Pending Invites" tab
5. See same entry with countdown timer

**Charlie (New User):**
1. Go to register page
2. Enter email: `charlie@example.com`
3. Create username and password
4. Click Register
5. Success: Account created
6. Login automatically

**Verify (Charlie):**
1. Go to "Shared With Me" tab
2. Alice's data is immediately visible
3. Can see all Alice's categories and items
4. Cannot edit or delete anything

**Verify (User A):**
1. Go to "Manage Access"
2. Charlie still appears BUT status may show "Accepted" after refresh
3. Can still revoke if desired

---

### Scenario 2: Cancel Pending Invitation

**User A:**
1. Go to "Manage Access" or "Pending Invites"
2. Find pending invite to `david@example.com`
3. Click "Cancel" button
4. Confirm dialog
5. Invite disappears

**Verify:**
- If David registers later, he won't get access
- Invite fully removed from database

---

### Scenario 3: Multiple Pending Invites

**User A:**
1. Send 3 invitations:
   - `emily@example.com`
   - `frank@example.com`
   - `grace@example.com`

2. Go to "Pending Invites"
3. See all 3 with countdown timers

4. Invite Emily and register her
5. Invite Frank and register him
6. Let Grace's invite expire (test later)

**Verify:**
- Emily and Frank get immediate access when they register
- Grace won't see shared data if she registers after 48 hours

---

### Scenario 4: Mixed Active & Invited List

**User A:**
1. Grant direct access to Bob (who's already registered)
2. Send invite to Helen (not registered)
3. Go to "Manage Access"

**Verify:**
- Bob appears with green "Active Access" badge
- Helen appears with yellow "Invitation Pending" badge  
- Both show different removal buttons
- "Revoke" for active, "Cancel" for pending

---

### Scenario 5: Expired Invitations

**Setup:**
1. Send invite to `iris@example.com`
2. Note: Will expire in 48 hours
3. (Skip real-time testing - just verify code handles expiration)

**Database Check:**
```sql
SELECT * FROM invitations WHERE status = 'pending' AND expires_at < CURRENT_TIMESTAMP;
```
Should show no results (expired ones auto-filtered)

---

## Database Schema Changes

### New Invitations Table
```sql
CREATE TABLE invitations (
  id INTEGER PRIMARY KEY,
  owner_id INTEGER - who sent invite
  invited_email TEXT - recipient's email
  status TEXT - 'pending' or 'accepted'
  created_at DATETIME - when sent
  expires_at DATETIME - 48 hours from creation
  accepted_at DATETIME - when they registered
)
```

### Updated Registration Flow
- Check for pending invitations with `invited_email`
- Auto-create permissions for all valid pending invites
- Mark invitations as 'accepted'

---

## Key Differences from Basic Sharing

| Feature | Direct Share | Invitation |
|---------|-------------|------------|
| User Status | Must be registered | Can be unregistered |
| Access Timing | Immediate | After registration |
| Cancel Option | Revoke anytime | Cancel before registration |
| Owner Wait | None | One-time setup, auto-accept after |
| Expiration | None | 48 hours |

---

## Testing Checklist

### Invitations
- [ ] Can search for and invite unregistered email
- [ ] Invite confirmation message appears
- [ ] Cannot invite already-registered email (error message)
- [ ] Invitation appears in "Manage Access" as pending
- [ ] Invitation appears in "Pending Invites" with countdown
- [ ] Invitee auto-gets access upon registration
- [ ] Can cancel invitation before registration
- [ ] After cancellation, invitee won't get access if they register later
- [ ] Expired invitations don't grant access

### Mixed Access
- [ ] "Manage Access" shows both active users and pending invites
- [ ] Different badges and buttons for each type
- [ ] Can revoke active users
- [ ] Can cancel pending invites
- [ ] Both actions work correctly

### UI/UX
- [ ] "Share Data" tab clearly indicates user status
- [ ] "Pending Invites" tab shows countdown timers
- [ ] Error messages clear when trying invalid actions
- [ ] Tab switching is responsive
- [ ] All components auto-refresh after actions

### Edge Cases
- [ ] Re-inviting same email (should update, not duplicate)
- [ ] Inviting self email (should error)
- [ ] Inviting registered user via email vs username (should be same person)
- [ ] Multiple concurrent invitations to different users

---

## Known Limitations

1. **No Email Sending**: Invites don't send actual emails (would need SMTP config)
   - For testing, share the app URL manually
   - In production: use SendGrid/AWS SES

2. **48-Hour Hard Expiration**: Not configurable yet
   - Would need admin settings

3. **No Invite Code**: Just based on email
   - Could add secure tokens in future

4. **Single User Per Email**: Can't invite distribution list
   - Design choice for simplicity

---

## Troubleshooting

### Issue: Invite sent but user not found on registration
**Cause**: Email case mismatch  
**Fix**: Database should use case-insensitive email comparison (already implemented with UNIQUE constraints)

### Issue: User registered but doesn't see shared data
**Cause**: Invitation expired OR email doesn't match  
**Fix**: Check invite expiration, verify email exactness

### Issue: "Send Invite" button doesn't appear for email
**Cause**: That email is already registered in system  
**Fix**: Use "Grant Access" button instead in search results

---

## Future Enhancements

1. **Email Notifications** - Actually send invite emails
2. **Resend Invite** - Extend/resend expiring invites
3. **Custom Expiration** - Set different timeouts
4. **Invite Tokens** - Secure acceptance links
5. **Bulk Invitations** - Invite multiple at once
6. **Invite Notes** - Add custom message to invitee
7. **Accept/Decline** - Let invitee explicitly accept
8. **Partial Access** - Invite to specific categories only
