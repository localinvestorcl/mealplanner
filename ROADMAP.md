# Meal Planner App — Roadmap

**Legend:**
- ✅ Done
- 🔄 In Progress
- ⬜ Not Started
- 🤖 Use Agent
- 👥 Use Agent Team
- ⚡ Use Skill
- 🔍 Use QA Agent after this

---

## Phase 1 — Foundation
*Goal: App runs on your phone via Expo Go. Auth works.*

| # | Task | Status | Notes |
|---|---|---|---|
| 1.1 | Expo mobile app scaffolded | ✅ | `mobile/` folder |
| 1.2 | Express server scaffolded | ✅ | `server/` folder |
| 1.3 | Supabase migration written | ✅ | Run `supabase/migration.sql` |
| 1.4 | `.env` files created | ✅ | Fill in your API keys |
| 1.5 | Sign-in screen | ✅ | `mobile/src/app/(auth)/sign-in.tsx` |
| 1.6 | Sign-up screen | ✅ | `mobile/src/app/(auth)/sign-up.tsx` |
| 1.7 | Auth gate (auto-redirect) | ✅ | `mobile/src/app/_layout.tsx` |
| 1.8 | Add API keys to `.env` files | ✅ | Supabase, Anthropic, Pexels keys configured |
| 1.9 | Run Supabase migration | ✅ | All 8 tables created with RLS policies |
| 1.10 | Confirm app loads on phone | ✅ | Running via Expo Go |

**→ When done: You can sign up and log in on your phone.**

---

## Phase 2 — Profile & Rules
*Goal: Enter your household details. The generator will use these.*

| # | Task | Status | Notes |
|---|---|---|---|
| 2.1 | Household profile screen | ✅ | `(app)/profile.tsx` |
| 2.2 | Weekly rules screen | ✅ | `(app)/preferences.tsx` |
| 2.3 | Profile API routes | ✅ | `server/src/routes/profile.ts` |
| 2.4 | Rules API routes | ✅ | `server/src/routes/rules.ts` |
| 2.5 | Test: save profile → reload → still there | ✅ | Confirmed |
| 2.6 | Test: add Friday no-red-meat rule | ✅ | Confirmed |

**→ When done: Your family's preferences are saved in Supabase.**

> ⚡ Future profiles for other apps: use `/supabase-setup` skill

---

## Phase 3 — Plan Generation
*Goal: Generate a real 7-day dinner plan with photos.*

| # | Task | Status | Notes |
|---|---|---|---|
| 3.1 | Claude plan prompt builder | ✅ | `server/src/lib/prompts/planPrompt.ts` |
| 3.2 | Generate plan API route | ✅ | `server/src/routes/generate/plan.ts` |
| 3.3 | Pexels photo search | ✅ | `server/src/lib/pexels.ts` |
| 3.4 | Generate plan screen | ✅ | `(app)/generate.tsx` |
| 3.5 | Weekly plan view (7-day grid) | ✅ | `(app)/plan/[id].tsx` |
| 3.6 | Meal detail modal (recipe view) | ✅ | Inside `plan/[id].tsx` |
| 3.7 | Claude recipe prompt builder | ✅ | `server/src/lib/prompts/recipePrompt.ts` |
| 3.8 | Generate recipe API route | ✅ | `server/src/routes/generate/recipe.ts` |
| 3.9 | Test: generate a plan → see 7 meals with photos | ✅ | Confirmed |
| 3.10 | Test: tap a meal → recipe loads | ✅ | Confirmed |
| 3.11 | Test: Load All Recipes button | ✅ | Confirmed |

**→ When done: You can generate and view a full weekly dinner plan.**

> 🤖 For debugging Claude output issues: use `api-integration` agent
> 🔍 Run QA agent after this phase

---

## Phase 4 — Grocery List & Plan Editing
*Goal: Generate a grocery list. Swap, move, or remove meals.*

| # | Task | Status | Notes |
|---|---|---|---|
| 4.1 | Claude grocery prompt builder | ✅ | `server/src/lib/prompts/groceryPrompt.ts` |
| 4.2 | Generate grocery API route | ✅ | `server/src/routes/generate/grocery.ts` |
| 4.3 | Grocery list screen | ✅ | `(app)/plan/[id]/grocery.tsx` |
| 4.4 | Grocery item checkboxes | ✅ | Persisted via AsyncStorage, survives navigation + app restart |
| 4.5 | Swap meal (Claude) | ✅ | `server/src/routes/plans.ts` → swap route |
| 4.6 | Remove meal from plan | ✅ | `api/meals/:id DELETE` |
| 4.7 | Refresh grocery list after edits | ⬜ | Show "Update Grocery List" button on plan screen when a list exists and meals have changed — user triggers one regen after all swaps/removes are done |
| 4.8 | Test: generate grocery list → items organized by aisle | ✅ | Confirmed |
| 4.9 | Test: swap a meal → replacement appears | ✅ | Confirmed |
| 4.10 | Test: remove a meal → grid updates | ✅ | Confirmed |

