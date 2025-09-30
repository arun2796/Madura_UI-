/**
 * Quantity Management Types
 * Tracks quantity allocation from Binding Advice → Job Cards → Production Stages
 */

// Binding Advice Quantity Tracking
export interface BindingAdviceQuantity {
  bindingAdviceId: string;
  totalQuantity: number;
  allocatedToJobCards: number;
  remainingBalance: number;
  jobCardAllocations: JobCardAllocation[];
}

// Job Card Allocation from Binding Advice
export interface JobCardAllocation {
  jobCardId: string;
  allocatedQuantity: number;
  allocatedDate: string;
  status: "active" | "completed" | "cancelled";
}

// Job Card Quantity Tracking
export interface JobCardQuantity {
  jobCardId: string;
  bindingAdviceId: string;
  totalAllocated: number;
  allocatedToStages: number;
  remainingBalance: number;
  stageAllocations: StageAllocation[];
}

// Stage Allocation from Job Card
export interface StageAllocation {
  stageKey: string;
  stageName: string;
  allocatedQuantity: number;
  completedQuantity: number;
  remainingQuantity: number;
  startDate: string | null;
  completedDate: string | null;
  status: "pending" | "in_progress" | "completed";
}

// Quantity Summary for Display
export interface QuantitySummary {
  level: "binding_advice" | "job_card" | "stage";
  totalQuantity: number;
  allocated: number;
  completed: number;
  remaining: number;
  percentage: number;
}

// Quantity Validation Result
export interface QuantityValidation {
  isValid: boolean;
  message: string;
  maxAllowed: number;
  requested: number;
}

// Helper functions for quantity calculations
export const calculateBindingAdviceBalance = (
  totalQuantity: number,
  jobCardAllocations: JobCardAllocation[]
): number => {
  const allocated = jobCardAllocations
    .filter((alloc) => alloc.status === "active" || alloc.status === "completed")
    .reduce((sum, alloc) => sum + alloc.allocatedQuantity, 0);
  return totalQuantity - allocated;
};

export const calculateJobCardBalance = (
  totalAllocated: number,
  stageAllocations: StageAllocation[]
): number => {
  const allocated = stageAllocations.reduce(
    (sum, alloc) => sum + alloc.allocatedQuantity,
    0
  );
  return totalAllocated - allocated;
};

export const calculateStageBalance = (
  allocatedQuantity: number,
  completedQuantity: number
): number => {
  return allocatedQuantity - completedQuantity;
};

export const validateQuantityAllocation = (
  requested: number,
  available: number,
  level: string
): QuantityValidation => {
  if (requested <= 0) {
    return {
      isValid: false,
      message: "Quantity must be greater than 0",
      maxAllowed: available,
      requested,
    };
  }

  if (requested > available) {
    return {
      isValid: false,
      message: `Requested quantity (${requested}) exceeds available balance (${available})`,
      maxAllowed: available,
      requested,
    };
  }

  return {
    isValid: true,
    message: "Quantity allocation is valid",
    maxAllowed: available,
    requested,
  };
};

export const calculatePercentage = (part: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
};

// Get quantity summary for a binding advice
export const getBindingAdviceSummary = (
  bindingAdviceQty: BindingAdviceQuantity
): QuantitySummary => {
  const completed = bindingAdviceQty.jobCardAllocations
    .filter((alloc) => alloc.status === "completed")
    .reduce((sum, alloc) => sum + alloc.allocatedQuantity, 0);

  return {
    level: "binding_advice",
    totalQuantity: bindingAdviceQty.totalQuantity,
    allocated: bindingAdviceQty.allocatedToJobCards,
    completed,
    remaining: bindingAdviceQty.remainingBalance,
    percentage: calculatePercentage(
      bindingAdviceQty.allocatedToJobCards,
      bindingAdviceQty.totalQuantity
    ),
  };
};

// Get quantity summary for a job card
export const getJobCardSummary = (
  jobCardQty: JobCardQuantity
): QuantitySummary => {
  const completed = jobCardQty.stageAllocations
    .filter((alloc) => alloc.status === "completed")
    .reduce((sum, alloc) => sum + alloc.completedQuantity, 0);

  return {
    level: "job_card",
    totalQuantity: jobCardQty.totalAllocated,
    allocated: jobCardQty.allocatedToStages,
    completed,
    remaining: jobCardQty.remainingBalance,
    percentage: calculatePercentage(
      jobCardQty.allocatedToStages,
      jobCardQty.totalAllocated
    ),
  };
};

// Get quantity summary for a stage
export const getStageSummary = (
  stageAlloc: StageAllocation
): QuantitySummary => {
  return {
    level: "stage",
    totalQuantity: stageAlloc.allocatedQuantity,
    allocated: stageAlloc.allocatedQuantity,
    completed: stageAlloc.completedQuantity,
    remaining: stageAlloc.remainingQuantity,
    percentage: calculatePercentage(
      stageAlloc.completedQuantity,
      stageAlloc.allocatedQuantity
    ),
  };
};

