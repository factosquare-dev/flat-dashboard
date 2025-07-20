import React, { useState } from 'react';
import { X } from 'lucide-react';
import { factories, taskTypesByFactoryType, getFactoryByName } from '../data/factories';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: { factory: string; taskType: string; startDate: string; endDate: string }) => void;
  availableFactories: string[];
  initialDate?: string;
  projectId?: string;
  selectedFactory?: string;
}

const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  availableFactories,
  initialDate,
  projectId,
  selectedFactory
}) => {
  const getToday = () => new Date().toISOString().split('T')[0];
  
  const [factory, setFactory] = useState('');
  const [taskType, setTaskType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // 모달이 열릴 때 날짜 초기화
  React.useEffect(() => {
    if (isOpen) {
      const dateToUse = initialDate || getToday();
      setStartDate(dateToUse);
      setEndDate(dateToUse); // 1일짜리로 설정
    }
  }, [initialDate, isOpen]);
  
  // selectedFactory가 있으면 해당 공장을 자동 선택
  React.useEffect(() => {
    if (selectedFactory && isOpen) {
      setFactory(selectedFactory);
    } else if (projectId && isOpen) {
      const projectFactory = factories.find(f => f.id === projectId);
      if (projectFactory) {
        setFactory(projectFactory.name);
      }
    }
  }, [selectedFactory, projectId, isOpen]);

  // ESC key handler
  React.useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // 사용 가능한 공장 목록 필터링
  const availableFactoryList = availableFactories.length > 0 
    ? factories.filter(f => availableFactories.includes(f.name))
    : factories;

  const currentFactory = getFactoryByName(factory);
  const availableTaskTypes = currentFactory 
    ? taskTypesByFactoryType[currentFactory.type] 
    : [];

  const handleSave = () => {
    if (factory && taskType && startDate && endDate) {
      onSave({
        factory,
        taskType,
        startDate,
        endDate
      });
    }
  };
  
  const handleClose = () => {
    // 모달이 닫힐 때만 초기화 (다시 열릴 때 새로운 값으로 설정됨)
    setTimeout(() => {
      setFactory('');
      setTaskType('');
      setStartDate('');
      setEndDate('');
    }, 300);
    onClose();
  };

  const handleFactoryChange = (newFactory: string) => {
    setFactory(newFactory);
    setTaskType(''); // 공장 변경 시 태스크 타입 초기화
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">태스크 추가</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              공장 선택
            </label>
            <select
              value={factory}
              onChange={(e) => handleFactoryChange(e.target.value)}
              className={`w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                !!selectedFactory ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              disabled={!!selectedFactory}
            >
              <option value="">공장을 선택하세요</option>
              {availableFactoryList.map((f) => (
                <option key={f.id} value={f.name}>
                  {f.name} ({f.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              태스크 유형
            </label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={!factory}
            >
              <option value="">
                {!factory ? '먼저 공장을 선택하세요' : '태스크 유형을 선택하세요'}
              </option>
              {availableTaskTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              시작일
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                const newStartDate = e.target.value;
                setStartDate(newStartDate);
                // 시작일을 변경하면 종료일도 같은 날로 자동 설정 (1일짜리)
                if (!endDate || endDate < newStartDate) {
                  setEndDate(newStartDate);
                }
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              종료일
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            추가
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCreateModal;