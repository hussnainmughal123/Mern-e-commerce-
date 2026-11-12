import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategories, getBrands } from '../api/api';
import ProductCard from '../components/ProductCard';
import SearchFilter from '../components/SearchFilter';
import Pagination from '../components/Pagination';
import ErrorMessage from '../components/ErrorMessage';
import ProductSkeleton from '../components/ProductSkeleton';
import CategoryIconRow from '../components/CategoryIconRow';
import './LuxuryStorefront.css';

const PublicProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [brand, setBrand] = useState('All');
  const [minRating, setMinRating] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProducts({ search, category, brand, minRating, sort, page, limit: 12 });
      setProducts(data.products);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, category, brand, minRating, sort, page]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
    getBrands().then(setBrands).catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, category, brand, minRating, sort]);

  useEffect(() => {
    const timeout = setTimeout(loadProducts, 350);
    return () => clearTimeout(timeout);
  }, [loadProducts]);

  const sortedCategories = useMemo(() => [...categories].sort(), [categories]);
  const sortedBrands = useMemo(() => [...brands].sort(), [brands]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToProducts = () => {
    document.getElementById('product-grid-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="luxury-storefront">
      <section className="lux-hero">
        <div className="lux-hero-backdrop" />
        <div className="lux-hero-grain" />
        <div className="lux-hero-content">
          <span className="lux-eyebrow"><i /> Curated for the discerning</span>
          <h1>Elevate the art<br />of <em>everyday living.</em></h1>
          <p>Discover exceptional finds, thoughtful design and timeless pieces selected to make every moment feel considered.</p>
          <div className="lux-hero-actions">
            <button type="button" className="lux-button lux-button-light" onClick={scrollToProducts}>Explore collection <span>↗</span></button>
            <span className="lux-hero-caption">A more considered way to shop</span>
          </div>
        </div>
        <div className="lux-hero-glass">
          <span className="lux-glass-kicker">The signature edit</span>
          <span className="lux-glass-title">Made to<br /><em>be kept.</em></span>
          <span className="lux-glass-line" />
          <span className="lux-glass-foot">Quality over quantity · Always</span>
        </div>
        <div className="lux-hero-bottom"><span>01 / 03</span><span>Discover your next favourite</span></div>
      </section>

      <section className="lux-intro">
        <span className="lux-eyebrow lux-eyebrow-dark"><i /> The ShopDash point of view</span>
        <h2>Not simply what you need.<br /><em>What you’ll love to own.</em></h2>
        <p>We bring together quality, character and considered design — creating a collection where every detail has a reason to be there.</p>
      </section>

      <section className="lux-collection" id="product-grid-section">
        <div className="lux-section-heading">
          <div>
            <span className="lux-eyebrow lux-eyebrow-dark"><i /> Carefully selected</span>
            <h2>The collection</h2>
            <p>Explore pieces chosen for their quality, beauty and everyday purpose.</p>
          </div>
          <span className="lux-edition-mark">SHOPDASH · EDITION 01</span>
        </div>

        <div className="lux-categories">
          <CategoryIconRow categories={sortedCategories} activeCategory={category} onSelect={setCategory} />
        </div>

        <div className="lux-filter-panel">
          <div className="lux-filter-label">Find your piece</div>
          <SearchFilter
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={setCategory}
            categories={sortedCategories}
            brand={brand}
            setBrand={setBrand}
            brands={sortedBrands}
            minRating={minRating}
            setMinRating={setMinRating}
            sort={sort}
            setSort={setSort}
          />
        </div>

        {loading && <ProductSkeleton count={12} />}
        {!loading && error && <ErrorMessage message={error} onRetry={loadProducts} />}
        {!loading && !error && products.length === 0 && (
          <p className="empty-state">No products match your search. Try a different keyword or filter.</p>
        )}
        {!loading && !error && products.length > 0 && (
          <>
            <div className="product-grid lux-product-grid">
              {products.map((product) => <ProductCard key={product._id} product={product} />)}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        )}
      </section>

      <section className="lux-story" id="lux-story">
        <div className="lux-story-image">
          <div className="lux-image-note"><span>THE DETAILS MATTER</span><b>01 — 03</b></div>
        </div>
        <div className="lux-story-copy">
          <span className="lux-eyebrow lux-eyebrow-dark"><i /> Beyond the ordinary</span>
          <h2>A little more<br /><em>meaning in everything.</em></h2>
          <p>Great design is more than appearance. It is the feeling of something made well, the confidence of a thoughtful choice and the pleasure of finding something that feels unmistakably yours.</p>
          <button type="button" className="lux-text-link" onClick={scrollToProducts}>Find something meaningful <span>↗</span></button>
        </div>
      </section>

      <section className="lux-values" id="lux-values">
        <div className="lux-values-heading">
          <span className="lux-eyebrow lux-eyebrow-dark"><i /> Our promise</span>
          <h2>Good taste. Better choices.</h2>
        </div>
        <div className="lux-values-grid">
          <article><span>01</span><h3>Considered quality</h3><p>We put quality first, highlighting products selected for their finish, function and lasting appeal.</p></article>
          <article><span>02</span><h3>Thoughtful discovery</h3><p>A curated shopping experience that makes it easier to discover pieces worth bringing home.</p></article>
          <article><span>03</span><h3>Customer first</h3><p>From browsing to checkout, every step is designed to feel clear, simple and dependable.</p></article>
        </div>
      </section>

      <section className="lux-membership">
        <div className="lux-membership-glow" />
        <div className="lux-membership-card">
          <span className="lux-eyebrow"><i /> A more personal experience</span>
          <h2>Access a world<br />of <em>good things.</em></h2>
          <p>Create your account for a more personal shopping experience, keep your wishlist close and stay connected to new arrivals.</p>
          <Link className="lux-button lux-button-glass" to="/signup">Discover membership <span>↗</span></Link>
          <span className="lux-member-foot">A considered experience, made for you.</span>
        </div>
      </section>

      <footer className="lux-footer">
        <div className="lux-footer-main">
          <div><div className="lux-footer-brand">ShopDash<span>®</span></div><p>Thoughtfully selected. Beautifully experienced.</p></div>
          <div><span className="lux-footer-label">Explore</span><button onClick={scrollToProducts}>Browse products</button><a href="#lux-story">Our story</a></div>
          <div><span className="lux-footer-label">Your account</span><Link to="/profile">My profile</Link><Link to="/orders">Order history</Link><Link to="/wishlist">Wishlist</Link></div>
          <div><span className="lux-footer-label">The ShopDash edit</span><a href="#lux-values">Our promise</a><Link to="/signup">Create an account</Link><Link to="/login">Sign in</Link></div>
        </div>
        <div className="lux-footer-bottom"><span>© {new Date().getFullYear()} ShopDash. All rights reserved.</span><span>Designed for Smarter Business.</span></div>
      </footer>
    </div>
  );
};

export default PublicProducts;
