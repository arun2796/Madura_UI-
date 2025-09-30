import React, { useState, useEffect } from "react";
import { X, Package, Building, Phone, MapPin, DollarSign } from "lucide-react";
import { useData, InventoryItem } from "../../hooks/useData";

interface RawMaterialFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingMaterial?: InventoryItem | null;
}

const RawMaterialForm: React.FC<RawMaterialFormProps> = ({
  isOpen,
  onClose,
  editingMaterial,
}) => {
  const { addInventoryItem, updateInventoryItem } = useData();

  const [formData, setFormData] = useState({
    itemName: "",
    subcategory: "paper",
    currentStock: 0,
    unit: "reams",
    minStock: 50,
    maxStock: 500,
    reelNumber: "",
    weight: "",
    supplier: "",
    supplierContact: "",
    costPerUnit: 0,
    location: "Warehouse A",
  });

  const [specifications, setSpecifications] = useState({
    size: "",
    weight: "",
    color: "White",
    brand: "",
    material: "",
    gauge: "",
    coating: "",
    finish: "",
    type: "",
  });

  const subcategories = [
    { value: "paper", label: "Paper" },
    { value: "binding", label: "Binding Material" },
    { value: "cover", label: "Cover Material" },
    { value: "ink", label: "Printing Ink" },
    { value: "adhesive", label: "Adhesive" },
    { value: "wire", label: "Wire" },
    { value: "thread", label: "Thread" },
  ];

  const units = [
    { value: "reams", label: "Reams" },
    { value: "sheets", label: "Sheets" },
    { value: "kg", label: "Kilograms" },
    { value: "liters", label: "Liters" },
    { value: "pieces", label: "Pieces" },
    { value: "rolls", label: "Rolls" },
    { value: "boxes", label: "Boxes" },
  ];

  const locations = [
    "Warehouse A",
    "Warehouse B",
    "Store Room",
    "Design Section",
    "Printing Section",
    "Binding Section",
    "Quality Section",
  ];

  useEffect(() => {
    if (editingMaterial) {
      setFormData({
        itemName: editingMaterial.itemName,
        subcategory: editingMaterial.subcategory,
        currentStock: editingMaterial.currentStock,
        unit: editingMaterial.unit,
        minStock: editingMaterial.minStock,
        maxStock: editingMaterial.maxStock,
        reelNumber: editingMaterial.reelNumber,
        weight: editingMaterial.weight,
        supplier: editingMaterial.supplier,
        supplierContact: editingMaterial.supplierContact,
        costPerUnit: editingMaterial.costPerUnit,
        location: editingMaterial.location,
      });
      setSpecifications(editingMaterial?.specifications);
    } else {
      resetForm();
    }
  }, [editingMaterial]);

  const resetForm = () => {
    setFormData({
      itemName: "",
      subcategory: "paper",
      currentStock: 0,
      unit: "reams",
      minStock: 50,
      maxStock: 500,
      reelNumber: "",
      weight: "",
      supplier: "",
      supplierContact: "",
      costPerUnit: 0,
      location: "Warehouse A",
    });
    setSpecifications({
      size: "",
      weight: "",
      color: "White",
      brand: "",
      material: "",
      gauge: "",
      coating: "",
      finish: "",
      type: "",
    });
  };

  const generateReelNumber = () => {
    const prefix = formData.subcategory.toUpperCase().slice(0, 2);
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `${prefix}-${year}-${random}`;
  };

  const calculateStatus = (current: number, min: number, max: number) => {
    if (current <= min * 0.5) return "critical";
    if (current <= min) return "low";
    if (current >= max * 0.9) return "overstocked";
    return "optimal";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const status = calculateStatus(
      formData.currentStock,
      formData.minStock,
      formData.maxStock
    );

    const materialData = {
      itemName: formData.itemName,
      category: "raw_material",
      subcategory: formData.subcategory,
      currentStock: formData.currentStock,
      unit: formData.unit,
      minStock: formData.minStock,
      maxStock: formData.maxStock,
      specifications: Object.fromEntries(
        Object.entries(specifications).filter(([_, value]) => value !== "")
      ),
      reelNumber: formData.reelNumber || generateReelNumber(),
      weight: formData.weight,
      supplier: formData.supplier,
      supplierContact: formData.supplierContact,
      costPerUnit: formData.costPerUnit,
      lastUpdated: new Date().toISOString().split("T")[0],
      status,
      location: formData.location,
      purchaseHistory: editingMaterial?.purchaseHistory || [
        {
          date: new Date().toISOString().split("T")[0],
          quantity: formData.currentStock,
          rate: formData.costPerUnit,
          supplier: formData.supplier,
        },
      ],
    };

    if (editingMaterial) {
      updateInventoryItem(editingMaterial.id, materialData);
    } else {
      addInventoryItem(materialData);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingMaterial ? "Edit Raw Material" : "Add New Raw Material"}
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
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Package className="inline h-4 w-4 mr-1" />
                  Item Name *
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
                  placeholder="e.g., A4 Paper Reams"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reel/Batch Number
                </label>
                <input
                  type="text"
                  value={formData.reelNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      reelNumber: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Auto-generated if empty"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight/Volume
                </label>
                <input
                  type="text"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, weight: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 2.5 kg, 1.2 kg/liter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          {/* Specifications */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-900 mb-3">
              Material Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.subcategory === "paper" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paper Size
                    </label>
                    <input
                      type="text"
                      value={specifications.size}
                      onChange={(e) =>
                        setSpecifications((prev) => ({
                          ...prev,
                          size: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., A4, B5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paper Weight
                    </label>
                    <input
                      type="text"
                      value={specifications.weight}
                      onChange={(e) =>
                        setSpecifications((prev) => ({
                          ...prev,
                          weight: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 70 GSM, 80 GSM"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={specifications.brand}
                      onChange={(e) =>
                        setSpecifications((prev) => ({
                          ...prev,
                          brand: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., JK Copier, Century"
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
                      <option value="Yellow">Yellow</option>
                      <option value="Blue">Blue</option>
                      <option value="Green">Green</option>
                    </select>
                  </div>
                </>
              )}

              {formData.subcategory === "binding" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Material
                    </label>
                    <select
                      value={specifications.material}
                      onChange={(e) =>
                        setSpecifications((prev) => ({
                          ...prev,
                          material: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Material</option>
                      <option value="Steel">Steel</option>
                      <option value="Plastic">Plastic</option>
                      <option value="Thread">Thread</option>
                      <option value="Adhesive">Adhesive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gauge/Thickness
                    </label>
                    <input
                      type="text"
                      value={specifications.gauge}
                      onChange={(e) =>
                        setSpecifications((prev) => ({
                          ...prev,
                          gauge: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 14 AWG, 2mm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coating/Finish
                    </label>
                    <input
                      type="text"
                      value={specifications.coating}
                      onChange={(e) =>
                        setSpecifications((prev) => ({
                          ...prev,
                          coating: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Galvanized, Powder Coated"
                    />
                  </div>
                </>
              )}

              {formData.subcategory === "ink" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ink Type
                    </label>
                    <select
                      value={specifications.type}
                      onChange={(e) =>
                        setSpecifications((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Type</option>
                      <option value="Offset Ink">Offset Ink</option>
                      <option value="Digital Ink">Digital Ink</option>
                      <option value="Screen Ink">Screen Ink</option>
                    </select>
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
                      <option value="Black">Black</option>
                      <option value="Blue">Blue</option>
                      <option value="Red">Red</option>
                      <option value="Green">Green</option>
                      <option value="Yellow">Yellow</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={specifications.brand}
                      onChange={(e) =>
                        setSpecifications((prev) => ({
                          ...prev,
                          brand: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Huber India"
                    />
                  </div>
                </>
              )}

              {formData.subcategory === "cover" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Material
                    </label>
                    <select
                      value={specifications.material}
                      onChange={(e) =>
                        setSpecifications((prev) => ({
                          ...prev,
                          material: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Material</option>
                      <option value="Art Paper">Art Paper</option>
                      <option value="Cardboard">Cardboard</option>
                      <option value="Plastic">Plastic</option>
                      <option value="Leather">Leather</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Finish
                    </label>
                    <select
                      value={specifications.finish}
                      onChange={(e) =>
                        setSpecifications((prev) => ({
                          ...prev,
                          finish: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Finish</option>
                      <option value="Glossy">Glossy</option>
                      <option value="Matte">Matte</option>
                      <option value="Textured">Textured</option>
                      <option value="Laminated">Laminated</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Supplier Information */}
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-medium text-orange-900 mb-3">
              Supplier Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="inline h-4 w-4 mr-1" />
                  Supplier Name *
                </label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      supplier: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Paper Mills Ltd"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Supplier Contact *
                </label>
                <input
                  type="tel"
                  value={formData.supplierContact}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      supplierContact: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  Cost per Unit *
                </label>
                <input
                  type="number"
                  value={formData.costPerUnit}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      costPerUnit: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
          </div>

          {/* Stock Status Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">
              Stock Status Preview
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
                    formData.currentStock * formData.costPerUnit
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
              disabled={!formData.itemName || !formData.supplier}
            >
              {editingMaterial ? "Update" : "Add"} Raw Material
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RawMaterialForm;
