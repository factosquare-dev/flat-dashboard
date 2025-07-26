/**
 * Customer type definitions
 */

import { CustomerId, UserId } from './branded';

export interface Customer {
  id: CustomerId;
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
  createdBy?: UserId;
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