import React, { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MapPin,
  Truck,
  Calendar,
  CheckCircle,
  Eye,
  CreditCard as Edit,
  Trash2,
  FileText,
  X,
} from "lucide-react";
import { useData } from "../hooks/useData";
import DispatchForm from "../components/forms/DispatchForm";

const Dispatch = () => {
  const { dispatches, deleteDispatch, updateDispatch } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingDispatch, setEditingDispatch] = useState(null);
  const [viewingChallan, setViewingChallan] = useState(null);

  // Filter dispatches based on search and status
  const filteredDispatches = dispatches.filter((dispatch) => {
    const matchesSearch =
      (dispatch.clientName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (dispatch.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dispatch.deliveryLocation || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || dispatch.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "in_transit":
        return "bg-yellow-100 text-yellow-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "delayed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Calendar className="h-4 w-4" />;
      case "in_transit":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getLocationStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "in_transit":
        return "bg-yellow-100 text-yellow-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleEdit = (dispatch) => {
    setEditingDispatch(dispatch);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this dispatch?")) {
      deleteDispatch(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingDispatch(null);
  };

  const handleViewChallan = (dispatch) => {
    setViewingChallan(dispatch);
  };

  const handleUpdateLocationStatus = (
    dispatchId: string,
    locationId: string,
    newStatus: string
  ) => {
    const dispatch = dispatches.find((d) => d.id === dispatchId);
    if (dispatch && dispatch.multipleLocations) {
      const updatedLocations = dispatch.multipleLocations.map((loc) =>
        loc.locationId === locationId ? { ...loc, status: newStatus } : loc
      );

      // Update overall dispatch status based on location statuses
      const allDelivered = updatedLocations.every(
        (loc) => loc.status === "delivered"
      );
      const anyInTransit = updatedLocations.some(
        (loc) => loc.status === "in_transit"
      );

      let overallStatus = dispatch.status;
      if (allDelivered) {
        overallStatus = "delivered";
      } else if (anyInTransit) {
        overallStatus = "in_transit";
      }

      updateDispatch(dispatchId, {
        multipleLocations: updatedLocations,
        status: overallStatus,
        actualDelivery: allDelivered
          ? new Date().toISOString().split("T")[0]
          : null,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Dispatch Management
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Dispatch Challan</span>
        </button>
      </div>

      {/* Dispatch Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Scheduled</h3>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {dispatches.filter((d) => d.status === "scheduled").length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">In Transit</h3>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {dispatches.filter((d) => d.status === "in_transit").length}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Truck className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Delivered Today
              </h3>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {
                  dispatches.filter(
                    (d) =>
                      d.status === "delivered" &&
                      d.actualDelivery ===
                        new Date().toISOString().split("T")[0]
                  ).length
                }
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
                Total Locations
              </h3>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {dispatches.reduce(
                  (total, d) => total + (d.multipleLocations?.length || 1),
                  0
                )}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by dispatch ID, client, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="delayed">Delayed</option>
            </select>
            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Dispatch Cards with Multiple Locations */}
      <div className="space-y-6">
        {filteredDispatches.map((dispatch) => (
          <div
            key={dispatch.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            {/* Dispatch Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {dispatch.id}
                </h3>
                <span
                  className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center space-x-1 ${getStatusColor(
                    dispatch.status
                  )}`}
                >
                  {getStatusIcon(dispatch.status)}
                  <span className="ml-1">
                    {dispatch.status.replace("_", " ").toUpperCase()}
                  </span>
                </span>
                <span className="text-sm text-gray-500">
                  Challan: {dispatch.challanNumber || "Not assigned"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleViewChallan(dispatch)}
                  className="text-purple-600 hover:text-purple-800 bg-purple-50 px-3 py-1 rounded text-sm font-medium"
                  title="View Challan"
                >
                  <FileText className="h-4 w-4 inline mr-1" />
                  Challan
                </button>
                <button
                  onClick={() => handleEdit(dispatch)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Edit Dispatch"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(dispatch.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Delete Dispatch"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Dispatch Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-500">Client</div>
                <div className="font-medium text-gray-900">
                  {dispatch.clientName || "Unknown Client"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Product</div>
                <div className="font-medium text-gray-900">
                  {dispatch.notebookSize || "Not specified"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Quantity</div>
                <div className="font-medium text-gray-900">
                  {(dispatch.quantity || 0).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Transporter</div>
                <div className="font-medium text-gray-900">
                  {dispatch.transporter || "Not assigned"}
                </div>
                <div className="text-xs text-gray-500">
                  {dispatch.vehicleNumber || ""}
                </div>
              </div>
            </div>

            {/* Multiple Delivery Locations */}
            {dispatch.multipleLocations &&
              dispatch.multipleLocations.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Delivery Locations ({dispatch.multipleLocations.length})
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {dispatch.multipleLocations.map((location, index) => (
                      <div
                        key={location.locationId}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900">
                            {location.locationName || "Unknown Location"}
                          </h5>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getLocationStatusColor(
                                location.status
                              )}`}
                            >
                              {location.status.replace("_", " ").toUpperCase()}
                            </span>
                            <select
                              value={location.status}
                              onChange={(e) =>
                                handleUpdateLocationStatus(
                                  dispatch.id,
                                  location.locationId,
                                  e.target.value
                                )
                              }
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="pending">Pending</option>
                              <option value="in_transit">In Transit</option>
                              <option value="delivered">Delivered</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-start space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <div className="text-gray-900">
                                {location.address || "Address not provided"}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-gray-500">Contact:</span>
                              <div className="font-medium">
                                {location.contactPerson || "Not provided"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {location.contactNumber || ""}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">Quantity:</span>
                              <div className="font-medium">
                                {(location.quantity || 0).toLocaleString()}{" "}
                                units
                              </div>
                              <div className="text-xs text-gray-500">
                                {location.cartons || 0} cartons
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-gray-500">
                                Delivery Time:
                              </span>
                              <div className="font-medium">
                                {location.deliveryTime || "Not specified"}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">
                                Instructions:
                              </span>
                              <div className="text-xs text-gray-600">
                                {location.deliveryInstructions || "None"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Dispatch Details */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Scheduled Date:</span>
                  <div className="font-medium">
                    {dispatch.scheduledDate
                      ? new Date(dispatch.scheduledDate).toLocaleDateString()
                      : "Not scheduled"}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Estimated Delivery:</span>
                  <div className="font-medium">
                    {dispatch.estimatedDelivery
                      ? new Date(
                          dispatch.estimatedDelivery
                        ).toLocaleDateString()
                      : "Not estimated"}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Driver:</span>
                  <div className="font-medium">
                    {dispatch.driverName || "Not assigned"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {dispatch.driverContact || ""}
                  </div>
                </div>
              </div>

              {dispatch.notes && (
                <div className="mt-3">
                  <span className="text-gray-500 text-sm">Notes:</span>
                  <div className="text-sm text-gray-700 mt-1">
                    {dispatch.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Challan View Modal */}
      {viewingChallan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Dispatch Challan - {viewingChallan.challanNumber}
              </h2>
              <button
                onClick={() => setViewingChallan(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Challan Header */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  MADURA PAPERS
                </h1>
                <p className="text-sm text-gray-600">
                  No.8, Panthady 5th Street, MADURAI - 625001
                  <br />
                  Ph.: 0452-2337071 / Fax: 0452-5504471
                </p>
                <h2 className="text-lg font-semibold text-gray-900 mt-4">
                  DISPATCH CHALLAN
                </h2>
              </div>

              {/* Challan Details */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Challan No:</span>{" "}
                      {viewingChallan.challanNumber}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span>{" "}
                      {viewingChallan.scheduledDate
                        ? new Date(
                            viewingChallan.scheduledDate
                          ).toLocaleDateString()
                        : "Not scheduled"}
                    </div>
                    <div>
                      <span className="font-medium">Job Card:</span>{" "}
                      {viewingChallan.jobCardId}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Vehicle No:</span>{" "}
                      {viewingChallan.vehicleNumber}
                    </div>
                    <div>
                      <span className="font-medium">Driver:</span>{" "}
                      {viewingChallan.driverName}
                    </div>
                    <div>
                      <span className="font-medium">Contact:</span>{" "}
                      {viewingChallan.driverContact}
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Details */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Consignee Details:
                </h3>
                <div className="bg-gray-50 p-4 rounded">
                  <div className="font-medium">{viewingChallan.clientName}</div>
                  <div className="text-sm text-gray-600">
                    {viewingChallan.deliveryAddress}
                  </div>
                </div>
              </div>

              {/* Delivery Locations Table */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Delivery Locations:
                </h3>
                <table className="w-full border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        S.No
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Location
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Contact Person
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Quantity
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Cartons
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Time
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingChallan.multipleLocations?.map(
                      (location, index) => (
                        <tr key={location.locationId}>
                          <td className="border border-gray-300 px-4 py-2">
                            {index + 1}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <div className="font-medium">
                              {location.locationName || "Unknown Location"}
                            </div>
                            <div className="text-xs text-gray-600">
                              {location.address || "Address not provided"}
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <div>
                              {location.contactPerson || "Not provided"}
                            </div>
                            <div className="text-xs text-gray-600">
                              {location.contactNumber || ""}
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {(location.quantity || 0).toLocaleString()}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {location.cartons || 0}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {location.deliveryTime || "Not specified"}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <span
                              className={`px-2 py-1 text-xs rounded ${getLocationStatusColor(
                                location.status
                              )}`}
                            >
                              {location.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded">
                <div>
                  <div className="text-sm text-gray-500">Total Quantity</div>
                  <div className="font-semibold">
                    {(viewingChallan.quantity || 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Cartons</div>
                  <div className="font-semibold">
                    {viewingChallan.totalCartons || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Value</div>
                  <div className="font-semibold">
                    ₹{(viewingChallan.deliveryValue || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 mt-8">
                <div>
                  <div className="border-t border-gray-300 pt-2">
                    <div className="text-center text-sm">Prepared By</div>
                  </div>
                </div>
                <div>
                  <div className="border-t border-gray-300 pt-2">
                    <div className="text-center text-sm">
                      Authorized Signatory
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <DispatchForm
        isOpen={showForm}
        onClose={handleCloseForm}
        editingDispatch={editingDispatch}
      />
    </div>
  );
};

export default Dispatch;
