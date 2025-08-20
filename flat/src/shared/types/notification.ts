export enum NotificationType {
  MENTION = 'mention',
  REACTION = 'reaction',
  COMMENT_REPLY = 'comment_reply',
  SYSTEM = 'system'
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  userId: string;
  data?: {
    commentId?: string;
    projectId?: string;
    emoji?: string;
    fromUserId?: string;
    fromUserName?: string;
  };
}

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  data?: Notification['data'];
}