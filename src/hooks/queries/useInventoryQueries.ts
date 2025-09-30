import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService, InventoryItem, bindingAdviceService } from '../../services/entities';
import { handleApiError } from '../../services/axiosApi';

// Query keys
export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...inventoryKeys.lists(), { filters }] as const,
  details: () => [...inventoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...inventoryKeys.details(), id] as const,
  rawMaterials: () => [...inventoryKeys.all, 'rawMaterials'] as const,
  finishedProducts: () => [...inventoryKeys.all, 'finishedProducts'] as const,
  lowStock: () => [...inventoryKeys.all, 'lowStock'] as const,
  reserved: () => [...inventoryKeys.all, 'reserved'] as const,
};

// Basic queries
export const useInventory = (filters?: Record<string, any>) => {
  return useQuery({
    queryKey: filters ? inventoryKeys.list(filters) : inventoryKeys.lists(),
    queryFn: () => filters ? inventoryService.search(filters) : inventoryService.getAll(),
    staleTime: 2 * 60 * 1000, // 2 minutes for inventory data
  });
};

export const useInventoryItem = (id: string) => {
  return useQuery({
    queryKey: inventoryKeys.detail(id),
    queryFn: () => inventoryService.getById(id),
    enabled: !!id,
  });
};

// Specialized inventory queries
export const useRawMaterials = () => {
  return useQuery({
    queryKey: inventoryKeys.rawMaterials(),
    queryFn: () => inventoryService.search({ category: 'raw_material' }),
    staleTime: 2 * 60 * 1000,
  });
};

export const useFinishedProducts = () => {
  return useQuery({
    queryKey: inventoryKeys.finishedProducts(),
    queryFn: () => inventoryService.search({ category: 'finished_product' }),
    staleTime: 2 * 60 * 1000,
  });
};

export const useLowStockItems = () => {
  return useQuery({
    queryKey: inventoryKeys.lowStock(),
    queryFn: async () => {
      const allItems = await inventoryService.getAll();
      return allItems.filter(item => 
        item.currentStock <= item.minStock || 
        item.status === 'low' || 
        item.status === 'critical'
      );
    },
    staleTime: 1 * 60 * 1000, // 1 minute for critical data
  });
};

// Inventory mutations with business logic
export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<InventoryItem, 'id'>) => inventoryService.create(data),
    onSuccess: (newItem) => {
      // Invalidate all inventory queries
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      
      // Add to specific category cache
      if (newItem.category === 'raw_material') {
        queryClient.invalidateQueries({ queryKey: inventoryKeys.rawMaterials() });
      } else if (newItem.category === 'finished_product') {
        queryClient.invalidateQueries({ queryKey: inventoryKeys.finishedProducts() });
      }
    },
    onError: (error) => {
      console.error('Failed to create inventory item:', handleApiError(error));
    },
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InventoryItem> }) =>
      inventoryService.update(id, data),
    onSuccess: (updatedItem, { id }) => {
      // Update specific item cache
      queryClient.setQueryData(inventoryKeys.detail(id), updatedItem);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lowStock() });
      
      // Update category-specific caches
      if (updatedItem.category === 'raw_material') {
        queryClient.invalidateQueries({ queryKey: inventoryKeys.rawMaterials() });
      } else if (updatedItem.category === 'finished_product') {
        queryClient.invalidateQueries({ queryKey: inventoryKeys.finishedProducts() });
      }
    },
    onError: (error) => {
      console.error('Failed to update inventory item:', handleApiError(error));
    },
  });
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inventoryService.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: inventoryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
    onError: (error) => {
      console.error('Failed to delete inventory item:', handleApiError(error));
    },
  });
};

