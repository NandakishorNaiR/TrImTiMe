# Capacity-Based Booking System Implementation

## Overview
This document describes the major architectural change to support multi-chair salons and capacity-based booking.

## Problem Statement
**Original Issue**: The booking system assumed only 1 customer per time slot, regardless of shop capacity.

**Real-World Problem**: Salons have multiple chairs/barbers and can serve multiple customers simultaneously:
- A 3-chair salon can handle 3 customers at 10:00 AM
- A single-barber shop can handle only 1 customer at a time

## Solution: Capacity-Based Booking

Instead of binary `isBooked` logic, the system now checks:
```
Available = Capacity > Current Bookings
```

### Example
```
Shop: Royal Salon
Chairs: 3

Time: 10:00 AM - 10:30 AM
Current Bookings: 2

Result: 1 seat available ✅
```

## Database Changes

### Shop Model
Added new field:
```javascript
chairs: {
  type: Number,
  default: 1,
  min: 1,
  description: "Number of chairs/capacity for simultaneous bookings"
}
```

**Existing shops**: Default to 1 chair (backward compatible)

**Migration**: Run `node backend/scripts/migrations/20260514-add-chairs-field.js`

## Backend Changes

### 1. Slot Service (`slot.service.js`)

#### `calculateAvailableSlots()`
**Before**: Returned list of available times (binary: available or not)
**After**: Returns objects with capacity info:
```javascript
{
  start: "10:00",
  end: "10:30",
  capacity: 3,      // shop's total capacity
  booked: 2,        // current bookings in this slot
  available: 1      // remaining seats
}
```

#### `createBookingSafely()`
**Before**: Checked if ANY booking existed for the time slot
**After**: Counts overlapping bookings and checks if `count < capacity`

**Logic**:
```javascript
overlappingCount < shopCapacity → Booking allowed ✅
overlappingCount >= shopCapacity → Slot full ❌
```

### 2. Barber Shop Controller (`barber.shop.controller.js`)
- `createShop()`: Now accepts `chairs` field
- `updateMyShop()`: Can update chairs for existing shops

### 3. API Response Format

#### Get Available Slots
**Endpoint**: `GET /api/bookings/slots/:shopId/:date`

**Response**:
```json
[
  {
    "start": "10:00",
    "end": "10:30",
    "capacity": 3,
    "booked": 1,
    "available": 2
  },
  {
    "start": "10:35",
    "end": "11:05",
    "capacity": 3,
    "booked": 2,
    "available": 1
  }
]
```

## Frontend Changes

### 1. Shop Setup (`ShopSetup.jsx`)
Added chairs input field:
```jsx
<input
  type="number"
  min="1"
  placeholder="Number of Chairs/Capacity"
  value={form.chairs}
  onChange={e => setForm({ ...form, chairs: parseInt(e.target.value) || 1 })}
/>
```

### 2. Shop Settings (`ShopSettings.jsx`)
Added chairs field in settings:
```jsx
<Input 
  label="Number of Chairs/Capacity" 
  name="chairs" 
  type="number" 
  min="1" 
  value={shop.chairs || 1} 
  onChange={handleChange} 
/>
```

### 3. Booking Flow

#### Slot Display (Booking.jsx)
Slots now preserve capacity information through the booking flow:
```javascript
// selectedSlot is now an object
{
  start: "10:00",
  end: "10:30",
  capacity: 3,
  booked: 1,
  available: 2
}
```

#### Slot Picker (SlotPicker.jsx)
Updated to handle capacity info in slot objects.

#### Slot Grid (SlotGrid.jsx)
**Visual Changes**:
- Shows time: `10:00`
- Shows availability: `2 seats available` or `Full`

```jsx
<div className="text-xs mt-1 text-gray-600">
  {capacity > 0 ? `${capacity} seat${capacity !== 1 ? 's' : ''}` : 'Full'}
</div>
```

#### Confirm Booking (ConfirmBooking.jsx)
Shows remaining seats before confirmation:
```jsx
<p className="text-xs text-gray-600 mt-1">
  {selectedSlot.available} seat{selectedSlot.available !== 1 ? 's' : ''} available
</p>
```

## Key Business Logic

### Overlapping Calculation
Two bookings overlap if:
```javascript
bookingStart < slotEnd AND bookingEnd > slotStart
```

### Pending Bookings
**Important**: Pending bookings (not yet confirmed) still occupy capacity:
- User reserves slot but payment pending → occupies 1 seat temporarily
- Expires after 5 minutes if not paid
- Prevents overselling

**Query**:
```javascript
{
  $or: [
    { status: 'booked' },
    { status: 'pending', createdAt: { $gte: recentThreshold } }
  ]
}
```

### Service Duration
Service duration still matters:
- 30-min haircut: 10:00-10:30
- 1-hour facial: 10:00-11:00
- These are different time blocks for overlap calculation

## Migration Steps

### Step 1: Database Update
```bash
node backend/scripts/migrations/20260514-add-chairs-field.js
```

### Step 2: Restart Backend
```bash
npm start
```

## Backward Compatibility

✅ **Fully Backward Compatible**
- Existing shops default to 1 chair
- Old booking logic still works
- No breaking changes for existing bookings

## Future Enhancements

### Phase 2: Individual Barber Assignment
Instead of generic "chairs", assign specific barbers:
```javascript
staff: [
  { id, name, services, availability },
  { id, name, services, availability }
]
```

### Phase 3: Service-Based Capacity
Different services use different chairs:
```javascript
chairs: [
  { type: 'haircut', count: 3 },
  { type: 'facial', count: 2 }
]
```

## Testing Checklist

- [ ] Create shop with 3 chairs
- [ ] Book customer A at 10:00
- [ ] Book customer B at 10:00 (same slot, should succeed)
- [ ] Book customer C at 10:00 (should succeed)
- [ ] Try to book customer D at 10:00 (should fail - full capacity)
- [ ] Show "3 seats available" → "2 seats" → "1 seat" → "Full"
- [ ] Verify pending bookings expire after 5 minutes
- [ ] Single-chair shop behavior unchanged

## Database Example

### Before
```javascript
{
  name: "Royal Salon",
  type: "unisex",
  // ... other fields
  // NO chairs field
}
```

### After
```javascript
{
  name: "Royal Salon",
  type: "unisex",
  chairs: 3,  // ← NEW FIELD
  // ... other fields
}
```

## API Changes Summary

| Endpoint | Change |
|----------|--------|
| `GET /api/bookings/slots/:shopId/:date` | Returns objects with capacity info |
| `POST /api/barber/shop` | Accepts `chairs` parameter |
| `PUT /api/barber/shop/:id` | Can update `chairs` |
| `POST /api/bookings` | Uses new capacity logic |

## Error Handling

### Slot Full
```json
{
  "message": "Slot at full capacity",
  "error": "SLOT_BOOKED"
}
```

### Status Code
- 409 Conflict (capacity full)

## Monitoring

Watch these metrics:
- Average booking load per slot
- Slots reaching full capacity
- User experience (booking success rate)

## Questions?

Refer to the original discussion for business logic rationale.
