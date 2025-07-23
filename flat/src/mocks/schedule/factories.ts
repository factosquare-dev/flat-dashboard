import type { Participant } from '../../types/schedule';

/**
 * Mock 공장 데이터
 */
export const mockFactories: Participant[] = [
  {
    id: 'cont-1',
    name: '(주)연우',
    type: '용기',
    period: '2024-01 ~ 2024-12',
    color: '#EF4444' // 레드
  },
  {
    id: 'mfg-1',
    name: '큐셀시스템',
    type: '제조',
    period: '2024-01 ~ 2024-12',
    color: '#3B82F6' // 블루
  },
  {
    id: 'pack-1',
    name: '(주)네트모베이지',
    type: '포장',
    period: '2024-01 ~ 2024-12',
    color: '#EAB308' // 옐로우
  },
  {
    id: 'mfg-2',
    name: '주식회사 코스모로스',
    type: '제조',
    period: '2024-01 ~ 2024-12',
    color: '#06B6D4' // 시안
  },
  {
    id: 'cont-2',
    name: '삼화플라스틱',
    type: '용기',
    period: '2024-01 ~ 2024-12',
    color: '#10B981' // 그린
  },
  {
    id: 'pack-2',
    name: '대한포장',
    type: '포장',
    period: '2024-01 ~ 2024-12',
    color: '#8B5CF6' // 퍼플
  }
];

export const getFactoryById = (id: string): Participant | undefined => {
  return mockFactories.find(f => f.id === id);
};

export const getFactoriesByType = (type: string): Participant[] => {
  return mockFactories.filter(f => f.type === type);
};