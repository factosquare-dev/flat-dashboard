import React from 'react';
import { ArrowLeft, Table2, Calendar } from 'lucide-react';

interface ScheduleHeaderProps {
  onBack?: () => void;
  projectName?: string;
  onToggleTableView?: () => void;
  isTableView?: boolean;
}

const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
  onBack,
  projectName,
  onToggleTableView,
  isTableView = false
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
        {onToggleTableView && (
          <>
            {!isTableView ? (
              <button
                onClick={onToggleTableView}
                className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 rounded-md border border-gray-200 transition-all hover:shadow-sm flex items-center gap-2 text-sm"
                title="테이블 뷰로 전환"
              >
                <Table2 className="w-4 h-4" />
                <span className="font-medium">테이블 뷰</span>
              </button>
            ) : (
              <div className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-md border border-gray-200 flex items-center gap-2 text-sm cursor-not-allowed opacity-50">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">간트차트 뷰 (비활성화)</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ScheduleHeader;