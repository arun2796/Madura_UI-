import React, { useState } from 'react';
import { Plus, Search, Filter, Package, AlertTriangle, TrendingUp, CreditCard as Edit, Trash2 } from 'lucide-react';
import { useData } from '../../hooks/useData';
import RawMaterialForm from '../../components/forms/RawMaterialForm';

const RawMaterials = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const { inventory, jobCards, deleteInventoryItem } = useData();

  // Filter only raw materials
  const rawMaterials = inventory.filter(item => item.category === 'raw_material');

  // Get unique subcategories for raw materials
  const subcategories = [...new Set(rawMaterials.map(item => item.subcategory))];

  // Filter items based on search and subcategory
  const filteredItems = rawMaterials.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         Object.values(item.specifications).some(spec => 
                           spec.toString().toLowerCase().includes(searchTerm.toLowerCase())
                         );
    const matchesSubcategory = subcategoryFilter === 'all' || item.subcategory === subcategoryFilter;
    return matchesSearch && matchesSubcategory;
  });

  // Calculate statistics for raw materials only
  const lowStockCount = rawMaterials.filter(item => item.status === 'low' || item.status === 'critical').length;
  const totalValue = rawMaterials.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0);
  const criticalStockCount = rawMaterials.filter(item => item.status === 'critical').length;
  const optimalStockCount = rawMaterials.filter(item => item.status === 'optimal').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-red-200 text-red-900';
      case 'optimal': return 'bg-green-100 text-green-800';
      case 'overstocked': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'low':
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'overstocked':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this raw material? This action cannot be undone.')) {
      deleteInventoryItem(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMaterial(null);
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Raw Materials Inventory</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Raw Material</span>
        </button>
      </div>

      {/* Raw Materials Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Raw Materials</h3>
              <p className="text-2xl font-bold text-blue-600 mt-1">{rawMaterials.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Optimal Stock</h3>
              <p className="text-2xl font-bold text-green-600 mt-1">{optimalStockCount}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Package className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Low Stock Items</h3>
              <p className="text-2xl font-bold text-red-600 mt-1">{lowStockCount}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Stock Value</h3>
              <p className="text-2xl font-bold text-purple-600 mt-1">₹{(totalValue / 100000).toFixed(1)}L</p>
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
                placeholder="Search by material name, reel number, or supplier..."
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
              {subcategories.map(subcategory => (
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

      {/* Raw Materials Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specifications</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min/Max</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost per Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                      <div className="text-sm text-gray-500">{item.subcategory}</div>
                      <div className="text-xs text-gray-400">Reel: {item.reelNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {Object.entries(item.specifications).slice(0, 3).map(([key, value]) => (
                        <div key={key} className="flex">
                          <span className="font-medium text-gray-600 w-16">{key}:</span>
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
                          item.currentStock < item.minStock ? 'bg-red-500' :
                          item.currentStock > item.maxStock * 0.8 ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((item.currentStock / item.maxStock) * 100, 100)}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{item.minStock} / {item.maxStock}</div>
                    <div className="text-xs text-gray-500">{item.unit}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="font-medium">₹{item.costPerUnit}</div>
                    <div className="text-xs text-gray-500">per {item.unit}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="font-medium">{item.supplier}</div>
                    <div className="text-xs text-gray-500">{item.supplierContact}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center space-x-1 ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span className="ml-1">{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.lastUpdated).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit Raw Material"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Raw Material"
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

      {/* Raw Materials by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paper Materials */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Paper Materials</h2>
          <div className="space-y-3">
            {rawMaterials.filter(item => item.subcategory === 'paper').map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{item.itemName}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                    {item.currentStock} {item.unit}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div><span className="font-medium">Size:</span> {item.specifications.size}</div>
                  <div><span className="font-medium">Weight:</span> {item.specifications.weight}</div>
                  <div><span className="font-medium">Brand:</span> {item.specifications.brand}</div>
                  <div><span className="font-medium">Color:</span> {item.specifications.color}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Other Materials */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Other Materials</h2>
          <div className="space-y-3">
            {rawMaterials.filter(item => item.subcategory !== 'paper').map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{item.itemName}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                    {item.currentStock} {item.unit}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  {Object.entries(item.specifications).slice(0, 4).map(([key, value]) => (
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

      {/* Material Usage by Job Cards */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Material Usage by Active Job Cards</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Card</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Required</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consumed</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobCards.filter(jc => jc.currentStage !== 'completed').map((jobCard) => 
                jobCard.materials.map((material, index) => (
                  <tr key={`${jobCard.id}-${material.itemId}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{jobCard.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{jobCard.clientName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{material.itemName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{material.requiredQuantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{material.consumedQuantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{jobCard.progress}%</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        material.consumedQuantity >= material.requiredQuantity 
                          ? 'bg-green-100 text-green-800' 
                          : material.consumedQuantity > 0 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {material.consumedQuantity >= material.requiredQuantity 
                          ? 'Complete' 
                          : material.consumedQuantity > 0 
                            ? 'In Progress'
                            : 'Not Started'
                        }
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Alerts for Raw Materials */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Raw Material Stock Alerts</h2>
        <div className="space-y-3">
          {rawMaterials.filter(item => item.status === 'low' || item.status === 'critical').map((item) => (
            <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg border ${
              item.status === 'critical' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center space-x-3">
                <AlertTriangle className={`h-5 w-5 ${
                  item.status === 'critical' ? 'text-red-600' : 'text-yellow-600'
                }`} />
                <div>
                  <div className={`font-medium ${
                    item.status === 'critical' ? 'text-red-900' : 'text-yellow-900'
                  }`}>
                    {item.itemName} - {item.status === 'critical' ? 'Critical' : 'Low'} Stock
                  </div>
                  <div className={`text-sm ${
                    item.status === 'critical' ? 'text-red-700' : 'text-yellow-700'
                  }`}>
                    Current: {item.currentStock} {item.unit}, Minimum: {item.minStock} {item.unit}
                  </div>
                </div>
              </div>
              <button className={`text-white px-3 py-1 rounded text-sm ${
                item.status === 'critical' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'
              }`}>
                Reorder
              </button>
            </div>
          ))}
          {rawMaterials.filter(item => item.status === 'low' || item.status === 'critical').length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>All raw materials are at optimal levels</p>
            </div>
          )}
        </div>
      </div>

      <RawMaterialForm 
        isOpen={showForm}
        onClose={handleCloseForm}
        editingMaterial={editingMaterial}
      />
    </div>
  );
};

export default RawMaterials;