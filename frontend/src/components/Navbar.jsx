import { NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = ({ theme, onToggleTheme, isLoggedIn, onLogout }) => {
  const navigate = useNavigate();
  const cart = useCart();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand">
          <span className="brand-badge">SD</span>
          <span>ShopDash</span>
        </div>
        <div className="navbar-right">
          <nav className="nav-links">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
              Shop
            </NavLink>
            <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : '')}>
              Admin Dashboard
            </NavLink>
            {isLoggedIn && (
              <>
                <NavLink to="/cart" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Cart{cart.itemCount > 0 ? ` (${cart.itemCount})` : ''}
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Profile
                </NavLink>
              </>
            )}
            {!isLoggedIn && (
              <>
                <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Login
                </NavLink>
                <NavLink to="/signup" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Sign Up
                </NavLink>
              </>
            )}
          </nav>
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
    </header>
  );
};

export default Navbar;
