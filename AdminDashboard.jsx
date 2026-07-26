import { useCallback, useEffect, useState } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getStats,
} from '../api/api';
import StatsCards from '../components/StatsCards';
import ProductTable from '../components/ProductTable';
import ProductForm from '../components/ProductForm';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ totalProducts: 0, totalCategories: 0, outOfStock: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [productData, statsData] = await Promise.all([getProducts(), getStats()]);
      setProducts(productData);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(timeout);
  }, [toast]);

  const openAddForm = () => {
    setEditingProduct(null);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setFormError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormError('');
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setFormError('');
    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, formData);
        setToast('Product updated successfully.');
      } else {
        await createProduct(formData);
        setToast('Product added successfully.');
      }
      closeForm();
      await loadData();
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
      await deleteProduct(deleteTarget._id);
      setToast('Product deleted.');
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      setError(err.message);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="page-subtitle">Manage your product catalog.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddForm}>
          + Add Product
        </button>
      </div>

      {toast && <div className="toast">{toast}</div>}

      {loading && <Loader label="Loading dashboard..." />}
      {!loading && error && <ErrorMessage message={error} onRetry={loadData} />}

      {!loading && !error && (
        <>
          <StatsCards stats={stats} />

          <div className="section-title">
            <h2>All Products</h2>
          </div>
          <ProductTable products={products} onEdit={openEditForm} onDelete={setDeleteTarget} />
        </>
      )}

      {showForm && (
        <Modal title={editingProduct ? 'Edit Product' : 'Add New Product'} onClose={closeForm}>
          {formError && <ErrorMessage message={formError} />}
          <ProductForm
            initialData={editingProduct}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            submitting={submitting}
          />
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete Product" onClose={() => setDeleteTarget(null)}>
          <p>
            Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be
            undone.
          </p>
          <div className="form-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
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

export default AdminDashboard;
