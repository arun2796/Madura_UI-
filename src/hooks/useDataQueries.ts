// Re-export all query hooks for easy access
export * from "./queries/useBindingAdviceQueries";
export * from "./queries/useInventoryQueries";
export * from "./queries/useJobCardQueries";
export * from "./queries/useDispatchQueries";
export * from "./queries/useInvoiceQueries";
export * from "./queries/useClientQueries";
export * from "./queries/useMasterDataQueries";
export * from "./queries/useSystemQueries";

// Import all hooks for the combined hook
import { useBindingAdvices } from "./queries/useBindingAdviceQueries";
import { useInventory } from "./queries/useInventoryQueries";
import { useJobCards } from "./queries/useJobCardQueries";

// Combined hook for backward compatibility and convenience
export const useAllData = () => {
  const bindingAdvicesQuery = useBindingAdvices();
  const inventoryQuery = useInventory();
  const jobCardsQuery = useJobCards();

  return {
    // Data
    bindingAdvices: bindingAdvicesQuery.data || [],
    inventory: inventoryQuery.data || [],
    jobCards: jobCardsQuery.data || [],

    // Loading states
    loading:
      bindingAdvicesQuery.isLoading ||
      inventoryQuery.isLoading ||
      jobCardsQuery.isLoading,
    bindingAdvicesLoading: bindingAdvicesQuery.isLoading,
    inventoryLoading: inventoryQuery.isLoading,
    jobCardsLoading: jobCardsQuery.isLoading,

    // Error states
    error:
      bindingAdvicesQuery.error || inventoryQuery.error || jobCardsQuery.error,
    bindingAdvicesError: bindingAdvicesQuery.error,
    inventoryError: inventoryQuery.error,
    jobCardsError: jobCardsQuery.error,

    // Refetch functions
    refetch: () => {
      bindingAdvicesQuery.refetch();
      inventoryQuery.refetch();
      jobCardsQuery.refetch();
    },
    refetchBindingAdvices: bindingAdvicesQuery.refetch,
    refetchInventory: inventoryQuery.refetch,
    refetchJobCards: jobCardsQuery.refetch,

    // Status flags
    isSuccess:
      bindingAdvicesQuery.isSuccess &&
      inventoryQuery.isSuccess &&
      jobCardsQuery.isSuccess,
    isError:
      bindingAdvicesQuery.isError ||
      inventoryQuery.isError ||
      jobCardsQuery.isError,
    isFetching:
      bindingAdvicesQuery.isFetching ||
      inventoryQuery.isFetching ||
      jobCardsQuery.isFetching,
  };
};

// Hook for dashboard data
export const useDashboardData = () => {
  const bindingAdvicesQuery = useBindingAdvices();
  const inventoryQuery = useInventory();
  const jobCardsQuery = useJobCards();

  const data = {
    bindingAdvices: bindingAdvicesQuery.data || [],
    inventory: inventoryQuery.data || [],
    jobCards: jobCardsQuery.data || [],
  };

  // Calculate dashboard statistics
  const stats = {
    totalBindingAdvices: data.bindingAdvices.length,
    pendingBindingAdvices: data.bindingAdvices.filter(
      (ba) => ba.status === "pending"
    ).length,
    activeJobCards: data.jobCards.filter(
      (jc) => jc.currentStage !== "completed" && jc.currentStage !== "cancelled"
    ).length,
    completedJobCards: data.jobCards.filter(
      (jc) => jc.currentStage === "completed"
    ).length,
    totalInventoryItems: data.inventory.length,
    lowStockItems: data.inventory.filter(
      (item) =>
        item.currentStock <= item.minStock ||
        item.status === "low" ||
        item.status === "critical"
    ).length,
    rawMaterials: data.inventory.filter(
      (item) => item.category === "raw_material"
    ).length,
    finishedProducts: data.inventory.filter(
      (item) => item.category === "finished_product"
    ).length,
    totalInventoryValue: data.inventory.reduce((sum, item) => {
      const cost =
        item.category === "finished_product"
          ? item.productionCost || 0
          : item.costPerUnit;
      return sum + item.currentStock * cost;
    }, 0),
  };

  return {
    ...data,
    stats,
    loading:
      bindingAdvicesQuery.isLoading ||
      inventoryQuery.isLoading ||
      jobCardsQuery.isLoading,
    error:
      bindingAdvicesQuery.error || inventoryQuery.error || jobCardsQuery.error,
    refetch: () => {
      bindingAdvicesQuery.refetch();
      inventoryQuery.refetch();
      jobCardsQuery.refetch();
    },
  };
};

