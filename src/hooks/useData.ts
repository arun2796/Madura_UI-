import { useState, useEffect, useCallback } from "react";
import {
  BindingAdvice,
  JobCard,
  InventoryItem,
  Dispatch,
  Invoice,
  Client,
  bindingAdviceService,
  jobCardService,
  inventoryService,
  dispatchService,
  invoiceService,
  clientService,
} from "../services/api";
import { handleApiError } from "../services/api";

// Re-export types for backward compatibility
export type {
  BindingAdvice,
  JobCard,
  InventoryItem,
  Dispatch,
  Invoice,
  Client,
} from "../services/entities";

export function useData() {
  // State for all entities
  const [bindingAdvices, setBindingAdvices] = useState<BindingAdvice[]>([]);
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all data on mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          bindingAdvicesData,
          jobCardsData,
          inventoryData,
          dispatchesData,
          invoicesData,
          clientsData,
        ] = await Promise.all([
          bindingAdviceService.getAll(),
          jobCardService.getAll(),
          inventoryService.getAll(),
          dispatchService.getAll(),
          invoiceService.getAll(),
          clientService.getAll(),
        ]);

        setBindingAdvices(bindingAdvicesData);
        setJobCards(jobCardsData);
        setInventory(inventoryData);
        setDispatches(dispatchesData);
        setInvoices(invoicesData);
        setClients(clientsData);
      } catch (err) {
        setError(handleApiError(err));
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Generate next ID for each entity type (fallback for client-side generation)
  const generateNextId = useCallback((prefix: string, existingItems: any[]) => {
    const year = new Date().getFullYear();
    const numbers = existingItems
      .map((item) => {
        const match = item.id.match(new RegExp(`${prefix}-${year}-(\\d+)`));
        return match ? parseInt(match[1]) : 0;
      })
      .filter((num) => num > 0);

    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `${prefix}-${year}-${nextNumber.toString().padStart(3, "0")}`;
  }, []);

  // CRUD operations for Binding Advice
  const addBindingAdvice = useCallback(
    async (advice: Omit<BindingAdvice, "id">) => {
      try {
        const newAdvice = await bindingAdviceService.create(advice);
        setBindingAdvices((prev) => [...prev, newAdvice]);
        return newAdvice;
      } catch (err) {
        throw new Error(handleApiError(err));
      }
    },
    []
  );

  const updateBindingAdvice = useCallback(
    async (id: string, updates: Partial<BindingAdvice>) => {
      try {
        const updatedAdvice = await bindingAdviceService.update(id, updates);
        setBindingAdvices((prev) =>
          prev.map((advice) => (advice.id === id ? updatedAdvice : advice))
        );
        return updatedAdvice;
      } catch (err) {
        throw new Error(handleApiError(err));
      }
    },
    []
  );

  const deleteBindingAdvice = useCallback(async (id: string) => {
    try {
      await bindingAdviceService.delete(id);
      setBindingAdvices((prev) => prev.filter((advice) => advice.id !== id));
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, []);

  // CRUD operations for Job Cards
  const addJobCard = useCallback(async (jobCard: Omit<JobCard, "id">) => {
    try {
      const newJobCard = await jobCardService.create(jobCard);
      setJobCards((prev) => [...prev, newJobCard]);
      return newJobCard;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, []);

  const updateJobCard = useCallback(
    async (id: string, updates: Partial<JobCard>) => {
      try {
        const updatedJobCard = await jobCardService.update(id, updates);
        setJobCards((prev) =>
          prev.map((card) => (card.id === id ? updatedJobCard : card))
        );
        return updatedJobCard;
      } catch (err) {
        throw new Error(handleApiError(err));
      }
    },
    []
  );

  const deleteJobCard = useCallback(async (id: string) => {
    try {
      await jobCardService.delete(id);
      setJobCards((prev) => prev.filter((card) => card.id !== id));
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, []);

  // CRUD operations for Inventory
  const addInventoryItem = useCallback(
    async (item: Omit<InventoryItem, "id">) => {
      try {
        const newItem = await inventoryService.create(item);
        setInventory((prev) => [...prev, newItem]);
        return newItem;
      } catch (err) {
        throw new Error(handleApiError(err));
      }
    },
    []
  );

  const updateInventoryItem = useCallback(
    async (id: string, updates: Partial<InventoryItem>) => {
      try {
        const updatedItem = await inventoryService.update(id, updates);
        setInventory((prev) =>
          prev.map((item) => (item.id === id ? updatedItem : item))
        );
        return updatedItem;
      } catch (err) {
        throw new Error(handleApiError(err));
      }
    },
    []
  );

  const deleteInventoryItem = useCallback(async (id: string) => {
    try {
      await inventoryService.delete(id);
      setInventory((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, []);

  // CRUD operations for Dispatch
  const addDispatch = useCallback(async (dispatch: Omit<Dispatch, "id">) => {
    try {
      const newDispatch = await dispatchService.create(dispatch);
      setDispatches((prev) => [...prev, newDispatch]);
      return newDispatch;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, []);

  const updateDispatch = useCallback(
    async (id: string, updates: Partial<Dispatch>) => {
      try {
        const updatedDispatch = await dispatchService.update(id, updates);
        setDispatches((prev) =>
          prev.map((dispatch) =>
            dispatch.id === id ? updatedDispatch : dispatch
          )
        );
        return updatedDispatch;
      } catch (err) {
        throw new Error(handleApiError(err));
      }
    },
    []
  );

  const deleteDispatch = useCallback(async (id: string) => {
    try {
      await dispatchService.delete(id);
      setDispatches((prev) => prev.filter((dispatch) => dispatch.id !== id));
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, []);

  // CRUD operations for Invoices
  const addInvoice = useCallback(async (invoice: Omit<Invoice, "id">) => {
    try {
      const newInvoice = await invoiceService.create(invoice);
      setInvoices((prev) => [...prev, newInvoice]);
      return newInvoice;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, []);

  const updateInvoice = useCallback(
    async (id: string, updates: Partial<Invoice>) => {
      try {
        const updatedInvoice = await invoiceService.update(id, updates);
        setInvoices((prev) =>
          prev.map((invoice) => (invoice.id === id ? updatedInvoice : invoice))
        );
        return updatedInvoice;
      } catch (err) {
        throw new Error(handleApiError(err));
      }
    },
    []
  );

  const deleteInvoice = useCallback(async (id: string) => {
    try {
      await invoiceService.delete(id);
      setInvoices((prev) => prev.filter((invoice) => invoice.id !== id));
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, []);

  // CRUD operations for Clients
  const addClient = useCallback(async (client: Omit<Client, "id">) => {
    try {
      const newClient = await clientService.create(client);
      setClients((prev) => [...prev, newClient]);
      return newClient;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, []);

  const updateClient = useCallback(
    async (id: string, updates: Partial<Client>) => {
      try {
        const updatedClient = await clientService.update(id, updates);
        setClients((prev) =>
          prev.map((client) => (client.id === id ? updatedClient : client))
        );
        return updatedClient;
      } catch (err) {
        throw new Error(handleApiError(err));
      }
    },
    []
  );

  const deleteClient = useCallback(async (id: string) => {
    try {
      await clientService.delete(id);
      setClients((prev) => prev.filter((client) => client.id !== id));
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, []);

  return {
    // Data
    bindingAdvices,
    jobCards,
    inventory,
    dispatches,
    invoices,
    clients,

    // Loading and error states
    loading,
    error,

    // Binding Advice operations
    addBindingAdvice,
    updateBindingAdvice,
    deleteBindingAdvice,

    // Job Card operations
    addJobCard,
    updateJobCard,
    deleteJobCard,

    // Inventory operations
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,

    // Dispatch operations
    addDispatch,
    updateDispatch,
    deleteDispatch,

    // Invoice operations
    addInvoice,
    updateInvoice,
    deleteInvoice,

    // Client operations
    addClient,
    updateClient,
    deleteClient,
  };
}
