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
  return (
    <div className="search-filter">
      <input
        type="text"
        placeholder="Search products by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search products"
        className="search-input"
      />
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
