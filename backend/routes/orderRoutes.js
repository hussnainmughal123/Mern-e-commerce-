const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

// Specific routes must come before /:id to avoid route collisions
router.get('/my', getMyOrders);
router.route('/').get(adminOnly, getAllOrders).post(createOrder);
router.put('/:id/status', adminOnly, updateOrderStatus);
router.get('/:id', getOrder);

module.exports = router;
