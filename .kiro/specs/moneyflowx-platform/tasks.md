# Implementation Plan: MoneyFlowX Platform

## Overview

Migrate the existing single-page React app to a full-stack platform: Node.js/Express backend with MongoDB Atlas, JWT auth, shared REST API for both a React + Vite web frontend (`client-web/`) and a React Native Expo mobile app (`mobile-app/`). Tasks are ordered so each step builds on the previous, ending with full integration.

## Tasks

- [x] 1. Backend project scaffold and database connection
  - Create `server/` directory with `package.json` (express, mongoose, jsonwebtoken, bcryptjs, dotenv, cors, multer, jest, fast-check, mongodb-memory-server as devDeps)
  - Create `server/.env` with `PORT`, `MONGODB_URI`, `JWT_SECRET` placeholders
  - Implement `server/config/db.js` — Mongoose `connect()` using `MONGODB_URI` env var, log success/error
  - Implement `server/server.js` — Express app with `cors`, `express.json()`, dotenv config, db connection call, and a `GET /health` route
  - _Requirements: 18.2, 18.3, 20.3_

- [x] 2. Mongoose data models
  - [x] 2.1 Implement User, Bank, and Expense models
    - `server/models/User.js` — fields: name, email (unique, lowercase), password, profilePicture, monthlySalary, currency (default INR), createdAt
    - `server/models/Bank.js` — fields: user (ref), name, purpose (enum), balance (default 0), createdAt
    - `server/models/Expense.js` — fields: user, bank (ref), type (enum Daily|Other), category, amount (min 0.01), paymentMethod (enum), notes, receiptImage, date, createdAt
    - _Requirements: 5.3, 6.3, 7.3_

  - [x] 2.2 Implement Transfer, Goal, EMI, SIP, and Note models
    - `server/models/Transfer.js` — fields: user, fromBank, toBank (refs), amount (min 0.01), notes, date, createdAt
    - `server/models/Goal.js` — fields: user, name, targetAmount (min 1), savedAmount (default 0), targetDate, isCompleted (default false), createdAt
    - `server/models/EMI.js` — fields: user, bank (ref), loanName, totalAmount, emiAmount, dueDay (1–31), startDate, endDate, isFullyPaid (default false), payments array `[{amount, date}]`, createdAt
    - `server/models/SIP.js` — fields: user, bank (ref), fundName, monthlyAmount, sipDay (1–31), startDate, contributions array `[{amount, date}]`, createdAt
    - `server/models/Note.js` — fields: user, title, body, reminderDate, createdAt
    - _Requirements: 8.3, 9.1, 10.1, 11.1, 12.1_

- [x] 3. Auth middleware, error handler, and Multer upload middleware
  - `server/middleware/auth.js` — extract Bearer token, `jwt.verify` with `JWT_SECRET`, attach `req.user = { id }`, return 401 on failure
  - `server/middleware/errorHandler.js` — global Express error handler: log stack, map Mongoose `ValidationError` → 400, `CastError` → 404, default → 500 with generic message
  - `server/middleware/upload.js` — Multer `diskStorage` to `server/uploads/`, accept jpeg/png/webp only, 5 MB limit, export `uploadSingle`
  - Wire `errorHandler` as last middleware in `server.js`
  - _Requirements: 3.5, 18.5, 18.6_

- [x] 4. Auth controller and routes
  - [x] 4.1 Implement `server/controllers/authController.js`
    - `register`: validate name/email/password (min 8 chars), check duplicate email → 409, bcrypt hash password, save User, return JWT — _Requirements: 1.1–1.6_
    - `login`: find user by email, `bcrypt.compare`, sign JWT (7-day expiry), return token — _Requirements: 2.1–2.3_
    - `getMe`: return `req.user` populated from DB — _Requirements: 3.5_
    - `updateProfile`: partial update of name, monthlySalary, currency — _Requirements: 4.2_
    - `uploadProfilePicture`: save Multer file path to User record — _Requirements: 4.3_
  - [x] 4.2 Create `server/routes/auth.js` and mount at `/api/auth` in `server.js`
    - _Requirements: 18.1_

  - [ ]* 4.3 Write property test: password hashing round trip (Property 1)
    - **Property 1: Password hashing round trip**
    - Use `fast-check` to generate arbitrary passwords (length ≥ 8); register user via controller, assert `bcrypt.compare(plain, stored) === true` and `stored !== plain`
    - Tag: `// Feature: MoneyFlowX-platform, Property 1: password hashing round trip`
    - **Validates: Requirements 1.2**

  - [ ]* 4.4 Write property test: duplicate email rejection (Property 2)
    - **Property 2: Duplicate email rejection**
    - Generate arbitrary email strings; call register twice with same email, assert second response is 409
    - Tag: `// Feature: MoneyFlowX-platform, Property 2: duplicate email rejection`
    - **Validates: Requirements 1.3**

  - [ ]* 4.5 Write property test: JWT authentication round trip (Property 3)
    - **Property 3: JWT authentication round trip**
    - Generate arbitrary credentials; register → login → GET `/api/auth/me` with returned JWT; assert response `_id` matches registered user
    - Tag: `// Feature: MoneyFlowX-platform, Property 3: JWT authentication round trip`
    - **Validates: Requirements 2.1, 3.5**

