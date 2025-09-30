import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PaperSize, 
  NotebookType, 
  CalculationRule, 
  Team 
} from '../../services/entities';
import { 
  paperSizeService, 
  notebookTypeService, 
  calculationRuleService, 
  teamService 
} from '../../services/entities';

// Paper Size Query Keys
export const paperSizeKeys = {
  all: ['paperSizes'] as const,
  lists: () => [...paperSizeKeys.all, 'list'] as const,
  detail: (id: string) => [...paperSizeKeys.all, 'detail', id] as const,
  active: () => [...paperSizeKeys.all, 'active'] as const,
};

// Notebook Type Query Keys
export const notebookTypeKeys = {
  all: ['notebookTypes'] as const,
  lists: () => [...notebookTypeKeys.all, 'list'] as const,
  detail: (id: string) => [...notebookTypeKeys.all, 'detail', id] as const,
  active: () => [...notebookTypeKeys.all, 'active'] as const,
  byCategory: (category: string) => [...notebookTypeKeys.all, 'category', category] as const,
};

// Calculation Rule Query Keys
export const calculationRuleKeys = {
  all: ['calculationRules'] as const,
  lists: () => [...calculationRuleKeys.all, 'list'] as const,
  detail: (id: string) => [...calculationRuleKeys.all, 'detail', id] as const,
  active: () => [...calculationRuleKeys.all, 'active'] as const,
  byType: (type: string) => [...calculationRuleKeys.all, 'type', type] as const,
};

// Team Query Keys
export const teamKeys = {
  all: ['teams'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  detail: (id: string) => [...teamKeys.all, 'detail', id] as const,
  active: () => [...teamKeys.all, 'active'] as const,
  byDepartment: (department: string) => [...teamKeys.all, 'department', department] as const,
};

// Paper Size Queries
export const usePaperSizes = () => {
  return useQuery({
    queryKey: paperSizeKeys.lists(),
    queryFn: () => paperSizeService.getAll(),
    staleTime: 30 * 60 * 1000, // 30 minutes - master data doesn't change frequently
  });
};

export const usePaperSize = (id: string) => {
  return useQuery({
    queryKey: paperSizeKeys.detail(id),
    queryFn: () => paperSizeService.getById(id),
    enabled: !!id,
  });
};

export const useActivePaperSizes = () => {
  return useQuery({
    queryKey: paperSizeKeys.active(),
    queryFn: async () => {
      const paperSizes = await paperSizeService.getAll();
      return paperSizes.filter(size => size.active);
    },
    staleTime: 30 * 60 * 1000,
  });
};

// Notebook Type Queries
export const useNotebookTypes = () => {
  return useQuery({
    queryKey: notebookTypeKeys.lists(),
    queryFn: () => notebookTypeService.getAll(),
    staleTime: 30 * 60 * 1000,
  });
};

export const useNotebookType = (id: string) => {
  return useQuery({
    queryKey: notebookTypeKeys.detail(id),
    queryFn: () => notebookTypeService.getById(id),
    enabled: !!id,
  });
};

export const useActiveNotebookTypes = () => {
  return useQuery({
    queryKey: notebookTypeKeys.active(),
    queryFn: async () => {
      const notebookTypes = await notebookTypeService.getAll();
      return notebookTypes.filter(type => type.active);
    },
    staleTime: 30 * 60 * 1000,
  });
};

export const useNotebookTypesByCategory = (category: string) => {
  return useQuery({
    queryKey: notebookTypeKeys.byCategory(category),
    queryFn: async () => {
      const notebookTypes = await notebookTypeService.getAll();
      return notebookTypes.filter(type => type.category === category);
    },
    enabled: !!category,
    staleTime: 30 * 60 * 1000,
  });
};

// Calculation Rule Queries
export const useCalculationRules = () => {
  return useQuery({
    queryKey: calculationRuleKeys.lists(),
    queryFn: () => calculationRuleService.getAll(),
    staleTime: 30 * 60 * 1000,
  });
};

export const useCalculationRule = (id: string) => {
  return useQuery({
    queryKey: calculationRuleKeys.detail(id),
    queryFn: () => calculationRuleService.getById(id),
    enabled: !!id,
  });
};

export const useActiveCalculationRules = () => {
  return useQuery({
    queryKey: calculationRuleKeys.active(),
    queryFn: async () => {
      const rules = await calculationRuleService.getAll();
      return rules.filter(rule => rule.active);
    },
    staleTime: 30 * 60 * 1000,
  });
};

export const useCalculationRulesByType = (type: string) => {
  return useQuery({
    queryKey: calculationRuleKeys.byType(type),
    queryFn: async () => {
      const rules = await calculationRuleService.getAll();
      return rules.filter(rule => rule.type === type);
    },
    enabled: !!type,
    staleTime: 30 * 60 * 1000,
  });
};

// Team Queries
export const useTeams = () => {
  return useQuery({
    queryKey: teamKeys.lists(),
    queryFn: () => teamService.getAll(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useTeam = (id: string) => {
  return useQuery({
    queryKey: teamKeys.detail(id),
    queryFn: () => teamService.getById(id),
    enabled: !!id,
  });
};

export const useActiveTeams = () => {
  return useQuery({
    queryKey: teamKeys.active(),
    queryFn: async () => {
      const teams = await teamService.getAll();
      return teams.filter(team => team.active);
    },
    staleTime: 15 * 60 * 1000,
  });
};

export const useTeamsByDepartment = (department: string) => {
  return useQuery({
    queryKey: teamKeys.byDepartment(department),
    queryFn: async () => {
      const teams = await teamService.getAll();
      return teams.filter(team => team.department === department);
    },
    enabled: !!department,
    staleTime: 15 * 60 * 1000,
  });
};

// Paper Size Mutations
export const useCreatePaperSize = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<PaperSize, 'id'>) => paperSizeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paperSizeKeys.all });
    },
  });
};

