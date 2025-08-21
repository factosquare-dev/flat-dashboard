import React from 'react';
import { APP_CONSTANTS } from '@/config/constants';
import { formatDate } from '@/shared/utils/unifiedDateUtils';

interface TableHeaderProps {
  onAddFactory?: () => void;
  projectId?: string;
}

const TableHeader: React.FC<TableHeaderProps> = ({ onAddFactory, projectId }) => {
  const today = new Date();
  const todayFormatted = formatDate(today, 'MM/dd', false);
  
  const headers = [
    { key: 'taskName', label: APP_CONSTANTS.TEXT.TASK.NAME },
    { key: 'projectStatus', label: APP_CONSTANTS.TEXT.PROJECT.STATUS },
    { key: 'client', label: APP_CONSTANTS.TEXT.PROJECT.CLIENT },
    { key: 'schedule', label: APP_CONSTANTS.TEXT.TASK.SCHEDULE },
    { key: 'duration', label: APP_CONSTANTS.TEXT.TASK.DURATION },
    { key: 'factories', label: APP_CONSTANTS.TEXT.PROJECT.FACTORIES },
    { key: 'assignee', label: APP_CONSTANTS.TEXT.TASK.ASSIGNEE },
    { key: 'actions', label: APP_CONSTANTS.TEXT.TASK.ACTIONS, align: 'center' as const }
  ];

  return (
    <thead className="bg-gray-50/50">
      <tr role="row">
        <th colSpan={headers.length} className="px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {projectId && onAddFactory && (
                <button
                  onClick={onAddFactory}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs font-medium transition-colors"
                  title="태스크에 공장 할당"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>공장 할당</span>
                </button>
              )}
            </div>
            <span className="text-xs text-blue-600 font-medium">
              오늘: {todayFormatted}
            </span>
          </div>
        </th>
      </tr>
      <tr role="row">
        {headers.map(({ key, label, align }) => (
          <th
            key={key}
            scope="col"
            className={`px-4 py-3 ${align === 'center' ? 'text-center' : 'text-left'}`}
            role="columnheader"
          >
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              {label}
            </span>
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;