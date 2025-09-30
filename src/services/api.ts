import axios, { AxiosResponse, AxiosError } from "axios";

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

// Log API configuration on startup
console.log("🔧 API Configuration:");
console.log("  Base URL:", API_BASE_URL);
console.log("  Environment:", import.meta.env.MODE);
console.log("  VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);

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
    console.log(`✅ ${response.status} ${response.config.url}`, {
      dataLength: Array.isArray(response.data) ? response.data.length : "N/A",
      data: response.data,
    });
    return response;
  },
  (error: AxiosError) => {
    console.error(`❌ API Error:`, {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
      baseURL: error.config?.baseURL,
    });

    // Show user-friendly error message
    if (
      error.code === "ERR_NETWORK" ||
      error.message.includes("Network Error")
    ) {
      console.error("🔴 NETWORK ERROR: Cannot connect to API server!");
      console.error("   Make sure JSON server is running on:", API_BASE_URL);
      console.error("   Run: npm run server");
    }

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
  // Quantity tracking
  allocatedQuantity?: number; // Total allocated to job cards
  remainingQuantity?: number; // Balance available
  jobCardAllocations?: Array<{
    jobCardId: string;
    allocatedQuantity: number;
    allocatedDate: string;
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
  // Quantity tracking
  allocatedQuantity?: number; // Total allocated from binding advice
  stageAllocatedQuantity?: number; // Total allocated to stages
  remainingQuantity?: number; // Balance available for stages
  completedQuantity?: number; // Total completed across all stages
  // Product-wise allocations (from binding advice line items)
  productAllocations?: Array<{
    productId: string;
    productName: string;
    allocatedQuantity: number;
    completedQuantity: number;
    remainingQuantity: number;
  }>;
  // Stage allocations with product-wise tracking
  stageAllocations?: Array<{
    stageKey: string;
    stageName: string;
    allocatedQuantity: number;
    completedQuantity: number;
    remainingQuantity: number;
    status: "pending" | "in_progress" | "completed";
    startDate: string | null;
    completedDate: string | null;
    canMoveNext: boolean; // True only if 100% completed
    productProgress?: Array<{
      productId: string;
      productName: string;
      completedQuantity: number;
    }>;
  }>;
  // Dispatch tracking
  dispatchedQuantity?: number; // Total dispatched
  availableForDispatch?: number; // Completed but not yet dispatched
  dispatches?: Array<{
    dispatchId: string;
    dispatchedQuantity: number;
    dispatchDate: string;
    productBreakdown?: Array<{
      productId: string;
      productName: string;
      quantity: number;
    }>;
  }>;

  // Batch tracking
  batches?: Array<{
    id: string;
    batchNumber: number;
    originalQuantity: number;
    currentStage: string;
    status: "active" | "completed" | "cancelled";
    completedQuantity: number;
    dispatchedQuantity: number;
    availableForDispatch: number;
    createdAt: string;
    completedAt: string | null;
  }>;
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
  // Product availability tracking for this client
  products?: Array<{
    productId: string;
    productName: string;
    availableQuantity: number; // Available for new job cards
    reservedQuantity: number; // Reserved in active job cards
    totalOrdered: number; // Total ever ordered
  }>;
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
  // Invoice type determines the source of data
  type: "binding_advice" | "jobcard_complete" | "dispatch_based";
  // Reference IDs based on type
  bindingAdviceId?: string;
  jobCardId?: string;
  dispatchId?: string;
  items: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  totalAmount: number;
  status: string;
  paid: boolean;
  dueDate: string;
  issuedAt: string;
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

// Production Batch interface with range-based tracking
export interface ProductionBatch {
  id: string;
  jobCardId: string;
  batchNumber: number;
  // Range-based tracking (e.g., units 1-500, 501-1000)
  range: {
    from: number;
    to: number;
  };
  quantity: number; // Calculated: to - from + 1
  productId: string;
  productName: string;
  currentStage:
    | "design"
    | "procurement"
    | "printing"
    | "cutting_binding"
    | "gathering_binding"
    | "quality"
    | "packing"
    | "completed";
  currentStageIndex: number;
  status: "active" | "completed" | "cancelled";
  // Stage assignments with team and timestamps
  stageAssignments: {
    design?: {
      teamId: string;
      teamName: string;
      startedAt: string;
      completedAt: string | null;
    };
    procurement?: {
      teamId: string;
      teamName: string;
      startedAt: string;
      completedAt: string | null;
    };
    printing?: {
      teamId: string;
      teamName: string;
      startedAt: string;
      completedAt: string | null;
    };
    cutting_binding?: {
      teamId: string;
      teamName: string;
      startedAt: string;
      completedAt: string | null;
    };
    gathering_binding?: {
      teamId: string;
      teamName: string;
      startedAt: string;
      completedAt: string | null;
    };
    quality?: {
      teamId: string;
      teamName: string;
      startedAt: string;
      completedAt: string | null;
    };
    packing?: {
      teamId: string;
      teamName: string;
      startedAt: string;
      completedAt: string | null;
    };
  };
  completed: boolean;
  dispatchedQuantity: number;
  availableForDispatch: number;
  notes?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  completedAt: string | null;
}

export const productionBatchService = new ApiService<ProductionBatch>(
  "productionBatches"
);
