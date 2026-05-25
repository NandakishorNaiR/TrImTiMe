# 🚀 SECURITY FIXES - DEPLOYMENT & MIGRATION GUIDE

## Quick Summary of Changes

This update fixes a **CRITICAL security issue** where users could share authentication tokens across devices.

### What was wrong?
- User A logs in from Laptop → gets Token X
- User A shares Vercel link with User B
- User B opens link → gets redirected to User A's dashboard (SECURITY BREACH!)

### What's fixed?
- Each device gets a unique session ID
- Tokens are tied to device fingerprints (User-Agent + IP)
- Backend validates device session on every request
- Sharing a link no longer grants access to dashboard

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### Backend Setup

1. **Generate Strong JWT Secret**
   ```bash
   # Run this command once and save the output
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   # Output example: 3a7f9e2c1b8d4a6f9e2c1b8d4a6f9e2c1b8d4a6f9e2c1b8d4a6f9e2c1b8d4a
   ```

2. **Update Production Backend .env**
   ```bash
   # Set these in your Render backend environment variables:
   JWT_SECRET=<paste_the_generated_secret_here>
   NODE_ENV=production
   FRONTEND_ORIGIN=https://your-vercel-frontend-url.vercel.app
   # Keep other vars the same (MONGO_URI, etc.)
   ```

3. **Push to Render**
   ```bash
   git add .
   git commit -m "Security: Device-specific sessions, IDOR protection, Helmet headers"
   git push
   ```

### Frontend Setup

1. **Ensure .env is correct**
   ```bash
   # In frontend/.env
   VITE_API_BASE=https://trimtime-backend-sl7o.onrender.com/api
   # (or your actual Render backend URL)
   ```

2. **Push to Vercel**
   ```bash
   git add .
   git commit -m "Security: Session validation on app load, device-specific auth"
   git push
   ```

### Database

- New models created:
  - `Session` - Stores per-device sessions
  - `LoginAttempt` - Tracks failed login attempts

- These collections are created automatically when backend starts

---

## 🧪 POST-DEPLOYMENT TESTING

### Test 1: Single Device Login ✅
```
1. Go to app on Laptop
2. Login with your account
3. Verify dashboard loads
```

### Test 2: Device Isolation (THIS IS THE MAIN FIX) ✅
```
1. Laptop: Login with Account A
2. Laptop: Copy the browser URL (includes your token in app state)
3. Phone: Open that same URL in a different browser
4. EXPECTED: App shows "Verifying Session..." then redirects to Login
5. Phone: Login with Account B
6. EXPECTED: Dashboard loads for Account B
7. VERIFY: Laptop still shows Account A, Phone shows Account B
   (They don't interfere!)
```

### Test 3: Logout Works ✅
```
1. Laptop: Login
2. Laptop: Find the Logout button in navbar
3. Click Logout
4. EXPECTED: Redirected to login page
5. EXPECTED: Token cleared from localStorage
6. Try refreshing page - should still be on login
```

### Test 4: Brute Force Protection ✅
```
1. Try to login 5 times with a WRONG phone number
2. On 6th attempt: Should see message
   "Too many login attempts. Please try again in X minutes"
3. Wait 15 minutes, try again - should work
```

### Test 5: Session Expiry ✅
```
This is harder to test in 7 days, but:
1. Manually set JWT_SECRET to a different value
2. All existing tokens become invalid
3. Users are forced to login again
```

---

## 🔧 CONFIGURATION OPTIONS

### Session Duration
In `backend/.env`:
```
SESSION_EXPIRY_DAYS=7
# Change to 30 for 30 days, etc.
```

### Brute Force Limits
In `backend/src/utils/auth.utils.js` (line ~69):
```javascript
const checkLoginAttempts = async (phone, ipAddress, 
  maxAttempts = 5,           // Change this to 3 for stricter
  lockoutDurationMinutes = 15 // Change to 30 for longer lockout
)
```

### Rate Limiting
In `backend/src/middlewares/rateLimit.middleware.js`:
- Adjust `authLimiter` for login endpoints
- Adjust `bookingLimiter` for booking endpoints
- Adjust `globalLimiter` for all endpoints

