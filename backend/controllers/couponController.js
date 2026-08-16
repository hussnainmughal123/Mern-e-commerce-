const Coupon = require('../models/Coupon');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { validateCouponForOrder } = require('../utils/validateCoupon');

// @desc    Check a coupon code against an order amount (live preview at checkout)
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;

  if (orderAmount === undefined) {
    throw new ApiError(400, 'orderAmount is required');
  }

  const { coupon, discountAmount } = await validateCouponForOrder(code, Number(orderAmount));

  res.status(200).json({
    success: true,
    data: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
    },
  });
});

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Admin
const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: coupons });
});

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Admin
const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountType, discountValue, minOrderAmount, expiryDate, usageLimit } = req.body;

  const existing = await Coupon.findOne({ code: (code || '').trim().toUpperCase() });
  if (existing) {
    throw new ApiError(400, 'A coupon with this code already exists');
  }

  const coupon = await Coupon.create({
    code,
    discountType,
    discountValue,
    minOrderAmount: minOrderAmount || 0,
    expiryDate,
    usageLimit: usageLimit || null,
  });

  res.status(201).json({ success: true, data: coupon });
});

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Admin
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!coupon) {
    throw new ApiError(404, 'Coupon not found');
  }

  res.status(200).json({ success: true, data: coupon });
});

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Admin
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);

  if (!coupon) {
    throw new ApiError(404, 'Coupon not found');
  }

  res.status(200).json({ success: true, data: {} });
});

module.exports = { validateCoupon, getAllCoupons, createCoupon, updateCoupon, deleteCoupon };
