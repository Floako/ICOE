# ICON User Flows & Workflows

## User Journey Diagram

```mermaid
userJourney
    title ICON User Journey - Emergency Info Setup

    section Discovery
      Understand Purpose: 5: user
      Visit App: 5: user

    section Registration
      Create Account: 3: user
      Confirm Email: 4: user

    section Initial Setup
      Choose Category: 5: user
      Add First Item: 4: user
      Enter Details: 3: user

    section Data Population
      Upload Document: 5: user
      Add Multiple Items: 5: user
      Organize Data: 4: user

    section Access
      Share with Family: 3: user
      Invite Recipients: 3: user
      Emergency Sharing: 5: user

    section Review
      Verify Data: 4: user
      Test Access: 5: user
      Plan Updates: 4: user
```

---

## Core User Flows

### Flow 1: New User Registration

```mermaid
flowchart TD
    A["User Visits App"] --> B["Click 'Register'"]
    B --> C["Enter Username"]
    C --> D["Enter Email"]
    D --> E["Enter Password"]
    E --> F["Click Register"]
    F --> G{Username/Email<br/>Unique?}
    G -->|No| H["Show Error"]
    H --> C
    G -->|Yes| I["Create User Account"]
    I --> J["Store Password Hash"]
    J --> K["Redirect to Login"]
    K --> L["Show Success Message"]
    L --> A
```

**Key Steps:**
1. User arrives at app
2. Clicks "Register" toggle
3. Enters username (unique)
4. Enters email (unique)
5. Enters password
6. Backend validates & creates account
7. Redirected to login form
8. User logs in with new credentials

**Error Handling:**
- Duplicate username → "Username already exists"
- Duplicate email → "Email already registered"
- Invalid email format → "Invalid email address"
- Short password → "Password too short"

---

### Flow 2: User Login

```mermaid
flowchart TD
    A["User Arrives at App"] --> B["Sees Login Form"]
    B --> C["Enter Email"]
    C --> D["Enter Password"]
    D --> E["Click Login"]
    E --> F{User Exists?}
    F -->|No| G["Show Error"]
    G --> C
    F -->|Yes| H{Password<br/>Correct?}
    H -->|No| I["Show 'Invalid Credentials'"]
    I --> D
    H -->|Yes| J["Generate JWT Token"]
    J --> K["Store Token in localStorage"]
    K --> L["Redirect to Dashboard"]
    L --> M["Load User Categories"]
```

**Key Steps:**
1. User enters email
2. User enters password
3. Backend verifies credentials against hashed password
4. If correct: Generate JWT token
5. Frontend stores token in localStorage
6. Redirect to Dashboard
7. Dashboard loads user's categories

**Token Storage:**
- Stored in browser localStorage
- Included in all API requests
- Persists across page refreshes
- Cleared on logout

---

### Flow 3: Adding Emergency Information

```mermaid
flowchart TD
    A["User in Dashboard"] --> B["Select Category<br/>e.g., LEGAL"]
    B --> C["Category Loads Items"]
    C --> D["Click 'Add Item'"]
    D --> E["Form Appears"]
    E --> F{Title<br/>Provided?}
    F -->|No| G["Show Error<br/>Title Required"]
    G --> E
    F -->|Yes| H["Enter Description"]
    H --> I["Enter Contact Info<br/>Phone/Email/Address"]
    I --> J["Enter Reference Number<br/>Account/Policy #"]
    J --> K["Click Create Item"]
    K --> L["API: POST /api/categories/:id/items"]
    L --> M["Item Created in Database"]
    M --> N["Display in List"]
    N --> O["User Selects Item"]
    O --> P["Show Item Details"]
```

**Key Steps:**
1. User selects category (auto-creates if needed)
2. Category displays items list
3. User clicks "Add Item"
4. Form appears with fields:
   - Title (required) - e.g., "Smith & Associates Law Firm"
   - Description (optional) - "Our family lawyer"
   - Contact Info (optional) - "Tel: 020-3456-7890"
   - Reference Number (optional) - "LAW001"
5. User submits form
6. Item created in database
7. Item appears in list
8. User can select to view details

