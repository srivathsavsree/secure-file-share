const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Register a new user
// POST /api/users/register
router.post('/register', userController.registerUser);

// Login user
// POST /api/users/login
router.post('/login', userController.loginUser);

// Get current user
// GET /api/users/me
router.get('/me', auth, userController.getCurrentUser);

module.exports = router;