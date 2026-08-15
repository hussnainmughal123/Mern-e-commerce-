const Order = require('../models/Order');
const Cart = require('../models/Cart');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Create an order from the current cart, then clear the cart
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress } = req.body;

  if (!shippingAddress) {
    throw new ApiError(400, 'Shipping address is required');
  }

  const requiredFields = ['fullName', 'addressLine1', 'city', 'state', 'postalCode', 'country', 'phone'];
  for (const field of requiredFields) {
    if (!shippingAddress[field]) {
      throw new ApiError(400, `Shipping address is missing required field: ${field}`);
    }
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Your cart is empty');
  }

  const orderItems = cart.items
    .filter((item) => item.product) // guard against deleted products
    .map((item) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      imageUrl: item.product.imageUrl,
    }));

  if (orderItems.length === 0) {
    throw new ApiError(400, 'Your cart items are no longer available');
  }

  const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    totalAmount,
  });

  // Empty the cart now that the order has been placed
  cart.items = [];
  await cart.save();

  res.status(201).json({ success: true, data: order });
});

// @desc    Get the logged-in user's order history
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: orders });
});

// @desc    Get a single order by id (must belong to the requesting user, or be an admin)
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to view this order');
  }

  res.status(200).json({ success: true, data: order });
});

// @desc    Get all orders across all customers, optionally filtered by status
// @route   GET /api/orders?status=pending
// @access  Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = {};
  if (status && status !== 'All') {
    query.status = status;
  }

  const orders = await Order.find(query).populate('user', 'name email').sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: orders });
});

// @desc    Update an order's status
// @route   PUT /api/orders/:id/status
// @access  Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    throw new ApiError(400, 'Invalid order status');
  }

  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  res.status(200).json({ success: true, data: order });
});

// @desc    Get sales/order analytics — revenue, order counts by status, last 7 days trend
// @route   GET /api/orders/stats/summary
// @access  Admin
const getOrderStats = asyncHandler(async (req, res) => {
  const allOrders = await Order.find({});

  const totalOrders = allOrders.length;
  const totalRevenue = allOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const ordersByStatus = { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
  allOrders.forEach((o) => {
    if (ordersByStatus[o.status] !== undefined) ordersByStatus[o.status] += 1;
  });

  // Build a revenue/order-count trend for the last 7 days (including days with zero orders)
  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);
    days.push(date);
  }

  const last7Days = days.map((day) => {
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);

    const dayOrders = allOrders.filter(
      (o) => o.createdAt >= day && o.createdAt < nextDay && o.status !== 'cancelled'
    );

    return {
      date: day.toISOString().slice(0, 10),
      revenue: dayOrders.reduce((sum, o) => sum + o.totalAmount, 0),
      orders: dayOrders.length,
    };
  });

  res.status(200).json({
    success: true,
    data: { totalOrders, totalRevenue, ordersByStatus, last7Days },
  });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
};
