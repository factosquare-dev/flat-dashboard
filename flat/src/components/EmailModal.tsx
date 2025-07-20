import React, { useState } from 'react';
import { X, Search, Paperclip, Trash2, ArrowLeft } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
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
            {/* 프로젝트가 선택된 경우 */}
            {defaultRecipients && defaultRecipients.length > 0 && availableFactories && availableFactories.length > 0 ? (
              <div>
                <p className="text-sm text-gray-500 mb-2">선택된 프로젝트의 공장들</p>
                {/* 선택된 프로젝트의 공장들을 바로 표시 (검색 없음) */}
                <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2">
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
                      <span className="ml-auto text-xs text-gray-500">{factory.type}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              /* 프로젝트가 선택되지 않은 경우 - 검색으로만 추가 */
              <div>
                <div className="relative mb-3">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="공장을 검색하세요"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                </div>
                {searchQuery.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {availableFactories && availableFactories.length > 0 && availableFactories
                      .filter(factory => factory.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((factory) => (
                      <button
                        key={factory.name}
                        onClick={() => {
                          if (!selectedFactories.includes(factory.name)) {
                            setSelectedFactories([...selectedFactories, factory.name]);
                          }
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                      >
                        <div className={`w-3 h-3 rounded-full ${factory.color} mr-2`}></div>
                        <span className="text-sm">{factory.name}</span>
                        <span className="ml-auto text-xs text-gray-500">{factory.type}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* 선택된 공장 표시 */}
            {selectedFactories.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">{selectedFactories.length}개 공장 선택됨</p>
                <div className="flex flex-wrap gap-2">
                  {selectedFactories.map((factoryName) => {
                    const factory = availableFactories?.find(f => f.name === factoryName);
                    return (
                      <div key={factoryName} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                        {factory && <div className={`w-2 h-2 rounded-full ${factory.color}`}></div>}
                        <span>{factoryName}</span>
                        <button
                          onClick={() => setSelectedFactories(selectedFactories.filter(f => f !== factoryName))}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
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