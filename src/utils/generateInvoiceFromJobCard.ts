// Production Invoice Generation from Job Card
// This utility generates real invoices from completed job cards with full client data and calculations

import { JobCard, BindingAdvice, Invoice } from '../services/entities';

export interface InvoiceGenerationResult {
  success: boolean;
  invoice?: Invoice;
  error?: string;
  validationErrors?: string[];
}

export const generateInvoiceFromJobCard = async (
  jobCard: JobCard,
  bindingAdvice: BindingAdvice,
  apiCreateInvoice: (invoiceData: any) => Promise<Invoice>
): Promise<InvoiceGenerationResult> => {
  try {
    // Validation
    const validationErrors = validateJobCardForInvoice(jobCard, bindingAdvice);
    if (validationErrors.length > 0) {
      return {
        success: false,
        validationErrors,
        error: 'Validation failed'
      };
    }

    // Generate invoice data
    const invoiceData = buildInvoiceData(jobCard, bindingAdvice);
    
    // Create invoice via API
    const createdInvoice = await apiCreateInvoice(invoiceData);
    
    return {
      success: true,
      invoice: createdInvoice
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

const validateJobCardForInvoice = (
  jobCard: JobCard,
  bindingAdvice: BindingAdvice
): string[] => {
  const errors: string[] = [];

  // Job card validation
  if (!jobCard.id) errors.push('Job card ID is required');
  if (!jobCard.bindingAdviceId) errors.push('Job card must be linked to a binding advice');
  if (!jobCard.clientName) errors.push('Client name is required');
  if (jobCard.currentStage !== 'completed' && jobCard.progress !== 100) {
    errors.push('Job card must be completed before generating invoice');
  }
  if (!jobCard.quantity || jobCard.quantity <= 0) {
    errors.push('Job card quantity must be greater than 0');
  }

  // Binding advice validation
  if (!bindingAdvice.id) errors.push('Binding advice ID is required');
  if (!bindingAdvice.clientName) errors.push('Binding advice client name is required');
  if (!bindingAdvice.clientContact) errors.push('Client contact is required');
  if (!bindingAdvice.clientEmail) errors.push('Client email is required');
  if (!bindingAdvice.clientAddress) errors.push('Client address is required');
  if (!bindingAdvice.totalAmount || bindingAdvice.totalAmount <= 0) {
    errors.push('Binding advice total amount must be greater than 0');
  }
  if (bindingAdvice.status !== 'approved') {
    errors.push('Binding advice must be approved before generating invoice');
  }

  // Cross-validation
  if (jobCard.bindingAdviceId !== bindingAdvice.id) {
    errors.push('Job card and binding advice do not match');
  }
  if (jobCard.clientName !== bindingAdvice.clientName) {
    errors.push('Client names do not match between job card and binding advice');
  }

  return errors;
};

const buildInvoiceData = (jobCard: JobCard, bindingAdvice: BindingAdvice): any => {
  const invoiceDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(invoiceDate.getDate() + 30); // 30 days payment terms

  // Generate invoice items from binding advice line items
  const items = [];

  if (bindingAdvice.lineItems && bindingAdvice.lineItems.length > 0) {
    // Use line items from binding advice
    bindingAdvice.lineItems.forEach((lineItem, index) => {
      items.push({
        id: `ITEM-${index + 1}`,
        description: `${lineItem.description} - ${bindingAdvice.pages || 96} Pages`,
        quantity: lineItem.quantity || 0,
        rate: lineItem.rate || 15,
        amount: (lineItem.quantity || 0) * (lineItem.rate || 15),
      });
    });
  } else {
    // Fallback to basic job card information
    items.push({
      id: "ITEM-1",
      description: `${jobCard.notebookSize} - Production Complete`,
      quantity: jobCard.producedQuantity || jobCard.quantity || 0,
      rate: bindingAdvice.ratePerNotebook || 15,
      amount: (jobCard.producedQuantity || jobCard.quantity || 0) * (bindingAdvice.ratePerNotebook || 15),
    });
  }

  // Add production completion bonus if applicable
  if (jobCard.currentStage === "completed" && jobCard.progress === 100) {
    const completionBonus = Math.round((bindingAdvice.totalAmount || 0) * 0.02); // 2% completion bonus
    if (completionBonus > 0) {
      items.push({
        id: `ITEM-${items.length + 1}`,
        description: "Production Completion Bonus (2%)",
        quantity: 1,
        rate: completionBonus,
        amount: completionBonus,
      });
    }
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const taxRate = 0.18; // 18% GST
  const taxAmount = Math.round(subtotal * taxRate);
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
    notes: `Invoice generated from Job Card ${jobCard.id} - Production completed with ${jobCard.producedQuantity || jobCard.quantity} units produced. Generated on ${new Date().toLocaleDateString()}.`,
    paymentTerms: "Net 30 days",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// Utility function to find completed job cards that don't have invoices yet
export const findJobCardsReadyForInvoicing = (
  jobCards: JobCard[],
  invoices: Invoice[]
): JobCard[] => {
  const invoicedJobCardIds = new Set(
    invoices.map(invoice => invoice.jobCardId).filter(Boolean)
  );

  return jobCards.filter(jobCard => 
    (jobCard.currentStage === 'completed' || jobCard.progress === 100) &&
    !invoicedJobCardIds.has(jobCard.id)
  );
};

// Utility function to calculate expected invoice amount from job card
export const calculateExpectedInvoiceAmount = (
  jobCard: JobCard,
  bindingAdvice: BindingAdvice
): { subtotal: number; taxAmount: number; totalAmount: number } => {
  let subtotal = 0;

  if (bindingAdvice.lineItems && bindingAdvice.lineItems.length > 0) {
    subtotal = bindingAdvice.lineItems.reduce(
      (sum, item) => sum + ((item.quantity || 0) * (item.rate || 15)), 
      0
    );
  } else {
    subtotal = (jobCard.producedQuantity || jobCard.quantity || 0) * (bindingAdvice.ratePerNotebook || 15);
  }

  // Add completion bonus if applicable
  if (jobCard.currentStage === "completed" && jobCard.progress === 100) {
    const completionBonus = Math.round((bindingAdvice.totalAmount || 0) * 0.02);
    subtotal += completionBonus;
  }

  const taxAmount = Math.round(subtotal * 0.18);
  const totalAmount = subtotal + taxAmount;

  return { subtotal, taxAmount, totalAmount };
};

// Summary function for logging and debugging
export const logInvoiceGenerationSummary = (
  jobCard: JobCard,
  bindingAdvice: BindingAdvice,
  result: InvoiceGenerationResult
): void => {
  console.log("📋 Invoice Generation Summary:");
  console.log(`  Job Card: ${jobCard.id} - ${jobCard.clientName}`);
  console.log(`  Binding Advice: ${bindingAdvice.id} - ₹${bindingAdvice.totalAmount?.toLocaleString()}`);
  console.log(`  Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  if (result.success && result.invoice) {
    console.log(`  Generated Invoice: ${result.invoice.id}`);
    console.log(`  Total Amount: ₹${result.invoice.totalAmount?.toLocaleString()}`);
    console.log(`  Items: ${result.invoice.items?.length || 0}`);
  }
  
  if (result.error) {
    console.log(`  Error: ${result.error}`);
  }
  
  if (result.validationErrors && result.validationErrors.length > 0) {
    console.log(`  Validation Errors:`);
    result.validationErrors.forEach(error => console.log(`    - ${error}`));
  }
};
