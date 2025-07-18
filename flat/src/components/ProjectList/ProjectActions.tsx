import React from 'react';
import { Plus, Mail } from 'lucide-react';
import type { Priority, ServiceType, ProjectStatus } from '../../types/project';
import ProjectFilters from './ProjectFilters';

interface ProjectActionsProps {
  selectedPriority: Priority | 'all';
  selectedServiceType: ServiceType | 'all';
  statusFilters: ProjectStatus[];
  onPriorityChange: (priority: Priority | 'all') => void;
  onServiceTypeChange: (serviceType: ServiceType | 'all') => void;
  onStatusFilterToggle: (status: ProjectStatus) => void;
  onCreateProject: () => void;
  onSendEmail: () => void;
}

const ProjectActions: React.FC<ProjectActionsProps> = ({
  selectedPriority,
  selectedServiceType,
  statusFilters,
  onPriorityChange,
  onServiceTypeChange,
  onStatusFilterToggle,
  onCreateProject,
  onSendEmail
}) => {
  return (
    <div className="card mb-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="card-padded">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <ProjectFilters
            selectedPriority={selectedPriority}
            selectedServiceType={selectedServiceType}
            statusFilters={statusFilters}
            onPriorityChange={onPriorityChange}
            onServiceTypeChange={onServiceTypeChange}
            onStatusFilterToggle={onStatusFilterToggle}
          />

          <div className="flex gap-3">
            <button
              onClick={onCreateProject}
              className="btn btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="icon-sm" />
              프로젝트 생성
            </button>
            
            <button
              onClick={onSendEmail}
              className="btn btn-secondary flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <Mail className="icon-sm" />
              메일 보내기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectActions;