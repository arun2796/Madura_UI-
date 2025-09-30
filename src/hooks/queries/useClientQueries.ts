import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Client } from '../../services/entities';
import { clientService } from '../../services/entities';

// Query Keys
export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (filters: string) => [...clientKeys.lists(), { filters }] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
  active: () => [...clientKeys.all, 'active'] as const,
  inactive: () => [...clientKeys.all, 'inactive'] as const,
  byType: (type: string) => [...clientKeys.all, 'type', type] as const,
  search: (query: string) => [...clientKeys.all, 'search', query] as const,
};

// Queries
export const useClients = () => {
  return useQuery({
    queryKey: clientKeys.lists(),
    queryFn: () => clientService.getAll(),
    staleTime: 10 * 60 * 1000, // 10 minutes - client data doesn't change frequently
  });
};

export const useClient = (id: string) => {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => clientService.getById(id),
    enabled: !!id,
  });
};

export const useActiveClients = () => {
  return useQuery({
    queryKey: clientKeys.active(),
    queryFn: async () => {
      const clients = await clientService.getAll();
      return clients.filter(client => client.status === 'active');
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useInactiveClients = () => {
  return useQuery({
    queryKey: clientKeys.inactive(),
    queryFn: async () => {
      const clients = await clientService.getAll();
      return clients.filter(client => client.status === 'inactive');
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useClientsByType = (type: string) => {
  return useQuery({
    queryKey: clientKeys.byType(type),
    queryFn: async () => {
      const clients = await clientService.getAll();
      return clients.filter(client => client.type === type);
    },
    enabled: !!type,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useSearchClients = (query: string) => {
  return useQuery({
    queryKey: clientKeys.search(query),
    queryFn: async () => {
      const clients = await clientService.getAll();
      const searchTerm = query.toLowerCase();
      return clients.filter(client => 
        client.name.toLowerCase().includes(searchTerm) ||
        client.email.toLowerCase().includes(searchTerm) ||
        client.phone.includes(searchTerm) ||
        client.address.toLowerCase().includes(searchTerm)
      );
    },
    enabled: query.length >= 2, // Only search when query is at least 2 characters
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutations
export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Client, 'id'>) => clientService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) =>
      clientService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(id) });
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
};

export const useBulkCreateClients = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clients: Omit<Client, 'id'>[]) =>
      clientService.bulkCreate(clients),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
};

export const useBulkUpdateClients = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: { id: string; data: Partial<Client> }[]) =>
      clientService.bulkUpdate(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
};

export const useBulkDeleteClients = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => clientService.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
};

// Business Logic Hooks
export const useActivateClient = () => {
  const updateMutation = useUpdateClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return updateMutation.mutateAsync({
        id,
        data: { status: 'active' }
      });
    },
  });
};

export const useDeactivateClient = () => {
  const updateMutation = useUpdateClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      return updateMutation.mutateAsync({
        id,
        data: { 
          status: 'inactive',
          notes: reason ? `Deactivated: ${reason}` : 'Deactivated'
        }
      });
    },
  });
};

export const useUpdateClientCredit = () => {
  const updateMutation = useUpdateClient();

  return useMutation({
    mutationFn: async ({ id, creditLimit, creditUsed }: { 
      id: string; 
      creditLimit?: number;
      creditUsed?: number;
    }) => {
      const updateData: Partial<Client> = {};
      if (creditLimit !== undefined) updateData.creditLimit = creditLimit;
      if (creditUsed !== undefined) updateData.creditUsed = creditUsed;
      
      return updateMutation.mutateAsync({
        id,
        data: updateData
      });
    },
  });
};

export const useAddClientContact = () => {
  const updateMutation = useUpdateClient();

  return useMutation({
    mutationFn: async ({ id, contact }: { 
      id: string; 
      contact: {
        name: string;
        designation: string;
        phone: string;
        email: string;
      }
    }) => {
      const client = await clientService.getById(id);
      const updatedContacts = [...(client.contacts || []), contact];
      
      return updateMutation.mutateAsync({
        id,
        data: { contacts: updatedContacts }
      });
    },
  });
};

export const useRemoveClientContact = () => {
  const updateMutation = useUpdateClient();

  return useMutation({
    mutationFn: async ({ id, contactIndex }: { id: string; contactIndex: number }) => {
      const client = await clientService.getById(id);
      const updatedContacts = (client.contacts || []).filter((_, index) => index !== contactIndex);
      
      return updateMutation.mutateAsync({
        id,
        data: { contacts: updatedContacts }
      });
    },
  });
};

// Dashboard and Analytics Hooks
export const useClientStats = () => {
  return useQuery({
    queryKey: [...clientKeys.all, 'stats'],
    queryFn: async () => {
      const clients = await clientService.getAll();
      
      const totalCreditLimit = clients.reduce((sum, client) => sum + (client.creditLimit || 0), 0);
      const totalCreditUsed = clients.reduce((sum, client) => sum + (client.creditUsed || 0), 0);
      const availableCredit = totalCreditLimit - totalCreditUsed;
      
      return {
        total: clients.length,
        active: clients.filter(client => client.status === 'active').length,
        inactive: clients.filter(client => client.status === 'inactive').length,
        corporate: clients.filter(client => client.type === 'corporate').length,
        individual: clients.filter(client => client.type === 'individual').length,
        totalCreditLimit,
        totalCreditUsed,
        availableCredit,
        creditUtilization: totalCreditLimit > 0 ? (totalCreditUsed / totalCreditLimit) * 100 : 0,
        highCreditClients: clients.filter(client => 
          (client.creditUsed || 0) > (client.creditLimit || 0) * 0.8
        ).length,
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useTopClients = (limit: number = 10) => {
  return useQuery({
    queryKey: [...clientKeys.all, 'top', limit],
    queryFn: async () => {
      const clients = await clientService.getAll();
      return clients
        .filter(client => client.status === 'active')
        .sort((a, b) => (b.creditUsed || 0) - (a.creditUsed || 0))
        .slice(0, limit);
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useClientGrowth = (months: number = 12) => {
  return useQuery({
    queryKey: [...clientKeys.all, 'growth', months],
    queryFn: async () => {
      const clients = await clientService.getAll();
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - months);

      const filteredClients = clients.filter(client => {
        const createdDate = new Date(client.createdDate);
        return createdDate >= startDate && createdDate <= endDate;
      });

      // Group by month
      const growth = filteredClients.reduce((acc, client) => {
        const monthKey = client.createdDate.slice(0, 7); // YYYY-MM
        if (!acc[monthKey]) {
          acc[monthKey] = { month: monthKey, count: 0 };
        }
        acc[monthKey].count++;
        return acc;
      }, {} as Record<string, { month: string; count: number }>);

      return Object.values(growth).sort((a, b) => a.month.localeCompare(b.month));
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};
