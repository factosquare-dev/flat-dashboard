import React from 'react';
import { Paperclip, Trash2 } from 'lucide-react';
import './FileAttachment.css';

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
    <div className="modal-field-spacing">
      <div className="modal-field-label">
        <Paperclip />
        첨부파일
      </div>
      <div 
        className="file-attachment__upload-area"
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <Paperclip className="file-attachment__upload-icon" />
        <p className="file-attachment__upload-text">파일을 드래그하거나 클릭하여 업로드</p>
        <input 
          id="file-input"
          type="file" 
          className="hidden" 
          multiple 
          onChange={handleFileChange}
        />
      </div>
      {attachments.length > 0 && (
        <div className="file-attachment__list">
          {attachments.map((file, index) => (
            <div key={file.name} className="file-attachment__item">
              <div className="file-attachment__item-info">
                <Paperclip className="file-attachment__item-icon" />
                <span className="file-attachment__item-name">{file.name}</span>
              </div>
              <button
                onClick={() => onFileDelete(index)}
                className="file-attachment__delete-btn"
                title="삭제"
              >
                <Trash2 className="file-attachment__delete-icon" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileAttachment;