# Quantity Management System - Complete Guide

## 🎯 Overview

A comprehensive dynamic quantity management system that tracks and allocates quantities through the entire production workflow:

**Binding Advice → Job Cards → Production Stages**

Each level maintains its own quantity balance, ensuring accurate tracking and preventing over-allocation.

---

## 📊 System Architecture

### Three-Level Hierarchy

```
┌─────────────────────────────────────┐
│     BINDING ADVICE (Level 1)        │
│  Total Quantity: 2000 units          │
│  ├─ Allocated to Job Cards: 1500    │
│  └─ Remaining Balance: 500          │
└─────────────────────────────────────┘
           │
           ├─────────────────────────────┐
           │                             │
┌──────────▼──────────────┐   ┌─────────▼──────────────┐
│  JOB CARD 1 (Level 2)   │   │  JOB CARD 2 (Level 2)  │
│  Allocated: 500 units    │   │  Allocated: 1000 units │
│  ├─ To Stages: 300      │   │  ├─ To Stages: 600     │
│  └─ Remaining: 200      │   │  └─ Remaining: 400     │
└─────────────────────────┘   └────────────────────────┘
           │                             │
    ┌──────┴──────┐              ┌──────┴──────┐
    │             │              │             │
┌───▼───┐   ┌────▼────┐    ┌────▼───┐   ┌────▼────┐
│Design │   │Printing │    │Design  │   │Printing │
│100    │   │200      │    │300     │   │300      │
│(L3)   │   │(L3)     │    │(L3)    │   │(L3)     │
└───────┘   └─────────┘    └────────┘   └─────────┘
```

---

## 🔄 Workflow Process

### Step 1: Create Binding Advice
**Initial Setup**

1. Navigate to **Binding Advice** page
2. Click **"Create New Binding Advice"**
3. Fill in client details and line items
4. **Total Quantity** is calculated automatically from line items
5. Example: Total = 2000 units

**Result:**
- Binding Advice created with 2000 units
- All 2000 units available for job card allocation
- Remaining balance: 2000

---

### Step 2: Create Job Card from Binding Advice
**Allocate Portion to Job Card**

1. Navigate to **Job Cards** page
2. Click **"Create New Job Card"**
3. Select a **Binding Advice** from dropdown
4. System shows:
   - Total quantity in binding advice
   - Already allocated to other job cards
   - **Available balance** for new job card

5. Use **Quantity Selector** to allocate:
   - Enter custom amount (e.g., 500)
   - Or use quick select buttons (25%, 50%, 75%, 100%)
   - System validates: cannot exceed available balance

6. Submit to create job card

**Result:**
- Job Card created with 500 units allocated
- Binding Advice updated:
  - Total: 2000
  - Allocated: 500
  - Remaining: 1500
- Job Card has 500 units available for stage allocation

**Example:**
```
Binding Advice BA-001: 2000 units
  ├─ Job Card JC-001: 500 units (allocated)
  └─ Remaining: 1500 units (available for more job cards)
```

---

### Step 3: Allocate Quantity to Production Stages
**Stage-by-Stage Allocation**

1. From **Job Cards** page, click **Workflow** icon (🔄) on a job card
2. Opens **Production Stage Management** page
3. See **Quantity Allocation Overview**:
   - Total job card quantity
   - Allocated to stages
   - Remaining balance

4. Navigate through stages:
   - **Design** → **Procurement** → **Printing** → **Cutting & Binding** → **Gathering & Binding** → **Quality** → **Packing**

5. For each stage:
   - Use **Quantity Selector** to allocate portion
   - Enter amount or use quick select (25%, 50%, 75%, 100%)
   - System shows:
     - Available balance from job card
     - Already allocated to other stages
     - Remaining after this allocation

6. Click **"Save Progress"** to persist changes

**Result:**
- Stage allocations saved
- Job card balance updated
- Progress tracked per stage

**Example:**
```
Job Card JC-001: 500 units
  ├─ Design: 100 units (allocated)
  ├─ Procurement: 150 units (allocated)
  ├─ Printing: 200 units (allocated)
  └─ Remaining: 50 units (available for other stages)
```

---

## 🎨 UI Components

### 1. **QuantitySelector Component**
Interactive input for selecting quantities

**Features:**
- Number input with validation
- Quick select buttons (25%, 50%, 75%, 100%)
- Real-time validation
- Visual feedback (green = valid, red = invalid)
- Shows remaining balance after selection
- Prevents exceeding available quantity

**Usage:**
```tsx
<QuantitySelector
  availableQuantity={1500}
  onQuantitySelect={(qty) => handleQuantityChange(qty)}
  label="Select Quantity"
  showSuggestions={true}
/>
```

---

### 2. **QuantityAllocationDisplay Component**
Visual display of quantity allocation status

