const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

    // Check if no token
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.user.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid, user not found' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({ message: 'Email not verified. Please verify your email to continue.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Optional auth middleware (doesn't require token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.user.id).select('-password');
      
      if (user && user.isVerified) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

// Admin auth middleware
const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user && req.user.role === 'admin') {
        next();
      } else {
        res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error in admin auth' });
  }
};

module.exports = { auth, optionalAuth, adminAuth };
