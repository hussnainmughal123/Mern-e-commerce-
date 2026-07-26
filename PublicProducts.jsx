import { useCallback, useEffect, useMemo, useState } from 'react';
import { getProducts, getCategories } from '../api/api';
import ProductCard from '../components/ProductCard';
import SearchFilter from '../components/SearchFilter';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const PublicProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProducts({ search, category });
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  // Load the full category list once, independent of the current filter,
  // so the dropdown doesn't shrink as the user narrows their search.
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  // Debounce search input so we don't hit the API on every keystroke
  useEffect(() => {
    const timeout = setTimeout(() => {
      loadProducts();
    }, 350);
    return () => clearTimeout(timeout);
  }, [loadProducts]);

  const sortedCategories = useMemo(() => [...categories].sort(), [categories]);

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
      />

      {loading && <Loader label="Loading products..." />}
      {!loading && error && <ErrorMessage message={error} onRetry={loadProducts} />}
      {!loading && !error && products.length === 0 && (
        <p className="empty-state">No products match your search. Try a different keyword or filter.</p>
      )}
      {!loading && !error && products.length > 0 && (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicProducts;
