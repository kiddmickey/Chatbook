# Deployment Guide

## Overview

This guide covers deploying Chatbook Study Hub using free-tier services for the MVP phase. The application uses Vercel for frontend hosting and Render for backend hosting, with Supabase providing database and authentication services.

## Prerequisites

- GitHub account with repository access
- Supabase account and project setup
- Google Gemini API key
- Vercel account (free tier)
- Render account (free tier)

## Service Setup

### 1. Supabase Setup

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Wait for project initialization (2-3 minutes)
4. Navigate to Settings → API to get your keys

#### Database Schema Setup
```sql
-- Run these commands in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  profile JSONB NOT NULL DEFAULT '{}',
  preferences JSONB NOT NULL DEFAULT '{}',
  metrics JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notebooks table
CREATE TABLE public.notebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  metadata JSONB NOT NULL DEFAULT '{}',
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'public', 'unlisted')),
  metrics JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Modules table
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id UUID REFERENCES public.notebooks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'file', 'link')),
  content JSONB NOT NULL DEFAULT '{}',
  processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Topics table
CREATE TABLE public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id UUID REFERENCES public.notebooks(id) ON DELETE CASCADE,
  source_module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  source_text TEXT,
  difficulty TEXT NOT NULL DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  status TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study sessions table
CREATE TABLE public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  notebook_id UUID REFERENCES public.notebooks(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('multiple_choice', 'understanding', 'application', 'mixed')),
  topic_ids UUID[] NOT NULL DEFAULT '{}',
  questions JSONB NOT NULL DEFAULT '[]',
  responses JSONB NOT NULL DEFAULT '[]',
  chat_history JSONB NOT NULL DEFAULT '[]',
  metrics JSONB NOT NULL DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_notebooks_owner_visibility ON public.notebooks(owner_id, visibility);
CREATE INDEX idx_modules_notebook_status ON public.modules(notebook_id, processing_status);
CREATE INDEX idx_topics_notebook_status ON public.topics(notebook_id, status);
CREATE INDEX idx_study_sessions_user_notebook ON public.study_sessions(user_id, notebook_id);

-- Full-text search indexes
CREATE INDEX idx_notebooks_search ON public.notebooks USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_topics_search ON public.topics USING GIN(to_tsvector('english', title || ' ' || description));
```

#### Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Notebook access policies
CREATE POLICY "Users can view own notebooks" ON public.notebooks
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can view public notebooks" ON public.notebooks
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "Users can manage own notebooks" ON public.notebooks
  FOR ALL USING (auth.uid() = owner_id);

-- Module access policies
CREATE POLICY "Users can access modules of owned notebooks" ON public.modules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.notebooks 
      WHERE notebooks.id = modules.notebook_id 
      AND notebooks.owner_id = auth.uid()
    )
  );

-- Topic access policies
CREATE POLICY "Users can access topics of owned notebooks" ON public.topics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.notebooks 
      WHERE notebooks.id = topics.notebook_id 
      AND notebooks.owner_id = auth.uid()
    )
  );

-- Study session policies
CREATE POLICY "Users can access own study sessions" ON public.study_sessions
  FOR ALL USING (auth.uid() = user_id);
```

#### Storage Setup
1. Go to Storage in Supabase dashboard
2. Create a bucket named `uploads`
3. Set bucket to public for file access
4. Configure storage policies:

```sql
-- Storage policies for file uploads
CREATE POLICY "Users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view files" ON storage.objects
  FOR SELECT USING (true);

CREATE POLICY "Users can update own files" ON storage.objects
  FOR UPDATE USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
```

### 2. Google Gemini API Setup

1. Go to [ai.google.dev](https://ai.google.dev)
2. Sign in with Google account
3. Create a new project or select existing
4. Enable the Gemini API
5. Create API key and copy it
6. Note: Free tier allows 60 requests per minute

### 3. Frontend Deployment (Vercel)

#### Connect Repository
1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "New Project"
3. Import your GitHub repository
4. Select the `frontend` folder as the root directory
5. Vercel will auto-detect it's a Vite React app

#### Environment Variables
Add these environment variables in Vercel dashboard:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Backend API URL
VITE_API_URL=https://your-backend-app.render.com/api/v1

# App Configuration
VITE_APP_NAME=Chatbook Study Hub
VITE_APP_VERSION=1.0.0
```

