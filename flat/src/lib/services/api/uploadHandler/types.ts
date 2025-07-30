import type { RequestOptions } from '../requestHandlers';

export interface UploadOptions extends RequestOptions {
  onProgress?: (progress: number) => void;
  chunkSize?: number;
  allowedTypes?: string[];
  maxFileSize?: number;
}

export interface UploadResponse {
  fileId: string;
  filename: string;
  size: number;
  mimeType: string;
  url?: string;
}