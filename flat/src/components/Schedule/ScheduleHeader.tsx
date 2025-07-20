import React from 'react';
import { Plus, FileEdit, Mail, ArrowLeft } from 'lucide-react';

interface ScheduleHeaderProps {
  title?: string;
  onAddProject: () => void;
  onOpenWorkflow: () => void;
  onOpenEmail: () => void;
  onAddTask?: () => void;
  onBack?: () => void;
}

const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
  title,
  onAddProject,
  onOpenWorkflow,
  onOpenEmail,
  onAddTask,
  onBack
}) => {
  return (
    <div className="flex items-center justify-between p-5 bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-sm border border-gray-200 relative z-20">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-200 transition-all hover:shadow-sm flex items-center gap-2 mr-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">뒤로가기</span>
          </button>
        )}
        <button
          onClick={onAddProject}
          className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-200 transition-all hover:shadow-sm flex items-center gap-2"
        >
          <FileEdit className="w-4 h-4" />
          <span className="font-medium">제품의뢰서 편집</span>
        </button>
        <button
          onClick={onOpenEmail}
          className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-200 transition-all hover:shadow-sm flex items-center gap-2"
        >
          <Mail className="w-4 h-4" />
          <span className="font-medium">이메일 보내기</span>
        </button>
      </div>
    </div>
  );
};

export default ScheduleHeader;