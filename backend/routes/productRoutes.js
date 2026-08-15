const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  getStats,
  getCategories,
  getBrands,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

// Specific routes must come before /:id to avoid route collisions
router.get('/stats/summary', protect, adminOnly, getStats);
router.get('/categories/list', getCategories);
router.get('/brands/list', getBrands);
router.delete('/bulk', protect, adminOnly, bulkDeleteProducts);

router.route('/').get(getProducts).post(protect, adminOnly, createProduct);

router
  .route('/:id')
  .get(getProduct)
  .put(protect, adminOnly, updateProduct)
  .delete(protect, adminOnly, deleteProduct);

module.exports = router;
