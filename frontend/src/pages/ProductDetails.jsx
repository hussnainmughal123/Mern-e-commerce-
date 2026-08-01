import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct } from '../api/api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const FALLBACK_IMG = 'https://via.placeholder.com/500x400.png?text=No+Image';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProduct = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProduct(id);
      setProduct(data);
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
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
