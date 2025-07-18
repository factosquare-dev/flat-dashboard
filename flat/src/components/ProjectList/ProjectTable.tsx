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
  onSelectRow: (projectId: string, checked: boolean) => void;
  onSelectProject: (project: Project) => void;
  onUpdateProject: (projectId: string, field: keyof Project, value: any) => void;
  onShowOptionsMenu: (projectId: string, position: { top: number; left: number }) => void;
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
  onShowOptionsMenu
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <table className="w-full min-w-[1800px]">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-4 py-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.length === projects.length && projects.length > 0}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th 
                className="table-header-cell cursor-pointer hover:text-gray-900 transition-colors"
                onClick={() => onSort('priority')}
              >
                우선순위 {sortField === 'priority' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="table-header-cell cursor-pointer hover:text-gray-900 transition-colors"
                onClick={() => onSort('client')}
              >
                고객명 {sortField === 'client' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="table-header-cell">담당자</th>
              <th className="table-header-cell">제품유형</th>
              <th className="table-header-cell">제조</th>
              <th className="table-header-cell">용기</th>
              <th className="table-header-cell">포장</th>
              <th className="table-header-cell">서비스유형</th>
              <th className="table-header-cell">현재단계</th>
              <th className="table-header-cell">진행률</th>
              <th className="table-header-cell">상태</th>
              <th 
                className="table-header-cell cursor-pointer hover:text-gray-900 transition-colors"
                onClick={() => onSort('startDate')}
              >
                시작일 {sortField === 'startDate' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="table-header-cell cursor-pointer hover:text-gray-900 transition-colors"
                onClick={() => onSort('endDate')}
              >
                마감일 {sortField === 'endDate' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="table-header-cell">매출</th>
              <th className="table-header-cell">매입</th>
              <th className="table-header-cell text-center">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {projects.map((project) => (
              <ProjectTableRow
                key={project.id}
                project={project}
                isSelected={selectedRows.includes(project.id)}
                onSelect={(checked) => onSelectRow(project.id, checked)}
                onRowClick={onSelectProject}
                onUpdateField={onUpdateProject}
                onShowOptionsMenu={onShowOptionsMenu}
              />
            ))}
          </tbody>
        </table>
    </div>
  );
};

export default ProjectTable;