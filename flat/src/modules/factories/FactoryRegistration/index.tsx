import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import type { CertificationType, FactoryManager } from '@/core/database/factories';
import type { FactoryFormData } from './types';
import { BasicInfoForm } from './BasicInfoForm';
import { CertificationForm } from './CertificationForm';
import { ManagerForm } from './ManagerForm';
import { FactoryType } from '@/shared/types/enums';

const FactoryRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FactoryFormData>({
    name: '',
    type: FactoryType.MANUFACTURING,
    address: '',
    contact: '',
    email: '',
    capacity: '',
    certifications: [],
    managers: []
  });

  const [newManager, setNewManager] = useState<FactoryManager>({
    name: '',
    email: '',
    phone: '',
    position: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCertificationToggle = (cert: CertificationType) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert]
    }));
  };

  const handleManagerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewManager(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddManager = () => {
    if (newManager.name && newManager.email && newManager.phone && newManager.position) {
      setFormData(prev => ({
        ...prev,
        managers: [...prev.managers, newManager]
      }));
      setNewManager({ name: '', email: '', phone: '', position: '' });
    }
  };

  const handleRemoveManager = (index: number) => {
    setFormData(prev => ({
      ...prev,
      managers: prev.managers.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API 연동 시 실제 저장 로직 구현
    navigate('/factories');
  };

  const handleCancel = () => {
    navigate('/factories');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">공장 등록</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        {/* 기본 정보 */}
        <BasicInfoForm 
          formData={formData} 
          onChange={handleInputChange} 
        />

        {/* 인증서 */}
        <CertificationForm
          certifications={formData.certifications}
          onToggle={handleCertificationToggle}
        />

        {/* 담당자 정보 */}
        <ManagerForm
          managers={formData.managers}
          newManager={newManager}
          onManagerInputChange={handleManagerInputChange}
          onAddManager={handleAddManager}
          onRemoveManager={handleRemoveManager}
        />

        {/* 버튼 */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            저장
          </button>
        </div>
      </form>
    </div>
  );
};

export default FactoryRegistration;