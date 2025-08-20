import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Edit2, Trash2, MoreVertical, Clock, User } from 'lucide-react';
import { MockDatabaseImpl } from '@/core/database/MockDatabase';
import type { Comment } from '@/shared/types/comment';
import type { Task } from '@/shared/types/schedule';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface TaskCommentSidebarProps {
  taskId?: string | null;  // Made optional since we're project-focused
  projectId?: string;
  onClose: () => void;
}

const TaskCommentSidebar: React.FC<TaskCommentSidebarProps> = ({
  taskId,
  projectId,
  onClose
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [showOptionsMenu, setShowOptionsMenu] = useState<string | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const db = MockDatabaseImpl.getInstance();

  // Load comments for project
  useEffect(() => {
    loadComments();
  }, [projectId]);

  const loadComments = () => {
    if (!projectId) return;
    
    const projectComments = db.getCommentsByProjectId(projectId);
    setComments(projectComments);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !projectId) return;

    const currentUser = db.getCurrentUser();
    if (!currentUser) return;

    const comment = db.createComment({
      content: newComment,  // No task prefix since we're project-focused
      projectId: projectId,
      userId: currentUser.id as string
    });

    if (comment) {
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  const handleEditComment = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      setEditingCommentId(commentId);
      setEditingContent(comment.content);
      setShowOptionsMenu(null);
    }
  };

  const handleSaveEdit = () => {
    if (!editingCommentId || !editingContent.trim()) return;

    const updated = db.updateComment(editingCommentId, {
      content: editingContent
    });

    if (updated) {
      setComments(comments.map(c => 
        c.id === editingCommentId ? { ...c, content: editingContent, updatedAt: new Date() } : c
      ));
      setEditingCommentId(null);
      setEditingContent('');
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      const deleted = db.deleteComment(commentId);
      if (deleted) {
        setComments(comments.filter(c => c.id !== commentId));
        setShowOptionsMenu(null);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  if (!projectId) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">댓글</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p>프로젝트를 선택해주세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">댓글</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>


      {/* Comments Section */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          댓글 ({comments.length})
        </h3>
        
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {comment.author.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt), { 
                          addSuffix: true,
                          locale: ko 
                        })}
                      </span>
                    </div>
                    {editingCommentId === comment.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            저장
                          </button>
                          <button
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditingContent('');
                            }}
                            className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Options menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowOptionsMenu(showOptionsMenu === comment.id ? null : comment.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                  
                  {showOptionsMenu === comment.id && (
                    <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => handleEditComment(comment.id)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <Edit2 className="w-3 h-3" />
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <Trash2 className="w-3 h-3" />
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {comments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">아직 댓글이 없습니다.</p>
              <p className="text-xs mt-1">첫 번째 댓글을 작성해보세요!</p>
            </div>
          )}
        </div>
      </div>

      {/* Comment Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-2">
          <textarea
            ref={commentInputRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="댓글을 입력하세요... (Enter로 전송, Shift+Enter로 줄바꿈)"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCommentSidebar;