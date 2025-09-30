# 📦 Dynamic Quantity Management System

## 🎯 Overview

A complete quantity tracking and allocation system for the Madura ERP application that manages quantities across three levels:

**Binding Advice → Job Cards → Production Stages**

Each level maintains accurate balance tracking, prevents over-allocation, and provides real-time visual feedback.

---

## ✨ Key Features

### 🔢 Three-Level Quantity Tracking
- **Level 1:** Binding Advice (Total quantity pool)
- **Level 2:** Job Cards (Allocated from binding advice)
- **Level 3:** Production Stages (Allocated from job card)

### ✅ Real-Time Validation
- Prevents exceeding available balance
- Instant feedback on quantity validity
- Visual indicators (green = valid, red = invalid)

### 📊 Visual Progress Tracking
- Progress bars showing allocation percentage
- Color-coded status indicators
- Summary cards with Total/Allocated/Remaining

### 🚀 User-Friendly Interface
- Quick select buttons (25%, 50%, 75%, 100%)
- Manual input with validation
- Clear error messages
- Responsive design

---

## 🏗️ Architecture

### Data Flow

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

## 🚀 Quick Start

### 1. Start the Application

```bash
# Terminal 1 - Backend (JSON Server)
npm run server

# Terminal 2 - Frontend (Vite)
npm run dev
```

### 2. Create a Binding Advice

1. Navigate to **Binding Advice** page
2. Click **"Create New Binding Advice"**
3. Fill in client details
4. Add line items (quantities are summed automatically)
5. Submit

**Result:** Binding Advice created with total quantity available

### 3. Create a Job Card

1. Navigate to **Job Cards** page
2. Click **"Create New Job Card"**
3. Select a binding advice from dropdown
4. **Use the Quantity Selector:**
   - View available balance
   - Enter quantity or use quick select (25%, 50%, 75%, 100%)
   - System validates in real-time
5. Submit

**Result:** Job Card created with allocated quantity deducted from binding advice

### 4. Allocate to Production Stages

1. From **Job Cards** page, click **Workflow** icon (🔄) on a job card
2. View **Quantity Allocation Overview** at the top
3. Navigate through production stages
4. For each stage:
   - Use **Quantity Selector** to allocate portion
   - View remaining balance update in real-time
5. Click **"Save Progress"** to persist changes

**Result:** Stage allocations saved, job card balance updated

---

## 📋 Components

### 1. QuantitySelector

Interactive input component for selecting quantities.

**Features:**
- Number input with validation
- Quick select buttons (25%, 50%, 75%, 100%)
- Real-time error checking
- Visual feedback (✅ valid, ❌ invalid)
- Summary display

**Props:**
```typescript
{
  availableQuantity: number;
  onQuantitySelect: (quantity: number) => void;
  label?: string;
  placeholder?: string;
  showSuggestions?: boolean;
  disabled?: boolean;
}
```

### 2. QuantityAllocationDisplay

Visual display component for quantity allocation status.

**Features:**
- Progress bar with percentage
- Three-column summary (Total, Allocated, Remaining)
- Completion tracking
- Color-coded status
- Responsive layout

**Props:**
```typescript
{
  totalQuantity: number;
  allocatedQuantity: number;
  completedQuantity?: number;
  remainingQuantity: number;
  level: "binding_advice" | "job_card" | "stage";
  showDetails?: boolean;
}
```

---

## 📊 Example Workflow

### Complete Example: 2000 Units

```
Step 1: Create Binding Advice
├─ Client: ABC Company
├─ Line Items:
│  ├─ Item 1: 1000 units
│  └─ Item 2: 1000 units
└─ Total: 2000 units ✅

Step 2: Create Job Card 1
├─ Select: BA-001
├─ Available: 2000 units
├─ Allocate: 500 units (25%)
└─ BA-001 Remaining: 1500 units ✅

Step 3: Allocate to Stages (JC-001)
├─ Design: 100 units (20%)
├─ Procurement: 150 units (30%)
├─ Printing: 200 units (40%)
├─ Total Allocated: 450 units
└─ JC-001 Remaining: 50 units ✅

Step 4: Create Job Card 2
├─ Select: BA-001
├─ Available: 1500 units
├─ Allocate: 1000 units (67%)
└─ BA-001 Remaining: 500 units ✅

Step 5: Allocate to Stages (JC-002)
├─ Design: 300 units (30%)
├─ Printing: 400 units (40%)
├─ Total Allocated: 700 units
└─ JC-002 Remaining: 300 units ✅

Final Status:
├─ Binding Advice: 2000 total, 1500 allocated, 500 remaining
├─ Job Card 1: 500 total, 450 allocated, 50 remaining
└─ Job Card 2: 1000 total, 700 allocated, 300 remaining
```

