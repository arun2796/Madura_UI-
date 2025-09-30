import axios, { AxiosResponse, AxiosError } from "axios";

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

// Create axios instance
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
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    console.error(
      `❌ ${error.response?.status} ${error.config?.url}`,
      error.response?.data
    );
    return Promise.reject(error);
  }
);

// API Error class
export class ApiError extends Error {
  constructor(message: string, public status?: number, public data?: any) {
    super(message);
    this.name = "ApiError";
  }
}

// Error handler
export const handleApiError = (error: any): string => {
  if (error.response) {
    return (
      error.response.data?.message || `Server error: ${error.response.status}`
    );
  } else if (error.request) {
    return "Network error - please check your connection";
  } else {
    return error.message || "Unknown error occurred";
  }
};

// Generic CRUD API service
export class ApiService<T extends { id: string }> {
  constructor(private endpoint: string) {}

  // GET all items
  async getAll(): Promise<T[]> {
    try {
      const response = await apiClient.get<T[]>(`/${this.endpoint}`);
      return response.data;
    } catch (error) {
      throw new ApiError(handleApiError(error));
    }
  }

  // GET single item by ID
  async getById(id: string): Promise<T> {
    try {
      const response = await apiClient.get<T>(`/${this.endpoint}/${id}`);
      return response.data;
    } catch (error) {
      throw new ApiError(handleApiError(error));
    }
  }

  // POST create new item
  async create(data: Omit<T, "id">): Promise<T> {
    try {
      const response = await apiClient.post<T>(`/${this.endpoint}`, data);
      return response.data;
    } catch (error) {
      throw new ApiError(handleApiError(error));
    }
  }

  // PATCH update item (partial update)
  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      const response = await apiClient.patch<T>(
        `/${this.endpoint}/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      throw new ApiError(handleApiError(error));
    }
  }

  // DELETE item
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/${this.endpoint}/${id}`);
    } catch (error) {
      throw new ApiError(handleApiError(error));
    }
  }

  // Search with query parameters
  async search(params: Record<string, any>): Promise<T[]> {
    try {
      const response = await apiClient.get<T[]>(`/${this.endpoint}`, {
        params,
      });
      return response.data;
    } catch (error) {
      throw new ApiError(handleApiError(error));
    }
  }

  // Bulk create
  async bulkCreate(items: Omit<T, "id">[]): Promise<T[]> {
    try {
      const promises = items.map((item) => this.create(item));
      return await Promise.all(promises);
    } catch (error) {
      throw new ApiError(handleApiError(error));
    }
  }

  // Bulk update
  async bulkUpdate(updates: { id: string; data: Partial<T> }[]): Promise<T[]> {
    try {
      const promises = updates.map(({ id, data }) => this.update(id, data));
      return await Promise.all(promises);
    } catch (error) {
      throw new ApiError(handleApiError(error));
    }
  }

  // Bulk delete
  async bulkDelete(ids: string[]): Promise<void> {
    try {
      const promises = ids.map((id) => this.delete(id));
      await Promise.all(promises);
    } catch (error) {
      throw new ApiError(handleApiError(error));
    }
  }
}

// Entity type definitions
export interface BindingAdvice {
  id: string;
  clientName: string;
  notebookSize: string;
  quantity: number;
  specifications: Record<string, any>;
  status: string;
  createdAt: string;
  updatedAt: string;
  // Additional properties used in forms
  clientContact?: string;
  clientEmail?: string;
  clientAddress?: string;
  pages?: number;
  reams?: number;
  sheets?: number;
  ratePerNotebook?: number;
  totalAmount?: number;
  advanceAmount?: number;
  balanceAmount?: number;
  deliveryDate?: string;
  notes?: string;
  lineItems?: Array<{
    id: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
}

export interface JobCard {
  id: string;
  bindingAdviceId: string;
  clientName: string;
  notebookSize: string;
  quantity: number;
  currentStage: string;
  progress: number;
  startDate: string;
  estimatedCompletion: string;
  assignedTo: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  // Additional properties
  productionStartDate?: string;
  producedQuantity?: number;
  qualityCheckStatus?: string;
  notes?: string;
  priority?: string;
  completionDate?: string;
}

export interface InventoryItem {
  id: string;
  itemName: string;
  category: string;
  subcategory: string;
  currentStock: number;
  unit: string;
  minStock: number;
  maxStock: number;
  specifications: Record<string, string | number | boolean>;
  status: string;
  createdAt: string;
  updatedAt: string;
  // Additional properties for finished products
  sellingPrice?: number;
  productionCost?: number;
  supplier?: string;
  location?: string;
  batchNumber?: string;
  expiryDate?: string;
  reservedQuantity?: number;
  availableQuantity?: number;
}

export interface Client {
  id: string;
  name: string;
  type: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: "active" | "inactive" | "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  approvedDate?: string | null;
  approvedBy?: string;
}

export interface PaperSize {
  id: string;
  name: string;
  width: number;
  height: number;
  unit: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotebookType {
  id: string;
  name: string;
  category: string;
  pages: number;
  binding: string;
  cover: string;
  ruling: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalculationRule {
  id: string;
  name: string;
  type: string;
  formula: string;
  parameters: Record<string, any>;
  status: string;
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
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  phone?: string;
  createdDate?: string;
  lastLogin?: string;
  permissions?: string[];
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  active?: boolean;
  createdDate?: string;
}

export interface SystemSettings {
  id: string;
  key: string;
  value: string;
  type: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  category?: string;
  updatedBy?: string;
  updatedDate?: string;
}

export interface Dispatch {
  id: string;
  jobCardId: string;
  clientName: string;
  items: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
  }>;
  dispatchDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  items: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  totalAmount: number;
  status: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

// API service instances
export const bindingAdviceService = new ApiService<BindingAdvice>(
  "bindingAdvices"
);
export const jobCardService = new ApiService<JobCard>("jobCards");
export const inventoryService = new ApiService<InventoryItem>("inventory");
export const clientService = new ApiService<Client>("clients");
export const paperSizeService = new ApiService<PaperSize>("paperSizes");
export const notebookTypeService = new ApiService<NotebookType>(
  "notebookTypes"
);
export const calculationRuleService = new ApiService<CalculationRule>(
  "calculationRules"
);
export const teamService = new ApiService<Team>("teams");
export const userService = new ApiService<User>("users");
export const roleService = new ApiService<Role>("roles");
export const systemSettingsService = new ApiService<SystemSettings>(
  "systemSettings"
);
export const dispatchService = new ApiService<Dispatch>("dispatches");
export const invoiceService = new ApiService<Invoice>("invoices");

// Production Plan interface and service
export interface ProductionPlan {
  id: string;
  planName: string;
  startDate: string;
  endDate: string;
  status: "draft" | "scheduled" | "in_progress" | "completed" | "paused";
  priority: "low" | "medium" | "high" | "urgent";
  totalQuantity: number;
  completedQuantity: number;
  assignedTeam: string;
  estimatedDuration: number;
  actualDuration?: number;
  jobCards: string[];
  notes: string;
  createdDate: string;
  createdBy: string;
  bindingAdviceIds: string[];
}

export const productionPlanService = new ApiService<ProductionPlan>(
  "productionPlans"
);
