import type { ProjectFactory } from '../types/project';
import { factories, getFactoriesByType } from './factories';
import { MockDatabaseImpl } from '../mocks/database/MockDatabase';

// 고객사 목록 - Mock DB에서 가져오기
const getAllClients = () => {
  try {
    const db = MockDatabaseImpl.getInstance();
    const database = db.getDatabase();
    const customers = Array.from(database.customers.values());
    return customers.map(customer => customer.name);
  } catch (error) {
    console.warn('Failed to load clients from mock DB:', error);
    // Fallback to static data
    return [
      '뷰티코리아',
      '그린코스메틱', 
      '코스메디칼',
      '퍼스트뷰티'
    ];
  }
};

export const allClients = getAllClients();

// factories.ts에서 가져온 공장 데이터를 기반으로 구성
const manufacturingFactories = getFactoriesByType('제조');
const containerFactories = getFactoriesByType('용기');
const packagingFactories = getFactoriesByType('포장');

// 공장별 태스크 목록
export const tasksByFactory: { [key: string]: string[] } = {
  '큐셀시스템': ['PCB 설계', 'SMT 작업', '최종 조립', '품질 검사', '포장'],
  '(주)연우': ['금형 제작', '사출 성형', '도장 작업', '조립', '검수'],
  '(주)네트모베이지': ['회로 설계', '펌웨어 개발', '하드웨어 테스트', '인증 시험'],
  '주식회사 코스모로스': ['기구 설계', '시제품 제작', '성능 테스트', '양산 준비']
};

// 사용 가능한 인증서 목록
export const availableCertifications = [
  'ISO 22716', 'CGMP', 'ISO 9001', 'ISO 14001', 'ISO 45001',
  'FSC', 'VEGAN', 'HALAL', 'EWG', 'COSMOS', 'ECOCERT'
];

// 프로젝트 색상 팔레트
export const projectColors = [
  "#3B82F6", // 블루 (신뢰감)
  "#10B981", // 에메랄드 (성장)
  "#8B5CF6", // 바이올렛 (창의성)
  "#F59E0B", // 앰버 (따뜻함)
  "#EC4899", // 핑크 (혁신)
  "#14B8A6", // 틸 (차분함)
  "#6366F1", // 인디고 (전문성)
  "#84CC16", // 라임 (신선함)
  "#F97316", // 오렌지 (활력)
  "#06B6D4"  // 시안 (기술)
];

// 공장 타입별 분류 (factories.ts 데이터 활용)
export const factoriesByType = {
  manufacturing: manufacturingFactories.map(f => ({
    id: f.id,
    name: f.name,
    type: 'manufacturing' as const
  })),
  container: containerFactories.map(f => ({
    id: f.id,
    name: f.name,
    type: 'container' as const
  })),
  packaging: packagingFactories.map(f => ({
    id: f.id,
    name: f.name,
    type: 'packaging' as const
  }))
};

// 모든 공장 목록 (타입 구분 없이)
export const allFactories = factories.map(f => f.name);

// 색상 팔레트
const colorPalette = [
  'bg-blue-500',
  'bg-red-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-cyan-500',
  'bg-orange-500',
  'bg-teal-500'
];

// 프로젝트별 공장 매핑 (제조, 용기, 포장 각 1개씩)
export const projectFactories: { [key: string]: ProjectFactory[] } = {
  '1': [
    { name: '큐셀시스템', color: 'bg-blue-500', type: 'manufacturing' },
    { name: '(주)연우', color: 'bg-red-500', type: 'container' },
    { name: '(주)네트모베이지', color: 'bg-yellow-500', type: 'packaging' }
  ],
  '2': [
    { name: '주식회사 코스모로스', color: 'bg-green-500', type: 'manufacturing' },
    { name: '삼화플라스틱', color: 'bg-purple-500', type: 'container' },
    { name: '서울포장산업(주)', color: 'bg-pink-500', type: 'packaging' }
  ],
  '3': [
    { name: '(주)뷰티팩토리', color: 'bg-indigo-500', type: 'manufacturing' },
    { name: '(주)에이치피씨', color: 'bg-cyan-500', type: 'container' },
    { name: '(주)한솔피엔에스', color: 'bg-orange-500', type: 'packaging' }
  ],
  '4': [
    { name: '코스메카코리아', color: 'bg-teal-500', type: 'manufacturing' },
    { name: '태성산업(주)', color: 'bg-blue-500', type: 'container' },
    { name: '대림포장(주)', color: 'bg-red-500', type: 'packaging' }
  ],
  '5': [
    { name: '(주)아모레퍼시픽 오산공장', color: 'bg-yellow-500', type: 'manufacturing' },
    { name: '(주)펌텍코리아', color: 'bg-green-500', type: 'container' },
    { name: '(주)새한패키지', color: 'bg-purple-500', type: 'packaging' }
  ]
};

