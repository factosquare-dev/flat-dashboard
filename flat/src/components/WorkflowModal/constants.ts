import type { WorkflowState } from './types';

export const initialWorkflowState: WorkflowState = {
  selectedFactory: '',
  selectedTask: '',
  startDate: '',
  endDate: '',
  showTaskSelection: false,
  showTaskDropdown: false,
  showDatePicker: false,
  datePickerType: 'start',
};

export const COLOR_LIGHT_CLASS_MAP: { [key: string]: string } = {
  'bg-blue-500': 'bg-blue-50 border-blue-200 hover:border-blue-400',
  'bg-red-500': 'bg-red-50 border-red-200 hover:border-red-400',
  'bg-yellow-500': 'bg-yellow-50 border-yellow-200 hover:border-yellow-400',
  'bg-cyan-500': 'bg-cyan-50 border-cyan-200 hover:border-cyan-400'
};

export const COLOR_DOT_CLASS_MAP: { [key: string]: string } = {
  'bg-blue-500': 'bg-blue-500',
  'bg-red-500': 'bg-red-500',
  'bg-yellow-500': 'bg-yellow-500',
  'bg-cyan-500': 'bg-cyan-500'
};