import { useState, useMemo } from 'react';
import type { Factory } from '../data/factories';

export type FactoryType = '제조' | '용기' | '포장';

interface UseFactoryFilterReturn {
  selectedType: FactoryType;
  searchTerm: string;
  filteredFactories: Factory[];
  setSelectedType: (type: FactoryType) => void;
  setSearchTerm: (term: string) => void;
}

export const useFactoryFilter = (factories: Factory[]): UseFactoryFilterReturn => {
  const [selectedType, setSelectedType] = useState<FactoryType>('제조');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFactories = useMemo(() => {
    return factories.filter(factory => {
      // 타입 필터링
      const matchesType = factory.type === selectedType;
      
      // 검색어가 없으면 타입만 확인
      if (!searchTerm.trim()) {
        return matchesType;
      }

      // 검색어 필터링
      const searchLower = searchTerm.toLowerCase();
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
  }, [factories, selectedType, searchTerm]);

  return {
    selectedType,
    searchTerm,
    filteredFactories,
    setSelectedType,
    setSearchTerm,
  };
};