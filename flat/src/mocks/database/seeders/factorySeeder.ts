import { Factory } from '@/types/factory';
import { TIME_CONSTANTS } from '../../../constants/time';
import { FactoryType } from '@/types/enums';
import { factories as originalFactories } from '../../../data/factories';

export const createFactories = (): Factory[] => {
  // Convert all 15 factories from the original data
  return originalFactories.map((factory, index) => {
    // Determine capacity as number based on original string capacity
    const capacityNumber = parseInt(factory.capacity.match(/\d+/)?.[0] || '100');
    
    // Create manager object from first manager or use default
    const manager = factory.managers?.[0] || {
      name: `담당자${index + 1}`,
      phone: `010-${String(1000 + index).padStart(4, '0')}-${String(5000 + index).padStart(4, '0')}`,
      email: factory.email || `manager${index + 1}@${factory.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}.com`,
    };
    
    return {
      id: factory.id,
      name: factory.name,
      type: factory.type,
      address: factory.address,
      contactNumber: factory.contact,
      manager: {
        name: manager.name,
        phone: manager.phone,
        email: manager.email,
      },
      capacity: capacityNumber,
      certifications: factory.certifications,
      establishedDate: new Date(Date.now() - ((15 - index) * TIME_CONSTANTS.YEAR)), // 1-15 years ago
      isActive: true,
    };
  });
};