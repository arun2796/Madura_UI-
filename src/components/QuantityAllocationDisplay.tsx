import React from "react";
import { Package, CheckCircle, AlertCircle, TrendingDown } from "lucide-react";

interface QuantityAllocationDisplayProps {
  totalQuantity: number;
  allocatedQuantity: number;
  completedQuantity?: number;
  remainingQuantity: number;
  level: "binding_advice" | "job_card" | "stage";
  showDetails?: boolean;
  className?: string;
}

const QuantityAllocationDisplay: React.FC<QuantityAllocationDisplayProps> = ({
  totalQuantity,
  allocatedQuantity,
  completedQuantity = 0,
  remainingQuantity,
  level,
  showDetails = true,
  className = "",
}) => {
  const allocationPercentage = totalQuantity > 0
    ? Math.round((allocatedQuantity / totalQuantity) * 100)
    : 0;

  const completionPercentage = allocatedQuantity > 0
    ? Math.round((completedQuantity / allocatedQuantity) * 100)
    : 0;

  const getLevelColor = () => {
    switch (level) {
      case "binding_advice":
        return "blue";
      case "job_card":
        return "green";
      case "stage":
        return "purple";
      default:
        return "gray";
    }
  };

  const color = getLevelColor();

  const getStatusColor = () => {
    if (remainingQuantity === 0) return "text-gray-500";
    if (remainingQuantity < totalQuantity * 0.2) return "text-orange-600";
    return "text-green-600";
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Package className={`h-5 w-5 text-${color}-600`} />
          <h3 className="text-sm font-semibold text-gray-900">
            Quantity Allocation
          </h3>
        </div>
        <div className={`text-lg font-bold ${getStatusColor()}`}>
          {remainingQuantity} / {totalQuantity}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Allocated</span>
          <span>{allocationPercentage}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full bg-${color}-500 transition-all duration-300`}
            style={{ width: `${allocationPercentage}%` }}
          />
        </div>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="text-xs text-gray-600 mb-1">Total</div>
            <div className="text-lg font-bold text-blue-600">
              {totalQuantity}
            </div>
          </div>

          <div className="text-center p-2 bg-green-50 rounded">
            <div className="text-xs text-gray-600 mb-1">Allocated</div>
            <div className="text-lg font-bold text-green-600">
              {allocatedQuantity}
            </div>
          </div>

          <div className="text-center p-2 bg-orange-50 rounded">
            <div className="text-xs text-gray-600 mb-1">Remaining</div>
            <div className={`text-lg font-bold ${getStatusColor()}`}>
              {remainingQuantity}
            </div>
          </div>
        </div>
      )}

      {/* Completion Progress (if applicable) */}
      {completedQuantity > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Completed</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="text-center mt-2">
            <span className="text-sm font-semibold text-green-600">
              {completedQuantity} / {allocatedQuantity} completed
            </span>
          </div>
        </div>
      )}

      {/* Status Indicators */}
      <div className="mt-3 flex items-center justify-between text-xs">
        {remainingQuantity === 0 ? (
          <div className="flex items-center text-gray-500">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span>Fully Allocated</span>
          </div>
        ) : remainingQuantity < totalQuantity * 0.2 ? (
          <div className="flex items-center text-orange-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>Low Balance</span>
          </div>
        ) : (
          <div className="flex items-center text-green-600">
            <TrendingDown className="h-4 w-4 mr-1" />
            <span>Available</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuantityAllocationDisplay;

