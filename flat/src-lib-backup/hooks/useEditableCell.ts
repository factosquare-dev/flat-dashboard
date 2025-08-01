import { useState } from 'react';
import type { EditingCell } from '../types/project';

export interface UseEditableCellReturn {
  editingCell: EditingCell | null;
  searchValue: string;
  searchSuggestions: string[];
  showSuggestions: boolean;
  setShowSuggestions: React.Dispatch<React.SetStateAction<boolean>>;
  startEditing: (projectId: string, field: string) => void;
  stopEditing: () => void;
  isEditing: (projectId: string, field: string) => boolean;
  handleSearch: (value: string, searchList: string[]) => void;
}

export const useEditableCell = (): UseEditableCellReturn => {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const startEditing = (projectId: string, field: string) => {
    setEditingCell({ projectId, field });
  };

  const stopEditing = () => {
    setEditingCell(null);
    setShowSuggestions(false);
    setSearchValue('');
  };

  const isEditing = (projectId: string, field: string) => {
    return editingCell?.projectId === projectId && editingCell?.field === field;
  };

  const handleSearch = (value: string, searchList: string[]) => {
    setSearchValue(value);
    
    if (!value) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    const suggestions = searchList.filter(item => 
      item.toLowerCase().includes(value.toLowerCase())
    );
    
    setSearchSuggestions(suggestions);
    setShowSuggestions(true);
  };

  return {
    editingCell,
    searchValue,
    searchSuggestions,
    showSuggestions,
    setShowSuggestions,
    startEditing,
    stopEditing,
    isEditing,
    handleSearch
  };
};