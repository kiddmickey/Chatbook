# Architecture Documentation

## System Overview

Chatbook Study Hub follows a simplified monolithic backend architecture with a separate React frontend, optimized for the MVP phase using free-tier services.

## Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React SPA     │    │  Express.js     │    │   Supabase      │
│   (Vercel)      │◄──►│   Backend       │◄──►│  PostgreSQL     │
│                 │    │   (Render)      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Supabase Auth  │    │  Google Gemini  │    │ Supabase Storage│
│                 │    │    AI API       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Technology Stack

### Frontend (React SPA)
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: React Router for client-side navigation
- **State Management**: Context API + React hooks
- **Styling**: CSS Modules for component-scoped styles
- **Testing**: Jest + React Testing Library
- **Hosting**: Vercel with automatic deployments

### Backend (Node.js API)
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety
- **Authentication**: JWT tokens with Supabase Auth
- **File Processing**: pdf-parse for PDF text extraction
- **API Documentation**: OpenAPI/Swagger specifications
- **Hosting**: Render with automatic deployments

### Database & Storage
- **Primary Database**: Supabase PostgreSQL (500MB free tier)
- **Authentication**: Supabase Auth (built-in user management)
- **File Storage**: Supabase Storage (1GB free tier)
- **Search**: PostgreSQL full-text search with tsvector
- **Caching**: In-memory caching (Redis upgrade path available)

### External Services
- **AI Integration**: Google Gemini API (60 requests/minute free tier)
- **Email**: Supabase built-in email templates
- **Monitoring**: Built-in logging and error tracking

## Project Structure

### Monorepo Organization
```
chatbook-study-hub/
├── frontend/           # React TypeScript application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Route-level components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── services/   # API client services
│   │   └── types/      # Frontend TypeScript types
│   └── package.json
├── backend/            # Express.js API server
│   ├── src/
│   │   ├── routes/     # API route handlers
│   │   ├── services/   # Business logic services
│   │   ├── middleware/ # Express middleware
│   │   └── types/      # Backend TypeScript types
│   └── package.json
├── shared/             # Shared types and utilities
│   ├── types/          # Common TypeScript interfaces
│   └── utils/          # Shared utility functions
└── package.json        # Root workspace configuration
```

## Data Architecture

### Database Schema

#### Core Tables
```sql
-- Users table (managed by Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  profile JSONB NOT NULL DEFAULT '{}',
  preferences JSONB NOT NULL DEFAULT '{}',
  metrics JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notebooks table
CREATE TABLE notebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  metadata JSONB NOT NULL DEFAULT '{}',
  visibility TEXT NOT NULL DEFAULT 'private',
  metrics JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Modules table (content within notebooks)
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- 'text', 'file', 'link'
  content JSONB NOT NULL DEFAULT '{}',
  processing_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Topics table (AI-generated study topics)
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE,
  source_module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  source_text TEXT,
  difficulty TEXT NOT NULL DEFAULT 'intermediate',
  status TEXT NOT NULL DEFAULT 'suggested',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study sessions table
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  topic_ids UUID[] NOT NULL DEFAULT '{}',
  questions JSONB NOT NULL DEFAULT '[]',
  responses JSONB NOT NULL DEFAULT '[]',
  chat_history JSONB NOT NULL DEFAULT '[]',
  metrics JSONB NOT NULL DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);
```

#### Indexes for Performance
```sql
-- Search and filtering indexes
CREATE INDEX idx_notebooks_owner_visibility ON notebooks(owner_id, visibility);
CREATE INDEX idx_modules_notebook_status ON modules(notebook_id, processing_status);
CREATE INDEX idx_topics_notebook_status ON topics(notebook_id, status);
CREATE INDEX idx_study_sessions_user_notebook ON study_sessions(user_id, notebook_id);

-- Full-text search indexes
CREATE INDEX idx_notebooks_search ON notebooks USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_topics_search ON topics USING GIN(to_tsvector('english', title || ' ' || description));
```

## API Architecture

### RESTful API Design
```
/api/v1/
├── /auth                    # Authentication endpoints
│   ├── POST /register       # User registration
│   ├── POST /login          # User login
│   └── GET /profile         # Get user profile
├── /notebooks               # Notebook management
│   ├── GET /                # List user notebooks
│   ├── POST /               # Create notebook
│   ├── GET /:id             # Get notebook details
│   ├── PUT /:id             # Update notebook
│   ├── DELETE /:id          # Delete notebook
│   └── /:id/modules         # Module management
├── /content                 # Content processing
│   ├── POST /upload         # Upload files
│   └── GET /:id/status      # Processing status
├── /ai                      # AI integration
│   ├── POST /study-guide    # Generate study guide
│   ├── POST /questions      # Generate questions
│   └── POST /chat           # AI tutoring chat
├── /study                   # Study sessions
│   └── /sessions            # Session management
└── /social                  # Social features
    ├── GET /leaderboard     # User rankings
    └── GET /public          # Public content
```

