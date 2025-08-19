import React from 'react';
import { Plus, X, User } from 'lucide-react';
import type { FactoryManager } from '@/data/factories';
import { Button } from '@/components/ui/Button';
import { ButtonVariant, ButtonSize } from '@/types/enums';

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
    <div className="modal-field-spacing">
      <div className="flex items-center justify-between mb-3">
        <label className="modal-field-label flex items-center gap-2">
          <User className="w-4 h-4" />
          담당자 정보
        </label>
        {!showManagerForm && (
          <Button
            variant={ButtonVariant.GHOST}
            size={ButtonSize.SM}
            onClick={() => onShowManagerForm(true)}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            담당자 추가
          </Button>
        )}
      </div>
      
      {/* 담당자 목록 */}
      {managers.length > 0 && (
        <div className="space-y-2 mb-3">
          {managers.map((manager, index) => (
            <div key={index} className="manager-item">
              <div className="flex-1">
                <div className="font-medium text-sm">{manager.name}</div>
                <div className="text-xs text-gray-600">
                  {manager.position} | {manager.phone} | {manager.email}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemoveManager(index)}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
        
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
  );
};

export default ManagerSection;