**Validation:**
- Title: Required, max 255 chars
- Description: Max 5000 chars
- Contact Info: Max 500 chars
- Reference Number: Max 100 chars

---

### Flow 4: Uploading Documents

```mermaid
flowchart TD
    A["Item Detail View"] --> B["User Sees 'Upload Document'"]
    B --> C["Click Upload Button"]
    C --> D["File Picker Opens"]
    D --> E{File < 10MB?}
    E -->|No| F["Show Error:<br/>File Too Large"]
    F --> C
    E -->|Yes| G{File Type<br/>Allowed?}
    G -->|No| H["Show Error:<br/>Unsupported Type"]
    H --> C
    G -->|Yes| I["Upload Begins"]
    I --> J["Show Progress"]
    J --> K["API: POST /api/items/:id/upload"]
    K --> L["Save to backend/uploads"]
    L --> M["Create File Record"]
    M --> N["Show in File List"]
    N --> O["User Can Download"]
    O --> P["User Can Delete"]
```

**Supported File Types:**
- PDF
- Images: JPEG, PNG, GIF, WEBP
- Office: DOC, DOCX, XLS, XLSX
- Text: TXT, RTF

**File Constraints:**
- Max size: 10MB per file
- No limit on files per item
- Stored with timestamp prefix

**File Operations:**
- Upload: Drag-drop or file picker
- Download: Click link in file list
- Delete: Click X button next to filename

---

### Flow 5: Emergency Access (Phase 1: Manual)

```mermaid
flowchart TD
    A["Emergency - Need Info"] --> B["User Has Password"]
    B --> C["Visit ICON"]
    C --> D["Login with Credentials"]
    D --> E["Navigate to Category"]
    E --> F["View Item Details"]
    F --> G["Download Scans/Files"]
    G --> H["Share with Hospital/<br/>Solicitor/etc"]
    H --> I["End"]
```

**Phase 1 Workflow:**
1. Emergency responder has account login
2. Logs into system
3. Navigates to appropriate category
4. Views and downloads documents
5. Shares via email/print

**Phase 2 Enhancement:**
- Shared access links
- Limited-time codes
- Notifications to recipients

---

### Flow 6: Data Management - Edit & Delete

#### Edit Item

```mermaid
flowchart TD
    A["View Item Detail"] --> B["Click 'Edit'"]
    B --> C["Form Becomes Editable"]
    C --> D["User Modifies Fields"]
    D --> E["Click 'Save'"]
    E --> F["API: PUT /api/items/:id"]
    F --> G["Update Database<br/>Set updated_at"]
    G --> H["Switch to View Mode"]
    H --> I["Show Updated Info"]
```

**Edit Workflow:**
1. User views item details
2. Clicks "Edit" button
3. Form fields become editable
4. User modifies one or more fields
5. Clicks "Save"
6. API updates database
7. Timestamp updated automatically
8. Form switches to view-only
9. New data displayed

#### Delete Item

```mermaid
flowchart TD
    A["View Item Detail"] --> B["Click 'Delete'"]
    B --> C["Confirm Dialog"]
    C --> D{Confirm?}
    D -->|Cancel| E["Dialog Closes"]
    E --> A
    D -->|Confirm| F["API: DELETE /api/items/:id"]
    F --> G["Delete Item Record"]
    G --> H["Delete Associated Files"]
    H --> I["Remove from List"]
    I --> J["Return to Category"]
```

**Delete Workflow:**
1. User clicks "Delete" button
2. Confirmation dialog shown
3. If confirmed:
   - Item deleted from database
   - Associated files deleted
   - Category list updated
   - User returns to empty list

---

### Flow 7: Complete Data Backup

```mermaid
flowchart TD
    A["Phase 1 Manual"] --> B["Download Database File"]
    B --> C["backend/mbb.db"]
    C --> D["Copy to Safe Location"]
    D --> E["Cloud Storage or"]
    E --> F["External Drive"]
    F --> G["Recovery Possible"]
```

**Phase 1 Backup:**
1. Database stored locally at `backend/mbb.db`
2. User manually copies file
3. Store on cloud drive or external drive
4. Can restore by copying back

