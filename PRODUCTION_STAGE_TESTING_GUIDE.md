# 🧪 Production Stage Management Testing Guide

## Overview
This guide will help you test the new **Horizontal Production Stage Progress Tracker** and the complete controlled production workflow.

---

## ✅ What's New

### 1. **Horizontal Stage Progress Display**
- ✅ Stages now displayed horizontally (X-axis) instead of vertically
- ✅ Visual timeline with connecting lines showing progress
- ✅ Animated progress indicators
- ✅ Color-coded status badges
- ✅ Quantity tracking per stage
- ✅ Overall progress bar at the bottom

### 2. **Enhanced Visual Design**
- 🟢 **Green**: Completed stages
- 🔵 **Blue**: Current/In-progress stage
- ⚪ **Gray**: Pending/Locked stages
- 🟠 **Orange**: Remaining quantities

### 3. **Interactive Features**
- Click on completed stages to view details
- Hover effects on accessible stages
- Current stage highlighted with ring animation
- Real-time progress percentage updates

---

## 🚀 Testing Steps

### **Step 1: Start the Application**

1. **Ensure JSON Server is Running** (Port 3002)
   ```bash
   npx json-server --watch db.json --port 3002
   ```

2. **Start Development Server** (Port 5173 or 5174)
   ```bash
   npm run dev
   ```

3. **Open Browser**
   ```
   http://localhost:5173 or http://localhost:5174
   ```

---

### **Step 2: Navigate to Job Cards**

1. Click on **"Job Cards"** in the sidebar
2. You should see existing job cards with:
   - Client name
   - Quantity
   - Current stage
   - Progress percentage
   - Status

---

### **Step 3: Open Production Stage Management**

1. Find a job card (e.g., "Government School" - 2000 units)
2. Click the **Workflow icon** (⚙️) on the job card
3. You will be redirected to the **Production Stage Flow** page

---

### **Step 4: Test Horizontal Stage Progress Tracker**

#### **Visual Elements to Verify:**

1. **Stage Timeline (Horizontal)**
   - ✅ All 7 stages displayed in a row:
     - Design → Procurement → Printing → Cutting & Binding → Gathering & Binding → Quality → Packing
   - ✅ Circular nodes for each stage
   - ✅ Connecting lines between stages
   - ✅ Chevron arrows on connectors

2. **Stage Status Indicators**
   - ✅ Completed stages: Green circle with checkmark
   - ✅ Current stage: Blue circle with pulse animation + ring highlight
   - ✅ Pending stages: Gray circle with lock icon

3. **Quantity Display (Under Each Stage)**
   - ✅ Completed / Allocated (e.g., "450 / 500")
   - ✅ Remaining quantity in orange (e.g., "50 remaining")
   - ✅ Completion percentage (e.g., "90%")

4. **Status Badges**
   - ✅ "✓ Done" - Green badge for completed
   - ✅ "⟳ Active" - Blue badge for in-progress
   - ✅ "⏳ Pending" - Gray badge for pending

5. **Overall Progress Bar**
   - ✅ Shows total completion percentage
   - ✅ Gradient color (blue to green)
   - ✅ Updates as stages complete

6. **Summary Stats (Bottom Cards)**
   - ✅ **Completed**: Total completed quantity (green)
   - ✅ **In Progress**: Current stage quantity (blue)
   - ✅ **Remaining**: Remaining quantity (orange)

---

### **Step 5: Test Stage Progression**

#### **Test 1: View Current Stage Details**
1. The right panel shows current stage details
2. Verify you see:
   - Stage name (e.g., "Design")
   - Product-wise completion inputs
   - Team assignment dropdown
   - Stage notes textarea
   - Navigation buttons

#### **Test 2: Try to Go Backward (Should Be Disabled)**
1. Click the **"← Previous Stage"** button
2. ✅ **Expected**: Button is gray and disabled
3. ✅ **Expected**: Cursor shows "not-allowed"
4. ✅ **Expected**: Tooltip says "Backward navigation is disabled"

#### **Test 3: Try to Go Forward Without Completion**
1. If current stage is not 100% complete
2. Click the **"Next Stage →"** button
3. ✅ **Expected**: Button is gray and disabled
4. ✅ **Expected**: Cannot proceed to next stage

#### **Test 4: Complete Current Stage**
1. Enter completed quantities for each product
2. Make sure total equals allocated quantity (100%)
3. Click **"Save Progress"**
4. ✅ **Expected**: Success message appears
5. ✅ **Expected**: Stage status changes to "✓ Done"
6. ✅ **Expected**: Stage circle turns green
7. ✅ **Expected**: "Next Stage →" button becomes enabled (blue)

#### **Test 5: Move to Next Stage**
1. After completing 100%, click **"Next Stage →"**
2. ✅ **Expected**: Moves to next stage
3. ✅ **Expected**: Previous stage shows green with checkmark
4. ✅ **Expected**: Current stage shows blue with pulse
5. ✅ **Expected**: Connector line fills with color
6. ✅ **Expected**: Overall progress bar updates

#### **Test 6: Complete All Stages**
1. Repeat steps 4-5 for all 7 stages
2. ✅ **Expected**: All stages turn green
3. ✅ **Expected**: Overall progress shows 100%
4. ✅ **Expected**: Job card status updates to "completed"
5. ✅ **Expected**: `availableForDispatch` is set

---

### **Step 6: Test Dispatch Integration**

