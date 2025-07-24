import type { Project } from '../types/project';
import { getRandomManager, getRandomProductType, getRandomServiceType, getRandomPriority, allClients } from './mockData';

// Static hierarchical projects data for fallback - 이제 mock data 함수 사용
const createStaticProjects = (): Project[] => {
  const availableClients = allClients.length > 0 ? allClients : ['뷰티코리아', '그린코스메틱'];
  
  return [
    {
      id: 'master-1',
      type: 'master' as any,
      level: 0,
      isExpanded: true,
      client: availableClients[0] || '뷰티코리아',
      manager: getRandomManager(),
      productType: getRandomProductType(),
      serviceType: getRandomServiceType() as any,
      currentStage: ['설계', '제조'],
      status: '진행중',
      progress: 45,
      startDate: '2025-01-01',
      endDate: '2025-03-31',
      manufacturer: 'factory-1',
      container: 'factory-2',
      packaging: 'factory-3',
      priority: getRandomPriority(),
      depositPaid: true,
      children: [
        {
          id: 'sub-1',
          type: 'sub' as any,
          level: 1,
          parentId: 'master-1',
          client: availableClients[0] || '뷰티코리아', // SUB inherits MASTER's customer
          manager: getRandomManager(),
          productType: getRandomProductType(),
          serviceType: getRandomServiceType() as any,
          currentStage: ['설계'],
          status: '시작전',
          progress: 15,
          startDate: '2025-02-01',
          endDate: '2025-04-30',
          manufacturer: 'factory-1',
          container: 'factory-2',
          packaging: 'factory-3',
          priority: getRandomPriority(),
          depositPaid: false,
          children: []
        }
      ]
    },
    {
      id: 'master-2',
      type: 'master' as any,
      level: 0,
      isExpanded: true,
      client: availableClients[1] || '그린코스메틱',
      manager: getRandomManager(),
      productType: getRandomProductType(),
      serviceType: getRandomServiceType() as any,
      currentStage: ['제조', '포장'],
      status: '진행중',
      progress: 60,
      startDate: '2025-01-15',
      endDate: '2025-02-28',
      manufacturer: 'factory-4',
      container: 'factory-2',
      packaging: 'factory-3',
      priority: getRandomPriority(),
      depositPaid: true,
      children: []
    }
  ] as any;
};

export const staticHierarchicalProjects: Project[] = createStaticProjects();