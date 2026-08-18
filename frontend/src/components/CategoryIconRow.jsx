const CATEGORY_ICONS = {
  fashion: '👕',
  clothing: '👕',
  apparel: '👕',
  electronics: '📱',
  electronic: '📱',
  beauty: '💄',
  cosmetics: '💄',
  home: '🛋️',
  furniture: '🛋️',
  decor: '🛋️',
  grocery: '🛒',
  food: '🛒',
  sports: '🏀',
  fitness: '🏀',
  toys: '🧸',
  kids: '🧸',
  books: '📚',
  jewelry: '💍',
  jewellery: '💍',
  shoes: '👟',
  footwear: '👟',
  bags: '👜',
  accessories: '👜',
  automotive: '🚗',
  garden: '🌱',
  health: '💊',
  pet: '🐾',
  pets: '🐾',
  music: '🎧',
  audio: '🎧',
  computer: '💻',
  gaming: '🎮',
};

const getIconForCategory = (category) => {
  const key = category.toLowerCase();
  for (const [keyword, icon] of Object.entries(CATEGORY_ICONS)) {
    if (key.includes(keyword)) return icon;
  }
  return '🛍️';
};

const CategoryIconRow = ({ categories, activeCategory, onSelect }) => {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="category-icon-row">
      <button
        type="button"
        className={`category-icon-pill ${activeCategory === 'All' ? 'active' : ''}`}
        onClick={() => onSelect('All')}
      >
        <span className="category-icon-emoji">✨</span>
        <span>All</span>
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          className={`category-icon-pill ${activeCategory === cat ? 'active' : ''}`}
          onClick={() => onSelect(cat)}
        >
          <span className="category-icon-emoji">{getIconForCategory(cat)}</span>
          <span>{cat}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryIconRow;
