import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Role, SystemSettings } from '../../services/entities';
import { userService, roleService, systemSettingsService } from '../../services/entities';

// User Query Keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
  active: () => [...userKeys.all, 'active'] as const,
  inactive: () => [...userKeys.all, 'inactive'] as const,
  byRole: (roleId: string) => [...userKeys.all, 'role', roleId] as const,
  byDepartment: (department: string) => [...userKeys.all, 'department', department] as const,
};

// Role Query Keys
export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  detail: (id: string) => [...roleKeys.all, 'detail', id] as const,
  active: () => [...roleKeys.all, 'active'] as const,
};

// System Settings Query Keys
export const systemSettingsKeys = {
  all: ['systemSettings'] as const,
  current: () => [...systemSettingsKeys.all, 'current'] as const,
};

// User Queries
export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: () => userService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getById(id),
    enabled: !!id,
  });
};

export const useActiveUsers = () => {
  return useQuery({
    queryKey: userKeys.active(),
    queryFn: async () => {
      const users = await userService.getAll();
      return users.filter(user => user.status === 'active');
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useInactiveUsers = () => {
  return useQuery({
    queryKey: userKeys.inactive(),
    queryFn: async () => {
      const users = await userService.getAll();
      return users.filter(user => user.status === 'inactive');
    },
    staleTime: 10 * 60 * 1000,
  });
};

export const useUsersByRole = (roleId: string) => {
  return useQuery({
    queryKey: userKeys.byRole(roleId),
    queryFn: async () => {
      const users = await userService.getAll();
      return users.filter(user => user.roleId === roleId);
    },
    enabled: !!roleId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUsersByDepartment = (department: string) => {
  return useQuery({
    queryKey: userKeys.byDepartment(department),
    queryFn: async () => {
      const users = await userService.getAll();
      return users.filter(user => user.department === department);
    },
    enabled: !!department,
    staleTime: 5 * 60 * 1000,
  });
};

// Role Queries
export const useRoles = () => {
  return useQuery({
    queryKey: roleKeys.lists(),
    queryFn: () => roleService.getAll(),
    staleTime: 15 * 60 * 1000, // 15 minutes - roles don't change frequently
  });
};

export const useRole = (id: string) => {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: () => roleService.getById(id),
    enabled: !!id,
  });
};

export const useActiveRoles = () => {
  return useQuery({
    queryKey: roleKeys.active(),
    queryFn: async () => {
      const roles = await roleService.getAll();
      return roles.filter(role => role.active);
    },
    staleTime: 15 * 60 * 1000,
  });
};

// System Settings Queries
export const useSystemSettings = () => {
  return useQuery({
    queryKey: systemSettingsKeys.current(),
    queryFn: async () => {
      const settings = await systemSettingsService.getAll();
      return settings[0] || null; // Assuming there's only one settings record
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// User Mutations
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<User, 'id'>) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      userService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

// Role Mutations
export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Role, 'id'>) => roleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Role> }) =>
      roleService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => roleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
};

// System Settings Mutations
export const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SystemSettings> }) =>
      systemSettingsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemSettingsKeys.all });
    },
  });
};

// Business Logic Hooks
export const useActivateUser = () => {
  const updateMutation = useUpdateUser();
  return useMutation({
    mutationFn: async (id: string) => {
      return updateMutation.mutateAsync({
        id,
        data: { status: 'active' }
      });
    },
  });
};

export const useDeactivateUser = () => {
  const updateMutation = useUpdateUser();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      return updateMutation.mutateAsync({
        id,
        data: { 
          status: 'inactive',
          lastLogin: new Date().toISOString(),
        }
      });
    },
  });
};

export const useResetUserPassword = () => {
  const updateMutation = useUpdateUser();
  return useMutation({
    mutationFn: async ({ id, newPassword }: { id: string; newPassword: string }) => {
      return updateMutation.mutateAsync({
        id,
        data: { 
          password: newPassword, // In real app, this should be hashed
          passwordResetRequired: true,
        }
      });
    },
  });
};

export const useUpdateUserRole = () => {
  const updateMutation = useUpdateUser();
  return useMutation({
    mutationFn: async ({ id, roleId }: { id: string; roleId: string }) => {
      return updateMutation.mutateAsync({
        id,
        data: { roleId }
      });
    },
  });
};

export const useUpdateUserPermissions = () => {
  const updateMutation = useUpdateUser();
  return useMutation({
    mutationFn: async ({ id, permissions }: { id: string; permissions: string[] }) => {
      return updateMutation.mutateAsync({
        id,
        data: { permissions }
      });
    },
  });
};

export const useToggleRoleStatus = () => {
  const updateMutation = useUpdateRole();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      return updateMutation.mutateAsync({
        id,
        data: { active }
      });
    },
  });
};

export const useUpdateRolePermissions = () => {
  const updateMutation = useUpdateRole();
  return useMutation({
    mutationFn: async ({ id, permissions }: { id: string; permissions: string[] }) => {
      return updateMutation.mutateAsync({
        id,
        data: { permissions }
      });
    },
  });
};

// Dashboard and Analytics Hooks
export const useUserStats = () => {
  return useQuery({
    queryKey: [...userKeys.all, 'stats'],
    queryFn: async () => {
      const users = await userService.getAll();
      const roles = await roleService.getAll();
      
      const today = new Date();
      const lastWeek = new Date();
      lastWeek.setDate(today.getDate() - 7);
      
      return {
        total: users.length,
        active: users.filter(user => user.status === 'active').length,
        inactive: users.filter(user => user.status === 'inactive').length,
        recentLogins: users.filter(user => 
          user.lastLogin && new Date(user.lastLogin) >= lastWeek
        ).length,
        totalRoles: roles.length,
        activeRoles: roles.filter(role => role.active).length,
        usersNeedingPasswordReset: users.filter(user => user.passwordResetRequired).length,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUserActivity = (days: number = 30) => {
  return useQuery({
    queryKey: [...userKeys.all, 'activity', days],
    queryFn: async () => {
      const users = await userService.getAll();
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const activeUsers = users.filter(user => {
        if (!user.lastLogin) return false;
        const loginDate = new Date(user.lastLogin);
        return loginDate >= startDate && loginDate <= endDate;
      });

      // Group by date
      const activity = activeUsers.reduce((acc, user) => {
        const date = user.lastLogin!.split('T')[0]; // Get date part only
        if (!acc[date]) {
          acc[date] = { date, count: 0 };
        }
        acc[date].count++;
        return acc;
      }, {} as Record<string, { date: string; count: number }>);

      return Object.values(activity).sort((a, b) => a.date.localeCompare(b.date));
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
