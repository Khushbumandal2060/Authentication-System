const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getCachedUser, cacheUser } = require('../utils/cache');

const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-me';

const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header (Bearer <token>)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, jwtSecret);

      // Try fetching user from cache
      let user = getCachedUser(decoded.id);

      if (!user) {
        // Cache miss: fetch from MongoDB and exclude the password field
        user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
          return res.status(401).json({ message: 'Not authorized, user not found' });
        }
        
        // Cache the retrieved user profile
        cacheUser(decoded.id, user);
      }

      // Attach user to the request object
      req.user = user;
      next();
    } catch (err) {
      console.error('Token verification error:', err.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
