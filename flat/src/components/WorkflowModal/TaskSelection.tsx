import React from 'react';
import { CheckSquare } from 'lucide-react';
import { useTaskCreation } from '@/shared/hooks/useTasks';

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
  const { getAllFactories, getTaskTypesForFactory } = useTaskCreation();
  return (
    <div className="modal-field-spacing">
      <div className="modal-field-label">
        <CheckSquare />
        태스크 선택
      </div>
      
      <div className="relative">
        <button
          onClick={onToggleDropdown}
          className="modal-button-compact w-full flex items-center justify-between focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none"
        >
          <span className={selectedTask ? "text-gray-900" : "text-gray-500"}>
            {selectedTask || '태스크를 선택하세요'}
          </span>
          <span className="text-gray-400">▼</span>
        </button>
        
        {/* 태스크 드롭다운 */}
        {showTaskDropdown && (
          <div className="modal-dropdown">
            {(() => {
              // selectedFactory가 ID인지 이름인지 확인하여 처리 - 유틸리티 함수 사용
              const factories = getAllFactories();
              const factory = factories.find(f => f.id === selectedFactory) || factories.find(f => f.name === selectedFactory);
              const factoryId = factory?.id || selectedFactory;
              const taskTypes = getTaskTypesForFactory(factoryId);
              return taskTypes.map((task) => (
              <button
                key={task}
                onClick={() => onTaskSelect(task)}
                className="modal-dropdown-item"
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