**Phase 2 Automatic Backup:**
- Daily automatic backups
- Cloud storage integration
- Versioning/recovery points

---

## Category-Specific Workflows

### LEGAL Category Workflow

```
1. Add Solicitor Info
   └─ Name, Address, Phone, Email
   └─ Upload: Will, Power of Attorney, Deeds

2. Add Reference Numbers
   └─ Policy numbers
   └─ Court references

3. Upload Key Documents
   └─ Will scan
   └─ POA documents
   └─ Trust documents
```

### HEALTH Category Workflow

```
1. Add GP Details
   └─ Surgery name, address, phone
   └─ NHS number

2. Add Hospital/Specialist Info
   └─ Hospital name, department
   └─ Consultant name

3. Add Carer Information
   └─ Name, relationship, contact

4. Upload Medical Documents
   └─ Prescriptions
   └─ Test results
   └─ Medical history summary
```

### FINANCE Category Workflow

```
1. Add Bank Account Info
   └─ Bank name, sort code
   └─ Account number (last 4 digits)
   └─ Branch address/phone

2. Add Investment Info
   └─ ISA provider, reference
   └─ Pension provider, reference

3. Add Loan Information
   └─ Lender, account number
   └─ Amount, term

4. Upload Documents
   └─ Bank statements
   └─ Pension statements
   └─ Mortgage details
```

---

## Data Entry Guidelines

### Best Practices

1. **Organization**
   - One item per provider/service
   - Clear, descriptive titles
   - Consistent naming convention

2. **Contact Information**
   - Area codes in parentheses: (020)
   - Include available hours if relevant
   - Multiple contacts (main + backup)

3. **Reference Numbers**
   - Account number
   - Policy number
   - Member/Customer number
   - Unique identifier

4. **Document Uploads**
   - Upload current version
   - Name files descriptively
   - Keep 1-2 most recent versions

5. **Updates**
   - Review annually
   - Update after life changes
   - Upload new documents when available

---

## Exception Handling

### What if user forgets password?

**Phase 1:**
- No recovery mechanism
- Account locked (future: password reset email)

**Phase 2:**
- Email password reset link
- Security questions
- Account recovery options

### What if file upload fails?

1. Show error message
2. Suggest retry
3. Check file size
4. Check internet connection

### What if item has no files?

- Allow item to exist without files
- Text-only entries supported
- Scans optional

---

## Emergency Scenario

### Scenario: Medical Emergency

```
1. Family member needs access
2. Goes to hospital/doctor
3. Provides ICON credentials
4. Hospital staff logs in
5. Navigates to HEALTH category
6. Downloads current medications list
7. Checks medical history document
8. Shares with treating physician
9. Physician has critical info
```

### Scenario: Death/Incapacity

```
1. Solicitor needs to access
2. Uses special access code (Phase 2)
3. Views LEGAL documents
4. Accesses FINANCE information
5. Reviews insurance policies
6. Contacts beneficiaries
```

---

## Phase 2 Enhancements

### User Flows to Add

1. **Invite & Share**
   - Send invitation email
   - Grant temporary/permanent access
   - Revoke access anytime

2. **Emergency Lock**
   - One-click emergency unlock code
   - Send SMS/email to recipients
   - Time-limited access

3. **Audit Trail**
   - Who accessed when
   - What was viewed/downloaded
   - Email notifications

4. **Data Export**
   - Export full backup
   - PDF report generation
   - Email delivery

---

## User Support Scenarios

### New User First Steps

```
1. Register account
2. Create first category (HEALTH)
3. Add GP information
4. Upload GP contact document
5. Add hospital information
6. Test category navigation
7. Explore other categories
8. Schedule full population
```

### Batch Data Entry

```
For gathering all info:
1. Print templates (Phase 2)
2. Fill in by category
3. Scan documents
4. Enter into system
5. Organize by category
6. Review completeness
7. Share access
```

### Ongoing Maintenance

```
Set calendar reminders:
- Q1: Review LEGAL documents
- Q2: Update FINANCE accounts
- Q3: Verify HEALTH contacts
- Q4: Complete data audit
```
