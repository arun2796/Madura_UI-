# Production Stage Wizard - Implementation Guide

## 🎯 Overview

A step-wise dropdown navigation system for managing production stages in the Madura ERP system. This wizard provides an intuitive interface where only the current stage is visible, and previous stages are automatically hidden as you progress.

---

## ✨ Features Implemented

### 1. **Production Stage Wizard Component** (`src/components/ProductionStageWizard.tsx`)
- ✅ Step-wise navigation (only current stage visible)
- ✅ Progress bar with visual indicators
- ✅ Stage completion tracking
- ✅ Next/Previous navigation buttons
- ✅ Smooth transitions and animations
- ✅ Mobile-responsive design
- ✅ Configurable options (show/hide previous stages, allow back navigation)
- ✅ Dynamic stage loading from JSON/API data

### 2. **Production Stage Flow Page** (`src/pages/ProductionStageFlow.tsx`)
- ✅ Integrated with job card data
- ✅ Real-time progress saving
- ✅ Team assignment per stage
- ✅ Stage notes and documentation
- ✅ Job card details display
- ✅ API integration with React Query

### 3. **Production Stage Demo Page** (`src/pages/ProductionStageDemo.tsx`)
- ✅ Interactive demo with configuration options
- ✅ Real-time state visualization
- ✅ Feature showcase
- ✅ Testing playground

### 4. **API Diagnostics Tools**
- ✅ API connection test utility (`src/utils/testApiConnection.ts`)
- ✅ Diagnostics page (`src/pages/ApiDiagnostics.tsx`)
- ✅ API status banner (`src/components/ApiStatusBanner.tsx`)
- ✅ Enhanced error logging in API service

---

## 📋 Production Stages

The system supports 7 production stages:

1. **Design** - Design and planning phase
2. **Procurement** - Material procurement and preparation
3. **Printing** - Printing process
4. **Cutting & Binding** - Cutting and folding operations
5. **Gathering & Binding** - Gathering and binding process
6. **Quality** - Quality inspection and testing
7. **Packing** - Final packing and preparation

---

## 🚀 Usage

### Access the Production Stage Wizard

#### Option 1: From Job Cards Page
1. Navigate to **Job Cards** page
2. Click the **Workflow** icon (🔄) on any job card
3. You'll be taken to the stage management page for that job card

#### Option 2: Direct URL
```
http://localhost:5173/job-cards/{jobCardId}/stages
```

#### Option 3: Demo Page
```
http://localhost:5173/production-stage-demo
```

### Using the Wizard

1. **View Current Stage**: The wizard displays only the current production stage
2. **Navigate Forward**: Click "Next Stage" to move to the next step
3. **Navigate Backward**: Click "Previous" to go back (if enabled)
4. **Track Progress**: Visual progress bar shows completion percentage
5. **Assign Teams**: Select the team responsible for the current stage
6. **Add Notes**: Document stage-specific information
7. **Save Progress**: Click "Save Progress" to update the job card

---

## 🔧 Configuration Options

### Component Props

```typescript
<ProductionStageWizard
  stages={DEFAULT_PRODUCTION_STAGES}        // Array of stage definitions
  currentStage="designing"                   // Current active stage key
  onStageChange={(key) => {...}}            // Callback when stage changes
  onStageComplete={(key) => {...}}          // Callback when stage completes
  completedStages={["designing"]}           // Array of completed stage keys
  showOnlyCurrentStage={true}               // Hide previous stages
  allowBackNavigation={true}                // Enable previous button
  disabled={false}                          // Disable all interactions
  className=""                              // Additional CSS classes
/>
```

### Custom Stages

You can define custom stages:

```typescript
const customStages: ProductionStage[] = [
  {
    key: "custom_stage",
    label: "Custom Stage",
    color: "bg-blue-500",
    description: "Custom stage description"
  },
  // ... more stages
];
```

---

## 🔍 API Diagnostics

### Access Diagnostics Page
```
http://localhost:5173/api-diagnostics
```

### Features:
- ✅ Test all API endpoints
- ✅ Real-time connection monitoring
- ✅ Auto-refresh every 5 seconds (optional)
- ✅ Detailed error messages
- ✅ Troubleshooting tips
- ✅ Success/failure indicators

### API Status Banner
- Automatically appears on Dashboard when API is disconnected
- Shows error message and quick fix instructions
- Provides link to diagnostics page
- Auto-hides when connection is restored

---

## 🐛 Troubleshooting

### Empty Data Issue

If you're seeing empty data:

1. **Check JSON Server**
   ```bash
   npm run server
   ```
   Should show: "JSON Server started on PORT :3002"

2. **Verify .env Configuration**
   ```env
   VITE_API_BASE_URL=http://localhost:3002
   ```

