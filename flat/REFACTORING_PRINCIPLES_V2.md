# The FLAT Dashboard Refactoring Manifesto

## 🏛️ Architectural Principles

### 1. **The Single Source of Truth (SSOT)**
```typescript
// Every piece of data should have ONE authoritative source
// 모든 데이터는 단 하나의 권위있는 출처를 가져야 한다

// ❌ Bad - Multiple sources of truth
const userRole = localStorage.getItem('role'); // Source 1
const userRole2 = user.role; // Source 2
const userRole3 = '관리자'; // Source 3

// ✅ Good - Single source
const userRole = useUser().role; // ONE source
```

### 2. **The Principle of Least Surprise (POLS)**
```typescript
// Code should behave exactly as expected
// 코드는 예상한 대로 정확히 동작해야 한다

// ❌ Bad - Surprising behavior
const deleteUser = (id) => {
  updateUser(id, { deleted: true }); // Soft delete? Unexpected!
}

// ✅ Good - Expected behavior
const softDeleteUser = (id) => {
  updateUser(id, { deletedAt: new Date() });
}
```

### 3. **Fail Fast, Fail Loud**
```typescript
// Errors should be caught early and clearly
// 오류는 조기에, 명확하게 포착되어야 한다

// ❌ Bad - Silent failure
const getFactory = (id) => {
  return factories.find(f => f.id === id) || {}; // Empty object on failure
}

// ✅ Good - Explicit failure
const getFactory = (id) => {
  const factory = factories.find(f => f.id === id);
  if (!factory) {
    throw new Error(`Factory with id ${id} not found`);
  }
  return factory;
}
```

## 🎯 The SOLID-FLAT Principles

### S - Single Responsibility
**One component, one purpose**
```typescript
// ❌ Bad - Multiple responsibilities
const UserCard = () => {
  // Fetching data
  const [user, setUser] = useState();
  useEffect(() => { fetchUser(); }, []);
  
  // Managing modal state
  const [showModal, setShowModal] = useState(false);
  
  // Handling permissions
  const canEdit = checkPermissions();
  
  return <div>...</div>;
}

// ✅ Good - Single responsibility
const UserCard = ({ user, onEdit }) => {
  return <div>...</div>;
}
```

### O - Open/Closed
**Open for extension, closed for modification**
```typescript
// ✅ Good - Extensible without modification
const BaseModal = ({ variant, ...props }) => {
  const styles = modalStyles[variant] || modalStyles.default;
  return <div className={styles} {...props} />;
}

// Easy to extend
const modalStyles = {
  default: 'modal',
  danger: 'modal modal--danger',
  success: 'modal modal--success',
  // Add new variants without changing BaseModal
}
```

### L - Liskov Substitution
**Components should be interchangeable**
```typescript
// ✅ Good - Any Factory component works the same way
interface FactoryProps {
  factory: Factory;
  onEdit: (factory: Factory) => void;
  onDelete: (id: string) => void;
}

// All factory components follow the same interface
const FactoryCard: React.FC<FactoryProps> = (props) => {...}
const FactoryListItem: React.FC<FactoryProps> = (props) => {...}
const FactoryGridItem: React.FC<FactoryProps> = (props) => {...}
```

### I - Interface Segregation
**Don't force unnecessary dependencies**
```typescript
// ❌ Bad - Too many required props
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void; // What if it's read-only?
  onDelete: () => void; // What if it can't be deleted?
  onShare: () => void; // What if it's not shareable?
}

// ✅ Good - Only essential props required
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  actions?: ModalAction[]; // Optional, extensible
}
```

### D - Dependency Inversion
**Depend on abstractions, not concretions**
```typescript
// ✅ Good - Depend on interfaces
interface DataService {
  getFactories(): Promise<Factory[]>;
  getFactory(id: string): Promise<Factory>;
}

// Easy to swap implementations
const MockDataService: DataService = {...}
const ApiDataService: DataService = {...}
const LocalStorageDataService: DataService = {...}
```

## 📐 The Rule of Three

**"Once is chance, twice is coincidence, three times is a pattern"**

```typescript
// First occurrence - inline
<div className="bg-blue-100 text-blue-700 px-2 py-1 rounded">제조</div>

// Second occurrence - still inline (but take note)
<span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">제조</span>

// Third occurrence - TIME TO REFACTOR!
const FactoryTypeBadge = ({ type }) => {
  const styles = getFactoryTypeStyles(type);
  return <span className={styles}>{FactoryTypeLabel[type]}</span>;
}
```

## 🔄 The Refactoring Decision Matrix

```
┌─────────────────────────────────────────────────────┐
│         HIGH IMPACT                                  │
│    ┌─────────────┬─────────────┐                   │
│    │  CRITICAL   │   QUICK     │                   │
│    │  PRIORITY   │   WINS      │                   │
│    │             │             │                   │
│    │ • Enum      │ • CSS vars  │                   │
│    │ • Type      │ • Component │                   │
│    │   Safety    │   Extract   │                   │
│    ├─────────────┼─────────────┤                   │
│    │  SCHEDULE   │   AVOID     │                   │
│    │  CAREFULLY  │   OR DEFER  │                   │
│    │             │             │                   │
│    │ • Major     │ • Premature │                   │
│    │   Rewrites  │   Optimize  │                   │
│    │ • New Arch  │ • Edge Case │                   │
│    └─────────────┴─────────────┘                   │
│         LOW IMPACT                                   │
│  LOW EFFORT              HIGH EFFORT                 │
└─────────────────────────────────────────────────────┘
```

