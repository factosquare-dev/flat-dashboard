import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { CertificationType, FactoryManager } from '../../data/factories';

interface FactoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (factoryData: FactoryFormData) => void;
  editData?: FactoryFormData | null;
}

export interface FactoryFormData {
  id?: string;
  name: string;
  type: '제조' | '용기' | '포장';
  address: string;
  contact: string;
  email: string;
  capacity: string;
  certifications: CertificationType[];
  managers: FactoryManager[];
}

const FactoryModal: React.FC<FactoryModalProps> = ({ isOpen, onClose, onSave, editData }) => {
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

  const [showManagerForm, setShowManagerForm] = useState(false);
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

  useEffect(() => {
    if (editData) {
      setFormData(editData);
    } else {
      setFormData({
        name: '',
        type: '제조',
        address: '',
        contact: '',
        email: '',
        capacity: '',
        certifications: [],
        managers: []
      });
    }
  }, [editData, isOpen]);

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
      setShowManagerForm(false);
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
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">
            {editData ? '공장 수정' : '공장 추가'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* 왼쪽 컬럼 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  공장명
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  공장 유형
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="제조">제조</option>
                  <option value="용기">용기</option>
                  <option value="포장">포장</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  공장 유형
                </label>
                <input
                  type="text"
                  placeholder="시업장 주소"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사업자번호
                </label>
                <input
                  type="text"
                  placeholder="000-00-00000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사업장 전화번호
                </label>
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  placeholder="02-0000-0000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  담당자 이름
                </label>
                <div className="space-y-2">
                  {formData.managers.map((manager, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span className="flex-1">{manager.name} ({manager.position})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveManager(index)}
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
                        onChange={handleManagerInputChange}
                        placeholder="이름"
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                      <input
                        type="text"
                        name="position"
                        value={newManager.position}
                        onChange={handleManagerInputChange}
                        placeholder="직책"
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                      <input
                        type="tel"
                        name="phone"
                        value={newManager.phone}
                        onChange={handleManagerInputChange}
                        placeholder="전화번호"
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                      <input
                        type="email"
                        name="email"
                        value={newManager.email}
                        onChange={handleManagerInputChange}
                        placeholder="이메일"
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleAddManager}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                        >
                          추가
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowManagerForm(false)}
                          className="px-3 py-1 border border-gray-300 text-sm rounded hover:bg-gray-50"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowManagerForm(true)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      담당자 추가
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  담당자 이메일
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제품
                </label>
                <input
                  type="text"
                  placeholder="생산 가능 제품"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  인증서
                </label>
                <div className="space-y-2">
                  {['VEGAN', 'ISO'].map(cert => (
                    <label key={cert} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.certifications.includes(cert as CertificationType)}
                        onChange={() => handleCertificationToggle(cert as CertificationType)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">{cert}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 오른쪽 컬럼 - 공장 정보 입력 폼들 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  공장명
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  공장 유형
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  인증서 유형
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  인증 번호
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  발급일
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  유효기간
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FactoryModal;