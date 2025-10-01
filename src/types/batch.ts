/**
 * Production Batch Types
 * Manages sub-quantities from job cards through production stages
 */

export interface ProductionBatch {
  id: string;
  jobCardId: string;
  batchNumber: number;
  originalQuantity: number;
  currentStage: string;
  currentStageIndex: number;
  status: "active" | "completed" | "cancelled";
  createdAt: string;
  completedAt: string | null;
  createdBy: string;
  
  // Stage progress for this batch
  stageProgress: {
    [stageKey: string]: {
      allocatedQuantity: number;
      completedQuantity: number;
      remainingQuantity: number;
      status: "pending" | "in_progress" | "completed";
      startDate: string | null;
      completedDate: string | null;
      canMoveNext: boolean;
    };
  };
  
  // Product breakdown within this batch
  products: Array<{
    productId: string;
    productName: string;
    quantity: number;
    completedQuantity: number;
  }>;
  
  // Dispatch tracking
  dispatchedQuantity: number;
  availableForDispatch: number;
  
  // Notes and metadata
  notes?: string;
  updatedAt: string;
}

export interface BatchCreationRequest {
  jobCardId: string;
  quantity: number;
  products: Array<{
    productId: string;
    productName: string;
    quantity: number;
  }>;
  notes?: string;
}

export interface BatchSummary {
  totalBatches: number;
  activeBatches: number;
  completedBatches: number;
  totalQuantity: number;
  completedQuantity: number;
  remainingQuantity: number;
}

