import React from 'react';
import type { Project } from '../../types/project';
import { MoreVertical } from 'lucide-react';
import ProjectTableRow from './ProjectTableRow';

interface ProjectTableProps {
  projects: Project[];
  selectedRows: string[];
  sortField: keyof Project | null;
  sortDirection: 'asc' | 'desc';
  onSort: (field: keyof Project) => void;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (projectId: string, checked: boolean, index?: number) => void;
  onSelectProject: (project: Project) => void;
  onUpdateProject: (projectId: string, field: keyof Project, value: any) => void;
  onShowOptionsMenu: (projectId: string, position: { top: number; left: number }) => void;
  onMouseEnterRow?: (index: number) => void;
  isDragging?: boolean;
}

const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  selectedRows,
  sortField,
  sortDirection,
  onSort,
  onSelectAll,
  onSelectRow,
  onSelectProject,
  onUpdateProject,
  onShowOptionsMenu,
  onMouseEnterRow,
  isDragging
}) => {
  return (
    <table className="w-full min-w-[1800px] table-fixed">
      <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-100">
          <tr>
              <th className="w-8 px-1 py-1.5 text-left">
                <div className="flex items-center justify-center">
                  {/* 체크박스 제거 - 레이아웃 유지용 빈 공간 */}
                </div>
              </th>
              <th className="table-header-cell">제품타입</th>
              <th className="table-header-cell text-center">서비스 유형</th>
              <th className="table-header-cell text-center">현재 단계</th>
              <th className="table-header-cell text-center">상태</th>
              <th className="table-header-cell text-center">진행률</th>
              <th 
                className="table-header-cell table-header-cell-sortable"
                onClick={() => onSort('client')}
              >
                <div className="flex items-center justify-between">
                  <span>고객명</span>
                  {sortField === 'client' && (
                    <span className="text-blue-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="table-header-cell table-header-cell-sortable text-center"
                onClick={() => onSort('startDate')}
              >
                <div className="flex items-center justify-center">
                  <span>시작일</span>
                  {sortField === 'startDate' && (
                    <span className="text-blue-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="table-header-cell table-header-cell-sortable text-center"
                onClick={() => onSort('endDate')}
              >
                <div className="flex items-center justify-center">
                  <span>마감일</span>
                  {sortField === 'endDate' && (
                    <span className="text-blue-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="table-header-cell">제조</th>
              <th className="table-header-cell">용기</th>
              <th className="table-header-cell">포장</th>
              <th className="table-header-cell text-right">매출</th>
              <th className="table-header-cell text-right">매입</th>
              <th 
                className="table-header-cell table-header-cell-sortable text-center"
                onClick={() => onSort('priority')}
              >
                <div className="flex items-center justify-center">
                  <span>우선순위</span>
                  {sortField === 'priority' && (
                    <span className="text-blue-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="table-header-cell text-center w-12">
                <svg className="w-4 h-4 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {projects?.map((project, index) => (
              <ProjectTableRow
                key={project.id}
                project={project}
                index={index}
                isSelected={selectedRows?.includes(project.id) || false}
                onSelect={(checked) => onSelectRow(project.id, checked, index)}
                onRowClick={onSelectProject}
                onUpdateField={onUpdateProject}
                onShowOptionsMenu={onShowOptionsMenu}
                onMouseEnter={() => onMouseEnterRow?.(index)}
                isDragging={isDragging}
              />
            ))}
          </tbody>
        </table>
  );
};

export default ProjectTable;