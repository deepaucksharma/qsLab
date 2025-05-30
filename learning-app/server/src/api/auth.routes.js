const express = require('express');
const { body, validationResult } = require('express-validator');
const AuthService = require('../auth/AuthService');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('displayName').optional().trim().isLength({ min: 2 }),
  body('organizationSlug').optional().trim(),
  validate
], async (req, res) => {
  try {
    const result = await AuthService.register({
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({
      success: true,
      user: result.user,
      tokens: result.tokens
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate
], async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(
      email, 
      password,
      req.ip,
      req.get('user-agent')
    );

    res.json({
      success: true,
      user: result.user,
      tokens: result.tokens
    });
  } catch (error) {
    res.status(401).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Refresh token
router.post('/refresh', [
  body('refreshToken').notEmpty(),
  validate
], async (req, res) => {
  try {
    const result = await AuthService.refreshToken(req.body.refreshToken);
    
    res.json({
      success: true,
      user: result.user,
      tokens: result.tokens
    });
  } catch (error) {
    res.status(401).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Logout
router.post('/logout', authenticate, async (req, res) => {
  try {
    const token = req.get('authorization')?.replace('Bearer ', '');
    await AuthService.logout(req.user.id, token);
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Logout all devices
router.post('/logout-all', authenticate, async (req, res) => {
  try {
    await AuthService.logoutAllDevices(req.user.id);
    
    res.json({
      success: true,
      message: 'Logged out from all devices'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Request password reset
router.post('/reset-password', [
  body('email').isEmail().normalizeEmail(),
  validate
], async (req, res) => {
  try {
    const result = await AuthService.resetPasswordRequest(req.body.email);
    
    res.json({
      success: true,
      message: result.message,
      // Remove in production
      resetToken: result.resetToken
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Reset password with token
router.post('/reset-password/:token', [
  body('password').isLength({ min: 8 }),
  validate
], async (req, res) => {
  try {
    const result = await AuthService.resetPassword(
      req.params.token,
      req.body.password
    );
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Verify email
router.get('/verify-email/:token', async (req, res) => {
  try {
    const result = await AuthService.verifyEmail(req.params.token);
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await AuthService.getUserWithProfile(req.user.id);
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Validate token
router.get('/validate', authenticate, (req, res) => {
  res.json({
    success: true,
    valid: true,
    user: req.user
  });
});

module.exports = router;