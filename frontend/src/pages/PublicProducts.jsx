import { useCallback, useEffect, useMemo, useState } from 'react';
import { getProducts, getCategories, getBrands } from '../api/api';
import ProductCard from '../components/ProductCard';
import SearchFilter from '../components/SearchFilter';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

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
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
    getBrands()
      .then(setBrands)
      .catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, category, brand, minRating, sort]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadProducts();
    }, 350);
    return () => clearTimeout(timeout);
  }, [loadProducts]);

  const sortedCategories = useMemo(() => [...categories].sort(), [categories]);
  const sortedBrands = useMemo(() => [...brands].sort(), [brands]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Our Products</h1>
        <p className="page-subtitle">Browse the full catalog and find exactly what you need.</p>
      </div>

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

      {loading && <Loader label="Loading products..." />}
      {!loading && error && <ErrorMessage message={error} onRetry={loadProducts} />}
      {!loading && !error && products.length === 0 && (
        <p className="empty-state">No products match your search. Try a different keyword or filter.</p>
      )}
      {!loading && !error && products.length > 0 && (
        <>
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
};

export default PublicProducts;
