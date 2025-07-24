import { FACTORY_TYPES, TASK_TYPES } from '../constants/factory';

// 공장 인증 타입
export type CertificationType = 
  | 'ISO 22716'  // 화장품 GMP
  | 'CGMP'       // 화장품 우수제조관리기준
  | 'ISO 9001'   // 품질경영시스템
  | 'ISO 14001'  // 환경경영시스템
  | 'ISO 45001'  // 안전보건경영시스템
  | 'FSC'        // 산림관리협의회 인증
  | 'VEGAN'      // 비건 인증
  | 'HALAL'      // 할랄 인증
  | 'EWG'        // EWG 인증
  | 'COSMOS'     // 유기농 화장품 인증
  | 'ECOCERT';   // 에코서트 인증

export interface FactoryManager {
  name: string;
  email: string;
  phone: string;
  position: string; // 직책/직함
}

export interface Factory {
  id: string;
  name: string;
  type: '제조' | '용기' | '포장';
  address: string;
  contact: string;
  email: string;
  capacity: string;
  certifications: CertificationType[];
  managers?: FactoryManager[]; // 공장 담당자들 (복수)
}

export const factories: Factory[] = [
  // 제조 공장들
  {
    id: 'mfg-1',
    name: '큐셀시스템',
    type: '제조',
    address: '경기도 성남시 중원구 둔촌대로 388',
    contact: '031-737-3000',
    email: 'info@qcellsystem.com',
    capacity: '월 100톤',
    certifications: ['ISO 22716', 'CGMP', 'ISO 9001'],
    managers: [
      {
        name: '김철수',
        email: 'kim@qcellsystem.com',
        phone: '010-1234-5678',
        position: '공장장'
      },
      {
        name: '이영희',
        email: 'lee@qcellsystem.com',
        phone: '010-2345-6789',
        position: '품질관리 팀장'
      }
    ]
  },
  {
    id: 'mfg-2',
    name: '주식회사 코스모로스',
    type: '제조',
    address: '인천광역시 남동구 남동서로 350',
    contact: '032-812-5000',
    email: 'contact@cosmoros.kr',
    capacity: '월 150톤',
    certifications: ['ISO 22716', 'CGMP', 'ISO 14001']
  },
  {
    id: 'mfg-3',
    name: '(주)뷰티팩토리',
    type: '제조',
    address: '경기도 화성시 향남읍 제약공단로 124',
    contact: '031-366-7000',
    email: 'sales@beautyfactory.co.kr',
    capacity: '월 80톤',
    certifications: ['ISO 22716', 'CGMP']
  },
  {
    id: 'mfg-4',
    name: '코스메카코리아',
    type: '제조',
    address: '충북 청주시 흥덕구 오송읍 오송생명로 123',
    contact: '043-249-6000',
    email: 'info@cosmecca.com',
    capacity: '월 200톤',
    certifications: ['ISO 22716', 'CGMP', 'ISO 9001', 'ISO 14001']
  },
  {
    id: 'mfg-5',
    name: '(주)아모레퍼시픽 오산공장',
    type: '제조',
    address: '경기도 오산시 중앙로 160',
    contact: '031-370-5000',
    email: 'factory@amorepacific.com',
    capacity: '월 300톤',
    certifications: ['ISO 22716', 'CGMP', 'ISO 9001', 'ISO 14001', 'ISO 45001']
  },

  // 용기 공장들
  {
    id: 'cont-1',
    name: '(주)연우',
    type: '용기',
    address: '경기도 안산시 단원구 엠티브이25로 20',
    contact: '031-494-7000',
    email: 'sales@yeonwoo.co.kr',
    capacity: '월 500만개',
    certifications: ['ISO 9001', 'ISO 14001']
  },
  {
    id: 'cont-2',
    name: '삼화플라스틱',
    type: '용기',
    address: '경기도 김포시 대곶면 대곶북로 436',
    contact: '031-981-2000',
    email: 'info@samhwaplastic.com',
    capacity: '월 800만개',
    certifications: ['ISO 9001']
  },
  {
    id: 'cont-3',
    name: '(주)에이치피씨',
    type: '용기',
    address: '경기도 평택시 포승읍 평택항만길 156',
    contact: '031-682-8800',
    email: 'contact@hpc.co.kr',
    capacity: '월 600만개',
    certifications: ['ISO 9001', 'ISO 14001']
  },
  {
    id: 'cont-4',
    name: '태성산업(주)',
    type: '용기',
    address: '충남 아산시 인주면 인주산단로 123',
    contact: '041-533-3000',
    email: 'sales@taesung.com',
    capacity: '월 1000만개',
    certifications: ['ISO 9001', 'ISO 14001', 'ISO 45001']
  },
  {
    id: 'cont-5',
    name: '(주)펌텍코리아',
    type: '용기',
    address: '인천광역시 서구 원창로 134',
    contact: '032-561-5000',
    email: 'info@pumtech.co.kr',
    capacity: '월 700만개',
    certifications: ['ISO 9001']
  },

  // 포장 공장들
  {
    id: 'pack-1',
    name: '(주)네트모베이지',
    type: '포장',
    address: '서울특별시 금천구 가산디지털1로 145',
    contact: '02-2038-8000',
    email: 'contact@netmovage.com',
    capacity: '월 2000만개',
    certifications: ['ISO 9001', 'FSC']
  },
  {
    id: 'pack-2',
    name: '서울포장산업(주)',
    type: '포장',
    address: '경기도 파주시 조리읍 장곡로 247',
    contact: '031-955-6000',
    email: 'info@seoulpack.co.kr',
    capacity: '월 1500만개',
    certifications: ['ISO 9001', 'FSC', 'ISO 14001']
  },
  {
    id: 'pack-3',
    name: '(주)한솔피엔에스',
    type: '포장',
    address: '경기도 안양시 동안구 시민대로 361',
    contact: '031-380-1000',
    email: 'sales@hansolpns.com',
    capacity: '월 2500만개',
    certifications: ['ISO 9001', 'FSC', 'ISO 14001']
  },
  {
    id: 'pack-4',
    name: '대림포장(주)',
    type: '포장',
    address: '충북 음성군 대소면 대금로 290',
    contact: '043-881-5000',
    email: 'contact@daelimpack.co.kr',
    capacity: '월 1800만개',
    certifications: ['ISO 9001', 'FSC']
  },
  {
    id: 'pack-5',
    name: '(주)새한패키지',
    type: '포장',
    address: '경남 양산시 산막공단북로 63',
    contact: '055-387-5000',
    email: 'info@saehanpack.com',
    capacity: '월 1200만개',
    certifications: ['ISO 9001', 'ISO 14001']
  }
];

