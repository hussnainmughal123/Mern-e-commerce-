const ProductSkeleton = ({ count = 8 }) => {
  return (
    <div className="product-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="product-card skeleton-card">
          <div className="skeleton-block skeleton-image" />
          <div className="product-card-body">
            <div className="skeleton-block skeleton-line" style={{ width: '40%' }} />
            <div className="skeleton-block skeleton-line" style={{ width: '80%', height: 18 }} />
            <div className="skeleton-block skeleton-line" style={{ width: '60%' }} />
            <div className="skeleton-block skeleton-line" style={{ width: '100%', height: 34, marginTop: 10 }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductSkeleton;
