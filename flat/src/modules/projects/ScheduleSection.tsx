import React from 'react';
import { Calendar } from 'lucide-react';
import type { ProjectData } from './types';

interface ScheduleSectionProps {
  formData: ProjectData;
  onChange: (updates: Partial<ProjectData>) => void;
}

const ScheduleSection: React.FC<ScheduleSectionProps> = ({ formData, onChange }) => {
  return (
    <div className="modal-field-spacing">
      <div className="modal-field-label">
        <Calendar />
        일정 및 상태
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="modal-field-spacing">
          <label className="modal-field-label">시작일 *</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => onChange({ startDate: e.target.value })}
            className="modal-input"
            required
          />
        </div>
        
        <div className="modal-field-spacing">
          <label className="modal-field-label">마감일 *</label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => onChange({ endDate: e.target.value })}
            className="modal-input"
            required
          />
        </div>
        
        <div className="modal-field-spacing">
          <label className="modal-field-label">프로젝트 상태</label>
          <select 
            className="modal-input"
            value={formData.status || 'planning'}
            onChange={(e) => onChange({ status: e.target.value })}
          >
            <option value="planning">기획중</option>
            <option value="in_progress">진행중</option>
            <option value="review">검토중</option>
            <option value="completed">완료</option>
            <option value="on_hold">보류</option>
          </select>
        </div>
        
        <div className="modal-field-spacing">
          <label className="modal-field-label">우선순위</label>
          <select 
            className="modal-input"
            value={formData.priority || 'medium'}
            onChange={(e) => onChange({ priority: e.target.value })}
          >
            <option value="low">낮음</option>
            <option value="medium">보통</option>
            <option value="high">높음</option>
            <option value="urgent">긴급</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSection;