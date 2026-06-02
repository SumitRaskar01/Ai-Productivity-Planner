require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const authRoutes      = require('./routes/authRoutes');
const planRoutes      = require('./routes/planRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const settingsRoutes  = require('./routes/settingsRoutes');
const aiRoutes        = require('./routes/aiRoutes');

const app = express();

// Manual CORS middleware — works with Express 5
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Routes
app.use('/api/auth',      authRoutes);
app.use('/api/plan',      planRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings',  settingsRoutes);
app.use('/api/ai',        aiRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'AI Productivity Planner API is running' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
