import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { useData, BindingAdvice, Client } from "../hooks/useData";
import { useMasterData, NotebookType } from "../hooks/useMasterData";
import { useNavigation } from "../hooks/useNavigation";

interface LineItem {
  id: string;
  description: string;
  pages: number;
  quantity: number;
  reams: number;
  sheets: number;
}

const BindingAdviceForm = () => {
  const { goBack, navigateTo } = useNavigation();
  const location = useLocation();
  const { addBindingAdvice, updateBindingAdvice, clients } = useData();
  const {
    paperSizes,
    notebookTypes,
    calculateReamsAndSheets,
    getPaperSizeMapping,
  } = useMasterData();

  const editingAdvice = location.state?.advice as BindingAdvice | undefined;
  const isEditing = !!editingAdvice;

  const [formData, setFormData] = useState({
    clientName: "",
    clientContact: "",
    clientEmail: "",
    clientAddress: "",
    adviceNumber: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    createdBy: "admin",
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: "1",
      description: "CROWN IV LINE RULED",
      pages: 96,
      quantity: 1000,
      reams: 0,
      sheets: 0,
    },
  ]);

  const [paperSizeSummary, setPaperSizeSummary] = useState([
    { name: "Crown 49 x 74", quantity: 0, reams: 0, sheets: 0 },
    { name: "Imperial I 64 x 79", quantity: 0, reams: 0, sheets: 0 },
    { name: "Imperial II 63 x 78", quantity: 0, reams: 0, sheets: 0 },
    { name: "Scholar 67 x 84", quantity: 0, reams: 0, sheets: 0 },
    { name: "Long Size 64 x 79", quantity: 0, reams: 0, sheets: 0 },
    { name: "Long Size 63 x 78", quantity: 0, reams: 0, sheets: 0 },
  ]);

  useEffect(() => {
    if (editingAdvice) {
      setFormData({
        clientName: editingAdvice.clientName,
        clientContact: editingAdvice.clientContact,
        clientEmail: editingAdvice.clientEmail,
        clientAddress: editingAdvice.clientAddress,
        adviceNumber: editingAdvice.id,
        date: editingAdvice.createdDate,
        notes: editingAdvice.notes,
        createdBy: editingAdvice.createdBy,
      });

      // Convert existing data to line items format
      if (editingAdvice.lineItems && editingAdvice.lineItems.length > 0) {
        setLineItems(editingAdvice.lineItems);
      } else {
        setLineItems([
          {
            id: "1",
            description: editingAdvice.notebookSize,
            pages: editingAdvice.pages,
            quantity: editingAdvice.quantity,
            reams: editingAdvice.reams,
            sheets: editingAdvice.sheets,
          },
        ]);
      }
    }
  }, [editingAdvice]);

  // Update line item calculations
  const updateLineItem = (id: string, field: string, value: any) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          // Auto-load notebook type data when description changes
          if (field === "description") {
            const selectedNotebook = notebookTypes.find(
              (type) => type.name.toLowerCase() === value.toLowerCase()
            );
            if (selectedNotebook) {
              // Use pages from NotebookType interface
              updatedItem.pages = selectedNotebook.pages || 96;
              const calculations = calculateReamsAndSheets(
                selectedNotebook.pages || 96,
                updatedItem.quantity
              );
              updatedItem.reams = calculations.reams;
              updatedItem.sheets = calculations.sheets;
            }
          }

          // Recalculate reams and sheets when pages or quantity change
          if (field === "pages" || field === "quantity") {
            const pages =
              Number(field === "pages" ? value : updatedItem.pages) || 0;
            const quantity =
              Number(field === "quantity" ? value : updatedItem.quantity) || 0;

            if (pages > 0 && quantity > 0) {
              const calculations = calculateReamsAndSheets(pages, quantity);
              updatedItem.reams = calculations.reams || 0;
              updatedItem.sheets = calculations.sheets || 0;
            } else {
              updatedItem.reams = 0;
              updatedItem.sheets = 0;
            }
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

  // Add new line item
  const addLineItem = () => {
    const newId = `item-${Date.now()}-${Math.random()}`;
    const calculations = calculateReamsAndSheets(96, 1000);
    const newItem = {
      id: newId,
      description: "",
      pages: 96,
      quantity: 1000,
      reams: calculations.reams,
      sheets: calculations.sheets,
    };
    setLineItems((prevItems) => [...prevItems, newItem]);
  };

  // Remove line item
  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems((prevItems) => prevItems.filter((item) => item.id !== id));
    }
  };

  // Calculate paper size summary
  useEffect(() => {
    // Initialize with all paper sizes from master data
    const paperSizeMap = new Map();

    // Initialize all paper sizes with zero values
    paperSizes.forEach((size) => {
      paperSizeMap.set(size.name, {
        name: size.name,
        quantity: 0,
        reams: 0,
        sheets: 0,
      });
    });

    // Calculate totals for each paper size based on line items
    lineItems.forEach((item) => {
      if (item.description && item.quantity > 0) {
        const paperSize = getPaperSizeMapping(item.description);
        if (paperSize) {
          const existing = paperSizeMap.get(paperSize.name) || {
            name: paperSize.name,
            quantity: 0,
            reams: 0,
            sheets: 0,
          };

          paperSizeMap.set(paperSize.name, {
            name: paperSize.name,
            quantity: existing.quantity + item.quantity,
            reams: existing.reams + item.reams,
            sheets: existing.sheets + item.sheets,
          });
        }
      }
    });

    setPaperSizeSummary(Array.from(paperSizeMap.values()));
  }, [lineItems, paperSizes, getPaperSizeMapping]);

  // Auto-load initial line items from notebook types
  useEffect(() => {
    if (notebookTypes.length > 0 && !editingAdvice) {
      const initialItems = notebookTypes.slice(0, 4).map((type, index) => {
        const calculations = calculateReamsAndSheets(type.pages, 1000);
        return {
          id: `item-${Date.now()}-${index}`,
          description: type.name,
          pages: type.pages,
          quantity: 1000,
          reams: calculations.reams,
          sheets: calculations.sheets,
        };
      });
      setLineItems(initialItems);
    }
  }, [notebookTypes, editingAdvice, calculateReamsAndSheets]);

  const handleClientSelect = (clientName: string) => {
    const client = clients.find((c) => c.name === clientName);
    if (client) {
      setFormData((prev) => ({
        ...prev,
        clientName: client.name,
        clientContact: client.phone,
        clientEmail: client.email,
        clientAddress: client.address,
      }));
    }
  };

  const handleCancel = () => {
    console.log("handleCancel called"); // Debug log
    goBack("/binding-advice");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert line items back to single item format for compatibility
    const firstItem = lineItems[0];
    const totalAmount = lineItems.reduce(
      (sum, item) => sum + item.quantity * 15,
      0
    ); // Default rate

    const adviceData = {
      clientName: formData.clientName,
      clientContact: formData.clientContact,
      clientEmail: formData.clientEmail,
      clientAddress: formData.clientAddress,
      notebookSize: "Mixed", // Since we can have multiple items
      pages: firstItem?.pages || 96,
      quantity: lineItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
      reams: lineItems.reduce((sum, item) => sum + (item.reams || 0), 0),
      sheets: lineItems.reduce((sum, item) => sum + (item.sheets || 0), 0),
      ratePerNotebook: 15,
      totalAmount,
      status: "draft" as const,
      createdDate: formData.date,
      createdBy: formData.createdBy,
      approvedDate: null,
      notes: formData.notes,
      // Convert LineItem[] to the expected format for BindingAdvice (api.ts format)
      lineItems: lineItems.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        rate: 15, // Default rate per notebook
        amount: item.quantity * 15,
      })),
      // Add missing required fields
      specifications: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isEditing) {
      updateBindingAdvice(editingAdvice.id, adviceData);
    } else {
      addBindingAdvice(adviceData);
    }

    navigateTo("/binding-advice");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("Back button clicked");
              handleCancel();
            }}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Edit Binding Advice" : "Create New Binding Advice"}
          </h1>
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("Cancel button clicked");
              handleCancel();
            }}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="binding-advice-form"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{isEditing ? "Update" : "Create"} Binding Advice</span>
          </button>
        </div>
      </div>

      <form
        id="binding-advice-form"
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Header Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advice No.
                </label>
                <input
                  type="text"
                  value={formData.adviceNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      adviceNumber: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Auto-generated"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
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
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  MADURA PAPERS
                </h3>
                <p className="text-sm text-gray-600">
                  No.8, Panthady 5th Street,
                  <br />
                  MADURAI - 625001.
                  <br />
                  Ph.: 0452-2337071/ Fac - 0452-5504471
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Party's Address
                </label>
                <select
                  value={formData.clientName}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
                  required
                >
                  <option value="">Select Client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.name}>
                      {client.name}
                    </option>
                  ))}
                </select>
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
          </div>
        </div>

        {/* Line Items Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
            <button
              type="button"
              onClick={addLineItem}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Line Item</span>
            </button>
          </div>

          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Sl.No.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    No of Pages
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ream
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Sheet
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lineItems.map((item, index) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={item.description}
                        onChange={(e) =>
                          updateLineItem(item.id, "description", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Notebook Type</option>
                        {notebookTypes.map((type) => (
                          <option key={type.id} value={type.name}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.pages}
                        onChange={(e) =>
                          updateLineItem(
                            item.id,
                            "pages",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateLineItem(
                            item.id,
                            "quantity",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {item.reams}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {item.sheets}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => removeLineItem(item.id)}
                        disabled={lineItems.length <= 1}
                        className={`p-1 rounded transition-colors duration-200 ${
                          lineItems.length > 1
                            ? "text-red-600 hover:text-red-800 hover:bg-red-50"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                        title={
                          lineItems.length > 1
                            ? "Delete this line item"
                            : "Cannot delete the last item"
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paper Size Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Paper Size Summary
          </h2>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">
                NOTE BOOK & PAPER SIZE Summary
              </h3>
            </div>
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Paper Size
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Qty
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Ream
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Sheet
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    For Madura Papers
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paperSizeSummary.map((size) => (
                  <tr
                    key={size.name}
                    className={size.quantity > 0 ? "bg-blue-50" : ""}
                  >
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {size.name}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                      {size.quantity > 0 && !isNaN(size.quantity)
                        ? size.quantity.toLocaleString()
                        : ""}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                      {size.reams > 0 && !isNaN(size.reams) ? size.reams : ""}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                      {size.sheets > 0 && !isNaN(size.sheets)
                        ? size.sheets.toLocaleString()
                        : ""}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {size.quantity > 0 ? "✓" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Additional Information
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes or specifications..."
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default BindingAdviceForm;
