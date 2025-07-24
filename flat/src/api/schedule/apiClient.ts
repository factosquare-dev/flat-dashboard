/**
 * Schedule API 클라이언트 설정
 */

import { apiConfig } from '../../config';

export const API_BASE_URL = apiConfig.baseURL;

export const getApiClient = async () => {
  const { apiClient } = await import('../../utils/apiClient');
  return apiClient;
};