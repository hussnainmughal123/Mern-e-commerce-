const Review = require('../models/Review');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// Recomputes and stores a product's averageRating and numReviews
// so the frontend never has to aggregate reviews itself.
const recalculateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const { avgRating = 0, count = 0 } = stats[0] || {};

  await Product.findByIdAndUpdate(productId, {
    averageRating: Math.round(avgRating * 10) / 10,
    numReviews: count,
  });
};

// @desc    Get all reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: reviews });
});

// @desc    Create or update the logged-in user's review for a product
// @route   POST /api/reviews/:productId
// @access  Private
const submitReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const { productId } = req.params;

  if (!rating || rating < 1 || rating > 5) {
    throw new ApiError(400, 'Rating must be between 1 and 5');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const review = await Review.findOneAndUpdate(
    { user: req.user._id, product: productId },
    { rating, comment: comment || '', userName: req.user.name },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  await recalculateProductRating(productId);

  res.status(200).json({ success: true, data: review });
});

// @desc    Delete the logged-in user's own review for a product
// @route   DELETE /api/reviews/:productId
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const review = await Review.findOneAndDelete({ user: req.user._id, product: productId });

  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  await recalculateProductRating(productId);

  res.status(200).json({ success: true, data: {} });
});

module.exports = { getProductReviews, submitReview, deleteReview };
