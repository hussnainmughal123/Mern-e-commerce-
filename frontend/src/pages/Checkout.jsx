import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../api/orderApi';
import { validateCoupon } from '../api/couponApi';
import ErrorMessage from '../components/ErrorMessage';

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
    <div className="page-container">
      <div className="page-header">
        <h1>Checkout</h1>
        <p className="page-subtitle">Enter your shipping details to place your order.</p>
      </div>

      {apiError && <ErrorMessage message={apiError} />}

      <div className="details-grid">
        <form className="product-form" onSubmit={handlePlaceOrder} noValidate>
          <div className="form-group">
            <label htmlFor="fullName">Full Name *</label>
            <input
              id="fullName"
              type="text"
              value={address.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              className={errors.fullName ? 'input-error' : ''}
            />
            {errors.fullName && <span className="field-error">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="addressLine1">Address Line 1 *</label>
            <input
              id="addressLine1"
              type="text"
              value={address.addressLine1}
              onChange={(e) => handleChange('addressLine1', e.target.value)}
              className={errors.addressLine1 ? 'input-error' : ''}
            />
            {errors.addressLine1 && <span className="field-error">{errors.addressLine1}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="addressLine2">Address Line 2 (optional)</label>
            <input
              id="addressLine2"
              type="text"
              value={address.addressLine2}
              onChange={(e) => handleChange('addressLine2', e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input
                id="city"
                type="text"
                value={address.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className={errors.city ? 'input-error' : ''}
              />
              {errors.city && <span className="field-error">{errors.city}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="state">State / Province *</label>
              <input
                id="state"
                type="text"
                value={address.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className={errors.state ? 'input-error' : ''}
              />
              {errors.state && <span className="field-error">{errors.state}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="postalCode">Postal Code *</label>
              <input
                id="postalCode"
                type="text"
                value={address.postalCode}
                onChange={(e) => handleChange('postalCode', e.target.value)}
                className={errors.postalCode ? 'input-error' : ''}
              />
              {errors.postalCode && <span className="field-error">{errors.postalCode}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="country">Country *</label>
              <input
                id="country"
                type="text"
                value={address.country}
                onChange={(e) => handleChange('country', e.target.value)}
                className={errors.country ? 'input-error' : ''}
              />
              {errors.country && <span className="field-error">{errors.country}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              id="phone"
              type="tel"
              value={address.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={errors.phone ? 'input-error' : ''}
            />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
              Payment Method: <strong>Cash on Delivery</strong>
            </p>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Placing Order...' : `Place Order — $${total.toFixed(2)}`}
            </button>
          </div>
        </form>

        <div className="details-info">
          <h2 style={{ marginTop: 0 }}>Order Summary</h2>
          {items.map((item) => (
            <div
              key={item.product._id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <span>
                {item.product.name} × {item.quantity}
              </span>
              <span>${(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}

          <div style={{ marginTop: 16 }}>
            {!appliedCoupon ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon}
                >
                  {applyingCoupon ? 'Checking...' : 'Apply'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-primary)' }}>
                  ✓ Coupon <strong>{appliedCoupon.code}</strong> applied
                </span>
                <button type="button" className="btn btn-secondary btn-small" onClick={handleRemoveCoupon}>
                  Remove
                </button>
              </div>
            )}
            {couponError && <span className="field-error">{couponError}</span>}
          </div>

          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-primary)' }}>
                <span>Discount</span>
                <span>−${discount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
              <strong>Total</strong>
              <strong>${total.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