### Middleware Stack
```typescript
// Express middleware pipeline
app.use(cors());                    // CORS handling
app.use(helmet());                  // Security headers
app.use(compression());             // Response compression
app.use(express.json());            // JSON parsing
app.use(rateLimiter);              // Rate limiting
app.use(authMiddleware);           // JWT authentication
app.use(validationMiddleware);     // Request validation
app.use(errorHandler);             // Error handling
```

## Security Architecture

### Authentication Flow
1. User registers/logs in through Supabase Auth
2. Supabase returns JWT token
3. Frontend stores token in secure HTTP-only cookie
4. Backend validates JWT on protected routes
5. User context attached to request object

### Data Protection
- **Encryption**: All data encrypted at rest (Supabase)
- **Transport**: HTTPS/TLS for all communications
- **Authentication**: JWT tokens with expiration
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API endpoint protection

### File Upload Security
```typescript
// File upload validation
const fileValidation = {
  allowedTypes: ['application/pdf', 'text/plain', 'image/jpeg', 'image/png'],
  maxSize: 10 * 1024 * 1024, // 10MB
  scanForMalware: true,
  sanitizeFilename: true
};
```

## Performance Architecture

### Caching Strategy
```typescript
// Multi-level caching approach
const cacheStrategy = {
  // Level 1: In-memory cache for frequently accessed data
  memory: {
    userProfiles: '5 minutes',
    notebookMetadata: '10 minutes',
    topicSuggestions: '30 minutes'
  },
  
  // Level 2: Database query optimization
  database: {
    connectionPooling: true,
    queryOptimization: true,
    indexStrategy: 'comprehensive'
  },
  
  // Level 3: CDN for static assets
  cdn: {
    staticAssets: 'Vercel Edge Network',
    fileStorage: 'Supabase CDN'
  }
};
```

### AI API Optimization
```typescript
// AI response caching to reduce costs
const aiCaching = {
  studyGuides: '24 hours',
  topicGeneration: '1 hour',
  questionGeneration: '6 hours',
  chatResponses: '30 minutes'
};
```

## Scalability Considerations

### Current Architecture Limits
- **Database**: 500MB Supabase free tier
- **Storage**: 1GB Supabase free tier
- **AI API**: 60 requests/minute Gemini free tier
- **Hosting**: Render free tier limitations

### Upgrade Path
```typescript
// Phase 2 scaling options
const scalingPlan = {
  database: 'Supabase Pro ($25/month) or dedicated PostgreSQL',
  storage: 'Supabase Pro or AWS S3',
  aiApi: 'Gemini Pro API or OpenAI GPT-4',
  caching: 'Redis Cloud or AWS ElastiCache',
  hosting: 'Render paid plans or AWS/GCP',
  cdn: 'Cloudflare or AWS CloudFront'
};
```

## Monitoring and Observability

### Application Monitoring
```typescript
// Monitoring stack
const monitoring = {
  errorTracking: 'Built-in Express error handling',
  performanceMonitoring: 'Custom metrics collection',
  uptime: 'Render built-in monitoring',
  logs: 'Structured logging with Winston',
  alerts: 'Email notifications for critical errors'
};
```

### Key Metrics
- API response times
- Database query performance
- AI API usage and costs
- User engagement metrics
- Error rates and types
- File processing success rates

## Deployment Architecture

### CI/CD Pipeline
```yaml
# Deployment flow
Development:
  - Local development with hot reload
  - Docker Compose for full stack testing
  - Automated testing on commit

Staging:
  - Automatic deployment from develop branch
  - Integration testing
  - Performance testing

Production:
  - Automatic deployment from main branch
  - Blue-green deployment strategy
  - Rollback capabilities
```

### Environment Configuration
```typescript
// Environment-specific settings
const environments = {
  development: {
    database: 'Local Supabase or cloud dev instance',
    ai: 'Gemini API with development key',
    storage: 'Local or Supabase dev bucket'
  },
  production: {
    database: 'Supabase production instance',
    ai: 'Gemini API with production key',
    storage: 'Supabase production bucket'
  }
};
```

## Future Architecture Evolution

### Microservices Migration Path
When scaling beyond MVP, consider:
1. **User Service**: Authentication and profile management
2. **Content Service**: File processing and storage
3. **AI Service**: AI integration and caching
4. **Study Service**: Learning sessions and progress
5. **Social Service**: Community features and rankings

### Technology Upgrade Considerations
- **Database**: PostgreSQL with read replicas
- **Caching**: Redis cluster for distributed caching
- **Search**: Elasticsearch for advanced search features
- **Queue System**: Bull/Redis for background job processing
- **API Gateway**: Kong or AWS API Gateway for advanced routing