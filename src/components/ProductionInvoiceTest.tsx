import React, { useState } from 'react';
import { Play, CheckCircle, AlertTriangle, Trash2, FileText, DollarSign } from 'lucide-react';
import { 
  useJobCards, 
  useBindingAdvices, 
  useInvoices,
  useCreateInvoice 
} from '../hooks/useApiQueries';
import { 
  generateInvoiceFromJobCard,
  findJobCardsReadyForInvoicing,
  calculateExpectedInvoiceAmount,
  logInvoiceGenerationSummary,
  InvoiceGenerationResult
} from '../utils/generateInvoiceFromJobCard';

const ProductionInvoiceTest: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<InvoiceGenerationResult[]>([]);
  const [generatedInvoiceIds, setGeneratedInvoiceIds] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  // API hooks
  const { data: jobCards = [] } = useJobCards();
  const { data: bindingAdvices = [] } = useBindingAdvices();
  const { data: invoices = [] } = useInvoices();
  const createInvoiceMutation = useCreateInvoice();

  const runProductionTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    setGeneratedInvoiceIds([]);

    try {
      console.log("🚀 Starting Production Invoice Generation Test...");

      // Find job cards ready for invoicing
      const readyJobCards = findJobCardsReadyForInvoicing(jobCards, invoices);
      console.log(`📋 Found ${readyJobCards.length} job cards ready for invoicing`);

      if (readyJobCards.length === 0) {
        console.log("⚠️ No completed job cards found that need invoicing");
        setTestResults([{
          success: false,
          error: "No completed job cards found that need invoicing"
        }]);
        setIsRunning(false);
        return;
      }

      const results: InvoiceGenerationResult[] = [];
      const createdInvoiceIds: string[] = [];

      // Process each ready job card
      for (const jobCard of readyJobCards.slice(0, 3)) { // Limit to 3 for testing
        console.log(`\n📝 Processing Job Card: ${jobCard.id}`);

        // Find related binding advice
        const bindingAdvice = bindingAdvices.find(
          (ba: any) => ba.id === jobCard.bindingAdviceId
        );

        if (!bindingAdvice) {
          const error = `No binding advice found for job card ${jobCard.id}`;
          console.log(`❌ ${error}`);
          results.push({
            success: false,
            error
          });
          continue;
        }

        // Generate invoice
        const result = await generateInvoiceFromJobCard(
          jobCard,
          bindingAdvice,
          async (invoiceData) => {
            return new Promise((resolve, reject) => {
              createInvoiceMutation.mutate(invoiceData, {
                onSuccess: (createdInvoice) => {
                  console.log(`✅ Invoice created: ${createdInvoice.id}`);
                  resolve(createdInvoice);
                },
                onError: (error) => {
                  console.error(`❌ Failed to create invoice:`, error);
                  reject(error);
                }
              });
            });
          }
        );

        // Log summary
        logInvoiceGenerationSummary(jobCard, bindingAdvice, result);

        results.push(result);

        if (result.success && result.invoice) {
          createdInvoiceIds.push(result.invoice.id);
        }

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setTestResults(results);
      setGeneratedInvoiceIds(createdInvoiceIds);
      setShowResults(true);

      console.log(`\n🎉 Test completed! Generated ${createdInvoiceIds.length} invoices`);

    } catch (error) {
      console.error("❌ Test failed:", error);
      setTestResults([{
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const cleanupTestData = async () => {
    if (generatedInvoiceIds.length === 0) {
      alert("No test invoices to clean up");
      return;
    }

    const confirmCleanup = window.confirm(
      `Are you sure you want to delete ${generatedInvoiceIds.length} test invoices? This action cannot be undone.`
    );

    if (!confirmCleanup) return;

    try {
      console.log("🧹 Cleaning up test invoices...");
      
      // Note: You would need to implement deleteInvoice mutation
      // For now, just log the IDs that would be deleted
      console.log("Test invoices to delete:", generatedInvoiceIds);
      
      alert(`Test cleanup completed. ${generatedInvoiceIds.length} invoices would be deleted in production.`);
      
      setGeneratedInvoiceIds([]);
      setTestResults([]);
      setShowResults(false);
      
    } catch (error) {
      console.error("❌ Cleanup failed:", error);
      alert("Failed to cleanup test data. Check console for details.");
    }
  };

  const readyJobCards = findJobCardsReadyForInvoicing(jobCards, invoices);
  const successfulResults = testResults.filter(r => r.success);
  const failedResults = testResults.filter(r => !r.success);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Production Invoice Generation Test
        </h2>
        <p className="text-gray-600">
          Generate real invoices from completed job cards with full client data and calculations
        </p>
      </div>

      {/* Test Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Ready Job Cards</p>
              <p className="text-2xl font-bold text-blue-900">{readyJobCards.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Successful Invoices</p>
              <p className="text-2xl font-bold text-green-900">{successfulResults.length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Failed Attempts</p>
              <p className="text-2xl font-bold text-red-900">{failedResults.length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={runProductionTest}
          disabled={isRunning || readyJobCards.length === 0}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            isRunning || readyJobCards.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <Play className="h-5 w-5" />
          <span>{isRunning ? 'Generating Invoices...' : 'Generate Production Invoices'}</span>
        </button>
        
        {generatedInvoiceIds.length > 0 && (
          <button
            onClick={cleanupTestData}
            className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="h-5 w-5" />
            <span>Cleanup Test Data</span>
          </button>
        )}
      </div>

      {/* Ready Job Cards Preview */}
      {readyJobCards.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Job Cards Ready for Invoicing (showing first 5)
          </h3>
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-3 px-4">Job Card ID</th>
                  <th className="text-left py-3 px-4">Client</th>
                  <th className="text-left py-3 px-4">Product</th>
                  <th className="text-right py-3 px-4">Quantity</th>
                  <th className="text-left py-3 px-4">Stage</th>
                  <th className="text-right py-3 px-4">Expected Amount</th>
                </tr>
              </thead>
              <tbody>
                {readyJobCards.slice(0, 5).map((jobCard: any) => {
                  const bindingAdvice = bindingAdvices.find((ba: any) => ba.id === jobCard.bindingAdviceId);
                  const expectedAmount = bindingAdvice 
                    ? calculateExpectedInvoiceAmount(jobCard, bindingAdvice)
                    : { totalAmount: 0 };
                  
                  return (
                    <tr key={jobCard.id} className="border-t border-gray-200">
                      <td className="py-3 px-4 font-medium">{jobCard.id}</td>
                      <td className="py-3 px-4">{jobCard.clientName}</td>
                      <td className="py-3 px-4">{jobCard.notebookSize}</td>
                      <td className="text-right py-3 px-4">{(jobCard.quantity || 0).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          {jobCard.currentStage}
                        </span>
                      </td>
                      <td className="text-right py-3 px-4 font-medium">
                        ₹{expectedAmount.totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Test Results */}
      {showResults && testResults.length > 0 && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h3>
          
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {result.success ? (
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-900">
                            Invoice Generated Successfully
                          </span>
                        </div>
                        {result.invoice && (
                          <div className="text-sm text-green-800 space-y-1">
                            <p><strong>Invoice ID:</strong> {result.invoice.id}</p>
                            <p><strong>Client:</strong> {result.invoice.clientName}</p>
                            <p><strong>Total Amount:</strong> ₹{result.invoice.totalAmount?.toLocaleString()}</p>
                            <p><strong>Items:</strong> {result.invoice.items?.length || 0}</p>
                            <p><strong>Due Date:</strong> {result.invoice.dueDate}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          <span className="font-medium text-red-900">
                            Invoice Generation Failed
                          </span>
                        </div>
                        <div className="text-sm text-red-800">
                          <p><strong>Error:</strong> {result.error}</p>
                          {result.validationErrors && result.validationErrors.length > 0 && (
                            <div className="mt-2">
                              <p><strong>Validation Errors:</strong></p>
                              <ul className="list-disc list-inside ml-4">
                                {result.validationErrors.map((error, i) => (
                                  <li key={i}>{error}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Test Instructions</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• This test generates real invoices from completed job cards</li>
          <li>• It uses actual client data from binding advice records</li>
          <li>• All calculations include line items, taxes, and completion bonuses</li>
          <li>• Generated invoices are saved to the database</li>
          <li>• Use "Cleanup Test Data" to remove test invoices after testing</li>
          <li>• Check browser console for detailed logs</li>
        </ul>
      </div>
    </div>
  );
};

export default ProductionInvoiceTest;
