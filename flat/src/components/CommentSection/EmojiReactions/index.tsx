import React, { useState } from 'react';
import { Smile } from 'lucide-react';
import type { EmojiReaction } from '@/shared/types/comment';

interface EmojiReactionsProps {
  reactions?: EmojiReaction[];
  commentId: string;
  onAddReaction: (commentId: string, emoji: string) => void;
  currentUserId: string;
}

// Popular emojis for quick reactions
const QUICK_EMOJIS = ['👍', '❤️', '😄', '😮', '😢', '🎉', '🚀', '👏', '💯', '🔥'];

const EmojiReactions: React.FC<EmojiReactionsProps> = ({
  reactions = [],
  commentId,
  onAddReaction,
  currentUserId
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState<string | null>(null);

  const handleEmojiClick = (emoji: string) => {
    onAddReaction(commentId, emoji);
    setShowEmojiPicker(false);
  };

  const getUserTooltip = (users: Array<{id: string; name: string}>) => {
    if (users.length === 0) return '';
    if (users.length === 1) return users[0].name;
    if (users.length === 2) return `${users[0].name}, ${users[1].name}`;
    if (users.length === 3) return `${users[0].name}, ${users[1].name}, ${users[2].name}`;
    return `${users[0].name}, ${users[1].name} 외 ${users.length - 2}명`;
  };

  const hasUserReacted = (reaction: EmojiReaction) => {
    return reaction.users.some(user => user.id === currentUserId);
  };

  return (
    <div className="flex items-center gap-1 mt-2" onClick={(e) => e.stopPropagation()}>
      {/* Existing reactions */}
      {reactions.map((reaction) => (
        <div
          key={reaction.emoji}
          className="relative"
          onMouseEnter={() => setHoveredReaction(reaction.emoji)}
          onMouseLeave={() => setHoveredReaction(null)}
        >
          <button
            onClick={() => handleEmojiClick(reaction.emoji)}
            className={`
              inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs
              transition-all hover:scale-110
              ${hasUserReacted(reaction) 
                ? 'bg-blue-100 border border-blue-400 text-blue-700' 
                : 'bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <span className="text-sm">{reaction.emoji}</span>
            <span className="font-medium">{reaction.users.length}</span>
          </button>
          
          {/* Tooltip showing who reacted */}
          {hoveredReaction === reaction.emoji && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
              <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                {getUserTooltip(reaction.users)}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add reaction button */}
      <div className="relative inline-block">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowEmojiPicker(!showEmojiPicker);
          }}
          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          title="이모지 추가"
        >
          <Smile className="w-4 h-4 text-gray-600" />
        </button>

        {/* Emoji picker - positioned above button with high z-index */}
        {showEmojiPicker && (
          <>
            {/* Backdrop to close picker when clicking outside */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={(e) => {
                e.stopPropagation();
                setShowEmojiPicker(false);
              }}
            />
            
            {/* Emoji picker popup */}
            <div className="absolute bottom-full left-0 mb-2 z-50" style={{ minWidth: '200px' }}>
              <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-2">
                <div className="grid grid-cols-5 gap-1">
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEmojiClick(emoji);
                      }}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors text-lg hover:scale-110"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmojiReactions;