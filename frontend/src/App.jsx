import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import PublicProducts from './pages/PublicProducts';
import AdminDashboard from './pages/AdminDashboard';
import Signup from './pages/Signup';
import Login from './pages/Login';

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
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/signup" element={<Signup onAuthSuccess={() => setIsLoggedIn(true)} />} />
          <Route path="/login" element={<Login onAuthSuccess={() => setIsLoggedIn(true)} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
