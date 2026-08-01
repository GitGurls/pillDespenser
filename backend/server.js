require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/device', deviceRoutes);
app.use('/api/reports', reportRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// In development, run the React app separately with `npm run dev` inside
// /frontend (Vite dev server on port 5173, proxying /api to this server).
//
// In production, build the frontend first (`npm run build` inside
// /frontend) and this server will serve the built files directly.
const distPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(distPath));
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) res.status(404).send('Frontend not built yet — run "npm run build" inside /frontend, or use the Vite dev server on port 5173 during development.');
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
