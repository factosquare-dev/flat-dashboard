import React from 'react';
import FormInput from '../common/FormInput';
import FormGroup from '../common/FormGroup';

interface OrderInfoFormProps {
  deliveryQuantity: string;
  usageLocation: string;
  receiveMethod: string;
  consumptionUnit: string;
  onChange: (field: string, value: string) => void;
}

const OrderInfoForm: React.FC<OrderInfoFormProps> = ({
  deliveryQuantity,
  usageLocation,
  receiveMethod,
  consumptionUnit,
  onChange
}) => {
  return (
    <FormGroup title="발주 정보">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="발주수량"
            value={deliveryQuantity}
            onChange={(e) => onChange('deliveryQuantity', e.target.value)}
            placeholder="예: 1000개"
          />
          <FormInput
            label="용량"
            value={usageLocation}
            onChange={(e) => onChange('usageLocation', e.target.value)}
            placeholder="예: 200ml"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="희망가격(개당 단가)"
            value={receiveMethod}
            onChange={(e) => onChange('receiveMethod', e.target.value)}
            placeholder="예: 1,500원"
          />
          <FormInput
            label="용기/부자재 사양"
            value={consumptionUnit}
            onChange={(e) => onChange('consumptionUnit', e.target.value)}
            placeholder="예: 펌프용기"
          />
        </div>
      </div>
    </FormGroup>
  );
};

export default OrderInfoForm;