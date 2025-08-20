import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Edit2 } from 'lucide-react';
import './MemoTabs.css';

interface MemoTab {
  id: string;
  name: string;
  isEditing?: boolean;
}

interface MemoTabsProps {
  projectId: string;
  onTabSelect?: (tabId: string) => void;
  maxTabs?: number;
  compact?: boolean;
}

const getStorageKey = (projectId: string) => `project-memo-tabs-${projectId}`;
const getActiveTabKey = (projectId: string) => `project-memo-active-tab-${projectId}`;

const MemoTabs: React.FC<MemoTabsProps> = ({ 
  projectId,
  onTabSelect, 
  maxTabs = 10,
  compact = false
}) => {
  const STORAGE_KEY = getStorageKey(projectId);
  const ACTIVE_TAB_KEY = getActiveTabKey(projectId);

  // Load tabs from localStorage or use defaults
  const [tabs, setTabs] = useState<MemoTab[]>(() => {
    const savedTabs = localStorage.getItem(STORAGE_KEY);
    if (savedTabs) {
      try {
        return JSON.parse(savedTabs);
      } catch (e) {
        console.error('Failed to parse saved tabs:', e);
      }
    }
    return [
      { id: 'tab-1', name: '메모 1' },
      { id: 'tab-2', name: '메모 2' },
      { id: 'tab-3', name: '메모 3' },
    ];
  });

  // Load active tab from localStorage or use first tab
  const [activeTabId, setActiveTabId] = useState<string>(() => {
    const savedActiveTab = localStorage.getItem(ACTIVE_TAB_KEY);
    if (savedActiveTab && tabs.some(tab => tab.id === savedActiveTab)) {
      return savedActiveTab;
    }
    return tabs[0]?.id || 'tab-1';
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Save tabs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
  }, [tabs]);

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(ACTIVE_TAB_KEY, activeTabId);
  }, [activeTabId]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const handleAddTab = () => {
    if (tabs.length >= maxTabs) {
      alert(`최대 ${maxTabs}개까지만 추가할 수 있습니다.`);
      return;
    }

    const newTab: MemoTab = {
      id: `tab-${Date.now()}`,
      name: `메모 ${tabs.length + 1}`,
    };
    
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    onTabSelect?.(newTab.id);
  };

  const handleDeleteTab = (tabId: string) => {
    if (tabs.length <= 1) {
      alert('최소 1개의 탭은 유지해야 합니다.');
      return;
    }

    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);

    // If deleting active tab, switch to adjacent tab
    if (activeTabId === tabId) {
      const newActiveIndex = Math.min(tabIndex, newTabs.length - 1);
      const newActiveId = newTabs[newActiveIndex].id;
      setActiveTabId(newActiveId);
      onTabSelect?.(newActiveId);
    }
  };

  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId);
    onTabSelect?.(tabId);
  };

  const handleStartEdit = (tabId: string, currentName: string) => {
    setEditingId(tabId);
    setEditValue(currentName);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editValue.trim()) {
      setEditingId(null);
      return;
    }

    setTabs(tabs.map(tab => 
      tab.id === editingId 
        ? { ...tab, name: editValue.trim() }
        : tab
    ));
    
    setEditingId(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className={`memo-tabs ${compact ? 'memo-tabs--compact' : ''}`}>
      <div className="memo-tabs__container">
        <div className="memo-tabs__list">
          {tabs.map(tab => (
            <div 
              key={tab.id}
              className={`memo-tab ${activeTabId === tab.id ? 'memo-tab--active' : ''}`}
            >
              {editingId === tab.id ? (
                <input
                  ref={editInputRef}
                  type="text"
                  className="memo-tab__edit-input"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={handleSaveEdit}
                  onKeyDown={handleKeyDown}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <button
                    className="memo-tab__button"
                    onClick={() => handleTabClick(tab.id)}
                    onDoubleClick={() => handleStartEdit(tab.id, tab.name)}
                  >
                    <span className="memo-tab__name">{tab.name}</span>
                  </button>
                  <button
                    className="memo-tab__edit"
                    onClick={() => handleStartEdit(tab.id, tab.name)}
                    title="이름 편집"
                  >
                    <Edit2 className="memo-tab__icon" />
                  </button>
                  {tabs.length > 1 && (
                    <button
                      className="memo-tab__close"
                      onClick={() => handleDeleteTab(tab.id)}
                      title="탭 삭제"
                    >
                      <X className="memo-tab__icon" />
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        
        {tabs.length < maxTabs && (
          <button 
            className="memo-tabs__add"
            onClick={handleAddTab}
            title="새 메모 탭 추가"
          >
            <Plus className="memo-tabs__add-icon" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MemoTabs;