// server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const User = require('./models/User');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
connectDB();

// Auth Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Health Check Route
app.get('/test', (req, res) => {
  res.send('Backend and MongoDB are working!');
});

// Developer/Test helper to query OTP codes from transient cache
const { getOtp } = require('./utils/cache');
app.get('/test-otp/:email/:purpose', (req, res) => {
  const otp = getOtp(req.params.email, req.params.purpose);
  res.json({ email: req.params.email, purpose: req.params.purpose, otp });
});

// View All Users (Read Only)
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      count: users.length,
      users
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get('/delete-test-user', async (req, res) => {
  try {
    const result = await User.deleteOne({
      _id: '6a3bbe5c582fe6ff9345c6aa'
    });

    res.json({
      message: 'Test user deleted',
      result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});