#### Build Settings
```bash
# Build Command
cd frontend && npm install && npm run build

# Output Directory
frontend/dist

# Install Command
npm run install:all
```

#### Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Your app will be available at `https://your-app.vercel.app`

### 4. Backend Deployment (Render)

#### Create Web Service
1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Select the repository and configure:

**Critical Configuration Steps:**
- **Root Directory**: Leave empty or set to "." (do not use "src" or any subdirectory)
- **Build Command**: `npm run install:all && npm run build`
- **Start Command**: `npm start`

```yaml
# Service Configuration
Name: chatbook-backend
Environment: Node
Region: Oregon (US West)
Branch: main
Root Directory: (leave empty or set to ".")
Build Command: npm run install:all && npm run build
Start Command: npm start
```

**Important**: Make sure the "Root Directory" field is either empty or set to "." (dot). Do not set it to "src" or any other subdirectory.

#### Environment Variables
Add these in Render dashboard:

```bash
# Node Environment
NODE_ENV=production
PORT=10000

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# AI Integration
GEMINI_API_KEY=your-gemini-api-key

# CORS Configuration
FRONTEND_URL=https://your-app.vercel.app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=application/pdf,text/plain,image/jpeg,image/png
```

#### Deploy
1. Click "Create Web Service"
2. Wait for build and deployment
3. Your API will be available at `https://your-backend-app.render.com`

## Environment Configuration

### Development Environment
```bash
# .env.local (root directory)
# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# AI Integration
GEMINI_API_KEY=your-gemini-api-key

# Local Development
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
```

### Production Environment Variables

#### Frontend (Vercel)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL`
- `VITE_APP_NAME`
- `VITE_APP_VERSION`

#### Backend (Render)
- `NODE_ENV=production`
- `PORT=10000`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `FRONTEND_URL`
- `JWT_SECRET`
- `MAX_FILE_SIZE`
- `ALLOWED_FILE_TYPES`

## Quick Deployment Checklist

### Before Deploying
- [ ] Root `package.json` exists with correct scripts
- [ ] Backend `package.json` has `build` and `start` scripts
- [ ] Frontend `package.json` has `build` script
- [ ] All environment variables are documented
- [ ] Database schema is ready in Supabase

### Render Configuration Checklist
- [ ] Root Directory: Empty or "." (not "src")
- [ ] Build Command: `npm run install:all && npm run build`
- [ ] Start Command: `npm start`
- [ ] Environment variables are set
- [ ] Repository is connected correctly

### Vercel Configuration Checklist
- [ ] Root Directory: `frontend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Output Directory: `dist`
- [ ] Environment variables with `VITE_` prefix are set

## Deployment Workflow

### Automatic Deployments

#### Frontend (Vercel)
- Automatically deploys on push to `main` branch
- Preview deployments for pull requests
- Rollback available through Vercel dashboard

#### Backend (Render)
- Automatically deploys on push to `main` branch
- Build logs available in Render dashboard
- Manual redeploy option available

### Manual Deployment

#### Frontend
```bash
# Build locally and deploy
cd frontend
npm install
npm run build
npx vercel --prod
```

#### Backend
```bash
# Deploy to Render (from root directory)
npm run install:all  # Ensure all dependencies are installed
npm run build        # Build backend
git push origin main  # Render will automatically build and deploy
```

## Database Migrations

### Schema Updates
```bash
# For schema changes, update the SQL in Supabase dashboard
# Or use Supabase CLI for version control

# Install Supabase CLI
npm install -g supabase

# Initialize Supabase locally
supabase init

# Link to remote project
supabase link --project-ref your-project-id

# Generate migration
supabase db diff --schema public > migrations/add_new_table.sql

