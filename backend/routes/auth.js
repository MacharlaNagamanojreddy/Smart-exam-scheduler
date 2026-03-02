const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const getJwtSecret = () => process.env.JWT_SECRET || 'dev-jwt-secret-change-me';
const getJwtExpiresIn = () => process.env.JWT_EXPIRES_IN || '7d';

const buildAuthResponse = (user) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    getJwtSecret(),
    { expiresIn: getJwtExpiresIn() }
  );

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

router.get('/bootstrap', async (req, res) => {
  try {
    const adminCount = await User.countDocuments();
    res.json({ requiresSetup: adminCount === 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register first admin user (one-time bootstrap).
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const adminCount = await User.countDocuments();
    if (adminCount > 0) {
      return res.status(403).json({ error: 'Admin user already exists. Please login.' });
    }

    const existingUser = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const user = await User.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      password: String(password)
    });

    res.status(201).json(buildAuthResponse(user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await user.matchPassword(String(password));
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json(buildAuthResponse(user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', protect, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;
