# IDOR (Insecure Direct Object Reference) Protection Implementation

## What is IDOR?
IDOR is when a user can access resources belonging to other users by manipulating IDs in requests.

Example:
```
❌ BAD: GET /api/bookings/123 (might return any booking if not checking ownership)
✅ GOOD: GET /api/bookings/123 (checks if requesting user owns booking 123)
```

## Protected Endpoints - Verification Checklist

### CUSTOMER ENDPOINTS (Booking Related)
- [x] `GET /api/bookings/my` - Gets only user's own bookings (filtered by userId)
- [x] `POST /api/bookings/:id/cancel` - Validates booking.userId === req.user.id
- [x] `POST /api/bookings/:id/confirm` - Validates booking.userId === req.user.id
- [x] `PUT /api/auth/profile` - Updates only own profile

### BARBER ENDPOINTS (Shop Related)
- [x] `GET /api/barber/shop/today` - Validates barber.shopId === req.user.shopId
- [x] `POST /api/bookings/:id/complete` - Validates booking.shopId === req.user.shopId
- [x] `POST /api/bookings/:id/checkin` - Validates booking.shopId === req.user.shopId
- [x] `POST /api/bookings/:id/mark-paid` - Validates booking.shopId === req.user.shopId

### ENDPOINTS NEEDING REVIEW
- [ ] Notification endpoints - must check ownership
- [ ] Profile endpoints - must check user ID matches
- [ ] Payment endpoints - must validate user ownership

## Implementation Pattern

### CORRECT WAY - Check Ownership
```javascript
// CORRECT: Validates user owns the resource
exports.getUserNotification = async (req, res) => {
    const notificationId = req.params.id;
    const userId = req.user.id;
    
    // Always check ownership
    const notification = await Notification.findOne({
        _id: notificationId,
        user: userId  // ✅ OWNERSHIP CHECK
    });
    
    if (!notification) {
        return res.status(404).json({ message: 'Not found' });
    }
    
    return res.json(notification);
};
```

### WRONG WAY - No Ownership Check
```javascript
// ❌ WRONG: Doesn't validate ownership - IDOR VULNERABILITY
exports.getUserNotification = async (req, res) => {
    const notificationId = req.params.id;
    
    // Fetches ANY notification by ID, regardless of ownership
    const notification = await Notification.findById(notificationId);
    
    return res.json(notification);
};
```

## Endpoints to Audit by Controller

### auth.controller.js ✅
- updateProfile - validates req.user.id
- getPreference - not implemented yet
- ✅ SECURE

### notification.controller.js
- getNotifications - should filter by req.user.id
- Status: NEEDS AUDIT

### payment.controller.js
- getPayment - should validate user ownership
- Status: NEEDS AUDIT

### admin.controller.js
- Various admin endpoints should validate role === ADMIN
- Status: NEEDS AUDIT

## Quick Audit Command
Search for all `findById` calls that should have ownership checks:
```bash
grep -n "findById" backend/src/controllers/*.js
# Then verify each has corresponding ownership validation
```

## Testing IDOR Vulnerabilities

To test if IDOR is fixed:

1. Login as USER A
2. Get a booking ID from USER A's bookings
3. Try to access: `GET /api/bookings/that-id`
   - Should succeed ✅
4. Login as USER B
5. Try to access the same booking: `GET /api/bookings/that-id`
   - Should fail with 403/404 ✅

## Recent Fixes (Session-Based IDOR Prevention)

The device fingerprinting + session validation now prevents:
- Token sharing across devices
- Reusing old tokens after logout
- Cross-device session hijacking

This significantly reduces IDOR risk by ensuring:
1. Each device has a unique session
2. Sessions are validated on every request
3. Logout invalidates the session
