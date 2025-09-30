import React, { useState, useEffect, useCallback } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { BindingAdvice } from "../../hooks/useData";
import {
  useClients,
  usePaperSizes,
  useNotebookTypes,
  useSystemSettings,
  useCreateBindingAdvice,
  useUpdateBindingAdvice,
  useInventoryItems,
  useCreateJobCard,
} from "../../hooks/useApiQueries";

interface BindingAdviceFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingAdvice?: BindingAdvice | null;
}

interface LineItem {
  id: string;
  description: string;
  pages: number;
  quantity: number;
  reams: number;
  sheets: number;
}

const BindingAdviceForm: React.FC<BindingAdviceFormProps> = ({
  isOpen,
  onClose,
  editingAdvice,
}) => {
  // Use React Query hooks for API operations
  const { data: clients = [] } = useClients();
  const { data: paperSizes = [] } = usePaperSizes();
  const { data: notebookTypes = [] } = useNotebookTypes();

  const { data: systemSettings = [] } = useSystemSettings();
  const { data: inventoryItems = [] } = useInventoryItems();

  const createBindingAdvice = useCreateBindingAdvice();
  const updateBindingAdvice = useUpdateBindingAdvice();
  const createJobCard = useCreateJobCard();

  // Calculation function
  const calculateReamsAndSheets = useCallback(
    (pages: number, quantity: number) => {
      const pagesPerSheet = 24; // Standard pages per sheet
      const sheetsPerReem = 500; // Standard sheets per reem

      const totalPages = pages * quantity;
      const totalSheets = Math.ceil(totalPages / pagesPerSheet);
      const totalReams = Math.ceil(totalSheets / sheetsPerReem);

      return {
        sheets: totalSheets,
        reams: totalReams,
      };
    },
    []
  );

  // Get company details from system settings
  const getCompanyDetail = (key: string) => {
    const setting = systemSettings.find((s) => s.key === key);
    return setting?.value || "";
  };

  // Get paper size mapping from description
  const getPaperSizeMapping = useCallback(
    (description: string) => {
      return paperSizes.find(
        (size) =>
          description.toLowerCase().includes(size.name.toLowerCase()) ||
          size.name.toLowerCase().includes(description.toLowerCase())
      );
    },
    [paperSizes]
  );

  // Map finished products from inventory
  const getFinishedProduct = (description: string, pages: number) => {
    return inventoryItems.find(
      (item) =>
        item.category === "finished_product" &&
        (item.itemName.toLowerCase().includes(description.toLowerCase()) ||
          description.toLowerCase().includes(item.itemName.toLowerCase())) &&
        (item.specifications?.pages === pages || !item.specifications?.pages)
    );
  };

  // Create job card from binding advice
  const createJobCardFromBindingAdvice = (
    bindingAdviceData: Record<string, any>
  ) => {
    if (!bindingAdviceData.clientId || !bindingAdviceData.lineItems?.length) {
      alert(
        "Please select a client and add line items before creating job card"
      );
      return;
    }

    const client = clients.find((c) => c.id === bindingAdviceData.clientId);
    const companyName = getCompanyDetail("company_name") || "Madura Papers";

    // Map materials from line items
    const materials = bindingAdviceData.lineItems.map((item: LineItem) => {
      const inventoryItem = inventoryItems.find(
        (inv) =>
          inv.category === "raw_material" &&
          (inv.itemName
            .toLowerCase()
            .includes(item.description.toLowerCase()) ||
            item.description.toLowerCase().includes(inv.itemName.toLowerCase()))
      );

      return {
        itemId:
          inventoryItem?.id ||
          `MAT-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        itemName: inventoryItem?.itemName || `${item.description} Paper`,
        requiredQuantity: item.reams || Math.ceil(item.quantity / 100),
        allocatedQuantity: 0,
        consumedQuantity: 0,
        specifications: inventoryItem?.specifications || {
          pages: item.pages,
          size: "A4",
          type: item.description,
        },
      };
    });

    const currentDate = new Date();
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const jobCardData = {
      bindingAdviceId: bindingAdviceData.id || `BA-${Date.now()}`,
      clientId: bindingAdviceData.clientId,
      clientName:
        client?.name || bindingAdviceData.clientName || "Unknown Client",
      productName:
        bindingAdviceData.lineItems[0]?.description || "Custom Product",
      notebookSize: bindingAdviceData.lineItems[0]?.pages
        ? `${bindingAdviceData.lineItems[0].pages} Pages`
        : "Standard",
      quantity: bindingAdviceData.lineItems.reduce(
        (sum: number, item: LineItem) => sum + item.quantity,
        0
      ),
      priority: "medium",
      startDate: currentDate.toISOString().split("T")[0],
      dueDate: dueDate.toISOString().split("T")[0],
      estimatedCompletion: dueDate.toISOString().split("T")[0],
      assignedTo: "production_team",
      stages: [
        {
          id: "design",
          name: "Design",
          status: "pending",
          assignedTo: "",
          startDate: "",
          endDate: "",
          notes: "Design phase for binding advice requirements",
        },
        {
          id: "planning",
          name: "Planning",
          status: "pending",
          assignedTo: "",
          startDate: "",
          endDate: "",
          notes: "Production planning and resource allocation",
        },
        {
          id: "production",
          name: "Production",
          status: "pending",
          assignedTo: "",
          startDate: "",
          endDate: "",
          notes: "Manufacturing process",
        },
        {
          id: "quality check",
          name: "Quality Check",
          status: "pending",
          assignedTo: "",
          startDate: "",
          endDate: "",
          notes: "Quality assurance and testing",
        },
      ],
      materials,
      currentStage: "design",
      status: "active",
      progress: 0,
      notes: `Job card created from binding advice. Company: ${companyName}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "admin",
    };

    createJobCard.mutate(jobCardData, {
      onSuccess: (newJobCard) => {
        alert(`Job Card ${newJobCard.id} created successfully!`);
      },
      onError: (error) => {
        console.error("Error creating job card:", error);
        alert("Failed to create job card. Please try again.");
      },
    });
  };

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
  }, [editingAdvice]);

  // Update line item calculations
  const updateLineItem = (
    id: string,
    field: string,
    value: string | number
  ) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          // Auto-load notebook type data when description changes
          if (field === "description" && typeof value === "string") {
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
              updatedItem.reams = calculations.reams;
              updatedItem.sheets = calculations.sheets;
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
        const calculations = calculateReamsAndSheets(type.pages || 96, 1000);
        return {
          id: `item-${Date.now()}-${index}`,
          description: type.name,
          pages: type.pages || 96,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert line items back to single item format for compatibility
    const firstItem = lineItems[0];
    const totalAmount = lineItems.reduce((sum, item) => {
      const finishedProduct = getFinishedProduct(item.description, item.pages);
      const rate = finishedProduct?.sellingPrice || 15;
      return sum + item.quantity * rate;
    }, 0);

    const adviceData = {
      clientName: formData.clientName,
      clientContact: formData.clientContact,
      clientEmail: formData.clientEmail,
      clientAddress: formData.clientAddress,
      notebookSize: "Mixed", // Since we can have multiple items
      pages: firstItem.pages,
      quantity: lineItems.reduce((sum, item) => sum + item.quantity, 0),
      reams: lineItems.reduce((sum, item) => sum + item.reams, 0),
      sheets: lineItems.reduce((sum, item) => sum + item.sheets, 0),
      ratePerNotebook: 15,
      totalAmount,
      status: "draft" as const,
      createdDate: formData.date,
      createdBy: formData.createdBy,
      approvedDate: null,
      notes: formData.notes,
      specifications: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lineItems: lineItems.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        rate: 15,
        amount: item.quantity * 15,
      })),
    };

    if (editingAdvice) {
      updateBindingAdvice.mutate(
        { id: editingAdvice.id, data: adviceData },
        {
          onSuccess: () => {
            onClose();
            resetForm();
          },
        }
      );
    } else {
      createBindingAdvice.mutate(adviceData, {
        onSuccess: () => {
          onClose();
          resetForm();
        },
      });
    }
  };

  const resetForm = () => {
    setFormData({
      clientName: "",
      clientContact: "",
      clientEmail: "",
      clientAddress: "",
      adviceNumber: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
      createdBy: "admin",
    });
    setLineItems([
      {
        id: "1",
        description: "CROWN IV LINE RULED",
        pages: 96,
        quantity: 1000,
        reams: 0,
        sheets: 0,
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingAdvice
              ? "Edit Binding Advice"
              : "Create New Binding Advice"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Header Information */}
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

          {/* Line Items Table */}
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
                    Rate (₹)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Value (₹)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
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
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {(() => {
                        const finishedProduct = getFinishedProduct(
                          item.description,
                          item.pages
                        );
                        return finishedProduct?.sellingPrice || 15;
                      })()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-bold">
                      {(() => {
                        const finishedProduct = getFinishedProduct(
                          item.description,
                          item.pages
                        );
                        const rate = finishedProduct?.sellingPrice || 15;
                        return (item.quantity * rate).toLocaleString();
                      })()}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {(() => {
                        const finishedProduct = getFinishedProduct(
                          item.description,
                          item.pages
                        );
                        return finishedProduct ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-green-600">
                              ✓ {finishedProduct.itemName}
                            </span>
                            <span className="text-gray-500">
                              Stock: {finishedProduct.currentStock}
                            </span>
                          </div>
                        ) : (
                          <span className="text-orange-600">
                            ⚠ No product match
                          </span>
                        );
                      })()}
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
                {/* Total Row */}
                <tr className="bg-blue-50 border-t-2 border-blue-200">
                  <td
                    className="px-4 py-3 text-sm font-bold text-gray-900"
                    colSpan={3}
                  >
                    TOTAL
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">
                    {lineItems
                      .reduce((sum, item) => sum + item.quantity, 0)
                      .toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">
                    {lineItems.reduce((sum, item) => sum + item.reams, 0)}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">
                    {lineItems
                      .reduce((sum, item) => sum + item.sheets, 0)
                      .toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">
                    Avg Rate
                  </td>
                  <td className="px-4 py-3 text-lg font-bold text-blue-600">
                    ₹
                    {lineItems
                      .reduce((sum, item) => {
                        const finishedProduct = getFinishedProduct(
                          item.description,
                          item.pages
                        );
                        const rate = finishedProduct?.sellingPrice || 15;
                        return sum + item.quantity * rate;
                      }, 0)
                      .toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-green-600 font-medium">
                    {
                      lineItems.filter((item) =>
                        getFinishedProduct(item.description, item.pages)
                      ).length
                    }{" "}
                    / {lineItems.length} matched
                  </td>
                  <td className="px-4 py-3"></td>
                </tr>
              </tbody>
            </table>

            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <button
                type="button"
                onClick={addLineItem}
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium"
              >
                <Plus className="h-4 w-4" />
                <span>Add Line Item</span>
              </button>
            </div>
          </div>

          {/* Paper Size Summary */}
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
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
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
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {size.quantity > 0 ? new Date().toLocaleDateString() : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes or specifications..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div>
              {editingAdvice && (
                <button
                  type="button"
                  onClick={() =>
                    createJobCardFromBindingAdvice({
                      ...formData,
                      id: editingAdvice.id,
                      lineItems: lineItems,
                    })
                  }
                  disabled={createJobCard.isPending}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createJobCard.isPending ? "Creating..." : "Create Job Card"}
                </button>
              )}
            </div>
            <div className="flex space-x-4">
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
              >
                {editingAdvice ? "Update" : "Create"} Binding Advice
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BindingAdviceForm;
