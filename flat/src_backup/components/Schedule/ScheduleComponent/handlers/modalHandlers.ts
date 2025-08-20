import type { ScheduleFactory } from '@/types/schedule';

interface ModalState {
  showTaskEditModal?: boolean;
  selectedTask?: any;
  showTaskModal?: boolean;
  selectedFactoryId?: string | null;
  selectedDate?: string | null;
  showProductRequestModal?: boolean;
  showWorkflowModal?: boolean;
  showEmailModal?: boolean;
  selectedFactories?: string[];
}

type SetModalState = React.Dispatch<React.SetStateAction<ModalState>>;

export const createModalHandlers = (
  projects: ScheduleFactory[],
  selectedProjects: string[],
  setModalState: SetModalState
) => {
  const handleAddProject = () => {
    setModalState(prev => ({ ...prev, showProductRequestModal: true }));
  };

  const handleOpenWorkflow = () => {
    setModalState(prev => ({ ...prev, showWorkflowModal: true }));
  };

  const handleOpenEmail = () => {
    const selectedFactories = selectedProjects.length > 0 
      ? projects.reduce((factories, p) => {
          if (selectedProjects.includes(p.id)) {
            factories.push(p.name);
          }
          return factories;
        }, [] as string[])
      : []; // 선택된 것이 없으면 빈 배열로 설정
    setModalState(prev => ({ 
      ...prev, 
      showEmailModal: true, 
      selectedFactories 
    }));
  };

  const handleAddTask = () => {
    setModalState(prev => ({ ...prev, showTaskModal: true }));
  };

  return {
    handleAddProject,
    handleOpenWorkflow,
    handleOpenEmail,
    handleAddTask
  };
};