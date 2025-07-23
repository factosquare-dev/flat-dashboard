import type { ProjectFactory } from '../types/project';
import { factories, getFactoriesByType } from './factories';

// 고객사 목록
export const allClients = [
  // 대기업
  '(주)아모레퍼시픽',
  'LG생활건강',
  '한국콜마',
  '코스맥스',
  
  // 중견기업
  '(주)뷰티코리아',
  '글로벌코스메틱',
  '네이처바이오',
  '프리미엄뷰티',
  '클린뷰티랩',
  
  // 브랜드
  '이니스프리',
  '미샤',
  '더페이스샵',
  '스킨푸드',
  '에뛰드하우스',
  '토니모리',
  '네이처리퍼블릭',
  '인코스런'
];

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

// 고객사별 담당자 정보
export const customerContacts = [
  { id: '1', name: '김철수', company: '(주)아모레퍼시픽', position: '구매팀 과장', email: 'kim.cs@amorepacific.com', phone: '010-1234-5678' },
  { id: '2', name: '이영희', company: 'LG생활건강', position: '개발팀 대리', email: 'lee.yh@lgcare.com', phone: '010-2345-6789' },
  { id: '3', name: '박민수', company: '한국콜마', position: '기획팀 팀장', email: 'park.ms@kolmar.com', phone: '010-3456-7890' },
  { id: '4', name: '정수진', company: '코스맥스', position: '마케팅팀 주임', email: 'jung.sj@cosmax.com', phone: '010-4567-8901' },
  { id: '5', name: '최현우', company: '(주)뷰티코리아', position: '대표이사', email: 'choi.hw@beautykorea.com', phone: '010-5678-9012' },
  { id: '6', name: '김미영', company: '글로벌코스메틱', position: '상품기획팀 부장', email: 'kim.my@globalcos.com', phone: '010-6789-0123' },
  { id: '7', name: '이준호', company: '네이처바이오', position: '연구소 소장', email: 'lee.jh@naturebio.com', phone: '010-7890-1234' },
  { id: '8', name: '박서연', company: '프리미엄뷰티', position: '품질관리팀 차장', email: 'park.sy@premiumbeauty.com', phone: '010-8901-2345' },
  { id: '9', name: '정태훈', company: '클린뷰티랩', position: '생산팀 과장', email: 'jung.th@cleanbeautylab.com', phone: '010-9012-3456' },
  { id: '10', name: '강민지', company: '이니스프리', position: '브랜드매니저', email: 'kang.mj@innisfree.com', phone: '010-0123-4567' },
  { id: '11', name: '윤서준', company: '미샤', position: '디자인팀 팀장', email: 'yoon.sj@missha.com', phone: '010-1357-2468' },
  { id: '12', name: '한지민', company: '더페이스샵', position: '영업팀 대리', email: 'han.jm@thefaceshop.com', phone: '010-2468-1357' },
  { id: '13', name: '송민호', company: '스킨푸드', position: 'SCM팀 과장', email: 'song.mh@skinfood.com', phone: '010-3579-2468' },
  { id: '14', name: '임수정', company: '에뛰드하우스', position: '온라인사업팀 팀장', email: 'lim.sj@etudehouse.com', phone: '010-4680-3579' },
  { id: '15', name: '조현아', company: '토니모리', position: '글로벌사업부 부장', email: 'jo.ha@tonymoly.com', phone: '010-5791-4680' },
  { id: '16', name: '정다은', company: '네이처리퍼블릭', position: '제품개발팀 차장', email: 'jung.de@naturerepublic.com', phone: '010-6802-4791' },
  { id: '17', name: '이승호', company: '인코스런', position: '품질관리팀 과장', email: 'lee.sh@incosrun.com', phone: '010-7913-5802' }
];

// 제품 타입
export const productTypes = [
  '스킨케어',
  '메이크업',
  '클렌징',
  '마스크팩',
  '선케어',
  '헤어케어',
  '바디케어',
  '향수',
  '네일케어',
  '남성화장품',
  '유아화장품',
  '기능성화장품'
];

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