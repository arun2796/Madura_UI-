import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Plus,
  Trash2,
  MapPin,
  Clock,
  User,
  Package,
  Layers,
} from "lucide-react";
import { Dispatch } from "../../hooks/useData";
import {
  useJobCards,
  useCreateDispatch,
  useUpdateDispatch,
  useUpdateJobCard,
} from "../../hooks/useApiQueries";
import { useProductionBatches } from "../../hooks/useBatchQueries";
import { formatRange } from "../../utils/batchRangeValidation";
import FinishedProductsTable from "../tables/FinishedProductsTable";
import { useInventoryItems } from "../../hooks/useApiQueries";

interface DispatchFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingDispatch?: Dispatch | null;
}

interface DeliveryLocation {
  locationId: string;
  locationName: string;
  address: string;
  contactPerson: string;
  contactNumber: string;
  quantity: number;
  cartons: number;
  deliveryInstructions: string;
  deliveryTime: string;
  status: "pending" | "in_transit" | "delivered";
}

const DispatchForm: React.FC<DispatchFormProps> = ({
  isOpen,
  onClose,
  editingDispatch,
}) => {
  // Use React Query hooks for API operations
  const { data: jobCards = [] } = useJobCards();
  const { data: allBatches = [] } = useProductionBatches();
  const { data: inventoryItems = [] } = useInventoryItems();
  const createDispatch = useCreateDispatch();
  const updateDispatch = useUpdateDispatch();
  const updateJobCard = useUpdateJobCard();

  // Filter batches that are completed and have available quantity for dispatch
  const completedBatches = allBatches.filter((batch) => {
    // Check if batch is completed
    const isCompleted = batch.completed && batch.status === "completed";

    // Check if there's available quantity for dispatch
    const availableForDispatch = batch.availableForDispatch || 0;
    const alreadyDispatched = batch.dispatchedQuantity || 0;
    const hasAvailableQuantity = availableForDispatch > alreadyDispatched;

    // Only show batches with:
    // 1. Completed status
    // 2. Available quantity not yet dispatched
    return isCompleted && hasAvailableQuantity;
  });

  // Helper function to match finished products
  const getFinishedProduct = (description: string, pages: number) => {
    return inventoryItems.find(
      (item) =>
        item.category === "finished_product" &&
        (item.itemName.toLowerCase().includes(description.toLowerCase()) ||
          description.toLowerCase().includes(item.itemName.toLowerCase())) &&
        (item.specifications?.pages === pages || !item.specifications?.pages)
    );
  };

  // Get finished products for display
  const finishedProducts = inventoryItems.filter(
    (item) => item.category === "finished_product"
  );

  // Group batches by job card for display
  const batchesByJobCard = completedBatches.reduce((acc, batch) => {
    if (!acc[batch.jobCardId]) {
      acc[batch.jobCardId] = [];
    }
    acc[batch.jobCardId].push(batch);
    return acc;
  }, {} as Record<string, typeof completedBatches>);

  // Debug logging
  console.log("All batches:", allBatches);
  console.log("Completed batches available for dispatch:", completedBatches);
  console.log("Batches grouped by job card:", batchesByJobCard);
  console.log(
    "Batch details:",
    completedBatches.map((batch) => ({
      id: batch.id,
      batchNumber: batch.batchNumber,
      range: formatRange(batch.range),
      availableForDispatch: batch.availableForDispatch,
      dispatchedQuantity: batch.dispatchedQuantity,
      remaining:
        (batch.availableForDispatch || 0) - (batch.dispatchedQuantity || 0),
    }))
  );

  const [formData, setFormData] = useState({
    jobCardId: "",
    batchId: "",
    batchNumber: 0,
    batchRange: "",
    clientName: "",
    deliveryLocation: "",
    deliveryAddress: "",
    quantity: 0,
    notebookSize: "",
    scheduledDate: new Date().toISOString().split("T")[0],
    transporter: "FastTrack Logistics",
    transporterContact: "",
    vehicleNumber: "",
    driverName: "",
    driverContact: "",
    estimatedDelivery: new Date().toISOString().split("T")[0],
    totalCartons: 0,
    deliveryValue: 0,
    notes: "",
  });

  const [deliveryLocations, setDeliveryLocations] = useState<
    DeliveryLocation[]
  >([
    {
      locationId: "LOC-001",
      locationName: "",
      address: "",
      contactPerson: "",
      contactNumber: "",
      quantity: 0,
      cartons: 0,
      deliveryInstructions: "",
      deliveryTime: "10:00",
      status: "pending",
    },
  ]);

  const transporters = [
    { name: "FastTrack Logistics", contact: "9876543230" },
    { name: "Reliable Transport", contact: "9876543232" },
    { name: "Express Cargo", contact: "9876543234" },
    { name: "Speed Delivery", contact: "9876543236" },
    { name: "Safe Transport", contact: "9876543238" },
  ];

  // Convert dispatch data to the format expected by the table
  const lineItems = formData.batchId
    ? [
        {
          id: `dispatch-batch-${formData.batchId}`,
          description: formData.notebookSize || "Unknown Product",
          pages: 96, // Default pages, could be extracted from product name
          quantity: formData.quantity || 0,
        },
      ]
    : [];

  // Get job cards that have completed batches available for dispatch
  const completedJobCards = jobCards.filter((jc) => {
    // Check if this job card has any completed batches
    const jobCardBatches = batchesByJobCard[jc.id] || [];
    return jobCardBatches.length > 0;
  });

  // Get completed job cards that don't have dispatches yet
  const availableJobCards = completedJobCards.filter(
    (jc) => !editingDispatch || jc.id === editingDispatch.jobCardId
  );

  console.log("Completed job cards:", completedJobCards);
  console.log("Available job cards for dispatch:", availableJobCards);

  useEffect(() => {
    if (editingDispatch) {
      setFormData({
        jobCardId: editingDispatch.jobCardId,
        clientName: editingDispatch.clientName,
        deliveryLocation: editingDispatch.deliveryLocation,
        deliveryAddress: editingDispatch.deliveryAddress,
        quantity: editingDispatch.quantity,
        notebookSize: editingDispatch.notebookSize,
        scheduledDate: editingDispatch.scheduledDate,
        transporter: editingDispatch.transporter,
        transporterContact: editingDispatch.transporterContact,
        vehicleNumber: editingDispatch.vehicleNumber,
        driverName: editingDispatch.driverName,
        driverContact: editingDispatch.driverContact,
        estimatedDelivery: editingDispatch.estimatedDelivery,
        totalCartons: editingDispatch.totalCartons,
        deliveryValue: editingDispatch.deliveryValue,
        notes: editingDispatch.notes,
      });

      if (editingDispatch.multipleLocations) {
        setDeliveryLocations(editingDispatch.multipleLocations);
      }
    } else {
      // Reset form for new dispatch
      setFormData({
        jobCardId: "",
        clientName: "",
        deliveryLocation: "",
        deliveryAddress: "",
        quantity: 0,
        notebookSize: "",
        scheduledDate: new Date().toISOString().split("T")[0],
        transporter: "FastTrack Logistics",
        transporterContact: "9876543230",
        vehicleNumber: "",
        driverName: "",
        driverContact: "",
        estimatedDelivery: new Date().toISOString().split("T")[0],
        totalCartons: 0,
        deliveryValue: 0,
        notes: "",
      });

      setDeliveryLocations([
        {
          locationId: "LOC-001",
          locationName: "",
          address: "",
          contactPerson: "",
          contactNumber: "",
          quantity: 0,
          cartons: 0,
          deliveryInstructions: "",
          deliveryTime: "10:00",
          status: "pending",
        },
      ]);
    }
  }, [editingDispatch]);

  const handleJobCardSelect = (jobCardId: string) => {
    const selectedJobCard = availableJobCards.find((jc) => jc.id === jobCardId);
    if (selectedJobCard) {
      const estimatedDate = new Date(formData.scheduledDate);
      const deliveryDate = new Date(estimatedDate);
      deliveryDate.setDate(estimatedDate.getDate() + 1);

      // Use available for dispatch quantity (completed but not yet dispatched)
      const availableQty = selectedJobCard.availableForDispatch || 0;
      const alreadyDispatched = selectedJobCard.dispatchedQuantity || 0;
      const actualQuantity = availableQty - alreadyDispatched;

      setFormData((prev) => ({
        ...prev,
        jobCardId: selectedJobCard.id,
        clientName: selectedJobCard.clientName,
        quantity: actualQuantity,
        notebookSize: selectedJobCard.notebookSize,
        estimatedDelivery: deliveryDate.toISOString().split("T")[0],
        totalCartons: Math.ceil(actualQuantity / 20), // 20 notebooks per carton
        deliveryValue: actualQuantity * 15, // Default rate
      }));

      console.log("Job Card Selected for Dispatch:", {
        id: selectedJobCard.id,
        clientName: selectedJobCard.clientName,
        totalQuantity: selectedJobCard.quantity,
        completedQuantity: selectedJobCard.completedQuantity,
        availableForDispatch: availableQty,
        alreadyDispatched: alreadyDispatched,
        remainingToDispatch: actualQuantity,
        allStagesCompleted: selectedJobCard.stageAllocations?.every(
          (s) => s.status === "completed"
        ),
      });
    }
  };

  const handleTransporterSelect = (transporterName: string) => {
    const transporter = transporters.find((t) => t.name === transporterName);
    if (transporter) {
      setFormData((prev) => ({
        ...prev,
        transporter: transporter.name,
        transporterContact: transporter.contact,
      }));
    }
  };

  const addDeliveryLocation = () => {
    const newLocationId = `LOC-${String(deliveryLocations.length + 1).padStart(
      3,
      "0"
    )}`;
    const newLocation: DeliveryLocation = {
      locationId: newLocationId,
      locationName: "",
      address: "",
      contactPerson: "",
      contactNumber: "",
      quantity: 0,
      cartons: 0,
      deliveryInstructions: "",
      deliveryTime: "10:00",
      status: "pending",
    };
    setDeliveryLocations([...deliveryLocations, newLocation]);
  };

  const removeDeliveryLocation = (locationId: string) => {
    if (deliveryLocations.length > 1) {
      setDeliveryLocations(
        deliveryLocations.filter((loc) => loc.locationId !== locationId)
      );
    }
  };

  const updateDeliveryLocation = (
    locationId: string,
    field: string,
    value: string | number
  ) => {
    setDeliveryLocations((prev) =>
      prev.map((loc) => {
        if (loc.locationId === locationId) {
          const updatedLocation = { ...loc, [field]: value };

          // Auto-calculate cartons when quantity changes
          if (field === "quantity" && typeof value === "number") {
            updatedLocation.cartons = Math.ceil(value / 20); // 20 notebooks per carton
          }

          return updatedLocation;
        }
        return loc;
      })
    );
  };

  // Calculate totals from delivery locations
  const calculateTotals = useCallback(() => {
    const totalQuantity = deliveryLocations.reduce(
      (sum, loc) => sum + (loc.quantity || 0),
      0
    );
    const totalCartons = deliveryLocations.reduce(
      (sum, loc) => sum + (loc.cartons || 0),
      0
    );

    setFormData((prev) => ({
      ...prev,
      quantity: totalQuantity,
      totalCartons: totalCartons,
      deliveryValue: totalQuantity * 15, // Default rate
    }));
  }, [deliveryLocations]);

  useEffect(() => {
    calculateTotals();
  }, [deliveryLocations, calculateTotals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Get the selected batch to ensure we have the correct product name
    const selectedBatch = allBatches.find(
      (batch) => batch.id === formData.batchId
    );
    const productName =
      selectedBatch?.productName || formData.notebookSize || "Unknown Product";

    const dispatchData = {
      jobCardId: formData.jobCardId,
      batchId: formData.batchId, // Include batch ID for tracking
      clientName: formData.clientName,
      deliveryLocation: formData.deliveryLocation,
      deliveryAddress: formData.deliveryAddress,
      quantity: formData.quantity,
      notebookSize: productName, // Use batch product name
      scheduledDate: formData.scheduledDate,
      status: "scheduled" as const,
      transporter: formData.transporter,
      transporterContact: formData.transporterContact,
      vehicleNumber: formData.vehicleNumber,
      driverName: formData.driverName,
      driverContact: formData.driverContact,
      estimatedDelivery: formData.estimatedDelivery,
      actualDelivery: null,
      totalCartons: formData.totalCartons,
      deliveryValue: formData.deliveryValue,
      challanNumber: editingDispatch
        ? editingDispatch.challanNumber
        : `CH-${new Date().getFullYear()}-${String(
            Math.floor(Math.random() * 1000)
          ).padStart(3, "0")}`,
      notes: formData.notes,
      multipleLocations: deliveryLocations,
      items: [
        {
          itemId: "1",
          itemName: formData.notebookSize,
          quantity: formData.quantity,
        },
      ],
      dispatchDate: formData.scheduledDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingDispatch) {
      updateDispatch.mutate(
        { id: editingDispatch.id, data: dispatchData },
        {
          onSuccess: () => {
            onClose();
            // Automatically reload the page to refresh data
            window.location.reload();
          },
          onError: (error) => {
            console.error("Error updating dispatch:", error);
            alert("Failed to update dispatch. Please try again.");
          },
        }
      );
    } else {
      createDispatch.mutate(dispatchData, {
        onSuccess: (newDispatch) => {
          // Update job card with dispatch tracking
          const selectedJobCard = jobCards.find(
            (jc) => jc.id === formData.jobCardId
          );
          if (selectedJobCard) {
            const currentDispatched = selectedJobCard.dispatchedQuantity || 0;
            const newDispatchedTotal = currentDispatched + formData.quantity;
            const availableForDispatch =
              selectedJobCard.availableForDispatch || 0;
            const newAvailableForDispatch =
              availableForDispatch - formData.quantity;

            // Add dispatch record to job card
            const dispatches = selectedJobCard.dispatches || [];
            dispatches.push({
              dispatchId: newDispatch.id,
              dispatchedQuantity: formData.quantity,
              dispatchDate: formData.scheduledDate,
            });

            updateJobCard.mutate({
              id: formData.jobCardId,
              data: {
                dispatchedQuantity: newDispatchedTotal,
                availableForDispatch: Math.max(0, newAvailableForDispatch),
                dispatches,
                updatedAt: new Date().toISOString(),
              },
            });
          }

          onClose();
          // Automatically reload the page to refresh data
          window.location.reload();
        },
        onError: (error) => {
          console.error("Error creating dispatch:", error);
          alert("Failed to create dispatch. Please try again.");
        },
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingDispatch
              ? "Edit Dispatch Challan"
              : "Create Dispatch Challan"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Batch Selection */}
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-2 mb-3">
              <Layers className="h-5 w-5 text-purple-600" />
              <h3 className="font-medium text-purple-900">
                Select Completed Batch for Dispatch
              </h3>
            </div>

            {completedBatches.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  No completed batches available for dispatch. Complete
                  production batches first.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(batchesByJobCard).map(
                  ([jobCardId, batches]) => {
                    const jobCard = jobCards.find((jc) => jc.id === jobCardId);
                    return (
                      <div
                        key={jobCardId}
                        className="bg-white rounded-lg border border-purple-200 p-4"
                      >
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Job Card: {jobCardId} - {jobCard?.clientName}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {batches.map((batch) => {
                            const availableQty =
                              (batch.availableForDispatch || 0) -
                              (batch.dispatchedQuantity || 0);
                            return (
                              <button
                                key={batch.id}
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    jobCardId: batch.jobCardId,
                                    batchId: batch.id,
                                    batchNumber: batch.batchNumber,
                                    batchRange: formatRange(batch.range),
                                    clientName: jobCard?.clientName || "",
                                    notebookSize: batch.productName,
                                    quantity: availableQty,
                                    totalCartons: Math.ceil(availableQty / 20),
                                    deliveryValue: availableQty * 15,
                                  }));
                                }}
                                className={`p-3 rounded-lg border-2 text-left transition-all ${
                                  formData.batchId === batch.id
                                    ? "border-purple-600 bg-purple-100"
                                    : "border-purple-200 bg-white hover:border-purple-400"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-semibold text-purple-900">
                                    Batch #{batch.batchNumber}
                                  </span>
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                    Completed
                                  </span>
                                </div>
                                <div className="text-sm text-gray-700">
                                  <p>Range: {formatRange(batch.range)}</p>
                                  <p>Available: {availableQty} units</p>
                                  <p className="text-xs text-gray-500">
                                    {batch.productName}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}

            {formData.batchId && (
              <div className="mt-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg p-4">
                <h4 className="font-semibold mb-2">Selected Batch Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="opacity-90">Batch Number:</span>
                    <span className="ml-2 font-semibold">
                      #{formData.batchNumber}
                    </span>
                  </div>
                  <div>
                    <span className="opacity-90">Range:</span>
                    <span className="ml-2 font-semibold">
                      {formData.batchRange}
                    </span>
                  </div>
                  <div>
                    <span className="opacity-90">Client:</span>
                    <span className="ml-2 font-semibold">
                      {formData.clientName}
                    </span>
                  </div>
                  <div>
                    <span className="opacity-90">Quantity:</span>
                    <span className="ml-2 font-semibold">
                      {formData.quantity} units
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Transport Details */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900 mb-3">
              Transport Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transporter *
                </label>
                <select
                  value={formData.transporter}
                  onChange={(e) => handleTransporterSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {transporters.map((transporter) => (
                    <option key={transporter.name} value={transporter.name}>
                      {transporter.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Number *
                </label>
                <input
                  type="text"
                  value={formData.vehicleNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      vehicleNumber: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="TN-45-BC-1234"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver Name *
                </label>
                <input
                  type="text"
                  value={formData.driverName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      driverName: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver Contact *
                </label>
                <input
                  type="tel"
                  value={formData.driverContact}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      driverContact: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Date *
                </label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      scheduledDate: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Delivery *
                </label>
                <input
                  type="date"
                  value={formData.estimatedDelivery}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      estimatedDelivery: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Multiple Delivery Locations */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-purple-900">
                Delivery Locations
              </h3>
              <button
                type="button"
                onClick={addDeliveryLocation}
                className="bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 flex items-center space-x-1 text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Location</span>
              </button>
            </div>

            <div className="space-y-4">
              {deliveryLocations.map((location, index) => (
                <div
                  key={location.locationId}
                  className="bg-white p-4 rounded-lg border border-purple-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">
                      Location {index + 1}
                    </h4>
                    {deliveryLocations.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeDeliveryLocation(location.locationId)
                        }
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <MapPin className="inline h-4 w-4 mr-1" />
                        Location Name *
                      </label>
                      <input
                        type="text"
                        value={location.locationName}
                        onChange={(e) =>
                          updateDeliveryLocation(
                            location.locationId,
                            "locationName",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Main Campus, Branch Office"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <User className="inline h-4 w-4 mr-1" />
                        Contact Person *
                      </label>
                      <input
                        type="text"
                        value={location.contactPerson}
                        onChange={(e) =>
                          updateDeliveryLocation(
                            location.locationId,
                            "contactPerson",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address *
                      </label>
                      <textarea
                        value={location.address}
                        onChange={(e) =>
                          updateDeliveryLocation(
                            location.locationId,
                            "address",
                            e.target.value
                          )
                        }
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Number *
                      </label>
                      <input
                        type="tel"
                        value={location.contactNumber}
                        onChange={(e) =>
                          updateDeliveryLocation(
                            location.locationId,
                            "contactNumber",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Package className="inline h-4 w-4 mr-1" />
                        Quantity *
                      </label>
                      <input
                        type="number"
                        value={location.quantity}
                        onChange={(e) =>
                          updateDeliveryLocation(
                            location.locationId,
                            "quantity",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cartons
                      </label>
                      <input
                        type="number"
                        value={location.cartons}
                        onChange={(e) =>
                          updateDeliveryLocation(
                            location.locationId,
                            "cartons",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Clock className="inline h-4 w-4 mr-1" />
                        Delivery Time
                      </label>
                      <input
                        type="time"
                        value={location.deliveryTime}
                        onChange={(e) =>
                          updateDeliveryLocation(
                            location.locationId,
                            "deliveryTime",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={location.status}
                        onChange={(e) =>
                          updateDeliveryLocation(
                            location.locationId,
                            "status",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_transit">In Transit</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Instructions
                    </label>
                    <input
                      type="text"
                      value={location.deliveryInstructions}
                      onChange={(e) =>
                        updateDeliveryLocation(
                          location.locationId,
                          "deliveryInstructions",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Special delivery instructions"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Dispatch Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-500">Total Quantity</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formData.quantity.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Cartons</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formData.totalCartons}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Delivery Value</div>
                <div className="text-lg font-semibold text-gray-900">
                  ₹{formData.deliveryValue.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Locations</div>
                <div className="text-lg font-semibold text-gray-900">
                  {deliveryLocations.length}
                </div>
              </div>
            </div>
          </div>

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

          {/* Finished Products Table */}
          {lineItems.length > 0 && (
            <FinishedProductsTable
              lineItems={lineItems}
              finishedProducts={finishedProducts}
              getMatchedProduct={getFinishedProduct}
              title="Dispatch - Finished Products Impact"
              subtitle="Products being dispatched and their inventory impact"
              variant="matching"
              showPricing={true}
            />
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              disabled={
                !formData.jobCardId ||
                deliveryLocations.some(
                  (loc) => !loc.locationName || !loc.quantity
                )
              }
            >
              {editingDispatch ? "Update" : "Create"} Dispatch Challan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DispatchForm;
