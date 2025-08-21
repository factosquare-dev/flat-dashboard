import { Factory } from '@/shared/types/factory';
import { TIME_CONSTANTS } from '@/shared/constants/time';
import { FactoryType } from '@/shared/types/enums';
import { toFactoryId } from '@/shared/types/branded';
import type { CertificationType } from '@/core/database/factories';

// Initial factory data to avoid circular dependency
const INITIAL_FACTORIES = [
  // Manufacturing Factories (제조 공장) - 5개
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
  {
    id: toFactoryId('mfg-3'),
    name: '글로벌 코스메틱',
    type: FactoryType.MANUFACTURING,
    address: '인천광역시 남동구 남동대로 350',
    contact: '032-815-5000',
    email: 'contact@globalcos.co.kr',
    capacity: '30,000개/월',
    certifications: ['ISO 22716', 'CGMP', 'VEGAN', 'HALAL'] as CertificationType[],
  },
  {
    id: toFactoryId('mfg-4'),
    name: '네이처 바이오텍',
    type: FactoryType.MANUFACTURING,
    address: '경기도 성남시 분당구 판교로 255',
    contact: '031-728-9000',
    email: 'info@naturebiotech.co.kr',
    capacity: '25,000개/월',
    certifications: ['ISO 22716', 'CGMP', 'COSMOS', 'ECOCERT'] as CertificationType[],
  },
  {
    id: toFactoryId('mfg-5'),
    name: 'K-뷰티 이노베이션',
    type: FactoryType.MANUFACTURING,
    address: '대전광역시 유성구 테크노2로 187',
    contact: '042-860-7000',
    email: 'contact@kbeautyinno.co.kr',
    capacity: '15,000개/월',
    certifications: ['ISO 22716', 'CGMP', 'ISO 9001'] as CertificationType[],
  },

  // Container Factories (용기 공장) - 5개
  {
    id: toFactoryId('cont-1'),
    name: '프리미엄 패키지',
    type: FactoryType.CONTAINER,
    address: '경기도 안산시 단원구 시화공단3길 77',
    contact: '031-494-5500',
    email: 'sales@premiumpack.co.kr',
    capacity: '50,000개/월',
    certifications: ['ISO 9001', 'ISO 14001'] as CertificationType[],
  },
  {
    id: toFactoryId('cont-2'),
    name: '에코 컨테이너',
    type: FactoryType.CONTAINER,
    address: '경기도 포천시 소흘읍 죽엽산로 245',
    contact: '031-544-2200',
    email: 'info@ecocontainer.co.kr',
    capacity: '40,000개/월',
    certifications: ['ISO 9001', 'FSC'] as CertificationType[],
  },
  {
    id: toFactoryId('cont-3'),
    name: '스마트 플라스틱',
    type: FactoryType.CONTAINER,
    address: '경기도 김포시 양촌읍 황금로 117',
    contact: '031-986-7700',
    email: 'contact@smartplastic.co.kr',
    capacity: '60,000개/월',
    certifications: ['ISO 9001', 'ISO 14001', 'ISO 45001'] as CertificationType[],
  },
  {
    id: toFactoryId('cont-4'),
    name: '크리스탈 글라스',
    type: FactoryType.CONTAINER,
    address: '충남 아산시 둔포면 아산밸리로 177',
    contact: '041-530-8800',
    email: 'sales@crystalglass.co.kr',
    capacity: '30,000개/월',
    certifications: ['ISO 9001'] as CertificationType[],
  },
  {
    id: toFactoryId('cont-5'),
    name: '럭셔리 보틀',
    type: FactoryType.CONTAINER,
    address: '경기도 평택시 진위면 진위산단로 62',
    contact: '031-668-9900',
    email: 'info@luxurybottle.co.kr',
    capacity: '35,000개/월',
    certifications: ['ISO 9001', 'ISO 14001'] as CertificationType[],
  },

  // Packaging Factories (포장 공장) - 5개
  {
    id: toFactoryId('pack-1'),
    name: '아트 패키징',
    type: FactoryType.PACKAGING,
    address: '서울특별시 성동구 성수이로 147',
    contact: '02-2204-5500',
    email: 'design@artpackaging.co.kr',
    capacity: '100,000개/월',
    certifications: ['ISO 9001', 'FSC'] as CertificationType[],
  },
  {
    id: toFactoryId('pack-2'),
    name: '디자인 프린팅',
    type: FactoryType.PACKAGING,
    address: '경기도 파주시 탄현면 월롱산로 255',
    contact: '031-955-8800',
    email: 'contact@designprinting.co.kr',
    capacity: '80,000개/월',
    certifications: ['ISO 9001', 'ISO 14001', 'FSC'] as CertificationType[],
  },
  {
    id: toFactoryId('pack-3'),
    name: '이노팩 솔루션',
    type: FactoryType.PACKAGING,
    address: '경기도 군포시 번영로 82',
    contact: '031-477-2200',
    email: 'sales@innopack.co.kr',
    capacity: '90,000개/월',
    certifications: ['ISO 9001'] as CertificationType[],
  },
  {
    id: toFactoryId('pack-4'),
    name: '그린 패키징',
    type: FactoryType.PACKAGING,
    address: '경기도 광주시 오포읍 오포로 538',
    contact: '031-766-5500',
    email: 'eco@greenpackaging.co.kr',
    capacity: '70,000개/월',
    certifications: ['ISO 9001', 'FSC', 'ISO 14001'] as CertificationType[],
  },
  {
    id: toFactoryId('pack-5'),
    name: '프리미어 박스',
    type: FactoryType.PACKAGING,
    address: '경기도 이천시 부발읍 경충대로 2111',
    contact: '031-635-7700',
    email: 'info@premierbox.co.kr',
    capacity: '85,000개/월',
    certifications: ['ISO 9001', 'FSC'] as CertificationType[],
  },
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