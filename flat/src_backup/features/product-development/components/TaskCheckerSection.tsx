import React, { useState, useEffect } from 'react';
import { mockDataService } from '@/services/mockDataService';
import { ProjectType, ProductType, ProductTypeLabel } from '@/types/enums';

interface TaskStatus {
  [key: string]: boolean;
}

interface TaskCheckerSectionProps {
  projectId?: string;
}

export const TaskCheckerSection: React.FC<TaskCheckerSectionProps> = ({ projectId }) => {
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
    '제품개발의뢰서 검토',
    '제품개발의뢰서 미팅',
    '샘플의뢰',
    '샘플확정',
    'CT 의뢰',
    'CT 확정',
    '표시문구',
    '디자인',
    '용기 발주',
    '용기 입고',
    '내용물 발주',
    '원료 발주',
    '포장사양서',
    '생산일정',
    '인증/인허가',
    '최종 확인'
  ];

  const [taskStatus, setTaskStatus] = useState<TaskStatus>(() => {
    const initial: TaskStatus = {};
    subProjects.forEach((project, index) => {
      const label = getProductLabel(project, index);
      tasks.forEach(task => {
        initial[`${label}-${task}`] = false;
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
        const key = `${label}-${task}`;
        newStatus[key] = taskStatus[key] || false;
      });
    });
    setTaskStatus(newStatus);
  }, [subProjects]);

  const toggleTask = (productLabel: string, task: string) => {
    const key = `${productLabel}-${task}`;
    setTaskStatus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!subProjects.length) {
    return (
      <div className="border rounded-lg p-6 bg-white">
        <h2 className="text-xl font-bold mb-4 text-gray-800">TASK</h2>
        <p className="text-center text-gray-500">SUB 프로젝트가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 w-full">
      {/* Modern Table Container */}
      <div className="w-full">
        <table className="w-auto">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap rounded-tl-lg w-48">
                Task
              </th>
              {subProjects.map((project, index) => (
                <th key={project.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider last:rounded-tr-lg">
                  <div className="whitespace-nowrap">
                    <span className="text-[11px]">{getProductLabel(project, index)}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {tasks.map((task, taskIndex) => (
              <tr key={task} className="transition-all hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 group">
                <td className={`px-4 py-2 text-xs font-medium text-gray-700 whitespace-nowrap w-48 ${taskIndex === tasks.length - 1 ? 'rounded-bl-lg' : ''}`}>
                  {task}
                </td>
                {subProjects.map((project, index) => {
                  const productLabel = getProductLabel(project, index);
                  const key = `${productLabel}-${task}`;
                  const isChecked = taskStatus[key];
                  const isLast = index === subProjects.length - 1 && taskIndex === tasks.length - 1;
                  
                  return (
                    <td key={key} className={`px-3 py-2 text-center ${isLast ? 'rounded-br-lg' : ''}`}>
                      <button
                        onClick={() => toggleTask(productLabel, task)}
                        className={`inline-flex items-center justify-center w-5 h-5 rounded-full transition-all transform hover:scale-125 ${
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};