1. Go to **"Dispatch"** page
2. Click **"Create Dispatch Challan"**
3. ✅ **Expected**: Only fully completed job cards appear in dropdown
4. Select the completed job card
5. ✅ **Expected**: Shows available quantity (completed - already dispatched)
6. Create dispatch
7. ✅ **Expected**: Job card's `dispatchedQuantity` updates
8. ✅ **Expected**: Job card removed from dispatch list if fully dispatched

---

## 🎨 Visual Testing Checklist

### **Layout & Spacing**
- [ ] Horizontal timeline fits within screen width
- [ ] Stage nodes are evenly spaced
- [ ] Text is readable and not overlapping
- [ ] Connector lines align properly
- [ ] Summary cards at bottom are aligned

### **Colors & Styling**
- [ ] Green for completed stages (consistent shade)
- [ ] Blue for current stage (with pulse animation)
- [ ] Gray for pending stages (with lock icon)
- [ ] Orange for remaining quantities
- [ ] Gradient progress bar (blue to green)

### **Animations & Interactions**
- [ ] Current stage has pulse animation
- [ ] Current stage has ring highlight
- [ ] Hover effect on accessible stages
- [ ] Smooth transitions when moving stages
- [ ] Progress bar fills smoothly

### **Responsive Design**
- [ ] Works on desktop (1920x1080)
- [ ] Works on laptop (1366x768)
- [ ] Works on tablet (768px width)
- [ ] Stages stack or scroll on mobile

---

## 🐛 Common Issues & Solutions

### **Issue 1: Stages Not Showing**
**Solution**: Check if `stageProgressData` is initialized properly
```typescript
// In ProductionStageFlow.tsx
const [stageProgressData, setStageProgressData] = useState<StageProgress[]>([]);
```

### **Issue 2: Progress Not Updating**
**Solution**: Ensure `handleSaveProgress` updates `stageAllocations` in job card
```typescript
stageAllocations: stageProgressData.map((stage) => ({
  stageKey: stage.stageKey,
  completedQuantity: stage.completedQuantity,
  status: stage.status,
  canMoveNext: stage.canMoveNext,
}))
```

### **Issue 3: Next Button Always Disabled**
**Solution**: Check `canMoveToNextStage()` function
```typescript
const canMoveToNextStage = () => {
  const currentProgress = stageProgressData[currentStageIndex];
  return currentProgress?.canMoveNext || false;
};
```

### **Issue 4: Connector Lines Not Showing**
**Solution**: Check CSS classes for connector div
```typescript
<div className="h-1 bg-gray-200 rounded-full"></div>
<div className="absolute top-0 left-0 h-1 rounded-full bg-green-500" style={{ width: '100%' }}></div>
```

---

## 📊 Test Data

### **Sample Job Card for Testing**
```json
{
  "id": "d17c",
  "clientName": "Government School",
  "quantity": 2000,
  "productAllocations": [
    {
      "productId": "1",
      "productName": "CROWN IV LINE RULED",
      "allocatedQuantity": 1000,
      "completedQuantity": 0,
      "remainingQuantity": 1000
    },
    {
      "productId": "2",
      "productName": "CROWN PLAIN NOTEBOOK",
      "allocatedQuantity": 1000,
      "completedQuantity": 0,
      "remainingQuantity": 1000
    }
  ]
}
```

### **Expected Stage Allocations After Completion**
```json
{
  "stageAllocations": [
    {
      "stageKey": "designing",
      "stageName": "Design",
      "allocatedQuantity": 2000,
      "completedQuantity": 2000,
      "remainingQuantity": 0,
      "status": "completed",
      "canMoveNext": true
    },
    // ... repeat for all 7 stages
  ]
}
```

---

## ✅ Success Criteria

### **Functional Requirements**
- [x] All 7 stages displayed horizontally
- [x] Previous button permanently disabled
- [x] Next button enabled only at 100% completion
- [x] Stage status updates correctly
- [x] Quantities tracked accurately
- [x] Dispatch shows only completed job cards

### **Visual Requirements**
- [x] Clean horizontal timeline layout
- [x] Color-coded status indicators
- [x] Smooth animations
- [x] Responsive design
- [x] Clear typography

### **User Experience**
- [x] Intuitive navigation
- [x] Clear visual feedback
- [x] Helpful status messages
- [x] No confusing interactions
- [x] Fast performance

---

## 🎉 Next Steps After Testing

1. **If All Tests Pass:**
   - ✅ Mark testing task as complete
   - ✅ Document any edge cases found
   - ✅ Prepare for production deployment

2. **If Issues Found:**
   - 🐛 Document the issue with screenshots
   - 🐛 Note steps to reproduce
   - 🐛 Report to development team
   - 🐛 Retest after fixes

3. **Optional Enhancements:**
   - Add stage duration tracking
   - Add team performance metrics
   - Add stage-wise notes history
   - Add export/print functionality

---

## 📝 Test Report Template

```
Test Date: ___________
Tester Name: ___________
Browser: ___________
Screen Resolution: ___________

✅ PASSED TESTS:
- [ ] Horizontal stage display
- [ ] Stage progression
- [ ] Quantity tracking
- [ ] Dispatch integration
- [ ] Visual design
- [ ] Animations

❌ FAILED TESTS:
- Issue 1: ___________
- Issue 2: ___________

📸 SCREENSHOTS:
- Attach screenshots of any issues

💬 NOTES:
___________
```

---

**Last Updated:** 2025-09-30  
**Version:** 2.0.0  
**Status:** ✅ Ready for Testing

