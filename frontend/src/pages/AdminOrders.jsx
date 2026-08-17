import { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus } from '../api/orderApi';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const FALLBACK_IMG = 'https://via.placeholder.com/50x50.png?text=No+Image';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusColors = {
  pending: 'tag-warning',
  processing: 'tag-warning',
  shipped: 'tag-success',
  delivered: 'tag-success',
  cancelled: 'tag-danger',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const loadOrders = async (filter = statusFilter) => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllOrders(filter);
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (value) => {
    setStatusFilter(value);
    loadOrders(value);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: updated.status } : o)));
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <Loader label="Loading orders..." />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Manage Orders</h1>
        <p className="page-subtitle">View and update the status of all customer orders.</p>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => loadOrders()} />}

      <div className="search-filter" style={{ marginBottom: 20 }}>
        <select
          value={statusFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="category-select"
          aria-label="Filter by order status"
        >
          <option value="All">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {!error && orders.length === 0 ? (
        <p className="empty-state">No orders found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map((order) => (
            <div key={order._id} className="product-card" style={{ padding: 20 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10,
                  cursor: 'pointer',
                }}
                onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
              >
                <div>
                  <strong>Order #{order._id.slice(-8).toUpperCase()}</strong>
                  <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    {order.user?.name || 'Unknown'} ({order.user?.email || 'N/A'}) ·{' '}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <strong>${order.totalAmount.toFixed(2)}</strong>
                  <span className={`tag ${statusColors[order.status] || 'tag-warning'}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              {expandedId === order._id && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
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

                  <p style={{ margin: '0 0 12px', color: 'var(--color-text-muted)' }}>
                    <strong>Shipping to:</strong> {order.shippingAddress.fullName},{' '}
                    {order.shippingAddress.addressLine1}
                    {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''},{' '}
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.postalCode}, {order.shippingAddress.country} · 📞{' '}
                    {order.shippingAddress.phone}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <label htmlFor={`status-${order._id}`} style={{ fontWeight: 600 }}>
                      Update Status:
                    </label>
                    <select
                      id={`status-${order._id}`}
                      value={order.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      disabled={updatingId === order._id}
                      className="category-select"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                    {updatingId === order._id && <span style={{ color: 'var(--color-text-muted)' }}>Saving...</span>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
