import type { WorkflowState, WorkflowAction } from './types';
import { initialWorkflowState } from './constants';

export const workflowReducer = (state: WorkflowState, action: WorkflowAction): WorkflowState => {
  switch (action.type) {
    case 'SET_FACTORY':
      return { ...state, selectedFactory: action.payload };
    case 'SET_TASK':
      return { ...state, selectedTask: action.payload };
    case 'SET_START_DATE':
      return { ...state, startDate: action.payload };
    case 'SET_END_DATE':
      return { ...state, endDate: action.payload };
    case 'SET_SHOW_TASK_SELECTION':
      return { ...state, showTaskSelection: action.payload };
    case 'SET_SHOW_TASK_DROPDOWN':
      return { ...state, showTaskDropdown: action.payload };
    case 'SET_SHOW_DATE_PICKER':
      return { ...state, showDatePicker: action.payload };
    case 'SET_DATE_PICKER_TYPE':
      return { ...state, datePickerType: action.payload };
    case 'INITIALIZE_QUICK_ADD':
      return {
        ...state,
        selectedFactory: action.payload.factory,
        startDate: action.payload.date,
        endDate: action.payload.date,
        showTaskSelection: true,
      };
    case 'RESET_FORM':
      return initialWorkflowState;
    default:
      return state;
  }
};