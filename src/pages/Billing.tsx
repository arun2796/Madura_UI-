import React, { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  FileText,
  DollarSign,
  Calendar,
  AlertCircle,
  Eye,
  CreditCard as Edit,
  Trash2,
  Send,
  TestTube,
} from "lucide-react";
import { useData } from "../hooks/useData";
import InvoiceForm from "../components/forms/InvoiceForm";
import InvoiceView from "../components/InvoiceView";
import TestInvoiceGeneration from "../components/TestInvoiceGeneration";
import ProductionInvoiceTest from "../components/ProductionInvoiceTest";
import QuickInvoiceTest from "../components/QuickInvoiceTest";

const Billing = () => {
  const { invoices, dispatches, updateInvoice, deleteInvoice } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [showView, setShowView] = useState(false);
  const [sourceDispatch, setSourceDispatch] = useState(null);
  const [showTest, setShowTest] = useState(false);
  const [showProductionTest, setShowProductionTest] = useState(false);
  const [showQuickTest, setShowQuickTest] = useState(false);

  // Filter invoices based on search and status
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      (invoice.clientName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (invoice.id || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get delivered dispatches that don't have invoices yet
  const deliveredDispatches = dispatches.filter(
    (dispatch) =>
      dispatch.status === "delivered" &&
      !invoices.some((invoice) => invoice.dispatchId === dispatch.id)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-red-200 text-red-900";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTotalAmount = () => {
    return invoices.reduce(
      (total, invoice) => total + (invoice.totalAmount || 0),
      0
    );
  };

  const getPaidAmount = () => {
    return invoices
      .filter((inv) => inv.status === "paid")
      .reduce((total, invoice) => total + (invoice.totalAmount || 0), 0);
  };

  const getOverdueAmount = () => {
    const today = new Date();
    return invoices
      .filter(
        (inv) =>
          inv.status === "sent" && new Date(inv.dueDate || new Date()) < today
      )
      .reduce((total, invoice) => total + (invoice.totalAmount || 0), 0);
  };

  const getPendingAmount = () => {
    return invoices
      .filter((inv) => inv.status === "sent")
      .reduce((total, invoice) => total + (invoice.totalAmount || 0), 0);
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setSourceDispatch(null);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      deleteInvoice(id);
    }
  };

  const handleView = (invoice) => {
    setViewingInvoice(invoice);
    setShowView(true);
  };

  const handleCreateFromDispatch = (dispatch) => {
    setSourceDispatch(dispatch);
    setEditingInvoice(null);
    setShowForm(true);
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    const updates: any = { status: newStatus };

    if (newStatus === "paid") {
      updates.paymentDate = new Date().toISOString().split("T")[0];
      updates.paymentMethod = "Bank Transfer"; // Default method
    }

    updateInvoice(id, updates);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingInvoice(null);
    setSourceDispatch(null);
  };

  const handleCloseView = () => {
    setShowView(false);
    setViewingInvoice(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Accounts</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowQuickTest(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <TestTube className="h-4 w-4" />
            <span>Quick Test</span>
          </button>
          <button
            onClick={() => setShowProductionTest(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <TestTube className="h-4 w-4" />
            <span>Production Test</span>
          </button>
          <button
            onClick={() => setShowTest(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <TestTube className="h-4 w-4" />
            <span>Mock Test</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Total Invoiced
              </h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹{getTotalAmount().toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Amount Paid</h3>
              <p className="text-2xl font-bold text-green-600 mt-1">
                ₹{getPaidAmount().toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Outstanding</h3>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                ₹{getPendingAmount().toLocaleString()}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Overdue</h3>
              <p className="text-2xl font-bold text-red-600 mt-1">
                ₹{getOverdueAmount().toLocaleString()}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Ready to Invoice - Delivered Dispatches */}
      {deliveredDispatches.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Ready to Invoice - Delivered Dispatches
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {deliveredDispatches.map((dispatch) => (
              <div
                key={dispatch.id}
                className="border border-green-200 bg-green-50 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-green-900">{dispatch.id}</h3>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Delivered
                  </span>
                </div>
                <div className="text-sm text-green-700 space-y-1">
                  <div>
                    <span className="font-medium">Client:</span>{" "}
                    {dispatch.clientName || "Unknown Client"}
                  </div>
                  <div>
                    <span className="font-medium">Quantity:</span>{" "}
                    {(dispatch.quantity || 0).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Value:</span> ₹
                    {(dispatch.deliveryValue || 0).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Delivered:</span>{" "}
                    {dispatch.actualDelivery
                      ? new Date(dispatch.actualDelivery).toLocaleDateString()
                      : "Today"}
                  </div>
                </div>
                <button
                  onClick={() => handleCreateFromDispatch(dispatch)}
                  className="w-full mt-3 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors duration-200"
                >
                  Create Invoice
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by invoice ID, client name..."
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
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600">
                      {invoice.id}
                    </div>
                    <div className="text-sm text-gray-500">
                      {invoice.dispatchId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.clientName || "Unknown Client"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{(invoice.totalAmount || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.invoiceDate
                      ? new Date(invoice.invoiceDate).toLocaleDateString()
                      : "Not set"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.dueDate
                      ? new Date(invoice.dueDate).toLocaleDateString()
                      : "Not set"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        invoice.status
                      )}`}
                    >
                      {invoice.status.charAt(0).toUpperCase() +
                        invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.paymentDate
                      ? new Date(invoice.paymentDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleView(invoice)}
                        className="text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded text-xs font-medium"
                      >
                        <Eye className="h-3 w-3 inline mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(invoice)}
                        className="text-green-600 hover:text-green-800 bg-green-50 px-2 py-1 rounded text-xs font-medium"
                      >
                        <Edit className="h-3 w-3 inline mr-1" />
                        Edit
                      </button>
                      <button className="text-purple-600 hover:text-purple-800 bg-purple-50 px-2 py-1 rounded text-xs font-medium">
                        <Send className="h-3 w-3 inline mr-1" />
                        Send
                      </button>
                      <button
                        onClick={() => handleDelete(invoice.id)}
                        className="text-red-600 hover:text-red-800 bg-red-50 px-2 py-1 rounded text-xs font-medium"
                      >
                        <Trash2 className="h-3 w-3 inline mr-1" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Payments
          </h2>
          <div className="space-y-3">
            {invoices
              .filter((inv) => inv.status === "paid")
              .slice(-5)
              .map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-green-900">
                      {invoice.clientName || "Unknown Client"}
                    </div>
                    <div className="text-sm text-green-700">{invoice.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-900">
                      ₹{(invoice.totalAmount || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-green-700">
                      {invoice.paymentDate
                        ? new Date(invoice.paymentDate).toLocaleDateString()
                        : ""}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Overdue Invoices
          </h2>
          <div className="space-y-3">
            {invoices
              .filter((inv) => {
                const today = new Date();
                return inv.status === "sent" && new Date(inv.dueDate) < today;
              })
              .map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-red-900">
                      {invoice.clientName || "Unknown Client"}
                    </div>
                    <div className="text-sm text-red-700">{invoice.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-red-900">
                      ₹{(invoice.totalAmount || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-red-700">
                      Due:{" "}
                      {invoice.dueDate
                        ? new Date(invoice.dueDate).toLocaleDateString()
                        : "Not set"}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <InvoiceForm
        isOpen={showForm}
        onClose={handleCloseForm}
        editingInvoice={editingInvoice}
        sourceDispatch={sourceDispatch}
      />

      <InvoiceView
        isOpen={showView}
        onClose={handleCloseView}
        invoice={viewingInvoice}
        onStatusChange={handleStatusChange}
      />

      {/* Quick Invoice Test Modal */}
      {showQuickTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Quick Invoice Generation Test
              </h2>
              <button
                onClick={() => setShowQuickTest(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <QuickInvoiceTest />
            </div>
          </div>
        </div>
      )}

      {/* Production Invoice Test Modal */}
      {showProductionTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Production Invoice Generation Test
              </h2>
              <button
                onClick={() => setShowProductionTest(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <ProductionInvoiceTest />
            </div>
          </div>
        </div>
      )}

      {/* Mock Test Invoice Generation Modal */}
      {showTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Mock Invoice Generation Test
              </h2>
              <button
                onClick={() => setShowTest(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <TestInvoiceGeneration />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
