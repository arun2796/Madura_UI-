import { useState, useEffect, useCallback } from "react";
import {
  PaperSize,
  NotebookType,
  CalculationRule,
  Client,
  paperSizeService,
  notebookTypeService,
  calculationRuleService,
  clientService,
} from "../services/entities";
import { handleApiError } from "../services/axiosApi";

// Re-export types for backward compatibility
export type {
  PaperSize,
  NotebookType,
  CalculationRule,
  Client,
} from "../services/entities";

export function useMasterData() {
  // State for all master data entities
  const [paperSizes, setPaperSizes] = useState<PaperSize[]>([]);
  const [notebookTypes, setNotebookTypes] = useState<NotebookType[]>([]);
  const [calculationRules, setCalculationRules] = useState<CalculationRule[]>(
    []
  );
  const [clients, setClients] = useState<Client[]>([]);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all master data on mount
  useEffect(() => {
    const loadAllMasterData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          paperSizesData,
          notebookTypesData,
          calculationRulesData,
          clientsData,
        ] = await Promise.all([
          paperSizeService.getAll(),
          notebookTypeService.getAll(),
          calculationRuleService.getAll(),
          clientService.getAll(),
        ]);

        setPaperSizes(paperSizesData);
        setNotebookTypes(notebookTypesData);
        setCalculationRules(calculationRulesData);
        setClients(clientsData);
      } catch (err) {
        setError(handleApiError(err));
        console.error("Failed to load master data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAllMasterData();
  }, []);

  // Paper Size CRUD operations
  const addPaperSize = useCallback(async (paperSize: Omit<PaperSize, "id">) => {
    try {
      const newPaperSize = await paperSizeService.create(paperSize);
      setPaperSizes((prev) => [...prev, newPaperSize]);
      return newPaperSize;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, []);

  const updatePaperSize = useCallback(
    async (id: string, updates: Partial<PaperSize>) => {
      try {
        const updatedPaperSize = await paperSizeService.update(id, updates);
        setPaperSizes((prev) =>
          prev.map((size) => (size.id === id ? updatedPaperSize : size))
        );
        return updatedPaperSize;
      } catch (err) {
        throw new Error(handleApiError(err));
      }
    },
    []
  );

  const deletePaperSize = useCallback(async (id: string) => {
    try {
      await paperSizeService.delete(id);
      setPaperSizes((prev) => prev.filter((size) => size.id !== id));
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, []);

  // Notebook Type CRUD operations
  const addNotebookType = useCallback(
    async (notebookType: Omit<NotebookType, "id">) => {
      try {
        const newNotebookType = await notebookTypeService.create(notebookType);
        setNotebookTypes((prev) => [...prev, newNotebookType]);
        return newNotebookType;
      } catch (err) {
        throw new Error(handleApiError(err));
      }
    },
    []
  );

  const updateNotebookType = useCallback(
    async (id: string, updates: Partial<NotebookType>) => {
      try {
        const updatedNotebookType = await notebookTypeService.update(
          id,
          updates
        );
        setNotebookTypes((prev) =>
          prev.map((type) => (type.id === id ? updatedNotebookType : type))
        );
        return updatedNotebookType;
      } catch (err) {
        throw new Error(handleApiError(err));
      }
    },
    []
  );

  const deleteNotebookType = useCallback(async (id: string) => {
    try {
      await notebookTypeService.delete(id);
      setNotebookTypes((prev) => prev.filter((type) => type.id !== id));
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, []);

  // Calculation Rule CRUD operations
  const addCalculationRule = useCallback(
    async (rule: Omit<CalculationRule, "id">) => {
      try {
        const newRule = await calculationRuleService.create(rule);
        setCalculationRules((prev) => [...prev, newRule]);
        return newRule;
      } catch (err) {
        throw new Error(handleApiError(err));
      }
    },
    []
  );

  const updateCalculationRule = useCallback(
    async (id: string, updates: Partial<CalculationRule>) => {
      try {
        const updatedRule = await calculationRuleService.update(id, updates);
        setCalculationRules((prev) =>
          prev.map((rule) => (rule.id === id ? updatedRule : rule))
        );
        return updatedRule;
      } catch (err) {
        throw new Error(handleApiError(err));
      }
    },
    []
  );

  const deleteCalculationRule = useCallback(async (id: string) => {
    try {
      await calculationRuleService.delete(id);
      setCalculationRules((prev) => prev.filter((rule) => rule.id !== id));
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, []);

  // Calculation functions - memoized to prevent infinite re-renders
  const calculateReamsAndSheets = useCallback(
    (pages: number, quantity: number, notebookType?: string) => {
      // Find the appropriate calculation rule
      const rule =
        calculationRules.find((r) => r.type === "notebook" && r.active) ||
        calculationRules[0];

      if (!rule) {
        // Fallback calculation
        const totalPages = pages * quantity;
        const totalSheets = Math.ceil(totalPages / 24); // Default 24 pages per sheet
        const totalReams = Math.ceil(totalSheets / 500); // Default 500 sheets per ream
        return { reams: totalReams, sheets: totalSheets };
      }

      // Use the rule's formula
      const totalPages = pages * quantity;
      const pagesPerSheet = rule.variables?.defaultPagesPerSheet || 24;
      const sheetsPerReem = rule.variables?.sheetsPerReem || 500;

      const totalSheets = Math.ceil(totalPages / pagesPerSheet);
      const totalReams = Math.ceil(totalSheets / sheetsPerReem);

      return { reams: totalReams, sheets: totalSheets };
    },
    [calculationRules]
  );

  const getPaperSizeMapping = useCallback(
    (notebookDescription: string) => {
      // Find matching notebook type
      const matchingType = notebookTypes.find(
        (type) =>
          notebookDescription.toLowerCase().includes(type.name.toLowerCase()) ||
          notebookDescription
            .toLowerCase()
            .includes(type.category.toLowerCase())
      );

      if (matchingType) {
        return paperSizes.find((size) => size.name === matchingType.paperSize);
      }

      // Default mapping based on description keywords
      if (notebookDescription.toLowerCase().includes("crown")) {
        return paperSizes.find((size) => size.type === "crown");
      } else if (notebookDescription.toLowerCase().includes("imperial")) {
        return paperSizes.find((size) => size.type === "imperial");
      } else if (notebookDescription.toLowerCase().includes("scholar")) {
        return paperSizes.find((size) => size.type === "scholar");
      } else if (notebookDescription.toLowerCase().includes("long")) {
        return paperSizes.find((size) => size.type === "long");
      }

      return paperSizes[0]; // Default to first paper size
    },
    [notebookTypes, paperSizes]
  );

  return {
    // Data
    paperSizes,
    notebookTypes,
    calculationRules,
    clients,

    // Loading and error states
    loading,
    error,

    // Paper Size operations
    addPaperSize,
    updatePaperSize,
    deletePaperSize,

    // Notebook Type operations
    addNotebookType,
    updateNotebookType,
    deleteNotebookType,

    // Calculation Rule operations
    addCalculationRule,
    updateCalculationRule,
    deleteCalculationRule,

    // Utility functions
    calculateReamsAndSheets,
    getPaperSizeMapping,
  };
}
