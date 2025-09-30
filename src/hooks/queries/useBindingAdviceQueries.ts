import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bindingAdviceService, BindingAdvice } from '../../services/entities';
import { handleApiError } from '../../services/axiosApi';

// Query keys
export const bindingAdviceKeys = {
  all: ['bindingAdvices'] as const,
  lists: () => [...bindingAdviceKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...bindingAdviceKeys.lists(), { filters }] as const,
  details: () => [...bindingAdviceKeys.all, 'detail'] as const,
  detail: (id: string) => [...bindingAdviceKeys.details(), id] as const,
};

// Queries
export const useBindingAdvices = (filters?: Record<string, any>) => {
  return useQuery({
    queryKey: filters ? bindingAdviceKeys.list(filters) : bindingAdviceKeys.lists(),
    queryFn: () => filters ? bindingAdviceService.search(filters) : bindingAdviceService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBindingAdvice = (id: string) => {
  return useQuery({
    queryKey: bindingAdviceKeys.detail(id),
    queryFn: () => bindingAdviceService.getById(id),
    enabled: !!id,
  });
};

// Mutations
export const useCreateBindingAdvice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<BindingAdvice, 'id'>) => bindingAdviceService.create(data),
    onSuccess: (newBindingAdvice) => {
      // Invalidate and refetch binding advice queries
      queryClient.invalidateQueries({ queryKey: bindingAdviceKeys.all });
      
      // Optionally add the new item to the cache
      queryClient.setQueryData(
        bindingAdviceKeys.detail(newBindingAdvice.id),
        newBindingAdvice
      );
    },
    onError: (error) => {
      console.error('Failed to create binding advice:', handleApiError(error));
    },
  });
};

export const useUpdateBindingAdvice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BindingAdvice> }) =>
      bindingAdviceService.update(id, data),
    onSuccess: (updatedBindingAdvice, { id }) => {
      // Update the specific item in cache
      queryClient.setQueryData(
        bindingAdviceKeys.detail(id),
        updatedBindingAdvice
      );
      
      // Invalidate list queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: bindingAdviceKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to update binding advice:', handleApiError(error));
    },
  });
};

export const useDeleteBindingAdvice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bindingAdviceService.delete(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: bindingAdviceKeys.detail(id) });
      
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: bindingAdviceKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to delete binding advice:', handleApiError(error));
    },
  });
};

// Bulk operations
export const useBulkCreateBindingAdvices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<BindingAdvice, 'id'>[]) => bindingAdviceService.bulkCreate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bindingAdviceKeys.all });
    },
    onError: (error) => {
      console.error('Failed to bulk create binding advices:', handleApiError(error));
    },
  });
};

export const useBulkUpdateBindingAdvices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Array<{ id: string; data: Partial<BindingAdvice> }>) =>
      bindingAdviceService.bulkUpdate(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bindingAdviceKeys.all });
    },
    onError: (error) => {
      console.error('Failed to bulk update binding advices:', handleApiError(error));
    },
  });
};

export const useBulkDeleteBindingAdvices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bindingAdviceService.bulkDelete(ids),
    onSuccess: (_, ids) => {
      // Remove all deleted items from cache
      ids.forEach(id => {
        queryClient.removeQueries({ queryKey: bindingAdviceKeys.detail(id) });
      });
      
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: bindingAdviceKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to bulk delete binding advices:', handleApiError(error));
    },
  });
};

// Custom hooks for specific business logic
export const useBindingAdvicesByClient = (clientId: string) => {
  return useBindingAdvices({ clientId });
};

export const useBindingAdvicesByStatus = (status: string) => {
  return useBindingAdvices({ status });
};

export const useBindingAdvicesByDateRange = (startDate: string, endDate: string) => {
  return useBindingAdvices({ 
    createdDate_gte: startDate, 
    createdDate_lte: endDate 
  });
};
