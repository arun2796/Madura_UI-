import React from 'react';
import { X, Download, Send, Check, DollarSign } from 'lucide-react';
import { Invoice } from '../hooks/useData';

interface InvoiceViewProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onStatusChange: (id: string, status: string) => void;
}

const InvoiceView: React.FC<InvoiceViewProps> = ({ 
  isOpen, 
  onClose, 
  invoice, 
  onStatusChange 
}) => {
  if (!isOpen || !invoice) return null;

  const handleStatusChange = (newStatus: string) => {
    onStatusChange(invoice.id, newStatus);
  };

  const handleMarkAsPaid = () => {
    onStatusChange(invoice.id, 'paid');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Invoice - {invoice.id}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              {invoice.status === 'sent' && (
                <button
                  onClick={handleMarkAsPaid}
                  className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <DollarSign className="h-4 w-4" />
                  <span>Mark as Paid</span>
                </button>
              )}
              <button className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Send className="h-4 w-4" />
                <span>Send</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                <Download className="h-4 w-4" />
                <span>PDF</span>
              </button>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Invoice Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">MADURA PAPERS</h1>
            <p className="text-sm text-gray-600 mt-2">
              No.8, Panthady 5th Street, MADURAI - 625001<br/>
              Ph.: 0452-2337071 / Fax: 0452-5504471
            </p>
            <h2 className="text-xl font-semibold text-gray-900 mt-4">TAX INVOICE</h2>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Invoice Details:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice No:</span>
                  <span className="font-medium">{invoice.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice Date:</span>
                  <span className="font-medium">{new Date(invoice.invoiceDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dispatch ID:</span>
                  <span className="font-medium">{invoice.dispatchId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Binding Advice:</span>
                  <span className="font-medium">{invoice.bindingAdviceId}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Bill To:</h3>
              <div className="text-sm">
                <div className="font-medium text-gray-900">{invoice.clientName}</div>
                <div className="text-gray-600 mt-1">{invoice.clientAddress}</div>
                {invoice.clientContact && (
                  <div className="text-gray-600 mt-1">Ph: {invoice.clientContact}</div>
                )}
                {invoice.clientEmail && (
                  <div className="text-gray-600">Email: {invoice.clientEmail}</div>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="mb-8">
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-3 text-sm">{index + 1}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">{item.description}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm text-center">{item.quantity.toLocaleString()}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm text-right">₹{item.rate.toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm text-right font-medium">₹{item.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-80">
              <div className="space-y-2">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₹{invoice.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Tax (18%):</span>
                  <span className="font-medium">₹{invoice.taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-3 border-t border-gray-300 text-lg font-bold">
                  <span>Total Amount:</span>
                  <span>₹{invoice.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="mb-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Payment Status</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                    invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                  {invoice.status === 'paid' && invoice.paymentDate && (
                    <span className="text-sm text-gray-600">
                      Paid on {new Date(invoice.paymentDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              {invoice.status === 'paid' && (
                <div className="text-right">
                  <div className="text-sm text-gray-600">Payment Method</div>
                  <div className="font-medium">{invoice.paymentMethod || 'Not specified'}</div>
                  {invoice.paymentReference && (
                    <div className="text-xs text-gray-500">Ref: {invoice.paymentReference}</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Notes:</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{invoice.notes}</p>
            </div>
          )}

          {/* Terms and Conditions */}
          <div className="border-t pt-6">
            <h3 className="font-medium text-gray-900 mb-2">Terms & Conditions:</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p>1. Payment is due within the specified due date.</p>
              <p>2. Interest @ 2% per month will be charged on overdue amounts.</p>
              <p>3. All disputes are subject to Madurai jurisdiction only.</p>
              <p>4. Goods once sold will not be taken back.</p>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 mt-12">
            <div>
              <div className="border-t border-gray-300 pt-2">
                <div className="text-center text-sm text-gray-600">Customer Signature</div>
              </div>
            </div>
            <div>
              <div className="border-t border-gray-300 pt-2">
                <div className="text-center text-sm text-gray-600">For Madura Papers</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;