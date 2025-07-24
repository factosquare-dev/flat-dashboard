import { Factory } from '@/types/factory';
import { TIME_CONSTANTS } from '../../../constants/time';

export const createFactories = (): Factory[] => {
  return [
    {
      id: 'factory-1',
      name: '큐셀시스템',
      type: '제조',
      address: '경기도 성남시 중원구 둔촌대로 388',
      contactNumber: '031-737-3000',
      manager: {
        name: '김철수',
        phone: '010-1234-5678',
        email: 'kim@qcellsystem.com',
      },
      capacity: 100,
      certifications: ['ISO 22716', 'CGMP', 'ISO 9001'],
      establishedDate: new Date(Date.now() - (10 * TIME_CONSTANTS.YEAR)), // 10 years ago
      isActive: true,
    },
    {
      id: 'factory-2',
      name: '(주)연우',
      type: '용기',
      address: '경기도 안산시 단원구 엠티브이25로 58',
      contactNumber: '031-495-8000',
      manager: {
        name: '박용기',
        phone: '010-2345-6789',
        email: 'park@yeonwoo.co.kr',
      },
      capacity: 200,
      certifications: ['ISO 9001', 'ISO 14001'],
      establishedDate: new Date(Date.now() - (14 * TIME_CONSTANTS.YEAR)), // 14 years ago
      isActive: true,
    },
    {
      id: 'factory-3',
      name: '(주)네트모베이지',
      type: '포장',
      address: '인천광역시 남동구 논현로46번길 23',
      contactNumber: '032-812-3456',
      manager: {
        name: '최포장',
        phone: '010-3456-7890',
        email: 'choi@netmobei.com',
      },
      capacity: 150,
      certifications: ['ISO 9001', 'FSC'],
      establishedDate: new Date(Date.now() - (12 * TIME_CONSTANTS.YEAR)), // 12 years ago
      isActive: true,
    },
    {
      id: 'factory-4',
      name: '주식회사 코스모로스',
      type: '제조',
      address: '인천광역시 남동구 남동서로 350',
      contactNumber: '032-812-5000',
      manager: {
        name: '정제조',
        phone: '010-4567-8901',
        email: 'jung@cosmoros.kr',
      },
      capacity: 150,
      certifications: ['ISO 22716', 'CGMP', 'ISO 14001'],
      establishedDate: new Date(Date.now() - (7 * TIME_CONSTANTS.YEAR)), // 7 years ago
      isActive: true,
    },
  ];
};