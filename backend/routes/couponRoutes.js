const express = require('express');
const router = express.Router();
const {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/couponController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

router.post('/validate', validateCoupon);
router.route('/').get(adminOnly, getAllCoupons).post(adminOnly, createCoupon);
router.route('/:id').put(adminOnly, updateCoupon).delete(adminOnly, deleteCoupon);

module.exports = router;