- [x] 5. Bank controller and routes
  - [x] 5.1 Implement `server/controllers/bankController.js`
    - `listBanks`: find all banks where `user = req.user.id`
    - `createBank`: create bank scoped to `req.user.id`
    - `updateBank`: find by `_id` + `user`, update, return updated doc
    - `deleteBank`: check for dependent Expense/Transfer/EMI/SIP records; if any exist return 400 with counts; else delete — _Requirements: 5.2–5.5, 19.4_
  - [x] 5.2 Create `server/routes/banks.js`, apply `auth` middleware, mount at `/api/banks`
    - _Requirements: 18.1_

- [x] 6. Expense controller and routes
  - [x] 6.1 Implement `server/controllers/expenseController.js`
    - `listExpenses`: find expenses for `req.user.id`, support query filters: `type`, `category`, `month`
    - `createExpense`: validate fields, deduct `amount` from `Bank.balance` atomically (`findByIdAndUpdate`), save Expense — _Requirements: 6.2, 7.2, 19.1_
    - `deleteExpense`: find expense, restore `amount` to bank balance, delete expense — _Requirements: 7.6, 19.3_
  - [x] 6.2 Create `server/routes/expenses.js` with `uploadSingle` on POST, apply `auth`, mount at `/api/expenses`
    - _Requirements: 18.1, 18.6_

  - [ ]* 6.3 Write property test: expense deduction invariant (Property 4)
    - **Property 4: Expense deduction invariant**
    - Generate arbitrary balance B and amount A (0 < A ≤ B); create bank with balance B, create expense with amount A, fetch bank; assert `bank.balance === B - A`
    - Tag: `// Feature: MoneyFlowX-platform, Property 4: expense deduction invariant`
    - **Validates: Requirements 6.2, 7.2, 19.1**

  - [ ]* 6.4 Write property test: expense deletion restores balance (Property 5)
    - **Property 5: Expense deletion restores balance**
    - Generate arbitrary bank and expense; create expense (balance becomes B−A), delete expense, fetch bank; assert `bank.balance === B`
    - Tag: `// Feature: MoneyFlowX-platform, Property 5: expense deletion restores balance`
    - **Validates: Requirements 7.6, 19.3**

- [x] 7. Transfer controller and routes
  - [x] 7.1 Implement `server/controllers/transferController.js`
    - `listTransfers`: find transfers for `req.user.id`
    - `createTransfer`: check source balance ≥ amount (else 400), deduct from source, add to destination atomically, save Transfer — _Requirements: 8.1, 8.2, 8.4, 19.2_
    - `deleteTransfer`: reverse both bank balance changes, delete transfer — _Requirements: 8.7_
  - [x] 7.2 Create `server/routes/transfers.js`, apply `auth`, mount at `/api/transfers`
    - _Requirements: 18.1_

  - [ ]* 7.3 Write property test: transfer balance conservation (Property 6)
    - **Property 6: Transfer balance conservation**
    - Generate Bs, Bd, A (0 < A ≤ Bs); create transfer; fetch both banks; assert `src.balance === Bs - A` and `dst.balance === Bd + A`
    - Tag: `// Feature: MoneyFlowX-platform, Property 6: transfer balance conservation`
    - **Validates: Requirements 8.1, 8.2, 19.2**

  - [ ]* 7.4 Write property test: transfer deletion reversal (Property 7)
    - **Property 7: Transfer deletion reversal**
    - Generate arbitrary transfer; create it, delete it, fetch both banks; assert balances match pre-transfer values
    - Tag: `// Feature: MoneyFlowX-platform, Property 7: transfer deletion reversal`
    - **Validates: Requirements 8.7**

