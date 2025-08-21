import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  uploadedImages: string[];
  onImagesChange: (images: string[]) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  uploadedImages, 
  onImagesChange 
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            onImagesChange([...uploadedImages, result]);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          onImagesChange([...uploadedImages, result]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    onImagesChange(uploadedImages.filter((_, i) => i !== index));
  };

  return (
    <div className="factory-modal__section">
      <label className="factory-modal__label">공장 이미지</label>
      
      {/* Image Upload Area */}
      <div
        className={`factory-modal__upload-area ${isDragging ? 'factory-modal__upload-area--dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="factory-modal__file-input"
          id="factory-images"
        />
        <label htmlFor="factory-images" className="factory-modal__upload-label">
          <Upload className="factory-modal__upload-icon" />
          <span>이미지를 드래그하거나 클릭하여 업로드</span>
          <span className="factory-modal__upload-hint">
            JPG, PNG, GIF 파일 지원 (최대 5MB)
          </span>
        </label>
      </div>

      {/* Uploaded Images Preview */}
      {uploadedImages.length > 0 && (
        <div className="factory-modal__images">
          <h4 className="factory-modal__images-title">
            <ImageIcon className="w-4 h-4" />
            업로드된 이미지 ({uploadedImages.length})
          </h4>
          <div className="factory-modal__images-grid">
            {uploadedImages.map((image, index) => (
              <div key={index} className="factory-modal__image-item">
                <img
                  src={image}
                  alt={`Factory ${index + 1}`}
                  className="factory-modal__image"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="factory-modal__image-remove"
                  title="이미지 삭제"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};