# State Management Migration: Context to Zustand

## Overview
This directory contains Zustand stores that replace the Context API for state management in the FLAT Dashboard.

## Benefits of Migration
1. **Better Performance**: No unnecessary re-renders
2. **Simpler API**: Less boilerplate code
3. **DevTools Support**: Built-in Redux DevTools integration
4. **TypeScript**: Better type inference
5. **Selective Subscriptions**: Components only re-render when their specific data changes

## Migration Status

### Completed ✅
- [x] Modal Store (`modalStore.ts`)
- [x] App Store (`appStore.ts`)
- [x] Migration utilities
- [x] Compatibility layer

### Pending 🚧
- [ ] Update components to use Zustand directly
- [ ] Remove old Context files
- [ ] Update tests

## Usage

### Before (Context API)
```tsx
import { useAppContext } from '../contexts/AppContext';

const MyComponent = () => {
  const { projects, projectsLoading, onProjectSave } = useAppContext();
  // Component re-renders on ANY context change
};
```

### After (Zustand)
```tsx
import { useAppStore } from '../stores';

const MyComponent = () => {
  // Only re-renders when projects change
  const projects = useAppStore(state => state.projects);
  const projectsLoading = useAppStore(state => state.projectsLoading);
  const saveProject = useAppStore(state => state.saveProject);
};
```

### Alternative (Using selectors)
```tsx
import { useProjectsData } from '../stores';

const MyComponent = () => {
  // Pre-defined selector for common use cases
  const { projects, loading, error } = useProjectsData();
};
```

## Migration Guide

### Step 1: Use Compatibility Layer
For gradual migration, use the compatibility provider:

```tsx
import { AppContextCompatibilityProvider, ModalRenderer } from '../stores';

function App() {
  return (
    <AppContextCompatibilityProvider>
      <YourApp />
      <ModalRenderer />
    </AppContextCompatibilityProvider>
  );
}
```

### Step 2: Update Components
Replace Context hooks with Zustand hooks:

```tsx
// Old
import { useAppContext } from '../contexts/AppContext';
const { projects } = useAppContext();

// New
import { useAppStore } from '../stores';
const projects = useAppStore(state => state.projects);
```

### Step 3: Remove Context Providers
Once all components are migrated, remove Context providers from your app.

## Store Structure

### App Store
- **State**: Projects, customers, tasks, participants, modal states
- **Actions**: CRUD operations, modal controls
- **Selectors**: Pre-defined selectors for common data access patterns

### Modal Store
- **State**: Array of active modals
- **Actions**: Open, close, update modals
- **Features**: Type-safe modal management

## Best Practices

1. **Use Selectors**: Create selectors for derived state
2. **Shallow Comparisons**: Use shallow equality for better performance
3. **Immer**: Use Immer middleware for complex state updates
4. **DevTools**: Use Redux DevTools for debugging

## Performance Tips

```tsx
// ❌ Bad - causes re-render on any store change
const state = useAppStore();

// ✅ Good - only re-renders when projects change
const projects = useAppStore(state => state.projects);

// ✅ Better - multiple values with shallow comparison
const { projects, tasks } = useAppStore(
  state => ({ projects: state.projects, tasks: state.tasks }),
  shallow
);
```

## TypeScript

All stores are fully typed. Use the exported types for consistency:

```tsx
import type { ModalConfig } from '../stores';

interface MyModalProps extends BaseModalProps {
  title: string;
  onConfirm: () => void;
}

const config: ModalConfig<MyModalProps> = {
  id: 'my-modal',
  component: MyModal,
  props: { title: 'Confirm', onConfirm: handleConfirm }
};
```