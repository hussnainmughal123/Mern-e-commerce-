import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import PublicProducts from './pages/PublicProducts';
import ProductDetails from './pages/ProductDetails';
import AdminDashboard from './pages/AdminDashboard';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import CartPage from './pages/Cart';
import WishlistPage from './pages/Wishlist';

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem('token')));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  return (
    <CartProvider isLoggedIn={isLoggedIn}>
      <WishlistProvider isLoggedIn={isLoggedIn}>
        <div className="app">
          <Navbar
            theme={theme}
            onToggleTheme={toggleTheme}
            isLoggedIn={isLoggedIn}
            onLogout={handleLogout}
          />
          <main>
            <Routes>
              <Route path="/" element={<PublicProducts />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute isLoggedIn={isLoggedIn} requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute isLoggedIn={isLoggedIn}>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute isLoggedIn={isLoggedIn}>
                    <CartPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute isLoggedIn={isLoggedIn}>
                    <WishlistPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/signup" element={<Signup onAuthSuccess={() => setIsLoggedIn(true)} />} />
              <Route path="/login" element={<Login onAuthSuccess={() => setIsLoggedIn(true)} />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/reset-password/:token"
                element={<ResetPassword onAuthSuccess={() => setIsLoggedIn(true)} />}
              />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
            </Routes>
          </main>
        </div>
      </WishlistProvider>
    </CartProvider>
  );
}

export default App;
