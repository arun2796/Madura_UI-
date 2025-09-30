import React, { useState, useEffect } from "react";
import {
  X,
  Package,
  AlertCircle,
  CheckCircle,
  Info,
  Lightbulb,
} from "lucide-react";
import { useCreateBatch } from "../hooks/useBatchQueries";
import { useJobCard, useUpdateJobCard } from "../hooks/useApiQueries";
import {
  validateBatchRange,
  getNextAvailableRange,
  calculateRemainingQuantity,
  formatRange,
  calculateQuantityFromRange,
  findRangeGaps,
} from "../utils/batchRangeValidation";

interface BatchCreationModalRangeProps {
  isOpen: boolean;
  onClose: () => void;
  jobCardId: string;
}

const BatchCreationModalRange: React.FC<BatchCreationModalRangeProps> = ({
  isOpen,
  onClose,
  jobCardId,
}) => {
  const { data: jobCard } = useJobCard(jobCardId);
  const createBatch = useCreateBatch();
  const updateJobCard = useUpdateJobCard();

  const [rangeFrom, setRangeFrom] = useState<number>(1);
  const [rangeTo, setRangeTo] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [teamId, setTeamId] = useState<string>("team_design");

  // Calculate available quantity and gaps
  const existingBatches = jobCard?.batches || [];
  const totalQuantity = jobCard?.quantity || 0;
  const remainingQuantity = calculateRemainingQuantity(
    totalQuantity,
    existingBatches
  );

  // Safely calculate gaps with error handling
  const gaps = React.useMemo(() => {
    try {
      return findRangeGaps(existingBatches, totalQuantity);
    } catch (error) {
      console.error("Error calculating range gaps:", error);
      return [{ from: 1, to: totalQuantity }];
    }
  }, [existingBatches, totalQuantity]);

  // Auto-suggest next available range on load
  useEffect(() => {
    if (jobCard && gaps.length > 0) {
      const firstGap = gaps[0];
      setRangeFrom(firstGap.from);
      setRangeTo(firstGap.to);
    }
  }, [jobCard, gaps.length]);

  // Calculate quantity from range
  const batchQuantity = rangeTo >= rangeFrom ? rangeTo - rangeFrom + 1 : 0;

  // Validate range on change
  const handleRangeChange = (from: number, to: number) => {
    setRangeFrom(from);
    setRangeTo(to);

    if (from < 1) {
      setError("Range 'from' must be at least 1");
      return;
    }

    if (to < from) {
      setError("Range 'to' must be greater than or equal to 'from'");
      return;
    }

    const validation = validateBatchRange(
      { from, to },
      existingBatches,
      totalQuantity
    );

    if (!validation.isValid) {
      setError(validation.error || "Invalid range");
    } else {
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobCard) return;

    // Final validation
    const validation = validateBatchRange(
      { from: rangeFrom, to: rangeTo },
      existingBatches,
      totalQuantity
    );

    if (!validation.isValid) {
      setError(validation.error || "Invalid range");
      return;
    }

    if (batchQuantity <= 0) {
      setError("Batch quantity must be greater than 0");
      return;
    }

    // Get next batch number
    const nextBatchNumber = existingBatches.length + 1;

    // Create batch data
    const batchData = {
      jobCardId,
      batchNumber: nextBatchNumber,
      range: {
        from: rangeFrom,
        to: rangeTo,
      },
      quantity: batchQuantity,
      productId: jobCard.productAllocations?.[0]?.productId || "unknown",
      productName:
        jobCard.productAllocations?.[0]?.productName || "Unknown Product",
      currentStage: "design" as const,
      currentStageIndex: 0,
      status: "active" as const,
      stageAssignments: {
        design: {
          teamId,
          teamName: "Design Team",
          startedAt: new Date().toISOString(),
          completedAt: null,
        },
      },
      completed: false,
      dispatchedQuantity: 0,
      availableForDispatch: 0,
      notes,
      createdAt: new Date().toISOString(),
      createdBy: "admin",
      updatedAt: new Date().toISOString(),
      completedAt: null,
    };

    try {
      const newBatch = await createBatch.mutateAsync(batchData);

      // Update job card with new batch reference
      const updatedBatches = [
        ...existingBatches,
        {
          id: newBatch.id,
          batchNumber: nextBatchNumber,
          originalQuantity: batchQuantity,
          currentStage: "design",
          status: "active" as const,
          completedQuantity: 0,
          dispatchedQuantity: 0,
          availableForDispatch: 0,
          createdAt: new Date().toISOString(),
          completedAt: null,
        },
      ];

      await updateJobCard.mutateAsync({
        id: jobCardId,
        data: {
          batches: updatedBatches,
          updatedAt: new Date().toISOString(),
        },
      });

      // Reset and close
      setRangeFrom(1);
      setRangeTo(0);
      setNotes("");
      setError("");
      onClose();
    } catch (err) {
      setError("Failed to create batch. Please try again.");
      console.error("Batch creation error:", err);
    }
  };

  const handleUseGap = (gap: { from: number; to: number }) => {
    handleRangeChange(gap.from, gap.to);
  };

  if (!isOpen || !jobCard) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Create Production Batch (Range-Based)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Job Card Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Job Card Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Job Card ID:</span>
                <span className="ml-2 text-blue-800">{jobCard.id}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Client:</span>
                <span className="ml-2 text-blue-800">{jobCard.clientName}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">
                  Total Quantity:
                </span>
                <span className="ml-2 text-blue-800">
                  {totalQuantity} units
                </span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Remaining:</span>
                <span className="ml-2 text-green-600 font-semibold">
                  {remainingQuantity} units
                </span>
              </div>
            </div>
          </div>

          {/* Available Gaps */}
          {gaps.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2 mb-3">
                <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-yellow-900">
                    Available Ranges
                  </p>
                  <p className="text-sm text-yellow-700">
                    Click to use a suggested range
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {gaps.map((gap, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleUseGap(gap)}
                    className="px-3 py-2 bg-white border border-yellow-300 rounded-lg hover:bg-yellow-100 transition-colors text-sm"
                  >
                    <span className="font-medium text-yellow-900">
                      {formatRange(gap)}
                    </span>
                    <span className="text-yellow-700 ml-2">
                      ({calculateQuantityFromRange(gap)} units)
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Range Inputs */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Batch Range</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From (Unit #)
                </label>
                <input
                  type="number"
                  min="1"
                  max={totalQuantity}
                  value={rangeFrom}
                  onChange={(e) =>
                    handleRangeChange(parseInt(e.target.value) || 1, rangeTo)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To (Unit #)
                </label>
                <input
                  type="number"
                  min={rangeFrom}
                  max={totalQuantity}
                  value={rangeTo}
                  onChange={(e) =>
                    handleRangeChange(rangeFrom, parseInt(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={totalQuantity.toString()}
                />
              </div>
            </div>
          </div>

          {/* Calculated Quantity */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">
                  Batch Quantity
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {batchQuantity} units
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-700 font-medium">Range</p>
                <p className="text-xl font-semibold text-blue-800">
                  {rangeFrom}-{rangeTo}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any notes about this batch..."
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success Indicator */}
          {!error && batchQuantity > 0 && (
            <div className="flex items-start space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-800">
                Ready to create batch of {batchQuantity} units (Range:{" "}
                {rangeFrom}-{rangeTo})
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={batchQuantity <= 0 || !!error || createBatch.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createBatch.isPending ? "Creating..." : "Create Batch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BatchCreationModalRange;
