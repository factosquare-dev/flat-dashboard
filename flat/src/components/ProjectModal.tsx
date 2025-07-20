import React, { useState, useEffect } from 'react';
import { X, Calendar, Building2, Package, Users, AlertCircle, DollarSign, Sparkles } from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProjectData) => void;
  editData?: ProjectData | null;
  mode: 'create' | 'edit';
}

interface ProjectData {
  id?: string;
  client: string;
  manager: string;
  productType: string;
  serviceType: string;
  status: string;
  priority: string;
  startDate: string;
  endDate: string;
  manufacturer: string;
  container: string;
  packaging: string;
  sales: string;
  purchase: string;
  description?: string;
}

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

  const formatCurrency = (value: string) => {
    const num = value.replace(/[^0-9]/g, '');
    if (!num) return '';
    
    const number = parseInt(num);
    const eok = Math.floor(number / 100000000);
    const man = Math.floor((number % 100000000) / 10000);
    
    let result = '';
    if (eok > 0) result += `${eok}억`;
    if (man > 0) result += `${result ? ' ' : ''}${man}만`;
    if (result) result += '원';
    
    return result || num;
  };

  const handleCurrencyChange = (field: 'sales' | 'purchase', value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setFormData({ ...formData, [field]: numericValue });
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
            {/* 기본 정보 */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                기본 정보
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    고객명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="고객명을 입력하세요"
                    required
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    담당자 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="담당자명을 입력하세요"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 제품 정보 */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                제품 정보
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    제품 타입 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.productType}
                    onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="예: 스킨케어, 메이크업 등"
                    required
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    서비스 유형
                  </label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="OEM">OEM</option>
                    <option value="ODM">ODM</option>
                    <option value="OBM">OBM</option>
                    <option value="Private Label">Private Label</option>
                    <option value="White Label">White Label</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 프로젝트 상태 */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                프로젝트 상태
              </h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="시작전">시작전</option>
                    <option value="진행중">진행중</option>
                    <option value="완료">완료</option>
                    <option value="중단">중단</option>
                  </select>
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">우선순위</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="높음">높음</option>
                    <option value="보통">보통</option>
                    <option value="낮음">낮음</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">진행률</label>
                  <div className="flex items-center h-[50px]">
                    <span className="text-sm text-gray-500">자동 계산됨</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 일정 */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                일정
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시작일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    마감일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 공장 정보 */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                공장 정보
              </h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">제조</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="제조 공장"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">용기</label>
                  <input
                    type="text"
                    value={formData.container}
                    onChange={(e) => setFormData({ ...formData, container: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="용기 공장"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">포장</label>
                  <input
                    type="text"
                    value={formData.packaging}
                    onChange={(e) => setFormData({ ...formData, packaging: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="포장 공장"
                  />
                </div>
              </div>
            </div>

            {/* 금액 정보 */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                금액 정보
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">매출</label>
                  <input
                    type="text"
                    value={formatCurrency(formData.sales)}
                    onChange={(e) => handleCurrencyChange('sales', e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="매출 금액"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">매입</label>
                  <input
                    type="text"
                    value={formatCurrency(formData.purchase)}
                    onChange={(e) => handleCurrencyChange('purchase', e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="매입 금액"
                  />
                </div>
              </div>
            </div>

            {/* 비고 */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">비고</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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