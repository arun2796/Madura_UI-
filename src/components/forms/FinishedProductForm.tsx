import React, { useState, useEffect } from "react";
import { X, Package, DollarSign, Award, Layers, BookOpen } from "lucide-react";
import { useData, InventoryItem } from "../../hooks/useData";

interface FinishedProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct?: InventoryItem | null;
}

const FinishedProductForm: React.FC<FinishedProductFormProps> = ({
  isOpen,
  onClose,
  editingProduct,
}) => {
  const { addInventoryItem, updateInventoryItem } = useData();

  const [formData, setFormData] = useState({
    itemName: "",
    subcategory: "notebook",
    currentStock: 0,
    unit: "pieces",
    minStock: 500,
    maxStock: 5000,
    productionCost: 0,
    sellingPrice: 0,
    location: "Finished Goods Warehouse",
  });

  const [specifications, setSpecifications] = useState({
    size: "A4",
    pages: 96,
    ruling: "Single Line",
    binding: "Spiral",
    cover: "Hard Cover",
    paperWeight: "70 GSM",
    dimensions: "",
    color: "White",
  });

  const subcategories = [
    { value: "notebook", label: "Notebook" },
    { value: "notepad", label: "Notepad" },
    { value: "register", label: "Register" },
    { value: "diary", label: "Diary" },
    { value: "calendar", label: "Calendar" },
    { value: "brochure", label: "Brochure" },
  ];

  const units = [
    { value: "pieces", label: "Pieces" },
    { value: "sets", label: "Sets" },
    { value: "boxes", label: "Boxes" },
    { value: "packs", label: "Packs" },
  ];

  const locations = [
    "Finished Goods Warehouse",
    "Quality Check Area",
    "Dispatch Ready Area",
    "Sample Storage",
    "Returns Section",
  ];

  const notebookSizes = ["A4", "A5", "B5", "A3", "Letter", "Legal", "Custom"];
  const rulingTypes = [
    "Single Line",
    "Double Line",
    "Four Line",
    "Graph",
    "Blank",
    "Dotted",
    "Checked",
    "Maths Ruled",
    "Accountancy",
  ];
  const bindingTypes = [
    "Spiral",
    "Perfect Binding",
    "Saddle Stitch",
    "Wire Binding",
    "Comb Binding",
    "Case Binding",
    "Tape Binding",
  ];
  const coverTypes = [
    "Hard Cover",
    "Soft Cover",
    "Laminated",
    "Plain",
    "Printed",
  ];

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        itemName: editingProduct.itemName,
        subcategory: editingProduct.subcategory,
        currentStock: editingProduct.currentStock,
        unit: editingProduct.unit,
        minStock: editingProduct.minStock,
        maxStock: editingProduct.maxStock,
        productionCost: editingProduct.productionCost || 0,
        sellingPrice: editingProduct.sellingPrice || 0,
        location: editingProduct.location,
      });
      setSpecifications(
        editingProduct.specifications as {
          size: string;
          pages: number;
          ruling: string;
          binding: string;
          cover: string;
          paperWeight: string;
          dimensions: string;
          color: string;
        }
      );
    } else {
      resetForm();
    }
  }, [editingProduct]);

  const resetForm = () => {
    setFormData({
      itemName: "",
      subcategory: "notebook",
      currentStock: 0,
      unit: "pieces",
      minStock: 500,
      maxStock: 5000,
      productionCost: 0,
      sellingPrice: 0,
      location: "Finished Goods Warehouse",
    });
    setSpecifications({
      size: "A4",
      pages: 96,
      ruling: "Single Line",
      binding: "Spiral",
      cover: "Hard Cover",
      paperWeight: "70 GSM",
      dimensions: "",
      color: "White",
    });
  };

  const calculateStatus = (current: number, min: number, max: number) => {
    if (current <= min * 0.5) return "critical";
    if (current <= min) return "low";
    if (current >= max * 0.9) return "overstocked";
    return "optimal";
  };

  const calculateProfitMargin = () => {
    if (formData.sellingPrice > 0 && formData.productionCost > 0) {
      return Math.round(
        ((formData.sellingPrice - formData.productionCost) /
          formData.sellingPrice) *
          100
      );
    }
    return 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const status = calculateStatus(
      formData.currentStock,
      formData.minStock,
      formData.maxStock
    );

    const currentDate = new Date().toISOString();
    const productData = {
      itemName: formData.itemName,
      category: "finished_product" as const,
      subcategory: formData.subcategory,
      currentStock: formData.currentStock,
      unit: formData.unit,
      minStock: formData.minStock,
      maxStock: formData.maxStock,
      specifications: Object.fromEntries(
        Object.entries(specifications).filter(([, value]) => value !== "")
      ),
      productionCost: formData.productionCost,
      sellingPrice: formData.sellingPrice,
      lastProduced:
        (editingProduct as any)?.lastProduced ||
        new Date().toISOString().split("T")[0],
      status,
      location: formData.location,
      createdAt: (editingProduct as any)?.createdAt || currentDate,
      updatedAt: currentDate,
      productionHistory: (editingProduct as any)?.productionHistory || [
        {
          date: new Date().toISOString().split("T")[0],
          quantity: formData.currentStock,
          jobCardId: "INITIAL-STOCK",
          productionCost: formData.productionCost,
        },
      ],
    };

    if (editingProduct) {
      updateInventoryItem(editingProduct.id, productData);
    } else {
      addInventoryItem(productData);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingProduct
              ? "Edit Finished Product"
              : "Add New Finished Product"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-3">
              Product Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Package className="inline h-4 w-4 mr-1" />
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.itemName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      itemName: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., A4 Notebooks - 96 Pages"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Category *
                </label>
                <select
                  value={formData.subcategory}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subcategory: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {subcategories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit *
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, unit: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {units.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Storage Location *
                </label>
                <select
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stock Information */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900 mb-3">
              Stock Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Stock *
                </label>
                <input
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      currentStock: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Stock *
                </label>
                <input
                  type="number"
                  value={formData.minStock}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      minStock: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Stock *
                </label>
                <input
                  type="number"
                  value={formData.maxStock}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxStock: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  required
                />
              </div>
            </div>
          </div>

          {/* Product Specifications */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-900 mb-3">
              Product Specifications
            </h3>

            {formData.subcategory === "notebook" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BookOpen className="inline h-4 w-4 mr-1" />
                    Notebook Size *
                  </label>
                  <select
                    value={specifications.size}
                    onChange={(e) =>
                      setSpecifications((prev) => ({
                        ...prev,
                        size: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {notebookSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Layers className="inline h-4 w-4 mr-1" />
                    Number of Pages *
                  </label>
                  <input
                    type="number"
                    value={specifications.pages}
                    onChange={(e) =>
                      setSpecifications((prev) => ({
                        ...prev,
                        pages: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ruling Type *
                  </label>
                  <select
                    value={specifications.ruling}
                    onChange={(e) =>
                      setSpecifications((prev) => ({
                        ...prev,
                        ruling: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {rulingTypes.map((ruling) => (
                      <option key={ruling} value={ruling}>
                        {ruling}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Binding Type *
                  </label>
                  <select
                    value={specifications.binding}
                    onChange={(e) =>
                      setSpecifications((prev) => ({
                        ...prev,
                        binding: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {bindingTypes.map((binding) => (
                      <option key={binding} value={binding}>
                        {binding}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Type *
                  </label>
                  <select
                    value={specifications.cover}
                    onChange={(e) =>
                      setSpecifications((prev) => ({
                        ...prev,
                        cover: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {coverTypes.map((cover) => (
                      <option key={cover} value={cover}>
                        {cover}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paper Weight
                  </label>
                  <select
                    value={specifications.paperWeight}
                    onChange={(e) =>
                      setSpecifications((prev) => ({
                        ...prev,
                        paperWeight: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="60 GSM">60 GSM</option>
                    <option value="70 GSM">70 GSM</option>
                    <option value="80 GSM">80 GSM</option>
                    <option value="90 GSM">90 GSM</option>
                    <option value="100 GSM">100 GSM</option>
                  </select>
                </div>
              </div>
            )}

            {formData.subcategory !== "notebook" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size/Dimensions
                  </label>
                  <input
                    type="text"
                    value={specifications.dimensions}
                    onChange={(e) =>
                      setSpecifications((prev) => ({
                        ...prev,
                        dimensions: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 210 x 297 mm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <select
                    value={specifications.color}
                    onChange={(e) =>
                      setSpecifications((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="White">White</option>
                    <option value="Cream">Cream</option>
                    <option value="Blue">Blue</option>
                    <option value="Green">Green</option>
                    <option value="Multi-color">Multi-color</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Pricing Information */}
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-medium text-orange-900 mb-3">
              Pricing Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  Production Cost *
                </label>
                <input
                  type="number"
                  value={formData.productionCost}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      productionCost: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selling Price *
                </label>
                <input
                  type="number"
                  value={formData.sellingPrice}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sellingPrice: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Award className="inline h-4 w-4 mr-1" />
                  Profit Margin
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                  {calculateProfitMargin()}%
                </div>
              </div>
            </div>
          </div>

          {/* Stock Status Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">
              Stock & Value Preview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-500">Current Stock</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formData.currentStock.toLocaleString()} {formData.unit}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Stock Range</div>
                <div className="text-sm font-medium text-gray-900">
                  {formData.minStock} - {formData.maxStock} {formData.unit}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Stock Value</div>
                <div className="text-lg font-semibold text-gray-900">
                  ₹
                  {(
                    formData.currentStock * formData.sellingPrice
                  ).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div
                  className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    formData.currentStock <= formData.minStock * 0.5
                      ? "bg-red-100 text-red-800"
                      : formData.currentStock <= formData.minStock
                      ? "bg-yellow-100 text-yellow-800"
                      : formData.currentStock >= formData.maxStock * 0.9
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {formData.currentStock <= formData.minStock * 0.5
                    ? "Critical"
                    : formData.currentStock <= formData.minStock
                    ? "Low"
                    : formData.currentStock >= formData.maxStock * 0.9
                    ? "High"
                    : "Optimal"}
                </div>
              </div>
            </div>
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
                !formData.itemName ||
                !formData.productionCost ||
                !formData.sellingPrice
              }
            >
              {editingProduct ? "Update" : "Add"} Finished Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinishedProductForm;
