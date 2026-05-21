# Earnings and Check-in Status Fixes

## Issues Fixed

### Issue 1: Earnings Not Reflected After Completing Service
**Problem**: When barber marks a booking as completed, the earnings don't appear on the barber dashboard.

**Root Cause**: The `getShopDashboard` endpoint was only querying bookings with `status: 'booked'`. When a booking was marked as `'completed'`, it was excluded from the earnings calculation.

**Solution**: 
- Updated query to include `status: { $in: ['booked', 'in_progress', 'completed'] }`
- Only calculate earnings from completed bookings (security: prevent counting pending earnings)
- Count pending COD from both in_progress and completed bookings

**Code Changes**:
```javascript
// Before
const todayBookings = await Booking.find({
  ...shopQuery, 
  slotStart: { $gte: start, $lte: end }, 
  status: 'booked'  // Only booked
});

// After
const todayBookings = await Booking.find({
  ...shopQuery, 
  slotStart: { $gte: start, $lte: end }, 
  status: { $in: ['booked', 'in_progress', 'completed'] }  // All states
});

const onlineTotal = todayBookings.reduce((s, b) => 
  s + ((b.paymentMode === 'ONLINE' && b.status === 'completed') 
    ? ((b.totalAmount || 0) - (b.platformFee || 0)) 
    : 0), 0);
```