- [x] 8. Goal, EMI, and SIP controllers and routes
  - [x] 8.1 Implement `server/controllers/goalController.js`
    - `listGoals`, `createGoal` (savedAmount = 0), `updateGoal` (contribution increments savedAmount; set `isCompleted = true` when `savedAmount >= targetAmount`), `deleteGoal`
    - _Requirements: 9.1–9.6_

  - [ ]* 8.2 Write property test: goal completion invariant (Property 8)
    - **Property 8: Goal completion invariant**
    - Generate goals where `savedAmount >= targetAmount`; assert `isCompleted === true` after save
    - Tag: `// Feature: MoneyFlowX-platform, Property 8: goal completion invariant`
    - **Validates: Requirements 9.6**

  - [x] 8.3 Implement `server/controllers/emiController.js`
    - `listEMIs`, `createEMI`, `recordPayment` (deduct emiAmount from bank, push to payments array, set `isFullyPaid` when remaining balance = 0), `deleteEMI`
    - _Requirements: 10.1–10.6_

  - [ ]* 8.4 Write property test: EMI remaining balance calculation (Property 9)
    - **Property 9: EMI remaining balance calculation**
    - Generate arbitrary EMI with N payments; assert `totalAmount - sum(payments) === remainingBalance`
    - Tag: `// Feature: MoneyFlowX-platform, Property 9: EMI remaining balance calculation`
    - **Validates: Requirements 10.5**

  - [x] 8.5 Implement `server/controllers/sipController.js`
    - `listSIPs`, `createSIP`, `recordContribution` (deduct monthlyAmount from bank, push to contributions array), `deleteSIP`
    - _Requirements: 11.1–11.5_

  - [ ]* 8.6 Write property test: SIP total invested calculation (Property 10)
    - **Property 10: SIP total invested calculation**
    - Generate arbitrary SIP with N contributions; assert `sum(contributions) === totalInvested`
    - Tag: `// Feature: MoneyFlowX-platform, Property 10: SIP total invested calculation`
    - **Validates: Requirements 11.5**

  - [x] 8.7 Implement `server/controllers/noteController.js` — `listNotes`, `createNote`, `updateNote`, `deleteNote`
    - _Requirements: 12.1–12.3_

  - [x] 8.8 Create route files for goals (`/api/goals`), emi (`/api/emi`), sip (`/api/sip`), notes (`/api/notes`); apply `auth` middleware; mount all in `server.js`
    - _Requirements: 18.1_

- [x] 9. Analytics controller and routes
  - [x] 9.1 Implement `server/controllers/analyticsController.js`
    - `getSummary`: single endpoint returning total balance across all banks, total savings, today's daily expenses, current-month other expenses, current-month total expenses, 5 most recent transactions, active EMI/SIP/Goal counts — _Requirements: 13.1, 13.6_
    - `getExpenseAnalytics`: MongoDB aggregation pipelines scoped to `req.user.id` — group by category, group by month (last 6 months), daily vs other totals — _Requirements: 14.5, 14.6_
  - [x] 9.2 Create `server/routes/analytics.js`, apply `auth`, mount at `/api/analytics`
    - _Requirements: 18.1_

  - [ ]* 9.3 Write property test: user data isolation (Property 11)
    - **Property 11: User data isolation**
    - Create two users U1 and U2 with overlapping resource types; assert all GET responses for U1 contain only documents with `user === U1._id`
    - Tag: `// Feature: MoneyFlowX-platform, Property 11: user data isolation`
    - **Validates: Requirements 19.5**

  - [ ]* 9.4 Write property test: analytics scope isolation (Property 12)
    - **Property 12: Analytics scope isolation**
    - Create two users with expenses; assert analytics summary for U1 sums only U1's expenses
    - Tag: `// Feature: MoneyFlowX-platform, Property 12: analytics scope isolation`
    - **Validates: Requirements 14.6**

- [x] 10. Checkpoint — backend complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify `GET /health`, auth flow, and at least one protected CRUD route work end-to-end with `mongodb-memory-server`

- [x] 11. Web frontend scaffold (`client-web/`)
  - Create `client-web/` with Vite + React template (`npm create vite@latest client-web -- --template react`)
  - Install dependencies: react-router-dom, axios, recharts (or chart.js)
  - Copy existing `src/styles/global.css` design system into `client-web/src/styles/`
  - Create `client-web/.env` with `VITE_API_URL=http://localhost:5000`
  - Create `client-web/vite.config.js` with proxy config for dev
  - _Requirements: 20.1, 20.5_

