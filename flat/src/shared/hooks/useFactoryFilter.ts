import { useState, useMemo } from 'react';
import type { Factory } from '@/core/database/factories';
import { FactoryType, FactoryTypeLabel } from '@/shared/types/enums';

// Using FactoryTypeLabel values as string literals

interface UseFactoryFilterReturn {
  selectedType: FactoryType;
  searchTerm: string;
  filteredFactories: Factory[];
  setSelectedType: (type: FactoryType) => void;
  setSearchTerm: (term: string) => void;
}

export const useFactoryFilter = (factories: Factory[]): UseFactoryFilterReturn => {
  const [selectedType, setSelectedType] = useState<FactoryType>(FactoryType.MANUFACTURING);
  const [searchTerm, setSearchTerm] = useState('');

  const searchLower = useMemo(() => searchTerm.toLowerCase(), [searchTerm]);

  const filteredFactories = useMemo(() => {
    return factories.filter(factory => {
      // 타입 필터링
      const matchesType = factory.type === selectedType;
      
      // 검색어가 없으면 타입만 확인
      if (!searchTerm.trim()) {
        return matchesType;
      }

      // 검색어 필터링 (사전에 lowercase로 변환된 값 사용)
      const matchesSearch = 
        factory.name.toLowerCase().includes(searchLower) ||
        factory.address.toLowerCase().includes(searchLower) ||
        factory.contact.toLowerCase().includes(searchLower) ||
        factory.email.toLowerCase().includes(searchLower) ||
        (factory.managers?.some(manager => 
          manager.name.toLowerCase().includes(searchLower) ||
          manager.email.toLowerCase().includes(searchLower) ||
          manager.phone.includes(searchTerm) || // 전화번호는 숫자 그대로 검색
          manager.position.toLowerCase().includes(searchLower)
        ) ?? false);
      
      return matchesType && matchesSearch;
    });
  }, [factories, selectedType, searchLower, searchTerm]);

  return {
    selectedType,
    searchTerm,
    filteredFactories,
    setSelectedType,
    setSearchTerm,
  };
};