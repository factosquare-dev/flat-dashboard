import React, { useState } from 'react';
import { X, Search, Paperclip, Trash2, ArrowLeft } from 'lucide-react';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend?: (emailData: EmailData) => void;
  defaultRecipients?: string;
  availableFactories?: Array<{ name: string; color: string }>;
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

const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose, onSend, defaultRecipients, availableFactories, onBack, showBackButton }) => {
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
      // 기본 선택된 공장들을 배열로 변환
      if (defaultRecipients) {
        setSelectedFactories(defaultRecipients.split(', ').filter(Boolean));
      }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setEmailData({
        ...emailData,
        attachments: [...emailData.attachments, ...Array.from(e.target.files)]
      });
    }
  };

  const handleFileDelete = (index: number) => {
    setEmailData({
      ...emailData,
      attachments: emailData.attachments.filter((_, i) => i !== index)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            {showBackButton && onBack && (
              <button 
                onClick={onBack}
                className="text-gray-600 hover:text-gray-800 p-1"
                title="뒤로가기"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-xl font-semibold">메일 보내기</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          {/* 메일 템플릿 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              메일 템플릿 선택
            </label>
            <select 
              value={emailData.template}
              onChange={(e) => setEmailData({...emailData, template: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">템플릿을 선택하세요</option>
              <option value="product-request">제품개발 요청</option>
              <option value="quote-request">견적 요청</option>
              <option value="delivery-check">납기 확인</option>
            </select>
          </div>

          {/* 받는 공장 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              받는 공장
            </label>
            {availableFactories && availableFactories.length > 0 ? (
              <div className="space-y-2">
                {availableFactories.map((factory) => (
                  <label key={factory.name} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFactories.includes(factory.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFactories([...selectedFactories, factory.name]);
                        } else {
                          setSelectedFactories(selectedFactories.filter(f => f !== factory.name));
                        }
                      }}
                      className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <div className={`w-3 h-3 rounded-full ${factory.color} mr-2`}></div>
                    <span className="text-sm">{factory.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="relative">
                <input 
                  type="text" 
                  value={emailData.recipient}
                  onChange={(e) => setEmailData({...emailData, recipient: e.target.value})}
                  placeholder="공장을 검색하세요"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            )}
          </div>

          {/* 담당자 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              담당자 (팩토)
            </label>
            <input 
              type="text" 
              value={emailData.contactPerson}
              onChange={(e) => setEmailData({...emailData, contactPerson: e.target.value})}
              placeholder="담당자 이름"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목
            </label>
            <input 
              type="text" 
              value={emailData.subject}
              onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
              placeholder="메일 제목을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              내용
            </label>
            <textarea 
              rows={6}
              value={emailData.content}
              onChange={(e) => setEmailData({...emailData, content: e.target.value})}
              placeholder="메일 내용을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          {/* 첨부파일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              첨부파일
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400"
                 onClick={() => document.getElementById('file-input')?.click()}>
              <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">파일을 드래그하거나 클릭하여 업로드</p>
              <input 
                id="file-input"
                type="file" 
                className="hidden" 
                multiple 
                onChange={handleFileChange}
              />
            </div>
            {emailData.attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {emailData.attachments.map((file, index) => (
                  <div key={index} className="text-sm text-gray-600 flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4" />
                      <span>{file.name}</span>
                    </div>
                    <button
                      onClick={() => handleFileDelete(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            취소
          </button>
          <button 
            onClick={handleSend}
            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            발송
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;