- [x] 12. Web API service and contexts
  - [x] 12.1 Implement `client-web/src/services/api.js`
    - Axios instance with `baseURL = import.meta.env.VITE_API_URL`
    - Request interceptor: attach `Authorization: Bearer <token>` from localStorage
    - Response interceptor: on 401, clear token and redirect to `/login`
    - _Requirements: 3.1, 3.3_

  - [x] 12.2 Implement `client-web/src/context/AuthContext.jsx`
    - State: `currentUser`, `token`; functions: `login()`, `logout()`, `register()`
    - Persist JWT to localStorage; on mount, validate stored token via `GET /api/auth/me`
    - _Requirements: 2.4, 3.1_

  - [x] 12.3 Implement `client-web/src/context/ThemeContext.jsx`
    - State: `theme` (dark|light); `toggleTheme()` flips and persists to localStorage
    - Apply `data-theme` attribute to `document.documentElement`
    - _Requirements: 15.1–15.3_

- [x] 13. Web layout components
  - [x] 13.1 Implement `client-web/src/components/ProtectedRoute.jsx`
    - Redirect unauthenticated users to `/login` using `AuthContext`
    - _Requirements: 3.3_

  - [x] 13.2 Implement `client-web/src/components/Topbar.jsx`
    - Logo, theme toggle button (uses ThemeContext), profile dropdown showing name + avatar
    - _Requirements: 4.4, 15.1, 16.1_

  - [x] 13.3 Implement `client-web/src/components/Sidebar.jsx`
    - Nav links: Dashboard, Banks, Expenses, Transfers, Goals, EMI, SIP, Notes, Analytics, Logout
    - Highlight active link via `NavLink`; Logout calls `AuthContext.logout()`
    - _Requirements: 16.2–16.5_

  - [x] 13.4 Update `client-web/src/components/BottomNav.jsx` (migrate from existing `src/components/BottomNav.jsx`)
    - Tabs: Home, Expenses, Banks, Transfers, More — visible on mobile viewports only
    - _Requirements: 17.1_

  - [x] 13.5 Wire `client-web/src/App.jsx` with React Router, AuthContext, ThemeContext, ProtectedRoute, Sidebar, Topbar, BottomNav
    - _Requirements: 16.1, 16.2_

- [x] 14. Web auth pages
  - Implement `client-web/src/pages/Login.jsx` — form calls `AuthContext.login()`, redirects to `/` on success, shows inline errors — _Requirements: 2.1–2.3_
  - Implement `client-web/src/pages/Register.jsx` — form calls `AuthContext.register()`, redirects to `/` on success, shows field-level validation errors — _Requirements: 1.1, 1.5, 1.6_

- [x] 15. Web core data pages
  - [x] 15.1 Implement `client-web/src/pages/Dashboard.jsx`
    - Fetch `GET /api/analytics/summary` on mount; display total balance, savings, today's daily expenses, monthly totals, recent transactions, EMI/SIP/Goal summary cards
    - _Requirements: 13.1–13.3_

  - [x] 15.2 Implement `client-web/src/pages/Banks.jsx`
    - Fetch/create/update/delete banks via API; display name, purpose, balance; guard delete with error message if dependents exist
    - _Requirements: 5.1–5.8_

  - [x] 15.3 Implement `client-web/src/pages/Expenses.jsx`
    - Fetch expenses with type filter; separate Daily and Other sections; create expense form with receipt image upload (multipart); delete with balance restore
    - _Requirements: 6.1–6.7, 7.1–7.6_

  - [x] 15.4 Implement `client-web/src/pages/Transfers.jsx`
    - Fetch/create/delete transfers; display source, destination, amount, date; show 400 error on insufficient balance
    - _Requirements: 8.1–8.7_

  - [x] 15.5 Implement `client-web/src/pages/Goals.jsx`
    - Fetch/create/update/delete goals; display name, target, saved amount, progress percentage; show completed badge when `isCompleted`
    - _Requirements: 9.1–9.6_

  - [x] 15.6 Implement `client-web/src/pages/EMI.jsx`
    - Fetch/create/delete EMIs; record payment; display loan name, monthly amount, next due date, remaining balance; show fully paid badge
    - _Requirements: 10.1–10.6_

  - [x] 15.7 Implement `client-web/src/pages/SIP.jsx`
    - Fetch/create/delete SIPs; record contribution; display fund name, monthly amount, SIP date, total invested
    - _Requirements: 11.1–11.5_

  - [x] 15.8 Implement `client-web/src/pages/Notes.jsx`
    - Fetch/create/update/delete notes; highlight notes where `reminderDate` matches today
    - _Requirements: 12.1–12.6_

  - [x] 15.9 Implement `client-web/src/pages/Analytics.jsx`
    - Fetch `GET /api/analytics/expenses`; render pie chart (category breakdown), bar/line chart (monthly totals last 6 months), daily vs other comparison
    - _Requirements: 14.1–14.3, 14.5_

