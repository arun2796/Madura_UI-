import React from "react";
import {
  CheckCircle,
  Circle,
  Lock,
  ChevronRight,
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

interface HorizontalStageProgressTrackerProps {
  stages: StageProgress[];
  currentStageKey: string;
  onStageSelect?: (stageKey: string) => void;
}

const HorizontalStageProgressTracker: React.FC<HorizontalStageProgressTrackerProps> = ({
  stages,
  currentStageKey,
  onStageSelect,
}) => {
  const currentStageIndex = stages.findIndex((s) => s.stageKey === currentStageKey);

  const getStageIcon = (stage: StageProgress, index: number) => {
    if (stage.status === "completed") {
      return <CheckCircle className="h-8 w-8 text-white" />;
    }
    if (stage.status === "in_progress") {
      return <Circle className="h-8 w-8 text-white animate-pulse" />;
    }
    if (index > currentStageIndex) {
      return <Lock className="h-8 w-8 text-gray-400" />;
    }
    return <Circle className="h-8 w-8 text-gray-400" />;
  };

  const getStageColor = (stage: StageProgress, index: number) => {
    if (stage.status === "completed") {
      return "bg-green-500 border-green-600";
    }
    if (stage.status === "in_progress") {
      return "bg-blue-500 border-blue-600";
    }
    if (index > currentStageIndex) {
      return "bg-gray-300 border-gray-400";
    }
    return "bg-gray-400 border-gray-500";
  };

  const getConnectorColor = (index: number) => {
    if (index < currentStageIndex) {
      return "bg-green-500";
    }
    if (index === currentStageIndex) {
      return "bg-blue-500";
    }
    return "bg-gray-300";
  };

  const getCompletionPercentage = (stage: StageProgress) => {
    if (stage.allocatedQuantity === 0) return 0;
    return Math.round((stage.completedQuantity / stage.allocatedQuantity) * 100);
  };

  const canAccessStage = (index: number) => {
    return index <= currentStageIndex;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Production Stage Progress
        </h3>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Stage {currentStageIndex + 1} of {stages.length}
          </span>
          <span>
            {stages.filter((s) => s.status === "completed").length} Completed
          </span>
        </div>
      </div>

      {/* Horizontal Stage Timeline */}
      <div className="relative">
        {/* Stages */}
        <div className="flex items-start justify-between">
          {stages.map((stage, index) => {
            const completionPercentage = getCompletionPercentage(stage);
            const isAccessible = canAccessStage(index);
            const isCurrent = stage.stageKey === currentStageKey;

            return (
              <div key={stage.stageKey} className="flex items-center flex-1">
                {/* Stage Node */}
                <div className="flex flex-col items-center flex-1">
                  {/* Circle */}
                  <div
                    className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 transition-all duration-300 ${getStageColor(
                      stage,
                      index
                    )} ${
                      isCurrent ? "ring-4 ring-blue-200 scale-110" : ""
                    } ${
                      isAccessible && onStageSelect
                        ? "cursor-pointer hover:scale-105"
                        : "cursor-not-allowed"
                    }`}
                    onClick={() => {
                      if (isAccessible && onStageSelect) {
                        onStageSelect(stage.stageKey);
                      }
                    }}
                    title={stage.stageName}
                  >
                    {getStageIcon(stage, index)}
                  </div>

                  {/* Stage Name */}
                  <div className="mt-3 text-center">
                    <p
                      className={`text-sm font-semibold ${
                        isCurrent
                          ? "text-blue-600"
                          : stage.status === "completed"
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
                      {stage.stageName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {completionPercentage}%
                    </p>
                  </div>

                  {/* Quantity Info */}
                  <div className="mt-2 text-center">
                    <div className="text-xs text-gray-600">
                      <span className="font-semibold text-green-600">
                        {stage.completedQuantity}
                      </span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="font-semibold text-gray-700">
                        {stage.allocatedQuantity}
                      </span>
                    </div>
                    {stage.remainingQuantity > 0 && (
                      <div className="text-xs text-orange-600 mt-1">
                        {stage.remainingQuantity} remaining
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="mt-2">
                    {stage.status === "completed" && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        ✓ Done
                      </span>
                    )}
                    {stage.status === "in_progress" && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        ⟳ Active
                      </span>
                    )}
                    {stage.status === "pending" && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                        ⏳ Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Connector Line */}
                {index < stages.length - 1 && (
                  <div className="flex items-center justify-center w-full -mx-8 mt-8">
                    <div className="relative w-full">
                      <div className="h-1 bg-gray-200 rounded-full"></div>
                      <div
                        className={`absolute top-0 left-0 h-1 rounded-full transition-all duration-500 ${getConnectorColor(
                          index
                        )}`}
                        style={{
                          width:
                            index < currentStageIndex
                              ? "100%"
                              : index === currentStageIndex
                              ? `${completionPercentage}%`
                              : "0%",
                        }}
                      ></div>
                      <ChevronRight className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Overall Progress
          </span>
          <span className="text-sm font-semibold text-blue-600">
            {Math.round(
              (stages.filter((s) => s.status === "completed").length /
                stages.length) *
                100
            )}
            %
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
            style={{
              width: `${
                (stages.filter((s) => s.status === "completed").length /
                  stages.length) *
                100
              }%`,
            }}
          ></div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <p className="text-xs text-green-700 font-medium">Completed</p>
          <p className="text-2xl font-bold text-green-600">
            {stages.reduce((sum, s) => sum + s.completedQuantity, 0)}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="text-xs text-blue-700 font-medium">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">
            {stages
              .filter((s) => s.status === "in_progress")
              .reduce((sum, s) => sum + s.allocatedQuantity, 0)}
          </p>
        </div>
        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
          <p className="text-xs text-orange-700 font-medium">Remaining</p>
          <p className="text-2xl font-bold text-orange-600">
            {stages.reduce((sum, s) => sum + s.remainingQuantity, 0)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HorizontalStageProgressTracker;