// Advanced inventory operations
export const useReserveInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      bindingAdviceId, 
      materials 
    }: { 
      bindingAdviceId: string; 
      materials: Array<{ itemId: string; quantity: number }> 
    }) => {
      // Get current inventory items
      const inventoryItems = await Promise.all(
        materials.map(({ itemId }) => inventoryService.getById(itemId))
      );

      // Check availability
      const reservations = materials.map(({ itemId, quantity }) => {
        const item = inventoryItems.find(inv => inv.id === itemId);
        if (!item) {
          throw new Error(`Inventory item ${itemId} not found`);
        }
        if (item.currentStock < quantity) {
          throw new Error(`Insufficient stock for ${item.itemName}. Available: ${item.currentStock}, Required: ${quantity}`);
        }
        return { item, quantity };
      });

      // Update inventory with reservations
      const updates = reservations.map(({ item, quantity }) => ({
        id: item.id,
        data: {
          currentStock: item.currentStock - quantity,
          lastUpdated: new Date().toISOString().split('T')[0],
          // Add reservation tracking
          reservations: [
            ...(item.reservations || []),
            {
              bindingAdviceId,
              quantity,
              date: new Date().toISOString(),
              status: 'reserved'
            }
          ]
        }
      }));

      return inventoryService.bulkUpdate(updates);
    },
    onSuccess: () => {
      // Invalidate all inventory queries to reflect stock changes
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
    onError: (error) => {
      console.error('Failed to reserve inventory:', handleApiError(error));
    },
  });
};

export const useReleaseInventoryReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bindingAdviceId }: { bindingAdviceId: string }) => {
      // Get all inventory items
      const allItems = await inventoryService.getAll();
      
      // Find items with reservations for this binding advice
      const itemsWithReservations = allItems.filter(item => 
        item.reservations?.some(res => res.bindingAdviceId === bindingAdviceId)
      );

      // Release reservations
      const updates = itemsWithReservations.map(item => {
        const reservation = item.reservations?.find(res => res.bindingAdviceId === bindingAdviceId);
        if (!reservation) return null;

        return {
          id: item.id,
          data: {
            currentStock: item.currentStock + reservation.quantity,
            lastUpdated: new Date().toISOString().split('T')[0],
            reservations: item.reservations?.filter(res => res.bindingAdviceId !== bindingAdviceId) || []
          }
        };
      }).filter(Boolean) as Array<{ id: string; data: Partial<InventoryItem> }>;

      if (updates.length > 0) {
        return inventoryService.bulkUpdate(updates);
      }
      return [];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
    onError: (error) => {
      console.error('Failed to release inventory reservation:', handleApiError(error));
    },
  });
};

export const useConsumeInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      bindingAdviceId, 
      materials 
    }: { 
      bindingAdviceId: string; 
      materials: Array<{ itemId: string; quantity: number }> 
    }) => {
      // This is called when production is completed
      // Remove reservations and update consumption history
      const allItems = await inventoryService.getAll();
      
      const updates = materials.map(({ itemId, quantity }) => {
        const item = allItems.find(inv => inv.id === itemId);
        if (!item) throw new Error(`Inventory item ${itemId} not found`);

        return {
          id: itemId,
          data: {
            lastUpdated: new Date().toISOString().split('T')[0],
            // Remove reservation for this binding advice
            reservations: item.reservations?.filter(res => res.bindingAdviceId !== bindingAdviceId) || [],
            // Add to consumption history
            consumptionHistory: [
              ...(item.consumptionHistory || []),
              {
                date: new Date().toISOString(),
                quantity,
                bindingAdviceId,
                type: 'production'
              }
            ]
          }
        };
      });

      return inventoryService.bulkUpdate(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
    onError: (error) => {
      console.error('Failed to consume inventory:', handleApiError(error));
    },
  });
};

// Custom hooks for specific business scenarios
export const useInventoryByCategory = (category: string) => {
  return useInventory({ category });
};

export const useInventoryBySupplier = (supplier: string) => {
  return useInventory({ supplier });
};

export const useInventoryByLocation = (location: string) => {
  return useInventory({ location });
};
