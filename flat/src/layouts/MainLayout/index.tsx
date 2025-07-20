import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen w-full flex flex-col">
      <div className="h-16 flex-shrink-0 w-full fixed top-0 left-0 right-0 z-50">
        <Header onMenuClick={toggleSidebar} />
      </div>
      
      <div className="flex flex-1 w-full pt-16">
        <div className="fixed left-0 top-16 bottom-0 z-40">
          <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        </div>
        
        <main className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-16'
        }`}>
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;