// 타입별 공장 필터링 헬퍼 함수
export const getFactoriesByType = (type: '제조' | '용기' | '포장'): Factory[] => {
  return factories.filter(factory => factory.type === type);
};

// 공장 ID로 공장 정보 가져오기
export const getFactoryById = (id: string): Factory | undefined => {
  return factories.find(factory => factory.id === id);
};

// 공장 이름으로 공장 정보 가져오기
export const getFactoryByName = (name: string): Factory | undefined => {
  return factories.find(factory => factory.name === name);
};

// 각 타입별 태스크 유형 (TASK_TYPES enum 사용)
export const taskTypesByFactoryType = {
  [FACTORY_TYPES.MANUFACTURING]: [
    TASK_TYPES.MANUFACTURING.MATERIAL_RECEIPT,
    TASK_TYPES.MANUFACTURING.MATERIAL_INSPECTION,
    TASK_TYPES.MANUFACTURING.MIXING,
    TASK_TYPES.MANUFACTURING.BLENDING,
    TASK_TYPES.MANUFACTURING.AGING,
    TASK_TYPES.MANUFACTURING.FIRST_QUALITY_CHECK,
    TASK_TYPES.MANUFACTURING.FILLING,
    TASK_TYPES.MANUFACTURING.SECOND_QUALITY_CHECK,
    TASK_TYPES.MANUFACTURING.STABILITY_TEST,
    TASK_TYPES.MANUFACTURING.FINAL_INSPECTION,
    TASK_TYPES.MANUFACTURING.SHIPPING_PREP
  ],
  [FACTORY_TYPES.CONTAINER]: [
    TASK_TYPES.CONTAINER.DESIGN,
    TASK_TYPES.CONTAINER.MOLD_MAKING,
    TASK_TYPES.CONTAINER.PROTOTYPE_MAKING,
    TASK_TYPES.CONTAINER.INJECTION_MOLDING,
    TASK_TYPES.CONTAINER.CONTAINER_INSPECTION,
    TASK_TYPES.CONTAINER.PRINTING_LABELING,
    TASK_TYPES.CONTAINER.SURFACE_TREATMENT,
    TASK_TYPES.CONTAINER.ASSEMBLY,
    TASK_TYPES.CONTAINER.PACKAGING_PREP,
    TASK_TYPES.CONTAINER.QUALITY_CHECK,
    TASK_TYPES.CONTAINER.SHIPPING
  ],
  [FACTORY_TYPES.PACKAGING]: [
    TASK_TYPES.PACKAGING.DESIGN,
    TASK_TYPES.PACKAGING.PRINT_PREP,
    TASK_TYPES.PACKAGING.MATERIAL_MAKING,
    TASK_TYPES.PACKAGING.PACKAGING_WORK,
    TASK_TYPES.PACKAGING.LABEL_ATTACHMENT,
    TASK_TYPES.PACKAGING.BOX_PACKAGING,
    TASK_TYPES.PACKAGING.SHRINK_WRAP,
    TASK_TYPES.PACKAGING.PACKAGING_INSPECTION,
    TASK_TYPES.PACKAGING.PALLET_LOADING,
    TASK_TYPES.PACKAGING.SHIPPING_PREP,
    TASK_TYPES.PACKAGING.DELIVERY
  ],
  // 하위 호환성을 위한 한글 키 매핑
  '제조': [
    TASK_TYPES.MANUFACTURING.MATERIAL_RECEIPT,
    TASK_TYPES.MANUFACTURING.MATERIAL_INSPECTION,
    TASK_TYPES.MANUFACTURING.MIXING,
    TASK_TYPES.MANUFACTURING.BLENDING,
    TASK_TYPES.MANUFACTURING.AGING,
    TASK_TYPES.MANUFACTURING.FIRST_QUALITY_CHECK,
    TASK_TYPES.MANUFACTURING.FILLING,
    TASK_TYPES.MANUFACTURING.SECOND_QUALITY_CHECK,
    TASK_TYPES.MANUFACTURING.STABILITY_TEST,
    TASK_TYPES.MANUFACTURING.FINAL_INSPECTION,
    TASK_TYPES.MANUFACTURING.SHIPPING_PREP
  ],
  '용기': [
    TASK_TYPES.CONTAINER.DESIGN,
    TASK_TYPES.CONTAINER.MOLD_MAKING,
    TASK_TYPES.CONTAINER.PROTOTYPE_MAKING,
    TASK_TYPES.CONTAINER.INJECTION_MOLDING,
    TASK_TYPES.CONTAINER.CONTAINER_INSPECTION,
    TASK_TYPES.CONTAINER.PRINTING_LABELING,
    TASK_TYPES.CONTAINER.SURFACE_TREATMENT,
    TASK_TYPES.CONTAINER.ASSEMBLY,
    TASK_TYPES.CONTAINER.PACKAGING_PREP,
    TASK_TYPES.CONTAINER.QUALITY_CHECK,
    TASK_TYPES.CONTAINER.SHIPPING
  ],
  '포장': [
    TASK_TYPES.PACKAGING.DESIGN,
    TASK_TYPES.PACKAGING.PRINT_PREP,
    TASK_TYPES.PACKAGING.MATERIAL_MAKING,
    TASK_TYPES.PACKAGING.PACKAGING_WORK,
    TASK_TYPES.PACKAGING.LABEL_ATTACHMENT,
    TASK_TYPES.PACKAGING.BOX_PACKAGING,
    TASK_TYPES.PACKAGING.SHRINK_WRAP,
    TASK_TYPES.PACKAGING.PACKAGING_INSPECTION,
    TASK_TYPES.PACKAGING.PALLET_LOADING,
    TASK_TYPES.PACKAGING.SHIPPING_PREP,
    TASK_TYPES.PACKAGING.DELIVERY
  ]
};