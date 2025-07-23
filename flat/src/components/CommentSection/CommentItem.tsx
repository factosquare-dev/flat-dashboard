import React, { useState, memo } from 'react';
import type { Comment, User } from '../../types/comment';
import { MessageSquare, Edit2, Trash2, MoreVertical } from 'lucide-react';
import CommentInput from './CommentInput';
import { formatRelativeTime } from '../../utils/dateUtils';

interface CommentItemProps {
  comment: Comment;
  replies?: Comment[];
  currentUser: User;
  onReply: (comment: Comment) => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onAddComment: (content: string, parentId?: string, mentions?: string[]) => void;
  onCancelReply: () => void;
  replyToId?: string | null;
  isTopLevel?: boolean; // 최상위 댓글인지 구분
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  replies,
  currentUser,
  onReply,
  onEdit,
  onDelete,
  onAddComment,
  onCancelReply,
  replyToId,
  isTopLevel = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  
  const isAuthor = currentUser.id === comment.author.id;
  

  const handleEdit = (content: string) => {
    onEdit(comment.id, content);
    setIsEditing(false);
  };

  // @멘션을 하이라이트하여 표시
  const renderContent = (content: string) => {
    const parts = content.split(/(@\S+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="text-blue-600 font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-white">
            {comment.author.avatar ? (
              <img src={comment.author.avatar} alt={comment.author.name} className="w-full h-full rounded-full" />
            ) : (
              comment.author.name.charAt(0).toUpperCase()
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1">
          {isEditing ? (
            <CommentInput
              currentUser={currentUser}
              onSubmit={handleEdit}
              onCancel={() => setIsEditing(false)}
              initialValue={comment.content}
              placeholder="댓글 수정..."
              isEdit
            />
          ) : (
            <>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{comment.author.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{formatRelativeTime(comment.createdAt)}</span>
                    {isAuthor && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowOptions(!showOptions);
                          }}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <MoreVertical className="w-3 h-3 text-gray-600" />
                        </button>
                        
                        {showOptions && (
                          <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(true);
                                setShowOptions(false);
                              }}
                              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Edit2 className="w-3 h-3" />
                              수정
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(comment.id);
                                setShowOptions(false);
                              }}
                              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                            >
                              <Trash2 className="w-3 h-3" />
                              삭제
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {renderContent(comment.content)}
                </p>
                {comment.updatedAt && (
                  <span className="text-xs text-gray-400">(수정됨)</span>
                )}
              </div>
              
              {/* Reply button - 자기 자신의 댓글이 아닐 때만 표시 */}
              {!isAuthor && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReply(comment);
                  }}
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <MessageSquare className="w-3 h-3" />
                  답글
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Replies - 2단계로 표시 */}
      {replies && replies.length > 0 && (
        <div className="ml-10 mt-3 space-y-3" onClick={(e) => e.stopPropagation()}>
          {replies.map((reply, index) => (
            <div key={reply.id}>
              <CommentItem
                comment={reply}
                currentUser={currentUser}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddComment={onAddComment}
                onCancelReply={onCancelReply}
                replyToId={replyToId}
                isTopLevel={false}
              />
              {/* 답글 입력창을 해당 댓글 바로 아래에 표시 - replies가 있을 때만 */}
              {isTopLevel && replyToId === reply.id && (
                <div className="mt-3 ml-11">
                  <CommentInput
                    currentUser={currentUser}
                    onSubmit={(content, mentions) => {
                      // 답글의 답글은 원래 최상위 댓글의 답글로 처리 (2단계 유지)
                      let finalContent = content;
                      let finalMentions = mentions || [];
                      
                      if (!content.includes(`@${reply.author.name}`)) {
                        finalContent = `@${reply.author.name} ${content}`;
                      }
                      finalMentions = [...finalMentions, reply.author.id];
                      
                      // 원래 최상위 댓글의 ID를 parentId로 사용 (2단계 유지)
                      const topLevelParentId = reply.parentId || comment.id;
                      onAddComment(finalContent, topLevelParentId, finalMentions);
                    }}
                    onCancel={onCancelReply}
                    placeholder={`${reply.author.name}님에게 답글 작성...`}
                    autoFocus
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 최상위 댓글에 대한 답글 입력창 - replies가 없을 때만 또는 최상위일 때만 */}
      {isTopLevel && replyToId === comment.id && (
        <div className="mt-3 ml-11">
          <CommentInput
            currentUser={currentUser}
            onSubmit={(content, mentions) => {
              // 자동으로 원댓글 작성자를 멘션에 추가
              let finalContent = content;
              let finalMentions = mentions || [];
              
              if (!content.includes(`@${comment.author.name}`)) {
                finalContent = `@${comment.author.name} ${content}`;
              }
              finalMentions = [...finalMentions, comment.author.id];
              
              onAddComment(finalContent, comment.id, finalMentions);
            }}
            onCancel={onCancelReply}
            placeholder={`${comment.author.name}님에게 답글 작성...`}
            autoFocus
          />
        </div>
      )}
    </div>
  );
};

export default memo(CommentItem);