import React, { useState, useCallback, useEffect } from 'react';
import type { Participant, Task } from '../../types/schedule';
import { getDaysArray, formatDate, isToday } from '../../utils/dateUtils';
import { useScheduleState } from './hooks/useScheduleState';
import { useScheduleEffects } from './hooks/useScheduleEffects';
import ScheduleHeader from './ScheduleHeader';
import ScheduleGridContainer from './ScheduleGridContainer';
import ScrollControls from './ScrollControls';
import ScheduleModals from './ScheduleModals';
import { factories, taskTypesByFactoryType } from '../../data/factories';
import { findAvailableDateRange } from '../../utils/taskUtils';

interface ScheduleProps {
  participants: Participant[];
  startDate: string;
  endDate: string;
  className?: string;
  onBack?: () => void;
}

const Schedule: React.FC<ScheduleProps> = ({
  participants,
  startDate: projectStartDate,
  endDate: projectEndDate,
  className = '',
  onBack
}) => {
  const [gridWidth, setGridWidth] = useState(0);
  const [containerStyle, setContainerStyle] = useState<{ top: string; left: string }>({ top: '64px', left: '256px' });
  const [debugInfo, setDebugInfo] = useState<{ sidebarSelector: string; sidebarWidth: number; sidebarClasses: string }>({
    sidebarSelector: '',
    sidebarWidth: 0,
    sidebarClasses: ''
  });

  useEffect(() => {
    let rafId: number | null = null;
    
    const calculateMargins = () => {
      if (rafId) return; // 이미 예약된 경우 스킵
      
      rafId = requestAnimationFrame(() => {
        rafId = null;
      // 상단바 높이 찾기
      const header = document.querySelector('header') || document.querySelector('[role="banner"]') || document.querySelector('.header') || document.querySelector('nav');
      const headerHeight = header ? header.getBoundingClientRect().height : 64; // 기본값 64px
      
      // 사이드바 너비 찾기 - 찾은 선택자를 우선적으로 사용
      const sidebarSelectors = [
        '.flex-1.flex.flex-col.overflow-y-auto', // 이미 찾은 선택자
        'aside',
        '[role="navigation"]',
        '.sidebar',
        '[data-sidebar]',
        '.side-nav',
        '.navigation',
        '#sidebar'
      ];
      
      let sidebar = null;
      let foundSelector = '';
      for (const selector of sidebarSelectors) {
        sidebar = document.querySelector(selector);
        if (sidebar) {
          foundSelector = selector;
          break;
        }
      }
      
      let sidebarWidth = 256; // 기본값
      let sidebarClasses = '';
      
      if (sidebar) {
        const rect = sidebar.getBoundingClientRect();
        // 실제로 화면에 보이는 너비 계산
        sidebarWidth = rect.width;
        sidebarClasses = sidebar.className || sidebar.getAttribute('class') || 'no classes';
        
        // collapsed 상태 체크 (여러 방법)
        const isCollapsed = 
          sidebar.classList.contains('collapsed') ||
          sidebar.classList.contains('closed') ||
          sidebar.getAttribute('data-collapsed') === 'true' ||
          sidebar.getAttribute('aria-expanded') === 'false' ||
          rect.width < 100; // 너비가 100px 미만이면 collapsed로 간주
        
        if (isCollapsed) {
          sidebarWidth = rect.width > 0 ? rect.width : 64; // collapsed 시 최소 너비
        }
      } else {
        // 사이드바를 못 찾았을 때, 모든 요소 중에서 사이드바처럼 보이는 것 찾기
        const allElements = document.querySelectorAll('*');
        let possibleSidebars = [];
        
        allElements.forEach(el => {
          const rect = el.getBoundingClientRect();
          // 사이드바의 특징: 왼쪽에 위치, 세로로 긴 형태, 일정한 너비
          if (rect.left === 0 && 
              rect.top <= 100 && 
              rect.height > window.innerHeight * 0.5 &&
              rect.width > 50 && 
              rect.width < 400) {
            possibleSidebars.push({
              element: el,
              selector: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className.split(' ').join('.') : ''),
              width: rect.width,
              classes: el.className || ''
            });
          }
        });
        
        if (possibleSidebars.length > 0) {
          // 너비가 가장 작은 것을 사이드바로 간주 (collapsed 상태일 수 있으므로)
          possibleSidebars.sort((a, b) => a.width - b.width);
          const found = possibleSidebars[0];
          foundSelector = found.selector;
          sidebarWidth = found.width;
          sidebarClasses = found.classes;
        }
      }
      
      setDebugInfo({
        sidebarSelector: foundSelector || 'NOT FOUND',
        sidebarWidth,
        sidebarClasses
      });
      
      setContainerStyle({
        top: `${headerHeight}px`,
        left: `${sidebarWidth}px`
      });
      });
    };
    
    // 초기 계산
    calculateMargins();
    
    // 다양한 이벤트에 대응
    window.addEventListener('resize', calculateMargins);
    
    // 사이드바 변경 감지를 위한 interval
    const interval = setInterval(calculateMargins, 500); // 500ms로 조정하여 성능 개선
    
    // 추가로 transition 이벤트 감지 및 클릭 이벤트
    setTimeout(() => {
      const sidebar = document.querySelector('.flex-1.flex.flex-col.overflow-y-auto');
      if (sidebar) {
        // transition 이벤트
        sidebar.addEventListener('transitionstart', calculateMargins);
        sidebar.addEventListener('transitionend', calculateMargins);
        
        // 사이드바 클릭으로 토글 - = 아이콘과 동일한 위치
        const toggleButton = document.querySelector('[class*="toggle"]') || 
                           document.querySelector('[class*="collapse"]') || 
                           document.querySelector('[aria-label*="toggle"]') ||
                           document.querySelector('button svg');
                           
        if (toggleButton) {
          // 사이드바의 상단 부분 클릭 시 토글
          const handleSidebarClick = (e: MouseEvent) => {
            const rect = sidebar.getBoundingClientRect();
            // 사이드바 상단 100px 영역 클릭 시
            if (e.clientY - rect.top < 100) {
              toggleButton.click();
            }
          };
          
          sidebar.addEventListener('click', handleSidebarClick);
          
          // 클린업 함수에 추가
          return () => {
            sidebar.removeEventListener('click', handleSidebarClick);
          };
        }
      }
    }, 500);
    
    // 사이드바 토글 감지를 위한 MutationObserver
    const observer = new MutationObserver(calculateMargins);
    const sidebar = document.querySelector('aside') || document.querySelector('[role="navigation"]') || document.querySelector('.sidebar');
    if (sidebar && sidebar.parentElement) {
      // 사이드바와 부모 요소 모두 감시
      observer.observe(sidebar, { 
        attributes: true, 
        attributeFilter: ['class', 'style', 'data-collapsed'],
        subtree: true 
      });
      observer.observe(sidebar.parentElement, { 
        attributes: true, 
        childList: true,
        subtree: true 
      });
    }
    
    return () => {
      window.removeEventListener('resize', calculateMargins);
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  const handleGridWidthChange = useCallback((width: number) => {
    setGridWidth(width);
  }, []);

  const {
    dateRange,
    projects,
    setProjects,
    selectedProjects,
    tasks,
    taskControls,
    dragControls,
    modalState,
    setModalState,
    sliderValue,
    setSliderValue,
    handleProjectSelect,
    handleSelectAll
  } = useScheduleState(participants, projectStartDate, projectEndDate, gridWidth);

  const { scrollToToday, handleSliderChange } = useScheduleEffects(
    dateRange.days,
    dragControls.scrollRef,
    sliderValue,
    setSliderValue
  );

  const handleDeleteProject = (projectId: string) => {
    if (confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      setProjects(projects.filter(p => p.id !== projectId));
      taskControls.setTasks(taskControls.tasks.filter(t => t.projectId !== projectId));
    }
  };

  const handleTaskSave = (updatedTask: Task) => {
    if (modalState.selectedTask) {
      taskControls.updateTask(modalState.selectedTask.id, updatedTask);
    }
    setModalState(prev => ({ ...prev, showTaskEditModal: false, selectedTask: null }));
  };

  const handleTaskDelete = () => {
    if (modalState.selectedTask) {
      taskControls.deleteTask(modalState.selectedTask.id);
      setModalState(prev => ({ ...prev, showTaskEditModal: false, selectedTask: null }));
    }
  };

  const handleQuickTaskCreate = (taskData: { projectId: string; factory: string; startDate: string; endDate: string }) => {
    // 기본 태스크 타입 자동 선택
    const factory = factories.find(f => f.name === taskData.factory);
    const defaultTaskType = factory ? taskTypesByFactoryType[factory.type]?.[0] || '태스크' : '태스크';
    
    // 겁치지 않는 날짜 찾기
    const duration = Math.ceil((new Date(taskData.endDate).getTime() - new Date(taskData.startDate).getTime()) / (1000 * 60 * 60 * 24));
    const availableRange = findAvailableDateRange(
      taskData.projectId,
      taskData.startDate,
      duration,
      taskControls.tasks
    );
    
    taskControls.addTask({
      projectId: taskData.projectId,
      title: defaultTaskType,
      startDate: availableRange.startDate,
      endDate: availableRange.endDate,
      factory: taskData.factory
    });
  };
  
  const handleTaskCreate = (taskData: { factory: string; taskType: string; startDate: string; endDate: string }) => {
    const projectId = modalState.selectedProjectId || projects[0]?.id || '';
    const project = projects.find(p => p.id === projectId);
    
    // 겁치지 않는 날짜 찾기
    const duration = Math.ceil((new Date(taskData.endDate).getTime() - new Date(taskData.startDate).getTime()) / (1000 * 60 * 60 * 24));
    const availableRange = findAvailableDateRange(
      projectId,
      taskData.startDate,
      duration,
      taskControls.tasks
    );
    
    // 태스크 추가
    taskControls.addTask({
      projectId: projectId,
      title: taskData.taskType,
      startDate: availableRange.startDate,
      endDate: availableRange.endDate,
      factory: taskData.factory
    });
    
    // 모달 닫기
    setModalState(prev => ({ ...prev, showTaskModal: false, selectedProjectId: null, selectedDate: null }));
  };

  return (
    <>
    <div className={`fixed inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 overflow-hidden ${className}`}>
      
      <div 
        className="absolute bg-white overflow-hidden p-6"
        style={{
          top: containerStyle.top,
          left: containerStyle.left,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div className="flex-shrink-0 mb-4 w-full">
          <ScheduleHeader
          onAddProject={() => setModalState(prev => ({ ...prev, showProductRequestModal: true }))}
          onOpenWorkflow={() => setModalState(prev => ({ ...prev, showWorkflowModal: true }))}
          onOpenEmail={() => {
            // Set selected factories based on checked projects
            const selectedFactories = selectedProjects.length > 0 
              ? projects.filter(p => selectedProjects.includes(p.id)).map(p => p.name)
              : factories.map(f => f.name);
            setModalState(prev => ({ 
              ...prev, 
              showEmailModal: true, 
              selectedFactories 
            }));
          }}
          onBack={onBack}
          />
        </div>

        <div className="flex-1 min-h-0 flex flex-col w-full">
          <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-full">
            <ScheduleGridContainer
          projects={projects}
          tasks={taskControls.tasks}
          days={dateRange.days}
          cellWidth={dateRange.cellWidth}
          scrollRef={dragControls.scrollRef}
          taskControls={taskControls}
          dragControls={dragControls}
          modalState={modalState}
          setModalState={setModalState}
          selectedProjects={selectedProjects}
          setProjects={setProjects}
          onDeleteProject={handleDeleteProject}
          onProjectSelect={handleProjectSelect}
          onSelectAll={handleSelectAll}
          onAddFactory={() => setModalState(prev => ({ ...prev, showProductRequestModal: true }))}
          onTaskCreate={handleQuickTaskCreate}
          onGridWidthChange={handleGridWidthChange}
            />
          </div>
        </div>

      {/* Floating Add Task Button */}
      <button
        onClick={() => setModalState(prev => ({ ...prev, showTaskModal: true }))}
        className="fixed bottom-8 right-8 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full transition-all hover:shadow-xl shadow-lg flex items-center gap-2 cursor-move z-50"
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = 'copy';
          e.dataTransfer.setData('text/plain', 'new-task');
          e.currentTarget.classList.add('opacity-50');
        }}
        onDragEnd={(e) => {
          e.currentTarget.classList.remove('opacity-50');
        }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="font-medium">태스크 추가</span>
      </button>

      </div>
    </div>
    
    <ScheduleModals
      modalState={modalState}
      setModalState={setModalState}
      projects={projects}
      onTaskSave={handleTaskSave}
      onTaskDelete={handleTaskDelete}
      onTaskCreate={handleTaskCreate}
    />
    </>
  );
};

export default Schedule;