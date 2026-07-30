import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/authApi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setSubmitting(true);
    try {
      const responseMessage = await forgotPassword(email);
      setMessage(responseMessage || 'If an account with that email exists, a reset link has been sent.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 420 }}>
      <div className="page-header">
        <h1>Forgot password?</h1>
        <p className="page-subtitle">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      {error && (
        <div className="error-box" role="alert">
          <p>⚠ {error}</p>
        </div>
      )}

      {message && <div className="toast">{message}</div>}

      <form className="product-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <p style={{ marginTop: 16, textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Remembered your password? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
