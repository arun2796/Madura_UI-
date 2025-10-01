import React, { useState } from "react";
import {
  ArrowLeft,
  Save,
  CheckCircle,
  Clock,
  Users,
  Package,
  FileText,
  ChevronRight,
  AlertCircle,
  Layers,
  Plus,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { DEFAULT_PRODUCTION_STAGES } from "../components/ProductionStageWizard";
import { useJobCard, useUpdateJobCard } from "../hooks/useApiQueries";
import {
  useBindingAdvice,
  useUpdateBindingAdvice,
} from "../hooks/useApiQueries";
import { useBatchesByJobCard, useUpdateBatch } from "../hooks/useBatchQueries";
import {
  formatRange,
  calculateQuantityFromRange,
} from "../utils/batchRangeValidation";
import BatchCreationModalRange from "../components/BatchCreationModalRange";

export interface StageProgress {
  stageKey: string;
  stageName: string;
  allocatedQuantity: number;
  completedQuantity: number;
  remainingQuantity: number;
  status: "pending" | "in_progress" | "completed";
  canMoveNext: boolean;
  productProgress?: Array<{
    productId: string;
    productName: string;
    completedQuantity: number;
  }>;
}

const ProductionStageFlow: React.FC = () => {
  const navigate = useNavigate();
  const { jobCardId } = useParams<{ jobCardId: string }>();

  // Fetch job card data
  const { data: jobCard, isLoading } = useJobCard(jobCardId || "");
  const updateJobCard = useUpdateJobCard();

  // Fetch binding advice data
  const { data: bindingAdvice } = useBindingAdvice(
    jobCard?.bindingAdviceId || ""
  );
  const updateBindingAdvice = useUpdateBindingAdvice();

  // Fetch batches for this job card
  const { data: batches = [], isLoading: batchesLoading } = useBatchesByJobCard(
    jobCardId || ""
  );
  const updateBatch = useUpdateBatch();

  // Local state for stage management
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [stageNotes, setStageNotes] = useState<Record<string, string>>({});
  const [assignedTeam, setAssignedTeam] = useState(
    jobCard?.assignedTo || "Production Team A"
  );
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchCompletedQuantity, setBatchCompletedQuantity] =
    useState<number>(0);

  // Stage progress data
  const [stageProgressData, setStageProgressData] = useState<StageProgress[]>(
    []
  );

  // Get selected batch
  const selectedBatch = batches.find((b) => b.id === selectedBatchId);

  // Debug: Log batches on load
  React.useEffect(() => {
    if (batches.length > 0) {
      console.log("Loaded batches:", batches);
      console.log("Selected batch ID:", selectedBatchId);
      console.log("Selected batch:", selectedBatch);
    }
  }, [batches, selectedBatchId, selectedBatch]);

  // Auto-select first active batch if none selected
  React.useEffect(() => {
    if (!selectedBatchId && batches.length > 0) {
      const firstActiveBatch = batches.find((b) => b.status === "active");
      if (firstActiveBatch) {
        console.log(
          "🎯 Auto-selecting first active batch:",
          firstActiveBatch.batchNumber,
          "Stage:",
          firstActiveBatch.currentStageIndex
        );
        setSelectedBatchId(firstActiveBatch.id);
        // Initialize stage index from first batch
        setCurrentStageIndex(firstActiveBatch.currentStageIndex || 0);
      }
    }
  }, [batches, selectedBatchId]);

  // Sync current stage index with selected batch
  React.useEffect(() => {
    if (selectedBatch) {
      const stageName =
        DEFAULT_PRODUCTION_STAGES[selectedBatch.currentStageIndex || 0]
          ?.label || "Unknown";
      console.log(
        "🔄 Syncing batch:",
        selectedBatch.batchNumber,
        "→ Stage:",
        selectedBatch.currentStageIndex,
        `(${stageName})`
      );
      setCurrentStageIndex(selectedBatch.currentStageIndex || 0);
      setBatchCompletedQuantity(0); // Reset quantity when switching batches
    }
  }, [selectedBatch]);

  // Initialize stage progress data from job card
  const initializeStageProgress = React.useCallback(() => {
    if (!jobCard) return [];

    const existingAllocations = jobCard.stageAllocations || [];
    const totalJobCardQuantity = jobCard.quantity || 0;

    // If no existing allocations, initialize first stage with total quantity
    const hasExistingAllocations = existingAllocations.length > 0;

    return DEFAULT_PRODUCTION_STAGES.map((stage, index) => {
      const existing = existingAllocations.find(
        (a) => a.stageKey === stage.key
      );

      // For first stage (Design), allocate total quantity if no existing allocations
      let allocatedQty = existing?.allocatedQuantity || 0;
      if (!hasExistingAllocations && index === 0) {
        allocatedQty = totalJobCardQuantity;
      }

      const completedQty = existing?.completedQuantity || 0;
      const remainingQty = allocatedQty - completedQty;
      const canMoveNext = completedQty === allocatedQty && allocatedQty > 0;

      return {
        stageKey: stage.key,
        stageName: stage.label,
        allocatedQuantity: allocatedQty,
        completedQuantity: completedQty,
        remainingQuantity: remainingQty,
        status:
          completedQty === allocatedQty && allocatedQty > 0
            ? ("completed" as const)
            : allocatedQty > 0
            ? ("in_progress" as const)
            : ("pending" as const),
        canMoveNext,
        productProgress: existing?.productProgress || [],
      };
    });
  }, [jobCard]);

  // Get current stage key
  const getCurrentStageKey = () => {
    return DEFAULT_PRODUCTION_STAGES[currentStageIndex]?.key || "designing";
  };

  // Check if can move to next stage
  const canMoveToNextStage = () => {
    const currentProgress = stageProgressData[currentStageIndex];
    if (!currentProgress) return false;
    return currentProgress.canMoveNext;
  };

  // Update local state when job card loads
  React.useEffect(() => {
    if (jobCard) {
      setAssignedTeam(jobCard.assignedTo);

      // Initialize stage progress
      const progress = initializeStageProgress();
      setStageProgressData(progress);

      // Find current stage index (first non-completed stage)
      const currentIndex = progress.findIndex((s) => s.status !== "completed");
      setCurrentStageIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  }, [jobCard, initializeStageProgress]);

  const handleNextStage = () => {
    if (
      canMoveToNextStage() &&
      currentStageIndex < DEFAULT_PRODUCTION_STAGES.length - 1
    ) {
      // Allocate completed quantity from current stage to next stage
      setStageProgressData((prev) => {
        const updated = [...prev];
        const currentStage = updated[currentStageIndex];
        const nextStage = updated[currentStageIndex + 1];

        if (currentStage && nextStage && currentStage.completedQuantity > 0) {
          // Transfer completed quantity to next stage
          nextStage.allocatedQuantity = currentStage.completedQuantity;
          nextStage.remainingQuantity = currentStage.completedQuantity;
          nextStage.status = "in_progress";
        }

        return updated;
      });

      setCurrentStageIndex(currentStageIndex + 1);
    }
  };

  // Handle batch stage progression
  const handleBatchStageProgress = async (
    completedQuantity: number,
    moveToNextStage: boolean = false
  ) => {
    if (!selectedBatch || !selectedBatchId) {
      alert("Please select a batch first");
      return;
    }

    const currentStageKey = getCurrentStageKey();
    const isStageComplete = completedQuantity >= selectedBatch.quantity;

    // Enforce 100% completion before moving to next stage
    if (moveToNextStage && !isStageComplete) {
      alert(
        `Cannot move to next stage. Current stage must be 100% complete.\nCompleted: ${completedQuantity}/${selectedBatch.quantity}`
      );
      return;
    }

    // Update stage assignments
    const updatedStageAssignments = {
      ...selectedBatch.stageAssignments,
      [currentStageKey]: {
        ...selectedBatch.stageAssignments[currentStageKey],
        completedAt: isStageComplete ? new Date().toISOString() : null,
      },
    };

    // Determine next stage
    let nextStage = selectedBatch.currentStage;
    let nextStageIndex = currentStageIndex;
    let batchCompleted = false;

    if (moveToNextStage && isStageComplete) {
      if (currentStageIndex < DEFAULT_PRODUCTION_STAGES.length - 1) {
        nextStageIndex = currentStageIndex + 1;
        nextStage = DEFAULT_PRODUCTION_STAGES[nextStageIndex].key as any;

        // Initialize next stage assignment
        updatedStageAssignments[nextStage] = {
          teamId: assignedTeam,
          teamName: assignedTeam,
          startedAt: new Date().toISOString(),
          completedAt: null,
        };
      } else {
        // All stages completed
        nextStage = "completed" as any;
        batchCompleted = true;
      }
    }

    try {
      // Update batch
      await updateBatch.mutateAsync({
        id: selectedBatchId,
        data: {
          currentStage: nextStage,
          currentStageIndex: nextStageIndex,
          stageAssignments: updatedStageAssignments,
          completed: batchCompleted,
          status: batchCompleted ? "completed" : "active",
          updatedAt: new Date().toISOString(),
          completedAt: batchCompleted ? new Date().toISOString() : null,
          availableForDispatch: batchCompleted ? selectedBatch.quantity : 0,
        },
      });

      // If batch completed, update inventory
      if (batchCompleted) {
        await updateInventoryOnBatchComplete(selectedBatch);
      }

      // Move to next stage in UI
      if (moveToNextStage && !batchCompleted) {
        setCurrentStageIndex(nextStageIndex);
      }

      alert(
        batchCompleted
          ? "Batch completed! Inventory updated."
          : moveToNextStage
          ? "Moved to next stage successfully!"
          : "Progress saved successfully!"
      );
    } catch (error) {
      console.error("Failed to update batch:", error);
      alert("Failed to update batch. Please try again.");
    }
  };

  // Update inventory when batch completes all stages
  const updateInventoryOnBatchComplete = async (batch: any) => {
    try {
      // Find inventory item for this product
      const inventoryResponse = await fetch(
        `http://localhost:3002/inventory?itemName=${encodeURIComponent(
          batch.productName
        )}`
      );
      const inventoryItems = await inventoryResponse.json();

      if (inventoryItems.length > 0) {
        // Update existing inventory item
        const item = inventoryItems[0];
        await fetch(`http://localhost:3002/inventory/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentStock: item.currentStock + batch.quantity,
            availableQuantity: (item.availableQuantity || 0) + batch.quantity,
            updatedAt: new Date().toISOString(),
          }),
        });
      } else {
        // Create new inventory item
        await fetch("http://localhost:3002/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemName: batch.productName,
            category: "finished_product",
            subcategory: "notebooks",
            currentStock: batch.quantity,
            availableQuantity: batch.quantity,
            minStockLevel: 100,
            maxStockLevel: 10000,
            reorderPoint: 500,
            unit: "pieces",
            location: "Finished Goods Warehouse",
            lastRestocked: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        });
      }

      console.log(`Inventory updated: +${batch.quantity} ${batch.productName}`);
    } catch (error) {
      console.error("Failed to update inventory:", error);
    }
  };

  const handleSaveProgress = () => {
    if (!jobCardId || !jobCard) return;

    const currentStageKey = getCurrentStageKey();
    const completedStagesCount = stageProgressData.filter(
      (s) => s.status === "completed"
    ).length;
    const progress = Math.round(
      (completedStagesCount / DEFAULT_PRODUCTION_STAGES.length) * 100
    );

    // Build stage allocations with enhanced tracking
    const stageAllocations = stageProgressData.map((stage) => ({
      stageKey: stage.stageKey,
      stageName: stage.stageName,
      allocatedQuantity: stage.allocatedQuantity,
      completedQuantity: stage.completedQuantity,
      remainingQuantity: stage.remainingQuantity,
      status: stage.status,
      startDate:
        stage.status !== "pending"
          ? new Date().toISOString().split("T")[0]
          : null,
      completedDate:
        stage.status === "completed"
          ? new Date().toISOString().split("T")[0]
          : null,
      canMoveNext: stage.canMoveNext,
      productProgress: stage.productProgress,
    }));

    const totalCompleted = stageProgressData.reduce(
      (sum, s) => sum + s.completedQuantity,
      0
    );
    const totalRemaining = jobCard.quantity - totalCompleted;

    // Calculate available for dispatch (only fully completed products)
    const allStagesCompleted = stageProgressData.every(
      (s) => s.status === "completed"
    );
    const availableForDispatch = allStagesCompleted ? totalCompleted : 0;

    updateJobCard.mutate(
      {
        id: jobCardId,
        data: {
          currentStage: currentStageKey,
          progress,
          assignedTo: assignedTeam,
          updatedAt: new Date().toISOString(),
          completedQuantity: totalCompleted,
          remainingQuantity: totalRemaining,
          availableForDispatch,
          stageAllocations,
          status: allStagesCompleted ? "completed" : "active",
        },
      },
      {
        onSuccess: () => {
          // Update binding advice if all stages are completed
          if (allStagesCompleted && jobCard?.bindingAdviceId && bindingAdvice) {
            const currentAllocated = bindingAdvice.allocatedQuantity || 0;
            const currentRemaining =
              bindingAdvice.remainingQuantity || bindingAdvice.quantity || 0;

            updateBindingAdvice.mutate(
              {
                id: jobCard.bindingAdviceId,
                data: {
                  allocatedQuantity: currentAllocated + totalCompleted,
                  remainingQuantity: currentRemaining - totalCompleted,
                  status:
                    currentRemaining - totalCompleted <= 0
                      ? "completed"
                      : bindingAdvice.status,
                  updatedAt: new Date().toISOString(),
                },
              },
              {
                onSuccess: () => {
                  console.log("Binding advice updated successfully");
                },
                onError: (error) => {
                  console.error("Failed to update binding advice:", error);
                },
              }
            );
          }
        },
        onError: (error) => {
          console.error("Failed to save progress:", error);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job card...</p>
        </div>
      </div>
    );
  }

  if (!jobCard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">Job card not found</p>
          <button
            onClick={() => navigate("/job-cards")}
            className="text-blue-600 hover:underline"
          >
            Return to Job Cards
          </button>
        </div>
      </div>
    );
  }

  const currentStageKey = getCurrentStageKey();
  const currentStageData = DEFAULT_PRODUCTION_STAGES[currentStageIndex];
  const currentProgress = stageProgressData[currentStageIndex];

  const totalCompleted = stageProgressData.reduce(
    (sum, s) => sum + s.completedQuantity,
    0
  );
  const totalRemaining = jobCard ? jobCard.quantity - totalCompleted : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/job-cards")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Job Cards
          </button>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Production Stage Management
                </h1>
                <p className="text-gray-600">
                  Job Card: <span className="font-semibold">{jobCard.id}</span>
                </p>
                <p className="text-gray-600">
                  Client:{" "}
                  <span className="font-semibold">{jobCard.clientName}</span>
                </p>
              </div>
              <button
                onClick={handleSaveProgress}
                disabled={updateJobCard.isPending}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-5 w-5" />
                <span>
                  {updateJobCard.isPending ? "Saving..." : "Save Progress"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Batch Selector */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Layers className="h-6 w-6 text-white" />
              <h2 className="text-xl font-semibold text-white">
                Production Batches
              </h2>
            </div>
            <div className="flex items-center space-x-3">
              {batches.length > 0 && (
                <div className="text-white text-sm">
                  {batches.length} batch{batches.length !== 1 ? "es" : ""}{" "}
                  available
                </div>
              )}
              <button
                onClick={() => setShowBatchModal(true)}
                className="flex items-center space-x-2 bg-white text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors duration-200 font-medium"
              >
                <Plus className="h-5 w-5" />
                <span>Create Batch</span>
              </button>
            </div>
          </div>

          {batches.length === 0 ? (
            <div className="mt-4 bg-purple-500 bg-opacity-20 border-2 border-purple-300 rounded-lg p-8 text-center">
              <Layers className="h-12 w-12 text-white mx-auto mb-3 opacity-50" />
              <p className="text-white text-lg font-medium mb-2">
                No batches created yet
              </p>
              <p className="text-purple-100 text-sm mb-4">
                Create batches to start production tracking with range-based
                management
              </p>
              <button
                onClick={() => setShowBatchModal(true)}
                className="inline-flex items-center space-x-2 bg-white text-purple-700 px-6 py-3 rounded-lg hover:bg-purple-50 transition-colors duration-200 font-medium"
              >
                <Plus className="h-5 w-5" />
                <span>Create First Batch</span>
              </button>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {batches.map((batch) => (
                <button
                  key={batch.id}
                  onClick={() => setSelectedBatchId(batch.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    selectedBatchId === batch.id
                      ? "bg-white border-white shadow-lg"
                      : "bg-purple-500 bg-opacity-20 border-purple-300 hover:bg-opacity-30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`font-semibold ${
                        selectedBatchId === batch.id
                          ? "text-purple-900"
                          : "text-white"
                      }`}
                    >
                      Batch #{batch.batchNumber}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        batch.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : batch.status === "active"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {batch.status}
                    </span>
                  </div>
                  <div
                    className={`text-sm ${
                      selectedBatchId === batch.id
                        ? "text-purple-700"
                        : "text-purple-100"
                    }`}
                  >
                    <p>Range: {formatRange(batch.range)}</p>
                    <p>Quantity: {batch.quantity} units</p>
                    <p className="capitalize">
                      Stage: {batch.currentStage.replace(/_/g, " ")}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Job Card Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Quantity</p>
                <p className="text-xl font-bold text-gray-900">
                  {jobCard.quantity}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-xl font-bold text-green-600">
                  {totalCompleted}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Remaining</p>
                <p className="text-xl font-bold text-orange-600">
                  {totalRemaining}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-xl font-bold text-purple-600">
                  {jobCard.progress}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quantity Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">
                Total Allocated
              </h3>
              <Package className="h-5 w-5 opacity-75" />
            </div>
            <p className="text-3xl font-bold">{jobCard.quantity}</p>
            <p className="text-xs opacity-75 mt-1">From Binding Advice</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Completed</h3>
              <CheckCircle className="h-5 w-5 opacity-75" />
            </div>
            <p className="text-3xl font-bold">{totalCompleted}</p>
            <p className="text-xs opacity-75 mt-1">
              {Math.round((totalCompleted / jobCard.quantity) * 100)}% Complete
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Remaining</h3>
              <Clock className="h-5 w-5 opacity-75" />
            </div>
            <p className="text-3xl font-bold">{totalRemaining}</p>
            <p className="text-xs opacity-75 mt-1">
              {stageProgressData.filter((s) => s.status === "completed").length}{" "}
              of {DEFAULT_PRODUCTION_STAGES.length} stages done
            </p>
          </div>
        </div>

        {/* Current Stage Display (Read-Only) */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Current Stage: {currentStageData?.label}
                </h2>
                <p className="text-sm text-blue-100 mt-1">
                  Stage {currentStageIndex + 1} of{" "}
                  {DEFAULT_PRODUCTION_STAGES.length}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {/* Stage indicator badge */}
                <div className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg border border-white border-opacity-30">
                  <span className="font-semibold">
                    {currentStageData?.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stage Progress Timeline */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between">
              {DEFAULT_PRODUCTION_STAGES.map((stage, index) => {
                const isCompleted = index < currentStageIndex;
                const isCurrent = index === currentStageIndex;
                const isPending = index > currentStageIndex;

                return (
                  <div key={stage.key} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                          isCompleted
                            ? "bg-green-500 text-white"
                            : isCurrent
                            ? "bg-blue-600 text-white ring-4 ring-blue-200"
                            : "bg-gray-300 text-gray-600"
                        }`}
                      >
                        {isCompleted ? "✓" : index + 1}
                      </div>
                      <span
                        className={`text-xs mt-2 font-medium ${
                          isCurrent ? "text-blue-700" : "text-gray-600"
                        }`}
                      >
                        {stage.label}
                      </span>
                    </div>
                    {index < DEFAULT_PRODUCTION_STAGES.length - 1 && (
                      <div
                        className={`w-12 h-1 mx-2 ${
                          isCompleted ? "bg-green-500" : "bg-gray-300"
                        }`}
                      ></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Old dropdown removed - Stage is now controlled by batch progress */}
          <div className="px-6 py-3 bg-blue-50 border-t border-blue-100">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Note:</span> Stage progression is
              automatic. Complete the current stage to move to the next one.
            </p>
          </div>
        </div>

        {/* Stage Progress Summary - OLD SYSTEM (Keep for reference) */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Allocated</p>
                <p className="text-2xl font-bold text-blue-600">
                  {currentProgress?.allocatedQuantity || 0}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {currentProgress?.completedQuantity || 0}
                </p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Remaining</p>
                <p className="text-2xl font-bold text-orange-600">
                  {currentProgress?.remainingQuantity || 0}
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Progress</p>
                <p className="text-2xl font-bold text-purple-600">
                  {currentProgress?.allocatedQuantity > 0
                    ? Math.round(
                        (currentProgress.completedQuantity /
                          currentProgress.allocatedQuantity) *
                          100
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Stage Completion
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {currentProgress?.completedQuantity || 0} /{" "}
                  {currentProgress?.allocatedQuantity || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    currentProgress?.canMoveNext
                      ? "bg-green-500"
                      : "bg-blue-500"
                  }`}
                  style={{
                    width: `${
                      currentProgress?.allocatedQuantity > 0
                        ? (currentProgress.completedQuantity /
                            currentProgress.allocatedQuantity) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Stage Status Message */}
            {currentProgress && !currentProgress.canMoveNext && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-900">
                      Complete this stage to proceed
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      You must complete all {currentProgress.allocatedQuantity}{" "}
                      units before moving to the next stage. Currently
                      completed: {currentProgress.completedQuantity} units.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentProgress && currentProgress.canMoveNext && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-900">
                      Stage completed successfully!
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      All {currentProgress.allocatedQuantity} units have been
                      completed. You can now move to the next stage.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Current Stage Details */}
        <div className="space-y-6">
          {/* Current Stage Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Current Stage: {currentStageData?.label}
              </h3>
              {currentProgress?.status === "completed" && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  ✅ Completed
                </span>
              )}
            </div>

            {/* Stage Status Alert */}
            {currentProgress && !currentProgress.canMoveNext && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-yellow-900">
                    Complete this stage to proceed
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    You must complete all {currentProgress.allocatedQuantity}{" "}
                    units before moving to the next stage. Currently completed:{" "}
                    {currentProgress.completedQuantity} units.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Batch-Based Stage Completion */}
              {selectedBatch ? (
                <div className="border border-purple-200 bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-3 flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>
                      Complete {currentStageData?.label} Stage for Batch #
                      {selectedBatch.batchNumber}
                    </span>
                  </h4>

                  <div className="bg-white rounded-lg p-4 border border-purple-200 space-y-4">
                    {/* Batch Info */}
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200">
                      <div>
                        <p className="text-sm text-gray-600">Batch Range</p>
                        <p className="font-semibold text-gray-900">
                          {formatRange(selectedBatch.range)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Quantity</p>
                        <p className="font-semibold text-gray-900">
                          {selectedBatch.quantity} units
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Product</p>
                        <p className="font-semibold text-gray-900">
                          {selectedBatch.productName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Current Stage</p>
                        <p className="font-semibold text-purple-700 capitalize">
                          {selectedBatch.currentStage.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Completed Quantity for {currentStageData?.label}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={selectedBatch.quantity}
                        value={batchCompletedQuantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          if (value <= selectedBatch.quantity) {
                            setBatchCompletedQuantity(value);
                          }
                        }}
                        placeholder={`Enter quantity (0-${selectedBatch.quantity})`}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg font-semibold"
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        Enter the number of units completed for this stage. Must
                        be {selectedBatch.quantity} to move to next stage.
                      </p>
                    </div>

                    {/* Progress Indicator */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Completion Progress
                        </span>
                        <span className="text-sm font-semibold text-purple-700">
                          {batchCompletedQuantity} / {selectedBatch.quantity} (
                          {Math.round(
                            (batchCompletedQuantity / selectedBatch.quantity) *
                              100
                          )}
                          %)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            batchCompletedQuantity === selectedBatch.quantity
                              ? "bg-green-500"
                              : "bg-purple-500"
                          }`}
                          style={{
                            width: `${
                              (batchCompletedQuantity /
                                selectedBatch.quantity) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Completion Status */}
                    {batchCompletedQuantity === selectedBatch.quantity ? (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-green-900">
                            Stage 100% Complete!
                          </p>
                          <p className="text-xs text-green-700 mt-1">
                            You can now move to the next stage.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-yellow-900">
                            Complete all units to proceed
                          </p>
                          <p className="text-xs text-yellow-700 mt-1">
                            Remaining:{" "}
                            {selectedBatch.quantity - batchCompletedQuantity}{" "}
                            units
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() =>
                        handleBatchStageProgress(batchCompletedQuantity, true)
                      }
                      disabled={
                        batchCompletedQuantity !== selectedBatch.quantity
                      }
                      className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors duration-200 ${
                        batchCompletedQuantity === selectedBatch.quantity
                          ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <CheckCircle className="h-5 w-5" />
                      <span>
                        Complete {currentStageData?.label} & Move to Next Stage
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border border-gray-200 bg-gray-50 rounded-lg p-8 text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">
                    Please select a batch to start production
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Select a batch from the purple section above
                  </p>
                </div>
              )}

              {/* Assigned Team */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline h-4 w-4 mr-1" />
                  Assigned Team
                </label>
                <select
                  value={assignedTeam}
                  onChange={(e) => setAssignedTeam(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Production Team A">Production Team A</option>
                  <option value="Production Team B">Production Team B</option>
                  <option value="Design Team">Design Team</option>
                  <option value="Procurement Team">Procurement Team</option>
                  <option value="Cutting Team">Cutting Team</option>
                  <option value="Binding Team">Binding Team</option>
                  <option value="Quality Team">Quality Team</option>
                  <option value="Packing Team">Packing Team</option>
                </select>
              </div>

              {/* Stage Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline h-4 w-4 mr-1" />
                  Stage Notes
                </label>
                <textarea
                  value={stageNotes[currentStageKey] || ""}
                  onChange={(e) =>
                    setStageNotes({
                      ...stageNotes,
                      [currentStageKey]: e.target.value,
                    })
                  }
                  rows={4}
                  placeholder={`Add notes for ${currentStageData?.label} stage...`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Navigation Buttons REMOVED - Batch completion button handles stage progression */}
            </div>
          </div>
        </div>
      </div>

      {/* Batch Creation Modal */}
      {showBatchModal && jobCardId && (
        <React.Suspense fallback={<div>Loading...</div>}>
          <BatchCreationModalRange
            isOpen={showBatchModal}
            onClose={() => setShowBatchModal(false)}
            jobCardId={jobCardId}
          />
        </React.Suspense>
      )}
    </div>
  );
};

export default ProductionStageFlow;