**→ When done: Full planning workflow is usable end-to-end.**

> 🔍 Run QA agent after this phase

---

## Phase 5 — Favorites & Feedback
*Goal: Save meals you love. Leave feedback after cooking.*

| # | Task | Status | Notes |
|---|---|---|---|
| 5.1 | Favorites screen | ✅ | `(app)/favorites.tsx` |
| 5.2 | Favorites API routes | ✅ | `server/src/routes/favorites.ts` |
| 5.3 | Feedback screen | ✅ | `(app)/feedback/[mealId].tsx` |
| 5.4 | Feedback API route | ✅ | `server/src/routes/feedback.ts` |
| 5.5 | Save as Favorite from feedback | ✅ | Checkbox on feedback screen |
| 5.5a | Star/favorite a meal directly from plan view | ✅ | ★ button on meal card + modal header |
| 5.6 | Saved plans screen | ✅ | `(app)/plans.tsx` |
| 5.7 | Dashboard screen | ✅ | `(app)/index.tsx` |
| 5.8 | Test: leave feedback on a meal | ✅ | Confirmed |
| 5.9 | Test: save as favorite → appears in favorites | ✅ | Confirmed |
| 5.10 | Test: favorites show up in next generated plan | ✅ | Confirmed |

**→ When done: The app has memory. It learns what your family likes.**

> 🔍 Run QA agent after this phase

---

## Phase 6 — Polish
*Goal: App feels smooth and handles errors gracefully.*

| # | Task | Status | Notes |
|---|---|---|---|
| 6.1 | Loading skeletons on slow screens | ✅ | `components/Skeleton.tsx` — plan view, grocery, plans list, favorites |
| 6.2 | Error messages for failed API calls | ✅ | `components/ErrorView.tsx` — plan, grocery, plans list, favorites; inline Alerts for mutations |
| 6.3 | Toast notifications (save success, etc.) | ✅ | `components/Toast.tsx` — swap success, add/remove favorite; blocking alerts kept for destructive actions |
| 6.4 | Pull-to-refresh on plans and favorites | ✅ | `RefreshControl` on plans list, favorites, and plan view |
| 6.5 | App icon (replace Expo default) | ✅ | `assets/images/icon.png` — green background, crossed fork/spoon + calendar |
| 6.6 | Splash screen color / branding | ✅ | `app.json` splash + Android adaptive icon background set to `#16a34a` |
| 6.7 | Grocery list: persist checked state | ✅ | AsyncStorage keyed per plan, clears on regenerate |
| 6.8 | Grocery list shortcut on dashboard | ✅ | Card appears on Home when most recent plan has a list |
| 6.9 | Grocery list button skips regen if list exists | ✅ | Checks API first, only generates if no list found |

> 🤖 Use `screen-builder` agent for any new screens added in this phase
> ⚡ Use `/expo-screen` skill for simple new screens

---

## Phase 7 — App Store Prep
*Goal: Native app installable on your family's phones without Expo Go.*

| # | Task | Status | Notes |
|---|---|---|---|
| 7.1 | Deploy Express server to Railway | 🔄 | `server/railway.json` configured — follow deployment steps below |
| 7.2 | Update `app.json` bundle IDs | ⬜ | `com.mealplanner.app` — change to yours |
| 7.3 | EAS build configuration | ⬜ | `eas build:configure` |
| 7.4 | TestFlight build (iOS) | ⬜ | Requires Apple Developer account ($99/yr) |
| 7.5 | Internal testing build (Android) | ⬜ | Requires Google Play account ($25 one-time) |
| 7.6 | Privacy policy page | ⬜ | Required by both stores |
| 7.7 | Install on family phones natively | ⬜ | Via TestFlight / Play internal track |

> 👥 Use `launch-team` agent team: runs iOS build + Android build in parallel
> ⚡ Use `/eas-build` skill

---

## Phase 8 — Public App Store Release
*Goal: Anyone can download the app.*

| # | Task | Status | Notes |
|---|---|---|---|
| 8.1 | App Store screenshots (iOS) | ⬜ | 6.5" and 5.5" sizes required |
| 8.2 | Play Store screenshots (Android) | ⬜ | Phone + tablet sizes |
| 8.3 | App description and keywords | ⬜ | Write for discoverability |
| 8.4 | Submit to Apple App Store | ⬜ | Review: 1–3 days |
| 8.5 | Submit to Google Play Store | ⬜ | Review: 1–7 days |
| 8.6 | Monitor first-launch crash reports | ⬜ | Expo EAS Insights |

> 👥 Use `launch-team` agent team for simultaneous iOS + Android submission

---

## Future Features (Post-Launch)

These are not started but the database schema is already built for them.

