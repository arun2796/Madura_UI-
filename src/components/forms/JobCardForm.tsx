import React, { useState, useEffect } from "react";
import { X, Calendar, Users, Package } from "lucide-react";
import {
  useBindingAdvices,
  useCreateJobCard,
  useUpdateJobCard,
  useJobCards,
} from "../../hooks/useApiQueries";
import { JobCard } from "../../services/api";
import QuantitySelector from "../QuantitySelector";
import QuantityAllocationDisplay from "../QuantityAllocationDisplay";

interface JobCardFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingJobCard?: JobCard | null;
}

const JobCardForm: React.FC<JobCardFormProps> = ({
  isOpen,
  onClose,
  editingJobCard,
}) => {
  const { data: bindingAdvices = [] } = useBindingAdvices();
  const { data: allJobCards = [] } = useJobCards();
  const createJobCardMutation = useCreateJobCard();
  const updateJobCardMutation = useUpdateJobCard();

  const [formData, setFormData] = useState({
    bindingAdviceId: "",
    clientName: "",
    notebookSize: "",
    quantity: 0,
    startDate: new Date().toISOString().split("T")[0],
    estimatedCompletion: "",
    assignedTo: "Production Team A",
  });

  const [selectedQuantity, setSelectedQuantity] = useState<number>(0);
  const [availableQuantity, setAvailableQuantity] = useState<number>(0);
  const [selectedBindingAdvice, setSelectedBindingAdvice] = useState<any>(null);
  const [productQuantities, setProductQuantities] = useState<
    Record<string, number>
  >({});

  const productionTeams = [
    "Production Team A",
    "Production Team B",
    "Design Team",
    "Procurement Team",
    "Cutting Team",
    "Binding Team",
    "Quality Team",
    "Packing Team",
  ];

  // Get approved binding advices that don't have job cards yet
  const availableBindingAdvices = bindingAdvices.filter(
    (ba) =>
      (ba.status === "approved" || ba.status === "draft") &&
      (!editingJobCard || ba.id === editingJobCard.bindingAdviceId)
  );

  // Debug logging
  console.log("All binding advices:", bindingAdvices);
  console.log("Available binding advices:", availableBindingAdvices);

  useEffect(() => {
    if (editingJobCard) {
      setFormData({
        bindingAdviceId: editingJobCard.bindingAdviceId,
        clientName: editingJobCard.clientName,
        notebookSize: editingJobCard.notebookSize,
        quantity: editingJobCard.quantity,
        startDate: editingJobCard.startDate,
        estimatedCompletion: editingJobCard.estimatedCompletion,
        assignedTo: editingJobCard.assignedTo,
      });
    } else {
      // Reset form for new job card
      setFormData({
        bindingAdviceId: "",
        clientName: "",
        notebookSize: "",
        quantity: 0,
        startDate: new Date().toISOString().split("T")[0],
        estimatedCompletion: "",
        assignedTo: "Production Team A",
      });
    }
  }, [editingJobCard]);

  const handleBindingAdviceSelect = (bindingAdviceId: string) => {
    const selectedAdvice = bindingAdvices.find(
      (ba) => ba.id === bindingAdviceId
    );
    if (selectedAdvice) {
      // Calculate estimated completion (7 days from start date)
      const startDate = new Date(formData.startDate);
      const estimatedDate = new Date(startDate);
      estimatedDate.setDate(startDate.getDate() + 7);

      // Get primary product info from line items if available
      const primaryLineItem = selectedAdvice.lineItems?.[0];
      const productName =
        primaryLineItem?.description ||
        selectedAdvice.notebookSize ||
        "Standard Notebook";
      const productPages = selectedAdvice.pages || 96;
      const totalQuantity =
        selectedAdvice.lineItems?.reduce(
          (sum, item) => sum + (item.quantity || 0),
          0
        ) || selectedAdvice.quantity;

      // Calculate already allocated quantity to other job cards
      const allocatedToJobCards = allJobCards
        .filter(
          (jc) =>
            jc.bindingAdviceId === bindingAdviceId &&
            jc.id !== editingJobCard?.id
        )
        .reduce((sum, jc) => sum + (jc.quantity || 0), 0);

      const remainingQuantity = totalQuantity - allocatedToJobCards;

      // Create comprehensive notebook size description
      const notebookSizeDescription =
        selectedAdvice.lineItems && selectedAdvice.lineItems.length > 1
          ? `Mixed Products (${selectedAdvice.lineItems.length} items)`
          : `${productName} - ${productPages} Pages`;

      setFormData((prev) => ({
        ...prev,
        bindingAdviceId: selectedAdvice.id,
        clientName: selectedAdvice.clientName,
        notebookSize: notebookSizeDescription,
        quantity: 0, // Will be calculated from product quantities
        estimatedCompletion: estimatedDate.toISOString().split("T")[0],
      }));

      // Store selected binding advice
      setSelectedBindingAdvice(selectedAdvice);

      // Initialize product quantities to 0
      const initialQuantities: Record<string, number> = {};
      selectedAdvice.lineItems?.forEach((item) => {
        initialQuantities[item.id] = 0;
      });
      setProductQuantities(initialQuantities);

      setAvailableQuantity(remainingQuantity);
      setSelectedQuantity(0);

      console.log("Binding Advice Selected:", {
        id: selectedAdvice.id,
        totalQuantity,
        allocatedToJobCards,
        remainingQuantity,
        lineItems: selectedAdvice.lineItems,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Get the selected binding advice for enhanced material mapping
    const selectedBindingAdvice = bindingAdvices.find(
      (ba) => ba.id === formData.bindingAdviceId
    );

    const currentDate = new Date().toISOString();
    const jobCardData = {
      bindingAdviceId: formData.bindingAdviceId,
      clientName: formData.clientName,
      notebookSize: formData.notebookSize,
      quantity: formData.quantity,
      currentStage: "designing", // Always start at designing stage
      progress: 0, // Always start at 0% - Production Stage Management controls this
      startDate: formData.startDate,
      estimatedCompletion: formData.estimatedCompletion,
      assignedTo: formData.assignedTo,
      status: "active" as const,
      createdAt: currentDate,
      updatedAt: currentDate,
      // Quantity tracking
      allocatedQuantity: formData.quantity,
      stageAllocatedQuantity: 0,
      remainingQuantity: formData.quantity,
      stageAllocations: [],
      stages: [
        {
          name: "designing",
          status: "pending", // Will be set to in_progress when Production Stage Management starts
          startDate: formData.startDate,
          completedDate: null,
          assignedTo: formData.assignedTo,
        },
      ],
      materials: selectedBindingAdvice?.lineItems?.map((lineItem, index) => ({
        itemId: `MAT-${selectedBindingAdvice.id}-${index + 1}`,
        itemName: `${lineItem.description} Paper`,
        requiredQuantity: Math.ceil(lineItem.quantity / 100),
        allocatedQuantity: Math.ceil(lineItem.quantity / 100),
        consumedQuantity: 0, // Will be updated by Production Stage Management
        specifications: {
          description: lineItem.description,
          quantity: lineItem.quantity,
          rate: lineItem.rate,
          amount: lineItem.amount,
          type: "paper",
        },
      })) || [
        {
          itemId: "INV-001",
          itemName: `${formData.notebookSize} Paper`,
          requiredQuantity: Math.ceil(formData.quantity / 100),
          allocatedQuantity: Math.ceil(formData.quantity / 100),
          consumedQuantity: 0, // Will be updated by Production Stage Management
          specifications: {
            size: formData.notebookSize,
            type: "paper",
          },
        },
      ],
    };

    if (editingJobCard) {
      // Update job card using React Query mutation
      updateJobCardMutation.mutate(
        { id: editingJobCard.id, data: jobCardData },
        {
          onSuccess: () => {
            onClose();
          },
          onError: (error) => {
            console.error("Error updating job card:", error);
            alert("Failed to update job card. Please try again.");
          },
        }
      );
    } else {
      // Create new job card using React Query mutation
      createJobCardMutation.mutate(jobCardData, {
        onSuccess: () => {
          onClose();
        },
        onError: (error) => {
          console.error("Error creating job card:", error);
          alert("Failed to create job card. Please try again.");
        },
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingJobCard ? "Edit Job Card" : "Create New Job Card"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Binding Advice Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Binding Advice *
            </label>
            <select
              value={formData.bindingAdviceId}
              onChange={(e) => handleBindingAdviceSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Approved Binding Advice</option>
              {availableBindingAdvices.map((advice) => (
                <option key={advice.id} value={advice.id}>
                  {advice.id} - {advice.clientName} (
                  {(advice.quantity || 0).toLocaleString()} units)
                </option>
              ))}
            </select>
          </div>

          {/* Auto-loaded Information */}
          {formData.bindingAdviceId && (
            <>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">
                  Binding Advice Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Client:</span>
                    <span className="ml-2 text-blue-800">
                      {formData.clientName}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">
                      Notebook Size:
                    </span>
                    <span className="ml-2 text-blue-800">
                      {formData.notebookSize}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product-wise Quantity Allocation */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4">
                  Select Quantity for Each Product
                </h3>

                {selectedBindingAdvice?.lineItems &&
                selectedBindingAdvice.lineItems.length > 0 ? (
                  <div className="space-y-4">
                    {selectedBindingAdvice.lineItems.map(
                      (item: any, index: number) => {
                        // Calculate available quantity for this product
                        const productTotalQty = item.quantity || 0;

                        // Calculate already allocated to other job cards for this product
                        // (In a real scenario, you'd track this per product)
                        const productAvailable = productTotalQty;

                        return (
                          <div
                            key={item.id}
                            className="border border-blue-200 bg-blue-50 rounded-lg p-4"
                          >
                            <div className="mb-3">
                              <h4 className="font-semibold text-gray-900">
                                Product {index + 1}: {item.description}
                              </h4>
                              <div className="text-sm text-gray-600 mt-1">
                                <span className="font-medium">
                                  Total Available:
                                </span>{" "}
                                {productAvailable} units
                              </div>
                            </div>

                            <QuantitySelector
                              availableQuantity={productAvailable}
                              onQuantitySelect={(qty) => {
                                // Update product quantities
                                const newQuantities = {
                                  ...productQuantities,
                                  [item.id]: qty,
                                };
                                setProductQuantities(newQuantities);

                                // Calculate total quantity from all products
                                const totalQty = (
                                  Object.values(newQuantities) as number[]
                                ).reduce((sum, q) => sum + q, 0);
                                setSelectedQuantity(totalQty);
                                setFormData((prev) => ({
                                  ...prev,
                                  quantity: totalQty,
                                }));
                              }}
                              label={`Quantity for ${item.description}`}
                              placeholder="Enter quantity"
                              showSuggestions={true}
                            />

                            {productQuantities[item.id] > 0 && (
                              <div className="mt-2 p-2 bg-white rounded border border-blue-300">
                                <p className="text-sm text-green-700 font-medium">
                                  ✅ Selected: {productQuantities[item.id]}{" "}
                                  units
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      }
                    )}

                    {/* Total Summary */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-4 mt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-90">
                            Total Job Card Quantity
                          </p>
                          <p className="text-2xl font-bold">
                            {(
                              Object.values(productQuantities) as number[]
                            ).reduce((sum, q) => sum + q, 0)}{" "}
                            units
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm opacity-90">
                            Products Selected
                          </p>
                          <p className="text-2xl font-bold">
                            {
                              (
                                Object.values(productQuantities) as number[]
                              ).filter((q) => q > 0).length
                            }{" "}
                            / {selectedBindingAdvice.lineItems.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No products found in this binding advice</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Production Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Estimated Completion *
              </label>
              <input
                type="date"
                value={formData.estimatedCompletion}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    estimatedCompletion: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline h-4 w-4 mr-1" />
              Assigned To *
            </label>
            <select
              value={formData.assignedTo}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, assignedTo: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {productionTeams.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>

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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              disabled={!formData.bindingAdviceId}
            >
              {editingJobCard ? "Update" : "Create"} Job Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobCardForm;
