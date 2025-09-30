/**
 * API Connection Test Utility
 * Use this to test if the API is working correctly
 */

import { apiClient } from "../services/api";

export const testApiConnection = async () => {
  console.log("🔍 Testing API Connection...");
  console.log("API Base URL:", import.meta.env.VITE_API_BASE_URL || "http://localhost:3001");

  const results = {
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
    tests: [] as Array<{
      endpoint: string;
      status: "success" | "error";
      message: string;
      data?: any;
    }>,
  };

  const endpoints = [
    "bindingAdvices",
    "jobCards",
    "inventory",
    "dispatches",
    "invoices",
    "clients",
    "paperSizes",
    "notebookTypes",
    "calculationRules",
    "teams",
    "users",
    "roles",
    "systemSettings",
    "productionPlans",
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await apiClient.get(`/${endpoint}`);
      results.tests.push({
        endpoint,
        status: "success",
        message: `✅ ${endpoint}: ${response.data.length} items`,
        data: response.data,
      });
      console.log(`✅ ${endpoint}: ${response.data.length} items`);
    } catch (error: any) {
      results.tests.push({
        endpoint,
        status: "error",
        message: `❌ ${endpoint}: ${error.message}`,
      });
      console.error(`❌ ${endpoint}:`, error.message);
    }
  }

  console.log("\n📊 Test Summary:");
  console.log(`Total Endpoints: ${endpoints.length}`);
  console.log(
    `Successful: ${results.tests.filter((t) => t.status === "success").length}`
  );
  console.log(
    `Failed: ${results.tests.filter((t) => t.status === "error").length}`
  );

  return results;
};

// Quick test function to call from browser console
(window as any).testApi = testApiConnection;

export default testApiConnection;

