// Cleanup utility for test data
// This utility helps remove test invoices and mock data after testing

const API_BASE = "http://localhost:3001";

export interface CleanupResult {
  success: boolean;
  deletedCount: number;
  errors: string[];
  details: string[];
}

// Function to identify test invoices
export const identifyTestInvoices = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE}/invoices`);
    if (!response.ok) {
      throw new Error(`Failed to fetch invoices: ${response.statusText}`);
    }

    const invoices = await response.json();

    // Identify test invoices by various criteria
    const testInvoices = invoices.filter((invoice: any) => {
      return (
        // Test invoices generated from our test job card
        invoice.jobCardId === "3ae3" ||
        invoice.bindingAdviceId === "d17c" ||
        // Test invoices with specific test patterns
        invoice.notes?.includes("Generated on") ||
        invoice.notes?.includes("Production completed with") ||
        invoice.clientName === "Test Client" ||
        // Invoices with test completion bonus
        invoice.items?.some((item: any) =>
          item.description?.includes("Production Completion Bonus")
        ) ||
        // Recent invoices created during testing (today)
        (invoice.createdAt &&
          new Date(invoice.createdAt).toDateString() ===
            new Date().toDateString())
      );
    });

    return testInvoices;
  } catch (error) {
    console.error("Error identifying test invoices:", error);
    return [];
  }
};

// Function to delete a single invoice
export const deleteInvoice = async (invoiceId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/invoices/${invoiceId}`, {
      method: "DELETE",
    });

    return response.ok;
  } catch (error) {
    console.error(`Error deleting invoice ${invoiceId}:`, error);
    return false;
  }
};

// Main cleanup function
export const cleanupTestInvoices = async (): Promise<CleanupResult> => {
  const result: CleanupResult = {
    success: true,
    deletedCount: 0,
    errors: [],
    details: [],
  };

  try {
    console.log("🔍 Identifying test invoices...");
    const testInvoices = await identifyTestInvoices();

    if (testInvoices.length === 0) {
      result.details.push("No test invoices found to cleanup");
      console.log("✅ No test invoices found to cleanup");
      return result;
    }

    console.log(`📋 Found ${testInvoices.length} test invoices to delete:`);
    testInvoices.forEach((invoice) => {
      console.log(
        `  - ${invoice.id}: ${
          invoice.clientName
        } - ₹${invoice.totalAmount?.toLocaleString()}`
      );
    });

    // Delete each test invoice
    for (const invoice of testInvoices) {
      console.log(`🗑️ Deleting invoice ${invoice.id}...`);

      const deleted = await deleteInvoice(invoice.id);

      if (deleted) {
        result.deletedCount++;
        result.details.push(
          `Deleted invoice ${invoice.id} (${invoice.clientName})`
        );
        console.log(`✅ Deleted invoice ${invoice.id}`);
      } else {
        result.errors.push(`Failed to delete invoice ${invoice.id}`);
        console.log(`❌ Failed to delete invoice ${invoice.id}`);
      }

      // Small delay between deletions
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    if (result.errors.length > 0) {
      result.success = false;
    }

    console.log(`\n🎉 Cleanup completed:`);
    console.log(`  - Deleted: ${result.deletedCount} invoices`);
    console.log(`  - Errors: ${result.errors.length}`);
  } catch (error) {
    result.success = false;
    result.errors.push(
      error instanceof Error ? error.message : "Unknown error"
    );
    console.error("❌ Cleanup failed:", error);
  }

  return result;
};

// Function to cleanup specific invoice by ID
export const cleanupInvoiceById = async (
  invoiceId: string
): Promise<boolean> => {
  try {
    console.log(`🗑️ Deleting specific invoice: ${invoiceId}`);

    const deleted = await deleteInvoice(invoiceId);

    if (deleted) {
      console.log(`✅ Successfully deleted invoice ${invoiceId}`);
      return true;
    } else {
      console.log(`❌ Failed to delete invoice ${invoiceId}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error deleting invoice ${invoiceId}:`, error);
    return false;
  }
};

// Function to get cleanup summary
export const getCleanupSummary = async (): Promise<{
  totalInvoices: number;
  testInvoices: number;
  productionInvoices: number;
  testInvoicesList: any[];
}> => {
  try {
    const response = await fetch(`${API_BASE}/invoices`);
    if (!response.ok) {
      throw new Error(`Failed to fetch invoices: ${response.statusText}`);
    }

    const allInvoices = await response.json();
    const testInvoices = await identifyTestInvoices();

    return {
      totalInvoices: allInvoices.length,
      testInvoices: testInvoices.length,
      productionInvoices: allInvoices.length - testInvoices.length,
      testInvoicesList: testInvoices,
    };
  } catch (error) {
    console.error("Error getting cleanup summary:", error);
    return {
      totalInvoices: 0,
      testInvoices: 0,
      productionInvoices: 0,
      testInvoicesList: [],
    };
  }
};

// Browser console helper functions
if (typeof window !== "undefined") {
  (window as any).cleanupTestInvoices = cleanupTestInvoices;
  (window as any).cleanupInvoiceById = cleanupInvoiceById;
  (window as any).getCleanupSummary = getCleanupSummary;
  (window as any).identifyTestInvoices = identifyTestInvoices;

  console.log("🧹 Cleanup utilities loaded:");
  console.log("  - cleanupTestInvoices(): Remove all test invoices");
  console.log("  - cleanupInvoiceById(id): Remove specific invoice");
  console.log("  - getCleanupSummary(): Get cleanup statistics");
  console.log("  - identifyTestInvoices(): List all test invoices");
}

// Export for use in components
export default {
  cleanupTestInvoices,
  cleanupInvoiceById,
  getCleanupSummary,
  identifyTestInvoices,
  deleteInvoice,
};
