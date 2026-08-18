const HeroBanner = () => {
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
    </div>
  );
};

export default HeroBanner;
