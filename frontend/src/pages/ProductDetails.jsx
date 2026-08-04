import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProduct } from '../api/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const FALLBACK_IMG = 'https://via.placeholder.com/500x400.png?text=No+Image';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const cart = useCart();
  const wishlist = useWishlist();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const [addedMessage, setAddedMessage] = useState('');

  const loadProduct = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProduct(id);
      setProduct(data);
      setQuantity(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isLoggedIn = Boolean(localStorage.getItem('token'));

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    setAdding(true);
    setAddedMessage('');
    try {
      await cart.addItem(product._id, quantity);
      setAddedMessage('Added to cart!');
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    setTogglingWishlist(true);
    try {
      await wishlist.toggleItem(product._id);
    } catch (err) {
      setError(err.message);
    } finally {
      setTogglingWishlist(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <Loader label="Loading product..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <ErrorMessage message={error} onRetry={loadProduct} />
      </div>
    );
  }

  if (!product) return null;

  const outOfStock = product.stock <= 0;
  const wishlisted = wishlist?.isWishlisted(product._id);

  return (
    <div className="page-container">
      <Link to="/" style={{ display: 'inline-block', marginBottom: 20 }}>
        ← Back to Shop
      </Link>

      <div className="details-grid">
        <div className="details-image">
          <img
            src={product.imageUrl || FALLBACK_IMG}
            alt={product.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = FALLBACK_IMG;
            }}
          />
          {outOfStock && <span className="badge badge-danger">Out of stock</span>}
          <button
            type="button"
            className="wishlist-btn"
            onClick={handleToggleWishlist}
            disabled={togglingWishlist}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {wishlisted ? '❤️' : '🤍'}
          </button>
        </div>

        <div className="details-info">
          <span className="category-tag">{product.category}</span>
          <h1 style={{ margin: '10px 0' }}>{product.name}</h1>
          {product.brand && (
            <p style={{ margin: '-6px 0 6px', color: 'var(--color-text-muted)' }}>Brand: {product.brand}</p>
          )}
          <p className="price" style={{ fontSize: '1.6rem' }}>
            ${Number(product.price).toFixed(2)}
          </p>
          <span className={`stock ${outOfStock ? 'stock-out' : 'stock-in'}`} style={{ fontSize: '0.95rem' }}>
            {outOfStock ? 'Currently unavailable' : `${product.stock} in stock`}
          </span>

          <p style={{ marginTop: 20, lineHeight: 1.6, color: 'var(--color-text)' }}>
            {product.description}
          </p>

          {addedMessage && <div className="toast">{addedMessage}</div>}

          {!outOfStock && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
              <button type="button" className="btn btn-primary" onClick={handleAddToCart} disabled={adding}>
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
