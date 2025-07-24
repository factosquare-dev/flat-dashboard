/**
 * Customer type definitions
 */

export interface Customer {
  id: string;
  name: string;
  companyName: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  address?: string;
  businessNumber?: string;
  industry?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  notes?: string;
}

export interface CreateCustomerInput {
  name: string;
  companyName: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  address?: string;
  businessNumber?: string;
  industry?: string;
  notes?: string;
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {
  isActive?: boolean;
}