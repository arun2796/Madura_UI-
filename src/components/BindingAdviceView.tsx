import React from "react";
import { X, Download, Send, Check } from "lucide-react";
import { BindingAdvice } from "../hooks/useData";

interface BindingAdviceViewProps {
  isOpen: boolean;
  onClose: () => void;
  advice: BindingAdvice | null;
  onStatusChange: (id: string, status: string) => void;
}

const BindingAdviceView: React.FC<BindingAdviceViewProps> = ({
  isOpen,
  onClose,
  advice,
  onStatusChange,
}) => {
  if (!isOpen || !advice) return null;

  const handleStatusChange = (newStatus: string) => {
    onStatusChange(advice.id, newStatus);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Binding Advice - {advice.id}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              {advice.status === "draft" && (
                <button
                  onClick={() => handleStatusChange("sent")}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                  <span>Send</span>
                </button>
              )}
              {advice.status === "sent" && (
                <button
                  onClick={() => handleStatusChange("approved")}
                  className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Check className="h-4 w-4" />
                  <span>Approve</span>
                </button>
              )}
              <button className="flex items-center space-x-2 px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                <Download className="h-4 w-4" />
                <span>PDF</span>
              </button>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Header Section */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  MADURA PAPERS
                </h3>
                <p className="text-sm text-gray-600">
                  No.8, Panthady 5th Street,
                  <br />
                  MADURAI - 625001.
                  <br />
                  Ph.: 0452-2337071/ Fac - 0452-5504471
                </p>
              </div>
              <div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Adv No.:
                    </span>
                    <p className="font-semibold">{advice.id}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Created Date:
                    </span>
                    <p className="font-semibold">
                      {new Date(advice.createdDate).toLocaleDateString()}
                    </p>
                    {advice.status === "approved" && advice.approvedDate && (
                      <div className="mt-1">
                        <span className="text-sm font-medium text-green-600">
                          Approved Date:
                        </span>
                        <p className="font-semibold text-green-600">
                          {new Date(advice.approvedDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Party's Address:
                  </span>
                  <div className="mt-1">
                    <p className="font-semibold">{advice.clientName}</p>
                    <p className="text-sm text-gray-600">
                      {advice.clientAddress}
                    </p>
                    <p className="text-sm text-gray-600">
                      Ph: {advice.clientContact}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-gray-300 rounded-lg overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Sl.No.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    No of Pages
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ream
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Sheet
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {advice.lineItems ? (
                  advice.lineItems.map((item, index) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.description}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.pages}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {(item.quantity || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.reams || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {(item.sheets || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">1</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {advice.notebookSize} - {advice.pages} pages
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {advice.pages}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {advice.quantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {advice.reams}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {advice.sheets.toLocaleString()}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paper Size Summary */}
          <div className="border border-gray-300 rounded-lg overflow-hidden mb-6">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">
                NOTE BOOK & PAPER SIZE
              </h3>
            </div>
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Paper Size
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Qty
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Ream
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Sheet
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    For Madura Papers
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="bg-blue-50">
                  <td className="px-4 py-2 text-sm text-gray-900">
                    Crown 49 x 74
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                    {advice.quantity.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                    {advice.reams}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                    {advice.sheets.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500"></td>
                </tr>
                {[
                  "Imperial I 64 x 79",
                  "Imperial II 63 x 78",
                  "Scholar 67 x 84",
                  "Long Size 64 x 79",
                  "Long Size 63 x 78",
                ].map((size, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900">{size}</td>
                    <td className="px-4 py-2 text-sm text-gray-900"></td>
                    <td className="px-4 py-2 text-sm text-gray-900"></td>
                    <td className="px-4 py-2 text-sm text-gray-900"></td>
                    <td className="px-4 py-2 text-sm text-gray-500"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes */}
          {advice.notes && (
            <div className="border border-gray-300 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Note:</h3>
              <p className="text-sm text-gray-600">{advice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BindingAdviceView;
