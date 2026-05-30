# Requirements Document

## Introduction

MoneyFlowX is a professional full-stack fintech finance management platform that runs as both a responsive web application and a React Native mobile app, sharing a single Node.js/Express backend and MongoDB Atlas database. It enables users to manage bank accounts, track daily and fixed expenses, monitor EMIs, SIPs, and savings goals, transfer funds between accounts, and visualize financial analytics — all secured with JWT-based authentication.

## Glossary

- **System**: The MoneyFlowX platform as a whole (web + mobile + backend)
- **Web_App**: The React + Vite web frontend served at the web URL
- **Mobile_App**: The React Native Expo mobile application
- **API_Server**: The Node.js + Express.js backend REST API
- **Auth_Service**: The JWT + bcrypt authentication subsystem
- **User**: An authenticated MoneyFlowX account holder
- **Bank**: A user-defined account record representing a real or virtual bank account
- **Expense**: A financial outflow record, either Daily or Other type
- **Daily_Expense**: An expense in categories: Food, Fuel, Tea, Snacks, Transport
- **Other_Expense**: An expense in categories: Rent, Bills, Insurance, Hospital, Shopping, Travel
- **Transfer**: A movement of funds between two of the User's Banks
- **Goal**: A savings target with a target amount and target date
- **EMI**: An equated monthly installment loan tracking record
- **SIP**: A systematic investment plan monthly contribution record
- **Note**: A free-form reminder or financial note record
- **Analytics**: Aggregated financial statistics and chart data
- **JWT**: JSON Web Token used for stateless authentication
- **MongoDB_Atlas**: The cloud-hosted MongoDB database
- **Multer**: The Node.js middleware used for receipt image uploads
- **Dark_Mode**: A UI theme with dark background colors
- **Light_Mode**: A UI theme with light background colors

---

## Requirements

### Requirement 1: User Registration

**User Story:** As a new user, I want to register an account, so that I can securely access MoneyFlowX from any device.

#### Acceptance Criteria

1. THE Auth_Service SHALL accept a registration request containing name, email, and password.
2. WHEN a registration request is received, THE Auth_Service SHALL hash the password using bcrypt before storing it.
3. WHEN a registration request is received with an email that already exists, THE Auth_Service SHALL return a 409 error with a descriptive message.
4. WHEN a valid registration request is received, THE Auth_Service SHALL create a User record in MongoDB_Atlas and return a JWT.
5. THE Auth_Service SHALL enforce a minimum password length of 8 characters.
6. WHEN an invalid or missing field is submitted during registration, THE API_Server SHALL return a 400 error with field-level validation messages.

---

### Requirement 2: User Login and Logout

**User Story:** As a registered user, I want to log in and log out, so that my financial data remains private.

#### Acceptance Criteria

1. WHEN a login request is received with valid email and password, THE Auth_Service SHALL return a signed JWT with a 7-day expiry.
2. WHEN a login request is received with an incorrect password, THE Auth_Service SHALL return a 401 error.
3. WHEN a login request is received for a non-existent email, THE Auth_Service SHALL return a 401 error.
4. WHEN a logout action is triggered, THE Web_App SHALL remove the JWT from local storage and redirect the User to the login page.
5. WHEN a logout action is triggered, THE Mobile_App SHALL remove the JWT from secure storage and navigate the User to the login screen.
6. WHILE a JWT is expired or absent, THE API_Server SHALL return a 401 error for all protected endpoints.

---

### Requirement 3: Protected Routes and Multi-Device Access

**User Story:** As a user, I want my session to persist across devices, so that I can access MoneyFlowX from both web and mobile without re-authenticating frequently.

#### Acceptance Criteria

1. WHILE a valid JWT is present, THE Web_App SHALL allow access to all authenticated pages without redirecting to login.
2. WHILE a valid JWT is present, THE Mobile_App SHALL allow access to all authenticated screens without redirecting to login.
3. WHEN an unauthenticated request reaches a protected route, THE Web_App SHALL redirect the User to the login page.
4. WHEN an unauthenticated request reaches a protected screen, THE Mobile_App SHALL navigate the User to the login screen.
5. THE API_Server SHALL validate the JWT on every protected API request using a middleware function.
6. THE System SHALL support simultaneous authenticated sessions on web and mobile for the same User.

---

### Requirement 4: User Profile Management

**User Story:** As a user, I want to manage my profile, so that the platform reflects my personal financial context.

#### Acceptance Criteria

