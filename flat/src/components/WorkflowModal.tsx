import React, { useState } from 'react';
import { X, Calendar, CheckSquare, Building2, ChevronRight } from 'lucide-react';

interface WorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  factories: Array<{
    name: string;
    color: string;
  }>;
  quickAddData?: { factory: string; date: string } | null;
  onSave?: (data: WorkflowData) => void;
}

interface WorkflowData {
  factory: string;
  task: string;
  startDate: string;
  endDate: string;
}

const WorkflowModal: React.FC<WorkflowModalProps> = ({ isOpen, onClose, factories, quickAddData, onSave }) => {
  const [selectedFactory, setSelectedFactory] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showTaskSelection, setShowTaskSelection] = useState(false);
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState<'start' | 'end'>('start');

  // 공장별 태스크 목록
  const tasksByFactory: { [key: string]: string[] } = {
    '큐셀시스템': ['PCB 설계', 'SMT 작업', '최종 조립', '품질 검사', '포장'],
    '(주)연우': ['금형 제작', '사출 성형', '도장 작업', '조립', '검수'],
    '(주)네트모베이지': ['회로 설계', '펌웨어 개발', '하드웨어 테스트', '인증 시험'],
    '주식회사 코스모로스': ['기구 설계', '시제품 제작', '성능 테스트', '양산 준비']
  };

  // quickAddData가 변경되면 상태 업데이트
  React.useEffect(() => {
    if (quickAddData) {
      setSelectedFactory(quickAddData.factory);
      setStartDate(quickAddData.date);
      setEndDate(quickAddData.date); // 드래그 앤 드롭 시 하루짜리 태스크
      setShowTaskSelection(true);
    } else if (isOpen) {
      // 버튼 클릭으로 열릴 때는 초기화
      setSelectedFactory('');
      setSelectedTask('');
      setStartDate('');
      setEndDate('');
      setShowTaskSelection(false);
    }
  }, [quickAddData, isOpen]);

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

  const handleFactorySelect = (factoryName: string) => {
    setSelectedFactory(factoryName);
    setSelectedTask(''); // 공장 변경 시 태스크 초기화
    setShowTaskSelection(true);
  };

  const handleSave = () => {
    if (onSave && selectedFactory && selectedTask && startDate && endDate) {
      onSave({
        factory: selectedFactory,
        task: selectedTask,
        startDate: startDate,
        endDate: endDate
      });
    }
    // Reset states
    setSelectedFactory('');
    setSelectedTask('');
    setStartDate('');
    setEndDate('');
    setShowTaskSelection(false);
    onClose();
  };

  const handleCancel = () => {
    // Reset states
    setSelectedFactory('');
    setSelectedTask('');
    setStartDate('');
    setEndDate('');
    setShowTaskSelection(false);
    onClose();
  };

  const handleDateSelect = (date: string) => {
    if (datePickerType === 'start') {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
    setShowDatePicker(false);
  };

  // 색상에서 밝은 버전 추출
  const getLightColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      'bg-blue-500': 'bg-blue-50 border-blue-200 hover:border-blue-400',
      'bg-red-500': 'bg-red-50 border-red-200 hover:border-red-400',
      'bg-yellow-500': 'bg-yellow-50 border-yellow-200 hover:border-yellow-400',
      'bg-cyan-500': 'bg-cyan-50 border-cyan-200 hover:border-cyan-400'
    };
    return colorMap[color] || 'bg-gray-50 border-gray-200 hover:border-gray-400';
  };

  const getDotColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      'bg-blue-500': 'bg-blue-500',
      'bg-red-500': 'bg-red-500',
      'bg-yellow-500': 'bg-yellow-500',
      'bg-cyan-500': 'bg-cyan-500'
    };
    return colorMap[color] || 'bg-gray-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">워크플로우 추가</h2>
          <button 
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* 공장 선택 - 카드 스타일 */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              공장 선택
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {factories.map((factory, index) => (
                <button
                  key={index}
                  onClick={() => handleFactorySelect(factory.name)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedFactory === factory.name 
                      ? getLightColorClass(factory.color)
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getDotColorClass(factory.color)}`}></div>
                    <span className="font-medium text-gray-800">{factory.name}</span>
                  </div>
                  {selectedFactory === factory.name && (
                    <ChevronRight className="w-4 h-4 text-gray-400 ml-auto mt-1" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 태스크 선택 & 날짜 선택 - 공장 선택 후 표시 */}
          {showTaskSelection && (
            <>
              {/* 태스크 선택 */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  태스크 선택
                </h3>
                
                <div className="relative">
                  <button
                    onClick={() => setShowTaskDropdown(!showTaskDropdown)}
                    className="w-full py-3 px-4 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-500 transition-colors flex items-center justify-between"
                  >
                    <span className={selectedTask ? "text-gray-900" : "text-gray-500"}>
                      {selectedTask || '태스크를 선택하세요'}
                    </span>
                    <span className="text-gray-400">▼</span>
                  </button>
                  
                  {/* 태스크 드롭다운 */}
                  {showTaskDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                      {tasksByFactory[selectedFactory]?.map((task, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedTask(task);
                            setShowTaskDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          {task}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 날짜 선택 */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  작업 기간
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* 시작 날짜 */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">시작일</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        // quickAddData가 있으면 (드래그 앤 드롭) 종료일도 같은 날로 설정
                        if (quickAddData && !endDate) {
                          setEndDate(e.target.value);
                        }
                      }}
                      className="w-full py-2 px-3 border-2 border-gray-300 rounded-lg hover:border-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                  
                  {/* 종료 날짜 */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">종료일</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                      className="w-full py-2 px-3 border-2 border-gray-300 rounded-lg hover:border-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button 
            onClick={handleCancel}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            취소
          </button>
          <button 
            onClick={handleSave}
            disabled={!selectedFactory || !selectedTask || !startDate || !endDate}
            className={`px-6 py-2 rounded-lg transition-colors ${
              selectedFactory && selectedTask && startDate && endDate
                ? 'text-white bg-blue-600 hover:bg-blue-700'
                : 'text-gray-400 bg-gray-200 cursor-not-allowed'
            }`}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowModal;