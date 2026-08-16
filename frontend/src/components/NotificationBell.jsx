import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../api/notificationApi';

const NotificationBell = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const loadNotifications = async () => {
    try {
      const data = await getMyNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // Fail silently — notifications are a non-critical enhancement
    }
  };

  useEffect(() => {
    if (isLoggedIn) loadNotifications();
  }, [isLoggedIn]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setOpen((prev) => !prev);
    if (!open) loadNotifications();
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification._id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
        );
      } catch {
        // ignore
      }
    }
    setOpen(false);
    navigate('/orders');
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="theme-toggle"
        onClick={handleToggle}
        aria-label="Notifications"
        style={{ position: 'relative' }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              background: 'var(--color-danger)',
              color: '#fff',
              borderRadius: '50%',
              minWidth: 18,
              height: 18,
              fontSize: '0.7rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 6,
            width: 300,
            maxHeight: 360,
            overflowY: 'auto',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 30,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 12px',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <strong style={{ fontSize: '0.9rem' }}>Notifications</strong>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p style={{ padding: 16, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              No notifications yet.
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                style={{
                  padding: '10px 12px',
                  borderBottom: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  background: n.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.08)',
                }}
              >
                <p style={{ margin: 0, fontSize: '0.85rem' }}>{n.message}</p>
                <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
