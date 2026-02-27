// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Import your authentication routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// ------------------- TEST ROUTE -------------------
app.get('/test', async (req, res) => {
    res.send('Backend and MongoDB are working!');
});

const User = require('./models/User'); // Make sure your User model exists

// Test MongoDB insert & fetch
app.get('/test-db', async (req, res) => {
  try {
    const dummyUser = new User({ name: 'Test User', email: 'testuser@example.com', password: '123456' });
    await dummyUser.save();
    const users = await User.find();
    res.json({ message: 'User inserted and fetched successfully', users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// --------------------------------------------------

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));