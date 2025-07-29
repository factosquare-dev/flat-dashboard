import React from 'react';
import { APP_CONSTANTS } from '../../../../config/constants';
import { formatDate } from '../../../../utils/unifiedDateUtils';

const TableHeader: React.FC = () => {
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
        <th colSpan={headers.length} className="px-4 py-2 text-right">
          <span className="text-xs text-blue-600 font-medium">
            오늘: {todayFormatted}
          </span>
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