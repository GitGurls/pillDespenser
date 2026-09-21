

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






