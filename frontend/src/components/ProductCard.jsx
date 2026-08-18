import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import StarRating from './StarRating';

const FALLBACK_IMG = 'https://via.placeholder.com/300x220.png?text=No+Image';

const ProductCard = ({ product }) => {
  const outOfStock = product.stock <= 0;
  const hasVariants = product.variants && product.variants.length > 0;
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const cart = useCart();
  const wishlist = useWishlist();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);

  const isLoggedIn = Boolean(localStorage.getItem('token'));
  const wishlisted = wishlist?.isWishlisted(product._id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasVariants) {
      navigate(`/products/${product._id}`);
      return;
    }

    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    setAdding(true);
    try {
      await cart.addItem(product._id, 1);
    } catch {
      // Silently ignore; a full error UI is shown on the cart page itself
    } finally {
      setAdding(false);
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    setTogglingWishlist(true);
    try {
      await wishlist.toggleItem(product._id);
    } catch {
      // Silently ignore for now
    } finally {
      setTogglingWishlist(false);
    }
  };

  return (
    <Link to={`/products/${product._id}`} className="product-card" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="product-card-img">
        <img
          src={product.imageUrl || FALLBACK_IMG}
          alt={product.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = FALLBACK_IMG;
          }}
        />
        {outOfStock && <span className="badge badge-danger">Out of stock</span>}
        {!outOfStock && hasDiscount && (
          <span className="badge discount-badge">-{discountPercent}%</span>
        )}
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
      <div className="product-card-body">
        <span className="category-tag">{product.category}</span>
        <h3 title={product.name}>{product.name}</h3>
        {product.brand && <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{product.brand}</p>}
        {product.numReviews > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '2px 0' }}>
            <StarRating rating={product.averageRating} size={14} />
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              {product.averageRating.toFixed(1)} ({product.numReviews})
            </span>
          </div>
        )}
        <p className="description">{product.description}</p>
        <div className="product-card-footer">
          <span>
            <span className="price">${Number(product.price).toFixed(2)}</span>
            {hasDiscount && (
              <span style={{ marginLeft: 6, fontSize: '0.82rem', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>
                ${Number(product.originalPrice).toFixed(2)}
              </span>
            )}
          </span>
          <span className={`stock ${outOfStock ? 'stock-out' : 'stock-in'}`}>
            {outOfStock ? 'Unavailable' : `${product.stock} in stock`}
          </span>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-small"
          style={{ marginTop: 10, width: '100%' }}
          onClick={handleAddToCart}
          disabled={outOfStock || adding}
        >
          {adding ? 'Adding...' : outOfStock ? 'Out of Stock' : hasVariants ? 'Select Options' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
