import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Package, AlertTriangle } from 'lucide-react';
import { InventoryItem } from '../../services/entities';
import { useCreateInventoryItem, useUpdateInventoryItem } from '../../hooks/useDataQueries';

interface InventoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem?: InventoryItem | null;
}

const InventoryForm: React.FC<InventoryFormProps> = ({ isOpen, onClose, editingItem }) => {
  const createMutation = useCreateInventoryItem();
  const updateMutation = useUpdateInventoryItem();

  const [formData, setFormData] = useState<{
    itemName: string;
    category: InventoryItem['category'];
    subcategory: string;
    currentStock: number;
    unit: string;
    minStock: number;
    maxStock: number;
    reelNumber: string;
    weight: string;
    supplier: string;
    supplierContact: string;
    costPerUnit: number;
    status: string;
    location: string;
    productionCost?: number;
    sellingPrice?: number;
  }>({
    itemName: '',
    category: 'raw_material',
    subcategory: '',
    currentStock: 0,
    unit: 'kg',
    minStock: 0,
    maxStock: 0,
    reelNumber: '',
    weight: '',
    supplier: '',
    supplierContact: '',
    costPerUnit: 0,
    status: 'good',
    location: '',
    productionCost: 0,
    sellingPrice: 0,
  });

  const [specifications, setSpecifications] = useState<Record<string, string>>({});
  const [purchaseHistory, setPurchaseHistory] = useState<Array<{
    date: string;
    quantity: number;
    rate: number;
    supplier: string;
  }>>([]);

  // Initialize form data when editing
  useEffect(() => {
    if (editingItem) {
      setFormData({
        itemName: editingItem.itemName,
        category: editingItem.category as InventoryItem['category'],
        subcategory: editingItem.subcategory,
        currentStock: editingItem.currentStock,
        unit: editingItem.unit,
        minStock: editingItem.minStock,
        maxStock: editingItem.maxStock,
        reelNumber: editingItem.reelNumber,
        weight: editingItem.weight,
        supplier: editingItem.supplier,
        supplierContact: editingItem.supplierContact,
        costPerUnit: editingItem.costPerUnit,
        status: editingItem.status,
        location: editingItem.location,
        productionCost: editingItem.productionCost,
        sellingPrice: editingItem.sellingPrice,
      });
      setSpecifications(editingItem.specifications || {});
      setPurchaseHistory(editingItem.purchaseHistory || []);
    } else {
      // Reset form for new item
      setFormData({
        itemName: '',
        category: 'raw_material',
        subcategory: '',
        currentStock: 0,
        unit: 'kg',
        minStock: 0,
        maxStock: 0,
        reelNumber: '',
        weight: '',
        supplier: '',
        supplierContact: '',
        costPerUnit: 0,
        status: 'good',
        location: '',
        productionCost: 0,
        sellingPrice: 0,
      });
      setSpecifications({});
      setPurchaseHistory([]);
    }
  }, [editingItem, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const inventoryData: Omit<InventoryItem, 'id'> = {
      ...formData,
      specifications,
      purchaseHistory,
      lastUpdated: new Date().toISOString().split('T')[0],
      productionHistory: editingItem?.productionHistory || [],
      reservations: editingItem?.reservations || [],
      consumptionHistory: editingItem?.consumptionHistory || [],
    };

    try {
      if (editingItem) {
        await updateMutation.mutateAsync({
          id: editingItem.id,
          data: inventoryData
        });
      } else {
        await createMutation.mutateAsync(inventoryData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save inventory item:', error);
    }
  };

  const addSpecification = () => {
    const key = prompt('Enter specification name:');
    if (key) {
      setSpecifications(prev => ({ ...prev, [key]: '' }));
    }
  };

  const updateSpecification = (key: string, value: string) => {
    setSpecifications(prev => ({ ...prev, [key]: value }));
  };

  const removeSpecification = (key: string) => {
    setSpecifications(prev => {
      const newSpecs = { ...prev };
      delete newSpecs[key];
      return newSpecs;
    });
  };

  const addPurchaseEntry = () => {
    setPurchaseHistory(prev => [...prev, {
      date: new Date().toISOString().split('T')[0],
      quantity: 0,
      rate: 0,
      supplier: formData.supplier
    }]);
  };

  const updatePurchaseEntry = (index: number, field: string, value: string | number) => {
    setPurchaseHistory(prev => prev.map((entry, i) => 
      i === index ? { ...entry, [field]: value } : entry
    ));
  };

  const removePurchaseEntry = (index: number) => {
    setPurchaseHistory(prev => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name *
              </label>
              <input
                type="text"
                value={formData.itemName}
                onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as InventoryItem['category'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="raw_material">Raw Material</option>
                <option value="finished_product">Finished Product</option>
                <option value="consumable">Consumable</option>
                <option value="spare_part">Spare Part</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory
              </label>
              <input
                type="text"
                value={formData.subcategory}
                onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="pieces">Pieces</option>
                <option value="meters">Meters</option>
                <option value="liters">Liters</option>
                <option value="boxes">Boxes</option>
                <option value="reels">Reels</option>
              </select>
            </div>
          </div>

          {/* Stock Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Stock *
              </label>
              <input
                type="number"
                value={formData.currentStock}
                onChange={(e) => setFormData(prev => ({ ...prev, currentStock: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
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
                onChange={(e) => setFormData(prev => ({ ...prev, minStock: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Stock
              </label>
              <input
                type="number"
                value={formData.maxStock}
                onChange={(e) => setFormData(prev => ({ ...prev, maxStock: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reel Number
              </label>
              <input
                type="text"
                value={formData.reelNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, reelNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight
              </label>
              <input
                type="text"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier
              </label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier Contact
              </label>
              <input
                type="text"
                value={formData.supplierContact}
                onChange={(e) => setFormData(prev => ({ ...prev, supplierContact: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost Per Unit *
              </label>
              <input
                type="number"
                value={formData.costPerUnit}
                onChange={(e) => setFormData(prev => ({ ...prev, costPerUnit: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Finished Product Fields */}
          {formData.category === 'finished_product' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Production Cost
                </label>
                <input
                  type="number"
                  value={formData.productionCost || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, productionCost: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selling Price
                </label>
                <input
                  type="number"
                  value={formData.sellingPrice || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryForm;
