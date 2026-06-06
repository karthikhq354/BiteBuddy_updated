# 🍔 BiteBuddy — Full Stack Food Delivery App

## New Features Added (9 Total)

| # | Feature | Route |
|---|---------|-------|
| 1 | 😄 Mood-Based Food Recommendation | `/mood` |
| 2 | 🍔 Meal Combo Suggestion | Via food detail API |
| 3 | 👥 Group Order + Bill Split | `/group-order` |
| 4 | ⏳ Closing Soon Deals | Home page section |
| 5 | 🥗 Personalized Nutrition Mode | `/nutrition` |
| 6 | 🎤 Voice-Based Food Search | Home page section |
| 7 | 🎲 Surprise Me | Home page section |
| 8 | 🍽️ Daily Cuisine Discovery | Home page section |
| 9 | ⏱️ Delivery Time Challenge + Auto Coupon | Admin API |

## Setup

### Server
```bash
cd server
npm install
# Add .env: MONGODB_URI, JWT_SECRET, STRIPE_SECRET_KEY, FRONTEND_URL
npm run server
```

### Client
```bash
cd client
npm install
npm run dev
```

## New API Endpoints

All features available under `/api/features/`

```
GET  /api/features/mood/:mood
GET  /api/features/food-combo/:foodId
POST /api/features/group/create
POST /api/features/group/join
POST /api/features/group/add-item
POST /api/features/group/split
GET  /api/features/group/:groupCode
GET  /api/features/closing-discount-foods
GET  /api/features/nutrition-recommendation/:userId
POST /api/features/nutrition-preferences
GET  /api/features/search-food?query=
GET  /api/features/surprise-food
GET  /api/features/daily-cuisine
POST /api/features/check-delivery-delay
POST /api/features/generate-coupon
```
