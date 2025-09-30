import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductionStageWizard, {
  DEFAULT_PRODUCTION_STAGES,
  ProductionStage,
} from "../components/ProductionStageWizard";

/**
 * Demo page to showcase the Production Stage Wizard component
 * This demonstrates the step-wise dropdown navigation for production stages
 */
const ProductionStageDemo: React.FC = () => {
  const navigate = useNavigate();
  const [currentStage, setCurrentStage] = useState("designing");
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [showOnlyCurrentStage, setShowOnlyCurrentStage] = useState(true);
  const [allowBackNavigation, setAllowBackNavigation] = useState(true);

  const handleStageChange = (stageKey: string) => {
    console.log("Stage changed to:", stageKey);
    setCurrentStage(stageKey);
  };

  const handleStageComplete = (stageKey: string) => {
    console.log("Stage completed:", stageKey);
    if (!completedStages.includes(stageKey)) {
      setCompletedStages([...completedStages, stageKey]);
    }
  };

  const handleReset = () => {
    setCurrentStage("designing");
    setCompletedStages([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/job-cards")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Job Cards
          </button>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Production Stage Wizard Demo
                </h1>
                <p className="text-gray-600 text-lg">
                  Step-wise dropdown navigation for production process management
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    ✨ Dynamic Stage Loading
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    📱 Mobile Responsive
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    🔄 State Management
                  </span>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Reset Demo
              </button>
            </div>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Configuration Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">
                  Show Only Current Stage
                </p>
                <p className="text-sm text-gray-600">
                  Hide previous stages when moving forward
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyCurrentStage}
                  onChange={(e) => setShowOnlyCurrentStage(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">
                  Allow Back Navigation
                </p>
                <p className="text-sm text-gray-600">
                  Enable previous button to go back
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowBackNavigation}
                  onChange={(e) => setAllowBackNavigation(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Main Wizard Component */}
        <div className="mb-8">
          <ProductionStageWizard
            stages={DEFAULT_PRODUCTION_STAGES}
            currentStage={currentStage}
            onStageChange={handleStageChange}
            onStageComplete={handleStageComplete}
            completedStages={completedStages}
            showOnlyCurrentStage={showOnlyCurrentStage}
            allowBackNavigation={allowBackNavigation}
          />
        </div>

        {/* Stage Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Current State
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  Current Stage:
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {DEFAULT_PRODUCTION_STAGES.find((s) => s.key === currentStage)
                    ?.label || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  Completed Stages:
                </span>
                <span className="text-sm font-bold text-green-600">
                  {completedStages.length} / {DEFAULT_PRODUCTION_STAGES.length}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  Progress:
                </span>
                <span className="text-sm font-bold text-purple-600">
                  {Math.round(
                    (completedStages.length / DEFAULT_PRODUCTION_STAGES.length) *
                      100
                  )}
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              All Stages
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {DEFAULT_PRODUCTION_STAGES.map((stage, index) => (
                <div
                  key={stage.key}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                    stage.key === currentStage
                      ? "bg-blue-100 border-2 border-blue-500"
                      : completedStages.includes(stage.key)
                      ? "bg-green-50 border border-green-200"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        stage.key === currentStage
                          ? "bg-blue-500 text-white"
                          : completedStages.includes(stage.key)
                          ? "bg-green-500 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        stage.key === currentStage
                          ? "text-blue-900"
                          : completedStages.includes(stage.key)
                          ? "text-green-900"
                          : "text-gray-700"
                      }`}
                    >
                      {stage.label}
                    </span>
                  </div>
                  {completedStages.includes(stage.key) && (
                    <span className="text-green-600 text-xs font-semibold">
                      ✓ Done
                    </span>
                  )}
                  {stage.key === currentStage && (
                    <span className="text-blue-600 text-xs font-semibold animate-pulse">
                      ● Active
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2">🎯 Step-wise Navigation</h3>
              <p className="text-sm text-blue-100">
                Only current stage visible, previous stages hidden automatically
              </p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2">📊 Progress Tracking</h3>
              <p className="text-sm text-blue-100">
                Visual progress bar and stage completion indicators
              </p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2">🔄 State Management</h3>
              <p className="text-sm text-blue-100">
                React state hooks for tracking current and completed stages
              </p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2">📱 Responsive Design</h3>
              <p className="text-sm text-blue-100">
                Mobile-friendly UI with touch-optimized controls
              </p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2">🎨 Customizable</h3>
              <p className="text-sm text-blue-100">
                Dynamic stage loading from JSON/API data
              </p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2">⚡ Smooth Transitions</h3>
              <p className="text-sm text-blue-100">
                Animated stage changes with loading states
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionStageDemo;

