import { NavLink } from 'react-router-dom';

const Navbar = ({ theme, onToggleTheme }) => {
  const isLoggedIn = Boolean(localStorage.getItem('token'));

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
            {!isLoggedIn && (
              <NavLink to="/signup" className={({ isActive }) => (isActive ? 'active' : '')}>
                Sign Up
              </NavLink>
            )}
          </nav>
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