1. THE System SHALL store the following profile fields per User: name, email, profile picture URL, monthly salary, and preferred currency.
2. WHEN a profile update request is received, THE API_Server SHALL update only the fields provided in the request body.
3. WHEN a profile picture is uploaded, THE API_Server SHALL process the image using Multer and store the file path on the User record.
4. THE Web_App SHALL display the User's name and profile picture in the Topbar profile dropdown.
5. THE Mobile_App SHALL display the User's name and profile picture on the profile screen.
6. WHEN the preferred currency is updated, THE Web_App SHALL display all monetary values using the new currency symbol.
7. WHEN the preferred currency is updated, THE Mobile_App SHALL display all monetary values using the new currency symbol.

---

### Requirement 5: Bank Account Management

**User Story:** As a user, I want to add and manage bank accounts, so that I can track balances across multiple accounts.

#### Acceptance Criteria

1. THE System SHALL support the following Bank purposes: Salary, Daily, Savings, SIP, EMI, Investment.
2. WHEN a Bank creation request is received, THE API_Server SHALL create a Bank record associated with the authenticated User.
3. THE System SHALL store the following fields per Bank: name, purpose, current balance, and User reference.
4. WHEN a Bank update request is received, THE API_Server SHALL update the Bank record and return the updated document.
5. WHEN a Bank deletion request is received, THE API_Server SHALL delete the Bank record and return a 200 confirmation.
6. THE Web_App SHALL display each Bank's name, purpose, and current balance on the Banks page.
7. THE Mobile_App SHALL display each Bank's name, purpose, and current balance on the Banks screen.
8. THE System SHALL track cumulative credit and debit totals per Bank derived from associated Expense and Transfer records.

---

### Requirement 6: Daily Expense Tracking

**User Story:** As a user, I want to log daily expenses, so that I can monitor my day-to-day spending.

#### Acceptance Criteria

1. THE System SHALL classify Daily_Expenses into the following categories: Food, Fuel, Tea, Snacks, Transport.
2. WHEN a Daily_Expense is created, THE API_Server SHALL deduct the expense amount from the associated Bank's balance.
3. THE System SHALL store the following fields per Daily_Expense: type (Daily), category, bank reference, amount, notes, payment method, receipt image path, and date.
4. THE System SHALL support the following payment methods: UPI, Cash, Card, Net Banking.
5. WHEN a receipt image is uploaded with an Expense, THE API_Server SHALL process the image using Multer and store the file path on the Expense record.
6. THE Web_App SHALL display Daily_Expenses separately from Other_Expenses on the Expenses page.
7. THE Mobile_App SHALL display Daily_Expenses on the Expenses screen with category labels.

---

### Requirement 7: Other Expense Tracking

**User Story:** As a user, I want to log fixed and irregular expenses, so that I can track non-daily financial outflows.

#### Acceptance Criteria

1. THE System SHALL classify Other_Expenses into the following categories: Rent, Bills, Insurance, Hospital, Shopping, Travel.
2. WHEN an Other_Expense is created, THE API_Server SHALL deduct the expense amount from the associated Bank's balance.
3. THE System SHALL store the following fields per Other_Expense: type (Other), category, bank reference, amount, notes, payment method, receipt image path, and date.
4. THE Web_App SHALL display Other_Expenses separately from Daily_Expenses on the Expenses page.
5. THE Mobile_App SHALL display Other_Expenses on the Expenses screen with category labels.
6. WHEN an Expense is deleted, THE API_Server SHALL restore the deducted amount to the associated Bank's balance.

---

### Requirement 8: Fund Transfers Between Banks

**User Story:** As a user, I want to transfer money between my bank accounts, so that I can manage fund allocation across accounts.

#### Acceptance Criteria

1. WHEN a Transfer request is received, THE API_Server SHALL deduct the transfer amount from the source Bank's balance.
2. WHEN a Transfer request is received, THE API_Server SHALL add the transfer amount to the destination Bank's balance.
3. THE System SHALL store the following fields per Transfer: source bank reference, destination bank reference, amount, notes, and date.
4. WHEN a Transfer involves a source Bank with insufficient balance, THE API_Server SHALL return a 400 error with a descriptive message.
5. THE Web_App SHALL display Transfer history with source, destination, amount, and date on the Transfers page.
6. THE Mobile_App SHALL display Transfer history on the Transfers screen.
7. WHEN a Transfer is deleted, THE API_Server SHALL reverse the balance changes on both the source and destination Banks.

---

### Requirement 9: Savings Goals

**User Story:** As a user, I want to set savings goals, so that I can track progress toward financial targets.

#### Acceptance Criteria

