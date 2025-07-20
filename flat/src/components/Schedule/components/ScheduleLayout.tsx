import React from 'react';
import ScheduleHeader from '../ScheduleHeader';
import Button from '../../common/Button';

interface ScheduleLayoutProps {
  containerStyle: { top: string; left: string };
  children: React.ReactNode;
  onAddProject: () => void;
  onOpenWorkflow: () => void;
  onOpenEmail: () => void;
  onBack?: () => void;
  onAddTask: () => void;
  projectName?: string;
}

const ScheduleLayout: React.FC<ScheduleLayoutProps> = ({
  containerStyle,
  children,
  onAddProject,
  onOpenWorkflow,
  onOpenEmail,
  onBack,
  onAddTask,
  projectName
}) => {
  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 overflow-hidden">
        <div 
          className="absolute bg-white overflow-hidden p-4"
          style={{
            top: containerStyle.top,
            left: containerStyle.left,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div className="flex-shrink-0 mb-3 w-full">
            <ScheduleHeader
              onAddProject={onAddProject}
              onOpenWorkflow={onOpenWorkflow}
              onOpenEmail={onOpenEmail}
              onBack={onBack}
              projectName={projectName}
            />
          </div>

          <div className="flex-1 min-h-0 flex flex-col w-full">
            <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-full">
              {children}
            </div>
          </div>

          {/* Floating Add Task Button */}
          <button
            onClick={onAddTask}
            className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full transition-all duration-300 hover:shadow-xl shadow-lg flex items-center justify-center cursor-move group z-50 overflow-hidden"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'copy';
              e.dataTransfer.setData('text/plain', 'new-task');
              
              // Create custom drag image
              const dragImage = document.createElement('div');
              dragImage.style.width = '50px';
              dragImage.style.height = '30px';
              dragImage.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
              dragImage.style.border = '2px dashed #3b82f6';
              dragImage.style.borderRadius = '6px';
              dragImage.style.display = 'flex';
              dragImage.style.alignItems = 'center';
              dragImage.style.justifyContent = 'center';
              dragImage.style.position = 'absolute';
              dragImage.style.top = '-9999px';
              dragImage.style.left = '-9999px';
              dragImage.innerHTML = '<span style="font-size: 11px; color: #1e40af; font-weight: 500;">태스크</span>';
              document.body.appendChild(dragImage);
              
              e.dataTransfer.setDragImage(dragImage, 25, 15);
              
              setTimeout(() => {
                document.body.removeChild(dragImage);
              }, 0);
              
              e.currentTarget.classList.add('opacity-50');
            }}
            onDragEnd={(e) => {
              e.currentTarget.classList.remove('opacity-50');
            }}
          >
            <div className="flex items-center gap-0 group-hover:gap-2 transition-all duration-300 px-4 py-4 group-hover:pr-6">
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="max-w-0 group-hover:max-w-[100px] overflow-hidden whitespace-nowrap transition-all duration-300 font-medium text-sm">
                태스크 추가
              </span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};

export default ScheduleLayout;