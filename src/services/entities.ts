import { AxiosCrudService } from "./axiosApi";

// Type definitions (moved from hooks)
export interface BindingAdvice {
  id: string;
  clientName: string;
  clientContact: string;
  clientEmail: string;
  clientAddress: string;
  notebookSize: string;
  pages: number;
  quantity: number;
  reams: number;
  sheets: number;
  ratePerNotebook: number;
  totalAmount: number;
  status: "draft" | "sent" | "approved" | "rejected";
  createdDate: string;
  createdBy: string;
  approvedDate: string | null;
  notes: string;
  lineItems?: Array<{
    id: string;
    description: string;
    pages: number;
    quantity: number;
    reams: number;
    sheets: number;
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
  stages: Array<{
    name: string;
    status: string;
    startDate: string;
    completedDate: string | null;
    assignedTo: string;
  }>;
  materials: Array<{
    itemId: string;
    itemName: string;
    requiredQuantity: number;
    allocatedQuantity: number;
    consumedQuantity: number;
  }>;
  productionStartDate?: string;
  producedQuantity?: number;
  qualityNotes?: string;
  completionDate?: string;
  stageNotes?: string;
  lastUpdated?: string;
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
  reelNumber: string;
  weight: string;
  supplier: string;
  supplierContact: string;
  costPerUnit: number;
  lastUpdated: string;
  status: string;
  location: string;
  purchaseHistory: Array<{
    date: string;
    quantity: number;
    rate: number;
    supplier: string;
  }>;
  productionCost?: number;
  sellingPrice?: number;
  lastProduced?: string;
  productionHistory?: Array<{
    date: string;
    quantity: number;
    jobCardId: string;
    productionCost: number;
  }>;
  reservations?: Array<{
    bindingAdviceId: string;
    quantity: number;
    date: string;
    status: "reserved" | "consumed" | "released";
  }>;
  consumptionHistory?: Array<{
    date: string;
    quantity: number;
    bindingAdviceId: string;
    type: "production" | "adjustment" | "waste";
  }>;
}

export interface Dispatch {
  id: string;
  jobCardId: string;
  clientName: string;
  deliveryLocation: string;
  deliveryAddress: string;
  quantity: number;
  notebookSize: string;
  scheduledDate: string;
  status: string;
  transporter: string;
  transporterContact: string;
  vehicleNumber: string;
  driverName: string;
  driverContact: string;
  estimatedDelivery: string;
  actualDelivery: string | null;
  totalCartons: number;
  deliveryValue: number;
  challanNumber: string;
  notes: string;
  multipleLocations?: Array<{
    locationId: string;
    locationName: string;
    address: string;
    contactPerson: string;
    contactNumber: string;
    quantity: number;
    cartons: number;
    deliveryInstructions: string;
    deliveryTime: string;
    status: "pending" | "in_transit" | "delivered";
  }>;
}

export interface Invoice {
  id: string;
  clientName: string;
  clientContact: string;
  clientEmail: string;
  clientAddress: string;
  dispatchId: string;
  bindingAdviceId: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  invoiceDate: string;
  dueDate: string;
  status: string;
  paymentDate: string | null;
  paymentMethod: string | null;
  paymentReference: string | null;
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  notes: string;
}

export interface Client {
  id: string;
  name: string;
  type: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  gstNumber: string;
  paymentTerms: string;
  creditLimit: number;
  status: "active" | "inactive" | "pending" | "approved" | "rejected";
  registrationDate: string;
  approvedDate?: string | null;
  approvedBy?: string;
}

export interface PaperSize {
  id: string;
  name: string;
  dimensions: string;
  type: string;
  sheetsPerReem: number;
  active: boolean;
  createdDate?: string;
  description?: string; // Added optional description field to match new format
}

export interface NotebookType {
  id: string;
  name: string;
  category: string;
  paperSize: string;
  pages: number; // Changed from standardPages to pages to match new format
  pagesPerSheet: number;
  steps: string | number; // Allow both string and number for steps
  active: boolean;
  createdDate?: string;
  description?: string; // Added optional description field
}

export interface CalculationRule {
  id: string;
  name: string;
  type: string;
  formula: Record<string, string>;
  variables?: Record<string, string | number | boolean>;
  paperSize?: string;
  active: boolean;
  createdDate: string;
}

export interface Team {
  id: string;
  teamName: string;
  teamType: string;
  department: string;
  teamLead: string;
  teamLeadContact: string;
  teamLeadEmail: string;
  members: Array<{
    id: string;
    name: string;
    role: string;
    contact: string;
    email: string;
    experience: string;
    skills: string[];
  }>;
  capacity: {
    maxOrdersPerDay: number;
    maxQuantityPerDay: number;
    specializations: string[];
  };
  workingHours: {
    startTime: string;
    endTime: string;
    breakTime: string;
    workingDays: string[];
  };
  equipment: string[];
  status: string;
  createdDate: string;
  lastUpdated: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  phone: string;
  status: string;
  createdDate: string;
  lastLogin: string;
  permissions: string[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  active: boolean;
  createdDate: string;
}

export interface SystemSettings {
  id: string;
  category: string;
  key: string;
  value: string;
  description: string;
  type: string;
  updatedBy: string;
  updatedDate: string;
}

// Service instances
export const bindingAdviceService = new AxiosCrudService<BindingAdvice>(
  "/bindingAdvices"
);
export const jobCardService = new AxiosCrudService<JobCard>("/jobCards");
export const inventoryService = new AxiosCrudService<InventoryItem>(
  "/inventory"
);
export const dispatchService = new AxiosCrudService<Dispatch>("/dispatches");
export const invoiceService = new AxiosCrudService<Invoice>("/invoices");
export const clientService = new AxiosCrudService<Client>("/clients");
export const paperSizeService = new AxiosCrudService<PaperSize>("/paperSizes");
export const notebookTypeService = new AxiosCrudService<NotebookType>(
  "/notebookTypes"
);
export const calculationRuleService = new AxiosCrudService<CalculationRule>(
  "/calculationRules"
);
export const teamService = new AxiosCrudService<Team>("/teams");
export const userService = new AxiosCrudService<User>("/users");
export const roleService = new AxiosCrudService<Role>("/roles");
export const systemSettingsService = new AxiosCrudService<SystemSettings>(
  "/systemSettings"
);