export const useUpdatePaperSize = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PaperSize> }) =>
      paperSizeService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: paperSizeKeys.all });
      queryClient.invalidateQueries({ queryKey: paperSizeKeys.detail(id) });
    },
  });
};

export const useDeletePaperSize = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paperSizeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paperSizeKeys.all });
    },
  });
};

// Notebook Type Mutations
export const useCreateNotebookType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<NotebookType, 'id'>) => notebookTypeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notebookTypeKeys.all });
    },
  });
};

export const useUpdateNotebookType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NotebookType> }) =>
      notebookTypeService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: notebookTypeKeys.all });
      queryClient.invalidateQueries({ queryKey: notebookTypeKeys.detail(id) });
    },
  });
};

export const useDeleteNotebookType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notebookTypeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notebookTypeKeys.all });
    },
  });
};

// Calculation Rule Mutations
export const useCreateCalculationRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<CalculationRule, 'id'>) => calculationRuleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calculationRuleKeys.all });
    },
  });
};

export const useUpdateCalculationRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CalculationRule> }) =>
      calculationRuleService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: calculationRuleKeys.all });
      queryClient.invalidateQueries({ queryKey: calculationRuleKeys.detail(id) });
    },
  });
};

export const useDeleteCalculationRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => calculationRuleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calculationRuleKeys.all });
    },
  });
};

// Team Mutations
export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Team, 'id'>) => teamService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Team> }) =>
      teamService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(id) });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teamService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
};

// Business Logic Hooks
export const useTogglePaperSizeStatus = () => {
  const updateMutation = useUpdatePaperSize();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      return updateMutation.mutateAsync({ id, data: { active } });
    },
  });
};

export const useToggleNotebookTypeStatus = () => {
  const updateMutation = useUpdateNotebookType();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      return updateMutation.mutateAsync({ id, data: { active } });
    },
  });
};

export const useToggleCalculationRuleStatus = () => {
  const updateMutation = useUpdateCalculationRule();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      return updateMutation.mutateAsync({ id, data: { active } });
    },
  });
};

export const useToggleTeamStatus = () => {
  const updateMutation = useUpdateTeam();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      return updateMutation.mutateAsync({ id, data: { active } });
    },
  });
};
