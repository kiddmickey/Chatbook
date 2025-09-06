# API Documentation

## Base URL
- **Development**: `http://localhost:3000/api/v1`
- **Production**: `https://your-app.render.com/api/v1`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "profile": {
      "firstName": "John",
      "lastName": "Doe"
    }
  },
  "token": "jwt_token_here"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Get User Profile
```http
GET /auth/profile
Authorization: Bearer <jwt_token>
```

## Notebook Management

### List User Notebooks
```http
GET /notebooks
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "notebooks": [
    {
      "id": "uuid",
      "title": "Biology 101",
      "description": "Introduction to Biology",
      "metadata": {
        "schoolType": "University",
        "schoolName": "State University",
        "subject": "Biology",
        "course": "BIO 101"
      },
      "visibility": "private",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "moduleCount": 5,
      "topicCount": 12
    }
  ]
}
```

### Create Notebook
```http
POST /notebooks
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Chemistry Fundamentals",
  "description": "Basic chemistry concepts",
  "metadata": {
    "schoolType": "High School",
    "schoolName": "Lincoln High",
    "subject": "Chemistry",
    "course": "CHEM 101"
  },
  "visibility": "private"
}
```

### Get Notebook Details
```http
GET /notebooks/:id
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "notebook": {
    "id": "uuid",
    "title": "Biology 101",
    "description": "Introduction to Biology",
    "modules": [
      {
        "id": "uuid",
        "title": "Cell Structure",
        "type": "file",
        "content": {
          "fileName": "cell-structure.pdf",
          "fileUrl": "https://storage.url/file.pdf",
          "extractedText": "Cell structure content..."
        },
        "processingStatus": "completed"
      }
    ],
    "topics": [
      {
        "id": "uuid",
        "title": "Cell Membrane",
        "description": "Structure and function of cell membranes",
        "difficulty": "intermediate",
        "status": "accepted"
      }
    ]
  }
}
```

### Update Notebook
```http
PUT /notebooks/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "visibility": "public"
}
```

### Delete Notebook
```http
DELETE /notebooks/:id
Authorization: Bearer <jwt_token>
```

## Content Management

### Upload Content Module
```http
POST /notebooks/:id/modules
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

file: <file_upload>
title: "Module Title"
type: "file"
```

**Response:**
```json
{
  "module": {
    "id": "uuid",
    "title": "Module Title",
    "type": "file",
    "processingStatus": "processing",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Add Text Module
```http
POST /notebooks/:id/modules
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Study Notes",
  "type": "text",
  "content": {
    "text": "These are my study notes about..."
  }
}
```

### Get Module Processing Status
```http
GET /notebooks/:id/modules/:moduleId/status
Authorization: Bearer <jwt_token>
```

## Topic Management

### Get Generated Topics
```http
GET /notebooks/:id/topics
Authorization: Bearer <jwt_token>
```

### Generate Topics from Content
```http
POST /notebooks/:id/topics/generate
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "moduleId": "uuid"
}
```

### Update Topic Status
```http
PUT /notebooks/:id/topics/:topicId
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "status": "accepted",
  "title": "Updated Topic Title",
  "description": "Updated description"
}
```

## AI Integration

### Generate Study Guide
```http
POST /ai/study-guide
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "notebookId": "uuid",
  "topicIds": ["uuid1", "uuid2"],
  "difficulty": "intermediate"
}
```

**Response:**
```json
{
  "studyGuide": {
    "id": "uuid",
    "title": "Biology Study Guide",
    "content": {
      "summary": "Comprehensive overview...",
      "keyPoints": [
        "Cell structure is fundamental...",
        "Membrane transport mechanisms..."
      ],
      "sections": [
        {
          "title": "Cell Structure",
          "content": "Detailed explanation..."
        }
      ]
    },
    "generatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Generate Practice Questions
```http
POST /ai/questions
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "notebookId": "uuid",
  "topicIds": ["uuid1", "uuid2"],
  "questionType": "multiple_choice",
  "count": 10,
  "difficulty": "intermediate"
}
```

### Start AI Tutoring Session
```http
POST /ai/chat
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "notebookId": "uuid",
  "topicIds": ["uuid1"],
  "mode": "understanding",
  "message": "Can you explain cell membrane transport?"
}
```

## Study Sessions

### Create Study Session
```http
POST /study/sessions
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "notebookId": "uuid",
  "topicIds": ["uuid1", "uuid2"],
  "type": "multiple_choice"
}
```

### Submit Answer
```http
POST /study/sessions/:sessionId/answers
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "questionId": "uuid",
  "answer": "A",
  "timeSpent": 30
}
```

### Get Session Results
```http
GET /study/sessions/:sessionId/results
Authorization: Bearer <jwt_token>
```

## Social Features

### Get Public Notebooks
```http
GET /notebooks/public
```

**Query Parameters:**
- `subject`: Filter by subject
- `schoolType`: Filter by school type
- `search`: Search term
- `page`: Page number
- `limit`: Results per page

### Follow Notebook
```http
POST /notebooks/:id/follow
Authorization: Bearer <jwt_token>
```

### Get Leaderboard
```http
GET /social/leaderboard
```

### Search Content
```http
GET /search
```

**Query Parameters:**
- `q`: Search query
- `type`: Content type (notebooks, topics, users)
- `filters`: Additional filters

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    },
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "uuid"
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` (400): Invalid request data
- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error
- `SERVICE_UNAVAILABLE` (503): External service unavailable

## Rate Limits

- **AI Endpoints**: 60 requests per minute (Gemini API limit)
- **File Upload**: 10 files per minute per user
- **General API**: 1000 requests per hour per user

## Webhooks

### Supabase Real-time Events

The application uses Supabase real-time subscriptions for:
- Notebook updates
- Module processing status changes
- New topic generation
- Study session progress

Subscribe to real-time events using the Supabase client:

```javascript
const subscription = supabase
  .channel('notebook-updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'notebooks'
  }, (payload) => {
    // Handle notebook updates
  })
  .subscribe()
```