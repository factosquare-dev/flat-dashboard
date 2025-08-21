import React, { useState, useRef, useEffect } from 'react';
import type { User } from '@/shared/types/comment';
import { Send, Paperclip, X } from 'lucide-react';
import { useMentionableUsers } from '@/shared/hooks/useUsers';

interface CommentInputProps {
  currentUser: User;
  onSubmit: (content: string, mentions?: string[], attachments?: File[]) => void;
  onCancel?: () => void;
  placeholder?: string;
  initialValue?: string;
  autoFocus?: boolean;
  isEdit?: boolean;
}

interface MentionSuggestion {
  id: string;
  name: string;
  avatar?: string;
}

const CommentInput: React.FC<CommentInputProps> = ({
  currentUser,
  onSubmit,
  onCancel,
  placeholder = "댓글을 작성하세요...",
  initialValue = "",
  autoFocus = false,
  isEdit = false
}) => {
  const [content, setContent] = useState(initialValue);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get mentionable users from custom hook
  const { mentionableUsers: mockUsers } = useMentionableUsers();
  
  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(mentionSearch.toLowerCase()) &&
    user.id !== currentUser.id
  );

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    setContent(value);
    setCursorPosition(cursorPos);
    
    // Check for @ mention
    const beforeCursor = value.substring(0, cursorPos);
    const lastAtIndex = beforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const afterAt = beforeCursor.substring(lastAtIndex + 1);
      if (!afterAt.includes(' ')) {
        setMentionSearch(afterAt);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (user: MentionSuggestion) => {
    const beforeCursor = content.substring(0, cursorPosition);
    const afterCursor = content.substring(cursorPosition);
    const lastAtIndex = beforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const newContent = 
        content.substring(0, lastAtIndex) + 
        `@${user.name} ` + 
        afterCursor;
      
      setContent(newContent);
      setShowMentions(false);
      
      // Focus back on textarea
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = lastAtIndex + user.name.length + 2;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setAttachedFiles(prev => [...prev, ...Array.from(files)]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (content.trim() || attachedFiles.length > 0) {
      // Extract mentions from content
      const mentionMatches = content.match(/@(\S+)/g);
      const mentions = mentionMatches?.map(match => {
        const name = match.substring(1);
        const user = mockUsers.find(u => u.name === name);
        return user?.id;
      }).filter(Boolean) as string[] | undefined;
      
      onSubmit(content.trim(), mentions, attachedFiles.length > 0 ? attachedFiles : undefined);
      setContent('');
      setAttachedFiles([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <div className="flex gap-2">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-white">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full rounded-full" />
            ) : (
              currentUser.name.charAt(0).toUpperCase()
            )}
          </div>
        </div>
        
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-sm"
            rows={isEdit ? 2 : 1}
          />

          {/* Attached files display */}
          {attachedFiles.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {attachedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-xs">
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Mention suggestions */}
          {showMentions && filteredUsers.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-48 overflow-y-auto z-20">
              {filteredUsers.map((user) => (
                <button
                  type="button"
                  key={user.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMentionSelect(user);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span>{user.name}</span>
                </button>
              ))}
            </div>
          )}
          
          <div className="flex justify-between items-center mt-2">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                title="파일 첨부"
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex gap-2">
              {(onCancel || isEdit) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancel?.();
                  }}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  취소
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubmit();
                }}
                disabled={!content.trim() && attachedFiles.length === 0}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                {isEdit ? '수정' : '작성'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentInput;