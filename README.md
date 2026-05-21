# TrimTime Salon Booking App

A production-ready barber shop booking system with concurrent user support, atomic transactions, and a Rapido-style "Book Now, Pay After Service" payment model.

## 🎯 Key Features

- ✅ **Concurrent Booking Safety** - MongoDB transactions prevent overbooking
- ✅ **Atomic Slot Management** - No race conditions or double-bookings
- ✅ **Rate Limiting** - 4-tier protection (Global, Auth, Booking, Payment)
- ✅ **Book Now, Pay After** - Slots reserved immediately, payment collected after service
- ✅ **Role-Based Access** - Customers, Barbers, Admins with specific permissions
- ✅ **Settlement System** - Daily automated payouts with platform fee tracking
- ✅ **No-Show Detection** - Auto-marks missed appointments with grace periods
- ✅ **Gender-Based Discovery** - Find salons by barber gender preference
- ✅ **Multi-Chair Capacity** - Support for shops with multiple barber chairs
- ✅ **Responsive UI** - Mobile-first React frontend with Tailwind CSS

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js (v20+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Features**: 
  - Transactions for atomic bookings
  - Compound indexes for query optimization
  - Cron jobs (node-cron) for scheduled tasks
  - Rate limiting (express-rate-limit)

### Frontend
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS
- **State**: React Context API
- **Routing**: React Router v7
- **Auth**: Firebase integration

### Deployment
- Backend: Runs on port 4000
- Frontend: Vite dev server on port 5173
- Database: MongoDB Atlas (configurable)

## 📋 Prerequisites

- Node.js v20 or higher
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- Firebase project (for authentication)

## 🚀 Installation

### 1. Clone & Setup

```bash
git clone <your-repo-url>
cd barber-booking-app
npm install
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

## ⚙️ Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/barber_booking

# Authentication
JWT_SECRET=your-secret-key-here

# Firebase
FIREBASE_API_KEY=xxx
FIREBASE_AUTH_DOMAIN=xxx
FIREBASE_PROJECT_ID=xxx

# Port
PORT=4000
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:4000
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
```

**⚠️ Never commit .env files - they contain secrets!**

## 📁 Project Structure

```
barber-booking-app/
├── backend/
│   ├── src/
│   │   ├── app.js                 # Express app setup
│   │   ├── server.js              # Server startup & cron jobs
│   │   ├── config/                # Database, payment, env config
│   │   ├── models/                # Mongoose schemas
│   │   ├── controllers/           # Route handlers
│   │   ├── services/              # Business logic
│   │   ├── routes/                # API routes
│   │   ├── middlewares/           # Auth, validation, rate limiting
│   │   ├── jobs/                  # Scheduled cron jobs
│   │   └── utils/                 # Helpers
│   ├── scripts/                   # Database seed, migration scripts
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/                 # Page components
│   │   ├── components/            # Reusable components
│   │   ├── api/                   # API calls
│   │   ├── context/               # React Context
│   │   ├── hooks/                 # Custom hooks
│   │   ├── utils/                 # Helpers
│   │   └── App.jsx
│   └── package.json
│
├── docs/                          # Architecture & design docs
├── .gitignore                     # Git ignore rules
└── README.md
```

## 🔑 Core Models

### Booking
- **Status**: CONFIRMED → CHECKED_IN → COMPLETED
- **Payment Status**: PENDING → PAID
- **Payment Methods**: UPI, CASH
- **Atomic Creation**: Uses MongoDB transactions to prevent race conditions

### Shop
- **Multi-Chair Support**: Define chair count for concurrent bookings
- **Platform Fee Toggle**: `collectPlatformFee` boolean
- **Service Management**: Custom services per shop

### Settlement
- **Daily Payouts**: Auto-calculated at 10 PM
- **Platform Fee Tracking**: Transparent commission model
- **Payment Reconciliation**: Only includes PAID bookings

## 📊 Booking Flow

```
1. Customer Books
   ↓
2. Booking Created (CONFIRMED) - Slot reserved instantly
   ↓
3. Customer Arrives at Shop
   ↓
4. Barber Marks Check-In (CHECKED_IN)
   ↓
5. Service Completed (COMPLETED)
   ↓
6. Payment Collected (UPI/CASH)
   ↓
7. Barber Marks Payment as PAID
   ↓
8. Settlement Processed (Daily at 10 PM)
```

## 🔐 Security Features

- **Rate Limiting**: 
  - Global: 100 requests/15 min
  - Auth: 5 attempts/15 min
  - Booking: 10 bookings/5 min
  - Payment: 20 operations/10 min

- **Atomic Transactions**: MongoDB sessions prevent partial updates
- **JWT Authentication**: Secure token-based access control
- **Role-Based Authorization**: CUSTOMER, BARBER, ADMIN roles
- **Input Validation**: Middleware validates all incoming data

## 🧪 Testing

### Concurrent Booking Test
```bash
cd backend/scripts
node testConcurrentBookings.js
```

Tests 10 concurrent users booking the same 3-chair slot.
Expected: 3 succeed, 7 get SLOT_BOOKED error

### Database Indexes
All critical queries are indexed for performance:
- Slot availability checks: O(1) with compound indexes
- Settlement queries: Optimized for daily batch processing

## 📝 API Documentation

See [docs/api-documentation.md](docs/api-documentation.md) for full API reference.

### Key Endpoints

**Bookings**
- `POST /bookings` - Create booking
- `POST /bookings/:id/checkin` - Customer check-in
- `POST /bookings/:id/complete` - Mark service complete
- `POST /bookings/:id/mark-paid` - Mark payment received
- `POST /bookings/:id/cancel` - Cancel booking

**Shops**
- `GET /shops` - List all shops
- `POST /shops/:id/slots` - Get available slots
- `GET /shops/:id` - Shop details

**Barber Dashboard**
- `GET /bookings/shop/today` - Today's bookings
- `GET /bookings/shop/upcoming` - Upcoming bookings
- `GET /bookings/shop/dashboard` - Dashboard data

## 🚢 Deployment

### Vercel (Frontend)
```bash
npm run build
# Deploy dist/ folder
```

### Railway/Heroku (Backend)
```bash
# Set environment variables
git push heroku main
```

## 🔧 Troubleshooting

**Port 4000 already in use**
```bash
# Kill process using port 4000
lsof -ti:4000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :4000   # Windows (then taskkill)
```

**MongoDB connection failed**
- Check DATABASE_URL in .env
- Verify IP whitelist in MongoDB Atlas
- Ensure network connectivity

**Frontend API calls returning 401**
- Check JWT_SECRET matches between backend and frontend
- Verify Firebase config is correct
- Clear browser cache and re-login

## 📚 Additional Documentation

- [System Architecture](docs/system-architecture.md)
- [Database Design](docs/database-design.md)
- [API Documentation](docs/api-documentation.md)
- [Capacity-Based Booking](docs/CAPACITY_BASED_BOOKING.md)
- [Gender-Based Discovery](docs/GENDER_BASED_DISCOVERY.md)

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Support

For issues or questions:
1. Check existing GitHub issues
2. Review documentation in `/docs`
3. Contact the development team

---

**Last Updated**: May 2026
**Payment Model**: Book Now, Pay After Service (Rapido-style)
**Status**: Production Ready ✅
