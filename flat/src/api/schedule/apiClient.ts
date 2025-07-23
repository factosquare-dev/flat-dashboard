/**
 * Schedule API 클라이언트 설정
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const getApiClient = async () => {
  const { apiClient } = await import('../../utils/apiClient');
  return apiClient;
};