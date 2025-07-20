import React from 'react';
import { Plus, FileEdit, Mail, ArrowLeft } from 'lucide-react';

interface ScheduleHeaderProps {
  title?: string;
  onAddProject: () => void;
  onOpenWorkflow: () => void;
  onOpenEmail: () => void;
  onAddTask?: () => void;
  onBack?: () => void;
  projectName?: string;
}

const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
  title,
  onAddProject,
  onOpenWorkflow,
  onOpenEmail,
  onAddTask,
  onBack,
  projectName
}) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-white to-gray-50 rounded-lg shadow-sm border border-gray-200 relative z-20">
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            onClick={onBack}
            className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 rounded-md border border-gray-200 transition-all hover:shadow-sm flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">뒤로</span>
          </button>
        )}
        {projectName && (
          <div className="text-base font-semibold text-gray-800 px-2">
            {projectName}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onAddProject}
          className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 rounded-md border border-gray-200 transition-all hover:shadow-sm flex items-center gap-1 text-sm"
        >
          <FileEdit className="w-4 h-4" />
          <span className="font-medium">의뢰서 편집</span>
        </button>
        <button
          onClick={onOpenEmail}
          className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 rounded-md border border-gray-200 transition-all hover:shadow-sm flex items-center gap-1 text-sm"
        >
          <Mail className="w-4 h-4" />
          <span className="font-medium">메일</span>
        </button>
      </div>
    </div>
  );
};

export default ScheduleHeader;