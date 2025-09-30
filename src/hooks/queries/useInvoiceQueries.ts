import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Invoice } from '../../services/entities';
import { invoiceService } from '../../services/entities';

// Query Keys
export const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (filters: string) => [...invoiceKeys.lists(), { filters }] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
  pending: () => [...invoiceKeys.all, 'pending'] as const,
  paid: () => [...invoiceKeys.all, 'paid'] as const,
  overdue: () => [...invoiceKeys.all, 'overdue'] as const,
  byClient: (clientId: string) => [...invoiceKeys.all, 'client', clientId] as const,
  byJobCard: (jobCardId: string) => [...invoiceKeys.all, 'jobCard', jobCardId] as const,
  byDateRange: (startDate: string, endDate: string) => [...invoiceKeys.all, 'dateRange', startDate, endDate] as const,
};

// Queries
export const useInvoices = () => {
  return useQuery({
    queryKey: invoiceKeys.lists(),
    queryFn: () => invoiceService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => invoiceService.getById(id),
    enabled: !!id,
  });
};

export const usePendingInvoices = () => {
  return useQuery({
    queryKey: invoiceKeys.pending(),
    queryFn: async () => {
      const invoices = await invoiceService.getAll();
      return invoices.filter(invoice => invoice.status === 'pending');
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const usePaidInvoices = () => {
  return useQuery({
    queryKey: invoiceKeys.paid(),
    queryFn: async () => {
      const invoices = await invoiceService.getAll();
      return invoices.filter(invoice => invoice.status === 'paid');
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useOverdueInvoices = () => {
  return useQuery({
    queryKey: invoiceKeys.overdue(),
    queryFn: async () => {
      const invoices = await invoiceService.getAll();
      const today = new Date();
      return invoices.filter(invoice => 
        invoice.status === 'pending' && 
        new Date(invoice.dueDate) < today
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useInvoicesByClient = (clientId: string) => {
  return useQuery({
    queryKey: invoiceKeys.byClient(clientId),
    queryFn: async () => {
      const invoices = await invoiceService.getAll();
      return invoices.filter(invoice => invoice.clientId === clientId);
    },
    enabled: !!clientId,
  });
};

export const useInvoicesByJobCard = (jobCardId: string) => {
  return useQuery({
    queryKey: invoiceKeys.byJobCard(jobCardId),
    queryFn: async () => {
      const invoices = await invoiceService.getAll();
      return invoices.filter(invoice => invoice.jobCardId === jobCardId);
    },
    enabled: !!jobCardId,
  });
};

export const useInvoicesByDateRange = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: invoiceKeys.byDateRange(startDate, endDate),
    queryFn: async () => {
      const invoices = await invoiceService.getAll();
      return invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.invoiceDate);
        return invoiceDate >= new Date(startDate) && invoiceDate <= new Date(endDate);
      });
    },
    enabled: !!startDate && !!endDate,
  });
};

// Mutations
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Invoice, 'id'>) => invoiceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Invoice> }) =>
      invoiceService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(id) });
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoiceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
};

export const useBulkCreateInvoices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invoices: Omit<Invoice, 'id'>[]) =>
      invoiceService.bulkCreate(invoices),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
};

export const useBulkUpdateInvoices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: { id: string; data: Partial<Invoice> }[]) =>
      invoiceService.bulkUpdate(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
};

export const useBulkDeleteInvoices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => invoiceService.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
};

// Business Logic Hooks
export const useMarkInvoicePaid = () => {
  const updateMutation = useUpdateInvoice();

  return useMutation({
    mutationFn: async ({ id, paymentDetails }: { 
      id: string; 
      paymentDetails: {
        paidAmount: number;
        paymentDate: string;
        paymentMethod: string;
        transactionId?: string;
        notes?: string;
      }
    }) => {
      return updateMutation.mutateAsync({
        id,
        data: {
          status: 'paid',
          paidAmount: paymentDetails.paidAmount,
          paidDate: paymentDetails.paymentDate,
          paymentMethod: paymentDetails.paymentMethod,
          transactionId: paymentDetails.transactionId,
          notes: paymentDetails.notes,
        }
      });
    },
  });
};

export const useMarkInvoicePartiallyPaid = () => {
  const updateMutation = useUpdateInvoice();

  return useMutation({
    mutationFn: async ({ id, paymentDetails }: { 
      id: string; 
      paymentDetails: {
        paidAmount: number;
        paymentDate: string;
        paymentMethod: string;
        transactionId?: string;
        notes?: string;
      }
    }) => {
      return updateMutation.mutateAsync({
        id,
        data: {
          status: 'partially_paid',
          paidAmount: paymentDetails.paidAmount,
          paidDate: paymentDetails.paymentDate,
          paymentMethod: paymentDetails.paymentMethod,
          transactionId: paymentDetails.transactionId,
          notes: paymentDetails.notes,
        }
      });
    },
  });
};

export const useCancelInvoice = () => {
  const updateMutation = useUpdateInvoice();

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

export const useSendInvoiceReminder = () => {
  const updateMutation = useUpdateInvoice();

  return useMutation({
    mutationFn: async ({ id, reminderDate }: { id: string; reminderDate: string }) => {
      return updateMutation.mutateAsync({
        id,
        data: {
          lastReminderSent: reminderDate,
        }
      });
    },
  });
};

// Dashboard and Analytics Hooks
export const useInvoiceStats = () => {
  return useQuery({
    queryKey: [...invoiceKeys.all, 'stats'],
    queryFn: async () => {
      const invoices = await invoiceService.getAll();
      
      const today = new Date();
      const thisMonth = new Date().toISOString().slice(0, 7);
      
      const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      const paidAmount = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.totalAmount, 0);
      const pendingAmount = invoices
        .filter(inv => inv.status === 'pending')
        .reduce((sum, inv) => sum + inv.totalAmount, 0);
      const overdueAmount = invoices
        .filter(inv => inv.status === 'pending' && new Date(inv.dueDate) < today)
        .reduce((sum, inv) => sum + inv.totalAmount, 0);
      
      return {
        total: invoices.length,
        pending: invoices.filter(inv => inv.status === 'pending').length,
        paid: invoices.filter(inv => inv.status === 'paid').length,
        overdue: invoices.filter(inv => 
          inv.status === 'pending' && new Date(inv.dueDate) < today
        ).length,
        cancelled: invoices.filter(inv => inv.status === 'cancelled').length,
        totalAmount,
        paidAmount,
        pendingAmount,
        overdueAmount,
        monthlyInvoices: invoices.filter(inv => inv.invoiceDate.startsWith(thisMonth)).length,
        monthlyAmount: invoices
          .filter(inv => inv.invoiceDate.startsWith(thisMonth))
          .reduce((sum, inv) => sum + inv.totalAmount, 0),
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useInvoiceTrends = (days: number = 30) => {
  return useQuery({
    queryKey: [...invoiceKeys.all, 'trends', days],
    queryFn: async () => {
      const invoices = await invoiceService.getAll();
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const filteredInvoices = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.invoiceDate);
        return invoiceDate >= startDate && invoiceDate <= endDate;
      });

      // Group by date
      const trends = filteredInvoices.reduce((acc, invoice) => {
        const date = invoice.invoiceDate;
        if (!acc[date]) {
          acc[date] = { date, count: 0, amount: 0 };
        }
        acc[date].count++;
        acc[date].amount += invoice.totalAmount;
        return acc;
      }, {} as Record<string, { date: string; count: number; amount: number }>);

      return Object.values(trends).sort((a, b) => a.date.localeCompare(b.date));
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