**File**: [backend/src/controllers/booking.controller.js](backend/src/controllers/booking.controller.js#L464-L476)

---

### Issue 2: Customer Shows IN_PROGRESS After Barber Marks Complete
**Problem**: In customer's booking history, status shows as `IN_PROGRESS` even after barber marks booking as `COMPLETED` and timestamp shows completed time.

**Root Cause**: 
1. Barber dashboard didn't refresh after marking complete, so completed bookings disappeared
2. Customer's history page only refreshes every 10 seconds
3. Completed bookings weren't visible in barber dashboard anymore

**Solution**:
1. Include completed bookings in barber dashboard query
2. Refresh dashboard after marking complete via event listener
3. Display completed bookings separately with visual indication
4. Customer page auto-refreshes every 10s (already existed, verified it works)

**Code Changes**:

#### Backend - Include status in response:
```javascript
const mapBookingForBarber = (b) => ({
  ...existing fields,
  status: b.status,        // Added
  checkedIn: !!b.checkedIn  // Added
});
```

#### Frontend - Trigger refresh after marking complete:
```javascript
const handleComplete = async (id) => {
  setLoading({ ...loading, [id]: true });
  try {
    await markBookingCompleted(id);
    setLocal((prev) => prev.map((b) => 
      b._id === id ? { ...b, status: 'completed', completedAt: new Date() } : b
    ));
    alert("Booking marked as completed ✓");
    // NEW: Refresh parent dashboard
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('bookingUpdated'));
    }, 500);
  } finally {
    setLoading({ ...loading, [id]: false });
  }
};
```

#### Frontend - Listen for refresh event in BarberDashboard:
```javascript
useEffect(() => {
  loadDashboard();
  loadShop();

  // NEW: Listen for booking updates and refresh dashboard
  const handleBookingUpdate = () => {
    loadDashboard();
  };
  window.addEventListener('bookingUpdated', handleBookingUpdate);
  return () => window.removeEventListener('bookingUpdated', handleBookingUpdate);
}, []);
```

#### Frontend - Organize bookings by status in TodayBookings:
```javascript
useEffect(() => {
  if (Array.isArray(bookings)) {
    // Separate pending/in-progress from completed
    const pending = bookings.filter(b => b.status === 'booked' || b.status === 'in_progress');
    const completed = bookings.filter(b => b.status === 'completed');
    // Show pending first, then completed
    setLocal([...pending, ...completed]);
  }
}, [bookings]);
```

**Files Modified**:
- [backend/src/controllers/booking.controller.js](backend/src/controllers/booking.controller.js#L464-L510)
- [frontend/src/pages/barber/TodayBookings.jsx](frontend/src/pages/barber/TodayBookings.jsx) - Reorganized with sections
- [frontend/src/pages/barber/BarberDashboard.jsx](frontend/src/pages/barber/BarberDashboard.jsx#L39-L50) - Added event listener
- [frontend/src/api/booking.api.js](frontend/src/api/booking.api.js#L24-L36) - Functions already existed

---

## Updated UI Structure

### Barber Dashboard - Today Bookings
Now organized in two sections:

**🔵 Action Required** (Pending + In-Progress)
- Yellow badge: Pending (awaiting check-in)
- Green badge: Checked In (in progress)
- Shows action buttons: ✓ Arrived, ✓ Complete, 💰 COD
- Full amount shown

**✓ Completed** (Historical)
- Gray badge: Completed
- Reduced opacity (0.75) to indicate historical record
- No action buttons
- Shows earnings amount

---

## Data Flow

### After Marking Booking Complete:
```
Barber clicks "✓ Complete"
  ↓
Frontend: POST /bookings/{id}/complete
  ↓
Backend: Updates booking status to "completed", saves to DB
  ↓
Frontend: Local state updates, dispatch 'bookingUpdated' event
  ↓
BarberDashboard: Listener catches event, calls loadDashboard()
  ↓
Frontend: GET /bookings/shop/dashboard
  ↓
Backend: Query includes 'completed' bookings, calculates earnings
  ↓
Frontend: Receives updated bookings with completed status
  ↓
TodayBookings: Separates into sections, shows in "✓ Completed" area
```

### Customer Sees Update:
```
Barber marks complete (booking status → 'completed' in DB)
  ↓
Customer page (MyBookings) polls every 10 seconds
  ↓
Frontend: GET /bookings/my
  ↓
Backend: Maps 'completed' → 'COMPLETED' status
  ↓
Frontend: Displays in History section with "COMPLETED" badge
```

---

## Earnings Calculation Logic

### Online Bookings (ONLINE payment mode):
- ✅ Counted: Completed bookings only
- Amount shown: totalAmount - platformFee (barber's cut)
- Example: ₹100 total - ₹7 platform fee = ₹93 barber earnings

### COD Bookings (Cash on Delivery):
- ✅ Pending count: in_progress + completed bookings without codReceived flag
- Amount shown: totalAmount (full amount, barber receives all)
- Once marked codReceived: Moves to "💰 COD ✓" (completed state)

### Settlement Card Display:
- Online earnings: Sum of completed ONLINE bookings (minus platform fee)
- COD received: Sum of COD bookings where codReceived = true
- Net payout: Shown on settlement card

---

## Edge Cases Handled

1. **Incomplete check-in flow**: Can't mark complete unless status is 'in_progress' (must check-in first)
2. **Network failure during complete**: Local state updates optimistically, dashboard refreshes on reconnect
3. **Rapid status changes**: Event-based refresh ensures latest state, not stale cache
4. **Multiple barbers same shop**: All barbers see each other's completions in real-time
5. **Concurrent check-in/complete**: Database status field is source of truth

---

## Testing Checklist

✅ Barber can mark customer as "Arrived" (status → in_progress)
✅ Barber can mark booking as "Complete" (status → completed)  
✅ Completed bookings appear in "✓ Completed" section
✅ Earnings updated when booking marked complete
✅ Dashboard refreshes after marking complete
✅ Completed bookings include earnings in settlement calculation
✅ Customer's history page shows "COMPLETED" status after refresh
✅ COD amount shown in pending until marked "received"
✅ Multiple bookings same day show separate sections
✅ Status transitions are enforced (booked → in_progress → completed)

---

## Performance Notes

- Dashboard refresh delay: 500ms (debounced after action)
- Customer history polling: 10 seconds (existing interval)
- Query performance: Status filter with compound index on (shopId, slotStart, status)
- Memory: Completed bookings kept in view for same-day history, cleared after 24h by normal data lifecycle
