# Chatbook Study Hub

A comprehensive AI-powered learning platform that enables students to create, manage, and study from personalized notebooks called "Chatbooks." The platform combines user-generated content management with intelligent tutoring systems and social learning features.

## 🚀 Features

- **AI-Powered Learning**: Automatically generates study materials, practice questions, and interactive tutoring from uploaded content
- **Content Management**: Upload PDFs, notes, and files to create structured study notebooks
- **Interactive Tutoring**: Multiple choice, understanding, and application-based learning modes
- **Study Tools**: Generate comprehensive study guides and personalized tests
- **Social Discovery**: Explore public notebooks, follow creators, and participate in leaderboards
- **Progress Tracking**: Detailed analytics, achievements, and ranking system

## 🏗️ Architecture

### Tech Stack (MVP - Free Tier)

- **Frontend**: React 18+ with TypeScript (Vite build tool)
- **Backend**: Node.js with Express.js and TypeScript
- **Database**: Supabase PostgreSQL (500MB free tier)
- **Authentication**: Supabase Auth (built-in)
- **File Storage**: Supabase Storage (1GB free tier)
- **AI Integration**: Google Gemini API (60 req/min free tier)
- **Search**: PostgreSQL full-text search
- **Hosting**: 
  - Frontend: Vercel
  - Backend: Render

### Project Structure

```
chatbook-study-hub/
├── frontend/                 # React TypeScript application
├── backend/                  # Node.js Express services
├── shared/                   # Shared TypeScript types and utilities
├── docker/                   # Docker configuration files
├── docs/                     # API documentation and guides
├── scripts/                  # Build and deployment scripts
├── .kiro/                    # Kiro configuration and specs
├── docker-compose.yml        # Development environment setup
├── package.json              # Root package.json for workspace
└── README.md                 # Project documentation
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Git
- Docker (optional, for development environment)

### Workspace Structure

This project uses a monorepo structure with separate frontend and backend packages:

```
chatbook-study-hub/
├── package.json          # Root workspace configuration
├── frontend/             # React TypeScript application
├── backend/              # Node.js Express API
└── shared/               # Shared types and utilities
```

The root `package.json` provides convenient scripts to manage the entire workspace.

### Required Service Signups

1. **Supabase** (Database + Auth + Storage)
   - Sign up: [supabase.com](https://supabase.com) → Create project
   - Get: Project URL, anon key, service role key

2. **Google Gemini** (AI)
   - Sign up: [ai.google.dev](https://ai.google.dev) → Get API Key
   - Free tier: 60 requests per minute

3. **Vercel** (Frontend Hosting)
   - Sign up: [vercel.com](https://vercel.com) with GitHub account
   - Auto-deploy from repository

4. **Render** (Backend Hosting)
   - Sign up: [render.com](https://render.com) with GitHub account
   - Deploy from repository

### Environment Variables

Create `.env.local` file in the root directory:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI Integration
GEMINI_API_KEY=AIzaSyC...

# Add same variables to Vercel & Render dashboards for production
```

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chatbook-study-hub
   ```

2. **Install all dependencies**
   ```bash
   # Install root dependencies and all workspace dependencies
   npm run install:all
   ```

3. **Initialize Supabase (optional for local development)**
   ```bash
   npx supabase init
   npx supabase start
   ```

4. **Start development servers**
   ```bash
   # Start both frontend and backend concurrently
   npm run dev
   
   # Or start individually
   npm run dev:frontend  # React dev server (Vite)
   npm run dev:backend   # Express server with hot reload
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit      # Unit tests only
npm run test:e2e       # End-to-end tests
npm run test:watch     # Watch mode for development

# Test coverage
npm run test:coverage
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Render)
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Add environment variables in Render dashboard
4. Deploy automatically on push to main branch

### Database (Supabase)
1. Push schema changes:
   ```bash
   npx supabase db push
   ```

## 📁 Development Workflow

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend concurrently
npm run dev:frontend     # Start only React dev server (port 5173)
npm run dev:backend      # Start only Express server (port 3000)

# Production
npm run build            # Build backend for production
npm start               # Start production server

# Setup
npm run install:all     # Install dependencies for all packages
```

### Code Quality
Individual packages (frontend/backend) contain their own scripts for:
- Linting and formatting (`npm run lint`, `npm run format`)
- Type checking (`npm run type-check`)
- Testing (`npm test`)
- Package-specific builds

### Docker Development Environment
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down
```

## 🏛️ Architecture Details

### Frontend Structure
- **Components**: Organized by domain (common, layout, notebook, study, social)
- **Pages**: Route-level components for different app sections
- **Hooks**: Custom React hooks for shared logic
- **Services**: API client and external service integrations
- **State Management**: Context API + hooks (avoiding Redux complexity)

### Backend Structure
- **Services**: Domain-driven microservice implementations
- **Shared**: Common utilities, middleware, and database models
- **API Routes**: RESTful endpoints organized by resource
- **Authentication**: JWT-based with Supabase Auth integration

### Database Schema
- **Users**: Authentication and profile management
- **Notebooks**: Study material organization
- **Modules**: Individual content pieces within notebooks
- **Topics**: AI-generated and user-defined study topics
- **Study Sessions**: Learning progress and interaction tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards
- TypeScript strict mode enabled
- ESLint and Prettier for code formatting
- Component naming: PascalCase for files, camelCase for hooks
- Test coverage minimum: 80%

## 📚 API Documentation

### Core Endpoints

#### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/profile` - Get user profile

#### Notebooks
- `GET /api/v1/notebooks` - List user notebooks
- `POST /api/v1/notebooks` - Create new notebook
- `GET /api/v1/notebooks/:id` - Get notebook details
- `PUT /api/v1/notebooks/:id` - Update notebook
- `DELETE /api/v1/notebooks/:id` - Delete notebook

#### Content Management
- `POST /api/v1/notebooks/:id/modules` - Upload content module
- `GET /api/v1/notebooks/:id/topics` - Get generated topics
- `POST /api/v1/ai/study-guide` - Generate study guide
- `POST /api/v1/ai/questions` - Generate practice questions

## 🔧 Performance Considerations

- **AI API Caching**: Responses cached to reduce costs and improve speed
- **Database Indexing**: Optimized queries on frequently accessed fields
- **File Processing**: Async queue-based processing for large files
- **Frontend Optimization**: Code splitting and lazy loading for components

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the project specifications in `.kiro/specs/`

---

Built with ❤️ using React, TypeScript, Node.js, and Supabase