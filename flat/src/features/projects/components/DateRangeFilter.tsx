import React, { useState, useRef, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { formatDateISO } from '../../../utils/coreUtils';

interface DateRangeFilterProps {
  value: { startDate: string | null; endDate: string | null };
  onChange: (range: { startDate: string | null; endDate: string | null }) => void;
}

type PeriodOption = '1month' | '3months' | '6months' | 'custom';

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ value, onChange }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>('3months');
  const [previousPeriod, setPreviousPeriod] = useState<PeriodOption>('3months');
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const datePickerRef = useRef<HTMLDivElement>(null);
  
  // 컴포넌트 마운트 시 3개월 기본값 설정
  useEffect(() => {
    if (!value.startDate && !value.endDate) {
      handlePeriodChange('3months');
    }
  }, []);
  
  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowCustomDatePicker(false);
        // 사용자 지정을 취소하면 이전 선택으로 돌아감
        if (selectedPeriod === 'custom' && previousPeriod !== 'custom') {
          setCustomStartDate('');
          setCustomEndDate('');
          setSelectedPeriod(previousPeriod);
          handlePeriodChange(previousPeriod);
        }
      }
    };
    
    if (showCustomDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCustomDatePicker, selectedPeriod, previousPeriod]);

  const handlePeriodChange = (period: PeriodOption) => {
    // 사용자 지정이 아닌 경우 이전 기간 저장
    if (period !== 'custom') {
      setPreviousPeriod(period);
    }
    
    setSelectedPeriod(period);
    
    if (period === 'custom') {
      // 사용자 지정 선택 시 기본값 설정 (오늘부터 3개월 전)
      const today = new Date();
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      setCustomEndDate(formatDateISO(today));
      setCustomStartDate(formatDateISO(threeMonthsAgo));
      setShowCustomDatePicker(true);
      return;
    }
    
    setShowCustomDatePicker(false);
    
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '1month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(startDate.getMonth() - 6);
        break;
    }
    
    onChange({
      startDate: formatDateISO(startDate),
      endDate: formatDateISO(endDate)
    });
  };

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      onChange({
        startDate: customStartDate,
        endDate: customEndDate
      });
      setShowCustomDatePicker(false);
      // 사용자 지정 날짜가 적용되면 custom을 이전 기간으로 저장
      setPreviousPeriod('custom');
    }
  };

  const periodOptions = [
    { value: '1month' as PeriodOption, label: '1개월' },
    { value: '3months' as PeriodOption, label: '3개월' },
    { value: '6months' as PeriodOption, label: '6개월' },
    { value: 'custom' as PeriodOption, label: '사용자 지정' }
  ];

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-400" />
        <div className="flex gap-1">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handlePeriodChange(option.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                selectedPeriod === option.value
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      {showCustomDatePicker && (
        <div ref={datePickerRef} className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-20">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                시작일
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                종료일
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCustomDateApply}
                className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                적용
              </button>
              <button
                onClick={() => {
                  setShowCustomDatePicker(false);
                  setCustomStartDate('');
                  setCustomEndDate('');
                  // 이전 선택으로 돌아감
                  setSelectedPeriod(previousPeriod);
                  handlePeriodChange(previousPeriod);
                }}
                className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;