// Hook for production planning data
export const useProductionPlanningData = () => {
  const bindingAdvicesQuery = useBindingAdvices({ status: "approved" });
  const jobCardsQuery = useJobCards({
    currentStage_in: ["pending", "design", "production_planning"],
  });
  const inventoryQuery = useInventory();

  return {
    approvedBindingAdvices: bindingAdvicesQuery.data || [],
    planningJobCards: jobCardsQuery.data || [],
    inventory: inventoryQuery.data || [],
    loading:
      bindingAdvicesQuery.isLoading ||
      jobCardsQuery.isLoading ||
      inventoryQuery.isLoading,
    error:
      bindingAdvicesQuery.error || jobCardsQuery.error || inventoryQuery.error,
    refetch: () => {
      bindingAdvicesQuery.refetch();
      jobCardsQuery.refetch();
      inventoryQuery.refetch();
    },
  };
};

// Hook for quality control data
export const useQualityControlData = () => {
  const jobCardsQuery = useJobCards({ currentStage: "quality_check" });
  const inventoryQuery = useInventory({ category: "finished_product" });

  return {
    qualityCheckJobCards: jobCardsQuery.data || [],
    finishedProducts: inventoryQuery.data || [],
    loading: jobCardsQuery.isLoading || inventoryQuery.isLoading,
    error: jobCardsQuery.error || inventoryQuery.error,
    refetch: () => {
      jobCardsQuery.refetch();
      inventoryQuery.refetch();
    },
  };
};

// Hook for dispatch data
export const useDispatchData = () => {
  const jobCardsQuery = useJobCards({ currentStage: "completed" });
  const inventoryQuery = useInventory({ category: "finished_product" });

  return {
    completedJobCards: jobCardsQuery.data || [],
    finishedProducts: inventoryQuery.data || [],
    loading: jobCardsQuery.isLoading || inventoryQuery.isLoading,
    error: jobCardsQuery.error || inventoryQuery.error,
    refetch: () => {
      jobCardsQuery.refetch();
      inventoryQuery.refetch();
    },
  };
};

// Hook for reports data
export const useReportsData = (dateRange?: {
  startDate: string;
  endDate: string;
}) => {
  const bindingAdvicesQuery = useBindingAdvices(
    dateRange
      ? {
          createdDate_gte: dateRange.startDate,
          createdDate_lte: dateRange.endDate,
        }
      : undefined
  );

  const jobCardsQuery = useJobCards(
    dateRange
      ? {
          createdDate_gte: dateRange.startDate,
          createdDate_lte: dateRange.endDate,
        }
      : undefined
  );

  const inventoryQuery = useInventory();

  return {
    bindingAdvices: bindingAdvicesQuery.data || [],
    jobCards: jobCardsQuery.data || [],
    inventory: inventoryQuery.data || [],
    loading:
      bindingAdvicesQuery.isLoading ||
      jobCardsQuery.isLoading ||
      inventoryQuery.isLoading,
    error:
      bindingAdvicesQuery.error || jobCardsQuery.error || inventoryQuery.error,
    refetch: () => {
      bindingAdvicesQuery.refetch();
      jobCardsQuery.refetch();
      inventoryQuery.refetch();
    },
  };
};
