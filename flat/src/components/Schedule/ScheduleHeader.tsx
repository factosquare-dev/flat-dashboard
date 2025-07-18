import React from 'react';
import { Plus, FileEdit, Mail } from 'lucide-react';

interface ScheduleHeaderProps {
  title?: string;
  onAddProject: () => void;
  onOpenWorkflow: () => void;
  onOpenEmail: () => void;
}

const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
  title,
  onAddProject,
  onOpenWorkflow,
  onOpenEmail
}) => {
  return (
    <div className="flex items-center justify-between mb-4 p-4 bg-white rounded-lg shadow">
      <h1 className="text-3xl font-bold text-gray-800">
        {title || "프로젝트 스케줄 관리"}
      </h1>
      <div className="flex items-center gap-3">
        <button
          onClick={onAddProject}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="icon-sm" />
          프로젝트 추가
        </button>
        <button
          onClick={onOpenWorkflow}
          className="btn btn-secondary flex items-center gap-2"
        >
          <FileEdit className="icon-sm" />
          워크플로우
        </button>
        <button
          onClick={onOpenEmail}
          className="btn btn-secondary flex items-center gap-2"
        >
          <Mail className="icon-sm" />
          이메일
        </button>
      </div>
    </div>
  );
};

export default ScheduleHeader;