# Technology Stack

## Architecture (Phase 1 MVP - Free Tier)

- **Pattern**: Simplified monolithic backend with separate frontend
- **Frontend**: React SPA with TypeScript (Vercel hosting)
- **Backend**: Node.js with Express.js and TypeScript (Render hosting)
- **Database**: Supabase PostgreSQL (free tier - 500MB)
- **Authentication**: Supabase Auth (built-in)
- **File Storage**: Supabase Storage (free tier - 1GB)
- **AI Integration**: Google Gemini API (free tier - 60 req/min)
- **Search**: PostgreSQL full-text search (no external service needed)

## Frontend Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite for fast development and builds
- **Routing**: React Router for SPA navigation
- **State Management**: Context API + hooks (avoid Redux unless necessary)
- **Styling**: CSS Modules or Styled Components
- **Testing**: Jest + React Testing Library
- **PWA**: Progressive Web App capabilities for offline support

## Backend Stack

- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety
- **Authentication**: JWT-based with secure session management
- **File Processing**: pdf-parse for PDF text extraction
- **Queue System**: Bull with Redis for background jobs
- **API Documentation**: OpenAPI/Swagger specifications

## Database & Storage (Free Tier)

- **Primary DB**: Supabase PostgreSQL (500MB free, includes real-time)
- **Authentication**: Supabase Auth (built-in, no separate service needed)
- **File Storage**: Supabase Storage (1GB free)
- **Search**: PostgreSQL full-text search with tsvector
- **Cache**: In-memory caching initially (upgrade to Redis later)
- **Schema Management**: Supabase migrations or SQL scripts

## Development Tools

- **Containerization**: Docker for development environment
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **Testing**: Unit tests (70%), Integration tests (20%), E2E tests (10%)
- **CI/CD**: Automated testing and deployment pipeline

## Required API Keys & Setup

### Free Service Signups

```bash
# 1. Supabase (Database + Auth + Storage)
# Sign up: supabase.com → Create project
# Get: Project URL, anon key, service role key

# 2. Google Gemini (AI)
# Sign up: ai.google.dev → Get API Key
# Free tier: 60 requests per minute

# 3. Vercel (Frontend Hosting)
# Sign up: vercel.com with GitHub account
# Auto-deploy from repository

# 4. Render (Backend Hosting) - RECOMMENDED
# Sign up: render.com with GitHub account
# Permanent free tier (better than Railway's 30-day limit)
# Deploy from repository with auto-deploy on push
```

### Environment Variables

```bash
# .env.local (local development)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY=AIzaSyC...

# Add same variables to Vercel & Render dashboards for production
```

### Development Setup

```bash
# Install all workspace dependencies (root, frontend, backend)
npm run install:all

# Start development servers concurrently
npm run dev          # Start both frontend and backend
npm run dev:frontend # React dev server (Vite) only
npm run dev:backend  # Express server with hot reload only

# Supabase operations
npx supabase init    # Initialize Supabase locally
npx supabase start   # Start local Supabase (optional)
npx supabase db push # Push schema changes
```

### Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit    # Unit tests only
npm run test:e2e     # End-to-end tests
npm run test:watch   # Watch mode for development

# Test coverage
npm run test:coverage
```

### Build & Deployment

```bash
# Build for production (backend)
npm run build

# Start production server
npm start

# Install all dependencies
npm run install:all

# Individual package operations (run from respective directories)
cd frontend && npm run build    # Build frontend
cd backend && npm run lint      # Lint backend code
cd frontend && npm run lint     # Lint frontend code

# Docker operations
docker-compose up -d    # Start development environment
docker-compose down     # Stop all services
```

## Performance Considerations

- **AI API Caching**: Cache AI responses to reduce costs and improve speed
- **Database Indexing**: Proper indexes on frequently queried fields
- **File Processing**: Async queue-based processing for large files
- **Frontend Optimization**: Code splitting and lazy loading for large components
