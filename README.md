# MoneyFlowX

Full-stack fintech finance management platform — React web app + React Native mobile app sharing a single Node.js/Express backend and MongoDB Atlas database.

---

## Project Structure

```
MoneyFlow/
├── server/          # Node.js + Express backend
├── client-web/      # React + Vite web frontend
├── mobile-app/      # React Native Expo mobile app
└── src/             # Legacy single-page app (superseded by client-web/)
```

---

## Setup

### 1. Backend

```bash
cd server
npm install
```

Edit `server/.env`:
```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/moneyflowx
JWT_SECRET=your_super_secret_key_here
```

Start the server:
```bash
npm run dev
```

Server runs at `http://localhost:5000`

---

### 2. Web App

```bash
cd client-web
npm install
npm run dev
```

Web app runs at `http://localhost:5173`

For production build:
```bash
npm run build
```

Deploy the `dist/` folder to Vercel. Set `VITE_API_URL` to your deployed backend URL.

---

### 3. Mobile App

```bash
cd mobile-app
npm install
npx expo start
```

- Scan the QR code with **Expo Go** on your phone
- Or press `a` for Android emulator / `i` for iOS simulator

Edit `mobile-app/.env`:
```
EXPO_PUBLIC_API_URL=http://<your-local-ip>:5000
```

> Use your machine's local IP (not localhost) so the phone can reach the backend.

---

## Deployment

| Component  | Platform        |
|------------|-----------------|
| Backend    | Render / Railway |
| Web App    | Vercel          |
| Mobile App | Expo Go / EAS   |
| Database   | MongoDB Atlas   |

---

## Tech Stack

- **Backend**: Node.js, Express, Mongoose, JWT, bcryptjs, Multer
- **Web**: React, Vite, React Router DOM, Axios, Recharts
- **Mobile**: React Native, Expo, React Navigation, expo-secure-store
- **Database**: MongoDB Atlas
