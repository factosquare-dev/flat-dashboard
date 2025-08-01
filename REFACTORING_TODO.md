# Dashboard Refactoring TODO List

## 🚨 Critical Priority (Must Fix Immediately) ✅ COMPLETED

### 1. Massive Code Duplication Issue ✅
- [x] **Remove duplicate `/src/lib/` folder structure**
  - [x] Merge `/src/lib/hooks/` with `/src/hooks/`
  - [x] Merge `/src/lib/utils/` with `/src/utils/`
  - [x] Merge `/src/lib/types/` with `/src/types/`
  - [x] Merge `/src/lib/services/` with `/src/services/`
  - [x] Merge `/src/lib/constants/` with `/src/constants/`
  - [x] Update all imports after consolidation
  - **Result**: Removed 248 duplicate files, lib folder completely eliminated

### 2. Consolidate Multiple Utils/Hooks Directories ✅
- [x] **Create unified utils structure**
  - [x] `/src/utils/` (main utils)
    - [x] `/src/utils/customer/` (CustomerModal utils)
    - [x] `/src/utils/schedule/` (Schedule component utils)
    - [x] `/src/utils/store/` (store utils)
    - [x] `/src/utils/gantt/` (already existed, removed duplicates)
  - [x] Remove scattered utils folders from:
    - [x] `/src/store/utils/`
    - [x] `/src/components/Schedule/utils/`
    - [x] `/src/components/CustomerModal/utils/`
    - [x] `/src/components/GanttChart/utils/`
  - **Result**: All utils consolidated under main utils directory

### 3. Form Component Duplication ✅
- [x] **Unify form components**
  - [x] Create single `/src/components/forms/` directory
  - [x] Remove duplicates from:
    - [x] `/src/components/Form/`
    - [x] `/src/components/common/Form*`
    - [x] `/src/components/Factories/components/FormField`
  - [x] Standardize FormField, FormInput, FormSelect, FormTextarea
  - [x] Update all imports to use unified forms
  - **Result**: All form components consolidated in one location

## 📊 High Priority (Architecture & Maintainability)

### 4. Separation of Concerns
- [ ] **Extract business logic from UI components**
  - [ ] `/src/components/ProjectModal/index.tsx` - Move mock data generation to services
  - [ ] `/src/features/projects/components/ProjectTableSection.tsx` - Extract data transformation logic
  - [ ] Create custom hooks for API calls instead of direct imports in components

### 5. Split Large Files
- [ ] **Break down large components (300+ lines)**
  - [ ] `ProjectTableSection.tsx` (406 lines) → Split into:
    - [ ] `ProjectTableData.tsx` (data logic)
    - [ ] `ProjectTableUI.tsx` (rendering)
    - [ ] `useProjectTableHandlers.ts` (interaction handlers)
  - [ ] `FormField.tsx` (394 lines) → Split by field type
  - [ ] `TaskCreateModal.tsx` (358 lines) → Decompose into smaller components

### 6. Create Proper Enum Usage
- [ ] **Replace string literals with enums**
  - [ ] Button variants: Create `ButtonVariant` enum
  - [ ] Modal sizes: Create `ModalSize` enum
  - [ ] Validation message types: Create `ValidationMessageType` enum
  - [ ] Component states: Create appropriate state enums

## 🔧 Medium Priority (Code Quality)

### 7. Standardize Component Patterns
- [ ] **Establish consistent folder structure**
  - [ ] All components should follow: `ComponentName/index.tsx` pattern
  - [ ] Create style guide for component organization
  - [ ] Fix inconsistent index file usage

### 8. Fix Import Patterns
- [ ] **Standardize imports**
  - [ ] Use absolute imports with `@/` prefix
  - [ ] Fix relative import depths
  - [ ] Consistent named vs default exports
  - [ ] Resolve circular dependencies

### 9. Extract Magic Numbers/Strings
- [ ] **Create constants files**
  - [ ] Grid calculation constants
  - [ ] Timeout/delay constants
  - [ ] API endpoint constants
  - [ ] CSS/styling constants

## 🎯 Low Priority (Polish & Optimization)

### 10. Improve Error Boundaries
- [ ] Standardize error boundary usage
- [ ] Create specialized error boundaries for different sections
- [ ] Improve error messages and fallback UI

### 11. Optimize Bundle Size
- [ ] Review lazy loading implementation
- [ ] Check for unused dependencies
- [ ] Implement code splitting for large features

### 12. Type Safety Improvements
- [ ] Remove `any` types where possible
- [ ] Add proper types for API responses
- [ ] Improve generic type usage

## 📝 Implementation Strategy

1. **Phase 1**: Fix critical duplication (1-3 weeks)
   - Remove `/src/lib/` duplication
   - Consolidate utils/hooks
   - Fix form components

2. **Phase 2**: Architecture improvements (2-3 weeks)
   - Separation of concerns
   - Split large files
   - Implement proper enums

3. **Phase 3**: Standardization (1-2 weeks)
   - Component patterns
   - Import patterns
   - Extract magic numbers

4. **Phase 4**: Polish (ongoing)
   - Error handling
   - Performance optimization
   - Type safety

## 🎯 Success Metrics

- [ ] Reduce codebase size by ~40% (remove duplication)
- [ ] No component file larger than 250 lines
- [ ] 100% enum usage for known string literals
- [ ] Consistent folder structure across all features
- [ ] Zero circular dependencies
- [ ] All business logic in services/hooks layer

## 🔍 Code Duplication Examples

### Exact Duplicates Found:
- `/src/hooks/common/useFormValidation.ts` ↔ `/src/lib/hooks/common/useFormValidation.ts` (186 lines)
- `/src/utils/common.ts` ↔ `/src/lib/utils/common.ts`
- `/src/constants/` ↔ `/src/lib/constants/` (entire folder)
- `/src/types/` ↔ `/src/lib/types/` (entire folder)

### Similar Components (Need Consolidation):
- Multiple ErrorBoundary implementations
- Multiple Modal implementations
- Multiple Table components
- Multiple Loading state components

## 📋 Notes

- Consider using a migration script for import updates after consolidation
- Create a style guide document for future development
- Set up ESLint rules to enforce new patterns
- Consider using Storybook for component documentation
- Add pre-commit hooks to prevent future violations