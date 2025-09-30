// Test script to generate invoice from job card
// This script demonstrates the complete invoice generation process

const API_BASE = 'http://localhost:3002';

// Test data from the database
const testJobCard = {
  "id": "3ae3",
  "bindingAdviceId": "d17c",
  "clientName": "Government School",
  "notebookSize": "Mixed Products (2 items)",
  "quantity": 2000,
  "currentStage": "completed",
  "progress": 100,
  "producedQuantity": 2000,
  "materials": [
    {
      "itemId": "MAT-d17c-1",
      "itemName": "CROWN IV LINE RULED Paper",
      "specifications": {
        "description": "CROWN IV LINE RULED",
        "quantity": 1000,
        "rate": 15,
        "amount": 15000
      }
    },
    {
      "itemId": "MAT-d17c-2",
      "itemName": "CROWN PLAIN NOTEBOOK Paper",
      "specifications": {
        "description": "CROWN PLAIN NOTEBOOK",
        "quantity": 1000,
        "rate": 15,
        "amount": 15000
      }
    }
  ]
};

const testBindingAdvice = {
  "id": "d17c",
  "clientName": "Government School",
  "clientContact": "9876543210",
  "clientEmail": "contact@govschool.edu",
  "clientAddress": "123 Education Street, City",
  "notebookSize": "A4 Crown",
  "pages": 96,
  "quantity": 2000,
  "ratePerNotebook": 15,
  "totalAmount": 30000,
  "status": "approved",
  "lineItems": [
    {
      "id": "1",
      "description": "CROWN IV LINE RULED",
      "quantity": 1000,
      "rate": 15,
      "amount": 15000
    },
    {
      "id": "2",
      "description": "CROWN PLAIN NOTEBOOK",
      "quantity": 1000,
      "rate": 15,
      "amount": 15000
    }
  ]
};

// Generate comprehensive invoice data
function generateInvoiceData(jobCard, bindingAdvice) {
  const invoiceDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(invoiceDate.getDate() + 30); // 30 days payment terms

  // Generate invoice items from binding advice line items
  const items = bindingAdvice.lineItems.map((lineItem, index) => ({
    id: `ITEM-${index + 1}`,
    description: `${lineItem.description} - ${bindingAdvice.pages} Pages`,
    quantity: lineItem.quantity,
    rate: lineItem.rate,
    amount: lineItem.amount,
  }));

  // Add production completion bonus
  const completionBonus = Math.round(bindingAdvice.totalAmount * 0.02); // 2% completion bonus
  items.push({
    id: `ITEM-${items.length + 1}`,
    description: "Production Completion Bonus (2%)",
    quantity: 1,
    rate: completionBonus,
    amount: completionBonus,
  });

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = Math.round(subtotal * 0.18); // 18% GST
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Test the invoice generation process
async function testInvoiceGeneration() {
  console.log("🚀 Starting Invoice Generation Test...");
  console.log("📋 Job Card:", testJobCard.id, "-", testJobCard.clientName);
  console.log("📄 Binding Advice:", testBindingAdvice.id, "- ₹", testBindingAdvice.totalAmount.toLocaleString());

  try {
    // Generate invoice data
    const invoiceData = generateInvoiceData(testJobCard, testBindingAdvice);
    
    console.log("\n💰 Generated Invoice Data:");
    console.log("  Client:", invoiceData.clientName);
    console.log("  Contact:", invoiceData.clientContact);
    console.log("  Email:", invoiceData.clientEmail);
    console.log("  Address:", invoiceData.clientAddress);
    console.log("  Items:", invoiceData.items.length);
    console.log("  Subtotal: ₹", invoiceData.amount.toLocaleString());
    console.log("  Tax (18%): ₹", invoiceData.taxAmount.toLocaleString());
    console.log("  Total: ₹", invoiceData.totalAmount.toLocaleString());
    console.log("  Due Date:", invoiceData.dueDate);

    console.log("\n📝 Invoice Items:");
    invoiceData.items.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.description}`);
      console.log(`     Qty: ${item.quantity.toLocaleString()} | Rate: ₹${item.rate} | Amount: ₹${item.amount.toLocaleString()}`);
    });

    // Create invoice via API
    console.log("\n🔄 Creating invoice via API...");
    const response = await fetch(`${API_BASE}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const createdInvoice = await response.json();
    console.log("✅ Invoice created successfully!");
    console.log("📄 Invoice ID:", createdInvoice.id);
    console.log("💰 Total Amount: ₹", createdInvoice.totalAmount.toLocaleString());

    // Store the created invoice ID for cleanup
    window.testInvoiceId = createdInvoice.id;

    return {
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
    };

  } catch (error) {
    console.error("❌ Invoice generation failed:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Cleanup function to remove test invoice
async function cleanupTestInvoice() {
  if (!window.testInvoiceId) {
    console.log("⚠️ No test invoice to cleanup");
    return;
  }

  try {
    console.log("🧹 Cleaning up test invoice:", window.testInvoiceId);
    
    const response = await fetch(`${API_BASE}/invoices/${window.testInvoiceId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.status} ${response.statusText}`);
    }

    console.log("✅ Test invoice deleted successfully");
    window.testInvoiceId = null;

  } catch (error) {
    console.error("❌ Cleanup failed:", error);
  }
}

// Export functions for use in browser console
window.testInvoiceGeneration = testInvoiceGeneration;
window.cleanupTestInvoice = cleanupTestInvoice;

console.log("🧪 Invoice Generation Test Script Loaded");
console.log("📝 Available functions:");
console.log("  - testInvoiceGeneration(): Generate and create test invoice");
console.log("  - cleanupTestInvoice(): Delete the test invoice");
console.log("\n💡 Usage:");
console.log("  1. Run: await testInvoiceGeneration()");
console.log("  2. Check the generated invoice in the Billing page");
console.log("  3. Run: await cleanupTestInvoice() to remove test data");
