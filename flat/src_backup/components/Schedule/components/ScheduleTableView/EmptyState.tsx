import React from 'react';

const EmptyState: React.FC = () => {
  return (
    <tr>
      <td colSpan={6} className="px-4 py-8 text-center">
        <div className="text-gray-500">
          <div className="text-sm mb-1">등록된 작업이 없습니다</div>
          <div className="text-xs text-gray-400">새로운 작업을 추가해보세요</div>
        </div>
      </td>
    </tr>
  );
};

export default EmptyState;