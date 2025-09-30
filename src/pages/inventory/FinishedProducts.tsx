import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Package,
  TrendingUp,
  CreditCard as Edit,
  Trash2,
  Eye,
} from "lucide-react";
import {
  useInventoryItems,
  useDeleteInventoryItem,
} from "../../hooks/useApiQueries";
import FinishedProductForm from "../../components/forms/FinishedProductForm";

const FinishedProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [subcategoryFilter, setSubcategoryFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { data: inventory = [] } = useInventoryItems();
  const deleteInventoryItem = useDeleteInventoryItem();

  // Filter only finished products
  const finishedProducts = inventory.filter(
    (item) => item.category === "finished_product"
  );

  // Get unique subcategories for finished products
  const subcategories = [
    ...new Set(finishedProducts.map((item) => item.subcategory)),
  ];

  // Filter items based on search and subcategory
  const filteredItems = finishedProducts.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.values(item.specifications).some((spec) =>
        spec.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesSubcategory =
      subcategoryFilter === "all" || item.subcategory === subcategoryFilter;
    return matchesSearch && matchesSubcategory;
  });

  // Calculate statistics for finished products only
  const totalValue = finishedProducts.reduce(
    (sum, item) => sum + item.currentStock * (item.sellingPrice || 0),
    0
  );
  const totalCost = finishedProducts.reduce(
    (sum, item) => sum + item.currentStock * (item.productionCost || 0),
    0
  );
  const totalQuantity = finishedProducts.reduce(
    (sum, item) => sum + item.currentStock,
    0
  );
  const lowStockCount = finishedProducts.filter(
    (item) => item.currentStock < item.minStock
  ).length;

  const getStatusColor = (item: any) => {
    if (item.currentStock < item.minStock) return "bg-red-100 text-red-800";
    if (item.currentStock > item.maxStock * 0.8)
      return "bg-blue-100 text-blue-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusText = (item: any) => {
    if (item.currentStock < item.minStock) return "Low Stock";
    if (item.currentStock > item.maxStock * 0.8) return "High Stock";
    return "Optimal";
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this finished product? This action cannot be undone."
      )
    ) {
      deleteInventoryItem.mutate(id, {
        onSuccess: () => {
          console.log("Product deleted successfully");
        },
        onError: (error) => {
          console.error("Error deleting product:", error);
          alert("Failed to delete product. Please try again.");
        },
      });
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Finished Products Inventory
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Finished Products Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Total Products
              </h3>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {finishedProducts.length}
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
                Total Quantity
              </h3>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {totalQuantity.toLocaleString()}
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
              <h3 className="text-sm font-medium text-gray-500">Stock Value</h3>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                ₹{(totalValue / 100000).toFixed(1)}L
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Production Cost
              </h3>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                ₹{(totalCost / 100000).toFixed(1)}L
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
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
                placeholder="Search by product name or specifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <select
              value={subcategoryFilter}
              onChange={(e) => setSubcategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
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

      {/* Finished Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
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
                  Last Produced
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
                        {item.subcategory}
                      </div>
                      <div className="text-xs text-gray-400">ID: {item.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {Object.entries(item.specifications)
                        .slice(0, 3)
                        .map(([key, value]) => (
                          <div key={key} className="flex">
                            <span className="font-medium text-gray-600 w-16">
                              {key}:
                            </span>
                            <span className="text-gray-900">{value}</span>
                          </div>
                        ))}
                      {Object.keys(item.specifications).length > 3 && (
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
                    <div className="font-medium text-green-600">
                      ₹{item.sellingPrice}
                    </div>
                    <div className="text-xs text-gray-500">
                      Cost: ₹{item.productionCost}
                    </div>
                    <div className="text-xs text-blue-600">
                      Margin:{" "}
                      {item.sellingPrice && item.productionCost
                        ? Math.round(
                            ((item.sellingPrice - item.productionCost) /
                              item.sellingPrice) *
                              100
                          )
                        : 0}
                      %
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(item as any).lastProduced
                      ? new Date(
                          (item as any).lastProduced
                        ).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        item
                      )}`}
                    >
                      {getStatusText(item)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit Product"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-green-600 hover:text-green-800"
                        title="Edit Product"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Product"
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

      {/* Products by Specification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notebooks by Size */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Notebooks by Size
          </h2>
          <div className="space-y-3">
            {finishedProducts
              .filter((item) => item.subcategory === "notebook")
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
                    <div>
                      <span className="font-medium">Size:</span>{" "}
                      {item.specifications.size}
                    </div>
                    <div>
                      <span className="font-medium">Pages:</span>{" "}
                      {item.specifications.pages}
                    </div>
                    <div>
                      <span className="font-medium">Ruling:</span>{" "}
                      {item.specifications.ruling}
                    </div>
                    <div>
                      <span className="font-medium">Binding:</span>{" "}
                      {item.specifications.binding}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Production History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Production
          </h2>
          <div className="space-y-3">
            {finishedProducts
              .filter(
                (item) =>
                  (item as any).productionHistory &&
                  (item as any).productionHistory.length > 0
              )
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
                      <div className="font-medium text-blue-600">
                        {(item as any).productionHistory?.[
                          (item as any).productionHistory.length - 1
                        ]?.quantity || 0}{" "}
                        units
                      </div>
                      <div className="text-xs text-gray-500">
                        {(item as any).lastProduced
                          ? new Date(
                              (item as any).lastProduced
                            ).toLocaleDateString()
                          : ""}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">
                    <div>
                      Job Card:{" "}
                      {(item as any).productionHistory?.[
                        (item as any).productionHistory.length - 1
                      ]?.jobCardId || "N/A"}
                    </div>
                    <div>
                      Cost: ₹
                      {(item as any).productionHistory?.[
                        (item as any).productionHistory.length - 1
                      ]?.productionCost || 0}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Production Analytics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Production Analytics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {totalQuantity.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Total Units in Stock</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ₹{(totalValue / 100000).toFixed(1)}L
            </div>
            <div className="text-sm text-gray-500">Total Stock Value</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {totalValue && totalCost
                ? Math.round(((totalValue - totalCost) / totalValue) * 100)
                : 0}
              %
            </div>
            <div className="text-sm text-gray-500">Average Profit Margin</div>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts for Finished Products */}
      {lowStockCount > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Low Stock Alerts
          </h2>
          <div className="space-y-3">
            {finishedProducts
              .filter((item) => item.currentStock < item.minStock)
              .map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-yellow-600" />
                    <div>
                      <div className="font-medium text-yellow-900">
                        {item.itemName} - Low Stock
                      </div>
                      <div className="text-sm text-yellow-700">
                        Current: {item.currentStock} {item.unit}, Minimum:{" "}
                        {item.minStock} {item.unit}
                      </div>
                    </div>
                  </div>
                  <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm">
                    Schedule Production
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      <FinishedProductForm
        isOpen={showForm}
        onClose={handleCloseForm}
        editingProduct={editingProduct}
      />
    </div>
  );
};

export default FinishedProducts;
