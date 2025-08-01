import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Search } from 'lucide-react';
import { useDebouncedSearch } from '@/hooks/common';
import { cn } from '@/utils/cn';
import './SearchBox.css';

interface SearchItem {
  id: string;
  name: string;
  originalName?: string; // 툴팁용 원본 이름
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
  const { searchValue, debouncedValue, setSearchValue } = useDebouncedSearch({
    delay: 300,
    minLength: 0
  });
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
      
      setSearchValue('');
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
    if (debouncedValue.trim() === '') {
      setFilteredItems(data);
    } else {
      const filtered = data.filter(item => 
        item.searchableText.toLowerCase().includes(debouncedValue.toLowerCase())
      );
      setFilteredItems(filtered);
    }
    setSelectedIndex(0);
  }, [debouncedValue, data]);

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
      className="search-box"
      style={{ 
        '--search-box-top': `${position.top}px`,
        '--search-box-left': `${position.left}px`
      } as React.CSSProperties}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="search-box__header">
        <div className="search-box__input-wrapper">
          <Search className="search-box__icon" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="search-box__input"
          />
        </div>
      </div>
      
      <div ref={listRef} className="search-box__list">
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
            className={cn(
              'search-box__item',
              index === selectedIndex && 'search-box__item--selected'
            )}
            title={item.originalName || item.name}
          >
            <div className="search-box__item-name">{item.name}</div>
            {item.subText && (
              <div className="search-box__item-subtext">{item.subText}</div>
            )}
            {item.additionalText && (
              <div className="search-box__item-additional">{item.additionalText}</div>
            )}
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className="search-box__empty">
            검색 결과가 없습니다
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default SearchBox;