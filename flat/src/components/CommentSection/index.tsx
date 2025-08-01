import React, { useState, useMemo, useCallback } from 'react';
import { useClickOutsideRef } from '@/hooks/useClickOutside';
import type { Comment, CommentAuthor } from '../../types/comment';
import CommentItem from './CommentItem';
import CommentInput from './CommentInput';
import { LoadingState } from '../loading/LoadingState';

interface CommentSectionProps {
  comments: Comment[];
  currentUser: CommentAuthor;
  onAddComment: (content: string, parentId?: string, mentions?: string[]) => void;
  onDeleteComment: (commentId: string) => void;
  onEditComment: (commentId: string, content: string) => void;
  isLoading?: boolean;
  error?: Error | null;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  currentUser,
  onAddComment,
  onDeleteComment,
  onEditComment,
  isLoading = false,
  error = null
}) => {
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const commentSectionRef = React.useRef<HTMLDivElement>(null);

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

  const handleSubmit = (content: string, mentions?: string[], parentId?: string) => {
    onAddComment(content, parentId, mentions);
    if (parentId) {
      setReplyToId(null);
    }
  };

  // 외부 클릭 시 답글 입력창 닫기 - custom hook 사용
  useClickOutsideRef(
    commentSectionRef,
    useCallback(() => setReplyToId(null), []),
    !!replyToId
  );

  return (
    <div ref={commentSectionRef} className="bg-white rounded-xl border border-gray-200" onClick={(e) => e.stopPropagation()}>
      <div className="p-5 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">댓글</h3>
      </div>
      
      <div className="p-5">
        {/* Main comment input */}
        <CommentInput
          currentUser={currentUser}
          onSubmit={(content, mentions) => handleSubmit(content, mentions)}
          placeholder="댓글을 작성하세요..."
        />
        
        {/* Comments list - 최상위 댓글만 표시 (replies는 각 comment 내부에서 렌더링) */}
        <LoadingState
          isLoading={isLoading}
          error={error}
          isEmpty={comments.length === 0}
          className="mt-6"
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
                onAddComment={(content, parentId, mentions) => handleSubmit(content, mentions, parentId)}
                onCancelReply={() => setReplyToId(null)}
                replyToId={replyToId}
                isTopLevel={true}
              />
            ))}
          </div>
        </LoadingState>
      </div>
    </div>
  );
};

export default CommentSection;