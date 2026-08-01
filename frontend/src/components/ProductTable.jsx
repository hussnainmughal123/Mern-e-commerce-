const ProductTable = ({ products, onEdit, onDelete }) => {
  if (products.length === 0) {
    return <p className="empty-state">No products yet. Click "Add Product" to create one.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="product-table">
        <thead>
          <tr>
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
