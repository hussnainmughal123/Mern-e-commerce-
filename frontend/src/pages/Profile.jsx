import { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../api/authApi';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const Profile = () => {
  const [form, setForm] = useState({ name: '', email: '' });
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProfile();
      setForm({ name: data.name, email: data.email });
      setRole(data.role);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Enter a valid email address';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const data = await updateProfile({ name: form.name, email: form.email });
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...storedUser, name: data.name, email: data.email }));
      setSuccessMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 420 }}>
      <div className="page-header">
        <h1>My Profile</h1>
        <p className="page-subtitle">View and update your account details.</p>
      </div>

      {loading && <Loader label="Loading profile..." />}
      {!loading && error && <ErrorMessage message={error} onRetry={loadProfile} />}

      {!loading && !error && (
        <>
          {successMessage && <div className="toast">{successMessage}</div>}

          <form className="product-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Account Type</label>
              <p style={{ margin: 0, textTransform: 'capitalize' }}>{role}</p>
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default Profile;
