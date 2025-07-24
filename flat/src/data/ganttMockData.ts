/**
 * GanttChart Mock Data - factories.ts와 통합
 */

import type { Project } from '../components/GanttChart/types';
import { factories } from './factories';

// factories.ts 데이터를 기반으로 Gantt 프로젝트 생성
const createGanttProjectsFromFactories = (): Project[] => {
  console.log('[GanttChart] 🏭 Creating projects from factories.ts:', factories);
  console.log('[GanttChart] 🏭 First 5 factories:', factories.slice(0, 5).map(f => ({ id: f.id, name: f.name, type: f.type })));
  
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-cyan-500', 'bg-red-500', 'bg-indigo-500', 'bg-pink-500'];
  
  // 확실히 공장 이름이 표시되도록 명시적으로 공장 데이터 사용
  const ganttProjects = factories.slice(0, 5).map((factory, index) => {
    const projectName = `🏭 ${factory.name} (${factory.type})`;
    console.log(`[GanttChart] 🏭 Creating project ${index}: ${projectName}`);
    
    return {
      id: factory.id,
      name: projectName, // 공장 이름과 타입을 명확히 표시 (이모지 추가로 구분)
      color: colors[index % colors.length],
      expanded: index % 2 === 0, // 짝수 인덱스는 펼쳐진 상태
      tasks: [
        {
          id: `${factory.id}-1`,
          title: "요구사항 분석",
          projectId: factory.id,
          startDate: "2025-07-01",
          endDate: "2025-07-07",
          color: colors[index % colors.length].replace('500', '400')
        },
        {
          id: `${factory.id}-2`,
          title: "설계 단계",
          projectId: factory.id,
          startDate: "2025-07-08",
          endDate: "2025-07-15",
          color: colors[index % colors.length].replace('500', '600')
        },
        {
          id: `${factory.id}-3`,
          title: "개발/제조",
          projectId: factory.id,
          startDate: "2025-07-16",
          endDate: "2025-08-05",
          color: colors[index % colors.length].replace('500', '700')
        }
      ]
    };
  });
  
  console.log('[GanttChart] 🏭 Final gantt projects:', ganttProjects);
  console.log('[GanttChart] 🏭 Project names:', ganttProjects.map(p => p.name));
  return ganttProjects;
};

// 동적으로 Gantt 프로젝트를 가져오는 함수 (resetMockData 대응)
export const getGanttMockProjects = (): Project[] => {
  console.log('[GanttChart] Getting fresh gantt projects...');
  return createGanttProjectsFromFactories();
};

// 기존 상수는 유지하되, 동적 함수 사용 권장
export const GANTT_MOCK_PROJECTS: Project[] = createGanttProjectsFromFactories();

// 디버깅용: 생성된 프로젝트 확인
console.log('[GanttChart] GANTT_MOCK_PROJECTS exported:', GANTT_MOCK_PROJECTS);