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
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { DEFAULT_PRODUCTION_STAGES } from "../components/ProductionStageWizard";
import { useJobCard, useUpdateJobCard } from "../hooks/useApiQueries";
import {
  useBindingAdvice,
  useUpdateBindingAdvice,
} from "../hooks/useApiQueries";

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

  // Local state for stage management
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [stageNotes, setStageNotes] = useState<Record<string, string>>({});
  const [assignedTeam, setAssignedTeam] = useState(
    jobCard?.assignedTo || "Production Team A"
  );

  // Stage progress data
  const [stageProgressData, setStageProgressData] = useState<StageProgress[]>(
    []
  );

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

        {/* Current Stage Dropdown Navigation */}
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
                <select
                  value={currentStageIndex}
                  onChange={(e) => {
                    const newIndex = parseInt(e.target.value);
                    // Only allow navigation to current or previous completed stages
                    if (newIndex <= currentStageIndex) {
                      setCurrentStageIndex(newIndex);
                    }
                  }}
                  className="px-4 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {DEFAULT_PRODUCTION_STAGES.map((stage, index) => {
                    const stageData = stageProgressData[index];
                    const isAccessible = index <= currentStageIndex;
                    return (
                      <option
                        key={stage.key}
                        value={index}
                        disabled={!isAccessible}
                      >
                        {index + 1}. {stage.label} -{" "}
                        {stageData?.status === "completed"
                          ? "✅ Completed"
                          : stageData?.status === "in_progress"
                          ? "🔄 In Progress"
                          : "🔒 Locked"}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Stage Progress Summary */}
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
              {/* Product-wise Completion Tracking */}
              {jobCard.productAllocations &&
                jobCard.productAllocations.length > 0 && (
                  <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-3">
                      Product Completion for {currentStageData?.label}
                    </h4>
                    <div className="space-y-3">
                      {jobCard.productAllocations.map((product) => (
                        <div
                          key={product.productId}
                          className="bg-white rounded-lg p-3 border border-blue-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">
                              {product.productName}
                            </span>
                            <span className="text-sm text-gray-600">
                              Allocated: {product.allocatedQuantity} units
                            </span>
                          </div>
                          <input
                            type="number"
                            min="0"
                            max={product.allocatedQuantity}
                            value={
                              currentProgress?.productProgress?.find(
                                (p) => p.productId === product.productId
                              )?.completedQuantity || 0
                            }
                            placeholder="Enter completed quantity"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => {
                              const completed = parseInt(e.target.value) || 0;

                              // Validate quantity
                              if (completed > product.allocatedQuantity) {
                                return;
                              }

                              // Update stage progress data
                              setStageProgressData((prev) => {
                                const updated = [...prev];
                                const currentStage = updated[currentStageIndex];

                                if (currentStage) {
                                  // Update product progress
                                  const productProgress =
                                    currentStage.productProgress || [];
                                  const existingIndex =
                                    productProgress.findIndex(
                                      (p) => p.productId === product.productId
                                    );

                                  if (existingIndex >= 0) {
                                    productProgress[
                                      existingIndex
                                    ].completedQuantity = completed;
                                  } else {
                                    productProgress.push({
                                      productId: product.productId,
                                      productName: product.productName,
                                      completedQuantity: completed,
                                    });
                                  }

                                  currentStage.productProgress =
                                    productProgress;

                                  // Calculate total completed for this stage
                                  const totalCompleted = productProgress.reduce(
                                    (sum, p) => sum + p.completedQuantity,
                                    0
                                  );

                                  currentStage.completedQuantity =
                                    totalCompleted;
                                  currentStage.remainingQuantity =
                                    currentStage.allocatedQuantity -
                                    totalCompleted;

                                  // Update status and canMoveNext
                                  if (
                                    totalCompleted ===
                                      currentStage.allocatedQuantity &&
                                    totalCompleted > 0
                                  ) {
                                    currentStage.status = "completed";
                                    currentStage.canMoveNext = true;
                                  } else if (totalCompleted > 0) {
                                    currentStage.status = "in_progress";
                                    currentStage.canMoveNext = false;
                                  } else {
                                    currentStage.status = "pending";
                                    currentStage.canMoveNext = false;
                                  }
                                }

                                return updated;
                              });
                            }}
                          />
                        </div>
                      ))}
                    </div>
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

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  disabled={true}
                  className="px-6 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed flex items-center space-x-2"
                  title="Backward navigation is disabled"
                >
                  <span>← Previous Stage</span>
                </button>
                <button
                  onClick={handleNextStage}
                  disabled={
                    !canMoveToNextStage() ||
                    currentStageIndex >= DEFAULT_PRODUCTION_STAGES.length - 1
                  }
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                >
                  <span>Next Stage</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionStageFlow;
