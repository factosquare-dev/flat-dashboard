# FLAT Dashboard

Modern React-based frontend dashboard for the FLAT (Factory Lifecycle and Tracking) business management platform.

## Overview

This dashboard provides a modern web interface for managing business operations including:
- User authentication and profile management
- Product catalog and inventory management
- Order processing and tracking
- Factory operations and quality control
- Workflow management and task tracking
- Analytics and reporting
- Document management
- Project oversight

## Tech Stack

- **Framework**: React 19.1.0
- **Build Tool**: Vite 6.3.5
- **Language**: TypeScript 5.8.3
- **Styling**: CSS3 with modern features
- **Linting**: ESLint 9.25.0
- **Testing**: Vitest + Playwright
- **Package Manager**: npm
- **State Management**: React Context API
- **HTTP Client**: Fetch API with custom service layer

## Project Structure

```
dashboard/
├── flat/                      # React application
│   ├── public/              # Static assets
│   │   └── vite.svg        # Vite logo
│   ├── src/
│   │   ├── assets/         # Images, icons, etc.
│   │   │   └── react.svg   # React logo
│   │   ├── components/     # Reusable UI components
│   │   │   └── ErrorBoundary.tsx
│   │   ├── pages/          # Route components
│   │   ├── hooks/          # Custom React hooks
│   │   │   └── useLogging.ts
│   │   ├── services/       # API integration
│   │   │   └── api.ts      # API client
│   │   ├── utils/          # Utility functions
│   │   │   └── logger.ts   # Logging utility
│   │   ├── types/          # TypeScript definitions
│   │   ├── App.tsx         # Main app component
│   │   ├── App.css         # App styles
│   │   ├── main.tsx        # Entry point
│   │   ├── index.css       # Global styles
│   │   └── vite-env.d.ts   # Vite types
│   ├── tests/               # Test suites
│   │   ├── e2e/            # End-to-end tests
│   │   ├── integration/    # Integration tests
│   │   ├── unit/           # Unit tests
│   │   └── mocks/          # Test mocks
│   ├── eslint.config.js     # ESLint config
│   ├── tsconfig.json        # TypeScript config
│   ├── vite.config.ts       # Vite config
│   ├── vitest.config.ts     # Vitest config
│   └── package.json         # Dependencies
├── docker/                   # Docker configurations
│   ├── dev.Dockerfile       # Development image
│   ├── staging.Dockerfile   # Staging image
│   └── prod.Dockerfile      # Production image
├── nginx.conf               # Nginx configuration
├── docker-compose.yml       # Docker compose config
├── Makefile                 # Make commands
└── README.md                # This file
```

## Environment Setup

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 8+ or yarn 1.22+
- Docker (optional)

### Quick Start with Make

```bash
# Start development environment
make dev

# Run tests
make test

# Build for production
make build

# View logs
make logs
```

### Local Development

1. **Clone the repository (with submodules)**
   ```bash
   git clone --recurse-submodules git@github.com:FactosquareDev/flat.git
   cd flat/dashboard
   ```

2. **Navigate to React app directory**
   ```bash
   cd flat
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Environment configuration**
   ```bash
   # Create environment file
   cp .env.example .env
   # Edit .env with your API endpoints
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

### Docker Development

1. **Using Make commands (recommended)**
   ```bash
   # Start dashboard with backend
   make dev
   
   # Build dashboard only
   make build SERVICE=dashboard
   
   # View dashboard logs
   make logs SERVICE=dashboard
   ```

2. **Using Docker Compose**
   ```bash
   # Development environment
   docker-compose up --build dashboard
   
   # The dashboard will be available at http://localhost:5173
   ```

3. **Individual Docker commands**
   ```bash
   # Build development image
   docker build -f docker/dev.Dockerfile -t flat-dashboard-dev .
   
   # Run container with hot reload
   docker run -p 5173:5173 -v $(pwd)/flat:/app flat-dashboard-dev
   ```

## Environment Variables

Create a `.env` file in the `app/` directory:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=10000

# Authentication
VITE_AUTH_TOKEN_KEY=flat_auth_token
VITE_REFRESH_TOKEN_KEY=flat_refresh_token

# Application
VITE_APP_NAME=Flat Dashboard
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Business Management Dashboard

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_DARK_MODE=true

# Development
VITE_ENABLE_DEV_TOOLS=true
VITE_LOG_LEVEL=debug
```

## Available Scripts

In the `flat/` directory, you can run:

### Development
```bash
# Start development server with hot reload
npm run dev

# Start development server accessible from network
npm run dev -- --host 0.0.0.0

# Start with custom port
npm run dev -- --port 3000
```

### Building
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Quality
```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint -- --fix

# Type checking
npm run type-check
```

## Testing

### Test Configuration

Testing is already configured with:
- **Vitest**: Fast unit test runner
- **Playwright**: E2E testing
- **React Testing Library**: Component testing
- **MSW**: API mocking

### Running Tests

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm test -- --watch
```

### Test Structure

