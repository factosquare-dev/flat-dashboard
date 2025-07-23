import React from 'react';
import { Paperclip, Trash2 } from 'lucide-react';

interface FileAttachmentProps {
  attachments: File[];
  onFileAdd: (files: File[]) => void;
  onFileDelete: (index: number) => void;
}

const FileAttachment: React.FC<FileAttachmentProps> = ({
  attachments,
  onFileAdd,
  onFileDelete
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFileAdd(Array.from(e.target.files));
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        첨부파일
      </label>
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <Paperclip className="w-6 h-6 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">파일을 드래그하거나 클릭하여 업로드</p>
        <input 
          id="file-input"
          type="file" 
          className="hidden" 
          multiple 
          onChange={handleFileChange}
        />
      </div>
      {attachments.length > 0 && (
        <div className="mt-2 space-y-1">
          {attachments.map((file, index) => (
            <div key={file.name} className="text-sm text-gray-600 flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Paperclip className="w-3.5 h-3.5" />
                <span className="truncate">{file.name}</span>
              </div>
              <button
                onClick={() => onFileDelete(index)}
                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                title="삭제"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileAttachment;