import React, { useState, useEffect } from "react";
import { X, Calendar, Users } from "lucide-react";
import {
  useBindingAdvices,
  useJobCards,
  useTeams,
} from "../../hooks/useApiQueries";

interface ProductionPlan {
  id: string;
  planName: string;
  startDate: string;
  endDate: string;
  status: "draft" | "scheduled" | "in_progress" | "completed" | "paused";
  priority: "low" | "medium" | "high" | "urgent";
  totalQuantity: number;
  completedQuantity: number;
  assignedTeam: string;
  estimatedDuration: number;
  actualDuration?: number;
  jobCards: string[];
  notes: string;
  createdDate: string;
  createdBy: string;
  bindingAdviceIds: string[];
}

interface ProductionPlanFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingPlan?: ProductionPlan | null;
  onSave: (plan: Omit<ProductionPlan, "id"> | ProductionPlan) => void;
}

const ProductionPlanForm: React.FC<ProductionPlanFormProps> = ({
  isOpen,
  onClose,
  editingPlan,
  onSave,
}) => {
  const { data: bindingAdvices = [] } = useBindingAdvices();
  const { data: jobCards = [] } = useJobCards();
  const { data: teams = [] } = useTeams();

  const [formData, setFormData] = useState({
    planName: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    status: "draft" as
      | "draft"
      | "scheduled"
      | "in_progress"
      | "completed"
      | "paused",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    totalQuantity: 0,
    completedQuantity: 0,
    assignedTeam: "Production Team A",
    estimatedDuration: 7,
    actualDuration: undefined as number | undefined,
    jobCards: [] as string[],
    notes: "",
    createdDate: new Date().toISOString().split("T")[0],
    createdBy: "admin",
    bindingAdviceIds: [] as string[],
  });

  const [selectedBindingAdvices, setSelectedBindingAdvices] = useState<
    string[]
  >([]);

  const productionTeams = [
    "Production Team A",
    "Production Team B",
    "Production Team C",
    "Design Team",
    "Quality Team",
  ];

  // Get available binding advices that can be planned
  const availableBindingAdvices = bindingAdvices.filter(
    (ba) =>
      ba.status === "approved" &&
      (!editingPlan ||
        editingPlan.bindingAdviceIds?.includes(ba.id) ||
        !jobCards.some((jc) => jc.bindingAdviceId === ba.id))
  );

  useEffect(() => {
    if (editingPlan) {
      setFormData({
        planName: editingPlan.planName,
        startDate: editingPlan.startDate,
        endDate: editingPlan.endDate,
        status: editingPlan.status,
        priority: editingPlan.priority,
        totalQuantity: editingPlan.totalQuantity,
        completedQuantity: editingPlan.completedQuantity,
        assignedTeam: editingPlan.assignedTeam,
        estimatedDuration: editingPlan.estimatedDuration,
        actualDuration: editingPlan.actualDuration,
        jobCards: editingPlan.jobCards,
        notes: editingPlan.notes,
        createdDate: editingPlan.createdDate,
        createdBy: editingPlan.createdBy,
        bindingAdviceIds: editingPlan.bindingAdviceIds || [],
      });
      setSelectedBindingAdvices(editingPlan.bindingAdviceIds || []);
    } else {
      // Reset form for new plan
      setFormData({
        planName: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        status: "draft",
        priority: "medium",
        totalQuantity: 0,
        completedQuantity: 0,
        assignedTeam: "Production Team A",
        estimatedDuration: 7,
        actualDuration: undefined,
        jobCards: [],
        notes: "",
        createdDate: new Date().toISOString().split("T")[0],
        createdBy: "admin",
        bindingAdviceIds: [],
      });
      setSelectedBindingAdvices([]);
    }
  }, [editingPlan]);

  // Calculate total quantity from selected binding advices
  useEffect(() => {
    const totalQuantity = selectedBindingAdvices.reduce((sum, adviceId) => {
      const advice = bindingAdvices.find((ba) => ba.id === adviceId);
      return sum + (advice ? advice.quantity : 0);
    }, 0);

    setFormData((prev) => ({
      ...prev,
      totalQuantity,
      bindingAdviceIds: selectedBindingAdvices,
    }));
  }, [selectedBindingAdvices, bindingAdvices]);

  // Auto-calculate end date based on start date and duration
  useEffect(() => {
    if (formData.startDate && formData.estimatedDuration) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + formData.estimatedDuration);
      setFormData((prev) => ({
        ...prev,
        endDate: endDate.toISOString().split("T")[0],
      }));
    }
  }, [formData.startDate, formData.estimatedDuration]);

  const handleBindingAdviceToggle = (adviceId: string) => {
    setSelectedBindingAdvices((prev) =>
      prev.includes(adviceId)
        ? prev.filter((id) => id !== adviceId)
        : [...prev, adviceId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPlan) {
      onSave({ ...editingPlan, ...formData });
    } else {
      onSave(formData);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingPlan ? "Edit Production Plan" : "Create Production Plan"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-3">Plan Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Name *
                </label>
                <input
                  type="text"
                  value={formData.planName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      planName: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., January Notebook Production"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      priority: e.target.value as any,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900 mb-3">Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  Duration (Days) *
                </label>
                <input
                  type="number"
                  value={formData.estimatedDuration}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      estimatedDuration: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date (Auto-calculated)
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Team Assignment */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-900 mb-3">
              Team Assignment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline h-4 w-4 mr-1" />
                  Assigned Team *
                </label>
                <select
                  value={formData.assignedTeam}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      assignedTeam: e.target.value,
                    }))
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as any,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Binding Advices Selection */}
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-medium text-orange-900 mb-3">
              Select Orders for Production
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {availableBindingAdvices.map((advice) => (
                <div
                  key={advice.id}
                  className="flex items-center space-x-3 p-3 bg-white rounded border"
                >
                  <input
                    type="checkbox"
                    id={advice.id}
                    checked={selectedBindingAdvices.includes(advice.id)}
                    onChange={() => handleBindingAdviceToggle(advice.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={advice.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {advice.id || "N/A"} -{" "}
                          {advice.clientName || "Unknown Client"}
                        </div>
                        <div className="text-sm text-gray-600">
                          {advice.notebookSize || "N/A"} - {advice.pages || 0}{" "}
                          pages × {(advice.quantity || 0).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          ₹{(advice.totalAmount || 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {(advice.quantity || 0).toLocaleString()} units
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>

            {selectedBindingAdvices.length > 0 && (
              <div className="mt-4 p-3 bg-white rounded border border-orange-200">
                <div className="text-sm text-orange-700">
                  <strong>Selected:</strong> {selectedBindingAdvices.length}{" "}
                  orders, Total Quantity:{" "}
                  {(formData.totalQuantity || 0).toLocaleString()} units
                </div>
              </div>
            )}
          </div>

          {/* Progress (for editing existing plans) */}
          {editingPlan && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Progress</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Completed Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.completedQuantity}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        completedQuantity: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max={formData.totalQuantity}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Actual Duration (Days)
                  </label>
                  <input
                    type="number"
                    value={formData.actualDuration || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        actualDuration: parseInt(e.target.value) || undefined,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes or special instructions..."
            />
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
              disabled={
                !formData.planName || selectedBindingAdvices.length === 0
              }
            >
              {editingPlan ? "Update" : "Create"} Production Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductionPlanForm;
