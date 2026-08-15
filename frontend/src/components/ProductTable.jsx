const ProductTable = ({ products, onEdit, onDelete, selectedIds = [], onToggleSelect, onToggleSelectAll }) => {
  if (products.length === 0) {
    return <p className="empty-state">No products yet. Click "Add Product" to create one.</p>;
  }

  const allSelected = products.length > 0 && selectedIds.length === products.length;

  return (
    <div className="table-wrap">
      <table className="product-table">
        <thead>
          <tr>
            {onToggleSelect && (
              <th>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onToggleSelectAll(e.target.checked)}
                  aria-label="Select all products"
                />
              </th>
            )}
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Brand</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              {onToggleSelect && (
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(p._id)}
                    onChange={() => onToggleSelect(p._id)}
                    aria-label={`Select ${p.name}`}
                  />
                </td>
              )}
              <td>
                <img src={p.imageUrl} alt={p.name} className="table-thumb" />
              </td>
              <td className="table-name" title={p.name}>
                {p.name}
              </td>
              <td>{p.category}</td>
              <td>{p.brand || '—'}</td>
              <td>${Number(p.price).toFixed(2)}</td>
              <td>
                {p.stock === 0 ? (
                  <span className="tag tag-danger">Out of stock</span>
                ) : p.stock <= 5 ? (
                  <span className="tag tag-warning">{p.stock} (low)</span>
                ) : (
                  <span className="tag tag-success">{p.stock}</span>
                )}
              </td>
              <td>{new Date(p.createdAt).toLocaleDateString()}</td>
              <td className="table-actions">
                <button className="btn btn-small btn-secondary" onClick={() => onEdit(p)}>
                  Edit
                </button>
                <button className="btn btn-small btn-danger" onClick={() => onDelete(p)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
