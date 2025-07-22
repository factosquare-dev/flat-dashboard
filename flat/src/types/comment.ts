export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt?: string;
  parentId?: string;
  replies?: Comment[];
  mentions?: User[];
  projectId: string;
}

export interface CreateCommentInput {
  content: string;
  projectId: string;
  parentId?: string;
  mentions?: string[];
}