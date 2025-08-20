import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProjects } from '@/shared/hooks/useProjects/index';
import { projectService } from '@/core/services';

// Mock the project service
vi.mock('../../../../features/projects/services', () => ({
  projectService: {
    getProjects: vi.fn(),
  },
}));

// Mock the logger
vi.mock('../../../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch projects on mount', async () => {
    const mockProjects = [
      { id: '1', projectName: 'Project 1' },
      { id: '2', projectName: 'Project 2' },
    ];

    vi.mocked(projectService.getProjects).mockResolvedValue({
      success: true,
      data: {
        projects: mockProjects,
        total: 2,
      },
    });

    const { result } = renderHook(() => useProjects());

    expect(result.current.loading).toBe(true);
    expect(result.current.projects).toEqual([]);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.projects).toEqual(mockProjects);
      expect(result.current.total).toBe(2);
    });
  });

  it('should handle errors gracefully', async () => {
    const mockError = new Error('Failed to fetch');
    vi.mocked(projectService.getProjects).mockRejectedValue(mockError);

    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(mockError);
      expect(result.current.projects).toEqual([]);
    });
  });

  it('should update filters and reset pagination', async () => {
    const { result } = renderHook(() => useProjects());

    const newFilters = { status: ['active'], priority: ['high'] };
    
    await waitFor(() => {
      result.current.updateFilters(newFilters);
    });

    expect(projectService.getProjects).toHaveBeenCalledWith(
      newFilters,
      { page: 1, limit: 20 },
      { field: 'createdAt', order: 'desc' }
    );
  });

  it('should not fetch when disabled', async () => {
    renderHook(() => useProjects({ enabled: false }));

    await waitFor(() => {
      expect(projectService.getProjects).not.toHaveBeenCalled();
    });
  });

  it('should refetch projects', async () => {
    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    vi.clearAllMocks();

    await result.current.refetch();

    expect(projectService.getProjects).toHaveBeenCalledTimes(1);
  });
});