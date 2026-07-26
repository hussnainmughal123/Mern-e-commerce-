const SearchFilter = ({ search, setSearch, category, setCategory, categories }) => {
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
    </div>
  );
};

export default SearchFilter;
