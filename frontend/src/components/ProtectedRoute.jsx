import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isLoggedIn, requireAdmin = false, children }) => {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin) {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (storedUser.role !== 'admin') {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