```
tests/
├── e2e/                # End-to-end tests (Playwright)
├── integration/        # Integration tests
│   ├── auth-flow.test.tsx
│   ├── permission-caching.test.tsx
│   └── real-time-cache-sync.test.tsx
├── unit/               # Unit tests
├── mocks/              # Mock handlers
│   └── handlers.ts    # MSW request handlers
└── setup.ts            # Test setup and utilities
```

## Code Organization

### Component Structure

```typescript
// components/Button/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  onClick,
  children 
}) => {
  return (
    <button 
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

### API Service Layer

```typescript
// services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ApiService {
  private baseURL: string;
  
  constructor() {
    this.baseURL = API_BASE_URL;
  }
  
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`);
    return response.json();
  }
  
  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }
}

export const apiService = new ApiService();
```

## Styling Guidelines

### CSS Organization

```css
/* Use CSS custom properties for theming */
:root {
  --color-primary: #2563eb;
  --color-secondary: #64748b;
  --color-success: #10b981;
  --color-danger: #ef4444;
  --color-warning: #f59e0b;
  
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
}

/* Component-specific styles */
.btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}
```

### Responsive Design

```css
/* Mobile first approach */
.container {
  padding: var(--spacing-md);
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    padding: var(--spacing-lg);
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container {
    padding: var(--spacing-xl);
  }
}
```

## State Management

### Using React Context

```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## Deployment

### Production Build

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview

# The built files will be in dist/ directory
```

### Docker Deployment

```bash
# Build production image
make build SERVICE=dashboard ENV=prod

# Or using Docker directly
docker build -f docker/prod.Dockerfile -t flat-dashboard-prod .

# Run production container with Nginx
docker run -p 80:80 flat-dashboard-prod
```

### Environment-Specific Builds

```bash
# Development (with hot reload)
make dev

# Staging environment
make build SERVICE=dashboard ENV=staging

# Production (optimized)
make build SERVICE=dashboard ENV=prod
```

### Static Hosting

The built application can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Any static hosting service

```bash
# Example: Deploy to Vercel
npx vercel --prod

# Example: Deploy to Netlify  
npx netlify deploy --prod --dir=dist
```

## Performance Optimization

### Code Splitting

```typescript
// Lazy load components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));

// Use Suspense for loading states
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/profile" element={<Profile />} />
  </Routes>
</Suspense>
```

### Bundle Analysis

```bash
# Analyze bundle size
npm run build -- --analyze

# Or use bundle analyzer
npm install --save-dev rollup-plugin-analyzer
```

## Security Best Practices

### Environment Variables

- Never commit `.env` files to version control
- Use different environment files for different stages
- Validate environment variables at startup

### Content Security Policy

```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline';">
```

## Troubleshooting

### Common Issues

1. **Module Resolution Errors**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Vite Dev Server Issues**
   ```bash
   # Clear Vite cache
   rm -rf node_modules/.vite
   npm run dev
   ```

3. **TypeScript Errors**
   ```bash
   # Check TypeScript configuration
   npx tsc --noEmit
   ```

4. **Build Failures**
   ```bash
   # Check for unused imports
   npm run lint
   
   # Fix ESLint issues
   npm run lint -- --fix
   ```

### Development Tips

- Use React Developer Tools browser extension
- Enable source maps for easier debugging
- Use the Vite development server for hot module replacement
- Configure your editor with TypeScript and ESLint extensions
- Use the browser's Network tab to debug API calls

## Integration with Backend

### API Configuration

The dashboard connects to the FLAT backend API:

```typescript
// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
```

### Authentication Flow

1. **Login**: POST to `/api/v1/auth/login`
2. **Token Storage**: JWT stored in localStorage
3. **Token Refresh**: Automatic refresh before expiry
4. **Logout**: Token blacklisted on backend

### Real-time Features

- **WebSocket**: For notifications and updates
- **Server-Sent Events**: For dashboard metrics
- **Polling**: Fallback for older browsers

## Contributing

### Development Workflow

1. Create feature branch from `dev`
   ```bash
   git checkout -b feature/FLAT-XXX-description
   ```

2. Make changes following code standards:
   - TypeScript for all new code
   - ESLint rules must pass
   - Components must have tests
   - Follow existing patterns

3. Run quality checks:
   ```bash
   npm run lint
   npm run type-check
   npm test
   npm run build
   ```

4. Commit with conventional format:
   ```bash
   git commit -m "feat(dashboard): add user profile [FLAT-123]"
   ```

5. Create PR to `dev` branch

## Performance Optimization

### Build Optimizations

- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Remove unused code
- **Minification**: Terser for production builds
- **Compression**: Gzip/Brotli in production
- **Asset Optimization**: Image compression

### Runtime Performance

- **React.memo**: Prevent unnecessary re-renders
- **useMemo/useCallback**: Optimize expensive operations
- **Virtual Scrolling**: For large lists
- **Lazy Loading**: Components and images
- **Service Worker**: Offline support (PWA)

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

## Support

- **Documentation**: Check main project `/docs`
- **API Reference**: http://localhost:8000/docs
- **Issues**: GitHub Issues in main repo
- **Team Contact**: team.software@factosquare.com

## License

This project is proprietary software developed by Factosquare.