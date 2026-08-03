# Smart Medicine Pill Dispenser — Web App (React + Vite)

Web dashboard for the Smart Pill Dispenser IoT project. Talks to an ESP32 hardware
dispenser through Firebase Firestore.

## Stack
- **Frontend**: React + Vite, React Router, Firebase client SDK, Chart.js
- **Backend**: Node.js + Express (verifies Firebase tokens, exposes REST API)
- **Database + Auth**: Firebase (Firestore + Authentication)

## Folder structure
```
smart-pill-dispenser/
├── frontend/                  React + Vite app
│   ├── src/
│   │   ├── pages/              Login, Register, Dashboard, Medicines,
│   │   │                       Schedule, Device, Reports, Notifications, Profile
│   │   ├── components/         Sidebar, ProtectedRoute
│   │   ├── context/             AuthContext (Firebase auth state)
│   │   ├── firebase.js          Firebase client init (reads .env)
│   │   ├── api.js                fetch wrapper, attaches auth token
│   │   ├── App.jsx                routes
│   │   └── styles.css
│   ├── .env                     Firebase web config (already filled in)
│   └── vite.config.js           dev proxy: /api → localhost:5000
│
├── backend/                    Express API (unchanged logic from before)
│   ├── server.js
│   ├── config/firebase.js       Firebase Admin init
│   ├── middleware/authMiddleware.js
│   ├── routes/ + controllers/
│   └── .env.example             copy to .env, fill in Admin SDK credentials
│
└── README.md
```

## Setup

### 1. Backend
```bash
cd backend
cp .env.example .env      # then fill in your Firebase Admin SDK credentials
npm install
npm run dev                # runs on http://localhost:5000
```

### 2. Frontend
The `frontend/.env` file already has your Firebase web config filled in — no
changes needed unless you create a different Firebase project.

```bash
cd frontend
npm install
npm run dev                # runs on http://localhost:5173
```

Open **http://localhost:5173** — this is what you test against during
development. It proxies all `/api/...` calls to the backend on port 5000.

### 3. Try it
- Register a new account → add a medicine → create a schedule
- Check Dashboard, Device, Reports, and the new **Notifications** and
  **Profile** pages

## Production build (optional, for later)
```bash
cd frontend
npm run build              # outputs frontend/dist
cd ../backend
npm start                  # now serves the built frontend + API together
```

## Notes
- `frontend/.env` and `backend/.env` are both git-ignored — don't commit them.
- The backend logic (routes, controllers, Firestore collections) is
  unchanged from the previous vanilla-JS version — only the frontend moved
  to React.
