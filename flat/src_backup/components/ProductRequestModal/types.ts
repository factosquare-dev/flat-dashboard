/**
 * Product Request Modal types
 */

export interface ProductRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: ProductRequestData) => void;
  onSendEmail?: (data: ProductRequestData) => void;
  availableFactories?: Array<{ name: string; color: string }>;
}

export interface ProductRequestData {
  brandName: string;
  targetProduct: string;
  receiveMethod: string;
  deliveryQuantity: string;
  usageLocation: string;
  consumptionUnit: string;
  receiptInfo: {
    targetType: string;
    useGuidance: string;
    quantity: string;
    shape: string;
    requiredFormulation: string;
  };
  contentInfo: {
    containerSpecifications: string;
    fillingVolume: string;
    functionalComponent: string;
    mainIngredient: string;
    productionPreference: string;
  };
  deliverySchedule: string;
  requirements: string;
}

export interface FormFieldProps {
  formData: ProductRequestData;
  updateFormData: (field: string, value: any) => void;
  errors: Record<string, string>;
}