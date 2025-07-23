import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Comment, CommentAuthor } from '../../types/comment';
import CommentItem from './CommentItem';
import CommentInput from './CommentInput';

interface CommentSectionProps {
  projectId: string;
  comments: Comment[];
  currentUser: CommentAuthor;
  onAddComment: (content: string, parentId?: string, mentions?: string[]) => void;
  onDeleteComment: (commentId: string) => void;
  onEditComment: (commentId: string, content: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  projectId,
  comments,
  currentUser,
  onAddComment,
  onDeleteComment,
  onEditComment
}) => {
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const commentSectionRef = useRef<HTMLDivElement>(null);

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

  // 외부 클릭 시 답글 입력창 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commentSectionRef.current && !commentSectionRef.current.contains(event.target as Node)) {
        setReplyToId(null);
      }
    };

    // 답글 입력창이 열려있을 때만 이벤트 리스너 추가
    if (replyToId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [replyToId]);

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
        <div className="mt-6 space-y-4">
          {commentStructure.topLevelComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={commentStructure.repliesMap.get(comment.id) || []}
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
          
          {comments.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentSection;