import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { getMyOrders } from '../api/orderApi';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const FALLBACK_IMG = 'https://via.placeholder.com/60x60.png?text=No+Image';

const statusColors = {
  pending: 'tag-warning',
  processing: 'tag-warning',
  shipped: 'tag-success',
  delivered: 'tag-success',
  cancelled: 'tag-danger',
};

const OrderHistory = () => {
  const location = useLocation();
  const justPlacedOrderId = location.state?.justPlacedOrderId;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <Loader label="Loading your orders..." />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Your Orders</h1>
        <p className="page-subtitle">Track and review your past purchases.</p>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadOrders} />}

      {justPlacedOrderId && (
        <div className="toast" style={{ marginBottom: 16 }}>
          🎉 Order placed successfully! Thank you for shopping with us.
        </div>
      )}

      {!error && orders.length === 0 ? (
        <div className="empty-state">
          <p>You haven't placed any orders yet.</p>
          <Link to="/" className="btn btn-primary" style={{ display: 'inline-block', marginTop: 12 }}>
            Browse Products
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {orders.map((order) => (
            <div
              key={order._id}
              className={order._id === justPlacedOrderId ? 'product-card' : 'product-card'}
              style={{ padding: 20 }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <div>
                  <strong>Order #{order._id.slice(-8).toUpperCase()}</strong>
                  <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`tag ${statusColors[order.status] || 'tag-warning'}`} style={{ height: 'fit-content' }}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img
                      src={item.imageUrl || FALLBACK_IMG}
                      alt={item.name}
                      className="table-thumb"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = FALLBACK_IMG;
                      }}
                    />
                    <span style={{ flex: 1 }}>
                      {item.name} × {item.quantity}
                      {item.selectedVariant && (
                        <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                          {item.selectedVariant}
                        </span>
                      )}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 16,
                  paddingTop: 12,
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                <span>
                  Shipping to: {order.shippingAddress.city}, {order.shippingAddress.country}
                </span>
                <strong>Total: ${order.totalAmount.toFixed(2)}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
