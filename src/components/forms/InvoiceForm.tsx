import React, { useState, useEffect } from "react";
import { X, User, MapPin, Phone, Mail, FileText } from "lucide-react";
import { Invoice } from "../../hooks/useData";
import { Dispatch } from "../../services/entities";
import {
  useBindingAdvices,
  useDispatches,
  useJobCards,
  useCreateInvoice,
  useUpdateInvoice,
} from "../../hooks/useApiQueries";

interface InvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingInvoice?: Invoice | null;
  sourceDispatch?: Dispatch | null;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  isOpen,
  onClose,
  editingInvoice,
  sourceDispatch,
}) => {
  // React Query hooks for enhanced functionality
  const { data: bindingAdvicesQuery = [] } = useBindingAdvices();
  const { data: dispatchesQuery = [] } = useDispatches();
  const { data: jobCardsQuery = [] } = useJobCards();
  const createInvoiceMutation = useCreateInvoice();
  const updateInvoiceMutation = useUpdateInvoice();

  const [formData, setFormData] = useState({
    dispatchId: "",
    bindingAdviceId: "",
    clientName: "",
    clientContact: "",
    clientEmail: "",
    clientAddress: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    paymentTerms: "30",
    notes: "",
    taxRate: 18,
  });

  const [invoiceItems, setInvoiceItems] = useState([
    {
      id: "1",
      description: "",
      quantity: 0,
      rate: 0,
      amount: 0,
    },
  ]);

  const [totals, setTotals] = useState({
    subtotal: 0,
    taxAmount: 0,
    totalAmount: 0,
  });

  // Generate invoice from complete job card data
  const generateInvoiceFromJobCard = (jobCardId: string) => {
    const jobCard = jobCardsQuery.find((jc: any) => jc.id === jobCardId);
    if (!jobCard) return;

    // Find related binding advice for complete client data
    const bindingAdvice = bindingAdvicesQuery.find(
      (ba: any) => ba.id === jobCard.bindingAdviceId
    );

    if (bindingAdvice) {
      // Set client information from binding advice
      setFormData((prev) => ({
        ...prev,
        bindingAdviceId: bindingAdvice.id,
        clientName: bindingAdvice.clientName || jobCard.clientName,
        clientContact: bindingAdvice.clientContact || "",
        clientEmail: bindingAdvice.clientEmail || "",
        clientAddress: bindingAdvice.clientAddress || "",
      }));

      // Generate comprehensive invoice items from job card materials and binding advice
      const items = [];

      // Add items from binding advice line items if available
      if (bindingAdvice.lineItems && bindingAdvice.lineItems.length > 0) {
        bindingAdvice.lineItems.forEach((lineItem: any, index: number) => {
          items.push({
            id: (index + 1).toString(),
            description: `${lineItem.description} - ${
              bindingAdvice.pages || 96
            } Pages`,
            quantity: lineItem.quantity || 0,
            rate: lineItem.rate || 15,
            amount: (lineItem.quantity || 0) * (lineItem.rate || 15),
          });
        });
      } else {
        // Fallback to basic job card information
        items.push({
          id: "1",
          description: `${jobCard.notebookSize} - Production Complete`,
          quantity: jobCard.producedQuantity || jobCard.quantity || 0,
          rate: bindingAdvice.ratePerNotebook || 15,
          amount:
            (jobCard.producedQuantity || jobCard.quantity || 0) *
            (bindingAdvice.ratePerNotebook || 15),
        });
      }

      // Add production completion bonus if applicable
      if (jobCard.currentStage === "completed" && jobCard.progress === 100) {
        const completionBonus = Math.round(
          (bindingAdvice.totalAmount || 0) * 0.02
        ); // 2% completion bonus
        if (completionBonus > 0) {
          items.push({
            id: (items.length + 1).toString(),
            description: "Production Completion Bonus (2%)",
            quantity: 1,
            rate: completionBonus,
            amount: completionBonus,
          });
        }
      }

      setInvoiceItems(items);
    }
  };

  // Generate invoice from binding advice (legacy support)
  const generateInvoiceFromBindingAdvice = (bindingAdviceId: string) => {
    const bindingAdvice = bindingAdvicesQuery.find(
      (ba: any) => ba.id === bindingAdviceId
    );
    if (bindingAdvice) {
      setFormData((prev) => ({
        ...prev,
        bindingAdviceId: bindingAdvice.id,
        clientName: bindingAdvice.clientName,
        clientContact: bindingAdvice.clientContact || "",
        clientEmail: bindingAdvice.clientEmail || "",
        clientAddress: bindingAdvice.clientAddress || "",
      }));

      // Generate invoice items from binding advice line items
      const items = bindingAdvice.lineItems?.map(
        (lineItem: any, index: number) => ({
          id: (index + 1).toString(),
          description: `${lineItem.description} - ${
            bindingAdvice.pages || 96
          } Pages`,
          quantity: lineItem.quantity,
          rate: lineItem.rate || 15,
          amount: lineItem.quantity * (lineItem.rate || 15),
        })
      ) || [
        {
          id: "1",
          description: `${bindingAdvice.notebookSize} - ${bindingAdvice.pages} Pages`,
          quantity: bindingAdvice.quantity,
          rate: bindingAdvice.ratePerNotebook || 15,
          amount: bindingAdvice.totalAmount || bindingAdvice.quantity * 15,
        },
      ];

      setInvoiceItems(items);
    }
  };

  // Available dispatches that don't have invoices yet
  const availableDispatches = dispatchesQuery.filter(
    (d: any) =>
      d.status === "delivered" &&
      (!editingInvoice || d.id === editingInvoice.dispatchId)
  );

  useEffect(() => {
    if (editingInvoice) {
      setFormData({
        dispatchId: editingInvoice.dispatchId,
        bindingAdviceId: editingInvoice.bindingAdviceId,
        clientName: editingInvoice.clientName,
        clientContact: editingInvoice.clientContact,
        clientEmail: editingInvoice.clientEmail,
        clientAddress: editingInvoice.clientAddress,
        invoiceDate: editingInvoice.invoiceDate,
        dueDate: editingInvoice.dueDate,
        paymentTerms: "30",
        notes: editingInvoice.notes,
        taxRate: 18,
      });

      setInvoiceItems(
        editingInvoice.items.map((item, index) => ({
          id: (index + 1).toString(),
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
        }))
      );
    } else if (sourceDispatch) {
      // Pre-load from dispatch
      handleDispatchSelect(sourceDispatch.id);
    } else {
      // Reset form
      resetForm();
    }
  }, [editingInvoice, sourceDispatch]);

  const resetForm = () => {
    setFormData({
      dispatchId: "",
      bindingAdviceId: "",
      clientName: "",
      clientContact: "",
      clientEmail: "",
      clientAddress: "",
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      paymentTerms: "30",
      notes: "",
      taxRate: 18,
    });

    setInvoiceItems([
      {
        id: "1",
        description: "",
        quantity: 0,
        rate: 0,
        amount: 0,
      },
    ]);
  };

  const handleDispatchSelect = (dispatchId: string) => {
    const selectedDispatch = dispatchesQuery.find(
      (d: any) => d.id === dispatchId
    );
    if (selectedDispatch) {
      // Find related binding advice
      const bindingAdvice = bindingAdvicesQuery.find(
        (ba: any) => ba.id === selectedDispatch.jobCardId
      );

      // Calculate due date based on payment terms
      const invoiceDate = new Date(formData.invoiceDate);
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(invoiceDate.getDate() + parseInt(formData.paymentTerms));

      setFormData((prev) => ({
        ...prev,
        dispatchId: selectedDispatch.id,
        bindingAdviceId: bindingAdvice?.id || "",
        clientName: selectedDispatch.clientName,
        clientContact: bindingAdvice?.clientContact || "",
        clientEmail: bindingAdvice?.clientEmail || "",
        clientAddress: (selectedDispatch as any).deliveryAddress,
        dueDate: dueDate.toISOString().split("T")[0],
      }));

      // Create invoice items from dispatch
      const dispatch = selectedDispatch as any;
      const items = [
        {
          id: "1",
          description: `${dispatch.notebookSize} Notebooks`,
          quantity: dispatch.quantity,
          rate: Math.round(dispatch.deliveryValue / dispatch.quantity),
          amount: dispatch.deliveryValue,
        },
      ];

      setInvoiceItems(items);
    }
  };

  const updateInvoiceItem = (id: string, field: string, value: any) => {
    setInvoiceItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          // Auto-calculate amount when quantity or rate changes
          if (field === "quantity" || field === "rate") {
            updatedItem.amount =
              (updatedItem.quantity || 0) * (updatedItem.rate || 0);
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

  const addInvoiceItem = () => {
    const newId = (invoiceItems.length + 1).toString();
    setInvoiceItems((prev) => [
      ...prev,
      {
        id: newId,
        description: "",
        quantity: 0,
        rate: 0,
        amount: 0,
      },
    ]);
  };

  const removeInvoiceItem = (id: string) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Calculate totals
  useEffect(() => {
    const subtotal = invoiceItems.reduce(
      (sum, item) => sum + (item.amount || 0),
      0
    );
    const taxAmount = (subtotal * formData.taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    setTotals({ subtotal, taxAmount, totalAmount });
  }, [invoiceItems, formData.taxRate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("🚀 Invoice form submitted");
    console.log("📋 Form data:", formData);
    console.log("📝 Invoice items:", invoiceItems);
    console.log("💰 Totals:", totals);

    const invoiceData = {
      clientId: formData.bindingAdviceId || formData.dispatchId,
      dispatchId: formData.dispatchId,
      bindingAdviceId: formData.bindingAdviceId,
      clientName: formData.clientName,
      clientContact: formData.clientContact,
      clientEmail: formData.clientEmail,
      clientAddress: formData.clientAddress,
      amount: totals.subtotal,
      taxAmount: totals.taxAmount,
      totalAmount: totals.totalAmount,
      invoiceDate: formData.invoiceDate,
      dueDate: formData.dueDate,
      status: "sent" as const,
      paymentDate: null,
      paymentMethod: null,
      paymentReference: null,
      items: invoiceItems.map((item) => ({
        itemId: item.id,
        itemName: item.description,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
      })),
      notes: formData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingInvoice) {
      updateInvoiceMutation.mutate(
        {
          id: editingInvoice.id,
          data: invoiceData,
        },
        {
          onSuccess: () => {
            onClose();
            // Automatically reload the page to refresh data
            window.location.reload();
          },
          onError: (error) => {
            console.error("Error updating invoice:", error);
            alert("Failed to update invoice. Please try again.");
          },
        }
      );
    } else {
      console.log("📤 Creating new invoice with data:", invoiceData);
      createInvoiceMutation.mutate(invoiceData, {
        onSuccess: (createdInvoice) => {
          console.log("✅ Invoice created successfully:", createdInvoice);
          onClose();
          // Automatically reload the page to refresh data
          window.location.reload();
        },
        onError: (error) => {
          console.error("❌ Error creating invoice:", error);
          console.error("📋 Invoice data that failed:", invoiceData);
          alert(
            `Failed to create invoice: ${
              error.message || "Unknown error"
            }. Please try again.`
          );
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
            {editingInvoice ? "Edit Invoice" : "Create Invoice"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Invoice Header */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-blue-900 mb-2">
                  MADURA PAPERS
                </h3>
                <p className="text-sm text-blue-700">
                  No.8, Panthady 5th Street,
                  <br />
                  MADURAI - 625001.
                  <br />
                  Ph.: 0452-2337071/ Fac - 0452-5504471
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Date *
                  </label>
                  <input
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        invoiceDate: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        dueDate: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Test Button */}
          <div className="bg-orange-50 p-4 rounded-lg">
            <button
              type="button"
              onClick={() => {
                console.log("🧪 Quick test button clicked");
                // Set minimal test data
                setFormData((prev) => ({
                  ...prev,
                  clientName: "Quick Test Client",
                  clientContact: "1234567890",
                  clientEmail: "test@example.com",
                  clientAddress: "Test Address",
                  bindingAdviceId: "test-ba-001",
                  invoiceDate: new Date().toISOString().split("T")[0],
                  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0],
                  notes: "Quick test invoice",
                }));

                // Set test invoice items
                setInvoiceItems([
                  {
                    id: "1",
                    description: "Test Item 1",
                    quantity: 10,
                    rate: 100,
                    amount: 1000,
                  },
                  {
                    id: "2",
                    description: "Test Item 2",
                    quantity: 5,
                    rate: 200,
                    amount: 1000,
                  },
                ]);

                console.log("✅ Test data populated");
              }}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>Quick Test - Populate Form</span>
            </button>
            <p className="text-xs text-orange-700 mt-2">
              Click to populate the form with test data for quick testing
            </p>
          </div>

          {/* Job Card Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Generate Invoice from Completed Job Card
            </label>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  console.log("🎯 Job card selected:", e.target.value);
                  generateInvoiceFromJobCard(e.target.value);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Completed Job Card</option>
              {jobCardsQuery
                .filter(
                  (jc: any) =>
                    jc.currentStage === "completed" || jc.progress === 100
                )
                .map((jobCard: any) => (
                  <option key={jobCard.id} value={jobCard.id}>
                    {jobCard.id} - {jobCard.clientName} - {jobCard.notebookSize}
                    (Qty:{" "}
                    {(
                      jobCard.producedQuantity ||
                      jobCard.quantity ||
                      0
                    ).toLocaleString()}
                    )
                  </option>
                ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select a completed job card to auto-generate invoice with client
              data and calculations
            </p>
          </div>

          {/* Binding Advice Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or Generate from Binding Advice
            </label>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  generateInvoiceFromBindingAdvice(e.target.value);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Approved Binding Advice</option>
              {bindingAdvicesQuery
                .filter((ba: any) => ba.status === "approved")
                .map((advice: any) => (
                  <option key={advice.id} value={advice.id}>
                    {advice.id} - {advice.clientName} - {advice.notebookSize}
                    (Qty: {(advice.quantity || 0).toLocaleString()}) - ₹
                    {(advice.totalAmount || 0).toLocaleString()}
                  </option>
                ))}
            </select>
          </div>

          <div className="border-t border-gray-200 my-6"></div>

          {/* Dispatch Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or Select Delivered Dispatch
            </label>
            <select
              value={formData.dispatchId}
              onChange={(e) => handleDispatchSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={!!sourceDispatch}
            >
              <option value="">Select Delivered Dispatch</option>
              {availableDispatches.map((dispatch) => (
                <option key={dispatch.id} value={dispatch.id}>
                  {dispatch.id} - {dispatch.clientName} (₹
                  {(dispatch as any).deliveryValue?.toLocaleString() || "0"})
                </option>
              ))}
            </select>
          </div>

          {/* Client Information */}
          {formData.dispatchId && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900 mb-3">Bill To:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        clientName: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    value={formData.clientContact}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        clientContact: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        clientEmail: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Terms (Days)
                  </label>
                  <select
                    value={formData.paymentTerms}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        paymentTerms: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="15">15 Days</option>
                    <option value="30">30 Days</option>
                    <option value="45">45 Days</option>
                    <option value="60">60 Days</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Billing Address *
                </label>
                <textarea
                  value={formData.clientAddress}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      clientAddress: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          )}

          {/* Invoice Items */}
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">Invoice Items</h3>
            </div>
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoiceItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.description || ""}
                        onChange={(e) =>
                          updateInvoiceItem(
                            item.id,
                            "description",
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Item description"
                        required
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.quantity || 0}
                        onChange={(e) =>
                          updateInvoiceItem(
                            item.id,
                            "quantity",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                        required
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.rate || 0}
                        onChange={(e) =>
                          updateInvoiceItem(
                            item.id,
                            "rate",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        step="0.01"
                        required
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      ₹{(item.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => removeInvoiceItem(item.id)}
                        disabled={invoiceItems.length <= 1}
                        className={`p-1 rounded transition-colors duration-200 ${
                          invoiceItems.length > 1
                            ? "text-red-600 hover:text-red-800 hover:bg-red-50"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <button
                type="button"
                onClick={addInvoiceItem}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Add Item
              </button>
            </div>
          </div>

          {/* Tax and Totals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                value={formData.taxRate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    taxRate: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                max="100"
                step="0.01"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="font-medium">
                    ₹{(totals.subtotal || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Tax ({formData.taxRate}%):
                  </span>
                  <span className="font-medium">
                    ₹{(totals.taxAmount || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>₹{(totals.totalAmount || 0).toLocaleString()}</span>
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
              placeholder="Additional notes or payment instructions..."
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
                (!formData.dispatchId && !formData.bindingAdviceId) ||
                !formData.clientName ||
                invoiceItems.length === 0 ||
                invoiceItems.some(
                  (item) =>
                    !item.description || !item.quantity || item.quantity <= 0
                )
              }
            >
              {editingInvoice ? "Update" : "Create"} Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;
