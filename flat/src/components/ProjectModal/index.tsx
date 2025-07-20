import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import BasicInfoSection from './BasicInfoSection';
import ProductInfoSection from './ProductInfoSection';
import ProjectStatusSection from './ProjectStatusSection';
import ScheduleSection from './ScheduleSection';
import FactoryInfoSection from './FactoryInfoSection';
import AmountInfoSection from './AmountInfoSection';
import type { ProjectModalProps, ProjectData } from './types';

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onSave, editData, mode }) => {
  const [formData, setFormData] = useState<ProjectData>({
    client: '',
    manager: '',
    productType: '',
    serviceType: 'OEM',
    status: '시작전',
    priority: '보통',
    startDate: '',
    endDate: '',
    manufacturer: '',
    container: '',
    packaging: '',
    sales: '',
    purchase: '',
    description: ''
  });

  useEffect(() => {
    if (editData && mode === 'edit') {
      setFormData(editData);
    } else {
      // Reset form for create mode
      setFormData({
        client: '',
        manager: '',
        productType: '',
        serviceType: 'OEM',
        status: '시작전',
        priority: '보통',
        startDate: '',
        endDate: '',
        manufacturer: '',
        container: '',
        packaging: '',
        sales: '',
        purchase: '',
        description: ''
      });
    }
  }, [editData, mode]);

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const updateFormData = (updates: Partial<ProjectData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === 'create' ? '새 프로젝트 생성' : '프로젝트 수정'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] bg-gray-50">
          <div className="space-y-6">
            <BasicInfoSection formData={formData} onChange={updateFormData} />
            <ProductInfoSection formData={formData} onChange={updateFormData} />
            <ProjectStatusSection formData={formData} onChange={updateFormData} />
            <ScheduleSection formData={formData} onChange={updateFormData} />
            <FactoryInfoSection formData={formData} onChange={updateFormData} />
            <AmountInfoSection formData={formData} onChange={updateFormData} />

            {/* 비고 */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">비고</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                placeholder="추가 메모사항을 입력하세요"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium"
            >
              {mode === 'create' ? '생성' : '수정'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;