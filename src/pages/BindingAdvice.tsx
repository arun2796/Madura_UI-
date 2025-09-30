import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Eye,
  CreditCard as Edit,
  Trash2,
  Download,
} from "lucide-react";
import {
  useBindingAdvices,
  useUpdateBindingAdvice,
  useDeleteBindingAdvice,
} from "../hooks/useApiQueries";
import BindingAdviceView from "../components/BindingAdviceView";

const BindingAdvice = () => {
  // Use React Query hooks for data operations
  const { data: bindingAdvices = [], isLoading, error } = useBindingAdvices();
  const updateBindingAdvice = useUpdateBindingAdvice();
  const deleteBindingAdvice = useDeleteBindingAdvice();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewingAdvice, setViewingAdvice] = useState(null);
  const [showView, setShowView] = useState(false);

  // Filter binding advices based on search and status
  const filteredAdvices = bindingAdvices.filter((advice) => {
    const matchesSearch =
      (advice.clientName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (advice.id || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || advice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleEdit = (advice) => {
    navigate("/binding-advice/edit", { state: { advice } });
  };

  const handleDelete = (id: string) => {
    if (
      window.confirm("Are you sure you want to delete this binding advice?")
    ) {
      deleteBindingAdvice.mutate(id, {
        onSuccess: () => {
          // React Query will automatically refresh the data
          console.log("Binding advice deleted successfully");
        },
        onError: (error) => {
          console.error("Error deleting binding advice:", error);
          alert("Failed to delete binding advice. Please try again.");
        },
      });
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    updateBindingAdvice.mutate(
      {
        id,
        data: {
          status: newStatus,
          ...(newStatus === "approved"
            ? { approvedDate: new Date().toISOString().split("T")[0] }
            : {}),
        },
      },
      {
        onSuccess: () => {
          // React Query will automatically refresh the data
          console.log("Binding advice status updated successfully");
        },
        onError: (error) => {
          console.error("Error updating binding advice status:", error);
          alert("Failed to update status. Please try again.");
        },
      }
    );
  };

  const handleView = (advice) => {
    setViewingAdvice(advice);
    setShowView(true);
  };

  const handleCloseView = () => {
    setShowView(false);
    setViewingAdvice(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
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

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">
            Error loading binding advice
          </h3>
          <p className="text-red-600 text-sm mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Binding Advice</h1>
        <button
          onClick={() => navigate("/binding-advice/create")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Binding Advice</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by client name or ID..."
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
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Binding Advice List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pages
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reams/Sheets
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created / Approved
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAdvices.map((advice) => (
                <tr key={advice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {advice.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{advice.clientName}</div>
                      <div className="text-xs text-gray-500">
                        {advice.clientAddress}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>{advice.notebookSize}</div>
                      {advice.lineItems && advice.lineItems.length > 1 && (
                        <div className="text-xs text-gray-500">
                          {advice.lineItems.length} items
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>{advice.pages}</div>
                      {advice.lineItems && advice.lineItems.length > 1 && (
                        <div className="text-xs text-gray-500">avg</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(advice.quantity || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">
                        {advice.reams || 0} reams
                      </div>
                      <div className="text-xs text-gray-500">
                        {(advice.sheets || 0).toLocaleString()} sheets
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{(advice.totalAmount || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={advice.status}
                      onChange={(e) =>
                        handleStatusChange(advice.id, e.target.value)
                      }
                      className={`px-3 py-1 text-xs leading-5 font-semibold rounded-full border-0 ${getStatusColor(
                        advice.status
                      )}`}
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div className="font-medium">
                        {new Date(advice.createdDate).toLocaleDateString()}
                      </div>
                      {advice.status === "approved" && advice.approvedDate && (
                        <div className="text-xs text-green-600 font-medium">
                          Approved:{" "}
                          {new Date(advice.approvedDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleView(advice)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(advice)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-orange-600 hover:text-orange-800">
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(advice.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500">
            Total Binding Advice
          </h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {bindingAdvices.length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500">Approved</h3>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {bindingAdvices.filter((a) => a.status === "approved").length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500">Pending</h3>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {bindingAdvices.filter((a) => a.status === "sent").length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            ₹
            {(
              bindingAdvices.reduce((sum, a) => sum + (a.totalAmount || 0), 0) /
              100000
            ).toFixed(1)}
            L
          </p>
        </div>
      </div>

      <BindingAdviceView
        isOpen={showView}
        onClose={handleCloseView}
        advice={viewingAdvice}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default BindingAdvice;
