import React, { useState } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import BaseModal from '../common/BaseModal';
import FormInput from '../common/FormInput';
import FormSelect from '../common/FormSelect';
import FormTextarea from '../common/FormTextarea';
import Button from '../common/Button';
import FactorySelector from './FactorySelector';
import FileAttachment from './FileAttachment';

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

  // Update recipient when defaultRecipients changes
  React.useEffect(() => {
    if (defaultRecipients !== undefined) {
      setEmailData(prev => ({ ...prev, recipient: defaultRecipients }));
      // Schedule 페이지에서는 기본적으로 체크 해제된 상태로 시작
      setSelectedFactories([]);
    }
  }, [defaultRecipients]);

  const handleSend = () => {
    if (onSend) {
      onSend({
        ...emailData,
        recipient: selectedFactories.join(', ')
      });
    }
    // 모달 닫을 때 상태 초기화
    setSelectedFactories([]);
    onClose();
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
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSend}
            disabled={selectedFactories.length === 0 || !emailData.subject}
          >
            발송
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* 메일 템플릿 선택 */}
        <FormSelect
          label="메일 템플릿 선택"
          value={emailData.template}
          onChange={(e) => setEmailData({...emailData, template: e.target.value})}
          options={templateOptions}
        />

        {/* 받는 공장 */}
        <FactorySelector
          availableFactories={availableFactories}
          selectedFactories={selectedFactories}
          setSelectedFactories={setSelectedFactories}
          defaultRecipients={defaultRecipients}
        />

        {/* 담당자 */}
        <FormInput
          label="담당자 (팩토)"
          value={emailData.contactPerson}
          onChange={(e) => setEmailData({...emailData, contactPerson: e.target.value})}
          placeholder="담당자 이름"
        />

        {/* 제목 */}
        <FormInput
          label="제목"
          value={emailData.subject}
          onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
          placeholder="메일 제목을 입력하세요"
        />

        {/* 내용 */}
        <FormTextarea
          label="내용"
          rows={6}
          value={emailData.content}
          onChange={(e) => setEmailData({...emailData, content: e.target.value})}
          placeholder="메일 내용을 입력하세요"
        />

        {/* 첨부파일 */}
        <FileAttachment
          attachments={emailData.attachments}
          onFileAdd={handleFileAdd}
          onFileDelete={handleFileDelete}
        />
      </div>
    </BaseModal>
  );
};

export default EmailModal;