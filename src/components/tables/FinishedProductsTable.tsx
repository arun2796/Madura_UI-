import React from 'react';

export interface LineItem {
  id: string;
  description: string;
  pages: number;
  quantity: number;
}

export interface FinishedProduct {
  id: string;
  itemName: string;
  currentStock: number;
  reservedQuantity?: number;
  availableQuantity?: number;
  sellingPrice?: number;
  productionCost?: number;
  specifications?: {
    pages?: number;
    size?: string;
    ruling?: string;
    [key: string]: any;
  };
  minStock?: number;
  maxStock?: number;
}

interface FinishedProductsTableProps {
  lineItems: LineItem[];
  finishedProducts: FinishedProduct[];
  getMatchedProduct: (description: string, pages: number) => FinishedProduct | undefined;
  title?: string;
  subtitle?: string;
  showPricing?: boolean;
  showInventoryDetails?: boolean;
  variant?: 'matching' | 'inventory' | 'compact';
}

const FinishedProductsTable: React.FC<FinishedProductsTableProps> = ({
  lineItems,
  finishedProducts,
  getMatchedProduct,
  title = "Finished Products",
  subtitle = "Product availability and matching information",
  showPricing = true,
  showInventoryDetails = true,
  variant = 'matching'
}) => {
  if (variant === 'matching') {
    return (
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div className="bg-green-50 px-4 py-3 border-b border-green-200">
          <h3 className="font-medium text-green-900 flex items-center">
            <span className="mr-2">🎯</span>
            {title}
          </h3>
          <p className="text-sm text-green-700 mt-1">{subtitle}</p>
        </div>
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Line Item
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Matched Product
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Required
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Available
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  After Reserve
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                {showPricing && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {lineItems.map((lineItem) => {
                const matchedProduct = getMatchedProduct(lineItem.description, lineItem.pages);
                const available = matchedProduct 
                  ? (matchedProduct.currentStock || 0) - (matchedProduct.reservedQuantity || 0)
                  : 0;
                const afterReserve = Math.max(0, available - lineItem.quantity);
                const canFulfill = available >= lineItem.quantity;
                
                return (
                  <tr key={lineItem.id} className={`hover:bg-gray-50 ${!canFulfill ? 'bg-red-50' : ''}`}>
                    <td className="px-3 py-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {lineItem.description}
                        </span>
                        <span className="text-xs text-gray-500">
                          {lineItem.pages} Pages - {lineItem.quantity} units
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {matchedProduct ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-green-700">
                            ✓ {matchedProduct.itemName}
                          </span>
                          <span className="text-xs text-gray-500">
                            ID: {matchedProduct.id.slice(-8)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-red-600">❌ No match found</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-sm font-bold text-blue-600">
                        {lineItem.quantity.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`text-sm font-medium ${available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {available.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`text-sm font-bold ${afterReserve > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {afterReserve.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        !matchedProduct 
                          ? 'bg-gray-100 text-gray-800' 
                          : canFulfill 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {!matchedProduct ? 'No Match' : canFulfill ? 'Can Fulfill' : 'Insufficient'}
                      </span>
                    </td>
                    {showPricing && (
                      <td className="px-3 py-2">
                        {matchedProduct && (
                          <div className="flex flex-col text-xs">
                            <span className="text-gray-700 font-medium">
                              ₹{(matchedProduct.sellingPrice || 0).toLocaleString()}
                            </span>
                            <span className="text-gray-500">
                              Total: ₹{((matchedProduct.sellingPrice || 0) * lineItem.quantity).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
              {lineItems.length === 0 && (
                <tr>
                  <td colSpan={showPricing ? 7 : 6} className="px-4 py-8 text-center text-gray-500">
                    Add line items to see matched finished products
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Summary */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-gray-900">{lineItems.length}</div>
              <div className="text-gray-500">Line Items</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-600">
                {lineItems.filter(item => getMatchedProduct(item.description, item.pages)).length}
              </div>
              <div className="text-gray-500">Matched</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-600">
                {lineItems.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()}
              </div>
              <div className="text-gray-500">Total Quantity</div>
            </div>
            {showPricing && (
              <div className="text-center">
                <div className="font-bold text-purple-600">
                  ₹{lineItems.reduce((sum, item) => {
                    const product = getMatchedProduct(item.description, item.pages);
                    return sum + (product ? (product.sellingPrice || 0) * item.quantity : 0);
                  }, 0).toLocaleString()}
                </div>
                <div className="text-gray-500">Total Value</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'inventory') {
    return (
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
          <h3 className="font-medium text-blue-900 flex items-center">
            <span className="mr-2">📦</span>
            {title}
          </h3>
          <p className="text-sm text-blue-700 mt-1">{subtitle}</p>
        </div>
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Product
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Specifications
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Current Stock
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Reserved
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Available
                </th>
                {showPricing && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                )}
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {finishedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {product.itemName}
                      </span>
                      <span className="text-xs text-gray-500">
                        ID: {product.id.slice(-8)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col text-xs">
                      {product.specifications?.pages && (
                        <span className="text-blue-600 font-medium">
                          {product.specifications.pages} Pages
                        </span>
                      )}
                      {product.specifications?.size && (
                        <span className="text-gray-500">
                          Size: {product.specifications.size}
                        </span>
                      )}
                      {product.specifications?.ruling && (
                        <span className="text-gray-500">
                          {product.specifications.ruling}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-sm font-bold text-gray-900">
                      {(product.currentStock || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-sm font-medium text-orange-600">
                      {(product.reservedQuantity || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`text-sm font-bold ${
                      (product.availableQuantity || 0) > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(product.availableQuantity || 0).toLocaleString()}
                    </span>
                  </td>
                  {showPricing && (
                    <td className="px-3 py-2">
                      <div className="flex flex-col text-xs">
                        <span className="text-gray-600">
                          ₹{(product.sellingPrice || 0).toLocaleString()}
                        </span>
                        <span className="text-gray-500">
                          Cost: ₹{(product.productionCost || 0).toLocaleString()}
                        </span>
                      </div>
                    </td>
                  )}
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      (product.availableQuantity || 0) > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {(product.availableQuantity || 0) > 0 ? 'Available' : 'Out of Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Compact variant
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {finishedProducts.map((product) => (
            <div key={product.id} className="border rounded-lg p-3 hover:bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-sm text-gray-900">{product.itemName}</h4>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  (product.availableQuantity || 0) > 0
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {(product.availableQuantity || 0) > 0 ? 'Available' : 'Out of Stock'}
                </span>
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                <div>Stock: {(product.currentStock || 0).toLocaleString()}</div>
                <div>Available: {(product.availableQuantity || 0).toLocaleString()}</div>
                {showPricing && (
                  <div>Price: ₹{(product.sellingPrice || 0).toLocaleString()}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinishedProductsTable;
