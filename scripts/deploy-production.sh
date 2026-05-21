#!/bin/bash

# DEPLOYMENT GUIDE: Production-Ready Scaling Setup
# This script prepares your barber booking app for production deployment

echo "🚀 PRODUCTION DEPLOYMENT SETUP"
echo "======================================"

# 1. Install new package
echo "📦 Installing express-rate-limit..."
cd backend
npm install express-rate-limit@^7.1.5

# 2. Build frontend
echo "🎨 Building frontend..."
cd ../frontend
npm run build
echo "✅ Frontend built"

# 3. Database migration (optional - for existing deployments)
echo "🗄️  Database indexes will be created automatically on first run"
echo "   No manual migration needed - Mongoose creates indexes on schema initialization"

# 4. Environment variables to add
echo ""
echo "📝 ADD THESE TO YOUR .env (if not already present):"
echo "   NODE_ENV=production"
echo "   FRONTEND_ORIGIN=https://your-domain.com"
echo "   PORT=4000"

# 5. Run tests
echo ""
echo "🧪 Running concurrent booking test..."
cd ../backend
node scripts/testConcurrentBookings.js

if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "⚠️  Tests failed - check output above"
    exit 1
fi

echo ""
echo "======================================"
echo "✅ DEPLOYMENT READY!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Set environment variables"
echo "2. Start with: npm run start"
echo "3. Or use PM2 for clustering:"
echo "   npm install -g pm2"
echo "   pm2 start src/server.js -i 4  # 4 process instances"
echo ""
echo "Features activated:"
echo "✓ MongoDB transactions for atomic bookings"
echo "✓ 5-minute payment hold with auto-expiry"
echo "✓ Rate limiting (global + endpoint specific)"
echo "✓ Database performance indexes"
echo "✓ Pending payment countdown timer"
echo ""
echo "For monitoring:"
echo "- Check cron jobs: every 1 min (pending_payment expiry)"
echo "- Daily settlement: 10:00 PM (22:00)"
echo "- No-show check: every 5 minutes"
