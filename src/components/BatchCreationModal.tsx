import React, { useState, useEffect } from "react";
import { X, Package, AlertCircle, CheckCircle, Info } from "lucide-react";
import { useCreateBatch } from "../hooks/useBatchQueries";
import { useJobCard, useUpdateJobCard } from "../hooks/useApiQueries";
import { DEFAULT_PRODUCTION_STAGES } from "./ProductionStageWizard";
import {
  validateBatchRange,
  getNextAvailableRange,
  calculateRemainingQuantity,
  formatRange,
  calculateQuantityFromRange,
  findRangeGaps,
} from "../utils/batchRangeValidation";

interface BatchCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobCardId: string;
}

const BatchCreationModal: React.FC<BatchCreationModalProps> = ({
  isOpen,
  onClose,
  jobCardId,
}) => {
  const { data: jobCard } = useJobCard(jobCardId);
  const createBatch = useCreateBatch();
  const updateJobCard = useUpdateJobCard();

  const [batchQuantity, setBatchQuantity] = useState<number>(0);
  const [productQuantities, setProductQuantities] = useState<
    Record<string, number>
  >({});
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  // Calculate available quantity
  const availableQuantity = jobCard
    ? (jobCard.quantity || 0) -
      (jobCard.batches?.reduce((sum, b) => sum + b.originalQuantity, 0) || 0)
    : 0;

  // Initialize product quantities when job card loads
  useEffect(() => {
    if (jobCard?.productAllocations) {
      const initialQuantities: Record<string, number> = {};
      jobCard.productAllocations.forEach((product) => {
        initialQuantities[product.productId] = 0;
      });
      setProductQuantities(initialQuantities);
    }
  }, [jobCard]);

  // Calculate total from product quantities
  const totalProductQuantity = Object.values(productQuantities).reduce(
    (sum, qty) => sum + qty,
    0
  );

  // Update batch quantity when product quantities change
  useEffect(() => {
    setBatchQuantity(totalProductQuantity);
  }, [totalProductQuantity]);

  const handleProductQuantityChange = (productId: string, value: number) => {
    const product = jobCard?.productAllocations?.find(
      (p) => p.productId === productId
    );
    if (!product) return;

    // Calculate how much of this product is already in batches
    const usedInBatches =
      jobCard?.batches?.reduce((sum, batch) => {
        const batchProduct = batch.products?.find(
          (p) => p.productId === productId
        );
        return sum + (batchProduct?.quantity || 0);
      }, 0) || 0;

    const availableForProduct = product.allocatedQuantity - usedInBatches;

    if (value < 0) {
      setError("Quantity cannot be negative");
      return;
    }

    if (value > availableForProduct) {
      setError(
        `Only ${availableForProduct} units available for ${product.productName}`
      );
      return;
    }

    setError("");
    setProductQuantities((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobCard) return;

    // Validation
    if (batchQuantity <= 0) {
      setError("Batch quantity must be greater than 0");
      return;
    }

    if (batchQuantity > availableQuantity) {
      setError(`Only ${availableQuantity} units available`);
      return;
    }

    if (totalProductQuantity !== batchQuantity) {
      setError("Product quantities must sum to batch quantity");
      return;
    }

    // Get next batch number
    const nextBatchNumber = (jobCard.batches?.length || 0) + 1;

    // Initialize stage progress for all stages
    const stageProgress: Record<string, any> = {};
    DEFAULT_PRODUCTION_STAGES.forEach((stage, index) => {
      stageProgress[stage.key] = {
        allocatedQuantity: index === 0 ? batchQuantity : 0, // Only first stage gets allocated
        completedQuantity: 0,
        remainingQuantity: index === 0 ? batchQuantity : 0,
        status: index === 0 ? "in_progress" : "pending",
        startDate: index === 0 ? new Date().toISOString() : null,
        completedDate: null,
        canMoveNext: false,
      };
    });

    // Prepare products array
    const products = Object.entries(productQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, quantity]) => {
        const product = jobCard.productAllocations?.find(
          (p) => p.productId === productId
        );
        return {
          productId,
          productName: product?.productName || "",
          quantity,
          completedQuantity: 0,
        };
      });

    // Create batch
    const batchData = {
      jobCardId,
      batchNumber: nextBatchNumber,
      originalQuantity: batchQuantity,
      currentStage: "designing",
      currentStageIndex: 0,
      status: "active" as const,
      createdAt: new Date().toISOString(),
      completedAt: null,
      createdBy: "admin",
      stageProgress,
      products,
      dispatchedQuantity: 0,
      availableForDispatch: 0,
      notes,
      updatedAt: new Date().toISOString(),
    };

    try {
      const newBatch = await createBatch.mutateAsync(batchData);

      // Update job card with new batch
      const updatedBatches = [
        ...(jobCard.batches || []),
        {
          id: newBatch.id,
          batchNumber: nextBatchNumber,
          originalQuantity: batchQuantity,
          currentStage: "designing",
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
      setBatchQuantity(0);
      setProductQuantities({});
      setNotes("");
      setError("");
      onClose();
    } catch (err) {
      setError("Failed to create batch. Please try again.");
      console.error("Batch creation error:", err);
    }
  };

  if (!isOpen || !jobCard) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Create Production Batch
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
                <span className="ml-2 text-blue-800">{jobCard.quantity}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Available:</span>
                <span className="ml-2 text-green-600 font-semibold">
                  {availableQuantity} units
                </span>
              </div>
            </div>
          </div>

          {/* Product-wise Quantity Allocation */}
          {jobCard.productAllocations &&
            jobCard.productAllocations.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">
                  Allocate Quantity per Product
                </h3>
                {jobCard.productAllocations.map((product) => {
                  const usedInBatches =
                    jobCard.batches?.reduce((sum, batch) => {
                      const batchProduct = batch.products?.find(
                        (p) => p.productId === product.productId
                      );
                      return sum + (batchProduct?.quantity || 0);
                    }, 0) || 0;
                  const availableForProduct =
                    product.allocatedQuantity - usedInBatches;

                  return (
                    <div
                      key={product.productId}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {product.productName}
                        </h4>
                        <span className="text-sm text-gray-600">
                          Available: {availableForProduct} units
                        </span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max={availableForProduct}
                        value={productQuantities[product.productId] || 0}
                        onChange={(e) =>
                          handleProductQuantityChange(
                            product.productId,
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter quantity for this batch"
                      />
                    </div>
                  );
                })}
              </div>
            )}

          {/* Total Batch Quantity */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">
                Total Batch Quantity:
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {batchQuantity} units
              </span>
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
          {batchQuantity > 0 &&
            batchQuantity <= availableQuantity &&
            !error && (
              <div className="flex items-start space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-green-800">
                  Ready to create batch of {batchQuantity} units
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
              disabled={
                batchQuantity <= 0 ||
                batchQuantity > availableQuantity ||
                !!error ||
                createBatch.isPending
              }
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

export default BatchCreationModal;
