/**
 * TASK 체크리스트 관련 enums
 * MASTER 프로젝트의 표준 TASK 체크리스트 항목들
 */

// TASK 체크리스트 항목 enum
export enum TaskChecklistItem {
  REVIEW_REQUEST = 'REVIEW_REQUEST',           // 제품개발의뢰서 검토
  MEETING_REQUEST = 'MEETING_REQUEST',         // 제품개발의뢰서 미팅
  SAMPLE_REQUEST = 'SAMPLE_REQUEST',           // 샘플의뢰
  SAMPLE_CONFIRM = 'SAMPLE_CONFIRM',           // 샘플확정
  CT_REQUEST = 'CT_REQUEST',                   // CT 의뢰
  CT_CONFIRM = 'CT_CONFIRM',                   // CT 확정
  LABEL_TEXT = 'LABEL_TEXT',                   // 표시문구
  DESIGN = 'DESIGN',                           // 디자인
  CONTAINER_ORDER = 'CONTAINER_ORDER',         // 용기 발주
  CONTAINER_RECEIVE = 'CONTAINER_RECEIVE',     // 용기 입고
  CONTENT_ORDER = 'CONTENT_ORDER',             // 내용물 발주
  MATERIAL_ORDER = 'MATERIAL_ORDER',           // 원료 발주
  PACKAGING_SPEC = 'PACKAGING_SPEC',           // 포장사양서
  PRODUCTION_SCHEDULE = 'PRODUCTION_SCHEDULE', // 생산일정
  CERTIFICATION = 'CERTIFICATION',             // 인증/인허가
  FINAL_CONFIRM = 'FINAL_CONFIRM',             // 최종 확인
}

// TASK 체크리스트 한글 라벨
export const TaskChecklistLabel: Record<TaskChecklistItem, string> = {
  [TaskChecklistItem.REVIEW_REQUEST]: '제품개발의뢰서 검토',
  [TaskChecklistItem.MEETING_REQUEST]: '제품개발의뢰서 미팅',
  [TaskChecklistItem.SAMPLE_REQUEST]: '샘플의뢰',
  [TaskChecklistItem.SAMPLE_CONFIRM]: '샘플확정',
  [TaskChecklistItem.CT_REQUEST]: 'CT 의뢰',
  [TaskChecklistItem.CT_CONFIRM]: 'CT 확정',
  [TaskChecklistItem.LABEL_TEXT]: '표시문구',
  [TaskChecklistItem.DESIGN]: '디자인',
  [TaskChecklistItem.CONTAINER_ORDER]: '용기 발주',
  [TaskChecklistItem.CONTAINER_RECEIVE]: '용기 입고',
  [TaskChecklistItem.CONTENT_ORDER]: '내용물 발주',
  [TaskChecklistItem.MATERIAL_ORDER]: '원료 발주',
  [TaskChecklistItem.PACKAGING_SPEC]: '포장사양서',
  [TaskChecklistItem.PRODUCTION_SCHEDULE]: '생산일정',
  [TaskChecklistItem.CERTIFICATION]: '인증/인허가',
  [TaskChecklistItem.FINAL_CONFIRM]: '최종 확인',
};

// TASK 체크리스트 짧은 라벨
export const TaskChecklistShortLabel: Record<TaskChecklistItem, string> = {
  [TaskChecklistItem.REVIEW_REQUEST]: '의뢰검토',
  [TaskChecklistItem.MEETING_REQUEST]: '의뢰미팅',
  [TaskChecklistItem.SAMPLE_REQUEST]: '샘플의뢰',
  [TaskChecklistItem.SAMPLE_CONFIRM]: '샘플확정',
  [TaskChecklistItem.CT_REQUEST]: 'CT의뢰',
  [TaskChecklistItem.CT_CONFIRM]: 'CT확정',
  [TaskChecklistItem.LABEL_TEXT]: '표시문구',
  [TaskChecklistItem.DESIGN]: '디자인',
  [TaskChecklistItem.CONTAINER_ORDER]: '용기발주',
  [TaskChecklistItem.CONTAINER_RECEIVE]: '용기입고',
  [TaskChecklistItem.CONTENT_ORDER]: '내용물',
  [TaskChecklistItem.MATERIAL_ORDER]: '원료발주',
  [TaskChecklistItem.PACKAGING_SPEC]: '포장사양',
  [TaskChecklistItem.PRODUCTION_SCHEDULE]: '생산일정',
  [TaskChecklistItem.CERTIFICATION]: '인증인허',
  [TaskChecklistItem.FINAL_CONFIRM]: '최종확인',
};

// TASK 체크리스트 순서
export const TaskChecklistOrder: TaskChecklistItem[] = [
  TaskChecklistItem.REVIEW_REQUEST,
  TaskChecklistItem.MEETING_REQUEST,
  TaskChecklistItem.SAMPLE_REQUEST,
  TaskChecklistItem.SAMPLE_CONFIRM,
  TaskChecklistItem.CT_REQUEST,
  TaskChecklistItem.CT_CONFIRM,
  TaskChecklistItem.LABEL_TEXT,
  TaskChecklistItem.DESIGN,
  TaskChecklistItem.CONTAINER_ORDER,
  TaskChecklistItem.CONTAINER_RECEIVE,
  TaskChecklistItem.CONTENT_ORDER,
  TaskChecklistItem.MATERIAL_ORDER,
  TaskChecklistItem.PACKAGING_SPEC,
  TaskChecklistItem.PRODUCTION_SCHEDULE,
  TaskChecklistItem.CERTIFICATION,
  TaskChecklistItem.FINAL_CONFIRM,
];