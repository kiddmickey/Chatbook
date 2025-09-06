# Project Structure

## Root Directory Layout
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

## Frontend Structure (`/frontend`)
```
frontend/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/          # Generic components (Button, Modal, etc.)
│   │   ├── layout/          # Layout components (Header, Sidebar)
│   │   ├── notebook/        # Notebook-specific components
│   │   ├── study/           # Study interface components
│   │   └── social/          # Social features components
│   ├── pages/               # Route-level page components
│   │   ├── auth/           # Login, register pages
│   │   ├── dashboard/      # Main dashboard
│   │   ├── notebook/       # Notebook management pages
│   │   ├── study/          # Study interface pages
│   │   └── explore/        # Content discovery pages
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API client and external service calls
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Helper functions and utilities
│   ├── styles/              # Global styles and theme
│   └── App.tsx              # Main application component
├── public/                  # Static assets
├── package.json
└── vite.config.ts           # Vite configuration
```

## Backend Structure (`/backend`)
```
backend/
├── src/
│   ├── services/            # Microservice implementations
│   │   ├── user/           # User management service
│   │   ├── notebook/       # Notebook CRUD service
│   │   ├── content/        # File processing service
│   │   ├── ai/             # AI integration service
│   │   └── social/         # Social features service
│   ├── shared/              # Shared backend utilities
│   │   ├── middleware/     # Express middleware
│   │   ├── database/       # Database connection and models
│   │   ├── auth/           # Authentication utilities
│   │   └── validation/     # Request validation schemas
│   ├── types/               # Backend TypeScript types
│   └── app.ts               # Main application entry point
├── migrations/              # Database migration files
├── seeds/                   # Database seed data
├── tests/                   # Backend test files
├── package.json
└── tsconfig.json
```

## Shared Types (`/shared`)
```
shared/
├── types/
│   ├── user.ts              # User-related interfaces
│   ├── notebook.ts          # Notebook and module interfaces
│   ├── study.ts             # Study session and question interfaces
│   ├── api.ts               # API request/response interfaces
│   └── index.ts             # Exported type definitions
├── utils/
│   ├── validation.ts        # Shared validation functions
│   └── constants.ts         # Application constants
└── package.json
```

## Component Organization Patterns

### Component Naming Convention
- **PascalCase** for component files: `ChatbookList.tsx`
- **camelCase** for hooks: `useNotebook.ts`
- **kebab-case** for CSS modules: `chatbook-list.module.css`

### Component Structure Template
```typescript
// components/notebook/ChatbookList.tsx
interface ChatbookListProps {
  notebooks: Notebook[];
  onSelect: (id: string) => void;
}

export const ChatbookList: React.FC<ChatbookListProps> = ({
  notebooks,
  onSelect
}) => {
  // Component implementation
};
```

### Service Layer Pattern
```typescript
// services/notebookService.ts
export class NotebookService {
  async getNotebooks(): Promise<Notebook[]> {
    // API implementation
  }
  
  async createNotebook(data: CreateNotebookRequest): Promise<Notebook> {
    // API implementation
  }
}
```

## Database Schema Organization

### Migration Files
- **Naming**: `YYYYMMDD_HHMMSS_description.sql`
- **Location**: `/backend/migrations/`
- **Pattern**: One migration per logical change

### Model Organization
```typescript
// backend/src/shared/database/models/
├── User.ts                  # User model and relations
├── Notebook.ts              # Notebook model and relations
├── Module.ts                # Content module model
├── Topic.ts                 # Topic model and relations
└── StudySession.ts          # Study session tracking
```

## API Route Organization

### RESTful Route Structure
```
/api/v1/
├── /auth                    # Authentication endpoints
├── /users                   # User management
├── /notebooks               # Notebook CRUD
├── /notebooks/:id/modules   # Module management
├── /notebooks/:id/topics    # Topic management
├── /study                   # Study sessions
├── /ai                      # AI service endpoints
└── /search                  # Search functionality
```

### Service-Based Route Organization
```typescript
// backend/src/services/notebook/routes.ts
router.get('/notebooks', getNotebooks);
router.post('/notebooks', createNotebook);
router.get('/notebooks/:id', getNotebook);
router.put('/notebooks/:id', updateNotebook);
router.delete('/notebooks/:id', deleteNotebook);
```

## Configuration Management

### Environment Variables
- **Development**: `.env.development`
- **Production**: `.env.production`
- **Testing**: `.env.test`

### Configuration Structure
```typescript
// shared/config/index.ts
export const config = {
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME
  },
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    claudeApiKey: process.env.CLAUDE_API_KEY
  },
  redis: {
    url: process.env.REDIS_URL
  }
};
```

## Testing Organization

### Test File Structure
- **Unit Tests**: Co-located with source files (`Component.test.tsx`)
- **Integration Tests**: `/backend/tests/integration/`
- **E2E Tests**: `/tests/e2e/`

### Test Naming Convention
```typescript
// Component.test.tsx
describe('ChatbookList', () => {
  it('should render notebooks correctly', () => {
    // Test implementation
  });
  
  it('should handle notebook selection', () => {
    // Test implementation
  });
});
```