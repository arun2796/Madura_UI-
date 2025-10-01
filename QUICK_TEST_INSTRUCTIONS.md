# 🚀 QUICK TEST - Batch Production Workflow

## ⚡ **IMMEDIATE ACTION REQUIRED**

### **Step 1: Open Browser Console**
```
1. Press F12 to open Developer Tools
2. Click on "Console" tab
3. Keep it open while testing
```

### **Step 2: Refresh the Page**
```
1. Go to: http://localhost:5174/job-cards/fbb7/stages
2. Press Ctrl+R to refresh
3. Look at console logs
```

### **Step 3: Check Console Output**
You should see:
```
Loaded batches: [...]
Selected batch ID: batch_002 (or similar)
Selected batch: {...}
Syncing batch: 2 Stage: 0
```

### **Step 4: What You Should See on Screen**

#### **Purple Section (Top)**
```
🔷 Production Batches

[Batch #1]          [Batch #2]
Completed           Active
Range: 1-125        Range: 126-250
Quantity: 125       Quantity: 125
Stage: Completed    Stage: Design
```

**IMPORTANT**: 
- ✅ Batch #1 should show "Completed" badge (green)
- ✅ Batch #2 should show "Active" badge (blue)
- ✅ Batch #2 should be selected (white background)

#### **Batch Completion Section (Below)**
```
📦 Complete Design Stage for Batch #2

Batch Range: 126-250
Total Quantity: 125 units
Product: CROWN IV LINE RULED
Current Stage: Design

Completed Quantity for Design
[Input: 0] (0-125)

Completion Progress: 0 / 125 (0%)
[Progress Bar: Empty]

⚠️ Complete all units to proceed
   Remaining: 125 units

[Complete Design & Move to Next Stage] (Disabled - Gray)
```

---

## 🧪 **TEST SCENARIO**

### **Test 1: Enter Partial Quantity**
```
1. Click on the quantity input field
2. Type: 50
3. Press Tab or click outside
```

**Expected Result**:
- ✅ Progress bar: 40% (50/125) - Purple color
- ✅ Text: "0 / 125 (40%)"
- ✅ Warning: "Remaining: 75 units"
- ✅ Button: Still disabled (gray)

---

### **Test 2: Enter 100% Quantity**
```
1. Clear the input field (Ctrl+A, Delete)
2. Type: 125
3. Press Tab or click outside
```

**Expected Result**:
- ✅ Progress bar: 100% - GREEN color
- ✅ Text: "125 / 125 (100%)"
- ✅ Success message: "✅ Stage 100% Complete!"
- ✅ Button: ENABLED (green background)

---

### **Test 3: Move to Next Stage**
```
1. Click "Complete Design & Move to Next Stage" button
2. Wait for alert
```

**Expected Result**:
- ✅ Alert: "Moved to next stage successfully!"
- ✅ Current Stage changes to: "Procurement"
- ✅ Stage indicator: "Stage 2 of 7"
- ✅ Quantity input resets to: 0
- ✅ Progress bar resets to: 0%
- ✅ Button becomes disabled again (gray)

---

### **Test 4: Complete All Stages**
```
Repeat Test 2 & 3 for each stage:
1. Procurement (Stage 2)
2. Printing (Stage 3)
3. Cutting & Binding (Stage 4)
4. Gathering & Binding (Stage 5)
5. Quality (Stage 6)
6. Packing (Stage 7)
```

**After Stage 7 (Packing)**:
- ✅ Alert: "Batch completed! Inventory updated."
- ✅ Batch #2 card shows: "Completed" badge (green)
- ✅ Batch status changes to: "completed"

---

## 🐛 **IF SOMETHING IS WRONG**

### **Issue 1: Shows "Packing" Stage Instead of "Design"**
**Reason**: Batch #1 is already completed, showing Batch #1 data instead of Batch #2

**Solution**:
```
1. Look at the purple section
2. Click on "Batch #2" card
3. Verify Batch #2 is selected (white background)
4. Check if current stage changes to "Design"
```

### **Issue 2: No Batches Showing**
**Reason**: Batches not loaded from database

**Solution**:
```
1. Check console for errors
2. Verify JSON server is running: http://localhost:3002
3. Test API: http://localhost:3002/productionBatches
4. Should see 3 batches with jobCardId: "fbb7"
```

### **Issue 3: Button Not Enabling at 100%**
**Reason**: Quantity doesn't match exactly

**Solution**:
```
1. Clear input completely
2. Type exactly: 125
3. Make sure no spaces or extra characters
4. Check console for errors
```

### **Issue 4: Data Not Updating**
**Reason**: API call failing

**Solution**:
```
1. Open Network tab (F12 → Network)
2. Click "Complete & Move to Next Stage"
3. Look for PATCH request to /productionBatches/batch_002
4. Check if request succeeds (Status: 200)
5. Check response data
```

---

## 📊 **CONSOLE DEBUGGING**

### **What to Look For in Console**:

#### **On Page Load**:
```
Loaded batches: Array(3)
  0: {id: "batch_001", status: "completed", currentStageIndex: 6, ...}
  1: {id: "batch_002", status: "active", currentStageIndex: 0, ...}
  2: {id: "a17b", status: "active", currentStageIndex: 0, ...}

Selected batch ID: batch_002
Selected batch: {id: "batch_002", batchNumber: 2, quantity: 125, ...}
Syncing batch: 2 Stage: 0
```

#### **When Clicking "Complete & Move to Next Stage"**:
```
(No errors should appear)
```

#### **If Errors Appear**:
```
❌ TypeError: Cannot read property 'quantity' of undefined
   → Batch not selected properly

❌ Network Error: Failed to fetch
   → JSON server not running

❌ 404 Not Found
   → Batch ID incorrect or doesn't exist
```

---

## ✅ **SUCCESS CHECKLIST**

After testing, verify:
- [ ] Batch #2 is selected (white background)
- [ ] Current stage shows "Design" (not "Packing")
- [ ] Quantity input accepts values 0-125
- [ ] Progress bar updates in real-time
- [ ] Button enables at 100% completion
- [ ] Can move to next stage successfully
- [ ] Stage progresses: Design → Procurement → ... → Packing
- [ ] After Packing, batch marked as "Completed"
- [ ] Console shows no errors

---

## 🎯 **EXPECTED FINAL STATE**

After completing all tests:
```
Batch #1: ✅ Completed (was already completed)
Batch #2: ✅ Completed (just completed by you)
Batch #3 (a17b): 🔵 Active (not tested yet)
```

---

## 📞 **REPORT RESULTS**

After testing, report:
1. ✅ What worked correctly
2. ❌ What didn't work
3. 📋 Console errors (if any)
4. 📸 Screenshots (if needed)

---

**Last Updated**: 2025-09-30 02:45 AM  
**Status**: ⏳ **READY TO TEST NOW!**

