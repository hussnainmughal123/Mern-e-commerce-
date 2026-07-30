import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyEmail } from '../api/authApi';
import Loader from '../components/Loader';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        const successMessage = await verifyEmail(token);
        setMessage(successMessage || 'Email verified successfully.');
        setStatus('success');
      } catch (err) {
        setMessage(err.message);
        setStatus('error');
      }
    };
    run();
  }, [token]);

  return (
    <div className="page-container" style={{ maxWidth: 420 }}>
      <div className="page-header">
        <h1>Email verification</h1>
      </div>

      {status === 'verifying' && <Loader label="Verifying your email..." />}

      {status === 'success' && (
        <>
          <div className="toast">✅ {message}</div>
          <p style={{ marginTop: 16, textAlign: 'center' }}>
            <Link to="/login" className="btn btn-primary" style={{ display: 'inline-block' }}>
              Continue to Login
            </Link>
          </p>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="error-box" role="alert">
            <p>⚠ {message}</p>
          </div>
          <p style={{ marginTop: 16, textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <Link to="/login">Back to login</Link>
          </p>
        </>
      )}
    </div>
  );
};

export default VerifyEmail;
