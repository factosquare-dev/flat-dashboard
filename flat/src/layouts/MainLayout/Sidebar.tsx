import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  Factory,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle?: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { 
    name: 'Projects', 
    path: '/projects', 
    icon: FolderOpen,
    children: [
      { name: 'Project Lists', path: '/projects/list', icon: FolderOpen },
      { name: 'Sample List', path: '/projects/sample', icon: FolderOpen },
    ]
  },
  { name: 'Users', path: '/users', icon: Users },
  { name: 'Factories', path: '/factories', icon: Factory },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const toggleExpanded = (name: string) => {
    setExpandedItems(prev =>
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  const renderNavItem = (item: NavItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);

    return (
      <div key={item.name}>
        <NavLink
          to={item.path}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              toggleExpanded(item.name);
              return;
            }
          }}
          className={({ isActive }) => {
            // 현재 활성화된 메뉴 클릭 시 토글 가능하도록 cursor-pointer 추가
            if (isActive && onToggle && !hasChildren) {
              return `group flex items-center px-4 py-3 text-base font-medium rounded-md transition-colors bg-indigo-50 text-indigo-700 cursor-pointer`;
            }
            return `group flex items-center px-4 py-3 text-base font-medium rounded-md transition-colors ${
              isActive
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
            }`;
          }}
        >
          {({ isActive }) => {
            // 현재 활성화된 메뉴 클릭 시 토글
            const handleItemClick = (e: React.MouseEvent) => {
              if (isActive && onToggle && !hasChildren) {
                e.preventDefault();
                onToggle();
              }
            };
            
            return (
              <div 
                className="flex items-center w-full"
                onClick={handleItemClick}
              >
                <item.icon
                  className={`icon-lg flex-shrink-0 ${
                    isOpen ? 'mr-4' : 'mr-0'
                  }`}
                />
                {isOpen && (
                  <>
                    <span className="flex-1">
                      {item.name}
                    </span>
                    {hasChildren && (
                      <span className="ml-auto">
                        {isExpanded ? (
                          <ChevronDown className="icon-md" />
                        ) : (
                          <ChevronRight className="icon-md" />
                        )}
                      </span>
                    )}
                  </>
                )}
              </div>
            );
          }}
        </NavLink>
        
        {hasChildren && isExpanded && isOpen && (
          <div className="ml-8 space-y-1">
            {item.children.map(child => renderNavItem(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`flex-shrink-0 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 h-full ${
        isOpen ? 'w-[var(--sidebar-width)]' : 'w-[var(--sidebar-collapsed)]'
      }`}
    >
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-3 py-6 space-y-2">
          {navigation.map(item => renderNavItem(item))}
        </nav>
      </div>
      
      {isOpen && (
        <div className="flex-shrink-0 flex border-t border-gray-200 p-6">
          <div className="flex items-center">
            <div className="ml-3">
              <p className="text-base font-medium text-gray-900">Version 1.0.0</p>
              <p className="text-sm text-gray-500">© 2025 FLAT Dashboard</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;