1. THE System SHALL store the following fields per Goal: name, target amount, current saved amount, target date, and User reference.
2. WHEN a Goal is created, THE API_Server SHALL initialize the current saved amount to zero.
3. WHEN a Goal contribution is recorded, THE API_Server SHALL increment the current saved amount by the contribution value.
4. THE Web_App SHALL display each Goal's name, target amount, current saved amount, and a progress percentage on the Goals page.
5. THE Mobile_App SHALL display Goal progress on the Goals screen.
6. WHEN the current saved amount equals or exceeds the target amount, THE System SHALL mark the Goal as completed.

---

### Requirement 10: EMI Loan Tracking

**User Story:** As a user, I want to track EMI loans, so that I can monitor upcoming due dates and payment history.

#### Acceptance Criteria

1. THE System SHALL store the following fields per EMI: loan name, total loan amount, EMI amount, due date (day of month), start date, end date, associated Bank reference, and User reference.
2. WHEN an EMI payment is recorded, THE API_Server SHALL deduct the EMI amount from the associated Bank's balance and append the payment to the EMI's payment history.
3. THE Web_App SHALL display each EMI's name, monthly amount, next due date, and remaining balance on the EMI page.
4. THE Mobile_App SHALL display EMI records on the EMI screen.
5. THE System SHALL calculate the remaining balance for each EMI as total loan amount minus the sum of all recorded payments.
6. WHEN an EMI's remaining balance reaches zero, THE System SHALL mark the EMI as fully paid.

---

### Requirement 11: SIP Investment Tracking

**User Story:** As a user, I want to track SIP investments, so that I can monitor my monthly investment contributions.

#### Acceptance Criteria

1. THE System SHALL store the following fields per SIP: fund name, monthly investment amount, SIP date (day of month), start date, associated Bank reference, and User reference.
2. WHEN a SIP contribution is recorded, THE API_Server SHALL deduct the SIP amount from the associated Bank's balance and append the contribution to the SIP's history.
3. THE Web_App SHALL display each SIP's fund name, monthly amount, SIP date, and total invested amount on the SIP page.
4. THE Mobile_App SHALL display SIP records on the SIP screen.
5. THE System SHALL calculate the total invested amount per SIP as the sum of all recorded contributions.

---

### Requirement 12: Notes and Reminders

**User Story:** As a user, I want to create financial notes and reminders, so that I can track payment deadlines and important financial events.

#### Acceptance Criteria

1. THE System SHALL store the following fields per Note: title, body text, reminder date, and User reference.
2. WHEN a Note is created, THE API_Server SHALL associate the Note with the authenticated User.
3. THE Web_App SHALL display all Notes on the Notes page with title, body, and reminder date.
4. THE Mobile_App SHALL display all Notes on the Notes screen.
5. WHEN a Note's reminder date matches the current date, THE Web_App SHALL visually highlight the Note as due.
6. WHEN a Note's reminder date matches the current date, THE Mobile_App SHALL visually highlight the Note as due.

---

### Requirement 13: Dashboard Summary

**User Story:** As a user, I want a dashboard overview, so that I can see my complete financial picture at a glance.

#### Acceptance Criteria

1. THE Web_App SHALL display the following summary metrics on the Dashboard: total balance across all Banks, total savings, total daily expenses for today, total other expenses for the current month, and total expenses for the current month.
2. THE Web_App SHALL display a list of the 5 most recent Transactions (Expenses and Transfers combined) on the Dashboard.
3. THE Web_App SHALL display summary cards for active EMIs, SIPs, and Goals on the Dashboard.
4. THE Mobile_App SHALL display the same summary metrics on the Home screen.
5. THE Mobile_App SHALL display the 5 most recent Transactions on the Home screen.
6. WHEN the Dashboard is loaded, THE API_Server SHALL return all required summary data in a single analytics endpoint response.

---

### Requirement 14: Analytics and Charts

**User Story:** As a user, I want visual analytics, so that I can understand my spending patterns and financial trends.

#### Acceptance Criteria

1. THE Web_App SHALL display a pie chart showing expense distribution by category on the Analytics page.
2. THE Web_App SHALL display a bar or line chart showing monthly expense totals for the past 6 months on the Analytics page.
3. THE Web_App SHALL display a breakdown comparing Daily_Expense totals versus Other_Expense totals on the Analytics page.
4. THE Mobile_App SHALL display the same analytics charts on the Analytics screen.
5. WHEN the Analytics page is loaded, THE API_Server SHALL return aggregated expense data grouped by category and by month.
6. THE API_Server SHALL compute analytics data using MongoDB aggregation pipelines scoped to the authenticated User.

---

### Requirement 15: Dark and Light Mode

