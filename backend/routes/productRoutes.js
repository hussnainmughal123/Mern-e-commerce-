const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getStats,
  getCategories,
} = require('../controllers/productController');

// Specific routes must come before /:id to avoid route collisions
router.get('/stats/summary', getStats);
router.get('/categories/list', getCategories);

router.route('/').get(getProducts).post(createProduct);

router.route('/:id').get(getProduct).put(updateProduct).delete(deleteProduct);

module.exports = router;
