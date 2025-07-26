import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryClient';
import { projectsApi } from '../../../api/projects';
import type { Project } from '../../../types/project';
import { toast } from 'react-hot-toast';

interface ProjectFilters {
  status?: string[];
  serviceType?: string[];
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Hook to fetch projects list
 */
export const useProjects = (filters?: ProjectFilters) => {
  return useQuery({
    queryKey: queryKeys.projects.list(filters),
    // 백엔드 연결 전까지 주석처리
    // queryFn: () => projectsApi.getProjects(filters),
    queryFn: () => Promise.resolve([]), // 임시 빈 배열 반환
    select: (data) => data?.data || data, // Extract data from API response
  });
};

/**
 * Hook to fetch single project
 */
export const useProject = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    // 백엔드 연결 전까지 주석처리
    // queryFn: () => projectsApi.getProject(id),
    queryFn: () => Promise.resolve(null), // 임시 null 반환
    enabled: options?.enabled ?? !!id,
    select: (data) => data?.data || data,
  });
};

/**
 * Hook to create a new project
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    // 백엔드 연결 전까지 주석처리
    // mutationFn: (project: Partial<Project>) => projectsApi.createProject(project),
    mutationFn: (project: Partial<Project>) => Promise.resolve({ id: 'temp-id', ...project }),
    onSuccess: (data, variables) => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
      
      // Optionally add the new project to cache immediately
      queryClient.setQueryData(
        queryKeys.projects.detail(data.id),
        data
      );
      
      toast.success('프로젝트가 성공적으로 생성되었습니다.');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || '프로젝트 생성에 실패했습니다.');
    },
  });
};

/**
 * Hook to update a project
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    // 백엔드 연결 전까지 주석처리
    // mutationFn: ({ id, updates }: { id: string; updates: Partial<Project> }) =>
    //   projectsApi.updateProject({ id, ...updates }),
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Project> }) =>
      Promise.resolve({ id, ...updates }),
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.detail(id) });
      
      // Snapshot the previous value
      const previousProject = queryClient.getQueryData(queryKeys.projects.detail(id));
      
      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.projects.detail(id), (old: Project | undefined) => ({
        ...old,
        data: { ...old?.data, ...updates },
      }));
      
      // Return a context object with the snapshotted value
      return { previousProject };
    },
    onError: (err, { id }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousProject) {
        queryClient.setQueryData(queryKeys.projects.detail(id), context.previousProject);
      }
      toast.error('프로젝트 업데이트에 실패했습니다.');
    },
    onSettled: (data, error, { id }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
    },
    onSuccess: () => {
      toast.success('프로젝트가 성공적으로 업데이트되었습니다.');
    },
  });
};

/**
 * Hook to delete a project
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    // 백엔드 연결 전까지 주석처리
    // mutationFn: (id: string) => projectsApi.deleteProject(id),
    mutationFn: (id: string) => Promise.resolve({ id }),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.lists() });
      
      // Remove from list cache
      queryClient.setQueriesData(
        { queryKey: queryKeys.projects.lists() },
        (old: Project[] | undefined) => ({
          ...old,
          data: old?.filter((project: Project) => project.id !== id) ?? [],
        })
      );
    },
    onSuccess: (data, id) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: queryKeys.projects.detail(id) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
      
      toast.success('프로젝트가 성공적으로 삭제되었습니다.');
    },
    onError: () => {
      // Refetch on error to restore correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
      toast.error('프로젝트 삭제에 실패했습니다.');
    },
  });
};

/**
 * Hook to prefetch project data
 */
export const usePrefetchProject = () => {
  const queryClient = useQueryClient();
  
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.projects.detail(id),
      // 백엔드 연결 전까지 주석처리
      // queryFn: () => projectsApi.getProject(id),
      queryFn: () => Promise.resolve(null),
      staleTime: 10 * 1000, // Consider data stale after 10 seconds
    });
  };
};