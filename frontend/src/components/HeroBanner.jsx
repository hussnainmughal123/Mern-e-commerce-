import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api/api';

const FALLBACK_IMG = 'https://via.placeholder.com/200x200.png?text=ShopDash';

const HeroBanner = () => {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    getProducts({ sort: 'rating_desc', limit: 4 })
      .then((data) => setFeatured(data.products))
      .catch(() => setFeatured([]));
  }, []);

  const scrollToProducts = () => {
    document.getElementById('product-grid-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="hero-banner">
      <div className="hero-banner-badge">
        <span className="hero-banner-badge-top">UP TO</span>
        <span className="hero-banner-badge-percent">20%</span>
        <span className="hero-banner-badge-bottom">OFF</span>
      </div>

      <div className="hero-banner-inner">
        <div className="hero-banner-content">
          <span className="hero-banner-eyebrow">Welcome to ShopDash</span>
          <h1 className="hero-banner-title">Everything You Need, All in One Place</h1>
          <p className="hero-banner-subtitle">
            Discover great products at honest prices, with fast checkout and easy returns.
          </p>
          <button type="button" className="btn btn-primary hero-banner-cta" onClick={scrollToProducts}>
            Shop Now →
          </button>
        </div>

        {featured.length > 0 && (
          <div className="hero-banner-images">
            {featured.slice(0, 4).map((p, idx) => (
              <Link
                to={`/products/${p._id}`}
                key={p._id}
                className={`hero-image-card hero-image-card-${idx}`}
              >
                <img
                  src={p.imageUrl || FALLBACK_IMG}
                  alt={p.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_IMG;
                  }}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroBanner;
