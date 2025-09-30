import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobCardService, JobCard } from "../../services/entities";
import { handleApiError } from "../../services/axiosApi";
import { inventoryKeys } from "./useInventoryQueries";

// Query keys
export const jobCardKeys = {
  all: ["jobCards"] as const,
  lists: () => [...jobCardKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...jobCardKeys.lists(), { filters }] as const,
  details: () => [...jobCardKeys.all, "detail"] as const,
  detail: (id: string) => [...jobCardKeys.details(), id] as const,
  byStatus: (status: string) => [...jobCardKeys.all, "status", status] as const,
  byClient: (clientId: string) =>
    [...jobCardKeys.all, "client", clientId] as const,
  active: () => [...jobCardKeys.all, "active"] as const,
};

// Basic queries
export const useJobCards = (
  filters?: Record<string, string | number | boolean>
) => {
  return useQuery({
    queryKey: filters ? jobCardKeys.list(filters) : jobCardKeys.lists(),
    queryFn: () =>
      filters ? jobCardService.search(filters) : jobCardService.getAll(),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

export const useJobCard = (id: string) => {
  return useQuery({
    queryKey: jobCardKeys.detail(id),
    queryFn: () => jobCardService.getById(id),
    enabled: !!id,
  });
};

// Specialized queries
export const useActiveJobCards = () => {
  return useQuery({
    queryKey: jobCardKeys.active(),
    queryFn: async () => {
      const jobCards = await jobCardService.getAll();
      return jobCards.filter(
        (jc) =>
          jc.currentStage !== "completed" && jc.currentStage !== "cancelled"
      );
    },
    staleTime: 1 * 60 * 1000, // 1 minute for active jobs
  });
};

export const useJobCardsByStatus = (status: string) => {
  return useQuery({
    queryKey: jobCardKeys.byStatus(status),
    queryFn: () => jobCardService.search({ currentStage: status }),
    enabled: !!status,
  });
};

export const useJobCardsByClient = (clientId: string) => {
  return useQuery({
    queryKey: jobCardKeys.byClient(clientId),
    queryFn: () => jobCardService.search({ clientId }),
    enabled: !!clientId,
  });
};

// Mutations
export const useCreateJobCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<JobCard, "id">) => jobCardService.create(data),
    onSuccess: (newJobCard) => {
      // Invalidate job card queries
      queryClient.invalidateQueries({ queryKey: jobCardKeys.all });

      // Add to cache
      queryClient.setQueryData(jobCardKeys.detail(newJobCard.id), newJobCard);

      // Invalidate active jobs if this is an active job
      if (
        newJobCard.currentStage !== "completed" &&
        newJobCard.currentStage !== "cancelled"
      ) {
        queryClient.invalidateQueries({ queryKey: jobCardKeys.active() });
      }
    },
    onError: (error) => {
      console.error("Failed to create job card:", handleApiError(error));
    },
  });
};

export const useUpdateJobCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<JobCard> }) =>
      jobCardService.update(id, data),
    onSuccess: (updatedJobCard, { id }) => {
      // Update specific item cache
      queryClient.setQueryData(jobCardKeys.detail(id), updatedJobCard);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: jobCardKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobCardKeys.active() });

      // Invalidate status-specific queries
      queryClient.invalidateQueries({
        queryKey: jobCardKeys.byStatus(updatedJobCard.currentStage),
      });
    },
    onError: (error) => {
      console.error("Failed to update job card:", handleApiError(error));
    },
  });
};

export const useDeleteJobCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => jobCardService.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: jobCardKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: jobCardKeys.all });
    },
    onError: (error) => {
      console.error("Failed to delete job card:", handleApiError(error));
    },
  });
};

// Advanced job card operations
export const useStartProduction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobCardId }: { jobCardId: string }) => {
      // Update job card status to 'in_production'
      const updatedJobCard = await jobCardService.update(jobCardId, {
        currentStage: "in_production",
        productionStartDate: new Date().toISOString().split("T")[0],
        lastUpdated: new Date().toISOString().split("T")[0],
      });

      return updatedJobCard;
    },
    onSuccess: (updatedJobCard) => {
      // Update caches
      queryClient.setQueryData(
        jobCardKeys.detail(updatedJobCard.id),
        updatedJobCard
      );
      queryClient.invalidateQueries({ queryKey: jobCardKeys.all });

      // Invalidate inventory queries as materials will be consumed
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
    onError: (error) => {
      console.error("Failed to start production:", handleApiError(error));
    },
  });
};

export const useCompleteProduction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      jobCardId,
      producedQuantity,
      qualityNotes,
    }: {
      jobCardId: string;
      producedQuantity: number;
      qualityNotes?: string;
    }) => {
      // Update job card with completion details
      const updatedJobCard = await jobCardService.update(jobCardId, {
        currentStage: "completed",
        producedQuantity,
        qualityNotes,
        completionDate: new Date().toISOString().split("T")[0],
        lastUpdated: new Date().toISOString().split("T")[0],
      });

      return updatedJobCard;
    },
    onSuccess: (updatedJobCard) => {
      // Update caches
      queryClient.setQueryData(
        jobCardKeys.detail(updatedJobCard.id),
        updatedJobCard
      );
      queryClient.invalidateQueries({ queryKey: jobCardKeys.all });

      // Invalidate inventory as finished products will be added
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
    onError: (error) => {
      console.error("Failed to complete production:", handleApiError(error));
    },
  });
};

export const useUpdateJobCardStage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      jobCardId,
      stage,
      notes,
    }: {
      jobCardId: string;
      stage: string;
      notes?: string;
    }) => {
      return jobCardService.update(jobCardId, {
        currentStage: stage,
        stageNotes: notes,
        lastUpdated: new Date().toISOString().split("T")[0],
      });
    },
    onSuccess: (updatedJobCard) => {
      queryClient.setQueryData(
        jobCardKeys.detail(updatedJobCard.id),
        updatedJobCard
      );
      queryClient.invalidateQueries({ queryKey: jobCardKeys.all });
    },
    onError: (error) => {
      console.error("Failed to update job card stage:", handleApiError(error));
    },
  });
};

// Bulk operations
export const useBulkUpdateJobCards = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Array<{ id: string; data: Partial<JobCard> }>) =>
      jobCardService.bulkUpdate(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobCardKeys.all });
    },
    onError: (error) => {
      console.error("Failed to bulk update job cards:", handleApiError(error));
    },
  });
};

// Custom business logic hooks
export const useJobCardProgress = (id: string) => {
  return useQuery({
    queryKey: [...jobCardKeys.detail(id), "progress"],
    queryFn: async () => {
      const jobCard = await jobCardService.getById(id);

      // Calculate progress based on current stage
      const stages = [
        "pending",
        "design",
        "production_planning",
        "in_production",
        "quality_check",
        "completed",
      ];
      const currentIndex = stages.indexOf(jobCard.currentStage);
      const progress =
        currentIndex >= 0 ? ((currentIndex + 1) / stages.length) * 100 : 0;

      return {
        ...jobCard,
        progress,
        stageIndex: currentIndex,
        totalStages: stages.length,
      };
    },
    enabled: !!id,
  });
};

export const useJobCardsByDateRange = (startDate: string, endDate: string) => {
  return useJobCards({
    createdDate_gte: startDate,
    createdDate_lte: endDate,
  });
};
