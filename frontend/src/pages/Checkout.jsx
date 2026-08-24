import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../api/orderApi';
import { validateCoupon } from '../api/couponApi';
import ErrorMessage from '../components/ErrorMessage';

const FALLBACK_IMG = 'https://via.placeholder.com/60x60.png?text=No+Image';

const EMPTY_ADDRESS = {
  fullName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  phone: '',
};

const Checkout = () => {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const items = cart.items.filter((item) => item.product);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = Math.max(subtotal - discount, 0);

  const handleChange = (field, value) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const required = ['fullName', 'addressLine1', 'city', 'state', 'postalCode', 'country', 'phone'];
    const newErrors = {};
    required.forEach((field) => {
      if (!address[field].trim()) newErrors[field] = 'This field is required.';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApplyCoupon = async () => {
    setCouponError('');
    if (!couponInput.trim()) {
      setCouponError('Enter a coupon code.');
      return;
    }
    setApplyingCoupon(true);
    try {
      const result = await validateCoupon(couponInput.trim(), subtotal);
      setAppliedCoupon(result);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err.message);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    if (items.length === 0) {
      setApiError('Your cart is empty.');
      return;
    }

    setSubmitting(true);
    try {
      const order = await createOrder(address, appliedCoupon ? appliedCoupon.code : undefined);
      await refreshCart();
      navigate('/orders', { state: { justPlacedOrderId: order._id } });
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Checkout</h1>
        </div>
        <div className="empty-state">
          <p>Your cart is empty — add some products before checking out.</p>
          <Link to="/" className="btn btn-primary" style={{ display: 'inline-block', marginTop: 12 }}>
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-layout">
        {/* ---------- Left: form sections ---------- */}
        <form className="checkout-main" onSubmit={handlePlaceOrder} noValidate>
          <div className="page-header" style={{ marginBottom: 24 }}>
            <h1>Checkout</h1>
            <p className="page-subtitle">Review your order and enter your shipping details.</p>
          </div>

          {apiError && <ErrorMessage message={apiError} />}

          {/* Delivery / Shipping Address */}
          <section className="checkout-section">
            <h2 className="checkout-section-title">
              <span className="checkout-section-number">1</span> Delivery Address
            </h2>

            <div className="checkout-field">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                placeholder="Full Name *"
                value={address.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className={errors.fullName ? 'input-error' : ''}
              />
              {errors.fullName && <span className="field-error">{errors.fullName}</span>}
            </div>

            <div className="checkout-field">
              <label htmlFor="addressLine1">Address Line 1</label>
              <input
                id="addressLine1"
                type="text"
                placeholder="Street address *"
                value={address.addressLine1}
                onChange={(e) => handleChange('addressLine1', e.target.value)}
                className={errors.addressLine1 ? 'input-error' : ''}
              />
              {errors.addressLine1 && <span className="field-error">{errors.addressLine1}</span>}
            </div>

            <div className="checkout-field">
              <label htmlFor="addressLine2">Address Line 2</label>
              <input
                id="addressLine2"
                type="text"
                placeholder="Apartment, suite, etc. (optional)"
                value={address.addressLine2}
                onChange={(e) => handleChange('addressLine2', e.target.value)}
              />
            </div>

            <div className="checkout-field-row">
              <div className="checkout-field">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  type="text"
                  placeholder="City *"
                  value={address.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className={errors.city ? 'input-error' : ''}
                />
                {errors.city && <span className="field-error">{errors.city}</span>}
              </div>

              <div className="checkout-field">
                <label htmlFor="state">State / Province</label>
                <input
                  id="state"
                  type="text"
                  placeholder="State *"
                  value={address.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className={errors.state ? 'input-error' : ''}
                />
                {errors.state && <span className="field-error">{errors.state}</span>}
              </div>
            </div>

            <div className="checkout-field-row">
              <div className="checkout-field">
                <label htmlFor="postalCode">Postal Code</label>
                <input
                  id="postalCode"
                  type="text"
                  placeholder="Postal code *"
                  value={address.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  className={errors.postalCode ? 'input-error' : ''}
                />
                {errors.postalCode && <span className="field-error">{errors.postalCode}</span>}
              </div>

              <div className="checkout-field">
                <label htmlFor="country">Country</label>
                <input
                  id="country"
                  type="text"
                  placeholder="Country *"
                  value={address.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className={errors.country ? 'input-error' : ''}
                />
                {errors.country && <span className="field-error">{errors.country}</span>}
              </div>
            </div>

            <div className="checkout-field">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                placeholder="Phone number *"
                value={address.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={errors.phone ? 'input-error' : ''}
              />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>
          </section>

          {/* Shipping Method */}
          <section className="checkout-section">
            <h2 className="checkout-section-title">
              <span className="checkout-section-number">2</span> Shipping Method
            </h2>
            <div className="checkout-radio-option checkout-radio-option-selected">
              <span className="checkout-radio-dot" />
              <div style={{ flex: 1 }}>
                <p className="checkout-radio-title">Standard Delivery</p>
                <p className="checkout-radio-subtitle">Delivered within 3–5 business days</p>
              </div>
              <span className="checkout-radio-price">Free</span>
            </div>
          </section>

          {/* Payment */}
          <section className="checkout-section">
            <h2 className="checkout-section-title">
              <span className="checkout-section-number">3</span> Payment
            </h2>
            <div className="checkout-radio-option checkout-radio-option-selected">
              <span className="checkout-radio-dot" />
              <div style={{ flex: 1 }}>
                <p className="checkout-radio-title">Cash on Delivery</p>
                <p className="checkout-radio-subtitle">Pay when your order arrives</p>
              </div>
            </div>
          </section>

          {/* Mobile-only submit (desktop uses the sticky summary button) */}
          <button type="submit" className="btn btn-primary checkout-submit-mobile" disabled={submitting}>
            {submitting ? 'Placing Order...' : `Place Order — $${total.toFixed(2)}`}
          </button>
        </form>

        {/* ---------- Right: sticky order summary ---------- */}
        <aside className="checkout-summary">
          <h2 className="checkout-section-title">Order Summary</h2>

          <div className="checkout-summary-items">
            {items.map((item) => (
              <div key={item._id} className="checkout-summary-item">
                <div className="checkout-summary-thumb-wrap">
                  <img
                    src={item.product.imageUrl || FALLBACK_IMG}
                    alt={item.product.name}
                    className="checkout-summary-thumb"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_IMG;
                    }}
                  />
                  <span className="checkout-summary-qty-badge">{item.quantity}</span>
                </div>
                <div className="checkout-summary-item-info">
                  <p className="checkout-summary-item-name">{item.product.name}</p>
                  {item.selectedVariant && (
                    <p className="checkout-summary-item-variant">{item.selectedVariant}</p>
                  )}
                </div>
                <span className="checkout-summary-item-price">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="checkout-coupon">
            {!appliedCoupon ? (
              <div className="checkout-coupon-input-row">
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon}
                >
                  {applyingCoupon ? '...' : 'Apply'}
                </button>
              </div>
            ) : (
              <div className="checkout-coupon-applied">
                <span>
                  ✓ <strong>{appliedCoupon.code}</strong> applied
                </span>
                <button type="button" className="checkout-coupon-remove" onClick={handleRemoveCoupon}>
                  Remove
                </button>
              </div>
            )}
            {couponError && <span className="field-error">{couponError}</span>}
          </div>

          <div className="checkout-totals">
            <div className="checkout-totals-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="checkout-totals-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            {discount > 0 && (
              <div className="checkout-totals-row checkout-totals-discount">
                <span>Discount</span>
                <span>−${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="checkout-totals-row checkout-totals-grand">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary checkout-submit-desktop"
            disabled={submitting}
            onClick={handlePlaceOrder}
          >
            {submitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
