import React, { useState } from 'react';
import { Calendar, CheckSquare, Building2, ChevronRight } from 'lucide-react';
import BaseModal from './common/BaseModal';
import FormInput from './common/FormInput';
import Button from './common/Button';

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
    <BaseModal
      isOpen={isOpen}
      onClose={handleCancel}
      title="워크플로우 추가"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={handleCancel}>
            취소
          </Button>
          <Button 
            variant="primary"
            onClick={handleSave}
            disabled={!selectedFactory || !selectedTask || !startDate || !endDate}
          >
            저장
          </Button>
        </div>
      }
    >

      <div className="space-y-6">
        {/* 공장 선택 - 카드 스타일 */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            공장 선택
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {factories.map((factory, index) => (
              <button
                key={index}
                onClick={() => handleFactorySelect(factory.name)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedFactory === factory.name 
                    ? getLightColorClass(factory.color)
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getDotColorClass(factory.color)}`}></div>
                  <span className="text-sm font-medium text-gray-800">{factory.name}</span>
                  {selectedFactory === factory.name && (
                    <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 태스크 선택 & 날짜 선택 - 공장 선택 후 표시 */}
        {showTaskSelection && (
          <>
            {/* 태스크 선택 */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                태스크 선택
              </h3>
              
              <div className="relative">
                <button
                  onClick={() => setShowTaskDropdown(!showTaskDropdown)}
                  className="w-full py-2 px-3 text-sm bg-white border border-gray-300 rounded-lg hover:border-blue-500 transition-colors flex items-center justify-between focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                >
                  <span className={selectedTask ? "text-gray-900" : "text-gray-500"}>
                    {selectedTask || '태스크를 선택하세요'}
                  </span>
                  <span className="text-gray-400">▼</span>
                </button>
                
                {/* 태스크 드롭다운 */}
                {showTaskDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {tasksByFactory[selectedFactory]?.map((task, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedTask(task);
                          setShowTaskDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        {task}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 날짜 선택 */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                작업 기간
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  type="date"
                  label="시작일"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (quickAddData && !endDate) {
                      setEndDate(e.target.value);
                    }
                  }}
                />
                
                <FormInput
                  type="date"
                  label="종료일"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </BaseModal>
  );
};

export default WorkflowModal;