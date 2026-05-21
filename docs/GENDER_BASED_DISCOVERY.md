# Gender-Based Shop Discovery System

## Overview
**Problem**: App showed ALL shops to ALL users regardless of their needs:
- Female customers saw male barber shops ❌
- Male customers saw female salons ❌
- No distinction between different shop types ❌

**Solution**: Gender-based filtering that personalizes salon discovery while supporting unisex salons:
- ✅ Female customers see: Female salons + Unisex
- ✅ Male customers see: Male barber shops + Unisex
- ✅ Unisex shops visible to everyone
- ✅ Professional, culturally appropriate experience

## Architecture

### 1. Database Changes

#### User Model
```javascript
genderPreference: {
  type: String,
  enum: ["MALE", "FEMALE"],
  default: null
}
```

#### Shop Model
```javascript
type: {
  type: String,
  enum: ["MALE", "FEMALE", "UNISEX"],
  default: "UNISEX",
  description: "Shop type: MALE (barber shops), FEMALE (salons), UNISEX (mixed services)"
}
```

### 2. Backend Implementation

#### Filter Logic
**GET /shops**
```javascript
// Authenticated user with preference
User gender = MALE → Show: MALE + UNISEX shops
User gender = FEMALE → Show: FEMALE + UNISEX shops

// Not authenticated
Show: UNISEX shops only (optional: show all)
```

#### New Endpoint
```
PATCH /auth/update-preference
```

**Request Body**:
```json
{
  "genderPreference": "MALE"  // or "FEMALE"
}
```

**Response**:
```json
{
  "message": "Preference updated successfully",
  "genderPreference": "MALE"
}
```

### 3. Frontend Implementation

#### Components Created
- **GenderPreferenceModal.jsx**: Modal shown to customers after login
  - Three button options: Male, Female, Unisex
  - Updates user preference via API
  - Refreshes page to show filtered shops

#### Shop Discovery Flow
1. Customer logs in
2. GenderPreferenceModal appears (if no preference set)
3. Chooses preference: 👨 Male / 👩 Female / 👥 Unisex
4. API updates preference
5. Page refreshes → shows filtered shops
6. Shop cards display type badge

#### Components Updated
- **ShopCard.jsx**: Added shop type badge
  - 👨 Male → Blue badge
  - 👩 Female → Pink badge
  - 👥 Unisex → Purple badge
- **Home.jsx**: Integrated GenderPreferenceModal
- **ShopSetup.jsx**: Barber selects shop type during setup
- **ShopSettings.jsx**: Barber can change shop type later

## User Flows

### Customer: Discover Shops (First Time)

1. Customer logs in
2. Modal appears: "Choose Your Preference"
3. Options:
   - 👨 Male Barber Shops (blue)
   - 👩 Female Salons (pink)
   - 👥 See All - Unisex (purple)
4. Click selection
5. API updates preference
6. Page refreshes → shows filtered shops
7. Each shop card shows type badge
   - "👨 Male" (blue)
   - "👩 Female" (pink)
   - "👥 Unisex" (purple)

### Barber: Create Shop

1. Barber completes signup
2. Goes to Shop Setup
3. Selects shop type: MALE, FEMALE, or UNISEX
4. Creates shop
5. Shop appears in customer searches based on type

### Barber: Update Shop Type

1. Barber opens Shop Settings
2. Updates "Shop Type" dropdown
3. Saves changes
4. Immediately affects customer visibility

## Business Impact

### Before Gender-Based Discovery
- ❌ Female customer saw men's barber shops
- ❌ Male customer saw women's salons
- ❌ Confusing, irrelevant results
- ❌ Poor UX for salon industry
- ❌ Lower conversion rates

### After Gender-Based Discovery
- ✅ Relevant salons shown based on preference
- ✅ Professional, culturally appropriate
- ✅ Unisex salons visible to everyone
- ✅ Clean, personalized experience
- ✅ Higher engagement
- ✅ Industry-standard UX

## Real-World Scenarios

### Scenario 1: Female Customer Discovery
```
User: Priya (Female customer)
Login → Modal shows
Choice: "👩 Female Salons"
Results: Female salons + Unisex shops
Does NOT see: Male barber shops
Experience: Relevant, personalized
```

### Scenario 2: Male Customer Discovery
```
User: Rahul (Male customer)
Login → Modal shows
Choice: "👨 Male Barber Shops"
Results: Male barber shops + Unisex shops
Does NOT see: Female salons
Experience: Relevant, professional
```

### Scenario 3: Unisex Shop Strategy
```
Shop: "Hair & Groom Salon" (Unisex)
Services: Men's cuts, Women's cuts, Facials
Visibility: ALL customers (regardless of preference)
Strategy: Capture all customer types
```

