import React, { useState, useMemo, useCallback } from 'react';
import ScheduleTableView from '@/components/Schedule/components/ScheduleTableView';
import CommentSection from '@/components/CommentSection';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useProjectComments } from '@/hooks/useProjectComments';
import { MockDatabaseImpl } from '@/mocks/database/MockDatabase';
import type { User } from '@/types/user';

interface TaskViewWithSidebarProps {
  projectId?: string;
  onAddFactory?: () => void;
}

const TaskViewWithSidebar: React.FC<TaskViewWithSidebarProps> = ({
  projectId,
  onAddFactory
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Get real current user from MockDB
  const db = MockDatabaseImpl.getInstance();
  const currentUser = useMemo((): User => {
    const dbUser = db.getCurrentUser();
    if (dbUser) {
      return {
        id: dbUser.id as string,
        name: dbUser.name,
        avatar: dbUser.profileImage || ''
      };
    }
    // Fallback if no user found
    return {
      id: 'user-1',
      name: '현재 사용자',
      avatar: ''
    };
  }, []);

  // Use the exact same hook as ProjectModal
  const {
    comments,
    handleAddComment,
    handleEditComment,
    handleDeleteComment,
    reloadComments
  } = useProjectComments(projectId || '', currentUser);

  // Add reaction handler with proper state update
  const handleAddReaction = useCallback((commentId: string, emoji: string) => {
    if (currentUser && currentUser.id) {
      const success = db.addReaction(commentId, emoji, currentUser.id);
      if (success) {
        // Reload comments to show updated reactions
        reloadComments();
      }
    }
  }, [currentUser, reloadComments, db]);

  const handleTaskSelect = (taskId: string) => {
    // Task selection is optional now - we're project-focused
    setSelectedTaskId(taskId);
    if (!isSidebarOpen) {
      setIsSidebarOpen(true);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-full relative overflow-hidden">
      {/* Main content area with proper padding */}
      <div className={`flex-1 transition-all duration-300 px-6 py-4 ${isSidebarOpen ? 'mr-96' : 'mr-0'}`}>
        <ScheduleTableView
          projectId={projectId}
          onAddFactory={onAddFactory}
          onTaskClick={handleTaskSelect}
        />
      </div>

      {/* Sidebar - properly aligned with content area */}
      <div
        className={`absolute right-0 top-0 bottom-0 bg-white border-l border-gray-200 shadow-lg transition-transform duration-300 z-30 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ 
          width: '420px'  // Slightly wider for better comment display
        }}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">댓글</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Comment Section - Full height */}
          <div className="flex-1 flex flex-col min-h-0">
            {projectId ? (
              <CommentSection
                comments={comments}
                currentUser={currentUser}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
                onEditComment={handleEditComment}
                onAddReaction={handleAddReaction}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>프로젝트를 선택해주세요</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toggle button - adjusted position to be visible and not interfere with main content */}
      <button
        onClick={toggleSidebar}
        className={`absolute top-1/2 -translate-y-1/2 z-40 bg-white border border-gray-200 rounded-l-lg p-2 shadow-md hover:bg-gray-50 transition-all duration-300`}
        style={{ right: isSidebarOpen ? '420px' : '0' }}
      >
        {isSidebarOpen ? (
          <ChevronRight className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        )}
      </button>
    </div>
  );
};

export default TaskViewWithSidebar;