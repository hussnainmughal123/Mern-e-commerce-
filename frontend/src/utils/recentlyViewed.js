const STORAGE_KEY = 'recentlyViewed';
const MAX_ITEMS = 8;

// Records a product as viewed, keeping the list de-duplicated,
// most-recent-first, and capped at MAX_ITEMS.
export const addToRecentlyViewed = (product) => {
  if (!product?._id) return;

  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const filtered = existing.filter((p) => p._id !== product._id);

    const entry = {
      _id: product._id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
    };

    const updated = [entry, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // If localStorage is unavailable or corrupted, silently skip tracking
  }
};

export const getRecentlyViewed = (excludeId) => {
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return excludeId ? list.filter((p) => p._id !== excludeId) : list;
  } catch {
    return [];
  }
};
