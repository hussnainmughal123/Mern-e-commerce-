import { Link } from 'react-router-dom';

const FALLBACK_IMG = 'https://via.placeholder.com/160x140.png?text=No+Image';

const RecentlyViewedCard = ({ product }) => (
  <Link
    to={`/products/${product._id}`}
    style={{
      textDecoration: 'none',
      color: 'inherit',
      width: 150,
      flexShrink: 0,
      border: '1px solid var(--color-border)',
      borderRadius: 10,
      overflow: 'hidden',
      background: 'var(--color-surface)',
    }}
  >
    <img
      src={product.imageUrl || FALLBACK_IMG}
      alt={product.name}
      style={{ width: '100%', height: 100, objectFit: 'cover' }}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = FALLBACK_IMG;
      }}
    />
    <div style={{ padding: 8 }}>
      <p
        title={product.name}
        style={{
          margin: 0,
          fontSize: '0.82rem',
          fontWeight: 600,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {product.name}
      </p>
      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--color-primary)' }}>
        ${Number(product.price).toFixed(2)}
      </p>
    </div>
  </Link>
);

export default RecentlyViewedCard;
