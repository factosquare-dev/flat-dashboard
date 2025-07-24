/**
 * Comment type definitions
 */

export interface CommentAuthor {
  id: string;
  name: string;
  profileImage?: string;
}

export interface Comment {
  id: string;
  projectId: string;
  userId: string;
  author: CommentAuthor;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  parentId?: string;
  replies?: Comment[];
  mentions?: CommentAuthor[];
}

export interface CreateCommentInput {
  content: string;
  projectId: string;
  parentId?: string;
  mentions?: string[];
}

export type UpdateCommentInput = Partial<CreateCommentInput>;