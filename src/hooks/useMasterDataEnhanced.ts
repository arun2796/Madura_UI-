import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiService,
  queryKeys,
  createQueryHooks,
  ApiError,
} from "../services/unifiedApi";

// Type definitions for master data entities
export interface PaperSize {
  id: string;
  name: string;
  width: number;
  height: number;
  unit: string;
  category: string;
  gsm: number;
  description?: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface NotebookType {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  pages: number;
  binding: string;
  cover: string;
  ruling: string;
  description?: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface CalculationRule {
  id: string;
  name: string;
  type: "paper" | "binding" | "printing" | "finishing";
  formula: string;
  parameters: Record<string, any>;
  description?: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  department: string;
  teamType: string;
  members: Array<{
    id: string;
    name: string;
    role: string;
    email: string;
  }>;
  supervisor: {
    id: string;
    name: string;
    email: string;
  };
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  type: "individual" | "corporate" | "government";
  contactPerson: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  creditLimit: number;
  creditUsed: number;
  paymentTerms: string;
  gstNumber?: string;
  panNumber?: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

// Create base hooks for each entity
const paperSizeHooks = createQueryHooks<PaperSize>("paperSizes");
const notebookTypeHooks = createQueryHooks<NotebookType>("notebookTypes");
const calculationRuleHooks =
  createQueryHooks<CalculationRule>("calculationRules");
const teamHooks = createQueryHooks<Team>("teams");
const clientHooks = createQueryHooks<Client>("clients");

// Enhanced Paper Size Hooks
export const usePaperSizes = paperSizeHooks.useGetAll;
export const usePaperSize = paperSizeHooks.useGetById;
export const useCreatePaperSize = paperSizeHooks.useCreate;
export const useUpdatePaperSize = paperSizeHooks.useUpdate;
export const useDeletePaperSize = paperSizeHooks.useDelete;
export const useTogglePaperSizeStatus = paperSizeHooks.useToggleStatus;

// Specialized Paper Size hooks
export const useActivePaperSizes = () => {
  return useQuery({
    queryKey: queryKeys.paperSizes.active(),
    queryFn: async () => {
      const paperSizes = await apiService.getAll<PaperSize>("paperSizes");
      return paperSizes.filter((size) => size.status === "active");
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const usePaperSizesByCategory = (category: string) => {
  return useQuery({
    queryKey: queryKeys.paperSizes.bySize(category),
    queryFn: async () => {
      const paperSizes = await apiService.getAll<PaperSize>("paperSizes");
      return paperSizes.filter(
        (size) => size.category === category && size.status === "active"
      );
    },
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePaperSizeCalculator = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      width,
      height,
      quantity,
    }: {
      width: number;
      height: number;
      quantity: number;
    }) => {
      // Calculate paper requirements
      const area = (width * height) / 10000; // Convert to square meters
      const totalArea = area * quantity;
      return {
        area,
        totalArea,
        estimatedCost: totalArea * 50, // Rough estimate
        recommendedGSM: width > 200 || height > 300 ? 80 : 70,
      };
    },
    onSuccess: (data) => {
      console.log("Paper calculation completed:", data);
    },
  });
};

// Enhanced Notebook Type Hooks
export const useNotebookTypes = notebookTypeHooks.useGetAll;
export const useNotebookType = notebookTypeHooks.useGetById;
export const useCreateNotebookType = notebookTypeHooks.useCreate;
export const useUpdateNotebookType = notebookTypeHooks.useUpdate;
export const useDeleteNotebookType = notebookTypeHooks.useDelete;
export const useToggleNotebookTypeStatus = notebookTypeHooks.useToggleStatus;

// Specialized Notebook Type hooks
export const useActiveNotebookTypes = () => {
  return useQuery({
    queryKey: queryKeys.notebookTypes.active(),
    queryFn: async () => {
      const types = await apiService.getAll<NotebookType>("notebookTypes");
      return types.filter((type) => type.status === "active");
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useNotebookTypesByCategory = (category: string) => {
  return useQuery({
    queryKey: queryKeys.notebookTypes.byCategory(category),
    queryFn: async () => {
      const types = await apiService.getAll<NotebookType>("notebookTypes");
      return types.filter(
        (type) => type.category === category && type.status === "active"
      );
    },
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
  });
};

export const useNotebookSpecCalculator = () => {
  return useMutation({
    mutationFn: async ({
      pages,
      binding,
      cover,
      quantity,
    }: {
      pages: number;
      binding: string;
      cover: string;
      quantity: number;
    }) => {
      // Calculate notebook specifications
      const paperSheets = Math.ceil(pages / 4); // 4 pages per sheet
      const bindingCost =
        binding === "spiral" ? 5 : binding === "perfect" ? 3 : 2;
      const coverCost =
        cover === "hardcover" ? 15 : cover === "softcover" ? 8 : 5;

      return {
        paperSheets,
        totalSheets: paperSheets * quantity,
        estimatedCost: (paperSheets * 0.5 + bindingCost + coverCost) * quantity,
        productionTime: Math.ceil((paperSheets * quantity) / 1000) + 1, // days
      };
    },
  });
};

// Enhanced Calculation Rule Hooks
export const useCalculationRules = calculationRuleHooks.useGetAll;
export const useCalculationRule = calculationRuleHooks.useGetById;
export const useCreateCalculationRule = calculationRuleHooks.useCreate;
export const useUpdateCalculationRule = calculationRuleHooks.useUpdate;
export const useDeleteCalculationRule = calculationRuleHooks.useDelete;
export const useToggleCalculationRuleStatus =
  calculationRuleHooks.useToggleStatus;

// Specialized Calculation Rule hooks
export const useActiveCalculationRules = () => {
  return useQuery({
    queryKey: queryKeys.calculationRules.active(),
    queryFn: async () => {
      const rules = await apiService.getAll<CalculationRule>(
        "calculationRules"
      );
      return rules.filter((rule) => rule.status === "active");
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCalculationRulesByType = (type: string) => {
  return useQuery({
    queryKey: queryKeys.calculationRules.byType(type),
    queryFn: async () => {
      const rules = await apiService.getAll<CalculationRule>(
        "calculationRules"
      );
      return rules.filter(
        (rule) => rule.type === type && rule.status === "active"
      );
    },
    enabled: !!type,
    staleTime: 5 * 60 * 1000,
  });
};

export const useApplyCalculationRule = () => {
  return useMutation({
    mutationFn: async ({
      ruleId,
      parameters,
    }: {
      ruleId: string;
      parameters: Record<string, any>;
    }) => {
      const rule = await apiService.getById<CalculationRule>(
        "calculationRules",
        ruleId
      );

      // Simple formula evaluation (in real app, use a proper formula parser)
      let result = 0;
      try {
        // This is a simplified example - in production, use a proper formula parser
        const formula = rule.formula.replace(/\{(\w+)\}/g, (match, param) => {
          return parameters[param] || 0;
        });
        result = eval(formula); // Note: eval is dangerous, use a proper parser in production
      } catch (error) {
        throw new ApiError(
          "Invalid formula or parameters",
          400,
          "CALCULATION_ERROR"
        );
      }

      return {
        ruleId,
        ruleName: rule.name,
        formula: rule.formula,
        parameters,
        result,
        calculatedAt: new Date().toISOString(),
      };
    },
  });
};

// Enhanced Team Hooks
export const useTeams = teamHooks.useGetAll;
export const useTeam = teamHooks.useGetById;
export const useCreateTeam = teamHooks.useCreate;
export const useUpdateTeam = teamHooks.useUpdate;
export const useDeleteTeam = teamHooks.useDelete;
export const useToggleTeamStatus = teamHooks.useToggleStatus;

// Specialized Team hooks
export const useActiveTeams = () => {
  return useQuery({
    queryKey: queryKeys.teams.active(),
    queryFn: async () => {
      const teams = await apiService.getAll<Team>("teams");
      return teams.filter((team) => team.status === "active");
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useTeamsByDepartment = (department: string) => {
  return useQuery({
    queryKey: queryKeys.teams.byDepartment(department),
    queryFn: async () => {
      const teams = await apiService.getAll<Team>("teams");
      return teams.filter(
        (team) => team.department === department && team.status === "active"
      );
    },
    enabled: !!department,
    staleTime: 5 * 60 * 1000,
  });
};

export const useTeamMemberManagement = () => {
  const queryClient = useQueryClient();

  const addMember = useMutation({
    mutationFn: async ({
      teamId,
      member,
    }: {
      teamId: string;
      member: { id: string; name: string; role: string; email: string };
    }) => {
      const team = await apiService.getById<Team>("teams", teamId);
      const updatedMembers = [...team.members, member];
      return apiService.update<Team>("teams", teamId, {
        members: updatedMembers,
      });
    },
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.detail(teamId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
    },
  });

  const removeMember = useMutation({
    mutationFn: async ({
      teamId,
      memberId,
    }: {
      teamId: string;
      memberId: string;
    }) => {
      const team = await apiService.getById<Team>("teams", teamId);
      const updatedMembers = team.members.filter(
        (member) => member.id !== memberId
      );
      return apiService.update<Team>("teams", teamId, {
        members: updatedMembers,
      });
    },
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.detail(teamId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
    },
  });

  return { addMember, removeMember };
};

// Enhanced Client Hooks
export const useClients = clientHooks.useGetAll;
export const useClient = clientHooks.useGetById;
export const useCreateClient = clientHooks.useCreate;
export const useUpdateClient = clientHooks.useUpdate;
export const useDeleteClient = clientHooks.useDelete;
export const useToggleClientStatus = clientHooks.useToggleStatus;

// Specialized Client hooks
export const useActiveClients = () => {
  return useQuery({
    queryKey: queryKeys.clients.active(),
    queryFn: async () => {
      const clients = await apiService.getAll<Client>("clients");
      return clients.filter((client) => client.status === "active");
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useClientsByType = (type: string) => {
  return useQuery({
    queryKey: queryKeys.clients.byType(type),
    queryFn: async () => {
      const clients = await apiService.getAll<Client>("clients");
      return clients.filter(
        (client) => client.type === type && client.status === "active"
      );
    },
    enabled: !!type,
    staleTime: 5 * 60 * 1000,
  });
};

export const useClientCreditManagement = () => {
  const queryClient = useQueryClient();

  const updateCreditLimit = useMutation({
    mutationFn: async ({
      clientId,
      newLimit,
    }: {
      clientId: string;
      newLimit: number;
    }) => {
      return apiService.update<Client>("clients", clientId, {
        creditLimit: newLimit,
      });
    },
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.clients.detail(clientId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
    },
  });

  const updateCreditUsed = useMutation({
    mutationFn: async ({
      clientId,
      amount,
      operation,
    }: {
      clientId: string;
      amount: number;
      operation: "add" | "subtract";
    }) => {
      const client = await apiService.getById<Client>("clients", clientId);
      const newCreditUsed =
        operation === "add"
          ? client.creditUsed + amount
          : Math.max(0, client.creditUsed - amount);

      return apiService.update<Client>("clients", clientId, {
        creditUsed: newCreditUsed,
      });
    },
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.clients.detail(clientId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
    },
  });

  return { updateCreditLimit, updateCreditUsed };
};

export const useClientAnalytics = () => {
  return useQuery({
    queryKey: ["clientAnalytics"],
    queryFn: async () => {
      const clients = await apiService.getAll<Client>("clients");

      const analytics = {
        totalClients: clients.length,
        activeClients: clients.filter((c) => c.status === "active").length,
        inactiveClients: clients.filter((c) => c.status === "inactive").length,
        clientsByType: {
          individual: clients.filter((c) => c.type === "individual").length,
          corporate: clients.filter((c) => c.type === "corporate").length,
          government: clients.filter((c) => c.type === "government").length,
        },
        creditAnalytics: {
          totalCreditLimit: clients.reduce((sum, c) => sum + c.creditLimit, 0),
          totalCreditUsed: clients.reduce((sum, c) => sum + c.creditUsed, 0),
          averageCreditUtilization:
            clients.length > 0
              ? clients.reduce(
                  (sum, c) => sum + (c.creditUsed / c.creditLimit) * 100,
                  0
                ) / clients.length
              : 0,
          highRiskClients: clients.filter(
            (c) => c.creditUsed / c.creditLimit > 0.8
          ).length,
        },
      };

      return analytics;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Combined Master Data Analytics
export const useMasterDataAnalytics = () => {
  return useQuery({
    queryKey: ["masterDataAnalytics"],
    queryFn: async () => {
      const [paperSizes, notebookTypes, calculationRules, teams, clients] =
        await Promise.all([
          apiService.getAll<PaperSize>("paperSizes"),
          apiService.getAll<NotebookType>("notebookTypes"),
          apiService.getAll<CalculationRule>("calculationRules"),
          apiService.getAll<Team>("teams"),
          apiService.getAll<Client>("clients"),
        ]);

      return {
        paperSizes: {
          total: paperSizes.length,
          active: paperSizes.filter((p) => p.status === "active").length,
          byCategory: paperSizes.reduce((acc, p) => {
            acc[p.category] = (acc[p.category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
        },
        notebookTypes: {
          total: notebookTypes.length,
          active: notebookTypes.filter((n) => n.status === "active").length,
          byCategory: notebookTypes.reduce((acc, n) => {
            acc[n.category] = (acc[n.category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
        },
        calculationRules: {
          total: calculationRules.length,
          active: calculationRules.filter((r) => r.status === "active").length,
          byType: calculationRules.reduce((acc, r) => {
            acc[r.type] = (acc[r.type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
        },
        teams: {
          total: teams.length,
          active: teams.filter((t) => t.status === "active").length,
          byDepartment: teams.reduce((acc, t) => {
            acc[t.department] = (acc[t.department] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          totalMembers: teams.reduce((sum, t) => sum + t.members.length, 0),
        },
        clients: {
          total: clients.length,
          active: clients.filter((c) => c.status === "active").length,
          byType: clients.reduce((acc, c) => {
            acc[c.type] = (acc[c.type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
        },
      };
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Bulk operations for master data
export const useBulkMasterDataOperations = () => {
  const queryClient = useQueryClient();

  const bulkStatusUpdate = useMutation({
    mutationFn: async ({
      entity,
      ids,
      status,
    }: {
      entity: string;
      ids: string[];
      status: "active" | "inactive";
    }) => {
      const updates = ids.map((id) => ({ id, data: { status } }));
      return apiService.bulkUpdate(entity, updates);
    },
    onSuccess: (_, { entity }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all(entity) });
    },
  });

  const bulkDelete = useMutation({
    mutationFn: async ({ entity, ids }: { entity: string; ids: string[] }) => {
      return apiService.bulkDelete(entity, ids);
    },
    onSuccess: (_, { entity }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all(entity) });
    },
  });

  return { bulkStatusUpdate, bulkDelete };
};
