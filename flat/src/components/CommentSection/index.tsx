import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useClickOutsideRef } from '@/shared/hooks/useClickOutside';
import type { Comment, CommentAuthor } from '@/shared/types/comment';
import CommentItem from './CommentItem';
import CommentInput from './CommentInput';
import { LoadingState } from '@/shared/components/LoadingState';

interface CommentSectionProps {
  comments: Comment[];
  currentUser: CommentAuthor;
  onAddComment: (content: string, parentId?: string, mentions?: string[], attachments?: File[]) => void;
  onDeleteComment: (commentId: string) => void;
  onEditComment: (commentId: string, content: string) => void;
  onAddReaction?: (commentId: string, emoji: string) => void;
  isLoading?: boolean;
  error?: Error | null;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  currentUser,
  onAddComment,
  onDeleteComment,
  onEditComment,
  onAddReaction,
  isLoading = false,
  error = null
}) => {
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const commentSectionRef = React.useRef<HTMLDivElement>(null);
  const commentsEndRef = React.useRef<HTMLDivElement>(null);

  // Optimize comment structure with memoization
  const commentStructure = useMemo(() => {
    const topLevelComments: Comment[] = [];
    const repliesMap = new Map<string, Comment[]>();
    
    // First pass: separate top-level comments and create replies map
    comments.forEach(comment => {
      if (!comment.parentId) {
        topLevelComments.push(comment);
      }
    });
    
    // Second pass: organize replies for each top-level comment
    topLevelComments.forEach(topComment => {
      const replies: Comment[] = [];
      
      // Find direct replies
      comments.forEach(comment => {
        if (comment.parentId === topComment.id) {
          replies.push(comment);
        }
      });
      
      // Find indirect replies (replies to replies)
      comments.forEach(comment => {
        if (comment.parentId && comment.parentId !== topComment.id) {
          const parent = comments.find(p => p.id === comment.parentId);
          if (parent && parent.parentId === topComment.id) {
            replies.push(comment);
          }
        }
      });
      
      // Sort replies by date (ascending order)
      replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      repliesMap.set(topComment.id, replies);
    });
    
    return { topLevelComments, repliesMap };
  }, [comments]);

  const handleReply = (comment: Comment) => {
    // 같은 댓글을 다시 클릭하면 토글 (닫기)
    if (replyToId === comment.id) {
      setReplyToId(null);
    } else {
      // 다른 댓글을 클릭하면 기존 입력창을 닫고 새로운 입력창 열기
      setReplyToId(comment.id);
    }
  };

  const handleSubmit = (content: string, mentions?: string[], attachments?: File[], parentId?: string) => {
    onAddComment(content, parentId, mentions, attachments);
    if (parentId) {
      setReplyToId(null);
    }
  };

  // Auto scroll to bottom when comments change
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  // 외부 클릭 시 답글 입력창 닫기 - custom hook 사용
  useClickOutsideRef(
    commentSectionRef,
    useCallback(() => setReplyToId(null), []),
    !!replyToId
  );

  return (
    <div ref={commentSectionRef} className="flex flex-col h-full bg-white rounded-xl border border-gray-200" onClick={(e) => e.stopPropagation()}>
      <div className="p-5 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">댓글</h3>
      </div>
      
      {/* Comments list area - scrollable */}
      <div className="flex-1 overflow-y-auto p-5">
        <LoadingState
          isLoading={isLoading}
          error={error}
          isEmpty={comments.length === 0}
          className=""
          emptyComponent={
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">아직 댓글이 없습니다</h3>
              <p className="text-sm text-gray-600">첫 댓글을 작성해보세요!</p>
            </div>
          }
        >
          <div className="space-y-4">
            {commentStructure.topLevelComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                replies={commentStructure.repliesMap.get(comment.id) ?? []}
                currentUser={currentUser}
                onReply={handleReply}
                onEdit={onEditComment}
                onDelete={onDeleteComment}
                onAddComment={(content, parentId, mentions, attachments) => handleSubmit(content, mentions, attachments, parentId)}
                onCancelReply={() => setReplyToId(null)}
                onAddReaction={onAddReaction}
                replyToId={replyToId}
                isTopLevel={true}
              />
            ))}
          </div>
        </LoadingState>
        {/* Scroll anchor */}
        <div ref={commentsEndRef} />
      </div>
      
      {/* Comment input - fixed at bottom */}
      <div className="border-t border-gray-200 p-5 bg-gray-50">
        <CommentInput
          currentUser={currentUser}
          onSubmit={(content, mentions, attachments) => handleSubmit(content, mentions, attachments)}
          placeholder="댓글을 작성하세요..."
        />
      </div>
    </div>
  );
};

export default CommentSection;