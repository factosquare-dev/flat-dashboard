import { useState, useCallback, useEffect } from 'react';
import type { Comment, CommentAttachment } from '@/shared/types/comment';
import type { User } from '@/shared/types/user';
import { ProjectModalService } from '@/core/services/projectModal.service';
import { MockDatabaseImpl } from '@/core/database/MockDatabase';

export const useProjectComments = (projectId: string, currentUser: User) => {
  const db = MockDatabaseImpl.getInstance();
  const [comments, setComments] = useState<Comment[]>([]);

  // Load comments from MockDB
  useEffect(() => {
    if (projectId) {
      const dbComments = db.getCommentsByProjectId(projectId);
      setComments(dbComments);
    }
  }, [projectId]);

  const handleAddComment = useCallback((
    content: string, 
    parentId?: string, 
    mentions?: string[],
    attachments?: File[]
  ) => {
    // Use MockDB to create comment
    const dbUser = db.getCurrentUser();
    if (!dbUser) return;

    // Convert File objects to CommentAttachment format
    const commentAttachments: CommentAttachment[] | undefined = attachments?.map(file => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file) // Create a temporary URL for the file
    }));

    const newComment = db.createComment({
      content,
      projectId,
      userId: dbUser.id as string,
      parentId,
      attachments: commentAttachments
    });

    if (newComment) {
      setComments(prevComments => [...prevComments, newComment]);
    }
  }, [projectId]);

  const handleEditComment = useCallback((commentId: string, content: string) => {
    const updated = db.updateComment(commentId, { content });
    if (updated) {
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId 
            ? { ...comment, content, updatedAt: new Date() }
            : comment
        )
      );
    }
  }, []);

  const handleDeleteComment = useCallback((commentId: string) => {
    const deleted = db.deleteComment(commentId);
    if (deleted) {
      setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
    }
  }, []);
  
  // Function to reload comments (for reactions update)
  const reloadComments = useCallback(() => {
    if (projectId) {
      const dbComments = db.getCommentsByProjectId(projectId);
      setComments(dbComments);
    }
  }, [projectId]);

  return {
    comments,
    handleAddComment,
    handleEditComment,
    handleDeleteComment,
    reloadComments
  };
};