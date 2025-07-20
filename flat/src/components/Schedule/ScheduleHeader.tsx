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
    <div className="flex items-center justify-between">
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
      </div>
    </div>
  );
};

export default ScheduleHeader;