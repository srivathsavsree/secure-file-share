const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');
const { generateToken } = require('../utils/encryption');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    console.log('=== REGISTRATION ATTEMPT ===');
    console.log('Request body:', { ...req.body, password: '[HIDDEN]' });
    
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      console.log('Password too short');
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate verification token
    const verificationToken = generateToken();
    console.log('Generated verification token');

    // Create user - password will be hashed by pre-save middleware
    user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password, // This will be hashed by the pre-save hook
      verificationToken,
      isVerified: false
    });

    console.log('Created user object, saving to database...');
    await user.save();
    console.log('User saved successfully with ID:', user._id);

    // Send verification email
    console.log('Sending verification email...');
    const emailResult = await sendVerificationEmail(user.email, user.name, verificationToken);
    
    if (emailResult.success) {
      console.log('Verification email sent successfully');
    } else {
      console.error('Failed to send verification email:', emailResult.error);
      // Don't fail registration if email fails
    }

    // Generate JWT token
    const payload = {
      user: {
        id: user.id
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    console.log('Registration successful for user:', user.email);
    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      },
      emailSent: emailResult.success
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error during registration', 
      error: error.message 
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Request body:', { ...req.body, password: '[HIDDEN]' });
    
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user
    console.log('Looking for user with email:', email);
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', {
      id: user._id,
      email: user.email,
      isVerified: user.isVerified,
      hasPassword: !!user.password,
      passwordLength: user.password?.length
    });

    // Check password
    console.log('Comparing passwords...');
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      console.log('Password comparison failed for user:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Password comparison successful');

    // Check if email is verified
    if (!user.isVerified) {
      console.log('User email not verified:', email);
      return res.status(400).json({ 
        message: 'Please verify your email before logging in',
        needsVerification: true
      });
    }

    // Generate JWT token
    const payload = {
      user: {
        id: user.id
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    console.log('Login successful for user:', user.email);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login', 
      error: error.message 
    });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify user email
// @access  Public
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    // Find user with verification token
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Update user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    console.log('Email verified for user:', user.email);

    res.json({
      message: 'Email verified successfully! You can now log in.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during email verification' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists or not
      return res.json({ message: 'If an account with that email exists, we have sent a password reset link.' });
    }

    // Generate reset token
    const resetToken = generateToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // Send reset email
    const emailResult = await sendPasswordResetEmail(user.email, user.name, resetToken);

    console.log('Password reset email sent to:', user.email);

    res.json({
      message: 'If an account with that email exists, we have sent a password reset link.',
      emailSent: emailResult.success
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log('Password reset successful for user:', user.email);

    res.json({ message: 'Password reset successful! You can now log in with your new password.' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        isVerified: req.user.isVerified,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error getting user info' });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend verification email
// @access  Public
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = generateToken();
    user.verificationToken = verificationToken;
    await user.save();

    // Send verification email
    const emailResult = await sendVerificationEmail(user.email, user.name, verificationToken);

    res.json({
      message: 'Verification email sent successfully',
      emailSent: emailResult.success
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error resending verification email' });
  }
});

module.exports = router;