| Feature | Schema Ready | When to Build |
|---|---|---|
| Nutritional info per meal | ✅ (`nutrition_json` column) | After Phase 5 |
| Nutrition goals (protein/carb targets) | ✅ (`nutrition_goals` table) | After nutritional info |
| Food spending tracker | ✅ (`grocery_spending` table) | After Phase 5 |
| Savings suggestions | ⬜ | After spending tracker |
| Meal photos (AI-generated) | ⬜ | Optional upgrade to Pexels |
| Household member profiles | ⬜ | Requires schema extension |
| Meal ratings (1–5 stars) | ⬜ | Extend `meal_feedback` table |
| Share grocery list (text/SMS) | ⬜ | React Native `Share` API — no backend needed |
| Calendar-style week view with date strip | ⬜ | Horizontal scrollable date bar at top, current day highlighted, days expand/collapse |
| Breakfast + lunch + snack planning (not just dinner) | ⬜ | Requires schema extension — meal_type already stored, just needs UI + generation support |
| First-time user onboarding modal | ⬜ | Show after first plan is generated — tips on tap to view, swap, grocery list |
| Grocery order integration (Instacart / Amazon Fresh) | ⬜ | Deep link to retailer app with grocery list items pre-filled |
| Recipe portion scaling | ⬜ | +/− portions adjuster on recipe view, scales ingredient quantities |
| Manual ingredient editing on recipe | ⬜ | Remove or adjust individual ingredients from a loaded recipe |
| Grocery budget onboarding question | ⬜ | Ask monthly grocery spend during setup, show personalized savings estimate |
| Subscription paywall (monthly / annual / lifetime) | ⬜ | Requires RevenueCat or StoreKit integration; design pricing carefully given Claude API costs |
| Optional feature tour on first launch | ⬜ | "Would you like a tour?" prompt on first open; Yes launches tooltip walkthrough |
| Share a full plan with someone | ⬜ | Requires share/export feature |
| Favorite rotation — don't repeat every week | ⬜ | Track `last_used_at` on favorites, only suggest if not used in N weeks; configurable cadence per favorite |
| Add a favorite meal directly into a plan | ⬜ | Button on favorites screen + empty day slot; inserts meal without calling Claude |
| Swap/replace a meal before loading recipe | ⬜ | Swipe gesture or button on meal card (before recipe is loaded) to replace without generating recipe first |
| Onboarding motivation screen | ⬜ | Multi-select "Why do you want to use this app?" (stay organized, eat healthier, lose/gain weight, save money, save time, recipe ideas) — store answers to personalize plan prompt |
| Diet type selection during onboarding | ⬜ | Single-select diet screen after motivation (Keto, Mediterranean, 5:2, Intermittent fasting, Paleo, Atkins, Whole 30, No preference) — maps to dietary_restrictions on profile |
| Tinder-style recipe swiping (onboarding or discovery) | ⬜ | Swipe left/right on recipe cards (photo + name + short description) to build taste profile; thumbs down = dislike, neutral = skip, thumbs up = add to favorites — run after first plan generates or as standalone discover tab |

> 👥 For each future feature: use `feature-team` agent team
> (Schema agent + API agent + Screen agent run in parallel, then QA agent reviews all three)

---

## Reusable Tools Reference

### Skills (slash commands in Claude Code)

| Skill | When to Use |
|---|---|
| `/supabase-setup` | Starting a new app that needs Supabase auth |
| `/expo-screen [name]` | Adding a simple new screen to any Expo app |
| `/api-route [name]` | Adding a new Express route with auth + error handling |
| `/db-table [name]` | Adding a new Supabase table with types + helpers |
| `/eas-build` | Building and submitting to App Stores |

### Agents (autonomous multi-step tasks)

| Agent | When to Use |
|---|---|
| `schema-design` | Before building any new feature — design the DB first |
| `api-integration` | Integrating a new third-party API (Stripe, nutrition API, etc.) |
| `screen-builder` | Building a complex new screen with data + forms |
| `test-runner` | Running tests and diagnosing failures |
| `deploy` | Deploying to Railway or building with EAS |
| `qa` | After completing any phase — checks types, tests, RLS policies, secrets |

### Agent Teams (parallel work)

| Team | When to Use |
|---|---|
| `feature-team` | Building a complete new feature (schema + API + screen + QA, parallel) |
| `launch-team` | App Store submission (iOS build + Android build + store copy, parallel) |

---

## Quick Reference — API Keys Needed

| Key | Where to Get It | Used In |
|---|---|---|
| Supabase URL | supabase.com → Settings → API | Both |
| Supabase Anon Key | supabase.com → Settings → API | Mobile |
| Supabase Service Role Key | supabase.com → Settings → API | Server |
| Anthropic API Key | console.anthropic.com | Server |
| Pexels API Key | pexels.com/api | Server |
