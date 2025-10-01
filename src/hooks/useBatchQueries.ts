import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productionBatchService, ProductionBatch } from "../services/api";

// Query keys
export const batchKeys = {
  all: ["batches"] as const,
  lists: () => [...batchKeys.all, "list"] as const,
  list: (filters: string) => [...batchKeys.lists(), { filters }] as const,
  details: () => [...batchKeys.all, "detail"] as const,
  detail: (id: string) => [...batchKeys.details(), id] as const,
  byJobCard: (jobCardId: string) => [...batchKeys.all, "jobCard", jobCardId] as const,
};

// Get all batches
export const useProductionBatches = () => {
  return useQuery({
    queryKey: batchKeys.lists(),
    queryFn: () => productionBatchService.getAll(),
  });
};

// Get batches by job card
export const useBatchesByJobCard = (jobCardId: string) => {
  return useQuery({
    queryKey: batchKeys.byJobCard(jobCardId),
    queryFn: async () => {
      const allBatches = await productionBatchService.getAll();
      return allBatches.filter(batch => batch.jobCardId === jobCardId);
    },
    enabled: !!jobCardId,
  });
};

// Get single batch
export const useProductionBatch = (id: string) => {
  return useQuery({
    queryKey: batchKeys.detail(id),
    queryFn: () => productionBatchService.getById(id),
    enabled: !!id,
  });
};

// Create batch
export const useCreateBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<ProductionBatch, "id">) =>
      productionBatchService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.all });
    },
  });
};

// Update batch
export const useUpdateBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductionBatch> }) =>
      productionBatchService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: batchKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: batchKeys.all });
    },
  });
};

// Delete batch
export const useDeleteBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productionBatchService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.all });
    },
  });
};

