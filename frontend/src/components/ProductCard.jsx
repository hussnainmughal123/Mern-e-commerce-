import { Link } from 'react-router-dom';

const FALLBACK_IMG = 'https://via.placeholder.com/300x220.png?text=No+Image';

const ProductCard = ({ product }) => {
  const outOfStock = product.stock <= 0;

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
      </div>
      <div className="product-card-body">
        <span className="category-tag">{product.category}</span>
        <h3 title={product.name}>{product.name}</h3>
        <p className="description">{product.description}</p>
        <div className="product-card-footer">
          <span className="price">${Number(product.price).toFixed(2)}</span>
          <span className={`stock ${outOfStock ? 'stock-out' : 'stock-in'}`}>
            {outOfStock ? 'Unavailable' : `${product.stock} in stock`}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
