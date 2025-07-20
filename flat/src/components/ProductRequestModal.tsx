import React, { useState } from 'react';
import { X, FileText, Calendar, Building2, Mail } from 'lucide-react';
import EmailModal from './EmailModal';

interface ProductRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: ProductRequestData) => void;
  onSendEmail?: (data: ProductRequestData) => void;
  availableFactories?: Array<{ name: string; color: string }>;
}

interface ProductRequestData {
  brandName: string;
  targetProduct: string;
  receiveMethod: string;
  deliveryQuantity: string;
  usageLocation: string;
  consumptionUnit: string;
  receiptInfo: {
    targetType: string;
    useGuidance: string;
    quantity: string;
    shape: string;
    requiredFormulation: string;
  };
  contentInfo: {
    containerSpecifications: string;
    fillingVolume: string;
    functionalComponent: string;
    mainIngredient: string;
    productionPreference: string;
  };
  deliverySchedule: string;
  requirements: string;
}

const ProductRequestModal: React.FC<ProductRequestModalProps> = ({ isOpen, onClose, onSave, onSendEmail, availableFactories }) => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [formData, setFormData] = useState<ProductRequestData>({
    brandName: '',
    targetProduct: '',
    receiveMethod: '',
    deliveryQuantity: '',
    usageLocation: '',
    consumptionUnit: '',
    receiptInfo: {
      targetType: '',
      useGuidance: '',
      quantity: '',
      shape: '',
      requiredFormulation: '',
    },
    contentInfo: {
      containerSpecifications: '',
      fillingVolume: '',
      functionalComponent: '',
      mainIngredient: '',
      productionPreference: '',
    },
    deliverySchedule: '',
    requirements: '',
  });
  const [isSaved, setIsSaved] = useState(false);

  // 모달이 닫힐 때 저장 상태 초기화
  React.useEffect(() => {
    if (!isOpen) {
      setIsSaved(false);
    }
  }, [isOpen]);

  // ESC key handler
  React.useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showEmailModal) {
          setShowEmailModal(false);
        } else if (isOpen) {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, showEmailModal, onClose]);

  if (!isOpen && !showEmailModal) return null;

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
      setIsSaved(true);
    }
  };

  const handleSendEmail = () => {
    if (!isSaved) {
      if (window.confirm('제품 개발 의뢰서를 먼저 저장하시겠습니까?')) {
        handleSave();
      } else {
        return;
      }
    }
    
    onClose(); // ProductRequestModal 닫기
    setTimeout(() => {
      setShowEmailModal(true);
    }, 100);
  };
  
  const handleEmailSend = (emailData: any) => {
    console.log('Email sent:', emailData);
    setShowEmailModal(false);
    if (onSendEmail) {
      onSendEmail(formData);
    }
  };

  const updateReceiptInfo = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      receiptInfo: {
        ...prev.receiptInfo,
        [field]: value
      }
    }));
  };

  const updateContentInfo = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contentInfo: {
        ...prev.contentInfo,
        [field]: value
      }
    }));
  };

  return (
    <>
    {isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            제품 개발 정보
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* 브랜드명 및 제품명 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">브랜드명</label>
              <input
                type="text"
                value={formData.brandName}
                onChange={(e) => setFormData({...formData, brandName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="브랜드명을 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">타겟 제품</label>
              <input
                type="text"
                value={formData.targetProduct}
                onChange={(e) => setFormData({...formData, targetProduct: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="타겟 제품을 입력하세요"
              />
            </div>
          </div>

          {/* 발주 정보 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">발주 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">발주수량</label>
                  <input
                    type="text"
                    value={formData.deliveryQuantity}
                    onChange={(e) => setFormData({...formData, deliveryQuantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 1000개"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">용량</label>
                  <input
                    type="text"
                    value={formData.usageLocation}
                    onChange={(e) => setFormData({...formData, usageLocation: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 200ml"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">희망가격(개당 단가)</label>
                  <input
                    type="text"
                    value={formData.receiveMethod}
                    onChange={(e) => setFormData({...formData, receiveMethod: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 1,500원"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">용기/부자재 사양</label>
                  <input
                    type="text"
                    value={formData.consumptionUnit}
                    onChange={(e) => setFormData({...formData, consumptionUnit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 펌프용기"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 내용물 정보 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">내용물</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">타겟제형</label>
                  <input
                    type="text"
                    value={formData.receiptInfo.targetType}
                    onChange={(e) => updateReceiptInfo('targetType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 로션, 크림"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">사용감</label>
                  <input
                    type="text"
                    value={formData.receiptInfo.useGuidance}
                    onChange={(e) => updateReceiptInfo('useGuidance', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 산뜻한, 촉촉한"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">향/색</label>
                  <input
                    type="text"
                    value={formData.receiptInfo.quantity}
                    onChange={(e) => updateReceiptInfo('quantity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 무향, 연한 핑크색"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">필수요청성분</label>
                  <input
                    type="text"
                    value={formData.receiptInfo.shape}
                    onChange={(e) => updateReceiptInfo('shape', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 나이아신아마이드"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 성분 정보 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">성분</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">컨셉성분</label>
                <input
                  type="text"
                  value={formData.contentInfo.containerSpecifications}
                  onChange={(e) => updateContentInfo('containerSpecifications', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 센텔라아시아티카추출물"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">기능성 여부</label>
                <input
                  type="text"
                  value={formData.contentInfo.fillingVolume}
                  onChange={(e) => updateContentInfo('fillingVolume', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 미백, 주름개선"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">무첨가 요청 성분</label>
                <input
                  type="text"
                  value={formData.contentInfo.functionalComponent}
                  onChange={(e) => updateContentInfo('functionalComponent', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 파라벤, 인공향료"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">희망 인증</label>
                <input
                  type="text"
                  value={formData.contentInfo.mainIngredient}
                  onChange={(e) => updateContentInfo('mainIngredient', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 비건인증, EWG그린등급"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">희망 유통기한</label>
                <input
                  type="text"
                  value={formData.contentInfo.productionPreference}
                  onChange={(e) => updateContentInfo('productionPreference', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 제조일로부터 24개월"
                />
              </div>
            </div>
          </div>

          {/* 출시 예정일 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">출시 예정일</label>
            <input
              type="date"
              value={formData.deliverySchedule}
              onChange={(e) => setFormData({...formData, deliverySchedule: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 요청사항 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">요청사항</label>
            <textarea
              value={formData.requirements}
              onChange={(e) => setFormData({...formData, requirements: e.target.value})}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="추가 요청사항을 입력하세요"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="flex gap-2">
            <button 
              onClick={handleSendEmail}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Mail className="w-4 h-4" />
              메일 보내기
            </button>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              취소
            </button>
            <button 
              onClick={handleSave}
              className={`px-6 py-2 rounded-lg transition-colors ${
                isSaved 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              disabled={isSaved}
            >
              {isSaved ? '저장됨' : '저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
    )}
    
    {/* Email Modal */}
    <EmailModal
      isOpen={showEmailModal}
      onClose={() => setShowEmailModal(false)}
      onSend={handleEmailSend}
      showBackButton={true}
      onBack={() => setShowEmailModal(false)}
      defaultRecipients=""
      availableFactories={availableFactories}
    />
    </>
  );
};

export default ProductRequestModal;