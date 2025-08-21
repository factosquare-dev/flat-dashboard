import React, { useState } from 'react';
import { ArrowLeft, Mail, AlertCircle } from 'lucide-react';
import BaseModal, { ModalFooter } from '@/shared/components/BaseModal';
import FactorySelector from './FactorySelector';
import CustomerSelector from './CustomerSelector';
import ManagerSelector from './ManagerSelector';
import FileAttachment from './FileAttachment';
import { useModalFormValidation } from '@/shared/hooks/useModalFormValidation';
import { ModalSize, ButtonVariant, ButtonSize } from '@/shared/types/enums';
import { Button } from '@/shared/components/Button';
import { getModalSizeString } from '@/shared/utils/modalUtils';
import './EmailModal.css';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend?: (emailData: EmailData) => void;
  defaultRecipients?: string;
  availableFactories?: Array<{ name: string; color: string; type: string }>;
  onBack?: () => void;
  showBackButton?: boolean;
}

interface EmailData {
  template: string;
  recipient: string;
  contactPerson: string;
  subject: string;
  content: string;
  attachments: File[];
}

const EmailModal: React.FC<EmailModalProps> = ({ 
  isOpen, 
  onClose, 
  onSend, 
  defaultRecipients, 
  availableFactories, 
  onBack, 
  showBackButton 
}) => {
  const [emailData, setEmailData] = useState<EmailData>({
    template: '',
    recipient: defaultRecipients || '',
    contactPerson: '',
    subject: '',
    content: '',
    attachments: []
  });
  const [selectedFactories, setSelectedFactories] = useState<string[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedManagers, setSelectedManagers] = useState<string[]>([]);
  const [showRecipientValidationError, setShowRecipientValidationError] = useState(false);

  // Update recipient when defaultRecipients changes
  React.useEffect(() => {
    if (defaultRecipients !== undefined) {
      setEmailData(prev => ({ ...prev, recipient: defaultRecipients }));
      // Schedule 페이지에서는 기본적으로 체크 해제된 상태로 시작
      setSelectedFactories([]);
    }
  }, [defaultRecipients]);

  // Validation rules
  const validationRules = {
    template: { required: true },
    subject: { required: true },
    content: { required: true }
  };

  const {
    errors,
    touched,
    formRef,
    handleSubmit: handleFormSubmit,
    handleFieldChange,
    resetForm,
    isSubmitting
  } = useModalFormValidation(emailData, {
    rules: validationRules,
    onSubmit: async (data) => {
      // Check recipient selection (at least one type must be selected)
      const hasRecipients = selectedFactories.length > 0 || selectedCustomers.length > 0 || selectedManagers.length > 0;
      if (!hasRecipients) {
        setShowRecipientValidationError(true);
        return;
      }
      
      if (onSend) {
        const allRecipients = [
          ...selectedFactories,
          ...selectedCustomers,
          ...selectedManagers
        ];
        onSend({
          ...data,
          recipient: allRecipients.join(', ')
        });
      }
      // 모달 닫을 때 상태 초기화
      setSelectedFactories([]);
      setSelectedCustomers([]);
      setSelectedManagers([]);
      setShowRecipientValidationError(false);
      onClose();
    }
  });

  const handleSend = () => {
    // Use form submit handler
    const form = formRef.current;
    if (form) {
      form.requestSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEmailData(prev => ({
      ...prev,
      [name]: value
    }));
    handleFieldChange(name as keyof EmailData, value);
  };

  const handleFileAdd = (files: File[]) => {
    setEmailData({
      ...emailData,
      attachments: [...emailData.attachments, ...files]
    });
  };

  const handleFileDelete = (index: number) => {
    setEmailData({
      ...emailData,
      attachments: emailData.attachments.filter((_, i) => i !== index)
    });
  };

  const templateOptions = [
    { value: '', label: '템플릿을 선택하세요' },
    { value: 'product-request', label: '제품개발 요청' },
    { value: 'quote-request', label: '견적 요청' },
    { value: 'delivery-check', label: '납기 확인' }
  ];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          {showBackButton && onBack && (
            <button 
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 p-1 rounded-lg hover:bg-gray-100"
              title="뒤로가기"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <span className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            메일 보내기
          </span>
        </div>
      }
      size={getModalSizeString(ModalSize.LG)}
      footer={
        <ModalFooter>
          <Button
            variant={ButtonVariant.SECONDARY}
            size={ButtonSize.MD}
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            variant={ButtonVariant.PRIMARY}
            size={ButtonSize.MD}
            onClick={handleSend}
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            발송
          </Button>
        </ModalFooter>
      }
    >
      <form ref={formRef} onSubmit={handleFormSubmit} className="bg-gray-50 -mx-6 -my-6 px-6 py-6">
        <div className="modal-section-spacing">
        {/* Validation error messages */}
        {showRecipientValidationError && (
          <div className="email-modal__error">
            <AlertCircle className="email-modal__error-icon" />
            <span>받는 사람(공장, 고객, 담당자)을 최소 1명 이상 선택해주세요</span>
          </div>
        )}
        {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
          <div className="email-modal__error">
            <AlertCircle className="email-modal__error-icon" />
            <span>필수 입력 항목을 모두 입력해주세요</span>
          </div>
        )}
        
        {/* 메일 템플릿 선택 */}
        <div className="modal-field-spacing">
          <label className="modal-field-label">메일 템플릿 선택 *</label>
          <select
            name="template"
            className={`modal-input ${errors.template && touched.template ? 'border-red-400' : ''}`}
            value={emailData.template}
            onChange={handleInputChange}
            required
          >
            {templateOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.template && touched.template && <div className="text-red-600 text-xs mt-1">{errors.template}</div>}
        </div>

        {/* 받는 공장 */}
        <FactorySelector
          availableFactories={availableFactories}
          selectedFactories={selectedFactories}
          setSelectedFactories={(factories) => {
            setSelectedFactories(factories);
            if (factories.length > 0 || selectedCustomers.length > 0 || selectedManagers.length > 0) {
              setShowRecipientValidationError(false);
            }
          }}
          defaultRecipients={defaultRecipients}
        />

        {/* 받는 고객 */}
        <CustomerSelector
          selectedCustomers={selectedCustomers}
          setSelectedCustomers={(customers) => {
            setSelectedCustomers(customers);
            if (customers.length > 0 || selectedFactories.length > 0 || selectedManagers.length > 0) {
              setShowRecipientValidationError(false);
            }
          }}
        />

        {/* 담당자 */}
        <ManagerSelector
          selectedManagers={selectedManagers}
          setSelectedManagers={(managers) => {
            setSelectedManagers(managers);
            if (managers.length > 0 || selectedFactories.length > 0 || selectedCustomers.length > 0) {
              setShowRecipientValidationError(false);
            }
          }}
        />

        {/* 제목 */}
        <div className="modal-field-spacing">
          <label className="modal-field-label">제목 *</label>
          <input
            type="text"
            name="subject"
            className={`modal-input ${errors.subject && touched.subject ? 'border-red-400' : ''}`}
            value={emailData.subject}
            onChange={handleInputChange}
            placeholder="메일 제목을 입력하세요"
            required
          />
          {errors.subject && touched.subject && <div className="text-red-600 text-xs mt-1">{errors.subject}</div>}
        </div>

        {/* 내용 */}
        <div className="modal-field-spacing">
          <label className="modal-field-label">내용 *</label>
          <textarea
            name="content"
            rows={6}
            className={`modal-input ${errors.content && touched.content ? 'border-red-400' : ''}`}
            value={emailData.content}
            onChange={handleInputChange}
            placeholder="메일 내용을 입력하세요"
            required
          />
          {errors.content && touched.content && <div className="text-red-600 text-xs mt-1">{errors.content}</div>}
        </div>

        {/* 첨부파일 */}
        <FileAttachment
          attachments={emailData.attachments}
          onFileAdd={handleFileAdd}
          onFileDelete={handleFileDelete}
        />
        </div>
      </form>
    </BaseModal>
  );
};

export default EmailModal;