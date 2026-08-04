import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import Loader from '../components/Loader';

const FALLBACK_IMG = 'https://via.placeholder.com/300x220.png?text=No+Image';

const WishlistPage = () => {
  const { items, loading, removeItem } = useWishlist();

  if (loading) {
    return (
      <div className="page-container">
        <Loader label="Loading your wishlist..." />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Your Wishlist</h1>
        <p className="page-subtitle">Products you've saved for later.</p>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <p>Your wishlist is empty.</p>
          <Link to="/" className="btn btn-primary" style={{ display: 'inline-block', marginTop: 12 }}>
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="product-grid">
          {items.map((product) => (
            <div key={product._id} className="product-card">
              <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="product-card-img">
                  <img
                    src={product.imageUrl || FALLBACK_IMG}
                    alt={product.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_IMG;
                    }}
                  />
                </div>
                <div className="product-card-body">
                  <span className="category-tag">{product.category}</span>
                  <h3 title={product.name}>{product.name}</h3>
                  <div className="product-card-footer">
                    <span className="price">${Number(product.price).toFixed(2)}</span>
                  </div>
                </div>
              </Link>
              <div style={{ padding: '0 16px 16px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  style={{ width: '100%' }}
                  onClick={() => removeItem(product._id)}
                >
                  Remove from Wishlist
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
