export interface WorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  factories: Array<{
    name: string;
    color: string;
  }>;
  quickAddData?: { factory: string; date: string } | null;
  onSave?: (data: WorkflowData) => void;
}

export interface WorkflowData {
  factory: string;
  task: string;
  startDate: string;
  endDate: string;
}

export interface WorkflowState {
  selectedFactory: string;
  selectedTask: string;
  startDate: string;
  endDate: string;
  showTaskSelection: boolean;
  showTaskDropdown: boolean;
  showDatePicker: boolean;
  datePickerType: 'start' | 'end';
}

export type WorkflowAction = 
  | { type: 'SET_FACTORY'; payload: string }
  | { type: 'SET_TASK'; payload: string }
  | { type: 'SET_START_DATE'; payload: string }
  | { type: 'SET_END_DATE'; payload: string }
  | { type: 'SET_SHOW_TASK_SELECTION'; payload: boolean }
  | { type: 'SET_SHOW_TASK_DROPDOWN'; payload: boolean }
  | { type: 'SET_SHOW_DATE_PICKER'; payload: boolean }
  | { type: 'SET_DATE_PICKER_TYPE'; payload: 'start' | 'end' }
  | { type: 'INITIALIZE_QUICK_ADD'; payload: { factory: string; date: string } }
  | { type: 'RESET_FORM' };