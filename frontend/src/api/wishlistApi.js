import api from './api';

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';

export const getWishlist = async () => {
  try {
    const { data } = await api.get('/wishlist');
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const addToWishlist = async (productId) => {
  try {
    const { data } = await api.post(`/wishlist/${productId}`);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const removeFromWishlist = async (productId) => {
  try {
    const { data } = await api.delete(`/wishlist/${productId}`);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
