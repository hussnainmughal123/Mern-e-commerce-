const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

const populateCart = (cart) =>
  cart.populate('items.product', 'name price imageUrl stock category variants');

// @desc    Get the logged-in user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  await populateCart(cart);

  res.status(200).json({ success: true, data: cart });
});

// @desc    Add a product to the cart (or increase quantity if the same product + variant already exists)
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, selectedVariant = '' } = req.body;

  if (!productId) {
    throw new ApiError(400, 'productId is required');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const cart = await getOrCreateCart(req.user._id);
  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId && item.selectedVariant === selectedVariant
  );

  if (existingItem) {
    existingItem.quantity += Number(quantity);
  } else {
    cart.items.push({ product: productId, quantity: Number(quantity), selectedVariant });
  }

  await cart.save();
  await populateCart(cart);

  res.status(200).json({ success: true, data: cart });
});

// @desc    Update the quantity of a specific cart item (identified by its own item id)
// @route   PUT /api/cart/:itemId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    throw new ApiError(400, 'Quantity must be at least 1');
  }

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.itemId);

  if (!item) {
    throw new ApiError(404, 'Item not found in cart');
  }

  item.quantity = Number(quantity);
  await cart.save();
  await populateCart(cart);

  res.status(200).json({ success: true, data: cart });
});

// @desc    Remove a single item from the cart (identified by its own item id)
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);

  await cart.save();
  await populateCart(cart);

  res.status(200).json({ success: true, data: cart });
});

// @desc    Clear the entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();

  res.status(200).json({ success: true, data: cart });
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