# Apply migration
supabase db push
```

## Monitoring and Maintenance

### Health Checks

#### Frontend Health Check
```javascript
// Add to your React app
const healthCheck = async () => {
  try {
    const response = await fetch('/api/health');
    return response.ok;
  } catch (error) {
    return false;
  }
};
```

#### Backend Health Check
```javascript
// Add to Express app
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version
  });
});
```

### Monitoring Setup

#### Render Monitoring
- Built-in metrics for CPU, memory, and response times
- Log aggregation and search
- Uptime monitoring with alerts

#### Vercel Monitoring
- Core Web Vitals tracking
- Function execution metrics
- Real User Monitoring (RUM)

#### Supabase Monitoring
- Database performance metrics
- API usage statistics
- Storage usage tracking

### Backup Strategy

#### Database Backups
- Supabase automatically backs up your database
- Point-in-time recovery available
- Manual backup exports available

#### File Storage Backups
- Supabase Storage includes redundancy
- Consider periodic exports for critical files

## Troubleshooting

### Common Deployment Issues

#### Build Failures

**"Could not read package.json" Error on Render**
```bash
# This error occurs when Root Directory is set incorrectly
# Solution:
# 1. Go to Render dashboard → Your service → Settings
# 2. Set "Root Directory" to empty or "." (dot)
# 3. Ensure Build Command is: npm run install:all && npm run build
# 4. Redeploy the service
```

**General Build Issues**
```bash
# Check build logs in Vercel/Render dashboard
# Common issues:
# - Missing environment variables
# - TypeScript errors
# - Dependency conflicts
# - Incorrect root directory configuration

# Fix TypeScript errors
npm run type-check

# Fix dependency issues
rm -rf node_modules package-lock.json
npm install
```

#### Runtime Errors
```bash
# Check application logs
# Common issues:
# - Database connection errors
# - API key issues
# - CORS configuration

# Test database connection
npx supabase test db

# Test API endpoints
curl https://your-backend-app.render.com/health
```

#### Performance Issues
```bash
# Monitor metrics in dashboards
# Common solutions:
# - Enable caching
# - Optimize database queries
# - Reduce bundle size

# Analyze bundle size
npm run build -- --analyze
```

### Common Render Deployment Errors

#### Error: "Could not read package.json: ENOENT"
```
npm error path /opt/render/project/src/package.json
npm error errno -2
npm error enoent Could not read package.json
```

**Cause**: Render is looking for package.json in the wrong directory (usually `src/` instead of root).

**Solution**:
1. Go to your Render service dashboard
2. Click on "Settings" tab
3. Find "Root Directory" field
4. Clear the field completely or set it to "." (dot)
5. Save changes
6. Go to "Manual Deploy" and click "Deploy latest commit"

#### Error: "Build command failed"
**Solution**:
1. Ensure Build Command is exactly: `npm run install:all && npm run build`
2. Check that all required scripts exist in package.json files
3. Verify environment variables are set correctly

### Rollback Procedures

#### Frontend Rollback
1. Go to Vercel dashboard
2. Select previous deployment
3. Click "Promote to Production"

#### Backend Rollback
1. Go to Render dashboard
2. Select previous deployment
3. Click "Redeploy"

#### Database Rollback
1. Use Supabase point-in-time recovery
2. Or restore from manual backup
3. Update application if schema changes

## Security Considerations

### Production Security Checklist
- [ ] All environment variables are set correctly
- [ ] JWT secrets are strong and unique
- [ ] CORS is configured properly
- [ ] Rate limiting is enabled
- [ ] File upload validation is active
- [ ] Database RLS policies are enabled
- [ ] HTTPS is enforced
- [ ] API keys are rotated regularly

### Security Headers
```javascript
// Add to Express app
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

## Cost Optimization

### Free Tier Limits
- **Vercel**: 100GB bandwidth, 100 deployments/month
- **Render**: 750 hours/month, 512MB RAM
- **Supabase**: 500MB database, 1GB storage, 2GB bandwidth
- **Gemini API**: 60 requests/minute

### Monitoring Usage
- Set up billing alerts in each service
- Monitor API usage to avoid overages
- Implement caching to reduce API calls
- Optimize database queries to reduce load

### Upgrade Path
When you exceed free tier limits:
1. **Vercel Pro**: $20/month for increased limits
2. **Render Starter**: $7/month for dedicated resources
3. **Supabase Pro**: $25/month for increased database and storage
4. **Gemini Pro API**: Pay-per-use pricing