import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as cartApi from '../api/cartApi';

const CartContext = createContext(null);

export const CartProvider = ({ isLoggedIn, children }) => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const refreshCart = useCallback(async () => {
    if (!isLoggedIn) {
      setCart({ items: [] });
      return;
    }
    setLoading(true);
    try {
      const data = await cartApi.getCart();
      setCart(data);
    } catch {
      // Fail silently here; individual pages show their own errors when needed
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = async (productId, quantity = 1, selectedVariant = '') => {
    const data = await cartApi.addToCart(productId, quantity, selectedVariant);
    setCart(data);
  };

  const updateItem = async (itemId, quantity) => {
    const data = await cartApi.updateCartItem(itemId, quantity);
    setCart(data);
  };

  const removeItem = async (itemId) => {
    const data = await cartApi.removeFromCart(itemId);
    setCart(data);
  };

  const clear = async () => {
    const data = await cartApi.clearCart();
    setCart(data);
  };

  return (
    <CartContext.Provider
      value={{ cart, itemCount, loading, refreshCart, addItem, updateItem, removeItem, clear }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
