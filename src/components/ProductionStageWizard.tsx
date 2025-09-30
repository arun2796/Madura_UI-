import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Circle,
  Loader,
  AlertCircle,
} from "lucide-react";

// Production stage interface
export interface ProductionStage {
  key: string;
  label: string;
  color: string;
  icon?: React.ReactNode;
  description?: string;
}

// Default production stages
export const DEFAULT_PRODUCTION_STAGES: ProductionStage[] = [
  {
    key: "designing",
    label: "Design",
    color: "bg-purple-500",
    description: "Design and planning phase",
  },
  {
    key: "procurement",
    label: "Procurement",
    color: "bg-blue-500",
    description: "Material procurement and preparation",
  },
  {
    key: "printing",
    label: "Printing",
    color: "bg-yellow-500",
    description: "Printing process",
  },
  {
    key: "cutting",
    label: "Cutting & Binding",
    color: "bg-orange-500",
    description: "Cutting and folding operations",
  },
  {
    key: "binding",
    label: "Gathering & Binding",
    color: "bg-green-500",
    description: "Gathering and binding process",
  },
  {
    key: "quality_check",
    label: "Quality",
    color: "bg-indigo-500",
    description: "Quality inspection and testing",
  },
  {
    key: "packing",
    label: "Packing",
    color: "bg-pink-500",
    description: "Final packing and preparation",
  },
];

interface ProductionStageWizardProps {
  stages?: ProductionStage[];
  currentStage: string;
  onStageChange: (stageKey: string) => void;
  onStageComplete?: (stageKey: string) => void;
  completedStages?: string[];
  disabled?: boolean;
  showOnlyCurrentStage?: boolean;
  allowBackNavigation?: boolean;
  className?: string;
}

const ProductionStageWizard: React.FC<ProductionStageWizardProps> = ({
  stages = DEFAULT_PRODUCTION_STAGES,
  currentStage,
  onStageChange,
  onStageComplete,
  completedStages = [],
  disabled = false,
  showOnlyCurrentStage = true,
  allowBackNavigation = true,
  className = "",
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Find current stage index
  useEffect(() => {
    const index = stages.findIndex((stage) => stage.key === currentStage);
    if (index !== -1) {
      setCurrentStageIndex(index);
    }
  }, [currentStage, stages]);

  const currentStageData = stages[currentStageIndex];
  const isFirstStage = currentStageIndex === 0;
  const isLastStage = currentStageIndex === stages.length - 1;

  const handleNext = () => {
    if (isLastStage || disabled) return;

    setIsTransitioning(true);
    const nextIndex = currentStageIndex + 1;
    const nextStage = stages[nextIndex];

    // Mark current stage as complete
    if (onStageComplete) {
      onStageComplete(currentStageData.key);
    }

    // Move to next stage
    setTimeout(() => {
      onStageChange(nextStage.key);
      setIsTransitioning(false);
    }, 300);
  };

  const handlePrevious = () => {
    if (isFirstStage || disabled || !allowBackNavigation) return;

    setIsTransitioning(true);
    const prevIndex = currentStageIndex - 1;
    const prevStage = stages[prevIndex];

    setTimeout(() => {
      onStageChange(prevStage.key);
      setIsTransitioning(false);
    }, 300);
  };

  const isStageCompleted = (stageKey: string) => {
    return completedStages.includes(stageKey);
  };

  const getStageStatus = (index: number) => {
    const stage = stages[index];
    if (isStageCompleted(stage.key)) return "completed";
    if (index === currentStageIndex) return "current";
    if (index < currentStageIndex) return "passed";
    return "upcoming";
  };

  return (
    <div className={`production-stage-wizard ${className}`}>
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Production Progress
          </span>
          <span className="text-sm text-gray-500">
            Stage {currentStageIndex + 1} of {stages.length}
          </span>
        </div>
        <div className="relative">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500 ease-out"
              style={{
                width: `${((currentStageIndex + 1) / stages.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Stage Indicators (Mini Timeline) */}
      {!showOnlyCurrentStage && (
        <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2">
          {stages.map((stage, index) => {
            const status = getStageStatus(index);
            return (
              <div
                key={stage.key}
                className="flex flex-col items-center min-w-[80px]"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                    status === "completed"
                      ? "bg-green-500 text-white"
                      : status === "current"
                      ? `${stage.color} text-white ring-4 ring-opacity-30 ${stage.color.replace(
                          "bg-",
                          "ring-"
                        )}`
                      : status === "passed"
                      ? "bg-gray-400 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {status === "completed" ? (
                    <Check className="h-5 w-5" />
                  ) : status === "current" ? (
                    <Circle className="h-5 w-5 fill-current" />
                  ) : (
                    <span className="text-xs font-semibold">{index + 1}</span>
                  )}
                </div>
                <span
                  className={`text-xs text-center ${
                    status === "current"
                      ? "font-semibold text-gray-900"
                      : "text-gray-500"
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Current Stage Card */}
      <div
        className={`bg-white rounded-xl shadow-lg border-2 p-6 transition-all duration-300 ${
          isTransitioning ? "opacity-50 scale-95" : "opacity-100 scale-100"
        } ${currentStageData.color.replace("bg-", "border-")}`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`w-12 h-12 ${currentStageData.color} rounded-full flex items-center justify-center`}
            >
              {isStageCompleted(currentStageData.key) ? (
                <Check className="h-6 w-6 text-white" />
              ) : isTransitioning ? (
                <Loader className="h-6 w-6 text-white animate-spin" />
              ) : (
                <span className="text-white font-bold text-lg">
                  {currentStageIndex + 1}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {currentStageData.label}
              </h3>
              {currentStageData.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {currentStageData.description}
                </p>
              )}
            </div>
          </div>
          {isStageCompleted(currentStageData.key) && (
            <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full">
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">Completed</span>
            </div>
          )}
        </div>

        {/* Stage Content Area */}
        <div className="my-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Current Stage: {currentStageData.label}</p>
              <p className="text-gray-600">
                Complete this stage to proceed to the next step in the production process.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={isFirstStage || disabled || !allowBackNavigation}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isFirstStage || disabled || !allowBackNavigation
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Previous</span>
          </button>

          <div className="text-sm text-gray-500">
            {currentStageIndex + 1} / {stages.length}
          </div>

          <button
            onClick={handleNext}
            disabled={isLastStage || disabled}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isLastStage || disabled
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : `${currentStageData.color} text-white hover:opacity-90`
            }`}
          >
            <span>{isLastStage ? "Completed" : "Next Stage"}</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stage List (Hidden Previous Stages) */}
      {showOnlyCurrentStage && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            {completedStages.length > 0 && (
              <span className="text-green-600 font-medium">
                {completedStages.length} stage(s) completed
              </span>
            )}
            {completedStages.length > 0 && " • "}
            {stages.length - currentStageIndex - 1} stage(s) remaining
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductionStageWizard;

