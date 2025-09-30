// Test Invoice Generation Process
// This file tests the complete invoice generation from job cards with client data and calculations

export interface TestJobCard {
  id: string;
  bindingAdviceId: string;
  clientName: string;
  notebookSize: string;
  quantity: number;
  producedQuantity?: number;
  currentStage: string;
  progress: number;
  materials: Array<{
    itemId: string;
    itemName: string;
    requiredQuantity: number;
    allocatedQuantity: number;
    consumedQuantity: number;
    specifications: {
      description: string;
      quantity: number;
      rate: number;
      amount: number;
      type: string;
    };
  }>;
}

export interface TestBindingAdvice {
  id: string;
  clientName: string;
  clientContact: string;
  clientEmail: string;
  clientAddress: string;
  notebookSize: string;
  pages: number;
  quantity: number;
  ratePerNotebook: number;
  totalAmount: number;
  status: string;
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
}

export interface TestInvoice {
  id: string;
  clientId: string;
  clientName: string;
  clientContact: string;
  clientEmail: string;
  clientAddress: string;
  bindingAdviceId: string;
  jobCardId?: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  invoiceDate: string;
  dueDate: string;
  status: string;
  items: Array<{
    itemId: string;
    itemName: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Test data for invoice generation
export const testJobCard: TestJobCard = {
  id: "JC-TEST-001",
  bindingAdviceId: "d17c",
  clientName: "Government School",
  notebookSize: "Mixed Products (2 items)",
  quantity: 2000,
  producedQuantity: 2000,
  currentStage: "completed",
  progress: 100,
  materials: [
    {
      itemId: "MAT-d17c-1",
      itemName: "CROWN IV LINE RULED Paper",
      requiredQuantity: 10,
      allocatedQuantity: 10,
      consumedQuantity: 10,
      specifications: {
        description: "CROWN IV LINE RULED",
        quantity: 1000,
        rate: 15,
        amount: 15000,
        type: "paper"
      }
    },
    {
      itemId: "MAT-d17c-2",
      itemName: "CROWN PLAIN NOTEBOOK Paper",
      requiredQuantity: 10,
      allocatedQuantity: 10,
      consumedQuantity: 10,
      specifications: {
        description: "CROWN PLAIN NOTEBOOK",
        quantity: 1000,
        rate: 15,
        amount: 15000,
        type: "paper"
      }
    }
  ]
};

export const testBindingAdvice: TestBindingAdvice = {
  id: "d17c",
  clientName: "Government School",
  clientContact: "9876543210",
  clientEmail: "contact@govschool.edu",
  clientAddress: "123 Education Street, City",
  notebookSize: "A4 Crown",
  pages: 96,
  quantity: 2000,
  ratePerNotebook: 15,
  totalAmount: 30000,
  status: "approved",
  lineItems: [
    {
      id: "1",
      description: "CROWN IV LINE RULED",
      quantity: 1000,
      rate: 15,
      amount: 15000
    },
    {
      id: "2",
      description: "CROWN PLAIN NOTEBOOK",
      quantity: 1000,
      rate: 15,
      amount: 15000
    }
  ]
};

// Function to generate comprehensive invoice from job card and binding advice
export const generateTestInvoice = (
  jobCard: TestJobCard,
  bindingAdvice: TestBindingAdvice
): TestInvoice => {
  const invoiceDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(invoiceDate.getDate() + 30); // 30 days payment terms

  // Generate invoice items from binding advice line items
  const items = bindingAdvice.lineItems.map((lineItem, index) => ({
    itemId: `ITEM-${index + 1}`,
    itemName: `${lineItem.description} - ${bindingAdvice.pages} Pages`,
    description: `${lineItem.description} - ${bindingAdvice.pages} Pages`,
    quantity: lineItem.quantity,
    rate: lineItem.rate,
    amount: lineItem.amount,
  }));

  // Add production completion bonus if job card is completed
  if (jobCard.currentStage === "completed" && jobCard.progress === 100) {
    const completionBonus = Math.round(bindingAdvice.totalAmount * 0.02); // 2% completion bonus
    items.push({
      itemId: `ITEM-${items.length + 1}`,
      itemName: "Production Completion Bonus (2%)",
      description: "Production Completion Bonus (2%)",
      quantity: 1,
      rate: completionBonus,
      amount: completionBonus,
    });
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = Math.round(subtotal * 0.18); // 18% GST
  const totalAmount = subtotal + taxAmount;

  return {
    id: `INV-${Date.now()}`,
    clientId: bindingAdvice.id,
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
    notes: `Invoice generated from Job Card ${jobCard.id} - Production completed with ${jobCard.producedQuantity} units produced.`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// Test function to validate invoice generation
export const testInvoiceGeneration = (): void => {
  console.log("🧪 Testing Invoice Generation Process...");
  
  const generatedInvoice = generateTestInvoice(testJobCard, testBindingAdvice);
  
  console.log("📋 Generated Invoice:", generatedInvoice);
  console.log("💰 Invoice Summary:");
  console.log(`  - Client: ${generatedInvoice.clientName}`);
  console.log(`  - Subtotal: ₹${generatedInvoice.amount.toLocaleString()}`);
  console.log(`  - Tax (18%): ₹${generatedInvoice.taxAmount.toLocaleString()}`);
  console.log(`  - Total: ₹${generatedInvoice.totalAmount.toLocaleString()}`);
  console.log(`  - Items: ${generatedInvoice.items.length}`);
  console.log(`  - Due Date: ${generatedInvoice.dueDate}`);
  
  // Validate calculations
  const expectedSubtotal = generatedInvoice.items.reduce((sum, item) => sum + item.amount, 0);
  const expectedTax = Math.round(expectedSubtotal * 0.18);
  const expectedTotal = expectedSubtotal + expectedTax;
  
  console.log("✅ Validation Results:");
  console.log(`  - Subtotal calculation: ${generatedInvoice.amount === expectedSubtotal ? 'PASS' : 'FAIL'}`);
  console.log(`  - Tax calculation: ${generatedInvoice.taxAmount === expectedTax ? 'PASS' : 'FAIL'}`);
  console.log(`  - Total calculation: ${generatedInvoice.totalAmount === expectedTotal ? 'PASS' : 'FAIL'}`);
  console.log(`  - Client data mapping: ${generatedInvoice.clientName === testBindingAdvice.clientName ? 'PASS' : 'FAIL'}`);
  console.log(`  - Job card reference: ${generatedInvoice.jobCardId === testJobCard.id ? 'PASS' : 'FAIL'}`);
};
