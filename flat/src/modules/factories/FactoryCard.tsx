import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Factory } from 'lucide-react';
import type { Factory as FactoryDataType } from '@/core/database/factories';
import { FactoryType, FactoryTypeLabel } from '@/shared/types/enums';
import FactoryTypeBadge from '@/shared/components/FactoryTypeBadge';

interface FactoryCardProps {
  factory: FactoryDataType;
  onEdit: (factory: FactoryDataType) => void;
  onDelete: (factoryId: string) => void;
}

const FactoryCard: React.FC<FactoryCardProps> = ({ factory, onEdit, onDelete }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleEdit = () => {
    onEdit(factory);
    setIsDropdownOpen(false);
  };

  const handleDelete = () => {
    if (confirm(`정말로 ${factory.name}을(를) 삭제하시겠습니까?`)) {
      onDelete(factory.id);
    }
    setIsDropdownOpen(false);
  };

  // Removed getTypeColor - now using FactoryTypeBadge component

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* 카드 헤더 */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Factory className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{factory.name}</h3>
              <FactoryTypeBadge type={factory.type} />
            </div>
          </div>
          
          {/* 드롭다운 메뉴 */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              aria-label="옵션 메뉴"
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 transition-colors border-t border-gray-100"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 카드 바디 */}
      <div className="p-6">
        <div className="space-y-3">
          <div className="text-sm">
            <span className="text-gray-500">이메일: </span>
            <a 
              href={`mailto:${factory.email}`} 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              {factory.email}
            </a>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">연락처: </span>
            <a 
              href={`tel:${factory.contact}`} 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              {factory.contact}
            </a>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">주소: </span>
            <span className="text-gray-600 line-clamp-2" title={factory.address}>
              {factory.address}
            </span>
          </div>
          {factory.managers?.[0] && (
            <div className="text-sm">
              <span className="text-gray-500">담당자: </span>
              <span className="text-gray-600">
                {factory.managers[0].name} ({factory.managers[0].position})
              </span>
            </div>
          )}
        </div>
        
        {/* 인증서 */}
        {factory.certifications.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {factory.certifications.map((cert) => (
                <span 
                  key={cert} 
                  className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                  title={cert}
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FactoryCard;