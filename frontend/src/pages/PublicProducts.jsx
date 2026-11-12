import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategories, getBrands } from '../api/api';
import ProductCard from '../components/ProductCard';
import SearchFilter from '../components/SearchFilter';
import Pagination from '../components/Pagination';
import ErrorMessage from '../components/ErrorMessage';
import ProductSkeleton from '../components/ProductSkeleton';
import CategoryIconRow from '../components/CategoryIconRow';
import './LuxuryLanding.css';

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

  useEffect(() => { setPage(1); }, [search, category, brand, minRating, sort]);

  useEffect(() => {
    const timeout = setTimeout(loadProducts, 350);
    return () => clearTimeout(timeout);
  }, [loadProducts]);

  const sortedCategories = useMemo(() => [...categories].sort(), [categories]);
  const sortedBrands = useMemo(() => [...brands].sort(), [brands]);
  const featured = products.slice(0, 3);

  const scrollToProducts = () => {
    document.getElementById('product-grid-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="luxury-storefront">
      <section className="luxury-hero">
        <div className="luxury-hero-image" aria-hidden="true" />
        <div className="luxury-hero-shade" />
        <div className="luxury-hero-copy">
          <span className="luxury-eyebrow"><i /> THE ART OF CONSIDERED LIVING</span>
          <h1>Quiet luxury.<br /><em>Lasting impressions.</em></h1>
          <p>Discover exceptional pieces, thoughtfully selected for those who appreciate the finer details.</p>
          <div className="luxury-hero-actions">
            <button className="luxury-button luxury-button-light" onClick={scrollToProducts}>Explore the collection <span>↗</span></button>
            <span className="luxury-edition">CURATED COLLECTION · 2026</span>
          </div>
        </div>
        <div className="luxury-glass-note">
          <span className="glass-note-mark">✳</span>
          <div><small>THE SIGNATURE EDIT</small><strong>Less, but exceptional.</strong></div>
          <span className="glass-note-arrow">↗</span>
        </div>
        <div className="luxury-hero-index">01 <span /> 04</div>
      </section>

      <section className="luxury-intro">
        <span className="luxury-eyebrow luxury-eyebrow-dark">A MORE PERSONAL KIND OF DISCOVERY</span>
        <h2>Not simply things.<br /><em>Pieces with presence.</em></h2>
        <p>We believe true refinement lives in the details — in considered design, enduring quality, and the feeling of finding something unmistakably yours.</p>
      </section>

      <section className="luxury-featured" id="product-grid-section">
        <div className="luxury-section-heading">
          <div><span className="luxury-eyebrow luxury-eyebrow-dark">THE COLLECTION</span><h2>Selected for you</h2></div>
          <button className="luxury-text-link" onClick={scrollToProducts}>Discover all pieces <span>↗</span></button>
        </div>
        <div className="luxury-category-wrap">
          <CategoryIconRow categories={sortedCategories} activeCategory={category} onSelect={setCategory} />
        </div>
        <SearchFilter
          search={search} setSearch={setSearch} category={category} setCategory={setCategory}
          categories={sortedCategories} brand={brand} setBrand={setBrand} brands={sortedBrands}
          minRating={minRating} setMinRating={setMinRating} sort={sort} setSort={setSort}
        />
        {loading && <ProductSkeleton count={8} />}
        {!loading && error && <ErrorMessage message={error} onRetry={loadProducts} />}
        {!loading && !error && products.length === 0 && (
          <p className="empty-state">No pieces found. Try adjusting your search or filters.</p>
        )}
        {!loading && !error && products.length > 0 && (
          <>
            <div className="luxury-product-grid">
              {products.map((product) => <ProductCard key={product._id} product={product} />)}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        )}
      </section>

      <section className="luxury-story">
        <div className="luxury-story-photo" role="img" aria-label="Sculptural, thoughtfully designed interior" />
        <div className="luxury-story-copy">
          <span className="luxury-eyebrow">OUR PHILOSOPHY</span>
          <h2>Made to be<br /><em>kept, not replaced.</em></h2>
          <p>We look beyond the moment. Every selection is an invitation to choose with intention — timeless forms, considered details, and quality that earns its place in your everyday.</p>
          <button className="luxury-button luxury-button-outline" onClick={scrollToProducts}>Find your signature piece <span>↗</span></button>
        </div>
      </section>

      <section className="luxury-values">
        <div className="luxury-values-heading"><span className="luxury-eyebrow luxury-eyebrow-dark">THE DIFFERENCE IS IN THE DETAILS</span><h2>Our promise, <em>always.</em></h2></div>
        <div className="luxury-value-grid">
          <article><span>01</span><h3>Considered curation</h3><p>Every piece earns its place through design, detail, and purpose.</p></article>
          <article><span>02</span><h3>Quality over quantity</h3><p>We favour lasting appeal over passing trends and impulse.</p></article>
          <article><span>03</span><h3>A thoughtful experience</h3><p>From discovery to delivery, every detail deserves care.</p></article>
        </div>
      </section>

      <section className="luxury-membership">
        <div className="membership-orbit membership-orbit-one" />
        <div className="membership-orbit membership-orbit-two" />
        <div className="membership-content">
          <span className="luxury-eyebrow">AN INVITATION, NOT AN OFFER</span>
          <h2>Some things are<br /><em>better experienced first.</em></h2>
          <p>Join our private circle for early access to new arrivals, considered edits, and moments reserved for members.</p>
          <Link to="/signup" className="luxury-button luxury-button-light">Enter the inner circle <span>↗</span></Link>
          <small>COMPLIMENTARY MEMBERSHIP · ALWAYS BY INVITATION</small>
        </div>
      </section>

      <footer className="luxury-footer">
        <Link to="/" className="luxury-footer-brand">SHOPDASH<span>®</span></Link>
        <span>THE ART OF CHOOSING WELL.</span>
        <a href="#product-grid-section">Back to collection ↑</a>
      </footer>
    </div>
  );
};

export default PublicProducts;
