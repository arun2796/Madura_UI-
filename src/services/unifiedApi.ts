import axios, { AxiosResponse, AxiosError } from "axios";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

// Axios instance with interceptors
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(
      `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
    );
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    console.error(
      `❌ API Error: ${error.response?.status} ${error.config?.url}`,
      error.response?.data
    );
    return Promise.reject(error);
  }
);

// Generic API Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public data?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Error handler
export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    return new ApiError(
      error.response.data?.message || "Server error occurred",
      error.response.status,
      error.response.data?.code,
      error.response.data
    );
  } else if (error.request) {
    return new ApiError(
      "Network error - please check your connection",
      0,
      "NETWORK_ERROR"
    );
  } else {
    return new ApiError(
      error.message || "Unknown error occurred",
      0,
      "UNKNOWN_ERROR"
    );
  }
};

// Generic CRUD API functions
export const apiService = {
  // GET all items
  getAll: async <T>(endpoint: string): Promise<T[]> => {
    try {
      const response = await apiClient.get<T[]>(`/${endpoint}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // GET single item by ID
  getById: async <T>(endpoint: string, id: string): Promise<T> => {
    try {
      const response = await apiClient.get<T>(`/${endpoint}/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // POST create new item
  create: async <T>(endpoint: string, data: Omit<T, "id">): Promise<T> => {
    try {
      const response = await apiClient.post<T>(`/${endpoint}`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // PATCH update item (partial update)
  update: async <T>(
    endpoint: string,
    id: string,
    data: Partial<T>
  ): Promise<T> => {
    try {
      const response = await apiClient.patch<T>(`/${endpoint}/${id}`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // PATCH partial update
  patch: async <T>(
    endpoint: string,
    id: string,
    data: Partial<T>
  ): Promise<T> => {
    try {
      const response = await apiClient.patch<T>(`/${endpoint}/${id}`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // DELETE item
  delete: async (endpoint: string, id: string): Promise<void> => {
    try {
      await apiClient.delete(`/${endpoint}/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Bulk operations
  bulkCreate: async <T>(
    endpoint: string,
    items: Omit<T, "id">[]
  ): Promise<T[]> => {
    try {
      const promises = items.map((item) =>
        apiClient.post<T>(`/${endpoint}`, item)
      );
      const responses = await Promise.all(promises);
      return responses.map((response) => response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  bulkUpdate: async <T>(
    endpoint: string,
    updates: { id: string; data: Partial<T> }[]
  ): Promise<T[]> => {
    try {
      const promises = updates.map(({ id, data }) =>
        apiClient.patch<T>(`/${endpoint}/${id}`, data)
      );
      const responses = await Promise.all(promises);
      return responses.map((response) => response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  bulkDelete: async (endpoint: string, ids: string[]): Promise<void> => {
    try {
      const promises = ids.map((id) => apiClient.delete(`/${endpoint}/${id}`));
      await Promise.all(promises);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Search with query parameters
  search: async <T>(
    endpoint: string,
    params: Record<string, any>
  ): Promise<T[]> => {
    try {
      const response = await apiClient.get<T[]>(`/${endpoint}`, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Custom query with filters
  query: async <T>(
    endpoint: string,
    filters: Record<string, any>
  ): Promise<T[]> => {
    try {
      const queryString = Object.entries(filters)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&");
      const response = await apiClient.get<T[]>(`/${endpoint}?${queryString}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// Query key factories for consistent caching
export const queryKeys = {
  // Generic keys
  all: (entity: string) => [entity] as const,
  lists: (entity: string) => [...queryKeys.all(entity), "list"] as const,
  list: (entity: string, filters: any) =>
    [...queryKeys.lists(entity), { filters }] as const,
  details: (entity: string) => [...queryKeys.all(entity), "detail"] as const,
  detail: (entity: string, id: string) =>
    [...queryKeys.details(entity), id] as const,

  // Specific entity keys
  paperSizes: {
    all: ["paperSizes"] as const,
    lists: () => [...queryKeys.paperSizes.all, "list"] as const,
    detail: (id: string) =>
      [...queryKeys.paperSizes.all, "detail", id] as const,
    active: () => [...queryKeys.paperSizes.all, "active"] as const,
    bySize: (size: string) =>
      [...queryKeys.paperSizes.all, "size", size] as const,
  },

  notebookTypes: {
    all: ["notebookTypes"] as const,
    lists: () => [...queryKeys.notebookTypes.all, "list"] as const,
    detail: (id: string) =>
      [...queryKeys.notebookTypes.all, "detail", id] as const,
    active: () => [...queryKeys.notebookTypes.all, "active"] as const,
    byCategory: (category: string) =>
      [...queryKeys.notebookTypes.all, "category", category] as const,
  },

  calculationRules: {
    all: ["calculationRules"] as const,
    lists: () => [...queryKeys.calculationRules.all, "list"] as const,
    detail: (id: string) =>
      [...queryKeys.calculationRules.all, "detail", id] as const,
    active: () => [...queryKeys.calculationRules.all, "active"] as const,
    byType: (type: string) =>
      [...queryKeys.calculationRules.all, "type", type] as const,
  },

  teams: {
    all: ["teams"] as const,
    lists: () => [...queryKeys.teams.all, "list"] as const,
    detail: (id: string) => [...queryKeys.teams.all, "detail", id] as const,
    active: () => [...queryKeys.teams.all, "active"] as const,
    byDepartment: (dept: string) =>
      [...queryKeys.teams.all, "department", dept] as const,
  },

  clients: {
    all: ["clients"] as const,
    lists: () => [...queryKeys.clients.all, "list"] as const,
    detail: (id: string) => [...queryKeys.clients.all, "detail", id] as const,
    active: () => [...queryKeys.clients.all, "active"] as const,
    byType: (type: string) => [...queryKeys.clients.all, "type", type] as const,
  },
};

// Generic React Query hooks factory
export const createQueryHooks = <T>(endpoint: string) => {
  const useGetAll = (
    options?: Omit<UseQueryOptions<T[]>, "queryKey" | "queryFn">
  ) => {
    return useQuery({
      queryKey: queryKeys.lists(endpoint),
      queryFn: () => apiService.getAll<T>(endpoint),
      staleTime: 5 * 60 * 1000, // 5 minutes
      ...options,
    });
  };

  const useGetById = (
    id: string,
    options?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn">
  ) => {
    return useQuery({
      queryKey: queryKeys.detail(endpoint, id),
      queryFn: () => apiService.getById<T>(endpoint, id),
      enabled: !!id,
      ...options,
    });
  };

  const useCreate = (
    options?: UseMutationOptions<T, ApiError, Omit<T, "id">>
  ) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (data: Omit<T, "id">) => apiService.create<T>(endpoint, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.all(endpoint) });
      },
      ...options,
    });
  };

  const useUpdate = (
    options?: UseMutationOptions<T, ApiError, { id: string; data: Partial<T> }>
  ) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<T> }) =>
        apiService.update<T>(endpoint, id, data),
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.all(endpoint) });
        queryClient.invalidateQueries({
          queryKey: queryKeys.detail(endpoint, id),
        });
      },
      ...options,
    });
  };

  const useDelete = (options?: UseMutationOptions<void, ApiError, string>) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => apiService.delete(endpoint, id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.all(endpoint) });
      },
      ...options,
    });
  };

  const useBulkCreate = (
    options?: UseMutationOptions<T[], ApiError, Omit<T, "id">[]>
  ) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (items: Omit<T, "id">[]) =>
        apiService.bulkCreate<T>(endpoint, items),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.all(endpoint) });
      },
      ...options,
    });
  };

  const useBulkUpdate = (
    options?: UseMutationOptions<
      T[],
      ApiError,
      { id: string; data: Partial<T> }[]
    >
  ) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (updates: { id: string; data: Partial<T> }[]) =>
        apiService.bulkUpdate<T>(endpoint, updates),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.all(endpoint) });
      },
      ...options,
    });
  };

  const useBulkDelete = (
    options?: UseMutationOptions<void, ApiError, string[]>
  ) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (ids: string[]) => apiService.bulkDelete(endpoint, ids),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.all(endpoint) });
      },
      ...options,
    });
  };

  const useToggleStatus = (
    options?: UseMutationOptions<T, ApiError, string>
  ) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (id: string) => {
        const item = await apiService.getById<T & { status: string }>(
          endpoint,
          id
        );
        const newStatus = item.status === "active" ? "inactive" : "active";
        return apiService.update<T>(endpoint, id, {
          status: newStatus,
        } as unknown as Partial<T>);
      },
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.all(endpoint) });
        queryClient.invalidateQueries({
          queryKey: queryKeys.detail(endpoint, id),
        });
      },
      ...options,
    });
  };

  const useSearch = (
    searchParams: Record<string, any>,
    options?: Omit<UseQueryOptions<T[]>, "queryKey" | "queryFn">
  ) => {
    return useQuery({
      queryKey: queryKeys.list(endpoint, searchParams),
      queryFn: () => apiService.search<T>(endpoint, searchParams),
      enabled: Object.keys(searchParams).length > 0,
      staleTime: 2 * 60 * 1000, // 2 minutes for search results
      ...options,
    });
  };

  return {
    useGetAll,
    useGetById,
    useCreate,
    useUpdate,
    useDelete,
    useBulkCreate,
    useBulkUpdate,
    useBulkDelete,
    useToggleStatus,
    useSearch,
  };
};
