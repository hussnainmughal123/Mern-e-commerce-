import api from './api';

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';

export const getCart = async () => {
  try {
    const { data } = await api.get('/cart');
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const addToCart = async (productId, quantity = 1, selectedVariant = '') => {
  try {
    const { data } = await api.post('/cart', { productId, quantity, selectedVariant });
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const updateCartItem = async (itemId, quantity) => {
  try {
    const { data } = await api.put(`/cart/${itemId}`, { quantity });
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const removeFromCart = async (itemId) => {
  try {
    const { data } = await api.delete(`/cart/${itemId}`);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const clearCart = async () => {
  try {
    const { data } = await api.delete('/cart');
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
