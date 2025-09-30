import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Server,
  Database,
  Wifi,
} from "lucide-react";
import { testApiConnection } from "../utils/testApiConnection";

const ApiDiagnostics: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const runTest = async () => {
    setTesting(true);
    try {
      const testResults = await testApiConnection();
      setResults(testResults);
    } catch (error) {
      console.error("Test failed:", error);
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    runTest();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(runTest, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const successCount = results?.tests.filter((t: any) => t.status === "success").length || 0;
  const errorCount = results?.tests.filter((t: any) => t.status === "error").length || 0;
  const totalCount = results?.tests.length || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                API Connection Diagnostics
              </h1>
              <p className="text-gray-600">
                Test and monitor your API connection status
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Auto-refresh (5s)</span>
              </label>
              <button
                onClick={runTest}
                disabled={testing}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-5 w-5 ${testing ? "animate-spin" : ""}`} />
                <span>{testing ? "Testing..." : "Run Test"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Connection Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Server className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">API Base URL</p>
                <p className="text-sm font-semibold text-gray-900 break-all">
                  {results?.baseUrl || "Loading..."}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`p-3 rounded-lg ${successCount > 0 ? "bg-green-100" : "bg-gray-100"}`}>
                <CheckCircle className={`h-6 w-6 ${successCount > 0 ? "text-green-600" : "text-gray-400"}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-green-600">
                  {successCount} / {totalCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`p-3 rounded-lg ${errorCount > 0 ? "bg-red-100" : "bg-gray-100"}`}>
                <XCircle className={`h-6 w-6 ${errorCount > 0 ? "text-red-600" : "text-gray-400"}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {errorCount} / {totalCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        {results && (
          <div
            className={`rounded-xl p-4 mb-6 ${
              errorCount === 0
                ? "bg-green-50 border border-green-200"
                : errorCount === totalCount
                ? "bg-red-50 border border-red-200"
                : "bg-yellow-50 border border-yellow-200"
            }`}
          >
            <div className="flex items-center space-x-3">
              {errorCount === 0 ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900">
                      All Systems Operational
                    </p>
                    <p className="text-sm text-green-700">
                      All API endpoints are responding correctly
                    </p>
                  </div>
                </>
              ) : errorCount === totalCount ? (
                <>
                  <XCircle className="h-6 w-6 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-900">
                      API Connection Failed
                    </p>
                    <p className="text-sm text-red-700">
                      Cannot connect to the API server. Make sure the JSON server is running on port 3002.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-yellow-900">
                      Partial Connection Issues
                    </p>
                    <p className="text-sm text-yellow-700">
                      Some endpoints are not responding correctly
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Endpoint Results */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Endpoint Status
          </h2>
          {testing && !results ? (
            <div className="text-center py-12">
              <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Testing API endpoints...</p>
            </div>
          ) : results ? (
            <div className="space-y-2">
              {results.tests.map((test: any, index: number) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    test.status === "success"
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {test.status === "success" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        /{test.endpoint}
                      </p>
                      <p
                        className={`text-sm ${
                          test.status === "success"
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {test.message}
                      </p>
                    </div>
                  </div>
                  {test.status === "success" && test.data && (
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-700">
                        {test.data.length} items
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Wifi className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Click "Run Test" to check API connection</p>
            </div>
          )}
        </div>

        {/* Troubleshooting Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Troubleshooting Tips
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start space-x-2">
              <span className="font-bold">1.</span>
              <span>
                Make sure the JSON server is running: <code className="bg-blue-100 px-2 py-1 rounded">npm run server</code> or <code className="bg-blue-100 px-2 py-1 rounded">npx json-server --watch db.json --port 3002</code>
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-bold">2.</span>
              <span>
                Check your .env file has: <code className="bg-blue-100 px-2 py-1 rounded">VITE_API_BASE_URL=http://localhost:3002</code>
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-bold">3.</span>
              <span>
                Restart the frontend dev server after changing .env: <code className="bg-blue-100 px-2 py-1 rounded">npm run dev</code>
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-bold">4.</span>
              <span>
                Test the API directly in browser: <a href="http://localhost:3002/bindingAdvices" target="_blank" rel="noopener noreferrer" className="underline font-semibold">http://localhost:3002/bindingAdvices</a>
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-bold">5.</span>
              <span>
                Check browser console (F12) for detailed error messages
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ApiDiagnostics;

