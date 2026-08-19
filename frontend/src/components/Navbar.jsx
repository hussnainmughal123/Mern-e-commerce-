import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import NotificationBell from './NotificationBell';

const Navbar = ({ theme, onToggleTheme, isLoggedIn, onLogout }) => {
  const navigate = useNavigate();
  const cart = useCart();
  const wishlist = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    setIsMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand">
          <span className="brand-badge">SD</span>
          <span>ShopDash</span>
        </div>

        <button
          type="button"
          className={`nav-hamburger ${isMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`navbar-right ${isMenuOpen ? 'open' : ''}`}>
          <nav className="nav-links">
            <NavLink to="/" end onClick={closeMenu} className={({ isActive }) => (isActive ? 'active' : '')}>
              Shop
            </NavLink>
            <NavLink to="/admin" onClick={closeMenu} className={({ isActive }) => (isActive ? 'active' : '')}>
              Admin Dashboard
            </NavLink>
            <NavLink to="/admin/orders" onClick={closeMenu} className={({ isActive }) => (isActive ? 'active' : '')}>
              Manage Orders
            </NavLink>
            <NavLink to="/admin/analytics" onClick={closeMenu} className={({ isActive }) => (isActive ? 'active' : '')}>
              Analytics
            </NavLink>
            <NavLink to="/admin/coupons" onClick={closeMenu} className={({ isActive }) => (isActive ? 'active' : '')}>
              Coupons
            </NavLink>
            {isLoggedIn && (
              <>
                <NavLink to="/wishlist" onClick={closeMenu} className={({ isActive }) => (isActive ? 'active' : '')}>
                  Wishlist{wishlist.items.length > 0 ? ` (${wishlist.items.length})` : ''}
                </NavLink>
                <NavLink to="/cart" onClick={closeMenu} className={({ isActive }) => (isActive ? 'active' : '')}>
                  Cart{cart.itemCount > 0 ? ` (${cart.itemCount})` : ''}
                </NavLink>
                <NavLink to="/orders" onClick={closeMenu} className={({ isActive }) => (isActive ? 'active' : '')}>
                  Orders
                </NavLink>
                <NavLink to="/profile" onClick={closeMenu} className={({ isActive }) => (isActive ? 'active' : '')}>
                  Profile
                </NavLink>
              </>
            )}
            {!isLoggedIn && (
              <>
                <NavLink to="/login" onClick={closeMenu} className={({ isActive }) => (isActive ? 'active' : '')}>
                  Login
                </NavLink>
                <NavLink to="/signup" onClick={closeMenu} className={({ isActive }) => (isActive ? 'active' : '')}>
                  Sign Up
                </NavLink>
              </>
            )}
          </nav>
          <div className="navbar-actions">
            <NotificationBell isLoggedIn={isLoggedIn} />
            {isLoggedIn && (
              <button type="button" className="btn btn-secondary btn-small" onClick={handleLogout}>
                Logout
              </button>
            )}
            <button
              type="button"
              className="theme-toggle"
              onClick={onToggleTheme}
              aria-label="Toggle dark mode"
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
