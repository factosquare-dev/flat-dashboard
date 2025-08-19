import React, { useState, useEffect } from 'react';
import { mockDataService } from '@/services/mockDataService';
import { ProjectType, ProductType, ProductTypeLabel } from '@/types/enums';

interface TaskStatus {
  [key: string]: boolean;
}

interface TaskCheckerSectionAltProps {
  projectId?: string;
}

export const TaskCheckerSectionAlt: React.FC<TaskCheckerSectionAltProps> = ({ projectId }) => {
  const [subProjects, setSubProjects] = useState<any[]>([]);
  
  // 실제 SUB 프로젝트 로드
  useEffect(() => {
    if (projectId) {
      const allProjects = mockDataService.getAllProjects();
      const subs = allProjects.filter(
        (p) => p.parentId === projectId && p.type === ProjectType.SUB
      );
      setSubProjects(subs);
    }
  }, [projectId]);

  // 제품 타입별로 라벨 생성 (한글로 변환)
  const getProductLabel = (project: any, index: number): string => {
    const productType = project.productType || project.product?.productType || ProductType.OTHER;
    const typeLabel = ProductTypeLabel[productType as ProductType] || productType;
    
    const sameTypeProjects = subProjects.filter(
      p => (p.productType || p.product?.productType) === productType
    );
    
    if (sameTypeProjects.length > 1) {
      const typeIndex = sameTypeProjects.findIndex(p => p.id === project.id);
      return `${typeLabel} (${typeIndex + 1})`;
    }
    
    return typeLabel;
  };
  
  const tasks = [
    { short: '의뢰검토', full: '제품개발의뢰서 검토' },
    { short: '의뢰미팅', full: '제품개발의뢰서 미팅' },
    { short: '샘플의뢰', full: '샘플의뢰' },
    { short: '샘플확정', full: '샘플확정' },
    { short: 'CT의뢰', full: 'CT 의뢰' },
    { short: 'CT확정', full: 'CT 확정' },
    { short: '표시문구', full: '표시문구' },
    { short: '디자인', full: '디자인' },
    { short: '용기발주', full: '용기 발주' },
    { short: '용기입고', full: '용기 입고' },
    { short: '내용물', full: '내용물 발주' },
    { short: '원료발주', full: '원료 발주' },
    { short: '포장사양', full: '포장사양서' },
    { short: '생산일정', full: '생산일정' },
    { short: '인증인허', full: '인증/인허가' },
    { short: '최종확인', full: '최종 확인' }
  ];

  const [taskStatus, setTaskStatus] = useState<TaskStatus>(() => {
    const initial: TaskStatus = {};
    subProjects.forEach((project, index) => {
      const label = getProductLabel(project, index);
      tasks.forEach(task => {
        initial[`${label}-${task.full}`] = false;
      });
    });
    return initial;
  });

  // SUB 프로젝트가 변경될 때 taskStatus 업데이트
  useEffect(() => {
    const newStatus: TaskStatus = {};
    subProjects.forEach((project, index) => {
      const label = getProductLabel(project, index);
      tasks.forEach(task => {
        const key = `${label}-${task.full}`;
        newStatus[key] = taskStatus[key] || false;
      });
    });
    setTaskStatus(newStatus);
  }, [subProjects]);

  const toggleTask = (productLabel: string, taskFull: string) => {
    const key = `${productLabel}-${taskFull}`;
    setTaskStatus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!subProjects.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-center text-gray-500">SUB 프로젝트가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-full overflow-hidden">
      {/* Alternative Table Design - Products on Left, Tasks on Top */}
      <div className="w-full overflow-x-auto rounded-lg">
        <table className="w-max">
          <thead>
            <tr className="border-b-2 border-gray-200">
              {/* Empty corner cell */}
              <th className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap rounded-tl-lg">
                Product
              </th>
              {/* Task headers */}
              {tasks.map((task) => (
                <th key={task.full} className="bg-gradient-to-r from-blue-50 to-indigo-50 px-2 py-2.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[70px] relative group last:rounded-tr-lg">
                  <div className="text-xs font-medium">
                    {task.short}
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                    <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                      {task.full}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {subProjects.map((project, projectIndex) => {
              const productLabel = getProductLabel(project, projectIndex);
              
              return (
                <tr key={project.id} className="transition-all hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 group">
                  {/* Product name cell */}
                  <td className={`px-4 py-2 text-xs font-medium text-gray-700 whitespace-nowrap ${projectIndex === subProjects.length - 1 ? 'rounded-bl-lg' : ''}`}>
                    {productLabel}
                  </td>
                  {/* Task cells */}
                  {tasks.map((task, taskIndex) => {
                    const key = `${productLabel}-${task.full}`;
                    const isChecked = taskStatus[key];
                    const isLast = taskIndex === tasks.length - 1 && projectIndex === subProjects.length - 1;
                    
                    return (
                      <td key={key} className={`px-3 py-2 text-center ${isLast ? 'rounded-br-lg' : ''}`}>
                        <button
                          onClick={() => toggleTask(productLabel, task.full)}
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full transition-all transform hover:scale-110 ${
                            isChecked 
                              ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-md' 
                              : 'bg-white border-2 border-gray-300 hover:border-blue-400 group-hover:border-gray-400'
                          }`}
                        >
                          {isChecked && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};