---

## ✅ Validation Rules

### Binding Advice → Job Card
- ✅ Quantity must be > 0
- ✅ Cannot exceed available balance
- ✅ Sum of all job card allocations ≤ total quantity

### Job Card → Production Stages
- ✅ Quantity must be > 0
- ✅ Cannot exceed job card quantity
- ✅ Sum of stage allocations ≤ job card quantity

### Production Stage
- ✅ Allocated quantity must be > 0
- ✅ Completed quantity ≤ allocated quantity

---

## 📁 File Structure

```
src/
├── types/
│   └── quantityManagement.ts          # Type definitions & helpers
├── components/
│   ├── QuantitySelector.tsx           # Quantity input component
│   ├── QuantityAllocationDisplay.tsx  # Allocation display
│   └── ApiStatusBanner.tsx            # API status indicator
├── components/forms/
│   └── JobCardForm.tsx                # Enhanced with quantity selector
├── pages/
│   ├── ProductionStageFlow.tsx        # Stage management with quantities
│   ├── ProductionStageDemo.tsx        # Demo page
│   └── ApiDiagnostics.tsx             # API testing page
└── services/
    └── api.ts                         # Updated interfaces
```

---

## 🐛 Troubleshooting

### Issue: Quantity not saving
**Solution:** Click "Save Progress" button after making changes

### Issue: Cannot allocate quantity
**Solution:** Check available balance - may be fully allocated

### Issue: Validation error
**Solution:** Ensure quantity is within available balance and > 0

### Issue: Data not loading
**Solution:** 
1. Check both servers are running
2. Visit `/api-diagnostics` page
3. See `TROUBLESHOOTING.md` for detailed steps

---

## 📚 Documentation

- **QUANTITY_MANAGEMENT_GUIDE.md** - Complete user guide with detailed examples
- **QUANTITY_MANAGEMENT_SUMMARY.md** - Quick reference summary
- **PRODUCTION_STAGE_WIZARD_README.md** - Stage wizard documentation
- **TROUBLESHOOTING.md** - General troubleshooting guide

---

## 🎯 Benefits

1. **Prevents Over-Allocation** - System validates at each level
2. **Real-Time Tracking** - Always know available balance
3. **Audit Trail** - Complete history of allocations
4. **User-Friendly** - Visual feedback and quick select options
5. **Data Integrity** - Consistent tracking across all levels
6. **Scalable** - Supports multiple job cards and stages

---

## 🔮 Future Enhancements

Potential improvements:
- [ ] Bulk quantity allocation
- [ ] Quantity adjustment history
- [ ] Export allocation reports
- [ ] Quantity forecasting
- [ ] Automated reallocation
- [ ] Quantity alerts and notifications

---

## 📝 Notes

- All quantities are stored as integers
- Calculations are performed in real-time
- Data is persisted to JSON Server (db.json)
- React Query handles caching and updates
- TypeScript ensures type safety

---

## 🆘 Support

### Quick Links
- **API Diagnostics:** http://localhost:5173/api-diagnostics
- **Demo Page:** http://localhost:5173/production-stage-demo
- **Troubleshooting:** See `TROUBLESHOOTING.md`

### Common Commands
```bash
# Start backend
npm run server

# Start frontend
npm run dev

# Start both (if configured)
npm run dev:full
```

---

**Implementation Date:** 2025-09-30
**Version:** 1.0.0
**Status:** ✅ Production Ready

**Developed for:** Madura ERP System
**Technology Stack:** React 18, TypeScript, Tailwind CSS, React Query, JSON Server

