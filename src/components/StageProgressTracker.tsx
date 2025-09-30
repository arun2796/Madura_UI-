import React from "react";
import {
  CheckCircle,
  Circle,
  Lock,
  AlertCircle,
  ChevronRight,
  Package,
} from "lucide-react";

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

interface StageProgressTrackerProps {
  stages: StageProgress[];
  currentStageKey: string;
  onStageSelect?: (stageKey: string) => void;
  showProductDetails?: boolean;
}

const StageProgressTracker: React.FC<StageProgressTrackerProps> = ({
  stages,
  currentStageKey,
  onStageSelect,
  showProductDetails = false,
}) => {
  const currentStageIndex = stages.findIndex((s) => s.stageKey === currentStageKey);

  const getStageIcon = (stage: StageProgress, index: number) => {
    if (stage.status === "completed") {
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    }
    if (stage.status === "in_progress") {
      return <Circle className="h-6 w-6 text-blue-500 animate-pulse" />;
    }
    if (index > currentStageIndex) {
      return <Lock className="h-6 w-6 text-gray-400" />;
    }
    return <Circle className="h-6 w-6 text-gray-300" />;
  };

  const getStageColor = (stage: StageProgress, index: number) => {
    if (stage.status === "completed") {
      return "border-green-500 bg-green-50";
    }
    if (stage.status === "in_progress") {
      return "border-blue-500 bg-blue-50";
    }
    if (index > currentStageIndex) {
      return "border-gray-300 bg-gray-50 opacity-60";
    }
    return "border-gray-300 bg-white";
  };

  const getCompletionPercentage = (stage: StageProgress) => {
    if (stage.allocatedQuantity === 0) return 0;
    return Math.round((stage.completedQuantity / stage.allocatedQuantity) * 100);
  };

  const canAccessStage = (index: number) => {
    // Can only access current stage or completed stages
    return index <= currentStageIndex;
  };

  return (
    <div className="space-y-4">
      {/* Stage Progress Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Production Stage Progress</h3>
        <div className="flex items-center justify-between text-sm">
          <span>
            Stage {currentStageIndex + 1} of {stages.length}
          </span>
          <span>
            {stages.filter((s) => s.status === "completed").length} Completed
          </span>
        </div>
      </div>

      {/* Stage List */}
      <div className="space-y-3">
        {stages.map((stage, index) => {
          const completionPercentage = getCompletionPercentage(stage);
          const isAccessible = canAccessStage(index);
          const isCurrent = stage.stageKey === currentStageKey;

          return (
            <div
              key={stage.stageKey}
              className={`border-2 rounded-lg p-4 transition-all duration-200 ${getStageColor(
                stage,
                index
              )} ${isCurrent ? "ring-2 ring-blue-400 shadow-lg" : ""} ${
                isAccessible && onStageSelect
                  ? "cursor-pointer hover:shadow-md"
                  : "cursor-not-allowed"
              }`}
              onClick={() => {
                if (isAccessible && onStageSelect) {
                  onStageSelect(stage.stageKey);
                }
              }}
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getStageIcon(stage, index)}
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {index + 1}. {stage.stageName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {stage.status === "completed" && "✅ Completed"}
                      {stage.status === "in_progress" && "🔄 In Progress"}
                      {stage.status === "pending" && "⏳ Pending"}
                    </p>
                  </div>
                </div>

                {/* Completion Badge */}
                <div
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    completionPercentage === 100
                      ? "bg-green-100 text-green-800"
                      : completionPercentage > 0
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {completionPercentage}%
                </div>
              </div>

              {/* Quantity Summary */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-white rounded p-2 border border-gray-200">
                  <p className="text-xs text-gray-600">Allocated</p>
                  <p className="text-lg font-bold text-gray-900">
                    {stage.allocatedQuantity}
                  </p>
                </div>
                <div className="bg-white rounded p-2 border border-gray-200">
                  <p className="text-xs text-gray-600">Completed</p>
                  <p className="text-lg font-bold text-green-600">
                    {stage.completedQuantity}
                  </p>
                </div>
                <div className="bg-white rounded p-2 border border-gray-200">
                  <p className="text-xs text-gray-600">Remaining</p>
                  <p className="text-lg font-bold text-orange-600">
                    {stage.remainingQuantity}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      completionPercentage === 100
                        ? "bg-green-500"
                        : "bg-blue-500"
                    }`}
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>

              {/* Product-wise Progress */}
              {showProductDetails &&
                stage.productProgress &&
                stage.productProgress.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                      <Package className="h-3 w-3 mr-1" />
                      Product Progress
                    </p>
                    <div className="space-y-1">
                      {stage.productProgress.map((product) => (
                        <div
                          key={product.productId}
                          className="flex items-center justify-between text-xs bg-white rounded p-2"
                        >
                          <span className="text-gray-700">{product.productName}</span>
                          <span className="font-semibold text-gray-900">
                            {product.completedQuantity} units
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Stage Status Messages */}
              {stage.status === "in_progress" && !stage.canMoveNext && (
                <div className="mt-3 flex items-start space-x-2 bg-yellow-50 border border-yellow-200 rounded p-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-yellow-800">
                    Complete all {stage.allocatedQuantity} units to proceed to next
                    stage
                  </p>
                </div>
              )}

              {stage.status === "completed" && stage.canMoveNext && (
                <div className="mt-3 flex items-center space-x-2 text-green-700 text-xs">
                  <CheckCircle className="h-4 w-4" />
                  <span>Stage completed successfully</span>
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </div>
              )}

              {index > currentStageIndex && (
                <div className="mt-3 flex items-start space-x-2 bg-gray-50 border border-gray-200 rounded p-2">
                  <Lock className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-600">
                    Complete previous stages to unlock
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall Progress Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Overall Progress</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {stages.reduce((sum, s) => sum + s.completedQuantity, 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Remaining</p>
            <p className="text-2xl font-bold text-orange-600">
              {stages.reduce((sum, s) => sum + s.remainingQuantity, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StageProgressTracker;

