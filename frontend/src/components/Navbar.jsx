import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import NotificationBell from './NotificationBell';

const Navbar = ({ theme, onToggleTheme, isLoggedIn, onLogout }) => {
  const navigate = useNavigate();
  const cart = useCart();
  const wishlist = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand">
          <span className="brand-badge">SD</span>
          <span>ShopDash</span>
        </div>

        <div className="navbar-quick-actions">
          {isLoggedIn && (
            <NavLink to="/cart" className="navbar-cart-link" onClick={closeMenu}>
              🛒{cart.itemCount > 0 ? <span className="navbar-cart-count">{cart.itemCount}</span> : null}
            </NavLink>
          )}

          <button
            type="button"
            className="hamburger-btn"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <div className="navbar-right">
          <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMenu}>
              Shop
            </NavLink>
            <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMenu}>
              Admin Dashboard
            </NavLink>
            <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMenu}>
              Manage Orders
            </NavLink>
            <NavLink to="/admin/analytics" className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMenu}>
              Analytics
            </NavLink>
            <NavLink to="/admin/coupons" className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMenu}>
              Coupons
            </NavLink>
            {isLoggedIn && (
              <>
                <NavLink to="/wishlist" className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMenu}>
                  Wishlist{wishlist.items.length > 0 ? ` (${wishlist.items.length})` : ''}
                </NavLink>
                <NavLink to="/orders" className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMenu}>
                  Orders
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMenu}>
                  Profile
                </NavLink>
              </>
            )}
            {!isLoggedIn && (
              <>
                <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMenu}>
                  Login
                </NavLink>
                <NavLink to="/signup" className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMenu}>
                  Sign Up
                </NavLink>
              </>
            )}

            <div className="nav-links-extra">
              <div className="nav-links-extra-item">
                <NotificationBell isLoggedIn={isLoggedIn} />
                <span>Notifications</span>
              </div>
              <button
                type="button"
                className="theme-toggle nav-links-extra-full"
                onClick={onToggleTheme}
                aria-label="Toggle dark mode"
              >
                {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </button>
              {isLoggedIn && (
                <button
                  type="button"
                  className="btn btn-secondary btn-small nav-links-extra-full"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