### Scenario 4: Shop Type Update
```
Shop: "John's Barber" (initially MALE)
Problem: Many female customers inquire
Solution: Change to UNISEX in settings
Result: Now visible to female customers too
```

## Migration Strategy

### Existing Shops
Created migration: `20260514-normalize-shop-types.js`
- Converts: "men" → "MALE", "ladies" → "FEMALE", "unisex" → "UNISEX"
- Run with: `node scripts/migrations/20260514-normalize-shop-types.js --apply`

### Existing Users
- `genderPreference` defaults to `null`
- Modal shows on first login after update
- Users can skip or update anytime

## API Summary

### New Endpoints
```
PATCH /auth/update-preference
  - Update user's gender preference
  - Requires auth
  - Body: { genderPreference: "MALE"|"FEMALE"|"UNISEX" }
```

### Updated Endpoints
```
GET /shops
  - NEW: Filters based on user.genderPreference
  - Unauth users see: UNISEX shops only
  - MALE preference sees: MALE + UNISEX
  - FEMALE preference sees: FEMALE + UNISEX
```

## Frontend Components

### New
- `GenderPreferenceModal.jsx` - Modal for preference selection

### Updated
- `ShopCard.jsx` - Shows shop type badge
- `Home.jsx` - Integrates modal, shows filtered shops
- `ShopSetup.jsx` - Barber selects shop type
- `ShopSettings.jsx` - Barber can update shop type

## Database Changes

### Migrations Needed
1. Add `genderPreference` field to User (default: null)
2. Update Shop `type` enum values to uppercase
3. Create migration to convert existing type values

### Schema Updates
```javascript
// User.model.js
genderPreference: { type: String, enum: ["MALE", "FEMALE"], default: null }

// Shop.model.js
type: { type: String, enum: ["MALE", "FEMALE", "UNISEX"], default: "UNISEX" }
```

## Implementation Checklist

✅ User model: Added genderPreference field  
✅ Shop model: Updated type enum to uppercase  
✅ Backend routes: Filter shops by user preference  
✅ Auth endpoint: PATCH /update-preference  
✅ GenderPreferenceModal component  
✅ Home page: Integrated modal  
✅ ShopCard: Added type badge display  
✅ ShopSetup: Shop type selector  
✅ ShopSettings: Shop type can be updated  
✅ Migration script: Normalize existing types  

## Testing Scenarios

### Test 1: Customer Preference Selection
1. Create new customer account
2. Login
3. Verify modal appears
4. Select "Female"
5. Verify shops filtered to Female + Unisex only

### Test 2: Shop Type Visibility
1. Create Male shop
2. Create Female shop
3. Create Unisex shop
4. Login as Male customer
5. Verify: See Male + Unisex (not Female)
6. Update to Female preference
7. Verify: See Female + Unisex (not Male)

### Test 3: Unisex Shop Visibility
1. Create Unisex shop
2. Test with Male preference → Should appear ✓
3. Test with Female preference → Should appear ✓

### Test 4: Shop Type Update
1. Create Male shop
2. Visit ShopSettings
3. Change type to Unisex
4. Save
5. Login as Female customer
6. Verify shop now visible

### Test 5: Migration
1. Run migration in dry-run mode
2. Verify shop count
3. Run with --apply
4. Verify all shops have uppercase types

## Benefits

### For Customers
- 🎯 Relevant salon discovery
- 😊 Better user experience
- 🔍 Faster to find right salon
- 🌍 Culturally appropriate

### For Barbers
- 📈 More qualified customers
- 💰 Higher conversion rates
- 🎯 Targeted customer base
- 🔧 Can adjust type anytime

### For Business
- 📊 Better engagement metrics
- 🚀 Professional platform
- 🌟 Industry-standard feature
- 💼 Competitive advantage

## Future Enhancements

### Phase 2: Advanced Filtering
- Filter by service type AND gender
- Search for specific services within preference
- Filter by price within preference

### Phase 3: Analytics
- Track discovery metrics by preference
- Show which genders booking from which shops
- Recommendations based on trends

### Phase 4: Booking Source Attribution
- Track if offline booking is same gender preference
- Insights: walk-in vs app customer preferences

## Summary

**What Was Done**:
Implemented gender-based shop discovery allowing customers to see relevant salons while supporting unisex shops that serve everyone.

**Why It Matters**:
- Provides professional, culturally appropriate UX
- Improves customer satisfaction and engagement
- Enables better shop targeting
- Industry-standard for salon booking platforms

**Business Value**:
🎯 Personalized discovery  
📈 Higher engagement  
💰 Better conversions  
🌟 Professional platform  
🔧 Flexible for all shop types  
