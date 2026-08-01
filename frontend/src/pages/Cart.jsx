import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const FALLBACK_IMG = 'https://via.placeholder.com/100x100.png?text=No+Image';

const CartPage = () => {
  const { cart, loading, updateItem, removeItem, clear } = useCart();
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const items = cart.items.filter((item) => item.product);

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleQuantityChange = async (productId, quantity) => {
    if (quantity < 1) return;
    setError('');
    setBusyId(productId);
    try {
      await updateItem(productId, quantity);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (productId) => {
    setError('');
    setBusyId(productId);
    try {
      await removeItem(productId);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleClear = async () => {
    setError('');
    try {
      await clear();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <Loader label="Loading your cart..." />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Your Cart</h1>
        <p className="page-subtitle">Review your items before checking out.</p>
      </div>

      {error && <ErrorMessage message={error} />}

      {items.length === 0 ? (
        <div className="empty-state">
          <p>Your cart is empty.</p>
          <Link to="/" className="btn btn-primary" style={{ display: 'inline-block', marginTop: 12 }}>
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="product-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.product._id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img
                        src={item.product.imageUrl || FALLBACK_IMG}
                        alt={item.product.name}
                        className="table-thumb"
                      />
                      <span>{item.product.name}</span>
                    </td>
                    <td>${item.product.price.toFixed(2)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-small"
                          onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                          disabled={busyId === item.product._id || item.quantity <= 1}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          className="btn btn-secondary btn-small"
                          onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                          disabled={busyId === item.product._id || item.quantity >= item.product.stock}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>${(item.product.price * item.quantity).toFixed(2)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger btn-small"
                        onClick={() => handleRemove(item.product._id)}
                        disabled={busyId === item.product._id}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 24,
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <button type="button" className="btn btn-secondary" onClick={handleClear}>
              Clear Cart
            </button>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 10px' }}>
                Total: ${total.toFixed(2)}
              </p>
              <Link to="/checkout" className="btn btn-primary" style={{ display: 'inline-block' }}>
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
