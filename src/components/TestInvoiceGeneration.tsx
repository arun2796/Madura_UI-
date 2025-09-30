import React, { useState } from 'react';
import { Play, CheckCircle, FileText, Calculator, Users } from 'lucide-react';
import { 
  testInvoiceGeneration, 
  generateTestInvoice, 
  testJobCard, 
  testBindingAdvice,
  TestInvoice 
} from '../utils/testInvoiceGeneration';

const TestInvoiceGeneration: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestInvoice | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const runTest = async () => {
    setIsRunning(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Run the test
    testInvoiceGeneration();
    
    // Generate the test invoice
    const invoice = generateTestInvoice(testJobCard, testBindingAdvice);
    setTestResults(invoice);
    setIsRunning(false);
  };

  const clearTest = () => {
    setTestResults(null);
    setShowDetails(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Invoice Generation Test Suite
        </h2>
        <p className="text-gray-600">
          Test complete job card to invoice generation with client data and calculations
        </p>
      </div>

      {/* Test Controls */}
      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={runTest}
          disabled={isRunning}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            isRunning
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <Play className="h-5 w-5" />
          <span>{isRunning ? 'Running Test...' : 'Run Invoice Test'}</span>
        </button>
        
        {testResults && (
          <button
            onClick={clearTest}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <span>Clear Results</span>
          </button>
        )}
      </div>

      {/* Test Input Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Test Job Card Data
          </h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>ID:</strong> {testJobCard.id}</p>
            <p><strong>Client:</strong> {testJobCard.clientName}</p>
            <p><strong>Product:</strong> {testJobCard.notebookSize}</p>
            <p><strong>Quantity:</strong> {testJobCard.quantity.toLocaleString()}</p>
            <p><strong>Produced:</strong> {(testJobCard.producedQuantity || 0).toLocaleString()}</p>
            <p><strong>Stage:</strong> {testJobCard.currentStage}</p>
            <p><strong>Progress:</strong> {testJobCard.progress}%</p>
            <p><strong>Materials:</strong> {testJobCard.materials.length} items</p>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-3 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Test Binding Advice Data
          </h3>
          <div className="text-sm text-green-800 space-y-1">
            <p><strong>ID:</strong> {testBindingAdvice.id}</p>
            <p><strong>Client:</strong> {testBindingAdvice.clientName}</p>
            <p><strong>Contact:</strong> {testBindingAdvice.clientContact}</p>
            <p><strong>Email:</strong> {testBindingAdvice.clientEmail}</p>
            <p><strong>Address:</strong> {testBindingAdvice.clientAddress}</p>
            <p><strong>Product:</strong> {testBindingAdvice.notebookSize}</p>
            <p><strong>Pages:</strong> {testBindingAdvice.pages}</p>
            <p><strong>Total Amount:</strong> ₹{testBindingAdvice.totalAmount.toLocaleString()}</p>
            <p><strong>Line Items:</strong> {testBindingAdvice.lineItems.length}</p>
          </div>
        </div>
      </div>

      {/* Test Results */}
      {testResults && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              Generated Invoice
            </h3>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          {/* Invoice Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Invoice ID</p>
                  <p className="font-semibold">{testResults.id}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-semibold text-green-600">₹{testResults.totalAmount.toLocaleString()}</p>
                </div>
                <Calculator className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Items Count</p>
                  <p className="font-semibold">{testResults.items.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          {showDetails && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2">Client Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Name:</strong> {testResults.clientName}</p>
                    <p><strong>Contact:</strong> {testResults.clientContact}</p>
                  </div>
                  <div>
                    <p><strong>Email:</strong> {testResults.clientEmail}</p>
                    <p><strong>Address:</strong> {testResults.clientAddress}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2">Invoice Items</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Description</th>
                        <th className="text-right py-2">Quantity</th>
                        <th className="text-right py-2">Rate</th>
                        <th className="text-right py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testResults.items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{item.description}</td>
                          <td className="text-right py-2">{item.quantity.toLocaleString()}</td>
                          <td className="text-right py-2">₹{item.rate.toLocaleString()}</td>
                          <td className="text-right py-2">₹{item.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2">Calculation Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{testResults.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (18% GST):</span>
                    <span>₹{testResults.taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total Amount:</span>
                    <span>₹{testResults.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2">Additional Information</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Invoice Date:</strong> {testResults.invoiceDate}</p>
                  <p><strong>Due Date:</strong> {testResults.dueDate}</p>
                  <p><strong>Status:</strong> {testResults.status}</p>
                  <p><strong>Job Card ID:</strong> {testResults.jobCardId}</p>
                  <p><strong>Binding Advice ID:</strong> {testResults.bindingAdviceId}</p>
                  <p><strong>Notes:</strong> {testResults.notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h4 className="font-medium text-yellow-900 mb-2">Test Instructions</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Click "Run Invoice Test" to generate a complete invoice from job card data</li>
          <li>• The test uses real data structure from the database</li>
          <li>• Invoice includes client information, line items, calculations, and completion bonus</li>
          <li>• All calculations are validated (subtotal, tax, total)</li>
          <li>• Check browser console for detailed test logs</li>
        </ul>
      </div>
    </div>
  );
};

export default TestInvoiceGeneration;
