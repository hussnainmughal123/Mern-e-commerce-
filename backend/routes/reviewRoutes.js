const express = require('express');
const router = express.Router();
const { getProductReviews, submitReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/:productId', getProductReviews);
router.post('/:productId', protect, submitReview);
router.delete('/:productId', protect, deleteReview);

module.exports = router;
