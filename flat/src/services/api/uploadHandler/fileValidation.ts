import type { UploadOptions } from './types';

export class FileValidator {
  static validateFile(file: File, options: UploadOptions): void {
    // Check file size
    if (options.maxFileSize && file.size > options.maxFileSize) {
      throw new Error(`File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum allowed size (${Math.round(options.maxFileSize / 1024 / 1024)}MB)`);
    }

    // Check file type
    if (options.allowedTypes && options.allowedTypes.length > 0) {
      const isAllowed = options.allowedTypes.some(type => {
        if (type.includes('/')) {
          return file.type === type;
        } else {
          return file.name.toLowerCase().endsWith(`.${type.toLowerCase()}`);
        }
      });

      if (!isAllowed) {
        throw new Error(`File type "${file.type}" is not allowed. Allowed types: ${options.allowedTypes.join(', ')}`);
      }
    }
  }

  static getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  static isVideoFile(file: File): boolean {
    return file.type.startsWith('video/');
  }

  static isDocumentFile(file: File): boolean {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ];
    return documentTypes.includes(file.type);
  }
}