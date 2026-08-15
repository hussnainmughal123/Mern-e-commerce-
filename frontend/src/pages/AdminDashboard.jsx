import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  getStats,
} from '../api/api';
import StatsCards from '../components/StatsCards';
import ProductTable from '../components/ProductTable';
import ProductForm from '../components/ProductForm';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const LOW_STOCK_THRESHOLD = 5;

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

  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [confirmingBulkDelete, setConfirmingBulkDelete] = useState(false);

  const [toast, setToast] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [productData, statsData] = await Promise.all([
        getProducts({ limit: 1000 }),
        getStats(),
      ]);
      setProducts(productData.products);
      setStats(statsData);
      setSelectedIds([]);
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

  const lowStockProducts = useMemo(
    () => products.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD),
    [products]
  );

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

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = (checked) => {
    setSelectedIds(checked ? products.map((p) => p._id) : []);
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      await bulkDeleteProducts(selectedIds);
      setToast(`${selectedIds.length} product(s) deleted.`);
      setConfirmingBulkDelete(false);
      await loadData();
    } catch (err) {
      setError(err.message);
      setConfirmingBulkDelete(false);
    } finally {
      setBulkDeleting(false);
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

          {lowStockProducts.length > 0 && (
            <div
              style={{
                background: 'rgba(245, 166, 35, 0.12)',
                border: '1px solid #f5a623',
                borderRadius: 10,
                padding: '12px 16px',
                margin: '16px 0',
              }}
            >
              <strong>⚠️ Low Stock Alert:</strong> {lowStockProducts.length} product
              {lowStockProducts.length !== 1 ? 's are' : ' is'} running low (≤ {LOW_STOCK_THRESHOLD} units) —{' '}
              {lowStockProducts.map((p) => p.name).join(', ')}
            </div>
          )}

          <div
            className="section-title"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}
          >
            <h2>All Products</h2>
            {selectedIds.length > 0 && (
              <button
                className="btn btn-danger btn-small"
                onClick={() => setConfirmingBulkDelete(true)}
                disabled={bulkDeleting}
              >
                Delete Selected ({selectedIds.length})
              </button>
            )}
          </div>
          <ProductTable
            products={products}
            onEdit={openEditForm}
            onDelete={setDeleteTarget}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
          />
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

      {confirmingBulkDelete && (
        <Modal title="Delete Selected Products" onClose={() => setConfirmingBulkDelete(false)}>
          <p>
            Are you sure you want to delete <strong>{selectedIds.length}</strong> selected product(s)?
            This action cannot be undone.
          </p>
          <div className="form-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setConfirmingBulkDelete(false)}
              disabled={bulkDeleting}
            >
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleBulkDelete} disabled={bulkDeleting}>
              {bulkDeleting ? 'Deleting...' : 'Delete All Selected'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminDashboard;
