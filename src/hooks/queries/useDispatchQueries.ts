import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dispatch } from '../../services/entities';
import { dispatchService } from '../../services/entities';

// Query Keys
export const dispatchKeys = {
  all: ['dispatches'] as const,
  lists: () => [...dispatchKeys.all, 'list'] as const,
  list: (filters: string) => [...dispatchKeys.lists(), { filters }] as const,
  details: () => [...dispatchKeys.all, 'detail'] as const,
  detail: (id: string) => [...dispatchKeys.details(), id] as const,
  pending: () => [...dispatchKeys.all, 'pending'] as const,
  completed: () => [...dispatchKeys.all, 'completed'] as const,
  byJobCard: (jobCardId: string) => [...dispatchKeys.all, 'jobCard', jobCardId] as const,
  byClient: (clientId: string) => [...dispatchKeys.all, 'client', clientId] as const,
  byDateRange: (startDate: string, endDate: string) => [...dispatchKeys.all, 'dateRange', startDate, endDate] as const,
};

// Queries
export const useDispatches = () => {
  return useQuery({
    queryKey: dispatchKeys.lists(),
    queryFn: () => dispatchService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDispatch = (id: string) => {
  return useQuery({
    queryKey: dispatchKeys.detail(id),
    queryFn: () => dispatchService.getById(id),
    enabled: !!id,
  });
};

export const usePendingDispatches = () => {
  return useQuery({
    queryKey: dispatchKeys.pending(),
    queryFn: async () => {
      const dispatches = await dispatchService.getAll();
      return dispatches.filter(dispatch => dispatch.status === 'pending');
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCompletedDispatches = () => {
  return useQuery({
    queryKey: dispatchKeys.completed(),
    queryFn: async () => {
      const dispatches = await dispatchService.getAll();
      return dispatches.filter(dispatch => dispatch.status === 'completed');
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useDispatchesByJobCard = (jobCardId: string) => {
  return useQuery({
    queryKey: dispatchKeys.byJobCard(jobCardId),
    queryFn: async () => {
      const dispatches = await dispatchService.getAll();
      return dispatches.filter(dispatch => dispatch.jobCardId === jobCardId);
    },
    enabled: !!jobCardId,
  });
};

export const useDispatchesByClient = (clientId: string) => {
  return useQuery({
    queryKey: dispatchKeys.byClient(clientId),
    queryFn: async () => {
      const dispatches = await dispatchService.getAll();
      return dispatches.filter(dispatch => dispatch.clientId === clientId);
    },
    enabled: !!clientId,
  });
};

export const useDispatchesByDateRange = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: dispatchKeys.byDateRange(startDate, endDate),
    queryFn: async () => {
      const dispatches = await dispatchService.getAll();
      return dispatches.filter(dispatch => {
        const dispatchDate = new Date(dispatch.dispatchDate);
        return dispatchDate >= new Date(startDate) && dispatchDate <= new Date(endDate);
      });
    },
    enabled: !!startDate && !!endDate,
  });
};

// Mutations
export const useCreateDispatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Dispatch, 'id'>) => dispatchService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dispatchKeys.all });
    },
  });
};

export const useUpdateDispatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Dispatch> }) =>
      dispatchService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: dispatchKeys.all });
      queryClient.invalidateQueries({ queryKey: dispatchKeys.detail(id) });
    },
  });
};

export const useDeleteDispatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dispatchService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dispatchKeys.all });
    },
  });
};

export const useBulkCreateDispatches = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dispatches: Omit<Dispatch, 'id'>[]) =>
      dispatchService.bulkCreate(dispatches),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dispatchKeys.all });
    },
  });
};

export const useBulkUpdateDispatches = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: { id: string; data: Partial<Dispatch> }[]) =>
      dispatchService.bulkUpdate(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dispatchKeys.all });
    },
  });
};

export const useBulkDeleteDispatches = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => dispatchService.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dispatchKeys.all });
    },
  });
};

// Business Logic Hooks
export const useCompleteDispatch = () => {
  const updateMutation = useUpdateDispatch();

  return useMutation({
    mutationFn: async ({ id, deliveryDetails }: { 
      id: string; 
      deliveryDetails: {
        deliveredBy: string;
        receivedBy: string;
        deliveryDate: string;
        notes?: string;
      }
    }) => {
      return updateMutation.mutateAsync({
        id,
        data: {
          status: 'completed',
          actualDeliveryDate: deliveryDetails.deliveryDate,
          deliveredBy: deliveryDetails.deliveredBy,
          receivedBy: deliveryDetails.receivedBy,
          notes: deliveryDetails.notes,
        }
      });
    },
  });
};

export const useScheduleDispatch = () => {
  const updateMutation = useUpdateDispatch();

  return useMutation({
    mutationFn: async ({ id, scheduledDate, vehicle, driver }: { 
      id: string; 
      scheduledDate: string;
      vehicle: string;
      driver: string;
    }) => {
      return updateMutation.mutateAsync({
        id,
        data: {
          status: 'scheduled',
          scheduledDeliveryDate: scheduledDate,
          vehicle,
          driver,
        }
      });
    },
  });
};

export const useCancelDispatch = () => {
  const updateMutation = useUpdateDispatch();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return updateMutation.mutateAsync({
        id,
        data: {
          status: 'cancelled',
          notes: reason,
        }
      });
    },
  });
};

// Dashboard and Analytics Hooks
export const useDispatchStats = () => {
  return useQuery({
    queryKey: [...dispatchKeys.all, 'stats'],
    queryFn: async () => {
      const dispatches = await dispatchService.getAll();
      
      const today = new Date().toISOString().split('T')[0];
      const thisMonth = new Date().toISOString().slice(0, 7);
      
      return {
        total: dispatches.length,
        pending: dispatches.filter(d => d.status === 'pending').length,
        scheduled: dispatches.filter(d => d.status === 'scheduled').length,
        completed: dispatches.filter(d => d.status === 'completed').length,
        cancelled: dispatches.filter(d => d.status === 'cancelled').length,
        todayDispatches: dispatches.filter(d => d.dispatchDate === today).length,
        monthlyDispatches: dispatches.filter(d => d.dispatchDate.startsWith(thisMonth)).length,
        overdueDispatches: dispatches.filter(d => 
          d.status === 'scheduled' && 
          new Date(d.scheduledDeliveryDate || '') < new Date()
        ).length,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDispatchTrends = (days: number = 30) => {
  return useQuery({
    queryKey: [...dispatchKeys.all, 'trends', days],
    queryFn: async () => {
      const dispatches = await dispatchService.getAll();
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const filteredDispatches = dispatches.filter(dispatch => {
        const dispatchDate = new Date(dispatch.dispatchDate);
        return dispatchDate >= startDate && dispatchDate <= endDate;
      });

      // Group by date
      const trends = filteredDispatches.reduce((acc, dispatch) => {
        const date = dispatch.dispatchDate;
        if (!acc[date]) {
          acc[date] = { date, count: 0, value: 0 };
        }
        acc[date].count++;
        acc[date].value += dispatch.totalValue || 0;
        return acc;
      }, {} as Record<string, { date: string; count: number; value: number }>);

      return Object.values(trends).sort((a, b) => a.date.localeCompare(b.date));
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
