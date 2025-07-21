import React, { useState, useEffect } from 'react';
import BasicInfoSection from './BasicInfoSection';
import ProductInfoSection from './ProductInfoSection';
import ProjectStatusSection from './ProjectStatusSection';
import ScheduleSection from './ScheduleSection';
import FactoryInfoSection from './FactoryInfoSection';
import AmountInfoSection from './AmountInfoSection';
import BaseModal, { ModalFooter } from '../common/BaseModal';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const updateFormData = (updates: Partial<ProjectData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? '새 프로젝트 생성' : '프로젝트 수정'}
      description="프로젝트 정보를 입력해주세요"
      size="xl"
      footer={
        <ModalFooter>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
          >
            취소
          </button>
          <button
            type="submit"
            form="project-form"
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-sm"
          >
            {mode === 'create' ? '생성' : '수정'}
          </button>
        </ModalFooter>
      }
    >
      <form id="project-form" onSubmit={handleSubmit} className="bg-gray-50 -mx-6 -my-6 px-6 py-6">
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
        </form>
    </BaseModal>
  );
};

export default ProjectModal;