import React from 'react';
import { Menu, Bell, User, Search } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="h-[var(--header-height)] w-full bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 lg:px-8">
        <div className="flex items-center justify-between h-[var(--header-height)]">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="p-3 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <Menu className="icon-md" />
            </button>
            
            <div className="ml-6 flex items-center">
              <h1 className="text-2xl font-semibold text-gray-900">FLAT Dashboard</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="icon-md text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-80 pl-10 pr-4 py-2.5 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
                placeholder="Search..."
              />
            </div>

            {/* Notifications */}
            <button className="p-3 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 relative">
              <Bell className="icon-lg" />
              <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-400 ring-2 ring-white"></span>
            </button>

            {/* User Menu */}
            <button className="p-3 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
              <User className="icon-lg" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;