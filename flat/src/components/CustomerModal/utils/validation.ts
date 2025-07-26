import { customerSchema, validateSchema, CustomerFormData } from '../../../validation/schemas';
import type { Customer } from '../../../types/customer';

export { CustomerFormData };

export const validateCustomerForm = (formData: CustomerFormData): Record<string, string> => {
  const result = validateSchema(customerSchema, formData);
  return result.errors ?? {};
};

export const getInitialFormData = (editData?: Partial<Customer>): CustomerFormData => {
  if (editData) {
    return {
      name: editData.name ?? '',
      companyName: editData.companyName ?? '',
      contactPerson: editData.contactPerson ?? '',
      contactNumber: editData.contactNumber ?? '',
      email: editData.email ?? '',
      address: editData.address ?? '',
      businessNumber: editData.businessNumber ?? '',
      industry: editData.industry ?? '',
      notes: editData.notes ?? ''
    };
  }
  
  return {
    name: '',
    companyName: '',
    contactPerson: '',
    contactNumber: '',
    email: '',
    address: '',
    businessNumber: '',
    industry: '',
    notes: ''
  };
};