- [x] 16. Checkpoint — web frontend complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify auth flow, protected routes, and at least one full CRUD page work against the running backend

- [x] 17. Mobile app scaffold (`mobile-app/`)
  - Create `mobile-app/` with `npx create-expo-app mobile-app --template blank`
  - Install: `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/stack`, `expo-secure-store`, `axios`
  - Create `mobile-app/app.config.js` with `EXPO_PUBLIC_API_URL` env var
  - _Requirements: 20.2, 20.6_

- [ ] 18. Mobile contexts, API service, and navigation
  - [x] 18.1 Implement `mobile-app/context/AuthContext.jsx` — same logic as web but uses `expo-secure-store` instead of localStorage — _Requirements: 2.5, 3.2_
  - [x] 18.2 Implement `mobile-app/context/ThemeContext.jsx` — same logic as web but uses `AsyncStorage` — _Requirements: 15.4–15.6_
  - [x] 18.3 Implement `mobile-app/services/api.js` — same Axios setup as web, `baseURL` from `app.config.js` — _Requirements: 18.1_
  - [x] 18.4 Implement `mobile-app/navigation/AppNavigator.jsx` — root Stack: AuthStack (Login, Register) when no token, MainTabs when token present — _Requirements: 3.2, 3.4_
  - [x] 18.5 Implement `mobile-app/navigation/BottomTabNavigator.jsx` — tabs: Home, Expenses, Banks, Transfers, More — _Requirements: 17.1, 17.3, 17.5_
  - [x] 18.6 Implement `mobile-app/navigation/MoreStack.jsx` — stack navigator for More screen linking to Goals, EMI, SIP, Notes, Analytics — _Requirements: 17.2_

- [x] 19. Mobile screens
  - [x] 19.1 Implement auth screens: `LoginScreen.jsx`, `RegisterScreen.jsx` — mirror web auth pages using React Native components — _Requirements: 2.1–2.5_
  - [x] 19.2 Implement `HomeScreen.jsx` — same data as web Dashboard via `GET /api/analytics/summary` — _Requirements: 13.4, 13.5_
  - [x] 19.3 Implement `BanksScreen.jsx`, `ExpensesScreen.jsx`, `TransfersScreen.jsx` — mirror web pages — _Requirements: 5.7, 6.7, 7.5, 8.6_
  - [x] 19.4 Implement `GoalsScreen.jsx`, `EMIScreen.jsx`, `SIPScreen.jsx`, `NotesScreen.jsx` — mirror web pages — _Requirements: 9.5, 10.4, 11.4, 12.4, 12.6_
  - [x] 19.5 Implement `AnalyticsScreen.jsx` — same charts as web using `react-native-chart-kit` or `victory-native` — _Requirements: 14.4_
  - [x] 19.6 Implement `MoreScreen.jsx` — links to Goals/EMI/SIP/Notes/Analytics; Logout clears token and navigates to login — _Requirements: 17.2, 17.4_

- [x] 20. Deployment configuration
  - Create `client-web/vercel.json` with SPA rewrite rule (`"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]`)
  - Create `server/Procfile` with `web: node server.js`
  - Create root `.gitignore` covering `node_modules`, `.env`, `server/uploads/`, `dist/`
  - Create `client-web/.env.example` and `server/.env.example` with placeholder keys
  - _Requirements: 20.1–20.6_

- [x] 21. Final checkpoint — full platform integration
  - Ensure all tests pass, ask the user if questions arise.
  - Verify end-to-end: register → login → create bank → create expense → check dashboard summary → analytics → logout

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` with `mongodb-memory-server` (no Atlas connection needed for tests)
- The existing `src/` directory is the legacy single-page app; `client-web/` is the new web frontend
- Balance mutations (expenses, transfers, EMI/SIP payments) use `findByIdAndUpdate` for atomicity within a single request
