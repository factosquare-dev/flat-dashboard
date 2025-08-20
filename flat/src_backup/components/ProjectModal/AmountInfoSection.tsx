import React from 'react';
import { DollarSign } from 'lucide-react';
import type { ProjectData } from './types';
import { formatCurrency } from '@/utils/coreUtils';
import './AmountInfoSection.css';

interface AmountInfoSectionProps {
  formData: ProjectData;
  onChange: (updates: Partial<ProjectData>) => void;
}

const AmountInfoSection: React.FC<AmountInfoSectionProps> = ({ formData, onChange }) => {
  const formatCurrencyValue = (value: string | number) => {
    const stringValue = String(value || '');
    const num = stringValue.replace(/[^0-9]/g, '');
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
    <div className="amount-info-section">
      <h3 className="amount-info-section__header">
        <DollarSign className="amount-info-section__icon" />
        금액 정보
      </h3>
      <div className="amount-info-section__grid">
        <div className="amount-info-section__group">
          <label className="amount-info-section__label">매출</label>
          <input
            type="text"
            value={formatCurrencyValue(formData.sales)}
            onChange={(e) => handleCurrencyChange('sales', e.target.value)}
            onKeyPress={handleKeyPress}
            className="amount-info-section__input"
            placeholder="매출 금액"
          />
        </div>
        <div className="amount-info-section__group">
          <label className="amount-info-section__label">매입</label>
          <input
            type="text"
            value={formatCurrencyValue(formData.purchase)}
            onChange={(e) => handleCurrencyChange('purchase', e.target.value)}
            onKeyPress={handleKeyPress}
            className="amount-info-section__input"
            placeholder="매입 금액"
          />
        </div>
      </div>
    </div>
  );
};

export default AmountInfoSection;