# Component Style Guide for FLAT Dashboard

## 📁 Folder Structure

### ✅ Recommended Structure

All components should follow the folder-based structure with an `index.tsx` file:

```
ComponentName/
├── index.tsx           # Main component file
├── types.ts           # TypeScript types (if needed)
├── styles.css         # Component-specific styles (if needed)
├── utils.ts           # Component-specific utilities (if needed)
└── __tests__/         # Component tests
    └── ComponentName.test.tsx
```

### Example

```
Button/
├── index.tsx
├── types.ts
└── Button.css
```

### ❌ Avoid

- Single file components: `Button.tsx`
- Mixed structures: Having both `ComponentName.tsx` and `index.tsx` in the same folder

## 🎯 Naming Conventions

### Components
- Use PascalCase: `UserProfile`, `ProjectModal`
- Be descriptive: `ProjectTableSection` instead of `Table`
- Suffix with component type when appropriate: `UserListContainer`, `ProjectDetailsModal`

### Files
- Component files: `index.tsx`
- Type definitions: `types.ts`
- Utilities: `utils.ts` or `{ComponentName}.utils.ts`
- Styles: `{ComponentName}.css` or `styles.css`
- Tests: `{ComponentName}.test.tsx`

### Props Interfaces
- Name props interfaces as `{ComponentName}Props`
- Export from the component file or `types.ts`

```typescript
// Good
interface ButtonProps {
  variant: ButtonVariant;
  size: ButtonSize;
  onClick: () => void;
}

// Bad
interface Props {  // Too generic
  // ...
}
```

## 📦 Imports and Exports

### Import Order
1. React and third-party libraries
2. Types and interfaces
3. Utils and services
4. Hooks
5. Components
6. Styles
7. Assets

```typescript
// Good
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Project } from '@/types/project';
import { formatDate } from '@/utils/date';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/Button';
import './ProjectCard.css';
```

### Absolute Imports
Always use absolute imports with `@/` prefix:

```typescript
// Good
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';

// Bad
import { Button } from '../../../components/Button';
import { useAuth } from '../../hooks/useAuth';
```

### Default vs Named Exports
- Use default exports for components
- Use named exports for utilities, types, and hooks

```typescript
// Component (default export)
const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  // ...
};
export default Button;

// Types and utils (named exports)
export interface ButtonProps { /* ... */ }
export const buttonUtils = { /* ... */ };
```

## 🏗️ Component Structure

### Function Components
Always use function components with TypeScript:

```typescript
// Good
const ComponentName: React.FC<ComponentNameProps> = ({ prop1, prop2 }) => {
  // Component logic
  return <div>...</div>;
};

// With memo
const ComponentName = React.memo<ComponentNameProps>(({ prop1, prop2 }) => {
  // Component logic
  return <div>...</div>;
});
```

### Component Organization
1. Type definitions/imports
2. Component declaration
3. State and refs
4. Effects
5. Event handlers
6. Helper functions
7. Render logic

```typescript
const MyComponent: React.FC<MyComponentProps> = ({ data, onUpdate }) => {
  // 1. State and refs
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 2. Effects
  useEffect(() => {
    // Effect logic
  }, [dependency]);

  // 3. Event handlers
  const handleClick = useCallback(() => {
    // Handler logic
  }, [dependency]);

  // 4. Helper functions
  const formatData = (item: DataItem) => {
    // Helper logic
  };

  // 5. Render logic
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};
```

## 🎨 Styling

### CSS Modules or Plain CSS
- Use CSS modules for component-specific styles
- Use global styles sparingly
- Follow BEM naming convention for class names

```css
/* Button.css */
.button {
  /* Base styles */
}

.button--primary {
  /* Variant styles */
}

.button__icon {
  /* Child element styles */
}
```

### Tailwind Classes
- Use Tailwind for utility classes
- Extract repeated patterns into component classes

```typescript
// Good - extracted into CSS class
<button className="btn-primary">Click me</button>

// Acceptable for one-off styles
<div className="mt-4 p-2 border rounded">Content</div>
```

## 📝 TypeScript

### Props Interface
Always define props interfaces:

```typescript
interface ComponentProps {
  // Required props
  title: string;
  onSubmit: (data: FormData) => void;
  
  // Optional props
  description?: string;
  isDisabled?: boolean;
  
  // With defaults
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}
```

### Use Enums for Constants
Replace string literals with enums:

```typescript
// Good
import { ButtonVariant, ModalSize } from '@/types/enums';

<Button variant={ButtonVariant.PRIMARY} />
<Modal size={ModalSize.LARGE} />

// Bad
<Button variant="primary" />
<Modal size="large" />
```

## 🧪 Testing

### Test File Location
Place tests in a `__tests__` folder within the component directory:

```
Button/
├── index.tsx
└── __tests__/
    └── Button.test.tsx
```

### Test Structure
```typescript
describe('Button', () => {
  it('should render correctly', () => {
    // Test implementation
  });

  it('should handle click events', () => {
    // Test implementation
  });
});
```

## 📚 Documentation

### Component Comments
Add JSDoc comments for complex components:

```typescript
/**
 * ProjectCard displays a summary of project information
 * 
 * @example
 * <ProjectCard
 *   project={projectData}
 *   onEdit={(project) => handleEdit(project)}
 *   isHighlighted={true}
 * />
 */
const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, isHighlighted }) => {
  // ...
};
```

### Props Documentation
Document complex props:

```typescript
interface ProjectCardProps {
  /** The project data to display */
  project: Project;
  
  /** Callback fired when edit button is clicked */
  onEdit: (project: Project) => void;
  
  /** Whether to show highlighted state */
  isHighlighted?: boolean;
}
```

## ✅ Checklist

Before committing a component:

- [ ] Follows folder structure with `index.tsx`
- [ ] Uses TypeScript with proper types
- [ ] Has props interface defined
- [ ] Uses absolute imports with `@/`
- [ ] Follows naming conventions
- [ ] No hardcoded strings (uses enums/constants)
- [ ] Has appropriate error handling
- [ ] Includes tests (for complex components)
- [ ] Is accessible (ARIA labels, keyboard navigation)
- [ ] Is responsive (works on mobile)

## 🚀 Migration Strategy

For existing components:

1. **Phase 1**: Convert single-file components to folder structure
2. **Phase 2**: Update imports to use absolute paths
3. **Phase 3**: Replace string literals with enums
4. **Phase 4**: Add TypeScript types where missing
5. **Phase 5**: Add tests for critical components