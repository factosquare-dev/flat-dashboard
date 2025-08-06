import { Factory } from '@/types/factory';
import { TIME_CONSTANTS } from '@/constants/time';
import { FactoryType } from '@/types/enums';
import { toFactoryId } from '@/types/branded';
import type { CertificationType } from '@/data/factories';

// Initial factory data to avoid circular dependency
const INITIAL_FACTORIES = [
  {
    id: toFactoryId('mfg-1'),
    name: '누벨르 코스메틱',
    type: FactoryType.MANUFACTURING,
    address: '경기도 화성시 향남읍 제약공단1길 15',
    contact: '031-366-7890',
    email: 'contact@nouvelle.co.kr',
    capacity: '10,000개/월',
    certifications: ['ISO 22716', 'CGMP'] as CertificationType[],
  },
  {
    id: toFactoryId('mfg-2'),
    name: '퓨어 뷰티랩',
    type: FactoryType.MANUFACTURING,
    address: '충북 청주시 흥덕구 오송읍 오송생명로 123',
    contact: '043-249-8800',
    email: 'info@purebeautylab.co.kr',
    capacity: '20,000개/월',
    certifications: ['ISO 22716', 'CGMP', 'ISO 14001'] as CertificationType[],
  },
  // Add more factories as needed...
];

export const createFactories = (): Factory[] => {
  // Use initial factory data instead of importing from factories.ts
  return INITIAL_FACTORIES.map((factory, index) => {
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