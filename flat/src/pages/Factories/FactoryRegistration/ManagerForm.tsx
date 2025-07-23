import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { FactoryManager } from '../../../data/factories';

interface ManagerFormProps {
  managers: FactoryManager[];
  newManager: FactoryManager;
  onManagerInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddManager: () => void;
  onRemoveManager: (index: number) => void;
}

export const ManagerForm: React.FC<ManagerFormProps> = ({
  managers,
  newManager,
  onManagerInputChange,
  onAddManager,
  onRemoveManager
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">담당자 정보</h2>
      
      {/* 담당자 추가 폼 */}
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            name="name"
            value={newManager.name}
            onChange={onManagerInputChange}
            placeholder="이름"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            name="email"
            value={newManager.email}
            onChange={onManagerInputChange}
            placeholder="이메일"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="tel"
            name="phone"
            value={newManager.phone}
            onChange={onManagerInputChange}
            placeholder="전화번호"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="position"
            value={newManager.position}
            onChange={onManagerInputChange}
            placeholder="직책"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="button"
          onClick={onAddManager}
          className="mt-3 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          담당자 추가
        </button>
      </div>

      {/* 담당자 목록 */}
      {managers.length > 0 && (
        <div className="space-y-2">
          {managers.map((manager, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                <span><strong>이름:</strong> {manager.name}</span>
                <span><strong>이메일:</strong> {manager.email}</span>
                <span><strong>전화:</strong> {manager.phone}</span>
                <span><strong>직책:</strong> {manager.position}</span>
              </div>
              <button
                type="button"
                onClick={() => onRemoveManager(index)}
                className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};