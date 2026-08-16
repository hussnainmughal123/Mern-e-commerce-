import { useEffect, useState } from 'react';
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon } from '../api/couponApi';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';

const EMPTY_FORM = {
  code: '',
  discountType: 'percentage',
  discountValue: '',
  minOrderAmount: '',
  expiryDate: '',
  usageLimit: '',
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadCoupons = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllCoupons();
      setCoupons(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(timeout);
  }, [toast]);

  const openAddForm = () => {
    setEditingCoupon(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount || '',
      expiryDate: coupon.expiryDate.slice(0, 10),
      usageLimit: coupon.usageLimit || '',
    });
    setFormError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCoupon(null);
    setFormError('');
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.code.trim()) return setFormError('Coupon code is required.');
    if (!form.discountValue || Number(form.discountValue) <= 0) return setFormError('Enter a valid discount value.');
    if (form.discountType === 'percentage' && Number(form.discountValue) > 100)
      return setFormError('Percentage discount cannot exceed 100.');
    if (!form.expiryDate) return setFormError('Expiry date is required.');

    const payload = {
      code: form.code.trim().toUpperCase(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
      expiryDate: form.expiryDate,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
    };

    setSubmitting(true);
    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon._id, payload);
        setToast('Coupon updated.');
      } else {
        await createCoupon(payload);
        setToast('Coupon created.');
      }
      closeForm();
      await loadCoupons();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCoupon(deleteTarget._id);
      setToast('Coupon deleted.');
      setDeleteTarget(null);
      await loadCoupons();
    } catch (err) {
      setError(err.message);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const isExpired = (date) => new Date(date) < new Date();

  if (loading) {
    return (
      <div className="page-container">
        <Loader label="Loading coupons..." />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header admin-header">
        <div>
          <h1>Manage Coupons</h1>
          <p className="page-subtitle">Create and manage discount codes for your store.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddForm}>
          + Add Coupon
        </button>
      </div>

      {toast && <div className="toast">{toast}</div>}
      {error && <ErrorMessage message={error} onRetry={loadCoupons} />}

      {!error && coupons.length === 0 ? (
        <p className="empty-state">No coupons yet. Click "Add Coupon" to create one.</p>
      ) : (
        <div className="table-wrap">
          <table className="product-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min Order</th>
                <th>Expiry</th>
                <th>Usage</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id}>
                  <td><strong>{c.code}</strong></td>
                  <td>{c.discountType === 'percentage' ? `${c.discountValue}%` : `$${c.discountValue.toFixed(2)}`}</td>
                  <td>${(c.minOrderAmount || 0).toFixed(2)}</td>
                  <td>{new Date(c.expiryDate).toLocaleDateString()}</td>
                  <td>
                    {c.usedCount} / {c.usageLimit || '∞'}
                  </td>
                  <td>
                    {!c.isActive ? (
                      <span className="tag tag-danger">Disabled</span>
                    ) : isExpired(c.expiryDate) ? (
                      <span className="tag tag-danger">Expired</span>
                    ) : (
                      <span className="tag tag-success">Active</span>
                    )}
                  </td>
                  <td className="table-actions">
                    <button className="btn btn-small btn-secondary" onClick={() => openEditForm(c)}>
                      Edit
                    </button>
                    <button className="btn btn-small btn-danger" onClick={() => setDeleteTarget(c)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Modal title={editingCoupon ? 'Edit Coupon' : 'Add New Coupon'} onClose={closeForm}>
          {formError && <ErrorMessage message={formError} />}
          <form className="product-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="code">Coupon Code *</label>
              <input
                id="code"
                type="text"
                placeholder="e.g. SUMMER20"
                value={form.code}
                onChange={(e) => handleFormChange('code', e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="discountType">Discount Type *</label>
                <select
                  id="discountType"
                  value={form.discountType}
                  onChange={(e) => handleFormChange('discountType', e.target.value)}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="discountValue">
                  Discount Value {form.discountType === 'percentage' ? '(%)' : '($)'} *
                </label>
                <input
                  id="discountValue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discountValue}
                  onChange={(e) => handleFormChange('discountValue', e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="minOrderAmount">Minimum Order Amount ($)</label>
                <input
                  id="minOrderAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.minOrderAmount}
                  onChange={(e) => handleFormChange('minOrderAmount', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="usageLimit">Usage Limit (optional)</label>
                <input
                  id="usageLimit"
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={form.usageLimit}
                  onChange={(e) => handleFormChange('usageLimit', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="expiryDate">Expiry Date *</label>
              <input
                id="expiryDate"
                type="date"
                value={form.expiryDate}
                onChange={(e) => handleFormChange('expiryDate', e.target.value)}
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={closeForm} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete Coupon" onClose={() => setDeleteTarget(null)}>
          <p>
            Are you sure you want to delete <strong>{deleteTarget.code}</strong>? This action cannot be undone.
          </p>
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminCoupons;