// 공장 타입 한글명
export const factoryTypeNames = {
  manufacturing: '제조',
  container: '용기',
  packaging: '포장'
};

// 공장 타입별 아이콘 (optional)
export const factoryTypeIcons = {
  manufacturing: '🏭',
  container: '🍶',
  packaging: '📦'
};

// 고객사별 담당자 정보 - Mock DB에서 가져오기
const getCustomerContacts = () => {
  try {
    const db = MockDatabaseImpl.getInstance();
    const database = db.getDatabase();
    const customers = Array.from(database.customers.values());
    const users = Array.from(database.users.values());
    const userCustomers = Array.from(database.userCustomers.values());
    
    // 고객사별 담당자 찾기
    return customers.map(customer => {
      // 해당 고객사의 담당자 찾기 - contact role을 가진 유저
      const customerRelation = userCustomers.find(uc => uc.customerId === customer.id && uc.role === 'contact');
      const contactUser = customerRelation ? users.find(u => u.id === customerRelation.userId) : null;
      
      return {
        id: customer.id,
        name: contactUser?.name || customer.contactPerson,
        company: customer.name,
        position: contactUser?.position || '담당자',
        email: contactUser?.email || customer.email,
        phone: contactUser?.phone || customer.contactNumber
      };
    });
  } catch (error) {
    console.warn('Failed to load customer contacts from mock DB:', error);
    // Mock DB 초기화 재시도
    try {
      const db = MockDatabaseImpl.getInstance();
      const database = db.getDatabase();
      return [
        { id: 'customer-1', name: '박민수', company: '뷰티코리아', position: '구매팀장', email: 'park@beautykorea.com', phone: '010-3456-7890' },
        { id: 'customer-2', name: '정수진', company: '그린코스메틱', position: '제품개발팀 과장', email: 'jung@greencosmetic.com', phone: '010-4567-8901' },
        { id: 'customer-3', name: '윤서준', company: '코스메디칼', position: '연구소장', email: 'yoon@cosmedical.com', phone: '010-7890-1234' },
        { id: 'customer-4', name: '임하나', company: '퍼스트뷰티', position: '마케팅팀 차장', email: 'lim@firstbeauty.com', phone: '010-8901-2345' }
      ];
    } catch {
      return [];
    }
  }
};

export const customerContacts = getCustomerContacts();

// Mock DB에서 매니저/사용자 목록 가져오기
const getManagers = () => {
  try {
    const db = MockDatabaseImpl.getInstance();
    const database = db.getDatabase();
    const users = Array.from(database.users.values());
    return users
      .filter(user => user.role === 'manager' || user.role === 'admin')
      .map(user => user.name);
  } catch (error) {
    console.warn('Failed to load managers from mock DB:', error);
    return ['김철수', '이영희', '박민수', '정수진', '최지훈', '김프로', '이매니저', '박팀장'];
  }
};

export const managerNames = getManagers();

// Mock DB에서 제품 타입 목록 가져오기
const getProductTypes = () => {
  try {
    const db = MockDatabaseImpl.getInstance();
    const database = db.getDatabase();
    const projects = Array.from(database.projects.values());
    const productTypes = [...new Set(projects.map(p => p.productType).filter(Boolean))];
    
    if (productTypes.length > 0) {
      return productTypes;
    }
  } catch (error) {
    console.warn('Failed to load product types from mock DB:', error);
  }
  
  // Fallback
  return [
    '스킨케어', '메이크업', '클렌징', '마스크팩', '선케어',
    '헤어케어', '바디케어', '향수', '네일케어',
    '남성화장품', '유아화장품', '기능성화장품',
    '프리미엄 화장품 라인', '천연 샴푸 시리즈', '안티에이징 세럼',
    '비비크림', '탈모샴푸', '바디로션', '선크림'
  ];
};

export const productTypes = getProductTypes();

// 서비스 타입
export const serviceTypes = [
  'OEM',
  'ODM',
  'OBM',
  'Private Label',
  'White Label',
  '기타'
];

// 프로젝트 상태
export const projectStatuses = [
  '시작전',
  '진행중',
  '완료',
  '중단'
];

// 우선순위
export const priorities = [
  '높음',
  '보통',
  '낮음'
];

// 현재 단계 옵션들
export const currentStageOptions = [
  '설계', '제조', '용기', '포장', '품질검사', '승인'
];

// 매니저 랜덤 선택 함수
export const getRandomManager = () => {
  const managers = getManagers();
  return managers[Math.floor(Math.random() * managers.length)];
};

// 제품 타입 랜덤 선택 함수
export const getRandomProductType = () => {
  const types = getProductTypes();
  return types[Math.floor(Math.random() * types.length)];
};

// 서비스 타입 랜덤 선택 함수
export const getRandomServiceType = () => {
  return serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
};

// 우선순위 랜덤 선택 함수
export const getRandomPriority = () => {
  return priorities[Math.floor(Math.random() * priorities.length)];
};