import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  Package,
  AlertTriangle,
  CheckCircle,
  Plus,
  Eye,
  CreditCard as Edit,
  Trash2,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import {
  useBindingAdvices,
  useJobCards,
  useInventoryItems,
  useTeams,
  useProductionPlans,
  useCreateProductionPlan,
  useUpdateProductionPlan,
  useDeleteProductionPlan,
  useCreateJobCard,
  useCreateInvoice,
} from "../hooks/useApiQueries";
import { ProductionPlan } from "../services/api";
import ProductionPlanForm from "../components/forms/ProductionPlanForm";

// ProductionPlan interface is now imported from services/api

const ProductionPlanning = () => {
  // Use React Query hooks for data fetching
  const { data: bindingAdvices = [], isLoading: bindingLoading } =
    useBindingAdvices();
  const { data: jobCards = [], isLoading: jobCardsLoading } = useJobCards();
  const { data: inventory = [], isLoading: inventoryLoading } =
    useInventoryItems();
  const { data: teams = [], isLoading: teamsLoading } = useTeams();
  const { data: productionPlans = [], isLoading: productionPlansLoading } =
    useProductionPlans();

  // Mutation hooks
  const createProductionPlan = useCreateProductionPlan();
  const updateProductionPlan = useUpdateProductionPlan();
  const deleteProductionPlan = useDeleteProductionPlan();
  const createJobCard = useCreateJobCard();
  const createInvoice = useCreateInvoice();

  // Loading state
  const isLoading =
    bindingLoading ||
    jobCardsLoading ||
    inventoryLoading ||
    teamsLoading ||
    productionPlansLoading;

  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ProductionPlan | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<ProductionPlan | null>(null);
  const [showPlanDetails, setShowPlanDetails] = useState(false);

  // Get approved binding advices that can be planned
  const availableBindingAdvices = bindingAdvices.filter(
    (ba) =>
      ba.status === "approved" &&
      !jobCards.some((jc) => jc.bindingAdviceId === ba.id)
  );

  // Generate next ID for production plans
  const generateNextId = () => {
    const year = new Date().getFullYear();
    const numbers = productionPlans
      .map((plan) => {
        const match = plan.id.match(new RegExp(`PP-${year}-(\\d+)`));
        return match ? parseInt(match[1]) : 0;
      })
      .filter((num) => num > 0);

    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `PP-${year}-${nextNumber.toString().padStart(3, "0")}`;
  };

  // Handle save production plan (create or update) - Now using React Query
  const handleSavePlan = (
    planData: Omit<ProductionPlan, "id"> | ProductionPlan
  ) => {
    if ("id" in planData) {
      // Update existing plan
      updateProductionPlan.mutate(
        {
          id: planData.id,
          data: planData,
        },
        {
          onSuccess: () => {
            setShowPlanForm(false);
            setEditingPlan(null);
            // Automatically reload the page to refresh data
            window.location.reload();
          },
          onError: (error) => {
            console.error("Error updating production plan:", error);
            alert("Failed to update production plan. Please try again.");
          },
        }
      );
    } else {
      // Create new plan
      createProductionPlan.mutate(planData, {
        onSuccess: () => {
          setShowPlanForm(false);
          setEditingPlan(null);
          // Automatically reload the page to refresh data
          window.location.reload();
        },
        onError: (error) => {
          console.error("Error creating production plan:", error);
          alert("Failed to create production plan. Please try again.");
        },
      });
    }
  };

  // Handle delete production plan - Now using React Query
  const handleDeletePlan = (planId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this production plan? This action cannot be undone."
      )
    ) {
      deleteProductionPlan.mutate(planId, {
        onSuccess: () => {
          // Automatically reload the page to refresh data
          window.location.reload();
        },
        onError: (error) => {
          console.error("Error deleting production plan:", error);
          alert("Failed to delete production plan. Please try again.");
        },
      });
    }
  };

  // Calculate production capacity and resource requirements
  const calculateProductionMetrics = () => {
    const totalPlanned = productionPlans.reduce(
      (sum, plan) => sum + (plan.totalQuantity || 0),
      0
    );
    const totalCompleted = productionPlans.reduce(
      (sum, plan) => sum + (plan.completedQuantity || 0),
      0
    );
    const activePlans = productionPlans.filter(
      (plan) => plan.status === "in_progress"
    ).length;
    const scheduledPlans = productionPlans.filter(
      (plan) => plan.status === "scheduled"
    ).length;

    return {
      totalPlanned,
      totalCompleted,
      activePlans,
      scheduledPlans,
      completionRate:
        totalPlanned > 0
          ? Math.round((totalCompleted / totalPlanned) * 100)
          : 0,
    };
  };

  const metrics = calculateProductionMetrics();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-emerald-100 text-emerald-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-gray-100 text-gray-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Calendar className="h-4 w-4" />;
      case "in_progress":
        return <Play className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "paused":
        return <Pause className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleStatusChange = (planId: string, newStatus: string) => {
    setProductionPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId ? { ...plan, status: newStatus as any } : plan
      )
    );
  };

  const handleCreateJobCards = async (plan: ProductionPlan) => {
    try {
      // Get approved binding advices for this plan
      const planBindingAdvices = availableBindingAdvices.filter(
        (advice) =>
          plan.bindingAdviceIds.includes(advice.id) &&
          advice.status === "approved"
      );

      for (const advice of planBindingAdvices) {
        // Map products from binding advice line items
        const materials =
          advice.lineItems?.map((lineItem: any) => {
            // Find matching inventory item for this product
            const inventoryItem = inventoryItems.find(
              (item) =>
                item.category === "raw_material" &&
                (item.itemName
                  .toLowerCase()
                  .includes(lineItem.description.toLowerCase()) ||
                  lineItem.description
                    .toLowerCase()
                    .includes(item.itemName.toLowerCase()))
            );

            return {
              itemId: inventoryItem?.id || `INV-${Date.now()}`,
              itemName:
                inventoryItem?.itemName || `${lineItem.description} Paper`,
              requiredQuantity: Math.ceil(lineItem.quantity / 100),
              allocatedQuantity: Math.ceil(lineItem.quantity / 100),
              consumedQuantity: 0,
              specifications: inventoryItem?.specifications || {},
            };
          }) || [];

        const jobCardData = {
          bindingAdviceId: advice.id,
          clientName: advice.clientName,
          clientContact: advice.clientContact,
          notebookSize: advice.notebookSize,
          quantity: advice.quantity,
          currentStage: "designing" as const,
          progress: 0,
          startDate: plan.startDate,
          estimatedCompletion: plan.endDate,
          assignedTo: plan.assignedTeam,
          priority: plan.priority,
          stages: [
            {
              name: "designing",
              status: "pending" as const,
              startDate: plan.startDate,
              completedDate: null,
              assignedTo: "Design Team",
              notes: "",
            },
            {
              name: "planning",
              status: "pending" as const,
              startDate: null,
              completedDate: null,
              assignedTo: "Planning Team",
              notes: "",
            },
            {
              name: "production",
              status: "pending" as const,
              startDate: null,
              completedDate: null,
              assignedTo: plan.assignedTeam,
              notes: "",
            },
            {
              name: "quality_check",
              status: "pending" as const,
              startDate: null,
              completedDate: null,
              assignedTo: "Quality Team",
              notes: "",
            },
          ],
          materials,
          notes: `Created from production plan: ${plan.planName}`,
          createdDate: new Date().toISOString().split("T")[0],
          createdBy: plan.createdBy,
        };

        // Create job card using React Query mutation
        createJobCard.mutate(jobCardData, {
          onSuccess: (newJobCard) => {
            // Update production plan with new job card ID
            updateProductionPlan.mutate({
              id: plan.id,
              data: {
                ...plan,
                jobCards: [...plan.jobCards, newJobCard.id],
                status: "in_progress" as const,
              },
            });

            // Auto-generate invoice for the job card
            const invoiceData = {
              bindingAdviceId: advice.id,
              clientId: advice.clientId || "default-client",
              clientName: advice.clientName,
              clientContact: advice.clientContact || "",
              clientEmail: advice.clientEmail || "",
              clientAddress: advice.clientAddress || "",
              jobCardId: newJobCard.id,
              items:
                advice.lineItems?.map((item: any, index: number) => ({
                  itemId: `ITEM-${index + 1}`,
                  itemName: `${item.description} - ${item.pages} Pages`,
                  quantity: item.quantity,
                  rate: item.rate || 15,
                  amount: item.quantity * (item.rate || 15),
                })) || [],
              amount: advice.totalAmount || advice.quantity * 15,
              taxAmount: (advice.totalAmount || advice.quantity * 15) * 0.18, // 18% GST
              totalAmount: (advice.totalAmount || advice.quantity * 15) * 1.18,
              paymentTerms: "Net 30 days",
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              status: "pending",
              notes: `Auto-generated invoice for Job Card ${newJobCard.id}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            createInvoice.mutate(invoiceData, {
              onSuccess: (newInvoice) => {
                console.log(
                  `Invoice ${newInvoice.id} created for Job Card ${newJobCard.id}`
                );
              },
              onError: (error) => {
                console.error("Error creating invoice:", error);
              },
            });
          },
        });
      }
    } catch (error) {
      console.error("Error creating job cards:", error);
    }
  };

  const calculateResourceRequirements = (plan: ProductionPlan) => {
    const paperRequired = Math.ceil(plan.totalQuantity / 500); // Estimate reams needed
    const inkRequired = Math.ceil(plan.totalQuantity / 1000); // Estimate ink liters
    const bindingMaterial = Math.ceil(plan.totalQuantity / 100); // Estimate binding units

    return {
      paper: paperRequired,
      ink: inkRequired,
      binding: bindingMaterial,
    };
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Production Planning
        </h1>
        <button
          onClick={() => setShowPlanForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Production Plan</span>
        </button>
      </div>

      {/* Production Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Total Planned
              </h3>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {(metrics.totalPlanned || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Completed</h3>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {(metrics.totalCompleted || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Active Plans
              </h3>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {metrics.activePlans}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Play className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Scheduled</h3>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {metrics.scheduledPlans}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Completion Rate
              </h3>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {metrics.completionRate}%
              </p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Available Binding Advices for Planning */}
      {availableBindingAdvices.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Available for Production Planning
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {availableBindingAdvices.map((advice) => (
              <div
                key={advice.id}
                className="border border-blue-200 bg-blue-50 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-blue-900">{advice.id}</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Approved
                  </span>
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>
                    <span className="font-medium">Client:</span>{" "}
                    {advice.clientName}
                  </div>
                  <div>
                    <span className="font-medium">Product:</span>{" "}
                    {advice.notebookSize} - {advice.pages} pages
                  </div>
                  <div>
                    <span className="font-medium">Quantity:</span>{" "}
                    {(advice.quantity || 0).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Value:</span> ₹
                    {(advice.totalAmount || 0).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingPlan({
                      id: "",
                      planName: `${advice.clientName} Production`,
                      startDate: new Date().toISOString().split("T")[0],
                      endDate: "",
                      status: "draft",
                      priority: "medium",
                      totalQuantity: advice.quantity,
                      completedQuantity: 0,
                      assignedTeam: "Production Team A",
                      estimatedDuration: 7,
                      jobCards: [],
                      notes: `Production plan for ${advice.clientName}`,
                      createdDate: new Date().toISOString().split("T")[0],
                      createdBy: "admin",
                    });
                    setShowPlanForm(true);
                  }}
                  className="w-full mt-3 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors duration-200"
                >
                  Create Production Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <ProductionPlanForm
        isOpen={showPlanForm}
        onClose={() => {
          setShowPlanForm(false);
          setEditingPlan(null);
        }}
        editingPlan={editingPlan}
        onSave={handleSavePlan}
      />

      {/* Production Plans */}
      <div className="space-y-4">
        {productionPlans.map((plan) => {
          const progress =
            plan.totalQuantity > 0
              ? (plan.completedQuantity / plan.totalQuantity) * 100
              : 0;
          const resources = calculateResourceRequirements(plan);

          return (
            <div
              key={plan.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              {/* Plan Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {plan.planName}
                  </h3>
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center space-x-1 ${getStatusColor(
                      plan.status
                    )}`}
                  >
                    {getStatusIcon(plan.status)}
                    <span className="ml-1">
                      {plan.status.replace("_", " ").toUpperCase()}
                    </span>
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(
                      plan.priority
                    )}`}
                  >
                    {plan.priority.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedPlan(plan);
                      setShowPlanDetails(true);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingPlan(plan);
                      setShowPlanForm(true);
                    }}
                    className="text-green-600 hover:text-green-800"
                    title="Edit Plan"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete Plan"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {plan.status === "scheduled" && (
                    <button
                      onClick={() => handleStatusChange(plan.id, "in_progress")}
                      className="text-green-600 hover:text-green-800 bg-green-50 px-2 py-1 rounded text-xs font-medium"
                      title="Start Production"
                    >
                      <Play className="h-3 w-3 inline mr-1" />
                      Start
                    </button>
                  )}
                  {plan.status === "in_progress" && (
                    <button
                      onClick={() => handleStatusChange(plan.id, "paused")}
                      className="text-yellow-600 hover:text-yellow-800 bg-yellow-50 px-2 py-1 rounded text-xs font-medium"
                      title="Pause Production"
                    >
                      <Pause className="h-3 w-3 inline mr-1" />
                      Pause
                    </button>
                  )}
                  {plan.jobCards.length === 0 &&
                    plan.status !== "completed" && (
                      <button
                        onClick={() => handleCreateJobCards(plan)}
                        className="text-purple-600 hover:text-purple-800 bg-purple-50 px-2 py-1 rounded text-xs font-medium"
                        title="Create Job Cards"
                      >
                        <Plus className="h-3 w-3 inline mr-1" />
                        Create Jobs
                      </button>
                    )}
                </div>
              </div>

              {/* Plan Details */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-500">Duration</div>
                  <div className="font-medium text-gray-900">
                    {new Date(plan.startDate).toLocaleDateString()} -{" "}
                    {new Date(plan.endDate).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {plan.estimatedDuration} days planned
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Assigned Team</div>
                  <div className="font-medium text-gray-900">
                    {plan.assignedTeam}
                  </div>
                  <div className="text-xs text-gray-500">
                    {plan.jobCards.length} job cards
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Quantity</div>
                  <div className="font-medium text-gray-900">
                    {(plan.totalQuantity || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {(plan.completedQuantity || 0).toLocaleString()} completed
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Progress</div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Resource Requirements */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Resource Requirements
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Paper:</span>
                    <span className="ml-2 font-medium">
                      {resources.paper} reams
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Ink:</span>
                    <span className="ml-2 font-medium">
                      {resources.ink} liters
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Binding:</span>
                    <span className="ml-2 font-medium">
                      {resources.binding} units
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {plan.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">{plan.notes}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Production Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Production Timeline
        </h2>
        <div className="space-y-3">
          {productionPlans
            .filter((plan) => plan.status !== "completed")
            .sort(
              (a, b) =>
                new Date(a.startDate).getTime() -
                new Date(b.startDate).getTime()
            )
            .map((plan) => (
              <div
                key={plan.id}
                className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    plan.status === "in_progress"
                      ? "bg-green-500"
                      : plan.status === "scheduled"
                      ? "bg-blue-500"
                      : plan.status === "paused"
                      ? "bg-yellow-500"
                      : "bg-gray-500"
                  }`}
                ></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {plan.planName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(plan.startDate).toLocaleDateString()} -{" "}
                    {new Date(plan.endDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {(plan.totalQuantity || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {plan.assignedTeam}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ProductionPlanning;
