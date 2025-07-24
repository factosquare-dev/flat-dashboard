import React from 'react';
import { CheckSquare } from 'lucide-react';
import { mockDataService } from '../../services/mockDataService';

interface TaskSelectionProps {
  selectedFactory: string;
  selectedTask: string;
  showTaskDropdown: boolean;
  onTaskSelect: (task: string) => void;
  onToggleDropdown: () => void;
}

export const TaskSelection: React.FC<TaskSelectionProps> = ({
  selectedFactory,
  selectedTask,
  showTaskDropdown,
  onTaskSelect,
  onToggleDropdown
}) => {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
        <CheckSquare className="w-4 h-4" />
        태스크 선택
      </h3>
      
      <div className="relative">
        <button
          onClick={onToggleDropdown}
          className="w-full py-2 px-3 text-sm bg-white border border-gray-300 rounded-lg hover:border-blue-500 transition-colors flex items-center justify-between focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
        >
          <span className={selectedTask ? "text-gray-900" : "text-gray-500"}>
            {selectedTask || '태스크를 선택하세요'}
          </span>
          <span className="text-gray-400">▼</span>
        </button>
        
        {/* 태스크 드롭다운 */}
        {showTaskDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
            {(() => {
              // selectedFactory가 공장 이름인 경우 factory ID로 변환
              const factories = mockDataService.getAllFactories();
              const factory = factories.find(f => f.name === selectedFactory);
              const factoryId = factory?.id || selectedFactory;
              const taskTypes = mockDataService.getTaskTypesForFactory(factoryId);
              return taskTypes.map((task) => (
              <button
                key={task}
                onClick={() => onTaskSelect(task)}
                className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                {task}
              </button>
            ));
            })()}
          </div>
        )}
      </div>
    </div>
  );
};