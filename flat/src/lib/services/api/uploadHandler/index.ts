import type { ApiResponse } from '../requestHandlers';
import type { UploadOptions, UploadResponse } from './types';
import { SingleFileUploader } from './singleFileUpload';
import { MultipleFileUploader } from './multipleFileUpload';
import { FileValidator } from './fileValidation';

export class UploadHandler {
  private singleFileUploader: SingleFileUploader;
  private multipleFileUploader: MultipleFileUploader;

  constructor(
    baseURL: string,
    defaultHeaders: Record<string, string>,
    defaultTimeout: number
  ) {
    this.singleFileUploader = new SingleFileUploader(baseURL, defaultHeaders, defaultTimeout);
    this.multipleFileUploader = new MultipleFileUploader(baseURL, defaultHeaders, defaultTimeout);
  }

  async uploadFile(
    endpoint: string,
    file: File,
    options: UploadOptions = {}
  ): Promise<ApiResponse<UploadResponse>> {
    return this.singleFileUploader.uploadFile(endpoint, file, options);
  }

  async uploadMultipleFiles(
    endpoint: string,
    files: File[],
    options: UploadOptions = {}
  ): Promise<ApiResponse<UploadResponse[]>> {
    return this.multipleFileUploader.uploadMultipleFiles(endpoint, files, options);
  }

  // Expose utility methods
  static getFileExtension = FileValidator.getFileExtension;
  static formatFileSize = FileValidator.formatFileSize;
  static isImageFile = FileValidator.isImageFile;
  static isVideoFile = FileValidator.isVideoFile;
  static isDocumentFile = FileValidator.isDocumentFile;
}

export type { UploadOptions, UploadResponse } from './types';