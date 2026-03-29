# ICON API Reference

## Base URL
```
http://localhost:5000
```

## Authentication

All requests (except `/auth/*`) require an `Authorization` header with a valid JWT token:

```
Authorization: Bearer <token>
```

### Token Format
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwi...
```

### Token Expiration
- **Expires in**: 24 hours
- **On expiration**: Re-login required

---

## Endpoints

### Authentication

#### Register User
Create a new user account.

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered",
  "id": 1
}
```

**Errors:**
- `400` - Missing fields or username/email already exists
- `500` - Server error

---

#### Login
Authenticate and receive JWT token.

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "username": "john_doe"
  }
}
```

**Errors:**
- `401` - Invalid email or password
- `500` - Server error

---

### Categories

#### Get All Categories
Retrieve all categories for logged-in user.

**Request:**
```http
GET /api/categories
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "category_name": "LEGAL",
    "created_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "user_id": 1,
    "category_name": "HEALTH",
    "created_at": "2024-01-15T10:35:00Z"
  }
]
```

**Errors:**
- `401` - No token or invalid token
- `500` - Server error

---

#### Create Category
Create a new category.

**Request:**
```http
POST /api/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "category_name": "LEGAL"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "user_id": 1,
  "category_name": "LEGAL"
}
```

**Valid Categories:**
- LEGAL
- HEALTH
- FINANCE
- SERVICES
- INSURANCE
- MEMBERSHIPS

**Errors:**
- `400` - Missing category_name
- `401` - No token
- `500` - Server error

---

### Items

#### Get Items in Category
Retrieve all items in a specific category.

**Request:**
```http
GET /api/categories/:categoryId/items
Authorization: Bearer <token>
```

**Example:**
```
GET /api/categories/1/items
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "category_id": 1,
    "user_id": 1,
    "title": "Smith & Associates Law Firm",
    "description": "Our family lawyer",
    "contact_info": "Tel: 020-3456-7890, Email: info@smith.co.uk",
    "reference_number": "",
    "created_at": "2024-01-15T10:45:00Z",
    "updated_at": "2024-01-15T10:45:00Z"
  }
]
```

**Errors:**
- `401` - No token
- `404` - Category not found
- `500` - Server error

---

#### Create Item
Add a new item to a category.

**Request:**
```http
POST /api/categories/:categoryId/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Smith & Associates Law Firm",
  "description": "Our family lawyer",
  "contact_info": "Tel: 020-3456-7890",
  "reference_number": "LAW001"
}
```

**Response (201 Created):**
```json
{
  "id": 1
}
```

**Field Requirements:**
- `title` (required) - Max 255 chars
- `description` (optional) - Max 5000 chars
- `contact_info` (optional) - Max 500 chars
- `reference_number` (optional) - Max 100 chars

**Errors:**
- `400` - Missing title or invalid data
- `401` - No token
- `500` - Server error

---

#### Update Item
Modify an existing item (owner only).

**Request:**
```http
PUT /api/items/:itemId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Smith & Associates (Updated)",
  "description": "Updated family lawyer info",
  "contact_info": "Tel: 020-9999-9999",
  "reference_number": "LAW001-V2"
}
```

**Response (200 OK):**
```json
{
  "message": "Item updated"
}
```

**Notes:**
- Only item owner can update
- `updated_at` timestamp automatically set
- Partial updates supported (send only fields to update)

**Errors:**
- `401` - No token or not authorized
- `404` - Item not found
- `500` - Server error

---

#### Delete Item
Remove an item from category (owner only).

**Request:**
```http
DELETE /api/items/:itemId
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Item deleted"
}
```

**Cascade Effects:**
- Associated files also deleted
- Associated permissions removed (Phase 2)

**Errors:**
- `401` - No token or not authorized
- `404` - Item not found
- `500` - Server error

---

### Files

#### Upload File
Upload a document or scan to an item.

**Request:**
```http
POST /api/items/:itemId/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary file data>
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/items/1/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/document.pdf"
```

**Response (201 Created):**
```json
{
  "id": 1,
  "filename": "1705314000000-document.pdf",
  "original_filename": "document.pdf",
  "url": "/uploads/1705314000000-document.pdf"
}
```

**File Constraints:**
- Max size: 10MB
- Allowed types: PDF, JPEG, PNG, GIF, WEBP, DOC, DOCX, XLS, XLSX

**Errors:**
- `400` - No file uploaded
- `401` - No token
- `413` - File too large
- `415` - Unsupported file type
- `500` - Server error

---

#### Get Item Files
List all files for an item.

**Request:**
```http
GET /api/items/:itemId/files
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "item_id": 1,
    "filename": "1705314000000-contract.pdf",
    "original_filename": "contract.pdf",
    "filepath": "/backend/uploads/1705314000000-contract.pdf",
    "uploaded_at": "2024-01-15T11:00:00Z"
  },
  {
    "id": 2,
    "item_id": 1,
    "filename": "1705314030000-will.pdf",
    "original_filename": "will.pdf",
    "filepath": "/backend/uploads/1705314030000-will.pdf",
    "uploaded_at": "2024-01-15T11:00:30Z"
  }
]
```

**Errors:**
- `401` - No token
- `500` - Server error

---

#### Download File
File access through direct URL (stored in uploaded_at response).

**Request:**
```
GET /uploads/<filename>
```

**Response:**
- `200` - File content
- `404` - File not found

**Note:** Files accessible to owner only (future: implement access control)

---

#### Delete File
Remove a file from an item.

**Request:**
```http
DELETE /api/files/:fileId
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "File deleted"
}
```

**Notes:**
- File physically deleted from disk
- Database record removed
- Item remains intact

**Errors:**
- `401` - No token
- `404` - File not found
- `500` - Server error

---

## Error Responses

### Standard Error Format
```json
{
  "error": "Detailed error message"
}
```

### Common Errors

| Status | Error | Cause |
|--------|-------|-------|
| 400 | Missing required fields | Incomplete request body |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | User lacks permission |
| 404 | Not found | Resource doesn't exist |
| 413 | Payload too large | File exceeds 10MB |
| 415 | Unsupported media type | Invalid file type |
| 500 | Internal server error | Backend issue |

---

## Rate Limiting (Future)

Phase 2 will implement:
- 100 requests per minute per user
- 10 file uploads per hour
- 5MB per upload

---

## Pagination (Future)

Phase 2 will add:
```
GET /api/categories/:categoryId/items?page=1&limit=20
```

Response:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## Batch Operations (Future)

Phase 2 will support:
- Bulk delete items
- Bulk share with users
- Export all data

---

## Testing the API

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"pass123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'
```

**Get Categories:**
```bash
curl http://localhost:5000/api/categories \
  -H "Authorization: Bearer <token>"
```

### Using Postman
Import collection from: [API Collection URL] (to be provided)

### Using Frontend
Simply use the React app - all API calls are handled automatically.

---

## Webhooks (Future)

Phase 2 integration with:
- Email notify on shared access
- Slack integration for admin alerts
- SMS emergency notifications
