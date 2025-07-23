import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Search } from 'lucide-react';

interface SearchItem {
  id: string;
  name: string;
  subText?: string;
  additionalText?: string;
  searchableText: string;
}

interface SearchBoxProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: SearchItem) => void;
  anchorElement: HTMLElement | null;
  data: SearchItem[];
  placeholder: string;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  isOpen,
  onClose,
  onSelect,
  anchorElement,
  data,
  placeholder
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState<SearchItem[]>(data);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && anchorElement) {
      const rect = anchorElement.getBoundingClientRect();
      
      setPosition({
        top: rect.bottom + 2,
        left: rect.left
      });
      
      setSearchTerm('');
      setSelectedIndex(0);
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 10);
    }
  }, [isOpen, anchorElement]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredItems(data);
    } else {
      const filtered = data.filter(item => 
        item.searchableText.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    }
    setSelectedIndex(0);
  }, [searchTerm, data]);

  // 선택된 항목이 보이도록 스크롤
  useEffect(() => {
    if (listRef.current && filteredItems.length > 0) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        const container = listRef.current;
        const elementTop = selectedElement.offsetTop;
        const elementBottom = elementTop + selectedElement.offsetHeight;
        const containerTop = container.scrollTop;
        const containerBottom = containerTop + container.clientHeight;
        
        if (elementTop < containerTop) {
          container.scrollTop = elementTop;
        } else if (elementBottom > containerBottom) {
          container.scrollTop = elementBottom - container.clientHeight;
        }
      }
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
      e.preventDefault();
      e.stopPropagation();
      setSelectedIndex(prev => 
        prev < filteredItems.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
      e.preventDefault();
      e.stopPropagation();
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : filteredItems.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      if (filteredItems[selectedIndex]) {
        onSelect(filteredItems[selectedIndex]);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div 
      ref={boxRef}
      className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 w-80 z-[9999]"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div ref={listRef} className="max-h-64 overflow-y-auto">
        {filteredItems.map((item, index) => (
          <div
            key={item.id}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onSelect(item);
              onClose();
            }}
            onMouseEnter={() => setSelectedIndex(index)}
            className={`px-3 py-2 cursor-pointer transition-colors ${
              index === selectedIndex ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
            }`}
          >
            <div className={`text-sm font-medium truncate ${
              index === selectedIndex ? 'text-white' : 'text-gray-900'
            }`}>{item.name}</div>
            {item.subText && (
              <div className={`text-xs truncate ${
                index === selectedIndex ? 'text-blue-200' : 'text-gray-500'
              }`}>{item.subText}</div>
            )}
            {item.additionalText && (
              <div className={`text-xs mt-0.5 truncate ${
                index === selectedIndex ? 'text-blue-200' : 'text-gray-400'
              }`}>{item.additionalText}</div>
            )}
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className="px-3 py-4 text-sm text-gray-500 text-center">
            검색 결과가 없습니다
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default SearchBox;