/**
 * Comment type definitions
 */

import { UserId, ProjectId } from './branded';

export interface CommentAuthor {
  id: UserId;
  name: string;
  profileImage?: string;
}

export interface EmojiReaction {
  emoji: string;
  users: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

export interface CommentAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export interface Comment {
  id: string; // Comment IDs remain as strings for now
  projectId: ProjectId;
  userId: UserId;
  author: CommentAuthor;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  parentId?: string; // Comment IDs remain as strings
  replies?: Comment[];
  mentions?: CommentAuthor[];
  reactions?: EmojiReaction[];
  attachments?: CommentAttachment[];
}

export interface CreateCommentInput {
  content: string;
  projectId: ProjectId;
  parentId?: string; // Comment IDs remain as strings
  mentions?: UserId[];
}

export type UpdateCommentInput = Partial<CreateCommentInput>;