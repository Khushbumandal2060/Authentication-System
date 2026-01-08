const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/authDB';

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      family: 4
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    console.error('Please check your MONGO_URI in backend/.env and make sure MongoDB is running.');
    console.error('The server will keep running, but auth routes that require the database will not work until MongoDB is available.');
  }
};

module.exports = connectDB;