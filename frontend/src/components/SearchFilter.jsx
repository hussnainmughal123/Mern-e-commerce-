import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSearchSuggestions } from '../api/api';

const FALLBACK_IMG = 'https://via.placeholder.com/40x40.png?text=%20';

const SearchFilter = ({
  search,
  setSearch,
  category,
  setCategory,
  categories,
  brand,
  setBrand,
  brands,
  minRating,
  setMinRating,
  sort,
  setSort,
}) => {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!search || search.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(() => {
      getSearchSuggestions(search.trim())
        .then((data) => {
          setSuggestions(data);
          setShowSuggestions(true);
        })
        .catch(() => setSuggestions([]));
    }, 250);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (productId) => {
    setShowSuggestions(false);
    navigate(`/products/${productId}`);
  };

  return (
    <div className="search-filter">
      <div ref={wrapperRef} style={{ position: 'relative', flex: '1 1 220px' }}>
        <input
          type="text"
          placeholder="Search products by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          aria-label="Search products"
          className="search-input"
          style={{ width: '100%' }}
        />
        {showSuggestions && suggestions.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              marginTop: 4,
              zIndex: 20,
              maxHeight: 320,
              overflowY: 'auto',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            {suggestions.map((p) => (
              <div
                key={p._id}
                onClick={() => handleSuggestionClick(p._id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 10px',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <img
                  src={p.imageUrl || FALLBACK_IMG}
                  alt={p.name}
                  style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_IMG;
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    ${Number(p.price).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        aria-label="Filter by category"
        className="category-select"
      >
        <option value="All">All Categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
      <select
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
        aria-label="Filter by brand"
        className="category-select"
      >
        <option value="All">All Brands</option>
        {brands.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>
      <select
        value={minRating}
        onChange={(e) => setMinRating(e.target.value)}
        aria-label="Filter by minimum rating"
        className="category-select"
      >
        <option value="">Any Rating</option>
        <option value="4">4★ & up</option>
        <option value="3">3★ & up</option>
        <option value="2">2★ & up</option>
        <option value="1">1★ & up</option>
      </select>
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        aria-label="Sort products"
        className="category-select"
      >
        <option value="newest">Newest First</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="name_asc">Name: A to Z</option>
        <option value="name_desc">Name: Z to A</option>
        <option value="rating_desc">Highest Rated</option>
      </select>
    </div>
  );
};

export default SearchFilter;
