import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Projects', path: '/projects', icon: FolderOpen },
  { name: 'Users', path: '/users', icon: Users },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
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
            }
          }}
          className={({ isActive }) =>
            `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
            }`
          }
        >
          <item.icon
            className={`mr-3 h-5 w-5 flex-shrink-0 ${
              isOpen ? '' : 'mr-0'
            }`}
          />
          {isOpen && (
            <>
              <span className="flex-1">{item.name}</span>
              {hasChildren && (
                <span className="ml-auto">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </span>
              )}
            </>
          )}
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
      className={`fixed top-16 bottom-0 left-0 z-30 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map(item => renderNavItem(item))}
        </nav>
      </div>
      
      {isOpen && (
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Version 1.0.0</p>
              <p className="text-xs text-gray-500">© 2025 FLAT Dashboard</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;