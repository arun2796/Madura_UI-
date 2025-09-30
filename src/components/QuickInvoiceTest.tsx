import React, { useState } from 'react';
import { Play, CheckCircle, AlertTriangle, Trash2, FileText } from 'lucide-react';
import { useCreateInvoice } from '../hooks/useApiQueries';

const QuickInvoiceTest: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [generatedInvoiceId, setGeneratedInvoiceId] = useState<string | null>(null);

  const createInvoiceMutation = useCreateInvoice();

  // Test data from the actual database
  const testJobCard = {
    id: "3ae3",
    bindingAdviceId: "d17c",
    clientName: "Government School",
    notebookSize: "Mixed Products (2 items)",
    quantity: 2000,
    currentStage: "completed",
    progress: 100,
    producedQuantity: 2000,
  };

  const testBindingAdvice = {
    id: "d17c",
    clientName: "Government School",
    clientContact: "9876543210",
    clientEmail: "contact@govschool.edu",
    clientAddress: "123 Education Street, City",
    notebookSize: "A4 Crown",
    pages: 96,
    quantity: 2000,
    ratePerNotebook: 15,
    totalAmount: 30000,
    status: "approved",
    lineItems: [
      {
        id: "1",
        description: "CROWN IV LINE RULED",
        quantity: 1000,
        rate: 15,
        amount: 15000
      },
      {
        id: "2",
        description: "CROWN PLAIN NOTEBOOK",
        quantity: 1000,
        rate: 15,
        amount: 15000
      }
    ]
  };

  const generateInvoiceData = (jobCard: any, bindingAdvice: any) => {
    const invoiceDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(invoiceDate.getDate() + 30);

    // Generate invoice items from binding advice line items
    const items = bindingAdvice.lineItems.map((lineItem: any, index: number) => ({
      id: `ITEM-${index + 1}`,
      description: `${lineItem.description} - ${bindingAdvice.pages} Pages`,
      quantity: lineItem.quantity,
      rate: lineItem.rate,
      amount: lineItem.amount,
    }));

    // Add production completion bonus
    const completionBonus = Math.round(bindingAdvice.totalAmount * 0.02);
    items.push({
      id: `ITEM-${items.length + 1}`,
      description: "Production Completion Bonus (2%)",
      quantity: 1,
      rate: completionBonus,
      amount: completionBonus,
    });

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + item.amount, 0);
    const taxAmount = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + taxAmount;

    return {
      clientName: bindingAdvice.clientName,
      clientContact: bindingAdvice.clientContact,
      clientEmail: bindingAdvice.clientEmail,
      clientAddress: bindingAdvice.clientAddress,
      bindingAdviceId: bindingAdvice.id,
      jobCardId: jobCard.id,
      amount: subtotal,
      taxAmount: taxAmount,
      totalAmount: totalAmount,
      invoiceDate: invoiceDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: "sent",
      items: items,
      notes: `Invoice generated from Job Card ${jobCard.id} - Production completed with ${jobCard.producedQuantity} units produced. Generated on ${new Date().toLocaleDateString()}.`,
      paymentTerms: "Net 30 days",
    };
  };

  const runQuickTest = async () => {
    setIsRunning(true);
    setTestResult(null);

    try {
      console.log("🚀 Starting Quick Invoice Generation Test...");
      console.log("📋 Job Card:", testJobCard.id, "-", testJobCard.clientName);
      console.log("📄 Binding Advice:", testBindingAdvice.id, "- ₹", testBindingAdvice.totalAmount.toLocaleString());

      // Generate invoice data
      const invoiceData = generateInvoiceData(testJobCard, testBindingAdvice);
      
      console.log("\n💰 Generated Invoice Data:");
      console.log("  Client:", invoiceData.clientName);
      console.log("  Items:", invoiceData.items.length);
      console.log("  Subtotal: ₹", invoiceData.amount.toLocaleString());
      console.log("  Tax (18%): ₹", invoiceData.taxAmount.toLocaleString());
      console.log("  Total: ₹", invoiceData.totalAmount.toLocaleString());

      // Create invoice via mutation
      await new Promise((resolve, reject) => {
        createInvoiceMutation.mutate(invoiceData, {
          onSuccess: (createdInvoice) => {
            console.log("✅ Invoice created successfully!");
            console.log("📄 Invoice ID:", createdInvoice.id);
            
            setTestResult({
              success: true,
              invoice: createdInvoice,
              summary: {
                jobCardId: testJobCard.id,
                bindingAdviceId: testBindingAdvice.id,
                clientName: invoiceData.clientName,
                totalAmount: invoiceData.totalAmount,
                itemsCount: invoiceData.items.length,
                invoiceId: createdInvoice.id
              }
            });
            
            setGeneratedInvoiceId(createdInvoice.id);
            resolve(createdInvoice);
          },
          onError: (error) => {
            console.error("❌ Invoice generation failed:", error);
            setTestResult({
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            reject(error);
          }
        });
      });

    } catch (error) {
      console.error("❌ Test failed:", error);
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const clearTest = () => {
    setTestResult(null);
    setGeneratedInvoiceId(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Quick Invoice Generation Test
        </h2>
        <p className="text-gray-600">
          Generate a real invoice from completed Job Card 3ae3 with full client data and calculations
        </p>
      </div>

      {/* Test Input Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Job Card Data
          </h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>ID:</strong> {testJobCard.id}</p>
            <p><strong>Client:</strong> {testJobCard.clientName}</p>
            <p><strong>Product:</strong> {testJobCard.notebookSize}</p>
            <p><strong>Quantity:</strong> {testJobCard.quantity.toLocaleString()}</p>
            <p><strong>Produced:</strong> {testJobCard.producedQuantity.toLocaleString()}</p>
            <p><strong>Stage:</strong> {testJobCard.currentStage}</p>
            <p><strong>Progress:</strong> {testJobCard.progress}%</p>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-3 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Binding Advice Data
          </h3>
          <div className="text-sm text-green-800 space-y-1">
            <p><strong>ID:</strong> {testBindingAdvice.id}</p>
            <p><strong>Client:</strong> {testBindingAdvice.clientName}</p>
            <p><strong>Contact:</strong> {testBindingAdvice.clientContact}</p>
            <p><strong>Email:</strong> {testBindingAdvice.clientEmail}</p>
            <p><strong>Total Amount:</strong> ₹{testBindingAdvice.totalAmount.toLocaleString()}</p>
            <p><strong>Line Items:</strong> {testBindingAdvice.lineItems.length}</p>
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={runQuickTest}
          disabled={isRunning}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            isRunning
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <Play className="h-5 w-5" />
          <span>{isRunning ? 'Generating Invoice...' : 'Generate Real Invoice'}</span>
        </button>
        
        {testResult && (
          <button
            onClick={clearTest}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Trash2 className="h-5 w-5" />
            <span>Clear Results</span>
          </button>
        )}
      </div>

      {/* Test Results */}
      {testResult && (
        <div className={`p-6 rounded-lg ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-center space-x-2 mb-4">
            {testResult.success ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-red-600" />
            )}
            <h3 className={`text-lg font-semibold ${testResult.success ? 'text-green-900' : 'text-red-900'}`}>
              {testResult.success ? 'Invoice Generated Successfully!' : 'Invoice Generation Failed'}
            </h3>
          </div>

          {testResult.success ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded border">
                  <p className="text-sm text-gray-600">Invoice ID</p>
                  <p className="font-semibold">{testResult.summary.invoiceId}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-semibold text-green-600">₹{testResult.summary.totalAmount.toLocaleString()}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-sm text-gray-600">Items Count</p>
                  <p className="font-semibold">{testResult.summary.itemsCount}</p>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded border">
                <h4 className="font-medium text-gray-900 mb-2">Success Details</h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>✅ Invoice created in database</p>
                  <p>✅ Client data mapped from binding advice</p>
                  <p>✅ Line items generated from job card materials</p>
                  <p>✅ Production completion bonus added (2%)</p>
                  <p>✅ Tax calculations applied (18% GST)</p>
                  <p>✅ Payment terms set (Net 30 days)</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded border">
              <h4 className="font-medium text-red-900 mb-2">Error Details</h4>
              <p className="text-sm text-red-800">{testResult.error}</p>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h4 className="font-medium text-yellow-900 mb-2">Test Process</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Uses real job card data from the database (ID: 3ae3)</li>
          <li>• Maps client information from binding advice (ID: d17c)</li>
          <li>• Generates invoice items from line items with proper calculations</li>
          <li>• Adds 2% production completion bonus for completed job cards</li>
          <li>• Applies 18% GST tax calculation</li>
          <li>• Creates actual invoice record in the database</li>
          <li>• Check the Billing page to see the generated invoice</li>
        </ul>
      </div>
    </div>
  );
};

export default QuickInvoiceTest;
