import { useState, useCallback } from 'react';
import type { Comment } from '../types/comment';
import type { User } from '../types/user';
import { ProjectModalService } from '../services/projectModal.service';

export const useProjectComments = (projectId: string, currentUser: User) => {
  const [comments, setComments] = useState<Comment[]>(() => 
    ProjectModalService.generateMockComments(projectId)
  );

  const handleAddComment = useCallback((
    content: string, 
    parentId?: string, 
    mentions?: string[]
  ) => {
    const newComment = ProjectModalService.createComment(
      content,
      currentUser,
      projectId,
      parentId,
      mentions
    );

    setComments(prevComments => [...prevComments, newComment]);

    // TODO: API 호출하여 댓글 저장
    // TODO: 멘션된 사용자에게 알림 전송
  }, [currentUser, projectId]);

  const handleEditComment = useCallback((commentId: string, content: string) => {
    setComments(prevComments => 
      prevComments.map(comment => 
        comment.id === commentId 
          ? ProjectModalService.updateComment(comment, content)
          : comment
      )
    );
    // TODO: API 호출하여 댓글 수정
  }, []);

  const handleDeleteComment = useCallback((commentId: string) => {
    setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
    // TODO: API 호출하여 댓글 삭제
  }, []);

  return {
    comments,
    handleAddComment,
    handleEditComment,
    handleDeleteComment
  };
};