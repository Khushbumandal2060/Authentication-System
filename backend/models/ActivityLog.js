// backend/models/ActivityLog.js
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  email: { 
    type: String 
  },
  action: { 
    type: String, 
    required: true 
  }, // e.g., 'REGISTER', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'VERIFY_OTP_SUCCESS', 'PASSWORD_RESET_SUCCESS', 'SESSION_REVOKED'
  userAgent: { 
    type: String 
  },
  ipAddress: { 
    type: String 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
