const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../utils/emailService');

// @route   GET api/auth/test
// @desc    Test route
// @access  Public
router.get('/test', (req, res) => {
    res.json({ message: 'Auth route is working' });
});

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate key pair for file encryption
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        });

        // Create new user
        user = new User({
            name,
            email,
            password,
            publicKey,
            privateKey
        });

        console.log(`Registering user: ${email}`);
        console.log(`Plain password length: ${password.length}`);

        // No manual hash here; pre-save hook will hash password
        await user.save();

        console.log(`User saved with hashed password: ${user.password.substring(0, 20)}...`);

        // Create and return JWT token
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
            console.log(`Login attempt failed: User not found for email: ${email}`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        console.log(`Login attempt for user: ${email}`);
        console.log(`User found: ${user._id}`);
        console.log(`Password hash in DB: ${user.password.substring(0, 20)}...`);

        // Check if account is locked
        if (user.isLocked) {
            console.log(`Login failed: Account locked for ${email}`);
            return res.status(403).json({ message: 'Account is locked. Please contact support.' });
        }

        // Verify password
        console.log(`Attempting password comparison for ${email}`);
        const isMatch = await user.comparePassword(password);
        console.log(`Password comparison result: ${isMatch}`);
        
        if (!isMatch) {
            user.failedAttempts += 1;
            if (user.failedAttempts >= 100) {
                user.isLocked = true;
            }
            await user.save();

            if (user.isLocked) {
                return res.status(403).json({ message: 'Account has been locked due to too many failed attempts' });
            }
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Reset failed attempts on successful login
        user.failedAttempts = 0;
        user.lastLogin = new Date();
        await user.save();

        // Create and return JWT token
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/auth/user
// @desc    Get authenticated user
// @access  Private
router.get('/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -privateKey');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'No account with that email found.' });
        }
        // Generate token
        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();
        // Send email
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
        await sendPasswordResetEmail(user.email, resetUrl);
        res.json({ message: 'Password reset email sent.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST api/auth/reset-password/:token
// @desc    Reset password using token
// @access  Public
router.post('/reset-password/:token', async (req, res) => {
    const { password } = req.body;
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.json({ message: 'Password has been reset. You can now log in.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 
