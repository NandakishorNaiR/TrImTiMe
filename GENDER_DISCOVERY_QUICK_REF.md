# 🎯 Gender-Based Discovery - Quick Reference

## The Three Shop Types
| Type | Icon | Color | Visible To |
|------|------|-------|-----------|
| MALE | 👨 | Blue | Male customers + Unisex |
| FEMALE | 👩 | Pink | Female customers + Unisex |
| UNISEX | 👥 | Purple | Everyone |

## Customer Preferences
| Preference | Sees |
|-----------|------|
| MALE | MALE + UNISEX shops |
| FEMALE | FEMALE + UNISEX shops |
| Not set | All shops (until preference selected) |
| Guest | UNISEX only |

## Key Files
**Backend**:
- `src/models/User.model.js` - genderPreference field
- `src/models/Shop.model.js` - type enum (MALE/FEMALE/UNISEX)
- `src/routes/shop.routes.js` - Filtering logic
- `src/controllers/auth.controller.js` - updatePreference method

**Frontend**:
- `components/auth/GenderPreferenceModal.jsx` - Modal component
- `pages/Home.jsx` - Integration point
- `components/shop/ShopCard.jsx` - Type badge display

## APIs
```
PATCH /auth/update-preference
GET /shops (with optional auth)
```

## Migration
```bash
# Check what needs updating
node backend/scripts/migrations/20260514-normalize-shop-types.js

# Apply changes
node backend/scripts/migrations/20260514-normalize-shop-types.js --apply
```

## Test Flow
1. Login as customer
2. See GenderPreferenceModal
3. Select preference
4. Page refreshes
5. Shops filtered accordingly
6. Each shop shows type badge

## Design Colors
- **MALE (Blue)**: bg-blue-100, text-blue-700
- **FEMALE (Pink)**: bg-pink-100, text-pink-700
- **UNISEX (Purple)**: bg-purple-100, text-purple-700

## Status
✅ Implementation complete  
✅ Ready for testing  
✅ Ready for deployment
