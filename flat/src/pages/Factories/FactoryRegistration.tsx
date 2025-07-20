import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import type { CertificationType, FactoryManager } from '../../data/factories';

interface FactoryFormData {
  name: string;
  type: '제조' | '용기' | '포장';
  address: string;
  contact: string;
  email: string;
  capacity: string;
  certifications: CertificationType[];
  managers: FactoryManager[];
}

const FactoryRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FactoryFormData>({
    name: '',
    type: '제조',
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

  const availableCertifications: CertificationType[] = [
    'ISO 22716', 'CGMP', 'ISO 9001', 'ISO 14001', 'ISO 45001',
    'FSC', 'VEGAN', 'HALAL', 'EWG', 'COSMOS', 'ECOCERT'
  ];

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
    console.log('Factory data:', formData);
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
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">기본 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                공장명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                공장 유형 <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="제조">제조</option>
                <option value="용기">용기</option>
                <option value="포장">포장</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                주소 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                연락처 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                required
                placeholder="02-0000-0000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                생산 능력 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                required
                placeholder="예: 월 100톤"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 인증서 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">보유 인증</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availableCertifications.map(cert => (
              <label key={cert} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.certifications.includes(cert)}
                  onChange={() => handleCertificationToggle(cert)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm">{cert}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 담당자 정보 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">담당자 정보</h2>
          
          {/* 담당자 추가 폼 */}
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                name="name"
                value={newManager.name}
                onChange={handleManagerInputChange}
                placeholder="이름"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                name="email"
                value={newManager.email}
                onChange={handleManagerInputChange}
                placeholder="이메일"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                name="phone"
                value={newManager.phone}
                onChange={handleManagerInputChange}
                placeholder="전화번호"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="position"
                value={newManager.position}
                onChange={handleManagerInputChange}
                placeholder="직책"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="button"
              onClick={handleAddManager}
              className="mt-3 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              담당자 추가
            </button>
          </div>

          {/* 담당자 목록 */}
          {formData.managers.length > 0 && (
            <div className="space-y-2">
              {formData.managers.map((manager, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                    <span><strong>이름:</strong> {manager.name}</span>
                    <span><strong>이메일:</strong> {manager.email}</span>
                    <span><strong>전화:</strong> {manager.phone}</span>
                    <span><strong>직책:</strong> {manager.position}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveManager(index)}
                    className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

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