## 🚀 The Progressive Enhancement Strategy

### Level 1: Type Safety (Foundation)
```typescript
// Start: Loose types
type Factory = any;

// Step 1: Basic types
interface Factory {
  id: string;
  name: string;
  type: string;
}

// Step 2: Enum types
interface Factory {
  id: string;
  name: string;
  type: FactoryType; // Enum
}

// Step 3: Branded types
type FactoryId = string & { __brand: 'FactoryId' };
interface Factory {
  id: FactoryId;
  name: string;
  type: FactoryType;
}
```

### Level 2: Component Architecture
```typescript
// Start: Prop drilling
<App>
  <Dashboard factory={factory} user={user} permissions={permissions}>
    <FactoryList factory={factory} user={user} permissions={permissions}>
      <FactoryCard factory={factory} user={user} permissions={permissions} />

// Step 1: Context
<FactoryProvider>
  <UserProvider>
    <Dashboard>
      <FactoryList>
        <FactoryCard /> // Uses context

// Step 2: Compound Components
<Factory.Provider value={factory}>
  <Factory.Card>
    <Factory.Header />
    <Factory.Body />
    <Factory.Actions />
  </Factory.Card>
</Factory.Provider>
```

### Level 3: State Management
```typescript
// Start: Local state everywhere
const [factories, setFactories] = useState([]);

// Step 1: Centralized state
const factoryStore = useFactoryStore();

// Step 2: Optimistic updates
const updateFactory = (id, updates) => {
  // Optimistic update
  factoryStore.update(id, updates);
  
  // Sync with server
  api.updateFactory(id, updates)
    .catch(() => factoryStore.revert(id));
}

// Step 3: Full sync
const factorySync = new FactorySync({
  local: factoryStore,
  remote: api,
  conflictResolution: 'server-wins'
});
```

## 🛡️ The Safety Checklist

### Before ANY Refactor:
- [ ] **Can I revert this easily?**
- [ ] **Do I understand the current behavior fully?**
- [ ] **Have I identified all dependencies?**
- [ ] **Is there a test I can write first?**

### During Refactor:
- [ ] **Am I making the smallest possible change?**
- [ ] **Am I preserving all existing functionality?**
- [ ] **Am I following established patterns?**
- [ ] **Am I documenting non-obvious decisions?**

### After Refactor:
- [ ] **Does everything still work?**
- [ ] **Is the code more maintainable?**
- [ ] **Would a new developer understand this?**
- [ ] **Have I updated relevant documentation?**

## 🎨 The Style Hierarchy

```
1. Design Tokens (CSS Variables)
   ↓
2. Utility Classes (Tailwind)
   ↓
3. Component Classes (BEM)
   ↓
4. Inline Styles (Last Resort)
```

```css
/* Design Tokens */
:root {
  --color-primary: #3B82F6;
  --spacing-unit: 4px;
  --radius-default: 8px;
}

/* Utility Classes */
.text-primary { color: var(--color-primary); }
.p-4 { padding: calc(var(--spacing-unit) * 4); }

/* Component Classes */
.factory-card {
  border-radius: var(--radius-default);
}

.factory-card__header {
  padding: var(--spacing-unit);
}

/* NEVER inline styles unless dynamic */
style={{ transform: `translateX(${offset}px)` }} // OK - dynamic
style={{ color: 'blue' }} // NOT OK - use class
```

## 📊 The Metrics That Matter

### Code Quality Metrics
- **Type Coverage**: >= 95%
- **Duplicate Code**: < 3%
- **Cyclomatic Complexity**: < 10 per function
- **Component Depth**: < 5 levels

### User Experience Metrics
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Error Rate**: < 0.1%
- **Accessibility Score**: 100

### Developer Experience Metrics
- **Build Time**: < 30s
- **Test Run Time**: < 2min
- **Onboarding Time**: < 1 day
- **Time to First PR**: < 1 week

## 🔥 The Nuclear Options

**When to completely rewrite:**
1. When refactoring would take longer than rewriting
2. When the current code has fundamental architectural flaws
3. When security vulnerabilities cannot be patched
4. When performance cannot be improved incrementally

**How to rewrite safely:**
```typescript
// 1. Strangle Fig Pattern
const FactoryPage = () => {
  const { enableNewVersion } = useFeatureFlags();
  
  if (enableNewVersion) {
    return <FactoryPageV2 />;
  }
  
  return <FactoryPageLegacy />;
}

// 2. Gradual rollout
const rolloutPercentage = 10; // Start with 10% of users
const useNewVersion = userId % 100 < rolloutPercentage;
```

## 🎯 The North Star

**Every refactoring should move us closer to:**

### 1. **Predictability**
"I know exactly what this code will do without running it"

### 2. **Maintainability**
"I can change this code without fear"

### 3. **Testability**
"I can verify this code works correctly"

### 4. **Performance**
"This code runs efficiently at scale"

### 5. **Accessibility**
"Everyone can use this application"

## 📝 The Refactoring Oath

```
I swear to:
- Never break working functionality
- Always leave code better than I found it
- Write code for humans, not computers
- Test before, during, and after changes
- Document the why, not just the what
- Seek simplicity, but not naivety
- Measure twice, refactor once
```

---

**"The best refactoring is the one that makes future refactoring easier."**

*Version 2.0 - The Battle-Tested Edition*