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
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);
router.post('/profile/picture', auth, uploadSingle, uploadProfilePicture);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
