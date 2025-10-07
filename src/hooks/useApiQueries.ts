import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ApiService,

  bindingAdviceService,
  jobCardService,
  inventoryService,
  clientService,
  paperSizeService,
  notebookTypeService,
  calculationRuleService,
  teamService,
  userService,
  roleService,
  systemSettingsService,
  dispatchService,
  invoiceService,
  productionPlanService,
} from "../services/api";

// Generic query keys factory
export const createQueryKeys = (entity: string) => ({
  all: [entity] as const,
  lists: () => [...createQueryKeys(entity).all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...createQueryKeys(entity).lists(), { filters }] as const,
  details: () => [...createQueryKeys(entity).all, "detail"] as const,
  detail: (id: string) => [...createQueryKeys(entity).details(), id] as const,
});

// Generic CRUD hooks factory
export function createCrudHooks<T extends { id: string }>(
  entity: string,
  service: ApiService<T>
) {
  const queryKeys = createQueryKeys(entity);

  return {
    // Get all items
    useGetAll: (filters?: Record<string, any>) => {
      return useQuery({
        queryKey: filters ? queryKeys.list(filters) : queryKeys.lists(),
        queryFn: () => (filters ? service.search(filters) : service.getAll()),
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    },

    // Get single item by ID
    useGetById: (id: string) => {
      return useQuery({
        queryKey: queryKeys.detail(id),
        queryFn: () => service.getById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
      });
    },

    // Create mutation
    useCreate: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (data: Omit<T, "id">) => service.create(data),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.all });
        },
      });
    },

    // Update mutation
    useUpdate: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<T> }) =>
          service.update(id, data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: queryKeys.all });
          queryClient.invalidateQueries({ queryKey: queryKeys.detail(id) });
        },
      });
    },

    // Delete mutation
    useDelete: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (id: string) => service.delete(id),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.all });
        },
      });
    },

    // Bulk operations
    useBulkCreate: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (items: Omit<T, "id">[]) => service.bulkCreate(items),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.all });
        },
      });
    },

    useBulkUpdate: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (updates: { id: string; data: Partial<T> }[]) =>
          service.bulkUpdate(updates),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.all });
        },
      });
    },

    useBulkDelete: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (ids: string[]) => service.bulkDelete(ids),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.all });
        },
      });
    },
  };
}

// Entity-specific hooks
export const bindingAdviceHooks = createCrudHooks(
  "bindingAdvices",
  bindingAdviceService
);
export const jobCardHooks = createCrudHooks("jobCards", jobCardService);
export const inventoryHooks = createCrudHooks("inventory", inventoryService);
export const clientHooks = createCrudHooks("clients", clientService);
export const paperSizeHooks = createCrudHooks("paperSizes", paperSizeService);
export const notebookTypeHooks = createCrudHooks(
  "notebookTypes",
  notebookTypeService
);
export const calculationRuleHooks = createCrudHooks(
  "calculationRules",
  calculationRuleService
);
export const teamHooks = createCrudHooks("teams", teamService);
export const userHooks = createCrudHooks("users", userService);
export const roleHooks = createCrudHooks("roles", roleService);
export const systemSettingsHooks = createCrudHooks(
  "systemSettings",
  systemSettingsService
);
export const dispatchHooks = createCrudHooks("dispatches", dispatchService);
export const invoiceHooks = createCrudHooks("invoices", invoiceService);

// Convenience exports for common operations
export const useBindingAdvices = bindingAdviceHooks.useGetAll;
export const useBindingAdvice = bindingAdviceHooks.useGetById;
export const useCreateBindingAdvice = bindingAdviceHooks.useCreate;
export const useUpdateBindingAdvice = bindingAdviceHooks.useUpdate;
export const useDeleteBindingAdvice = bindingAdviceHooks.useDelete;

export const useJobCards = jobCardHooks.useGetAll;
export const useJobCard = jobCardHooks.useGetById;
export const useCreateJobCard = jobCardHooks.useCreate;
export const useUpdateJobCard = jobCardHooks.useUpdate;
export const useDeleteJobCard = jobCardHooks.useDelete;

