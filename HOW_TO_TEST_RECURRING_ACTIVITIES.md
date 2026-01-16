# 🎯 How to Test Recurring Activities

## ✅ **Demo Page Created!**

I've created a complete demo page where you can test ALL Week 3-4 components!

---

## 🌐 **Access the Demo Page**

### **URL:**
```
http://localhost:5173/activity-demo
```

**Or manually navigate:**
1. Open your browser
2. Go to `http://localhost:5173`
3. In the address bar, add `/activity-demo` to the end
4. Press Enter

---

## 🎯 **What You Can Test:**

### **1. Recurring Activities Builder** 🔁

**How to Access:**
- Click the **"Recurring Activities"** tab (opens by default)
- Click the **"Open Recurring Builder"** button

**Features to Test:**
- ✅ **Frequency Selection**: Daily, Weekly, Monthly, Yearly
- ✅ **Interval**: Every 1, 2, 3... days/weeks/months
- ✅ **Weekly Pattern**: Select specific days (Sun-Sat)
- ✅ **Monthly Pattern**: Select day of month (1-31)
- ✅ **End Conditions**:
  - **Never**: Activity repeats forever
  - **On Date**: Pick an end date
  - **After X occurrences**: Stop after specific number
- ✅ **Live Summary**: See pattern description update in real-time

**Example Patterns to Try:**
1. **Every Monday & Wednesday**:
   - Frequency: Weekly
   - Interval: 1
   - Days: Mon, Wed
   - Ends: Never

2. **Every 2 weeks on Friday**:
   - Frequency: Weekly
   - Interval: 2
   - Days: Fri
   - Ends: After 10 occurrences

3. **Monthly on the 15th**:
   - Frequency: Monthly
   - Interval: 1
   - Day of Month: 15
   - Ends: On specific date

4. **Every 3 days**:
   - Frequency: Daily
   - Interval: 3
   - Ends: Never

**What Happens:**
- After you save, the pattern displays below the button
- Pattern is logged to browser console
- You can reopen to edit the pattern

---

### **2. Activity Type Selector** 🎨

**How to Access:**
- Click the **"Activity Types"** tab

**Features to Test:**
- All 9 activity types with color-coded icons:
  - 📞 Call (Blue)
  - 👥 Meeting (Purple)
  - ✅ To-Do (Green)
  - 📧 Email (Indigo)
  - 📅 Event (Orange)
  - 📄 Letter (Gray)
  - 🎥 Video Call (Cyan)
  - ☕ Lunch (Amber)
  - 💬 Chat (Pink)
- Click any type to select it
- Selected type shows below the grid

---

### **3. Calendar Views** 📅

**How to Access:**
- Click the **"Calendar Views"** tab
- Toggle between **Week View** and **Day View**

**Week View Features:**
- 7-day calendar
- 24-hour time slots
- 3 sample activities displayed
- Click on any time slot to create activity
- Click on existing activity to view details
- Navigate: Previous/Next Week, Today button

**Day View Features:**
- Single day with hourly breakdown
- Larger activity cards with details
- Location display
- Duration display
- Hover over empty slots to add activity
- Today highlighting

---

### **4. Activity Templates** 📋

**How to Access:**
- Click the **"Templates"** tab

**Features to Test:**
- 6 pre-configured templates
- Search functionality
- Click any template to apply it
- Templates include:
  - Follow-up Call (15 min)
  - Client Meeting (60 min)
  - Send Proposal (30 min)
  - Send Follow-up Email (10 min)
  - Quarterly Business Review (90 min)
  - Discovery Call (30 min)

---

## 💡 **Tips for Testing:**

### **Browser Console:**
- Open Developer Tools (F12)
- Go to Console tab
- You'll see logs when you:
  - Save recurring patterns
  - Select templates
  - Click activities
  - Click time slots

### **Mobile Testing:**
- Open on mobile device
- All components are responsive
- Touch interactions work

### **Integration:**
- All components can be copied to your actual pages
- Check `ActivityDemoPage.tsx` for usage examples
- All components export their types

---

## 📊 **Component Files:**

**Week 3-4 Components:**
1. `CRM.Web/src/components/ActivityTypeSelector.tsx`
2. `CRM.Web/src/components/RecurringActivityModal.tsx`
3. `CRM.Web/src/components/CalendarWeekView.tsx`
4. `CRM.Web/src/components/CalendarDayView.tsx`
5. `CRM.Web/src/components/ActivityTemplateSelector.tsx`

**Demo Page:**
- `CRM.Web/src/pages/ActivityDemoPage.tsx`

---

## 🐛 **Troubleshooting:**

### **Page Not Found?**
- Make sure frontend is running: `npm run dev`
- Check URL: `http://localhost:5173/activity-demo`

### **Modal Not Opening?**
- Check browser console for errors
- Make sure you clicked "Open Recurring Builder"

### **Calendar Empty?**
- Sample activities are for today's date
- Try switching between Week and Day views

---

## 🚀 **Quick Start:**

1. **Open browser**: `http://localhost:5173/activity-demo`
2. **Test Recurring**: Click "Open Recurring Builder"
3. **Set Pattern**: Choose Daily, Weekly, Monthly, or Yearly
4. **Save**: See the pattern displayed below
5. **Switch Tabs**: Test other components

---

**Everything is ready to test!** 🎉

The demo page provides a complete playground for all Week 3-4 features!
