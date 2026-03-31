# Meal Planner App

A household meal planning app for iOS and Android. Generates personalized weekly dinner plans using Claude AI, fetches food photos from Pexels, and produces organized grocery lists. Built for real family use — practical, editable, and preference-aware.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo SDK 55 |
| Navigation | Expo Router v2 (file-based) |
| Backend API | Node.js + Express (Railway) |
| Database | PostgreSQL (Supabase) |
| Auth | Supabase Auth |
| AI | Claude API (`claude-sonnet-4-6`) |
| Photos | Pexels API (free) |
| Styling | NativeWind v4 (Tailwind for RN) |

---

## Project Structure

```
Meal Planning App/
├── mobile/               # Expo React Native app
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/   # Sign in / Sign up screens
│   │   │   └── (app)/    # Main app screens (tab navigation)
│   │   ├── lib/          # Supabase client, API helper
│   │   ├── store/        # Zustand state (auth)
│   │   └── types/        # TypeScript types
│   └── .env.local        # Mobile environment variables
├── server/               # Express API server
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   ├── lib/          # Claude, Pexels, Supabase clients + prompts
│   │   └── middleware/   # Auth, error handling
│   └── .env              # Server environment variables
└── supabase/
    └── migration.sql     # Run this in Supabase SQL Editor to create tables
```

---

## Environment Setup

### Mobile (`mobile/.env.local`)
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_API_URL=http://localhost:3001
```

### Server (`server/.env`)
```
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=sk-ant-...
PEXELS_API_KEY=your-pexels-key
```

---

## First-Time Setup

1. Create a Supabase project at supabase.com
2. Run `supabase/migration.sql` in the Supabase SQL Editor
3. Fill in both `.env` files with your API keys
4. Install dependencies and start both servers (see Running the App)

---

## Running the App

### Start the API server
```bash
cd server
npm run dev
```
Server runs at `http://localhost:3001`

### Start the mobile app
```bash
cd mobile
npx expo start
```
Scan the QR code with the **Expo Go** app on your phone.

---

## API Routes

| Method | Route | Purpose |
|---|---|---|
| GET/POST | `/api/profile` | Household profile |
| GET/POST/DELETE | `/api/rules` | Weekly rules |
| GET/POST/DELETE | `/api/favorites` | Favorite meals |
| GET/POST | `/api/feedback` | Meal feedback |
| GET/DELETE | `/api/plans` | Saved plans list |
| GET/DELETE | `/api/plans/:id` | Single plan |
| GET | `/api/plans/:id/grocery` | Grocery list for a plan |
| POST | `/api/plans/:id/swap` | Swap a meal (Claude) |
| DELETE | `/api/meals/:id` | Remove a meal from plan |
| POST | `/api/generate/plan` | Generate 7-day plan (Claude) |
| POST | `/api/generate/recipe` | Generate recipe for a meal (Claude) |
| POST | `/api/generate/grocery` | Generate grocery list (Claude) |

---

## Deploying for Production

### Backend (Railway)
1. Create a Railway project
2. Connect your GitHub repo or push the `server/` folder
3. Add environment variables in Railway dashboard
4. Update `EXPO_PUBLIC_API_URL` in mobile `.env` to the Railway URL

### Mobile (App Store / Play Store)
1. Install EAS CLI: `npm install -g eas-cli`
2. Login: `eas login`
3. Configure: `eas build:configure`
4. Build: `eas build --platform all`
5. Submit: `eas submit --platform all`

---

## Future Features (Schema Ready)

- **Nutritional tracking** — `nutrition_json` column exists on `planned_meals`
- **Goals** (protein/carb/calorie targets) — `nutrition_goals` table exists
- **Food spending tracker** — `grocery_spending` table exists
- **Savings suggestions** — compare spending trends over time
