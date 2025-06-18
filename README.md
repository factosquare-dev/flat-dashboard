# Flat Dashboard

React-based frontend dashboard for the Flat business management platform.

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
- **Package Manager**: npm

## Project Structure

```
app/
├── public/             # Static assets
│   └── vite.svg       # Vite logo
├── src/
│   ├── assets/        # Images, icons, etc.
│   │   └── react.svg  # React logo
│   ├── components/    # Reusable UI components
│   ├── pages/         # Route components
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API calls and external services
│   ├── utils/         # Utility functions
│   ├── types/         # TypeScript type definitions
│   ├── App.tsx        # Main application component
│   ├── App.css        # Application styles
│   ├── main.tsx       # Application entry point
│   ├── index.css      # Global styles
│   └── vite-env.d.ts  # Vite type definitions
├── docker/            # Docker configurations
├── eslint.config.js   # ESLint configuration
├── tsconfig.json      # TypeScript configuration
├── vite.config.ts     # Vite configuration
└── package.json       # Project dependencies
```

## Environment Setup

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 8+ or yarn 1.22+
- Docker (optional)

### Local Development

1. **Clone the repository**
   ```bash
   git clone git@github.com:FactosquareDev/flat-dashboard.git
   cd flat-dashboard
   ```

2. **Navigate to app directory**
   ```bash
   cd app
   ```

3. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

4. **Environment configuration**
   ```bash
   # Create environment file
   cp .env.example .env
   # Edit .env with your API endpoints and settings
   ```

5. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The application will be available at `http://localhost:5173`

### Docker Development

1. **Using Docker Compose**
   ```bash
   # Development environment
   docker-compose up --build
   
   # The dashboard will be available at http://localhost:3000
   ```

2. **Individual Docker commands**
   ```bash
   # Build development image
   docker build -f docker/dev.Dockerfile -t flat-dashboard-dev .
   
   # Run container
   docker run -p 3000:3000 flat-dashboard-dev
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

In the `app/` directory, you can run:

### Development
```bash
# Start development server with hot reload
npm run dev

# Start development server with custom host
npm run dev -- --host 0.0.0.0 --port 3000
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

### Setup Testing Framework

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom

# Add test script to package.json
"test": "vitest",
"test:ui": "vitest --ui",
"test:coverage": "vitest --coverage"
```

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
src/
├── __tests__/          # Test files
│   ├── components/     # Component tests
│   ├── pages/          # Page tests
│   ├── hooks/          # Hook tests
│   └── utils/          # Utility tests
├── __mocks__/          # Mock files
└── test-utils.tsx      # Test utilities and setup
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

# The built files will be in dist/ directory
```

### Docker Deployment

```bash
# Build production image
docker build -f docker/prod.Dockerfile -t flat-dashboard-prod .

# Run production container
docker run -p 80:80 flat-dashboard-prod
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

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `npm test`
5. Lint your code: `npm run lint`
6. Build the project: `npm run build`
7. Commit your changes: `git commit -m "feat: add new feature"`
8. Push to the branch: `git push origin feature/new-feature`
9. Create a Pull Request

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## License

This project is proprietary software developed by Factosquare.