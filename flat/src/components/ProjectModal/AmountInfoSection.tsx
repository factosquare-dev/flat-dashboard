import React from 'react';
import { DollarSign } from 'lucide-react';
import type { ProjectData } from './types';
import { formatCurrency } from '../../utils/currency';

interface AmountInfoSectionProps {
  formData: ProjectData;
  onChange: (updates: Partial<ProjectData>) => void;
}

const AmountInfoSection: React.FC<AmountInfoSectionProps> = ({ formData, onChange }) => {
  const formatCurrencyValue = (value: string) => {
    const num = value.replace(/[^0-9]/g, '');
    if (!num) return '';
    return formatCurrency(parseInt(num));
  };

  const handleCurrencyChange = (field: 'sales' | 'purchase', value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    onChange({ [field]: numericValue });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
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
            value={formatCurrencyValue(formData.sales)}
            onChange={(e) => handleCurrencyChange('sales', e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="매출 금액"
          />
        </div>
        <div className="group">
          <label className="block text-sm font-medium text-gray-700 mb-2">매입</label>
          <input
            type="text"
            value={formatCurrencyValue(formData.purchase)}
            onChange={(e) => handleCurrencyChange('purchase', e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="매입 금액"
          />
        </div>
      </div>
    </div>
  );
};

export default AmountInfoSection;