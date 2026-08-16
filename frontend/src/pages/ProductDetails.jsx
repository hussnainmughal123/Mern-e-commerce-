import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProduct, getProducts } from '../api/api';
import { getProductReviews, submitReview, deleteReview } from '../api/reviewApi';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { addToRecentlyViewed, getRecentlyViewed } from '../utils/recentlyViewed';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import StarRating from '../components/StarRating';
import ProductCard from '../components/ProductCard';
import RecentlyViewedCard from '../components/RecentlyViewedCard';

const FALLBACK_IMG = 'https://via.placeholder.com/500x400.png?text=No+Image';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const cart = useCart();
  const wishlist = useWishlist();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const [addedMessage, setAddedMessage] = useState('');

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const isLoggedIn = Boolean(localStorage.getItem('token'));
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  const loadProduct = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProduct(id);
      setProduct(data);
      setSelectedImage(data.imageUrl);
      setQuantity(1);

      addToRecentlyViewed(data);
      setRecentlyViewed(getRecentlyViewed(data._id));

      const related = await getProducts({ category: data.category, limit: 5 });
      setRelatedProducts(related.products.filter((p) => p._id !== data._id).slice(0, 4));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      const data = await getProductReviews(id);
      setReviews(data);
      const mine = currentUser && data.find((r) => r.user === currentUser._id);
      if (mine) {
        setMyRating(mine.rating);
        setMyComment(mine.comment);
      } else {
        setMyRating(0);
        setMyComment('');
      }
    } catch {
      // Non-critical; leave the reviews list empty on failure
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');

    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (myRating < 1) {
      setReviewError('Please select a star rating.');
      return;
    }

    setSubmittingReview(true);
    try {
      await submitReview(id, myRating, myComment.trim());
      await loadReviews();
      await loadProduct();
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    setSubmittingReview(true);
    setReviewError('');
    try {
      await deleteReview(id);
      setMyRating(0);
      setMyComment('');
      await loadReviews();
      await loadProduct();
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setSubmittingReview(false);
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
  const hasMyReview = currentUser && reviews.some((r) => r.user === currentUser._id);

  return (
    <div className="page-container">
      <Link to="/" style={{ display: 'inline-block', marginBottom: 20 }}>
        ← Back to Shop
      </Link>

      <div className="details-grid">
        <div>
          <div className="details-image">
            <img
              src={selectedImage || product.imageUrl || FALLBACK_IMG}
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

          {[product.imageUrl, ...(product.images || [])].filter(Boolean).length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {[product.imageUrl, ...(product.images || [])]
                .filter(Boolean)
                .map((url, idx) => (
                  <button
                    key={url + idx}
                    type="button"
                    onClick={() => setSelectedImage(url)}
                    style={{
                      padding: 0,
                      border:
                        selectedImage === url
                          ? '2px solid var(--color-primary)'
                          : '2px solid var(--color-border)',
                      borderRadius: 8,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      width: 60,
                      height: 60,
                      flexShrink: 0,
                    }}
                    aria-label={`View photo ${idx + 1}`}
                  >
                    <img
                      src={url}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </button>
                ))}
            </div>
          )}
        </div>

        <div className="details-info">
          <span className="category-tag">{product.category}</span>
          <h1 style={{ margin: '10px 0' }}>{product.name}</h1>
          {product.brand && (
            <p style={{ margin: '-6px 0 6px', color: 'var(--color-text-muted)' }}>Brand: {product.brand}</p>
          )}

          {product.numReviews > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <StarRating rating={product.averageRating} size={18} />
              <span style={{ color: 'var(--color-text-muted)' }}>
                {product.averageRating.toFixed(1)} ({product.numReviews} review{product.numReviews !== 1 ? 's' : ''})
              </span>
            </div>
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

      <div style={{ marginTop: 40 }}>
        <h2>Reviews {product.numReviews > 0 && `(${product.numReviews})`}</h2>

        <div className="product-form" style={{ maxWidth: 500, marginTop: 12 }}>
          <p style={{ margin: '0 0 8px', fontWeight: 600 }}>
            {hasMyReview ? 'Your review' : 'Write a review'}
          </p>
          <StarRating rating={myRating} interactive size={26} onChange={setMyRating} />
          <textarea
            rows={3}
            maxLength={500}
            placeholder="Share your thoughts about this product (optional)"
            value={myComment}
            onChange={(e) => setMyComment(e.target.value)}
            style={{ marginTop: 10 }}
          />
          {reviewError && <span className="field-error">{reviewError}</span>}
          <div className="form-actions" style={{ justifyContent: 'flex-start', gap: 10 }}>
            <button
              type="button"
              className="btn btn-primary btn-small"
              onClick={handleSubmitReview}
              disabled={submittingReview}
            >
              {submittingReview ? 'Saving...' : hasMyReview ? 'Update Review' : 'Submit Review'}
            </button>
            {hasMyReview && (
              <button
                type="button"
                className="btn btn-danger btn-small"
                onClick={handleDeleteReview}
                disabled={submittingReview}
              >
                Delete Review
              </button>
            )}
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reviewsLoading && <Loader label="Loading reviews..." />}
          {!reviewsLoading && reviews.length === 0 && (
            <p className="empty-state">No reviews yet. Be the first to review this product!</p>
          )}
          {!reviewsLoading &&
            reviews.map((review) => (
              <div
                key={review._id}
                style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 14 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                  <strong>{review.userName}</strong>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <StarRating rating={review.rating} size={15} />
                {review.comment && <p style={{ marginTop: 6 }}>{review.comment}</p>}
              </div>
            ))}
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h2>You May Also Like</h2>
          <div className="product-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}

      {recentlyViewed.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h2>Recently Viewed</h2>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
            {recentlyViewed.map((p) => (
              <RecentlyViewedCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
