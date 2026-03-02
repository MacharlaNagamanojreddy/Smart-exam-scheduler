const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getJwtSecret = () => process.env.JWT_SECRET || 'dev-jwt-secret-change-me';

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const hasBearer = authHeader.startsWith('Bearer ');
    const token = hasBearer ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = {
  protect
};
