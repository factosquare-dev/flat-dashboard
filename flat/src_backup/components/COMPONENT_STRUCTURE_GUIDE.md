# Component Structure Guidelines

## Folder Structure Standards

### 1. Simple Components (< 100 lines, no sub-components)
Use single `.tsx` file:
```
components/
├── FactorySelectionModal.tsx
├── TaskEditModal.tsx
└── LazyComponents.tsx
```

### 2. Complex Components (multiple files, sub-components, hooks)
Use folder structure with `index.tsx`:
```
components/
├── ProjectModal/
│   ├── index.tsx              # Main component
│   ├── types.ts               # TypeScript types
│   ├── BasicInfoSection.tsx   # Sub-component
│   ├── ProductInfoSection.tsx # Sub-component
│   └── styles.css             # Component styles
```

### 3. Shared/Common Components
Group by category:
```
components/
├── common/        # Shared UI components
├── forms/         # Form-related components
├── ui/            # Basic UI elements
├── loading/       # Loading states
└── providers/     # Context providers
```

## Export Conventions

### Default Exports
- Use for main components in `index.tsx`
- Example: `export default ProjectModal`

### Named Exports
- Use for utilities, types, and sub-components
- Example: `export { ProjectModalProps, ProjectData }`

## Import Conventions

### Absolute Imports
Always use `@/` prefix for src directory imports:
```typescript
import { Button } from '@/components/ui/Button'
import { useProjects } from '@/hooks/useProjects'
```

### Relative Imports
Only use for same-directory or direct sub-component imports:
```typescript
import BasicInfoSection from './BasicInfoSection'
import { ProjectModalProps } from './types'
```

## File Naming Conventions

- Components: PascalCase (e.g., `ProjectModal.tsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useProjectData.ts`)
- Types: camelCase (e.g., `types.ts`)
- Utilities: camelCase (e.g., `helpers.ts`)
- Constants: UPPER_CASE (e.g., `constants.ts`)

## Decision Matrix

| Component Characteristic | Structure to Use |
|-------------------------|------------------|
| Single file, < 100 lines | Direct .tsx file |
| Multiple files needed | Folder/index.tsx |
| Reusable across features | common/ folder |
| Form-specific | forms/ folder |
| Basic UI element | ui/ folder |
| Business domain specific | Feature folder |

## Migration Checklist

When refactoring existing components:

1. [ ] Remove any hybrid patterns (both .tsx and folder)
2. [ ] Update all imports to use new paths
3. [ ] Ensure consistent export strategy
4. [ ] Add TypeScript types file if needed
5. [ ] Move styles to component folder
6. [ ] Update related tests

## Examples

### Simple Component
```typescript
// components/ConfirmDialog.tsx
import React from 'react'
import { Button } from '@/components/ui/Button'

export interface ConfirmDialogProps {
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ onConfirm, onCancel }) => {
  return (
    <div>
      <Button onClick={onConfirm}>Confirm</Button>
      <Button onClick={onCancel}>Cancel</Button>
    </div>
  )
}

export default ConfirmDialog
```

### Complex Component
```typescript
// components/ProjectModal/index.tsx
import React from 'react'
import BasicInfoSection from './BasicInfoSection'
import { ProjectModalProps } from './types'
import './styles.css'

const ProjectModal: React.FC<ProjectModalProps> = (props) => {
  // Component logic
}

export default ProjectModal
```