3. **Restart Frontend** (after .env changes)
   ```bash
   npm run dev
   ```

4. **Use Diagnostics Page**
   - Navigate to `/api-diagnostics`
   - Check which endpoints are failing
   - Follow troubleshooting tips

5. **Check Browser Console**
   - Press F12
   - Look for red errors
   - Check Network tab for failed requests

### Detailed Troubleshooting
See `TROUBLESHOOTING.md` for comprehensive guide.

---

## 📁 File Structure

```
src/
├── components/
│   ├── ProductionStageWizard.tsx      # Main wizard component
│   └── ApiStatusBanner.tsx            # API connection status banner
├── pages/
│   ├── ProductionStageFlow.tsx        # Job card stage management
│   ├── ProductionStageDemo.tsx        # Interactive demo
│   ├── ApiDiagnostics.tsx             # API testing page
│   └── JobCards.tsx                   # Updated with wizard link
├── utils/
│   └── testApiConnection.ts           # API testing utility
└── services/
    └── api.ts                         # Enhanced with logging
```

---

## 🎨 Styling

The wizard uses Tailwind CSS with:
- Gradient backgrounds
- Smooth transitions
- Responsive grid layouts
- Color-coded stages
- Animated progress indicators

### Stage Colors:
- Design: Purple (`bg-purple-500`)
- Procurement: Blue (`bg-blue-500`)
- Printing: Yellow (`bg-yellow-500`)
- Cutting: Orange (`bg-orange-500`)
- Binding: Green (`bg-green-500`)
- Quality: Indigo (`bg-indigo-500`)
- Packing: Pink (`bg-pink-500`)

---

## 🔗 Routes Added

```typescript
// Production stage management for specific job card
/job-cards/:jobCardId/stages

// Interactive demo page
/production-stage-demo

// API diagnostics and testing
/api-diagnostics
```

---

## 📊 State Management

### Local State (Component Level)
- Current stage index
- Completed stages array
- Stage notes
- Assigned team
- Transition animations

### API State (React Query)
- Job card data
- Stage updates
- Progress tracking
- Auto-refetch on mutations

---

## 🚦 API Integration

### Endpoints Used:
- `GET /jobCards/:id` - Fetch job card details
- `PATCH /jobCards/:id` - Update job card progress
- `GET /bindingAdvices` - Test API connection

### Data Flow:
1. Load job card data from API
2. Display current stage in wizard
3. User navigates through stages
4. Save progress updates to API
5. Invalidate React Query cache
6. UI updates automatically

---

## 💡 Best Practices

1. **Always run both servers:**
   ```bash
   # Terminal 1
   npm run server
   
   # Terminal 2
   npm run dev
   ```

2. **Or use combined command:**
   ```bash
   npm run dev:full
   ```

3. **Check diagnostics first** when debugging data issues

4. **Use browser DevTools** to inspect API calls

5. **Monitor console logs** for detailed error messages

---

## 🎯 Future Enhancements

Potential improvements:
- [ ] Stage-specific forms and validations
- [ ] File attachments per stage
- [ ] Stage duration tracking
- [ ] Automated stage transitions
- [ ] Email notifications on stage completion
- [ ] Stage approval workflows
- [ ] Bulk stage updates
- [ ] Stage history timeline
- [ ] Export stage reports

---

## 📝 Testing

### Manual Testing Checklist:
- [ ] Navigate through all stages
- [ ] Test previous button
- [ ] Save progress at each stage
- [ ] Verify data persists after refresh
- [ ] Test on mobile devices
- [ ] Check API error handling
- [ ] Verify stage completion tracking
- [ ] Test with different job cards

### Browser Console Testing:
```javascript
// Test API connection
window.testApi()

// Check current API base URL
console.log(import.meta.env.VITE_API_BASE_URL)
```

---

## 🆘 Support

### Quick Links:
- **Diagnostics Page:** http://localhost:5173/api-diagnostics
- **Demo Page:** http://localhost:5173/production-stage-demo
- **Troubleshooting Guide:** `TROUBLESHOOTING.md`

### Common Issues:
1. Empty data → Check JSON server is running
2. API errors → Verify .env configuration
3. Stages not updating → Check browser console
4. Navigation not working → Verify job card ID is valid

---

## ✅ Implementation Checklist

- [x] Create ProductionStageWizard component
- [x] Create ProductionStageFlow page
- [x] Create ProductionStageDemo page
- [x] Add routes to App.tsx
- [x] Update JobCards page with wizard link
- [x] Create API diagnostics tools
- [x] Add API status banner
- [x] Enhance error logging
- [x] Create troubleshooting guide
- [x] Add documentation

---

**Last Updated:** 2025-09-30
**Version:** 1.0.0
**Status:** ✅ Production Ready

