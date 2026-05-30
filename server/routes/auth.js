const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const {
  register,
  login,
  getMe,
  updateProfile,
  uploadProfilePicture,
} = require('../controllers/authController');

// @route   POST /api/auth/register
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/me
// @access  Private
router.get('/me', auth, getMe);

// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', auth, updateProfile);

// @route   POST /api/auth/profile/picture
// @access  Private
router.post('/profile/picture', auth, uploadSingle, uploadProfilePicture);

module.exports = router;
