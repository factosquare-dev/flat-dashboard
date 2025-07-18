import type { ProjectFactory } from '../types/project';

export const allClients = [
  '(주)뷰티코리아', '글로벌코스메틱', '네이처바이오', '프리미엄뷰티', '클린뷰티랩',
  '(주)아모레퍼시픽', 'LG생활건강', '코스맥스', '한국콜마', '코스온',
  '이니스프리', '미샤', '더페이스샵', '스킨푸드', '에뛰드하우스'
];

export const allFactories = [
  '큐셀시스템', '(주)연우', '(주)네트모베이지', '주식회사 코스모로스',
  '코스맥스', '한국콜마', '코스온', '대한화장품', '씨앤씨인터내셔널',
  '코스메카코리아', '코스비전', '화성코스메틱', '네오팜', '코스팩'
];

export const projectFactories: { [key: string]: ProjectFactory[] } = {
  '1': [
    { name: '큐셀시스템', color: 'bg-blue-500' },
    { name: '(주)연우', color: 'bg-red-500' },
    { name: '(주)네트모베이지', color: 'bg-yellow-500' }
  ],
  '2': [
    { name: '(주)연우', color: 'bg-red-500' },
    { name: '큐셀시스템', color: 'bg-blue-500' },
    { name: '주식회사 코스모로스', color: 'bg-cyan-500' }
  ],
  '3': [
    { name: '주식회사 코스모로스', color: 'bg-cyan-500' },
    { name: '(주)네트모베이지', color: 'bg-yellow-500' },
    { name: '(주)연우', color: 'bg-red-500' }
  ],
  '4': [
    { name: '(주)네트모베이지', color: 'bg-yellow-500' },
    { name: '주식회사 코스모로스', color: 'bg-cyan-500' },
    { name: '큐셀시스템', color: 'bg-blue-500' }
  ],
  '5': [
    { name: '큐셀시스템', color: 'bg-blue-500' },
    { name: '(주)연우', color: 'bg-red-500' },
    { name: '주식회사 코스모로스', color: 'bg-cyan-500' }
  ]
};