**Features:**
- Progress bar showing allocation percentage
- Three-column summary (Total, Allocated, Remaining)
- Completion progress (if applicable)
- Color-coded status indicators
- Responsive design

**Usage:**
```tsx
<QuantityAllocationDisplay
  totalQuantity={2000}
  allocatedQuantity={1500}
  completedQuantity={800}
  remainingQuantity={500}
  level="binding_advice"
  showDetails={true}
/>
```

---

## 📋 Data Structure

### Binding Advice with Quantity Tracking
```typescript
{
  id: "BA-001",
  quantity: 2000,
  allocatedQuantity: 1500,
  remainingQuantity: 500,
  jobCardAllocations: [
    {
      jobCardId: "JC-001",
      allocatedQuantity: 500,
      allocatedDate: "2025-09-30"
    },
    {
      jobCardId: "JC-002",
      allocatedQuantity: 1000,
      allocatedDate: "2025-09-30"
    }
  ]
}
```

### Job Card with Quantity Tracking
```typescript
{
  id: "JC-001",
  bindingAdviceId: "BA-001",
  quantity: 500,
  allocatedQuantity: 500,
  stageAllocatedQuantity: 450,
  remainingQuantity: 50,
  stageAllocations: [
    {
      stageKey: "designing",
      stageName: "Design",
      allocatedQuantity: 100,
      completedQuantity: 100,
      status: "completed"
    },
    {
      stageKey: "printing",
      stageName: "Printing",
      allocatedQuantity: 200,
      completedQuantity: 150,
      status: "in_progress"
    }
  ]
}
```

---

## ✅ Validation Rules

### 1. **Binding Advice Level**
- ✅ Total quantity must be > 0
- ✅ Cannot allocate more than total quantity
- ✅ Sum of job card allocations ≤ total quantity

### 2. **Job Card Level**
- ✅ Allocated quantity must be > 0
- ✅ Cannot exceed available balance in binding advice
- ✅ Sum of stage allocations ≤ job card quantity

### 3. **Stage Level**
- ✅ Stage allocation must be > 0
- ✅ Cannot exceed available balance in job card
- ✅ Completed quantity ≤ allocated quantity

---

## 🔍 Tracking & Monitoring

### Dashboard Views

**Binding Advice Summary:**
- Total quantity across all binding advices
- Total allocated to job cards
- Total remaining balance
- Allocation percentage

**Job Card Summary:**
- Total quantity across all job cards
- Total allocated to stages
- Total completed
- Progress percentage

**Stage Summary:**
- Quantity per stage
- Completed vs pending
- Stage-wise progress

---

## 🚀 Usage Examples

### Example 1: Full Workflow
```
1. Create Binding Advice: 2000 units
2. Create Job Card 1: Allocate 500 units
   - Binding Advice remaining: 1500 units
3. Allocate to stages in Job Card 1:
   - Design: 100 units
   - Procurement: 150 units
   - Printing: 200 units
   - Job Card 1 remaining: 50 units
4. Create Job Card 2: Allocate 1000 units
   - Binding Advice remaining: 500 units
5. Continue allocating to stages...
```

### Example 2: Partial Allocation
```
1. Binding Advice: 1000 units
2. Job Card 1: 300 units (30%)
3. Job Card 2: 400 units (40%)
4. Remaining: 300 units (30%) - available for future job cards
```

---

## 📁 File Structure

```
src/
├── types/
│   └── quantityManagement.ts          # Type definitions
├── components/
│   ├── QuantitySelector.tsx           # Quantity input component
│   └── QuantityAllocationDisplay.tsx  # Allocation display component
├── components/forms/
│   └── JobCardForm.tsx                # Updated with quantity selector
├── pages/
│   └── ProductionStageFlow.tsx        # Stage management with quantities
└── services/
    └── api.ts                         # Updated interfaces
```

---

## 🎯 Key Features

✅ **Three-level quantity tracking** (Binding Advice → Job Card → Stage)
✅ **Real-time balance calculation**
✅ **Visual progress indicators**
✅ **Validation at each level**
✅ **Quick select options** (25%, 50%, 75%, 100%)
✅ **Responsive UI design**
✅ **Auto-save functionality**
✅ **Comprehensive error handling**

---

## 🐛 Troubleshooting

### Issue: Quantity not updating
**Solution:** Click "Save Progress" button after making changes

### Issue: Cannot allocate quantity
**Solution:** Check available balance - may be fully allocated

### Issue: Validation error
**Solution:** Ensure quantity is within available balance

---

## 📝 Best Practices

1. **Always save progress** after allocating quantities
2. **Check available balance** before allocation
3. **Use quick select buttons** for common percentages
4. **Review allocation summary** before saving
5. **Track completion** at each stage

---

**Last Updated:** 2025-09-30
**Version:** 1.0.0
**Status:** ✅ Production Ready

