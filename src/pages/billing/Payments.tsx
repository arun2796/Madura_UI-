import React, { useState } from "react";
import {
  Search,
  Filter,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  CreditCard,
  Plus,
  Eye,
  CreditCard as Edit2,
  X,
} from "lucide-react";
import { useData } from "../../hooks/useData";

const Payments = () => {
  const { invoices, updateInvoice } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

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

  // Calculate payment statistics
  const totalInvoiced = invoices.reduce(
    (sum, inv) => sum + (inv.totalAmount || 0),
    0
  );
  const totalPaid = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalPending = invoices
    .filter((inv) => inv.status === "sent")
    .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalOverdue = invoices
    .filter((inv) => {
      const today = new Date();
      return (
        inv.status === "sent" && inv.dueDate && new Date(inv.dueDate) < today
      );
    })
    .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

  // Get overdue invoices
  const overdueInvoices = invoices.filter((inv) => {
    const today = new Date();
    return (
      inv.status === "sent" && inv.dueDate && new Date(inv.dueDate) < today
    );
  });

  // Get recent payments
  const recentPayments = invoices
    .filter((inv) => inv.status === "paid" && inv.paymentDate)
    .sort(
      (a, b) =>
        new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    )
    .slice(0, 10);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4" />;
      case "sent":
        return <Clock className="h-4 w-4" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const handleRecordPayment = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentForm(true);
  };

  const handlePaymentSubmit = (paymentData) => {
    if (selectedInvoice) {
      updateInvoice(selectedInvoice.id, {
        status: "paid",
        paymentDate: paymentData.paymentDate,
        paymentMethod: paymentData.paymentMethod,
        paymentReference: paymentData.paymentReference,
      });
      setShowPaymentForm(false);
      setSelectedInvoice(null);
    }
  };

  const getDaysOverdue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Payment Tracking</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowPaymentForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Payment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Total Invoiced
              </h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹{totalInvoiced.toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {invoices.length} total invoices
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Amount Paid</h3>
              <p className="text-2xl font-bold text-green-600 mt-1">
                ₹{totalPaid.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-green-600">
            {Math.round((totalPaid / totalInvoiced) * 100)}% collection rate
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Pending Payments
              </h3>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                ₹{totalPending.toLocaleString()}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-orange-600">
            {invoices.filter((inv) => inv.status === "sent").length} pending
            invoices
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Overdue Amount
              </h3>
              <p className="text-2xl font-bold text-red-600 mt-1">
                ₹{totalOverdue.toLocaleString()}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-red-600">
            {overdueInvoices.length} overdue invoices
          </div>
        </div>
      </div>

      {/* Overdue Invoices Alert */}
      {overdueInvoices.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold text-red-900">
              Overdue Invoices Requiring Attention
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {overdueInvoices.slice(0, 4).map((invoice) => (
              <div
                key={invoice.id}
                className="bg-white border border-red-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-red-900">
                    {invoice.clientName || "Unknown Client"}
                  </h3>
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    {invoice.dueDate ? getDaysOverdue(invoice.dueDate) : 0} days
                    overdue
                  </span>
                </div>
                <div className="text-sm text-red-700 space-y-1">
                  <div>Invoice: {invoice.id || "N/A"}</div>
                  <div>
                    Amount: ₹{(invoice.totalAmount || 0).toLocaleString()}
                  </div>
                  <div>
                    Due Date:{" "}
                    {invoice.dueDate
                      ? new Date(invoice.dueDate).toLocaleDateString()
                      : "Not set"}
                  </div>
                </div>
                <button
                  onClick={() => handleRecordPayment(invoice)}
                  className="w-full mt-3 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 transition-colors duration-200"
                >
                  Record Payment
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
              <option value="sent">Pending Payment</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Payment Tracking Table */}
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
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => {
                const today = new Date();
                const dueDate = invoice.dueDate
                  ? new Date(invoice.dueDate)
                  : new Date();
                const isOverdue =
                  invoice.status === "sent" &&
                  invoice.dueDate &&
                  dueDate < today;
                const daysOverdue =
                  isOverdue && invoice.dueDate
                    ? getDaysOverdue(invoice.dueDate)
                    : 0;
                const daysToDue =
                  invoice.status === "sent" && invoice.dueDate
                    ? Math.ceil(
                        (dueDate.getTime() - today.getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    : 0;

                return (
                  <tr
                    key={invoice.id}
                    className={`hover:bg-gray-50 ${
                      isOverdue ? "bg-red-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">
                        {invoice.id || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {invoice.invoiceDate
                          ? new Date(invoice.invoiceDate).toLocaleDateString()
                          : "Not set"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">
                        {invoice.clientName || "Unknown Client"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {invoice.clientContact || "No contact"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{(invoice.totalAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.dueDate
                        ? new Date(invoice.dueDate).toLocaleDateString()
                        : "Not set"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {invoice.status === "paid" ? (
                        <span className="text-green-600">Paid</span>
                      ) : isOverdue ? (
                        <span className="text-red-600 font-medium">
                          {daysOverdue} overdue
                        </span>
                      ) : daysToDue >= 0 ? (
                        <span className="text-orange-600">
                          {daysToDue} days left
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center space-x-1 ${
                          isOverdue
                            ? "bg-red-100 text-red-800"
                            : getStatusColor(invoice.status)
                        }`}
                      >
                        {getStatusIcon(isOverdue ? "overdue" : invoice.status)}
                        <span className="ml-1">
                          {isOverdue
                            ? "Overdue"
                            : invoice.status.charAt(0).toUpperCase() +
                              invoice.status.slice(1)}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.status === "paid" ? (
                        <div>
                          <div className="font-medium">
                            {invoice.paymentMethod || "Not specified"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {invoice.paymentDate
                              ? new Date(
                                  invoice.paymentDate
                                ).toLocaleDateString()
                              : ""}
                          </div>
                          {invoice.paymentReference && (
                            <div className="text-xs text-gray-500">
                              Ref: {invoice.paymentReference}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        {invoice.status !== "paid" && (
                          <button
                            onClick={() => handleRecordPayment(invoice)}
                            className="text-green-600 hover:text-green-800 bg-green-50 px-2 py-1 rounded text-xs font-medium"
                          >
                            <DollarSign className="h-3 w-3 inline mr-1" />
                            Record Payment
                          </button>
                        )}
                        <button className="text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded text-xs font-medium">
                          <Eye className="h-3 w-3 inline mr-1" />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Payments and Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Payments
          </h2>
          <div className="space-y-3">
            {recentPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-green-900">
                    {payment.clientName || "Unknown Client"}
                  </div>
                  <div className="text-sm text-green-700">
                    {payment.id || "N/A"}
                  </div>
                  <div className="text-xs text-green-600">
                    {payment.paymentMethod} • {payment.paymentReference}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-900">
                    ₹{(payment.totalAmount || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-green-700">
                    {payment.paymentDate
                      ? new Date(payment.paymentDate).toLocaleDateString()
                      : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Payment Methods Analysis
          </h2>
          <div className="space-y-4">
            {["Bank Transfer", "Cash", "Cheque", "UPI", "Card"].map(
              (method) => {
                const methodPayments = recentPayments.filter(
                  (p) => p.paymentMethod === method
                );
                const methodTotal = methodPayments.reduce(
                  (sum, p) => sum + (p.totalAmount || 0),
                  0
                );
                const percentage =
                  totalPaid > 0 ? (methodTotal / totalPaid) * 100 : 0;

                return (
                  <div
                    key={method}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{method}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-20">
                        ₹{methodTotal.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500 w-12">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <PaymentForm
          isOpen={showPaymentForm}
          onClose={() => {
            setShowPaymentForm(false);
            setSelectedInvoice(null);
          }}
          invoice={selectedInvoice}
          onSubmit={handlePaymentSubmit}
        />
      )}
    </div>
  );
};

// Payment Form Component
const PaymentForm = ({ isOpen, onClose, invoice, onSubmit }) => {
  const [paymentData, setPaymentData] = useState({
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "Bank Transfer",
    paymentReference: "",
    notes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(paymentData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Record Payment
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {invoice && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="text-sm text-blue-700">
                <div>
                  <span className="font-medium">Invoice:</span>{" "}
                  {invoice.id || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Client:</span>{" "}
                  {invoice.clientName || "Unknown Client"}
                </div>
                <div>
                  <span className="font-medium">Amount:</span> ₹
                  {(invoice.totalAmount || 0).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Date *
            </label>
            <input
              type="date"
              value={paymentData.paymentDate}
              onChange={(e) =>
                setPaymentData((prev) => ({
                  ...prev,
                  paymentDate: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method *
            </label>
            <select
              value={paymentData.paymentMethod}
              onChange={(e) =>
                setPaymentData((prev) => ({
                  ...prev,
                  paymentMethod: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Reference
            </label>
            <input
              type="text"
              value={paymentData.paymentReference}
              onChange={(e) =>
                setPaymentData((prev) => ({
                  ...prev,
                  paymentReference: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Transaction ID, Cheque No, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={paymentData.notes}
              onChange={(e) =>
                setPaymentData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Payments;