---

## 🐛 TROUBLESHOOTING

### Issue: "Invalid session. Please login again." on every page
**Cause:** Device fingerprint changed (IP changed, different WiFi, etc.)
**Fix:** User just needs to login again. This is expected behavior.

### Issue: CORS errors after deployment
**Cause:** Frontend URL not in `FRONTEND_ORIGIN` env var
**Fix:** Update backend `FRONTEND_ORIGIN` to match Vercel frontend URL

### Issue: "Too many login attempts" immediately after deployment
**Cause:** Old failed attempts recorded, accumulated lockout
**Fix:** Wait 15 minutes or clear `LoginAttempt` collection

### Issue: Backend throws "Cannot find module Session.model"
**Cause:** New models not imported
**Fix:** Restart backend (push again or manual restart on Render)

---

## 📊 MONITORING CHECKLIST

After deployment, monitor these in your backend logs:

1. **Check for failed logins**
   ```
   Look for: "login error" or "Invalid token" 
   Normal: A few on day 1 as users re-login
   Abnormal: 100+ attempts from same IP
   ```

2. **Session validation errors**
   ```
   Look for: "Invalid session"
   Normal: A few per day (IP changes, etc.)
   Abnormal: Same user getting this repeatedly
   ```

3. **Rate limit hits**
   ```
   Look for: 429 Too Many Requests
   Normal: Expected from brute force attempts
   Abnormal: Legitimate users hitting limits
   ```

4. **JWT expiry errors**
   ```
   Look for: "Token expired"
   Normal: After 7 days of inactivity
   Abnormal: Never - means JWT_EXPIRES_IN is wrong
   ```

---

## 🔄 ROLLBACK PLAN (If Something Goes Wrong)

If you need to rollback to previous version:

1. Revert backend to previous Git commit
2. Keep new `Session` and `LoginAttempt` collections (won't hurt)
3. Users can still use old tokens (no validation)
4. You'll be back to the security vulnerability, but app will work

---

## 📞 SUPPORT / DEBUGGING

### Enable Debug Logging
In `backend/src/app.js`, add:
```javascript
if (process.env.DEBUG === 'true') {
  app.use((req, res, next) => {
    console.log('REQUEST:', req.method, req.path, 
      'User:', req.user?.id, 'Device:', req.user?.deviceFingerprint);
    next();
  });
}
```

Then set `DEBUG=true` in .env

### Manual Session Clear (if needed)
If user is locked out or sessions are corrupt:

**MongoDB:**
```javascript
// In MongoDB Atlas console
db.sessions.deleteMany({ userId: ObjectId("user_id_here") })
```

This forces user to login again.

---

## ✅ SECURITY VERIFICATION

After deployment, verify these headers are sent:

```bash
curl -I https://your-backend-url.com/api/auth/me

# Look for these headers:
# Strict-Transport-Security: max-age=31536000
# X-Frame-Options: deny
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block
```

---

## 🎯 SUMMARY OF SECURITY IMPROVEMENTS

✅ **Device-Specific Sessions** - Users can't share tokens
✅ **Session Validation** - Every request checked
✅ **Brute Force Protection** - Account lockout after 5 failed attempts
✅ **Security Headers** - Helmet CSP, HSTS, clickjacking protection
✅ **Proper Logout** - Clear sessions, invalidate tokens
✅ **Token Expiry** - 7-day session expiration
✅ **Frontend Validation** - Token verified on app load
✅ **IDOR Prevention** - Session-based isolation

---

## 📅 NEXT STEPS (90 days)

1. **Month 1:** Monitor for issues, collect user feedback
2. **Month 2:** Implement refresh tokens (optional, advanced)
3. **Month 3:** Rotate JWT_SECRET for extra security

---

**Ready to deploy? Here's the command:**

```bash
# From backend directory
git add .
git commit -m "Security: Device sessions, IDOR protection, Helmet CSP"
git push

# From frontend directory  
git add .
git commit -m "Security: Session validation, device-specific auth"
git push
```

Done! 🎉
