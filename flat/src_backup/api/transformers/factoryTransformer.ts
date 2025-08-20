import type { Factory, FactoryType } from '@/types/factory';
import type { ApiResponse } from '@/types/api';
import { toFactoryId, toFactoryIdSafe, toUserId } from '@/types/branded';

// API Response interfaces
interface ApiFactory {
  id: string;
  name: string;
  type: string;
  status: string;
  address: string;
  contact_person: string;
  contact_number: string;
  email: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  capabilities?: string[];
  certifications?: string[];
  capacity?: number;
  lead_time?: number;
  minimum_order?: number;
}

/**
 * Transform API factory response to domain model with branded types
 */
export function transformApiFactory(apiFactory: ApiFactory): Factory {
  return {
    id: toFactoryId(apiFactory.id),
    name: apiFactory.name,
    type: apiFactory.type as FactoryType,
    status: apiFactory.status,
    address: apiFactory.address,
    contactPerson: apiFactory.contact_person,
    contactNumber: apiFactory.contact_number,
    email: apiFactory.email,
    createdBy: toUserId(apiFactory.created_by),
    createdAt: new Date(apiFactory.created_at),
    updatedAt: new Date(apiFactory.updated_at),
    capabilities: apiFactory.capabilities ?? [],
    certifications: apiFactory.certifications ?? [],
    capacity: apiFactory.capacity,
    leadTime: apiFactory.lead_time,
    minimumOrder: apiFactory.minimum_order
  };
}

/**
 * Transform domain model to API request format
 */
export function transformFactoryToApi(factory: Partial<Factory>): Partial<ApiFactory> {
  const apiFactory: Partial<ApiFactory> = {};
  
  if (factory.id) apiFactory.id = factory.id;
  if (factory.name) apiFactory.name = factory.name;
  if (factory.type) apiFactory.type = factory.type;
  if (factory.status) apiFactory.status = factory.status;
  if (factory.address) apiFactory.address = factory.address;
  if (factory.contactPerson) apiFactory.contact_person = factory.contactPerson;
  if (factory.contactNumber) apiFactory.contact_number = factory.contactNumber;
  if (factory.email) apiFactory.email = factory.email;
  if (factory.capabilities) apiFactory.capabilities = factory.capabilities;
  if (factory.certifications) apiFactory.certifications = factory.certifications;
  if (factory.capacity !== undefined) apiFactory.capacity = factory.capacity;
  if (factory.leadTime !== undefined) apiFactory.lead_time = factory.leadTime;
  if (factory.minimumOrder !== undefined) apiFactory.minimum_order = factory.minimumOrder;
  
  return apiFactory;
}

/**
 * Transform paginated API response
 */
export function transformApiFactoryList(response: ApiResponse<ApiFactory[]>): ApiResponse<Factory[]> {
  if (!response.success || !response.data) {
    return response as ApiResponse<Factory[]>;
  }
  
  return {
    ...response,
    data: response.data.map(transformApiFactory)
  };
}

/**
 * Validate and transform factory ID from API
 */
export function validateApiFactoryId(id: unknown): string {
  if (typeof id !== 'string') {
    throw new Error(`Invalid factory ID type: ${typeof id}`);
  }
  
  const factoryId = toFactoryIdSafe(id);
  if (!factoryId) {
    throw new Error(`Invalid factory ID format: ${id}`);
  }
  
  return factoryId;
}