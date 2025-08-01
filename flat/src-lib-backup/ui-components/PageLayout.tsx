import React from 'react';

interface PageLayoutProps {
  containerStyle: { top: string; left: string };
  header: React.ReactNode;
  children: React.ReactNode;
  floatingActions?: React.ReactNode;
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  containerStyle,
  header,
  children,
  floatingActions,
  className = '',
}) => {
  return (
    <div className={`fixed inset-0 bg-gray-50 overflow-hidden ${className || ''}`.trim()}>
      <div 
        className="absolute bg-white overflow-hidden"
        style={{
          top: containerStyle.top,
          left: containerStyle.left,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div className="flex-shrink-0 px-4 pt-2 pb-2 w-full border-b border-gray-100">
          {header}
        </div>

        <div className="flex-1 min-h-0 w-full overflow-hidden">
          {children}
        </div>
      </div>
      
      {floatingActions}
    </div>
  );
};

export default PageLayout;