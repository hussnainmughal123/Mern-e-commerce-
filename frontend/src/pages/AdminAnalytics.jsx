import { useEffect, useState } from 'react';
import { getOrderStats } from '../api/orderApi';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const statusColors = {
  pending: '#f5a623',
  processing: '#f5a623',
  shipped: '#2fa84f',
  delivered: '#2fa84f',
  cancelled: '#e5484d',
};

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getOrderStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <Loader label="Loading analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <ErrorMessage message={error} onRetry={loadStats} />
      </div>
    );
  }

  if (!stats) return null;

  const maxDayRevenue = Math.max(...stats.last7Days.map((d) => d.revenue), 1);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Sales Analytics</h1>
        <p className="page-subtitle">Revenue and order trends across your store.</p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 16,
          marginBottom: 30,
        }}
      >
        <div className="product-card" style={{ padding: 18 }}>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Total Revenue</p>
          <p style={{ margin: '6px 0 0', fontSize: '1.6rem', fontWeight: 700 }}>
            ${stats.totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="product-card" style={{ padding: 18 }}>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Total Orders</p>
          <p style={{ margin: '6px 0 0', fontSize: '1.6rem', fontWeight: 700 }}>{stats.totalOrders}</p>
        </div>
        <div className="product-card" style={{ padding: 18 }}>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Avg. Order Value</p>
          <p style={{ margin: '6px 0 0', fontSize: '1.6rem', fontWeight: 700 }}>
            ${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
          </p>
        </div>
      </div>

      <div className="section-title">
        <h2>Revenue — Last 7 Days</h2>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 12,
          height: 180,
          padding: '10px 0 0',
          marginBottom: 30,
        }}
      >
        {stats.last7Days.map((day) => (
          <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              ${day.revenue.toFixed(0)}
            </span>
            <div
              style={{
                width: '70%',
                height: `${Math.max((day.revenue / maxDayRevenue) * 130, day.revenue > 0 ? 6 : 2)}px`,
                background: 'var(--color-primary)',
                borderRadius: '6px 6px 0 0',
              }}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
              {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
            </span>
          </div>
        ))}
      </div>

      <div className="section-title">
        <h2>Orders by Status</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Object.entries(stats.ordersByStatus).map(([status, count]) => {
          const total = stats.totalOrders || 1;
          const pct = (count / total) * 100;
          return (
            <div key={status}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: 4 }}>
                <span style={{ textTransform: 'capitalize' }}>{status}</span>
                <span>{count}</span>
              </div>
              <div style={{ background: 'var(--color-border)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: statusColors[status] || 'var(--color-primary)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminAnalytics;
