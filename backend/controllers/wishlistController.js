const User = require('../models/User');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Get the logged-in user's wishlist (populated with product info)
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    'wishlist',
    'name price imageUrl stock category brand'
  );

  res.status(200).json({ success: true, data: user.wishlist });
});

// @desc    Add a product to the wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const user = await User.findById(req.user._id);
  const alreadyExists = user.wishlist.some((id) => id.toString() === productId);

  if (!alreadyExists) {
    user.wishlist.push(productId);
    await user.save();
  }

  await user.populate('wishlist', 'name price imageUrl stock category brand');

  res.status(200).json({ success: true, data: user.wishlist });
});

// @desc    Remove a product from the wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const user = await User.findById(req.user._id);
  user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
  await user.save();

  await user.populate('wishlist', 'name price imageUrl stock category brand');

  res.status(200).json({ success: true, data: user.wishlist });
});

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