export const useInventoryItems = inventoryHooks.useGetAll;
export const useInventoryItem = inventoryHooks.useGetById;
export const useCreateInventoryItem = inventoryHooks.useCreate;
export const useUpdateInventoryItem = inventoryHooks.useUpdate;
export const useDeleteInventoryItem = inventoryHooks.useDelete;

export const useClients = clientHooks.useGetAll;
export const useClient = clientHooks.useGetById;
export const useCreateClient = clientHooks.useCreate;
export const useUpdateClient = clientHooks.useUpdate;
export const useDeleteClient = clientHooks.useDelete;

export const usePaperSizes = paperSizeHooks.useGetAll;
export const usePaperSize = paperSizeHooks.useGetById;
export const useCreatePaperSize = paperSizeHooks.useCreate;
export const useUpdatePaperSize = paperSizeHooks.useUpdate;
export const useDeletePaperSize = paperSizeHooks.useDelete;

export const useNotebookTypes = notebookTypeHooks.useGetAll;
export const useNotebookType = notebookTypeHooks.useGetById;
export const useCreateNotebookType = notebookTypeHooks.useCreate;
export const useUpdateNotebookType = notebookTypeHooks.useUpdate;
export const useDeleteNotebookType = notebookTypeHooks.useDelete;

export const useCalculationRules = calculationRuleHooks.useGetAll;
export const useCalculationRule = calculationRuleHooks.useGetById;
export const useCreateCalculationRule = calculationRuleHooks.useCreate;
export const useUpdateCalculationRule = calculationRuleHooks.useUpdate;
export const useDeleteCalculationRule = calculationRuleHooks.useDelete;

export const useTeams = teamHooks.useGetAll;
export const useTeam = teamHooks.useGetById;
export const useCreateTeam = teamHooks.useCreate;
export const useUpdateTeam = teamHooks.useUpdate;
export const useDeleteTeam = teamHooks.useDelete;

export const useUsers = userHooks.useGetAll;
export const useUser = userHooks.useGetById;
export const useCreateUser = userHooks.useCreate;
export const useUpdateUser = userHooks.useUpdate;
export const useDeleteUser = userHooks.useDelete;

export const useRoles = roleHooks.useGetAll;
export const useRole = roleHooks.useGetById;
export const useCreateRole = roleHooks.useCreate;
export const useUpdateRole = roleHooks.useUpdate;
export const useDeleteRole = roleHooks.useDelete;

export const useSystemSettings = systemSettingsHooks.useGetAll;
export const useSystemSetting = systemSettingsHooks.useGetById;
export const useCreateSystemSetting = systemSettingsHooks.useCreate;
export const useUpdateSystemSetting = systemSettingsHooks.useUpdate;
export const useDeleteSystemSetting = systemSettingsHooks.useDelete;

export const useDispatches = dispatchHooks.useGetAll;
export const useDispatch = dispatchHooks.useGetById;
export const useCreateDispatch = dispatchHooks.useCreate;
export const useUpdateDispatch = dispatchHooks.useUpdate;
export const useDeleteDispatch = dispatchHooks.useDelete;

export const useInvoices = invoiceHooks.useGetAll;
export const useInvoice = invoiceHooks.useGetById;
export const useCreateInvoice = invoiceHooks.useCreate;
export const useUpdateInvoice = invoiceHooks.useUpdate;
export const useDeleteInvoice = invoiceHooks.useDelete;

// Production Plan hooks
const productionPlanHooks = createCrudHooks(
  "productionPlans",
  productionPlanService
);

export const useProductionPlans = productionPlanHooks.useGetAll;
export const useProductionPlan = productionPlanHooks.useGetById;
export const useCreateProductionPlan = productionPlanHooks.useCreate;
export const useUpdateProductionPlan = productionPlanHooks.useUpdate;
export const useDeleteProductionPlan = productionPlanHooks.useDelete;
