# Task-Centric Architecture Migration Plan (Dashboard Only)

## 📋 Overview
Dashboard를 Factory 중심에서 Task 중심 구조로 변경하는 Breaking Change 마이그레이션 계획

## 🎯 핵심 변경사항

### 1. Task 타입 변경

#### 현재 구조 (Factory-Centric)
```typescript
// src/types/schedule.ts
interface Task {
  factoryId?: FactoryId;        // 단일 공장
  factory?: string;              // 단일 공장 이름
}
```

#### 변경 후 구조 (Task-Centric)
```typescript
// src/types/schedule.ts
interface Task {
  factoryId?: FactoryId;         // 기존 호환성 유지 (primary factory)
  factory?: string;               // 기존 호환성 유지 (primary factory name)
  
  // 새로운 필드 추가
  factoryAssignments?: FactoryAssignment[];  // 다중 공장 지원
}

interface FactoryAssignment {
  factoryId: FactoryId;
  factoryName: string;
  role?: 'primary' | 'secondary' | 'sample';
  status?: TaskStatus;           // 공장별 개별 상태
  progress?: number;              // 공장별 개별 진행률
  completedAt?: Date;
  notes?: string;
}
```

### 2. 실제 사용 시나리오

#### 샘플 제작 Task (여러 공장 참여)
```typescript
{
  id: 'task-1',
  title: '시제품 제작',
  type: TaskType.PROTOTYPING,
  status: TaskStatus.IN_PROGRESS,
  
  // 3개 공장이 동시에 샘플 제작
  factoryAssignments: [
    {
      factoryId: 'factory-1',
      factoryName: '제조공장 A',
      role: 'sample',
      status: TaskStatus.COMPLETED,
      progress: 100,
      notes: '샘플 A 완료'
    },
    {
      factoryId: 'factory-2',
      factoryName: '제조공장 B',
      role: 'sample',
      status: TaskStatus.IN_PROGRESS,
      progress: 60
    },
    {
      factoryId: 'factory-3',
      factoryName: '제조공장 C',
      role: 'sample',
      status: TaskStatus.PENDING,
      progress: 0
    }
  ]
}
```

## 📁 수정 대상 파일 목록

### Phase 1: 타입 정의 및 데이터 구조
1. **`/src/types/schedule.ts`**
   - `FactoryAssignment` 인터페이스 추가
   - `Task` 인터페이스에 `factoryAssignments` 필드 추가

### Phase 2: Mock 데이터 생성 로직
2. **`/src/mocks/database/seedTasks.ts`**
   - Task 생성 로직을 Factory 중심에서 Task 중심으로 변경
   - 모든 Task Type을 먼저 생성 후 Factory 할당

3. **`/src/mocks/database/seeders/tasks/taskTemplates.ts`**
   - 기존 템플릿 구조 유지 (변경 최소화)

### Phase 3: 서비스 레이어
4. **`/src/services/mockData/taskService.ts`**
   - `assignFactoryToTask()` 메서드 추가
   - `removeFactoryFromTask()` 메서드 추가
   - `updateFactoryAssignment()` 메서드 추가

### Phase 4: UI 컴포넌트 - 표시
5. **`/src/components/Schedule/components/TaskItem.tsx`**
   - 다중 공장 배지 표시
   - 공장별 상태 표시

6. **`/src/features/projects/components/ProjectTableRow/cellRenderers/CurrentStageCell.tsx`**
   - Task에 참여하는 공장 수 표시
   - 예: "시제품 제작 (3개 공장)"

### Phase 5: UI 컴포넌트 - 생성/수정
7. **`/src/components/TaskCreateModal/index.tsx`**
   - 다중 공장 선택 UI 추가
   - 공장별 역할 설정

8. **`/src/components/TaskEditModal.tsx`**
   - 공장 추가/제거 기능
   - 공장별 상태 업데이트

## 🔄 데이터 마이그레이션 로직

