import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { apiClient } from "../services/api";
import { Link } from "react-router-dom";

const ApiStatusBanner: React.FC = () => {
  const [status, setStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    checkConnection();
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    try {
      await apiClient.get("/bindingAdvices");
      setStatus("connected");
      setErrorMessage("");
    } catch (error: any) {
      setStatus("disconnected");
      if (error.code === "ERR_NETWORK" || error.message.includes("Network Error")) {
        setErrorMessage("Cannot connect to API server. Make sure JSON server is running.");
      } else {
        setErrorMessage(error.message || "Unknown error");
      }
    }
  };

  if (status === "connected") {
    return null; // Don't show banner when connected
  }

  if (status === "checking") {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-blue-400 mr-3" />
          <p className="text-sm text-blue-700">Checking API connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
      <div className="flex items-start">
        <XCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">API Connection Error</h3>
          <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
          <div className="mt-3 flex items-center space-x-4">
            <button
              onClick={checkConnection}
              className="text-sm font-medium text-red-800 hover:text-red-900 underline"
            >
              Retry Connection
            </button>
            <Link
              to="/api-diagnostics"
              className="text-sm font-medium text-red-800 hover:text-red-900 underline flex items-center"
            >
              View Diagnostics
              <ExternalLink className="h-3 w-3 ml-1" />
            </Link>
          </div>
          <div className="mt-3 text-xs text-red-600 bg-red-100 p-2 rounded">
            <strong>Quick Fix:</strong> Run <code className="bg-red-200 px-1 py-0.5 rounded">npm run server</code> in a terminal
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiStatusBanner;

