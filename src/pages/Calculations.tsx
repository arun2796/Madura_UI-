import React, { useState } from "react";
import { Calculator, Plus, Save, RotateCcw } from "lucide-react";
import {
  usePaperSizes,
  useNotebookTypes,
  useCalculationRules,
  useCreateCalculationRule,
  useUpdateCalculationRule,
} from "../hooks/useApiQueries";

const Calculations = () => {
  // Use React Query hooks for data operations
  const { data: paperSizes = [] } = usePaperSizes();
  const { data: notebookTypes = [] } = useNotebookTypes();
  const { data: calculationRules = [] } = useCalculationRules();
  const createCalculationRule = useCreateCalculationRule();
  const updateCalculationRule = useUpdateCalculationRule();

  // Calculation functions
  const calculateReamsAndSheets = (
    pages: number,
    quantity: number,
    notebookType?: string
  ) => {
    const pagesPerSheet = 24; // Standard pages per sheet
    const sheetsPerReem = 500; // Standard sheets per reem

    const totalPages = pages * quantity;
    const totalSheets = Math.ceil(totalPages / pagesPerSheet);
    const totalReams = Math.ceil(totalSheets / sheetsPerReem);

    return {
      sheets: totalSheets,
      reams: totalReams,
    };
  };

  const getPaperSizeMapping = (description: string) => {
    return paperSizes.find(
      (size) =>
        description.toLowerCase().includes(size.name.toLowerCase()) ||
        size.name.toLowerCase().includes(description.toLowerCase())
    );
  };

  const [calculationForm, setCalculationForm] = useState({
    description: "",
    pages: 96,
    quantity: 1000,
    notebookType: "",
    paperSize: "",
    customPagesPerSheet: 24,
    customSheetsPerReem: 500,
  });

  const [results, setResults] = useState({
    totalPages: 0,
    totalSheets: 0,
    totalReams: 0,
    paperSizeUsed: "",
    steps: 0,
  });

  const [savedCalculations, setSavedCalculations] = useState<any[]>([]);

  // Removed duplicate function - using enhanced version below

  const handleCalculate = () => {
    const { pages, quantity, customPagesPerSheet, customSheetsPerReem } =
      calculationForm;

    // Get paper size mapping
    const paperSize = getPaperSizeMapping(calculationForm.description);

    // Calculate using master data or custom values
    const calculation = calculateReamsAndSheets(
      pages,
      quantity,
      calculationForm.notebookType
    );

    // Additional calculations
    const totalPages = pages * quantity;
    const steps = Math.ceil(pages / customPagesPerSheet);

    setResults({
      totalPages,
      totalSheets: calculation.sheets,
      totalReams: calculation.reams,
      paperSizeUsed: paperSize?.name || "Unknown",
      steps,
    });
  };

  // Enhanced save calculation to database with proper mapping
  const handleSaveCalculation = () => {
    if (!calculationForm.description.trim()) {
      alert("Please enter a calculation description");
      return;
    }

    const currentDate = new Date();
    const calculationData = {
      name: calculationForm.description,
      description: `${calculationForm.notebookType} - ${calculationForm.pages} pages, ${calculationForm.quantity} quantity`,
      variables: {
        pages: calculationForm.pages,
        quantity: calculationForm.quantity,
        paperSize: calculationForm.paperSize,
        notebookType: calculationForm.notebookType,
        customPagesPerSheet: calculationForm.customPagesPerSheet,
        customSheetsPerReem: calculationForm.customSheetsPerReem,
      },
      formula: {
        totalSheets: results.totalSheets.toString(),
        totalReams: results.totalReams.toString(),
        totalPages: results.totalPages.toString(),
        steps: results.steps.toString(),
      },
      result: {
        sheets: results.totalSheets,
        reams: results.totalReams,
        pages: results.totalPages,
        paperSize: results.paperSizeUsed,
        steps: results.steps,
      },
      metadata: {
        paperSize: calculationForm.paperSize,
        notebookType: calculationForm.notebookType,
        calculationDate: currentDate.toISOString(),
        calculationTimestamp: currentDate.getTime(),
        formattedDate: currentDate.toLocaleDateString(),
        version: "2.0",
      },
      createdDate: currentDate.toISOString().split("T")[0],
      createdAt: currentDate.toISOString(),
      updatedAt: currentDate.toISOString(),
      timestamp: currentDate.getTime(),
      createdBy: "admin",
      status: "active",
      type: "notebook_calculation",
      active: true,
    };

    createCalculationRule.mutate(calculationData, {
      onSuccess: (savedCalculation) => {
        alert("Calculation saved successfully!");
        // Add to saved calculations list for immediate display
        setSavedCalculations((prev) => [...prev, savedCalculation]);
      },
      onError: (error) => {
        console.error("Error saving calculation:", error);
        alert("Failed to save calculation");
      },
    });
  };

  const handleReset = () => {
    setCalculationForm({
      description: "",
      pages: 96,
      quantity: 1000,
      notebookType: "",
      paperSize: "",
      customPagesPerSheet: 24,
      customSheetsPerReem: 500,
    });
    setResults({
      totalPages: 0,
      totalSheets: 0,
      totalReams: 0,
      paperSizeUsed: "",
      steps: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Calculation Center</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleReset}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSaveCalculation}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculation Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Calculator className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Notebook Calculation
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={calculationForm.description}
                onChange={(e) =>
                  setCalculationForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., CROWN IV LINE RULED"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pages
                </label>
                <input
                  type="number"
                  value={calculationForm.pages}
                  onChange={(e) =>
                    setCalculationForm((prev) => ({
                      ...prev,
                      pages: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  value={calculationForm.quantity}
                  onChange={(e) =>
                    setCalculationForm((prev) => ({
                      ...prev,
                      quantity: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notebook Type (Optional)
              </label>
              <select
                value={calculationForm.notebookType}
                onChange={(e) =>
                  setCalculationForm((prev) => ({
                    ...prev,
                    notebookType: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Type</option>
                {notebookTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paper Size (Optional)
              </label>
              <select
                value={calculationForm.paperSize}
                onChange={(e) =>
                  setCalculationForm((prev) => ({
                    ...prev,
                    paperSize: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Auto Detect</option>
                {paperSizes.map((size) => (
                  <option key={size.id} value={size.id}>
                    {size.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pages per Sheet
                </label>
                <input
                  type="number"
                  value={calculationForm.customPagesPerSheet}
                  onChange={(e) =>
                    setCalculationForm((prev) => ({
                      ...prev,
                      customPagesPerSheet: parseInt(e.target.value) || 24,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sheets per Reem
                </label>
                <input
                  type="number"
                  value={calculationForm.customSheetsPerReem}
                  onChange={(e) =>
                    setCalculationForm((prev) => ({
                      ...prev,
                      customSheetsPerReem: parseInt(e.target.value) || 500,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCalculate}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Calculator className="h-4 w-4" />
                <span>Calculate</span>
              </button>

              {results.totalPages > 0 && (
                <button
                  onClick={handleSaveCalculation}
                  disabled={createCalculationRule.isPending}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4" />
                  <span>
                    {createCalculationRule.isPending
                      ? "Saving..."
                      : "Save Calculation"}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Calculation Results
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">
                  Total Pages
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {results.totalPages.toLocaleString()}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">
                  Total Sheets
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {results.totalSheets.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">
                  Total Reams
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {results.totalReams}
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Steps</div>
                <div className="text-2xl font-bold text-orange-900">
                  {results.steps}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 font-medium">
                Paper Size Used
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {results.paperSizeUsed}
              </div>
            </div>

            {/* Calculation Breakdown */}
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-3">
                Calculation Breakdown
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pages × Quantity:</span>
                  <span className="font-mono">
                    {calculationForm.pages} × {calculationForm.quantity} ={" "}
                    {results.totalPages.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Total Pages ÷ Pages per Sheet:
                  </span>
                  <span className="font-mono">
                    {results.totalPages.toLocaleString()} ÷{" "}
                    {calculationForm.customPagesPerSheet} ={" "}
                    {results.totalSheets.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Total Sheets ÷ Sheets per Reem:
                  </span>
                  <span className="font-mono">
                    {results.totalSheets.toLocaleString()} ÷{" "}
                    {calculationForm.customSheetsPerReem} = {results.totalReams}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Calculations */}
      {savedCalculations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Saved Calculations
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Pages
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Sheets
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Reams
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Paper Size
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {savedCalculations.map((calc) => (
                  <tr key={calc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {calc.name || calc.description || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {calc.variables?.pages || calc.pages || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {(
                        calc.variables?.quantity ||
                        calc.quantity ||
                        0
                      ).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {(
                        parseInt(calc.formula?.totalSheets) ||
                        calc.totalSheets ||
                        0
                      ).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {parseInt(calc.formula?.totalReams) ||
                        calc.totalReams ||
                        0}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {calc.paperSize || calc.paperSizeUsed || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {calc.createdDate ||
                        new Date(
                          calc.timestamp || Date.now()
                        ).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculations;
