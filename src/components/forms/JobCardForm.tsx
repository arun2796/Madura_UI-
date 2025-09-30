import React, { useState, useEffect } from "react";
import { X, Calendar, Users, Package } from "lucide-react";
import {
  useBindingAdvices,
  useCreateJobCard,
  useUpdateJobCard,
} from "../../hooks/useApiQueries";
import { JobCard } from "../../services/api";

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
  const createJobCardMutation = useCreateJobCard();
  const updateJobCardMutation = useUpdateJobCard();

  const [formData, setFormData] = useState({
    bindingAdviceId: "",
    clientName: "",
    notebookSize: "",
    quantity: 0,
    currentStage: "designing",
    progress: 0,
    startDate: new Date().toISOString().split("T")[0],
    estimatedCompletion: "",
    assignedTo: "Production Team A",
  });

  const productionStages = [
    { key: "designing", label: "Designing" },
    { key: "procurement", label: "Procurement" },
    { key: "printing", label: "Printing" },
    { key: "cutting", label: "Cutting & Folding" },
    { key: "binding", label: "Gathering & Binding" },
    { key: "quality_check", label: "Quality Check" },
    { key: "packing", label: "Packing" },
    { key: "completed", label: "Completed" },
  ];

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
        currentStage: editingJobCard.currentStage,
        progress: editingJobCard.progress,
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
        currentStage: "designing",
        progress: 0,
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
        quantity: totalQuantity,
        estimatedCompletion: estimatedDate.toISOString().split("T")[0],
      }));

      console.log("Binding Advice Mapped:", {
        id: selectedAdvice.id,
        clientName: selectedAdvice.clientName,
        notebookSize: notebookSizeDescription,
        quantity: totalQuantity,
        lineItems: selectedAdvice.lineItems?.length || 0,
        originalData: selectedAdvice,
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
      currentStage: formData.currentStage,
      progress: formData.progress,
      startDate: formData.startDate,
      estimatedCompletion: formData.estimatedCompletion,
      assignedTo: formData.assignedTo,
      status: "active" as const,
      createdAt: currentDate,
      updatedAt: currentDate,
      stages: [
        {
          name: "designing",
          status:
            formData.currentStage === "designing"
              ? "in_progress"
              : productionStages.findIndex(
                  (s) => s.key === formData.currentStage
                ) > 0
              ? "completed"
              : "pending",
          startDate: formData.startDate,
          completedDate:
            formData.currentStage === "designing" ? null : formData.startDate,
          assignedTo: formData.assignedTo,
        },
      ],
      materials: selectedBindingAdvice?.lineItems?.map((lineItem, index) => ({
        itemId: `MAT-${selectedBindingAdvice.id}-${index + 1}`,
        itemName: `${lineItem.description} Paper`,
        requiredQuantity: Math.ceil(lineItem.quantity / 100),
        allocatedQuantity: Math.ceil(lineItem.quantity / 100),
        consumedQuantity: Math.ceil(
          (lineItem.quantity / 100) * (formData.progress / 100)
        ),
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
          consumedQuantity: Math.ceil(
            (formData.quantity / 100) * (formData.progress / 100)
          ),
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
                <div>
                  <span className="text-blue-700 font-medium">Quantity:</span>
                  <span className="ml-2 text-blue-800">
                    {(formData.quantity || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="inline h-4 w-4 mr-1" />
                Current Stage *
              </label>
              <select
                value={formData.currentStage}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    currentStage: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {productionStages.map((stage) => (
                  <option key={stage.key} value={stage.key}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress (%)
              </label>
              <input
                type="number"
                value={formData.progress}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    progress: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                max="100"
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
