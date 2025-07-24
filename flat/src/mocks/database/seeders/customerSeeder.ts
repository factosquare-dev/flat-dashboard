import { Customer } from '@/types/customer';
import { TIME_CONSTANTS } from '../../../constants/time';

export const createCustomers = (): Customer[] => {
  return [
    {
      id: 'customer-1',
      name: '뷰티코리아',
      companyName: '(주)뷰티코리아',
      contactPerson: '박민수',
      contactNumber: '010-3456-7890',
      email: 'park@beautykorea.com',
      address: '서울시 강남구 테헤란로 123',
      businessNumber: '123-45-67890',
      industry: '화장품',
      isActive: true,
      createdAt: new Date(Date.now() - (350 * TIME_CONSTANTS.DAY)), // ~350 days ago
      updatedAt: new Date(Date.now() - (350 * TIME_CONSTANTS.DAY)),
      createdBy: 'user-1',
      notes: 'VIP 고객사 - 프리미엄 라인 주력'
    },
    {
      id: 'customer-2',
      name: '그린코스메틱',
      companyName: '그린코스메틱(주)',
      contactPerson: '정수진',
      contactNumber: '010-4567-8901',
      email: 'jung@greencosmetic.com',
      address: '경기도 성남시 분당구 판교로 456',
      businessNumber: '234-56-78901',
      industry: '천연화장품',
      isActive: true,
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date('2024-02-20'),
      createdBy: 'user-2',
      notes: '친환경 제품 전문'
    },
    {
      id: 'customer-3',
      name: '코스메디칼',
      companyName: '(주)코스메디칼',
      contactPerson: '윤서준',
      contactNumber: '010-7890-1234',
      email: 'yoon@cosmedical.com',
      address: '서울시 송파구 올림픽로 789',
      businessNumber: '345-67-89012',
      industry: '기능성화장품',
      isActive: true,
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date('2024-03-10'),
      createdBy: 'user-2',
      notes: '의료기기 인증 화장품'
    },
    {
      id: 'customer-4',
      name: '퍼스트뷰티',
      companyName: '퍼스트뷰티(주)',
      contactPerson: '임하나',
      contactNumber: '010-8901-2345',
      email: 'lim@firstbeauty.com',
      address: '경기도 용인시 수지구 신수로 767',
      businessNumber: '456-78-90123',
      industry: '화장품',
      isActive: true,
      createdAt: new Date('2024-02-25'),
      updatedAt: new Date('2024-02-25'),
      createdBy: 'user-1',
      notes: '신규 브랜드 - 젊은층 타겟'
    }
  ];
};