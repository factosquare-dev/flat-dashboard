import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { FactoryManager } from '../../../data/factories';

interface ManagerSectionProps {
  managers: FactoryManager[];
  showManagerForm: boolean;
  newManager: FactoryManager;
  onShowManagerForm: (show: boolean) => void;
  onManagerInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddManager: () => void;
  onRemoveManager: (index: number) => void;
}

const ManagerSection: React.FC<ManagerSectionProps> = ({
  managers,
  showManagerForm,
  newManager,
  onShowManagerForm,
  onManagerInputChange,
  onAddManager,
  onRemoveManager
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        담당자 이름
      </label>
      <div className="space-y-2">
        {managers.map((manager, index) => (
          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <span className="flex-1">{manager.name} ({manager.position})</span>
            <button
              type="button"
              onClick={() => onRemoveManager(index)}
              className="p-1 text-red-500 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {showManagerForm ? (
          <div className="space-y-2 p-3 bg-gray-50 rounded">
            <input
              type="text"
              name="name"
              value={newManager.name}
              onChange={onManagerInputChange}
              placeholder="이름"
              className="w-full px-2 py-1 border border-gray-300 rounded"
            />
            <input
              type="text"
              name="position"
              value={newManager.position}
              onChange={onManagerInputChange}
              placeholder="직책"
              className="w-full px-2 py-1 border border-gray-300 rounded"
            />
            <input
              type="tel"
              name="phone"
              value={newManager.phone}
              onChange={onManagerInputChange}
              placeholder="전화번호"
              className="w-full px-2 py-1 border border-gray-300 rounded"
            />
            <input
              type="email"
              name="email"
              value={newManager.email}
              onChange={onManagerInputChange}
              placeholder="이메일"
              className="w-full px-2 py-1 border border-gray-300 rounded"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onAddManager}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
              >
                추가
              </button>
              <button
                type="button"
                onClick={() => onShowManagerForm(false)}
                className="px-3 py-1 border border-gray-300 text-sm rounded hover:bg-gray-50"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onShowManagerForm(true)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            담당자 추가
          </button>
        )}
      </div>
    </div>
  );
};

export default ManagerSection;