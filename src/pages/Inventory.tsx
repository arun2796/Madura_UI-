import React, { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  useInventoryItems,
  useJobCards,
  useDeleteInventoryItem,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useBindingAdvices,
} from "../hooks/useApiQueries";
import InventoryForm from "../components/forms/InventoryForm";
import { InventoryItem } from "../services/api";

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Use React Query hooks
  const {
    data: inventory = [],
    isLoading: inventoryLoading,
    error: inventoryError,
  } = useInventoryItems();
  const { data: jobCards = [], isLoading: jobCardsLoading } = useJobCards();
  const { data: bindingAdvices = [] } = useBindingAdvices();

  // Mutation hooks
  const createMutation = useCreateInventoryItem();
  const updateMutation = useUpdateInventoryItem();
  const deleteMutation = useDeleteInventoryItem();

  // Enhanced calculations with finished products from binding advice
  const lowStockItems = inventory.filter(
    (item) => item.currentStock <= item.minStock
  );

  // Calculate finished products from binding advice
  const finishedProducts = bindingAdvices
    .filter((advice) => advice.status === "approved")
    .reduce((acc, advice) => {
      const productKey = `${advice.notebookSize}-${advice.pages}P`;
      if (!acc[productKey]) {
        acc[productKey] = {
          name: productKey,
          totalQuantity: 0,
          totalValue: 0,
          orders: 0,
        };
      }
      acc[productKey].totalQuantity += advice.quantity;
      acc[productKey].totalValue += advice.totalAmount;
      acc[productKey].orders += 1;
      return acc;
    }, {} as Record<string, any>);

  // Enhanced inventory categories
  const rawMaterials = inventory.filter(
    (item) => item.category === "raw_material"
  );
  const finishedProductsInventory = inventory.filter(
    (item) => item.category === "finished_product"
  );
  const workInProgress = inventory.filter(
    (item) => item.category === "work_in_progress"
  );

  // Calculate total inventory value
  const totalInventoryValue = inventory.reduce(
    (sum, item) =>
      sum + item.currentStock * (item.sellingPrice || item.productionCost || 0),
    0
  );

  // Calculate finished product value from binding advice
  const finishedProductValue = Object.values(finishedProducts).reduce(
    (sum: number, product: any) => sum + product.totalValue,
    0
  );

  // Loading and error states
  const isLoading = inventoryLoading || jobCardsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (inventoryError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">
          Error loading inventory: {inventoryError.message}
        </p>
      </div>
    );
  }

  // Use actual inventory data from React Query
  const inventoryItems = inventory;

  // Handlers
  const handleAddItem = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (
      window.confirm("Are you sure you want to delete this inventory item?")
    ) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete item:", error);
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  // Get unique categories and subcategories
  const categories = [...new Set(inventoryItems.map((item) => item.category))];
  const subcategories = [
    ...new Set(inventoryItems.map((item) => item.subcategory)),
  ];

  // Filter items based on search, category, and subcategory
  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.supplier || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.values(item.specifications).some((spec) =>
        spec.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    const matchesSubcategory =
      subcategoryFilter === "all" || item.subcategory === subcategoryFilter;
    return matchesSearch && matchesCategory && matchesSubcategory;
  });

  // Removed unused statistics - now using enhanced calculations above

  const getStatusColor = (status: string) => {
    switch (status) {
      case "low":
        return "bg-red-100 text-red-800";
      case "critical":
        return "bg-red-200 text-red-900";
      case "optimal":
        return "bg-green-100 text-green-800";
      case "overstocked":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "low":
      case "critical":
        return <AlertTriangle className="h-4 w-4" />;
      case "overstocked":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Inventory Management
        </h1>
        <button
          onClick={handleAddItem}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Stock</span>
        </button>
      </div>

      {/* Enhanced Inventory Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Raw Materials
              </h3>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {rawMaterials.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ₹
                {(
                  rawMaterials.reduce(
                    (sum, item) =>
                      sum + item.currentStock * (item.productionCost || 0),
                    0
                  ) / 1000
                ).toFixed(0)}
                K
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
              <h3 className="text-sm font-medium text-gray-500">
                Finished Products
              </h3>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {finishedProductsInventory.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ₹{(finishedProductValue / 1000).toFixed(0)}K from orders
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Package className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Work in Progress
              </h3>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {workInProgress.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">Active production</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Low Stock Items
              </h3>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {lowStockItems.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">Need reorder</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                ₹{(totalInventoryValue / 100000).toFixed(1)}L
              </p>
              <p className="text-xs text-gray-500 mt-1">Inventory worth</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
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
                placeholder="Search by item name, reel number, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
            <select
              value={subcategoryFilter}
              onChange={(e) => setSubcategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Subcategories</option>
              {subcategories.map((subcategory) => (
                <option key={subcategory} value={subcategory}>
                  {subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}
                </option>
              ))}
            </select>
            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specifications
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min/Max
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost/Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.itemName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.category
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}{" "}
                        - {item.subcategory}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {item.specifications &&
                        Object.entries(item.specifications)
                          .slice(0, 3)
                          .map(([key, value]) => (
                            <div key={key} className="flex">
                              <span className="font-medium text-gray-600 w-16">
                                {key}:
                              </span>
                              <span className="text-gray-900">{value}</span>
                            </div>
                          ))}
                      {item.specifications &&
                        Object.keys(item.specifications).length > 3 && (
                          <div className="text-xs text-gray-500 mt-1">
                            +{Object.keys(item.specifications).length - 3} more
                          </div>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.currentStock.toLocaleString()} {item.unit}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                      <div
                        className={`h-1 rounded-full ${
                          item.currentStock < item.minStock
                            ? "bg-red-500"
                            : item.currentStock > item.maxStock * 0.8
                            ? "bg-blue-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            (item.currentStock / item.maxStock) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      {item.minStock} / {item.maxStock}
                    </div>
                    <div className="text-xs text-gray-500">{item.unit}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      {item.category === "finished_product" ? (
                        <>
                          <div className="font-medium">
                            ₹{item.sellingPrice}
                          </div>
                          <div className="text-xs text-gray-500">
                            Cost: ₹{item.productionCost}
                          </div>
                        </>
                      ) : (
                        <div className="font-medium">
                          ₹{item.sellingPrice || item.productionCost || 0}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{item.location}</div>
                      {item.category === "raw_material" && (
                        <div className="text-xs text-gray-500">
                          {item.supplier}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center space-x-1 ${getStatusColor(
                        item.status || "unknown"
                      )}`}
                    >
                      {getStatusIcon(item.status || "unknown")}
                      <span className="ml-1">
                        {item.status
                          ? item.status.charAt(0).toUpperCase() +
                            item.status.slice(1)
                          : "Unknown"}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded text-xs font-medium">
                        Update
                      </button>
                      <button className="text-green-600 hover:text-green-800 bg-green-50 px-2 py-1 rounded text-xs font-medium">
                        Adjust
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Specification-wise Stock Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Raw Materials by Specification */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Raw Materials by Specification
          </h2>
          <div className="space-y-3">
            {inventoryItems
              .filter((item) => item.category === "raw_material")
              .map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">
                      {item.itemName}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                        item.status || "unknown"
                      )}`}
                    >
                      {item.currentStock} {item.unit}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    {item.specifications &&
                      Object.entries(item.specifications)
                        .slice(0, 4)
                        .map(([key, value]) => (
                          <div key={key}>
                            <span className="font-medium">{key}:</span> {value}
                          </div>
                        ))}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Finished Products by Specification */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Finished Products by Specification
          </h2>
          <div className="space-y-3">
            {inventoryItems
              .filter((item) => item.category === "finished_product")
              .map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">
                      {item.itemName}
                    </h3>
                    <div className="text-right">
                      <div className="font-medium text-green-600">
                        {item.currentStock} {item.unit}
                      </div>
                      <div className="text-xs text-gray-500">
                        ₹{item.sellingPrice} each
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    {item.specifications &&
                      Object.entries(item.specifications)
                        .slice(0, 4)
                        .map(([key, value]) => (
                          <div key={key}>
                            <span className="font-medium">{key}:</span> {value}
                          </div>
                        ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Job Card Material Usage */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Material Usage by Job Cards
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Job Card
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Client
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Material
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Required
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Consumed
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Progress
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobCards
                .filter((jc) => jc.currentStage !== "completed")
                .map((jobCard) =>
                  (jobCard.materials || []).map((material: any) => (
                    <tr
                      key={`${jobCard.id}-${material.itemId}`}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-blue-600">
                        {jobCard.id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {jobCard.clientName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {material.itemName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {material.requiredQuantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {material.consumedQuantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {jobCard.progress}%
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            material.consumedQuantity >=
                            material.requiredQuantity
                              ? "bg-green-100 text-green-800"
                              : material.consumedQuantity > 0
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {material.consumedQuantity >=
                          material.requiredQuantity
                            ? "Complete"
                            : material.consumedQuantity > 0
                            ? "In Progress"
                            : "Not Started"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Alerts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Stock Alerts
        </h2>
        <div className="space-y-3">
          {lowStockItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                item.status === "critical"
                  ? "bg-red-50 border-red-200"
                  : "bg-yellow-50 border-yellow-200"
              }`}
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle
                  className={`h-5 w-5 ${
                    item.status === "critical"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                />
                <div>
                  <div
                    className={`font-medium ${
                      item.status === "critical"
                        ? "text-red-900"
                        : "text-yellow-900"
                    }`}
                  >
                    {item.itemName} -{" "}
                    {item.status === "critical" ? "Critical" : "Low"} Stock
                  </div>
                  <div
                    className={`text-sm ${
                      item.status === "critical"
                        ? "text-red-700"
                        : "text-yellow-700"
                    }`}
                  >
                    Current: {item.currentStock} {item.unit}, Minimum:{" "}
                    {item.minStock} {item.unit}
                  </div>
                </div>
              </div>
              <button
                className={`text-white px-3 py-1 rounded text-sm ${
                  item.status === "critical"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-yellow-600 hover:bg-yellow-700"
                }`}
              >
                Reorder
              </button>
            </div>
          ))}
          {lowStockItems.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>All inventory items are at optimal levels</p>
            </div>
          )}
        </div>
      </div>

      {/* Inventory Consumption Trends */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Inventory Movements
        </h2>
        <div className="space-y-3">
          {jobCards
            .filter((jc) => jc.progress > 0)
            .slice(-5)
            .map((jobCard) => (
              <div
                key={jobCard.id}
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-blue-900">
                    {jobCard.id} - {jobCard.clientName}
                  </div>
                  <div className="text-sm text-blue-700">
                    Materials consumed for {jobCard.progress}% completion
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-blue-900">
                    {jobCard.currentStage}
                  </div>
                  <div className="text-sm text-blue-700">
                    {new Date(jobCard.startDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Inventory Form Modal */}
      <InventoryForm
        isOpen={showForm}
        onClose={handleCloseForm}
        editingItem={editingItem}
      />
    </div>
  );
};

export default Inventory;
