const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

module.exports = router;