**User Story:** As a user, I want to toggle between dark and light themes, so that I can use the app comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Web_App SHALL provide a theme toggle control in the Topbar.
2. WHEN the theme toggle is activated, THE Web_App SHALL switch between Dark_Mode and Light_Mode without a page reload.
3. THE Web_App SHALL persist the selected theme in local storage and restore it on next load.
4. THE Mobile_App SHALL provide a theme toggle on the profile or settings screen.
5. WHEN the theme toggle is activated, THE Mobile_App SHALL switch between Dark_Mode and Light_Mode.
6. THE Mobile_App SHALL persist the selected theme in device storage and restore it on next launch.

---

### Requirement 16: Web Navigation Structure

**User Story:** As a web user, I want consistent navigation, so that I can move between sections efficiently.

#### Acceptance Criteria

1. THE Web_App SHALL render a persistent Topbar containing the MoneyFlowX logo, a theme toggle, and a profile dropdown on all authenticated pages.
2. THE Web_App SHALL render a persistent Sidebar containing navigation links to: Dashboard, Banks, Expenses, Transfers, Goals, EMI, SIP, Notes, Analytics, and Logout on all authenticated pages.
3. WHEN a Sidebar navigation link is clicked, THE Web_App SHALL navigate to the corresponding page without a full page reload.
4. WHEN the Logout link is clicked in the Sidebar, THE Web_App SHALL clear the JWT and redirect to the login page.
5. THE Web_App SHALL highlight the active Sidebar link corresponding to the current page.

---

### Requirement 17: Mobile Navigation Structure

**User Story:** As a mobile user, I want intuitive navigation, so that I can access all features from a small screen.

#### Acceptance Criteria

1. THE Mobile_App SHALL render a persistent Bottom Navigation bar containing tabs for: Home, Expenses, Banks, Transfers, and More on all authenticated screens.
2. THE Mobile_App SHALL provide a More screen accessible from the Bottom Navigation containing links to: Goals, EMI, SIP, Notes, Analytics, and Logout.
3. WHEN a Bottom Navigation tab is tapped, THE Mobile_App SHALL navigate to the corresponding screen.
4. WHEN the Logout option is tapped on the More screen, THE Mobile_App SHALL clear the JWT and navigate to the login screen.
5. THE Mobile_App SHALL highlight the active Bottom Navigation tab corresponding to the current screen.

---

### Requirement 18: Backend API Structure

**User Story:** As a developer, I want a well-structured REST API, so that both web and mobile clients can consume the same endpoints.

#### Acceptance Criteria

1. THE API_Server SHALL expose RESTful endpoints grouped under the following route prefixes: /api/auth, /api/banks, /api/expenses, /api/transfers, /api/goals, /api/emi, /api/sip, /api/notes, /api/analytics.
2. THE API_Server SHALL apply CORS middleware to allow requests from the web app origin and Expo development origins.
3. THE API_Server SHALL use environment variables loaded via dotenv for all secrets and configuration values including JWT_SECRET, MONGODB_URI, and PORT.
4. THE API_Server SHALL return all responses in JSON format with consistent status codes.
5. WHEN an unhandled error occurs, THE API_Server SHALL return a 500 error response with a generic message and log the error details server-side.
6. THE API_Server SHALL use Multer middleware on Expense and User profile endpoints to handle multipart/form-data file uploads.

---

### Requirement 19: Data Integrity and Referential Consistency

**User Story:** As a user, I want my financial data to remain consistent, so that balances and totals are always accurate.

#### Acceptance Criteria

1. WHEN an Expense is created, THE API_Server SHALL atomically update the associated Bank's balance in the same operation.
2. WHEN a Transfer is created, THE API_Server SHALL atomically update both the source and destination Bank balances.
3. WHEN an Expense is deleted, THE API_Server SHALL restore the Bank balance by the deleted Expense amount.
4. WHEN a Bank is deleted, THE API_Server SHALL return a 400 error if the Bank has associated Expenses, Transfers, EMIs, or SIPs that would become orphaned.
5. THE API_Server SHALL scope all database queries to the authenticated User's ID to prevent cross-user data access.

---

### Requirement 20: Deployment Configuration

**User Story:** As a developer, I want the project structured for deployment, so that each component can be deployed independently.

#### Acceptance Criteria

1. THE Web_App SHALL be buildable as a static bundle using `vite build` for deployment to Vercel.
2. THE Mobile_App SHALL be buildable using Expo for distribution via Expo Go and app store builds.
3. THE API_Server SHALL include a start script compatible with Render and Railway deployment platforms.
4. THE System SHALL store all environment-specific configuration in .env files excluded from version control via .gitignore.
5. THE Web_App SHALL configure the API base URL via an environment variable so it can point to the deployed backend without code changes.
6. THE Mobile_App SHALL configure the API base URL via an Expo environment variable so it can point to the deployed backend without code changes.

