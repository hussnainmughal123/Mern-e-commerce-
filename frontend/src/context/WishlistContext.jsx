import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as wishlistApi from '../api/wishlistApi';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ isLoggedIn, children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const isWishlisted = (productId) => items.some((item) => item._id === productId);

  const refreshWishlist = useCallback(async () => {
    if (!isLoggedIn) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await wishlistApi.getWishlist();
      setItems(data);
    } catch {
      // Fail silently; the Wishlist page shows its own error if needed
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const addItem = async (productId) => {
    const data = await wishlistApi.addToWishlist(productId);
    setItems(data);
  };

  const removeItem = async (productId) => {
    const data = await wishlistApi.removeFromWishlist(productId);
    setItems(data);
  };

  const toggleItem = async (productId) => {
    if (isWishlisted(productId)) {
      await removeItem(productId);
    } else {
      await addItem(productId);
    }
  };

  return (
    <WishlistContext.Provider
      value={{ items, loading, isWishlisted, refreshWishlist, addItem, removeItem, toggleItem }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