### MockDB 시드 데이터 변경
```typescript
// 현재: Factory가 Task를 생성
function createTasksForProject(project) {
  if (project.manufacturerId) {
    // 제조 공장의 tasks 생성
    const manufacturingTasks = getTaskTemplatesByFactoryType(FactoryType.MANUFACTURING);
    tasks.push(...manufacturingTasks);
  }
  if (project.containerId) {
    // 용기 공장의 tasks 생성
    const containerTasks = getTaskTemplatesByFactoryType(FactoryType.CONTAINER);
    tasks.push(...containerTasks);
  }
}

// 변경 후: 모든 Task를 생성하고 Factory 할당
function createTasksForProject(project) {
  // 1. 모든 Task Type 생성
  const allTaskTemplates = [
    ...manufacturingTaskTemplates,
    ...containerTaskTemplates,
    ...packagingTaskTemplates
  ];
  
  // 2. Task 생성
  const tasks = allTaskTemplates.map(template => createTask(template));
  
  // 3. Factory 할당
  tasks.forEach(task => {
    // 샘플 제작은 여러 공장 할당
    if (task.type === TaskType.PROTOTYPING && project.manufacturerId) {
      task.factoryAssignments = [
        { factoryId: project.manufacturerId, role: 'sample' },
        { factoryId: 'factory-alt-1', role: 'sample' },
        { factoryId: 'factory-alt-2', role: 'sample' }
      ];
    }
    // 일반 작업은 단일 공장
    else {
      task.factoryAssignments = [
        { factoryId: project.manufacturerId, role: 'primary' }
      ];
    }
  });
  
  return tasks;
}
```

## 🎨 UI 변경사항

### 1. Task 아이템 표시
```tsx
// 현재: 단일 공장
<div className="task-factory">
  {task.factory && <Badge>{task.factory}</Badge>}
</div>

// 변경 후: 다중 공장
<div className="task-factories">
  {task.factoryAssignments?.map(fa => (
    <Badge 
      key={fa.factoryId}
      variant={fa.status === 'COMPLETED' ? 'success' : 'default'}
    >
      {fa.factoryName}
      {fa.role === 'sample' && ' (샘플)'}
      {fa.progress !== undefined && ` ${fa.progress}%`}
    </Badge>
  ))}
</div>
```

### 2. 진행 단계 표시
```tsx
// Task에 참여 중인 공장 수 표시
const factoryCount = task.factoryAssignments?.length || 1;
const isMultiFactory = factoryCount > 1;

<span className="stage-badge">
  {task.title}
  {isMultiFactory && (
    <span className="factory-count">
      ({factoryCount}개 공장)
    </span>
  )}
</span>
```

## ⚠️ 주의사항

### 1. 기존 호환성 유지
- `factoryId`와 `factory` 필드는 **유지** (primary factory로 사용)
- 기존 코드가 깨지지 않도록 모든 새 필드는 **optional**
- `factoryAssignments`가 없으면 `factoryId` 사용하도록 fallback 처리

### 2. 점진적 마이그레이션
```typescript
// 호환성 유지 코드
function getTaskFactories(task: Task): FactoryAssignment[] {
  // 새 구조 우선
  if (task.factoryAssignments?.length) {
    return task.factoryAssignments;
  }
  
  // 기존 구조 fallback
  if (task.factoryId) {
    return [{
      factoryId: task.factoryId,
      factoryName: task.factory || 'Unknown',
      role: 'primary'
    }];
  }
  
  return [];
}
```

### 3. Backend 독립성
- **Dashboard의 MockDB와 UI만 수정**
- 실제 Backend API 변경 없음
- Backend 대응은 별도 진행

## 📈 예상 영향도

### 긍정적 영향
1. **유연성 증가**: 하나의 Task에 여러 공장 할당 가능
2. **현실 반영**: 실제 업무 프로세스 (샘플 비교 등) 정확히 표현
3. **확장성**: 향후 복잡한 협업 시나리오 지원 가능

### 리스크
1. **UI 복잡도 증가**: 다중 공장 표시로 인한 화면 복잡도
2. **성능**: 많은 Factory Assignment 처리 시 렌더링 성능
3. **사용자 학습**: 새로운 구조에 대한 이해 필요

## 🚀 구현 순서

1. **Phase 1**: 타입 정의 (30분)
2. **Phase 2**: MockDB 시드 데이터 수정 (1시간)
3. **Phase 3**: 서비스 레이어 메서드 추가 (30분)
4. **Phase 4**: UI 읽기 전용 컴포넌트 수정 (1시간)
5. **Phase 5**: UI 생성/수정 컴포넌트 수정 (1시간)
6. **Phase 6**: 테스트 및 디버깅 (30분)

**예상 총 소요시간**: 4시간

## 📝 체크리스트

- [ ] Task 타입에 factoryAssignments 필드 추가
- [ ] FactoryAssignment 인터페이스 정의
- [ ] seedTasks.ts에서 Task 중심 생성 로직 구현
- [ ] TaskService에 Factory 할당 메서드 추가
- [ ] TaskItem 컴포넌트 다중 공장 표시
- [ ] CurrentStageCell 공장 수 표시
- [ ] TaskCreateModal 다중 공장 선택
- [ ] TaskEditModal 공장 관리 기능
- [ ] 기존 코드 호환성 테스트
- [ ] 전체 통합 테스트