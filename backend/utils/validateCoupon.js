const Coupon = require('../models/Coupon');
const ApiError = require('./ApiError');

// Validates a coupon code against an order amount and returns the coupon
// document plus the computed discount. Throws ApiError on any failure so
// callers can surface a clear message without duplicating checks.
const validateCouponForOrder = async (code, orderAmount) => {
  if (!code) {
    throw new ApiError(400, 'Coupon code is required');
  }

  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });

  if (!coupon) {
    throw new ApiError(404, 'Invalid coupon code');
  }
  if (!coupon.isActive) {
    throw new ApiError(400, 'This coupon is no longer active');
  }
  if (coupon.expiryDate < new Date()) {
    throw new ApiError(400, 'This coupon has expired');
  }
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, 'This coupon has reached its usage limit');
  }
  if (orderAmount < coupon.minOrderAmount) {
    throw new ApiError(400, `This coupon requires a minimum order of $${coupon.minOrderAmount.toFixed(2)}`);
  }

  const discountAmount =
    coupon.discountType === 'percentage'
      ? (orderAmount * coupon.discountValue) / 100
      : Math.min(coupon.discountValue, orderAmount);

  return { coupon, discountAmount: Math.round(discountAmount * 100) / 100 };
};

module.exports = { validateCouponForOrder };
