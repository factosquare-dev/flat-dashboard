import React from 'react';
import { APP_CONSTANTS } from '../../../../config/constants';
import { ARIA_LABELS } from '../../../../utils/accessibility';

const TableHeader: React.FC = () => {
  const headers = [
    { key: 'taskName', label: APP_CONSTANTS.TEXT.TASK.NAME },
    { key: 'schedule', label: APP_CONSTANTS.TEXT.TASK.SCHEDULE },
    { key: 'duration', label: APP_CONSTANTS.TEXT.TASK.DURATION },
    { key: 'factory', label: APP_CONSTANTS.TEXT.TASK.FACTORY },
    { key: 'assignee', label: APP_CONSTANTS.TEXT.TASK.ASSIGNEE },
    { key: 'actions', label: APP_CONSTANTS.TEXT.TASK.ACTIONS, align: 'center' as const }
  ];

  return (
    <thead className="bg-gray-50/50">
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