import React, { useState, useEffect, useMemo } from 'react';
import { mockDataService } from '@/core/services/mockDataService';
import { ProjectType } from '@/shared/types/enums';
import { TaskChecklistItem, TaskChecklistLabel, TaskChecklistOrder } from '@/shared/types/enums/taskChecklist';
import type { TaskChecklistStatus } from '@/shared/types/taskChecklist';
import { getProductLabel } from '@/shared/utils/productTypeUtils';

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

  
  // Template화된 TaskChecklist 사용 - useMemo로 메모이제이션
  const tasks = useMemo(() => {
    return TaskChecklistOrder.map(item => TaskChecklistLabel[item]);
  }, []);

  const [taskStatus, setTaskStatus] = useState<TaskStatus>({});

  // SUB 프로젝트가 변경될 때 실제 MockDB에서 TaskChecklist 데이터 로드
  useEffect(() => {
    const newStatus: TaskStatus = {};
    subProjects.forEach((project, index) => {
      // MockDB에서 실제 TaskChecklist 데이터 가져오기
      const checklist = mockDataService.getProjectTaskChecklist(project.id);
      
      if (checklist) {
        TaskChecklistOrder.forEach((item) => {
          const taskLabel = TaskChecklistLabel[item];
          const key = `${project.id}-${taskLabel}`; // Use project.id for unique key
          newStatus[key] = checklist.status[item] || false;
        });
      } else {
        // 체크리스트가 없으면 기본값으로 false
        tasks.forEach(task => {
          const key = `${project.id}-${task}`; // Use project.id for unique key
          newStatus[key] = false;
        });
      }
    });
    setTaskStatus(newStatus);
  }, [subProjects, tasks]);

  const toggleTask = (projectId: string, task: string) => {
    const key = `${projectId}-${task}`;
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
                    <span className="text-[11px]">{getProductLabel(subProjects, project, index)}</span>
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
                  const productLabel = getProductLabel(subProjects, project, index);
                  const key = `${project.id}-${task}`; // Use project.id for unique key
                  const isChecked = taskStatus[key]; // Use project.id for taskStatus too
                  const isLast = index === subProjects.length - 1 && taskIndex === tasks.length - 1;
                  
                  return (
                    <td key={key} className={`px-3 py-2 text-center ${isLast ? 'rounded-br-lg' : ''}`}>
                      <button
                        onClick={() => toggleTask(project.id, task)}
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